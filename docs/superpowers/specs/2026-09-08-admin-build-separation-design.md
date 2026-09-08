# Admin Build Separation — Design

**Date:** 2026-09-08
**Status:** approved, implementing

## Problem

Non-admin employees can discover that an admin tier exists, and can enumerate
exactly who the admins are.

Three separate disclosures, all confirmed against the running system:

1. **The route table ships to everyone.** `/pms/settings/**` (22 pages) and
   `/pms/reports-edit` are registered in the single client bundle that every
   employee downloads. Opening devtools reveals the full list. Navigating to
   one renders the page shell — empty tables, but with column headers, field
   names and Import buttons visible.

2. **`auth-login/start` is a role oracle.** The endpoint needs no
   authentication. Posting `{email}` alone returns:

   | email | response |
   |---|---|
   | not in system | `200 {method:"unknown"}` |
   | officer/manager/executive/supervisor | `200 {method:"otp"}` |
   | **admin** | **`422 "ผู้ดูแลระบบต้องใช้รหัสผ่าน"`** |

   Anyone can walk a list of colleagues' addresses and read off the admins.

3. **The login page says so in words.** The password field is labelled
   `(เฉพาะ admin — ผู้ใช้อื่นเว้นว่าง)`.

## What is NOT the problem

The security boundary itself is sound and is not being changed.

- Every settings table has RLS enabled with four policies (select/insert/
  update/delete), each checking for the `admin` role.
- The settings edge functions (`pms-positions`, `pms-teams`,
  `pms-departments`, `pms-levels`, …) construct their Supabase client with
  `SUPABASE_ANON_KEY` and forward the caller's JWT, so RLS applies to them.
  None of them use the service-role key.

A non-admin who bypasses the client-side guard today already gets nothing back.
This work removes *visibility*, not a hole. `usePmsAcl` was never a security
boundary — its own header comment says so — and it stays as it is.

## Approach

Three changes, deliberately independent of each other.

### 1. Two builds from one source

`PMS_VARIANT` selects the build at compile time:

```bash
PMS_VARIANT=staff pnpm build    # deployed to the internet
PMS_VARIANT=admin pnpm build    # run locally, never deployed
```

A `pages:extend` hook strips `/pms/settings/**` and `/pms/reports-edit` from
the route table when the variant is not `admin`. Nuxt generates route imports
from that table, so the page chunks are never emitted.

**The default is `staff`.** Forgetting the variable yields the safe build, not
the leaky one; producing the admin build takes a deliberate act.

Stripping routes is not enough on its own: the sidebar markup and the ACL table
both hold admin URLs as plain strings, and those strings would survive in the
staff bundle. So:

- The admin sidebar entries move into `admin/AdminSidebarNav.vue`, outside every
  Nuxt auto-scan directory. The layout reaches it only through a dynamic import
  inside a `__PMS_ADMIN__` ternary, which folds to `null` and lets the bundler
  drop the chunk.
- `usePmsAcl`'s admin rows sit behind the same compile-time constant.

`__PMS_ADMIN__` is a Vite `define`. It must be read into a `<script setup>`
binding before a template can use it — a bare `__PMS_ADMIN__` in a template
compiles to `_ctx.__PMS_ADMIN__`, a member expression that `define` does not
substitute.

### 2. The admin build runs locally

Nothing in the Nuxt app holds a server secret; it is a client SPA that talks to
hosted Supabase with the publishable key. So the admin build runs anywhere, and
the choice is operational rather than technical:

```bash
PMS_VARIANT=admin pnpm dev        # localhost:3000
PMS_VARIANT=admin pnpm generate   # static output, serve locally
```

Every edge function already sends `Access-Control-Allow-Origin: *`, so a
`localhost` origin works with no change.

The admin URL then does not exist on the internet at all — there is no hostname
to guess. The cost is operational: each admin machine needs the build, updates
must be copied to each machine, and if the only machine holding it dies, nobody
can administer the system. That last risk is why the build instructions are
part of this work rather than tribal knowledge.

### 3. `auth-login/start` stops distinguishing roles

| request | response after this change |
|---|---|
| `{email}`, address unknown | `200 {method:"otp"}`, neutral message |
| `{email}`, staff address | `200 {method:"otp"}`, neutral message, OTP sent |
| `{email}`, admin address | `200 {method:"otp"}`, neutral message, no OTP sent |
| `{email,password}`, wrong password or not an admin | `401 "อีเมลหรือรหัสผ่านไม่ถูกต้อง"` |

Every address looks identical from outside. No status code and no message
separates one role from another.

**Accepted limitation:** a timing side-channel remains. The staff path waits on
an outbound email; the admin path returns immediately. Measuring response times
repeatedly can still distinguish them. This is left in place — the bar moves
from "read a status code" to "run a timing study", which is proportionate to an
insider threat. Closing it would mean returning the response before dispatching
the mail, and can be done later if wanted.

The login page changes to match: the staff build has no password field at all,
and the admin build submits email and password together.

## Files

| File | Change |
|---|---|
| `raw/nuxt_pms/nuxt.config.ts` | `PMS_VARIANT`, `pages:extend` hook, `vite.define` |
| `raw/nuxt_pms/admin/AdminSidebarNav.vue` | new — admin sidebar entries |
| `raw/nuxt_pms/layouts/pms-layout.vue` | admin entries replaced by two guarded mount points |
| `raw/nuxt_pms/composables/usePmsAcl.ts` | admin rows behind `__PMS_ADMIN__` |
| `raw/nuxt_pms/pages/auth/login.vue` | password field only in the admin build; role hint removed |
| `raw/nuxt_pms/types/build-flags.d.ts` | new — declares `__PMS_ADMIN__` for vue-tsc |
| `supabase/functions/auth-login/index.ts` | uniform responses; redeploy |
| `docs/admin-build.md` | new — how to build and run the admin app |

`composables/useAuth.ts` needs no behavioural change: `signIn(email, password?)`
already posts both fields in one request and installs the session when the
server answers `method: "password"`.

RLS policies and the settings edge functions are not touched.

## Verification

The project has no test runner. Verification is by build inspection, type
check, and direct HTTP probes.

```bash
PMS_VARIANT=staff pnpm build
grep -r "pms/settings\|reports-edit" .output/public/   # expect no matches

PMS_VARIANT=admin pnpm build
grep -r "pms/settings" .output/public/ | head          # expect matches

npx vue-tsc --noEmit                                   # clean
```

The decisive assertion is on the endpoint. Probe `auth-login/start` with three
addresses — a known admin, a known staff member, and one not in the system —
and require that **status code and response body are byte-identical across all
three**.

Then confirm the flows still work: admin signs in on the admin build with email
and password; a staff member signs in on the staff build and receives an OTP.
