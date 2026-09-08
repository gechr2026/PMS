# Building and running the admin app

The PMS ships as two builds from this one source tree.

| Build | Where it runs | Contains |
|---|---|---|
| `staff` | deployed to the internet | everything except the admin pages |
| `admin` | a local machine, never deployed | the full app |

`PMS_VARIANT` picks the build. **The default is `staff`** — forgetting the
variable produces the safe build, never the one carrying the admin pages.

## Running the admin app locally

From `raw/nuxt_pms/`:

```bash
pnpm install
PMS_VARIANT=admin pnpm dev
```

Then open <http://localhost:3000> and sign in with an admin email and password.

Nothing else is needed. The app is a client-side SPA that talks to hosted
Supabase using the publishable key, so it holds no server secret and works the
same from `localhost` as from a public host. Every edge function already sends
`Access-Control-Allow-Origin: *`.

### As a static folder instead

If the admin would rather not run a dev server:

```bash
PMS_VARIANT=admin pnpm generate
npx serve .output/public
```

`.output/public` can be copied to another machine and served the same way.

## Why the admin app is not deployed

Non-admin employees should not be able to discover that an admin tier exists.
Keeping the admin build off the internet means there is no hostname to find —
not a hard-to-guess one, none at all.

The tradeoff is operational: **if the only machine holding the admin build is
lost, nobody can administer the system until someone rebuilds it.** That is why
these instructions exist. Anyone with this repository and Node installed can
reproduce the admin app with the single command above.

The build itself is not a secret. It contains no credential that the staff build
does not already publish, so a lost laptop leaks nothing extra. The protection
comes from RLS on the database, which is unchanged and applies to every request
regardless of which build made it.

## Deploying the staff app

```bash
PMS_VARIANT=staff pnpm build   # or simply `pnpm build`
```

Confirm before shipping that no admin route survived:

```bash
grep -r "pms/settings\|reports-edit" .output/public/   # expect no matches
```

## What each build differs by

Only the compile step differs — there is one copy of every source file.

- `pages:extend` in `nuxt.config.ts` removes `/pms/settings/**` and
  `/pms/reports-edit` from the route table for the staff build, so Nuxt never
  emits those chunks.
- `__PMS_ADMIN__`, a Vite `define`, folds to `false` in the staff build. That
  drops the dynamic import of `admin/AdminSidebarNav.vue` (the admin sidebar
  entries), the admin rows in `composables/usePmsAcl.ts`, and the password field
  on the login page.

See `docs/superpowers/specs/2026-09-08-admin-build-separation-design.md` for
why it is built this way.
