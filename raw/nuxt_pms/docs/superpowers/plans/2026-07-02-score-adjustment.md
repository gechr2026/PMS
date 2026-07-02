# Score Adjustment (แก้ไขรายงาน) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มเมนู "แก้ไขรายงาน" สำหรับ admin เพื่อปรับคะแนน KPI/Competency ด้วย revision history และ comment บังคับ โดยไม่แตะข้อมูลเดิมใน `/pms/reports`

**Architecture:** ตาราง `pms_score_adjustments` เก็บ revision ต่อ send_id, Edge Function ใหม่ merge ข้อมูลจาก view + adjustment, หน้าใหม่ `/pms/reports-edit` แยกจากหน้าเดิมอย่างสมบูรณ์

**Tech Stack:** Supabase PostgreSQL, Deno Edge Functions (supabase-js@2), Nuxt 3 / Vue 3 Composition API, Tailwind CSS

## Global Constraints

- Admin only: ทุก endpoint และ UI ต้องตรวจ role = 'admin' ก่อนเสมอ
- สเกล 0-100 ใช้เก็บใน DB (สอดคล้องกับ `avg_kpi_excl_self`); UI รับ/แสดงสเกล 1-5 (÷20 / ×20)
- `score_100_adjusted = kpi_adjusted × kpi_weight/100 + comp_adjusted × comp_weight/100` (เหมือนสูตรเดิม)
- ห้ามแก้ไข `pages/pms/reports/index.vue` หรือข้อมูลใน `pms_evaluation_results_v`
- Pattern: ทุก edge function ใช้ `createClient` พร้อม `Authorization: authHeader`, return `{ error, details }` on error

---

## File Map

| ไฟล์ | สถานะ | หน้าที่ |
|------|--------|---------|
| `supabase/migrations/<timestamp>_pms_score_adjustments.sql` | สร้างใหม่ | DB table + RLS |
| `supabase/functions/pms-score-adjustments/index.ts` | สร้างใหม่ | Edge function (GET list/history, POST create) |
| `composables/usePmsScoreAdjustments.ts` | สร้างใหม่ | TypeScript types + API client |
| `composables/usePmsAcl.ts` | แก้ไข | เพิ่ม route + computed สำหรับ /pms/reports-edit |
| `layouts/pms-layout.vue` | แก้ไข | เพิ่ม sidebar link "แก้ไขรายงาน" |
| `pages/pms/reports-edit/index.vue` | สร้างใหม่ | หน้าหลัก: filter + table + modals |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/$(date +%Y%m%d%H%M%S)_pms_score_adjustments.sql`

**Interfaces:**
- Produces: ตาราง `pms_score_adjustments` พร้อม RLS, ใช้ได้โดย Tasks 2-5

- [ ] **Step 1: สร้างไฟล์ migration**

```sql
-- supabase/migrations/<timestamp>_pms_score_adjustments.sql
CREATE TABLE IF NOT EXISTS public.pms_score_adjustments (
    id                  BIGSERIAL PRIMARY KEY,
    send_id             BIGINT NOT NULL REFERENCES pms_sends(id) ON DELETE CASCADE,
    revision            INTEGER NOT NULL,
    orig_kpi            NUMERIC(6,2),
    orig_comp           NUMERIC(6,2),
    orig_score_100      NUMERIC(6,2),
    kpi_weight          NUMERIC(5,2) NOT NULL,
    comp_weight         NUMERIC(5,2) NOT NULL,
    kpi_adjusted        NUMERIC(6,2) NOT NULL,
    comp_adjusted       NUMERIC(6,2) NOT NULL,
    score_100_adjusted  NUMERIC(6,2) NOT NULL,
    comment             TEXT NOT NULL,
    adjusted_by         UUID NOT NULL REFERENCES auth.users(id),
    adjusted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (send_id, revision)
);

ALTER TABLE public.pms_score_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select" ON public.pms_score_adjustments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "admin_insert" ON public.pms_score_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

- [ ] **Step 2: Apply migration ผ่าน Supabase MCP**

ใช้ `mcp__claude_ai_Supabase__apply_migration` กับ project_id `zfhntrmbawjyztafmqrh` และ SQL ข้างบน

- [ ] **Step 3: ตรวจสอบว่า table ถูกสร้าง**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pms_score_adjustments'
ORDER BY ordinal_position;
```

Expected: เห็น 14 คอลัมน์ตั้งแต่ `id` ถึง `adjusted_at`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add pms_score_adjustments table with RLS"
```

---

## Task 2: Edge Function `pms-score-adjustments`

**Files:**
- Create: `supabase/functions/pms-score-adjustments/index.ts`

**Interfaces:**
- Consumes: `pms_evaluation_results_v` (columns: send_id, kpi_weight, competency_weight, avg_kpi_excl_self, avg_comp_excl_self, score_100), `pms_score_adjustments` (Task 1), `profiles` (role check)
- Produces: `GET /pms-score-adjustments` → `{ data: MergedRow[], count, limit, offset }`, `GET ?history_for=N` → `{ data: AdjRow[] }`, `POST` → `{ data: AdjRow }` (HTTP 201)

- [ ] **Step 1: สร้างไฟล์ edge function**

```typescript
// supabase/functions/pms-score-adjustments/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function err(message: string, status = 400, details?: unknown): Response {
    return json({ error: message, details: details ?? null }, status);
}

const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
    if (!ALLOWED_METHODS.has(req.method)) return err("Method not allowed", 405);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Missing Authorization header", 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
    });

    // Verify admin role
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return err("Unauthorized", 401);

    const { data: profileRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (!profileRow || profileRow.role !== "admin") return err("Forbidden: admin only", 403);

    const url = new URL(req.url);
    const params = url.searchParams;

    try {
        // ─── GET ────────────────────────────────────────────────────────────────
        if (req.method === "GET") {
            const historyFor = params.get("history_for");

            if (historyFor) {
                // Return all revisions for a specific send_id (newest first)
                const sendId = parseInt(historyFor, 10);
                if (!Number.isInteger(sendId)) return err("Invalid history_for", 400);

                const { data, error } = await supabase
                    .from("pms_score_adjustments")
                    .select("*")
                    .eq("send_id", sendId)
                    .order("revision", { ascending: false });

                if (error) return err(error.message, 400, error);
                return json({ data: data ?? [] });
            }

            // List: pms_evaluation_results_v + latest adjustment per send_id
            const limit  = Math.min(parseInt(params.get("limit")  || "500", 10), 2000);
            const offset = Math.max(parseInt(params.get("offset") || "0",   10), 0);

            const reportSelect =
                "send_id, assessment_id, employee_id, send_status, " +
                "year_id, cycle_id, year, cycle_label, assessment_name, " +
                "emp_code, employee_name, " +
                "employee_position_id, position_name, " +
                "team_id, team_name, department_id, department_name, " +
                "level_id, level_name, " +
                "kpi_weight, competency_weight, " +
                "avg_kpi_excl_self, avg_comp_excl_self, score_100, " +
                "submitted_count, is_approved";

            let q = supabase
                .from("pms_evaluation_results_v")
                .select(reportSelect, { count: "exact" })
                .order("year",        { ascending: false })
                .order("cycle_label", { ascending: false })
                .order("emp_code",    { ascending: true })
                .range(offset, offset + limit - 1);

            const idFilters: [string, string][] = [
                ["year_id",       "year_id"],
                ["cycle_id",      "cycle_id"],
                ["department_id", "department_id"],
                ["team_id",       "team_id"],
            ];
            for (const [param, col] of idFilters) {
                const v = params.get(param);
                if (v) { const n = parseInt(v, 10); if (Number.isInteger(n)) q = q.eq(col, n); }
            }
            const yearVal = params.get("year");
            if (yearVal) { const n = parseInt(yearVal, 10); if (Number.isInteger(n)) q = q.eq("year", n); }
            if (params.get("cycle")) q = q.eq("cycle_label", params.get("cycle")!);
            if (params.get("dept"))  q = q.eq("department_name", params.get("dept")!);
            if (params.get("team"))  q = q.eq("team_name", params.get("team")!);

            const { data: reportRows, count, error: reportErr } = await q;
            if (reportErr) return err(reportErr.message, 400, reportErr);

            // Fetch latest adjustment per send_id
            const sendIds = (reportRows ?? []).map((r: { send_id: number }) => r.send_id);
            const latestMap = new Map<number, Record<string, unknown>>();

            if (sendIds.length > 0) {
                const { data: adjRows, error: adjErr } = await supabase
                    .from("pms_score_adjustments")
                    .select("*")
                    .in("send_id", sendIds)
                    .order("revision", { ascending: false });

                if (adjErr) return err(adjErr.message, 400, adjErr);

                for (const a of adjRows ?? []) {
                    if (!latestMap.has(a.send_id)) latestMap.set(a.send_id, a);
                }
            }

            const combined = (reportRows ?? []).map((r: Record<string, unknown>) => ({
                ...r,
                adjustment: latestMap.get(r.send_id as number) ?? null,
            }));

            return json({ data: combined, count, limit, offset });
        }

        // ─── POST ───────────────────────────────────────────────────────────────
        if (req.method === "POST") {
            const body = await req.json() as {
                send_id: number;
                kpi_adjusted: number;
                comp_adjusted: number;
                comment: string;
            };

            if (!body.send_id || body.kpi_adjusted == null || body.comp_adjusted == null || !body.comment?.trim()) {
                return err("send_id, kpi_adjusted, comp_adjusted, comment are required", 400);
            }
            if (body.kpi_adjusted < 0 || body.kpi_adjusted > 100) {
                return err("kpi_adjusted must be 0–100", 400);
            }
            if (body.comp_adjusted < 0 || body.comp_adjusted > 100) {
                return err("comp_adjusted must be 0–100", 400);
            }

            // Get weights + original values from view
            const { data: viewRow, error: viewErr } = await supabase
                .from("pms_evaluation_results_v")
                .select("avg_kpi_excl_self, avg_comp_excl_self, score_100, kpi_weight, competency_weight")
                .eq("send_id", body.send_id)
                .single();

            if (viewErr || !viewRow) return err("send_id not found", 404);

            // Calculate score_100_adjusted
            const score100Adjusted = Math.round(
                (body.kpi_adjusted * Number(viewRow.kpi_weight) / 100
                 + body.comp_adjusted * Number(viewRow.competency_weight) / 100) * 100
            ) / 100;

            // Next revision number
            const { data: maxRow } = await supabase
                .from("pms_score_adjustments")
                .select("revision")
                .eq("send_id", body.send_id)
                .order("revision", { ascending: false })
                .limit(1)
                .maybeSingle();

            const nextRevision = (maxRow?.revision ?? 0) + 1;

            // Insert
            const { data: inserted, error: insertErr } = await supabase
                .from("pms_score_adjustments")
                .insert({
                    send_id:            body.send_id,
                    revision:           nextRevision,
                    orig_kpi:           viewRow.avg_kpi_excl_self,
                    orig_comp:          viewRow.avg_comp_excl_self,
                    orig_score_100:     viewRow.score_100,
                    kpi_weight:         viewRow.kpi_weight,
                    comp_weight:        viewRow.competency_weight,
                    kpi_adjusted:       body.kpi_adjusted,
                    comp_adjusted:      body.comp_adjusted,
                    score_100_adjusted: score100Adjusted,
                    comment:            body.comment.trim(),
                    adjusted_by:        user.id,
                })
                .select()
                .single();

            if (insertErr) return err(insertErr.message, 400, insertErr);
            return json({ data: inserted }, 201);
        }

        return err("Method not allowed", 405);
    } catch (e) {
        return err((e as Error).message, 500);
    }
});
```

- [ ] **Step 2: Deploy edge function**

ใช้ `mcp__claude_ai_Supabase__deploy_edge_function` กับ:
- `project_id`: `zfhntrmbawjyztafmqrh`
- `name`: `pms-score-adjustments`
- `entrypoint_path`: `index.ts`
- `verify_jwt`: `true`
- `files`: ไฟล์ข้างบน

Expected: `status: "ACTIVE"`, version ใหม่

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/pms-score-adjustments/
git commit -m "feat: add pms-score-adjustments edge function (GET list/history, POST create)"
```

---

## Task 3: Composable `usePmsScoreAdjustments.ts`

**Files:**
- Create: `composables/usePmsScoreAdjustments.ts`

**Interfaces:**
- Consumes: `usePmsApi` (request function), edge function จาก Task 2
- Produces: `usePmsScoreAdjustments()` → `{ list, listRevisions, createRevision }`, types `PmsScoreAdjustmentListRow`, `PmsScoreAdjustmentRow`, `PmsScoreAdjustmentCreateBody`

- [ ] **Step 1: สร้างไฟล์**

```typescript
// composables/usePmsScoreAdjustments.ts
import type { ListResponse } from './usePmsApi';

/** Raw adjustment row (one revision) from pms_score_adjustments */
export interface PmsScoreAdjustmentRow {
    id: number;
    send_id: number;
    revision: number;
    orig_kpi: number | null;
    orig_comp: number | null;
    orig_score_100: number | null;
    kpi_weight: number;
    comp_weight: number;
    kpi_adjusted: number;
    comp_adjusted: number;
    score_100_adjusted: number;
    comment: string;
    adjusted_by: string;
    adjusted_at: string;
}

/** Merged row: pms_evaluation_results_v fields + nested latest adjustment (or null) */
export interface PmsScoreAdjustmentListRow {
    send_id: number;
    assessment_id: number | null;
    employee_id: number | null;
    year: number | null;
    cycle_label: string | null;
    assessment_name: string | null;
    emp_code: string | null;
    employee_name: string | null;
    position_name: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    kpi_weight: number | null;
    competency_weight: number | null;
    avg_kpi_excl_self: number | null;
    avg_comp_excl_self: number | null;
    score_100: number | null;
    submitted_count: number | null;
    is_approved: boolean | null;
    adjustment: PmsScoreAdjustmentRow | null;
}

export interface PmsScoreAdjustmentListParams {
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    limit?: number;
    offset?: number;
}

export interface PmsScoreAdjustmentCreateBody {
    send_id: number;
    kpi_adjusted: number;   // สเกล 0-100
    comp_adjusted: number;  // สเกล 0-100
    comment: string;
}

export const usePmsScoreAdjustments = () => {
    const { request } = usePmsApi();

    const list = (params: PmsScoreAdjustmentListParams = {}) =>
        request<ListResponse<PmsScoreAdjustmentListRow>>('/pms-score-adjustments', { query: params });

    const listRevisions = (send_id: number) =>
        request<{ data: PmsScoreAdjustmentRow[] }>('/pms-score-adjustments', {
            query: { history_for: send_id },
        });

    const createRevision = (body: PmsScoreAdjustmentCreateBody) =>
        request<{ data: PmsScoreAdjustmentRow }>('/pms-score-adjustments', {
            method: 'POST',
            body,
        });

    return { list, listRevisions, createRevision };
};
```

- [ ] **Step 2: Commit**

```bash
git add composables/usePmsScoreAdjustments.ts
git commit -m "feat: add usePmsScoreAdjustments composable with types"
```

---

## Task 4: ACL + Layout

**Files:**
- Modify: `composables/usePmsAcl.ts`
- Modify: `layouts/pms-layout.vue`

**Interfaces:**
- Consumes: `PmsRole` จาก `useAuth`
- Produces: `canSeeReportsEdit` computed ใน `usePmsAcl()`, sidebar link ใหม่ใน layout

- [ ] **Step 1: เพิ่ม route ACL ใน `usePmsAcl.ts`**

ใน `ROUTE_ACL` array เพิ่มบรรทัดนี้ต่อจาก `/pms/reports`:
```typescript
{ prefix: '/pms/reports-edit', roles: ['admin'] },
```

ใน return object ของ `usePmsAcl()` เพิ่ม computed:
```typescript
const canSeeReportsEdit = computed(() => canAccess('/pms/reports-edit'));
```

และ return:
```typescript
return {
    canAccess,
    canSeeSettings,
    canSeeReports,
    canSeeSummary,
    canSeeTracking,
    canSeeCompare,
    canSeeReportsEdit,   // เพิ่ม
};
```

- [ ] **Step 2: เพิ่ม sidebar link ใน `pms-layout.vue`**

หลังบรรทัด `<NuxtLink v-if="acl.canSeeReports.value" to="/pms/reports" ...>` ที่มีอยู่แล้ว ให้เพิ่ม:
```html
<NuxtLink v-if="acl.canSeeReportsEdit.value" to="/pms/reports-edit" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/reports-edit') }">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>แก้ไขรายงาน</span>
</NuxtLink>
```

หมายเหตุ: บรรทัดนี้อยู่ใน `<template v-if="acl.canSeeTracking.value || acl.canSeeSummary.value || acl.canSeeReports.value">` อยู่แล้ว แต่ต้องเพิ่ม `|| acl.canSeeReportsEdit.value` ใน condition ของ template นั้นด้วย:

```html
<template v-if="acl.canSeeTracking.value || acl.canSeeSummary.value || acl.canSeeReports.value || acl.canSeeReportsEdit.value">
```

- [ ] **Step 3: Commit**

```bash
git add composables/usePmsAcl.ts layouts/pms-layout.vue
git commit -m "feat: add /pms/reports-edit route ACL and sidebar link (admin only)"
```

---

## Task 5: Page `pages/pms/reports-edit/index.vue`

**Files:**
- Create: `pages/pms/reports-edit/index.vue`

**Interfaces:**
- Consumes:
  - `usePmsScoreAdjustments()` → `list(params)`, `listRevisions(send_id)`, `createRevision(body)` (Task 3)
  - `usePmsYears()` → `list()` → `PmsYear[]`
  - `usePmsCycles()` → `list()` → `PmsCycle[]`
  - `usePmsDepartments()` → `list()` → `PmsDepartment[]`
  - `usePmsTeams()` → `list()` → `PmsTeam[]`
  - `PmsScoreAdjustmentListRow`, `PmsScoreAdjustmentRow` (Task 3)
- Produces: หน้า `/pms/reports-edit` แสดงผ่าน layout `pms-layout`

- [ ] **Step 1: สร้างไฟล์หน้า**

```vue
<!-- pages/pms/reports-edit/index.vue -->
<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f5f3ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.8">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">แก้ไขรายงาน</h1>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterYear" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="y in yearOptions" :key="y.id" :value="y.year">{{ y.year }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterCycle" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="c in cycleOptions" :key="c.id" :value="c.cycle_label">{{ c.cycle_label }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <div class="relative">
                        <select v-model="filterDept" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none" @change="filterTeam = ''">
                            <option value="">ทั้งหมด</option>
                            <option v-for="d in deptOptions" :key="d.id" :value="d.name">{{ d.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                    <div class="relative">
                        <select v-model="filterTeam" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button type="button" class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90" style="background:#4361ee;" @click="handleSearch">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                    ค้นหา
                </button>
                <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100" @click="handleClear">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20L4 4M20 4L4 20" stroke-linecap="round"/></svg>
                    ล้าง
                </button>
            </div>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Table Card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-3 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">ปีประเมิน</th>
                            <th class="w-28 px-3 py-3 text-center font-semibold text-gray-700">รอบประเมิน</th>
                            <th class="px-3 py-3 text-left font-semibold text-gray-700">แผนก</th>
                            <th class="px-3 py-3 text-left font-semibold text-gray-700">ทีม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">รหัส</th>
                            <th class="w-36 px-3 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-600">KPI เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-600">Comp เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-600">Score เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">KPI แก้</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">Comp แก้</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">Score แก้</th>
                            <th class="w-20 px-3 py-3 text-center font-semibold text-gray-700">Rev.</th>
                            <th class="w-36 px-3 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="15" class="px-4 py-10 text-center text-sm text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td colspan="15" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in rows"
                            :key="item.send_id"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-3 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-3 py-3 text-center text-gray-700">{{ item.year ?? '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-700">{{ item.cycle_label || '—' }}</td>
                            <td class="px-3 py-3 text-gray-700">{{ item.department_name || '—' }}</td>
                            <td class="px-3 py-3 text-gray-700">{{ item.team_name || '—' }}</td>
                            <td class="px-3 py-3 text-center font-medium text-gray-800">{{ item.emp_code || '—' }}</td>
                            <td class="px-3 py-3 font-medium text-gray-800">{{ item.employee_name || '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-600">{{ item.avg_kpi_excl_self != null ? (item.avg_kpi_excl_self / 20).toFixed(2) : '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-600">{{ item.avg_comp_excl_self != null ? (item.avg_comp_excl_self / 20).toFixed(2) : '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-600">{{ item.score_100 != null ? Number(item.score_100).toFixed(2) : '—' }}</td>
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#9ca3af;'">
                                {{ item.adjustment ? (item.adjustment.kpi_adjusted / 20).toFixed(2) : '—' }}
                            </td>
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#9ca3af;'">
                                {{ item.adjustment ? (item.adjustment.comp_adjusted / 20).toFixed(2) : '—' }}
                            </td>
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#9ca3af;'">
                                {{ item.adjustment ? Number(item.adjustment.score_100_adjusted).toFixed(2) : '—' }}
                            </td>
                            <td class="px-3 py-3 text-center">
                                <span v-if="item.adjustment" class="inline-block rounded-full px-2 py-0.5 text-xs font-bold" style="background:#f5f3ff;color:#7c3aed;">#{{ item.adjustment.revision }}</span>
                                <span v-else class="text-gray-400">—</span>
                            </td>
                            <td class="px-3 py-3 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        class="rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-80"
                                        style="background:#4361ee;"
                                        @click="openEditModal(item)"
                                    >แก้ไข</button>
                                    <button
                                        v-if="item.adjustment"
                                        type="button"
                                        class="rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:bg-purple-50"
                                        style="border-color:#7c3aed;color:#7c3aed;"
                                        @click="openHistoryModal(item)"
                                    >ประวัติ</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ─── Edit Modal ──────────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="editModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeEditModal">
                <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">
                    <!-- Header -->
                    <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div>
                            <h2 class="text-base font-bold text-gray-800">แก้ไขคะแนน</h2>
                            <p class="text-xs text-gray-500 mt-0.5">{{ editModal.row?.employee_name }} ({{ editModal.row?.emp_code }}) — Revision ถัดไป: <span class="font-semibold text-purple-700">#{{ nextRevision }}</span></p>
                        </div>
                        <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                        </button>
                    </div>

                    <div class="px-6 py-5 space-y-5">
                        <!-- ค่าเดิม -->
                        <div class="rounded-xl bg-gray-50 p-4">
                            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">ค่าเดิม (คำนวณอัตโนมัติ)</p>
                            <div class="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p class="text-xs text-gray-500">KPI</p>
                                    <p class="text-lg font-bold text-gray-800">{{ editModal.row?.avg_kpi_excl_self != null ? (editModal.row.avg_kpi_excl_self / 20).toFixed(2) : '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Comp.</p>
                                    <p class="text-lg font-bold text-gray-800">{{ editModal.row?.avg_comp_excl_self != null ? (editModal.row.avg_comp_excl_self / 20).toFixed(2) : '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Score 100</p>
                                    <p class="text-lg font-bold text-gray-800">{{ editModal.row?.score_100 != null ? Number(editModal.row.score_100).toFixed(2) : '—' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- ค่าใหม่ -->
                        <div>
                            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">ค่าใหม่ (สเกล 1–5)</p>
                            <div class="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">คะแนน KPI</label>
                                    <div class="flex items-center gap-1">
                                        <input
                                            v-model.number="editForm.kpiInput"
                                            type="number" min="0" max="5" step="0.01"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <span class="text-sm text-gray-400 whitespace-nowrap">/ 5</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">คะแนน Comp.</label>
                                    <div class="flex items-center gap-1">
                                        <input
                                            v-model.number="editForm.compInput"
                                            type="number" min="0" max="5" step="0.01"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <span class="text-sm text-gray-400 whitespace-nowrap">/ 5</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Score 100 preview -->
                            <div class="rounded-lg p-3 text-center" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);">
                                <p class="text-xs text-white opacity-80">คะแนนรวม 100 คะแนน (Preview)</p>
                                <p class="text-2xl font-bold text-white mt-0.5">{{ score100Preview.toFixed(2) }}</p>
                            </div>
                        </div>

                        <!-- Comment -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-gray-700">เหตุผล / หมายเหตุ <span class="text-red-500">*</span></label>
                            <textarea
                                v-model="editForm.comment"
                                rows="3"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none resize-none"
                                placeholder="ระบุเหตุผลในการแก้ไข..."
                            ></textarea>
                        </div>

                        <!-- Error -->
                        <p v-if="editModal.error" class="text-xs text-red-600">{{ editModal.error }}</p>
                    </div>

                    <!-- Footer -->
                    <div class="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                        <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="closeEditModal">ยกเลิก</button>
                        <button
                            type="button"
                            class="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style="background:#7c3aed;"
                            :disabled="editModal.saving || !editForm.comment.trim() || editForm.kpiInput == null || editForm.compInput == null"
                            @click="handleSaveEdit"
                        >
                            <span v-if="editModal.saving">กำลังบันทึก...</span>
                            <span v-else>บันทึก</span>
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ─── History Modal ───────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="historyModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="historyModal.show = false">
                <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                    <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h2 class="text-base font-bold text-gray-800">ประวัติการแก้ไข — {{ historyModal.employeeName }}</h2>
                        <button class="text-gray-400 hover:text-gray-600" @click="historyModal.show = false">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                        </button>
                    </div>
                    <div class="max-h-96 overflow-y-auto px-6 py-4 space-y-4">
                        <div v-if="historyModal.loading" class="text-center text-sm text-gray-400 py-6">กำลังโหลด...</div>
                        <div v-else-if="historyModal.revisions.length === 0" class="text-center text-sm text-gray-400 py-6">ไม่พบประวัติ</div>
                        <div
                            v-else
                            v-for="(rev, idx) in historyModal.revisions"
                            :key="rev.id"
                            class="rounded-xl border border-gray-100 p-4"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style="background:#f5f3ff;color:#7c3aed;">#{{ rev.revision }}</span>
                                <span class="text-xs text-gray-400">{{ formatDate(rev.adjusted_at) }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">KPI</p>
                                    <p class="font-semibold text-gray-700">{{ prevKpi(idx).toFixed(2) }} → {{ (rev.kpi_adjusted / 20).toFixed(2) }}</p>
                                </div>
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">Comp.</p>
                                    <p class="font-semibold text-gray-700">{{ prevComp(idx).toFixed(2) }} → {{ (rev.comp_adjusted / 20).toFixed(2) }}</p>
                                </div>
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">Score 100</p>
                                    <p class="font-semibold text-purple-700">{{ prevScore(idx).toFixed(2) }} → {{ Number(rev.score_100_adjusted).toFixed(2) }}</p>
                                </div>
                            </div>
                            <p class="text-xs text-gray-600 italic">"{{ rev.comment }}"</p>
                        </div>
                    </div>
                    <div class="border-t border-gray-100 px-6 py-3 flex justify-end">
                        <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="historyModal.show = false">ปิด</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsScoreAdjustmentListRow, PmsScoreAdjustmentRow } from '@/composables/usePmsScoreAdjustments';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';

useHead({ title: 'แก้ไขรายงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const adjustApi  = usePmsScoreAdjustments();
const yearsApi   = usePmsYears();
const cyclesApi  = usePmsCycles();
const deptsApi   = usePmsDepartments();
const teamsApi   = usePmsTeams();

// ─── Data ─────────────────────────────────────────────────────────────────────
const rows         = ref<PmsScoreAdjustmentListRow[]>([]);
const yearOptions  = ref<PmsYear[]>([]);
const cycleOptions = ref<PmsCycle[]>([]);
const deptOptions  = ref<PmsDepartment[]>([]);
const teamOptions  = ref<PmsTeam[]>([]);
const loading      = ref(false);
const errorMessage = ref('');

// ─── Filters ──────────────────────────────────────────────────────────────────
const filterYear  = ref<number | ''>('');
const filterCycle = ref('');
const filterDept  = ref('');
const filterTeam  = ref('');

const filteredTeamOptions = computed(() => {
    if (!filterDept.value) return teamOptions.value;
    return teamOptions.value.filter(t => t.department_name === filterDept.value);
});

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const editModal = ref<{
    show: boolean;
    row: PmsScoreAdjustmentListRow | null;
    saving: boolean;
    error: string;
}>({ show: false, row: null, saving: false, error: '' });

const editForm = ref({ kpiInput: null as number | null, compInput: null as number | null, comment: '' });

const nextRevision = computed(() =>
    editModal.value.row?.adjustment ? editModal.value.row.adjustment.revision + 1 : 1
);

const score100Preview = computed(() => {
    if (!editModal.value.row) return 0;
    const kpi  = editForm.value.kpiInput  ?? 0;
    const comp = editForm.value.compInput ?? 0;
    const kw   = Number(editModal.value.row.kpi_weight)          ?? 50;
    const cw   = Number(editModal.value.row.competency_weight)   ?? 50;
    return Math.round((kpi * 20 * kw / 100 + comp * 20 * cw / 100) * 100) / 100;
});

const openEditModal = (row: PmsScoreAdjustmentListRow) => {
    editModal.value = { show: true, row, saving: false, error: '' };
    const adj = row.adjustment;
    editForm.value = {
        kpiInput:  adj ? +(adj.kpi_adjusted / 20).toFixed(2) : null,
        compInput: adj ? +(adj.comp_adjusted / 20).toFixed(2) : null,
        comment:   '',
    };
};

const closeEditModal = () => {
    editModal.value.show = false;
};

const handleSaveEdit = async () => {
    if (!editModal.value.row) return;
    if (!editForm.value.comment.trim()) { editModal.value.error = 'กรุณาระบุเหตุผล'; return; }
    if (editForm.value.kpiInput == null || editForm.value.compInput == null) {
        editModal.value.error = 'กรุณาระบุคะแนน KPI และ Comp.'; return;
    }

    editModal.value.saving = true;
    editModal.value.error = '';
    try {
        await adjustApi.createRevision({
            send_id:       editModal.value.row.send_id,
            kpi_adjusted:  +(editForm.value.kpiInput * 20).toFixed(2),
            comp_adjusted: +(editForm.value.compInput * 20).toFixed(2),
            comment:       editForm.value.comment.trim(),
        });
        closeEditModal();
        await fetchList();
    } catch (e) {
        editModal.value.error = e instanceof PmsApiError ? e.message : 'เกิดข้อผิดพลาด';
    } finally {
        editModal.value.saving = false;
    }
};

// ─── History Modal ────────────────────────────────────────────────────────────
const historyModal = ref<{
    show: boolean;
    loading: boolean;
    revisions: PmsScoreAdjustmentRow[];
    employeeName: string;
}>({ show: false, loading: false, revisions: [], employeeName: '' });

const openHistoryModal = async (row: PmsScoreAdjustmentListRow) => {
    historyModal.value = { show: true, loading: true, revisions: [], employeeName: row.employee_name ?? '' };
    try {
        const res = await adjustApi.listRevisions(row.send_id);
        historyModal.value.revisions = res.data;
    } finally {
        historyModal.value.loading = false;
    }
};

// revisions ถูก sort ใน edge function จาก newest (idx=0) → oldest (idx=last)
// prevKpi(0) = rev[1].kpi_adjusted/20  (revision ก่อนหน้า)
// prevKpi(last) = orig_kpi/20          (ค่าก่อน revision แรก)
const prevKpi = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return (revs[idx].orig_kpi ?? 0) / 20;
    return revs[idx + 1].kpi_adjusted / 20;
};
const prevComp = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return (revs[idx].orig_comp ?? 0) / 20;
    return revs[idx + 1].comp_adjusted / 20;
};
const prevScore = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return revs[idx].orig_score_100 ?? 0;
    return revs[idx + 1].score_100_adjusted;
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const fetchMasters = async () => {
    try {
        const [y, c, d, t] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
        deptOptions.value  = d.data;
        teamOptions.value  = t.data;
    } catch (e) {
        console.warn('[reports-edit] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await adjustApi.list({
            year:  filterYear.value  === '' ? undefined : Number(filterYear.value),
            cycle: filterCycle.value || undefined,
            dept:  filterDept.value  || undefined,
            team:  filterTeam.value  || undefined,
            limit: 1000,
        });
        rows.value = res.data;
    } catch (e) {
        errorMessage.value = e instanceof PmsApiError ? e.message : 'โหลดข้อมูลไม่สำเร็จ';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    filterYear.value = '';
    filterCycle.value = '';
    filterDept.value = '';
    filterTeam.value = '';
    rows.value = [];
};

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(fetchMasters);
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/pms/reports-edit/
git commit -m "feat: add /pms/reports-edit page with edit and history modals"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** DB table ✓ | Edge function (GET list/history, POST) ✓ | Composable ✓ | ACL ✓ | Sidebar ✓ | Page ✓ | Edit modal ✓ | History modal ✓
- [x] **No TBD/TODO placeholders** — ทุก step มี code จริง
- [x] **Type consistency:** `PmsScoreAdjustmentRow` ใช้ชื่อเดียวกันใน Task 3 และ Task 5; `PmsScoreAdjustmentListRow` เช่นกัน; `createRevision` ใช้ `PmsScoreAdjustmentCreateBody` ตรงกัน
- [x] **Scale:** UI รับ 1-5, ×20 ก่อน POST, ÷20 ก่อนแสดง — consistent ทั้ง table และ modal
- [x] **Admin-only:** Edge function ตรวจ role ผ่าน `profiles` table; ACL ปิด route; sidebar ใช้ `canSeeReportsEdit`
- [x] **ไม่แตะ /pms/reports หรือ pms_evaluation_results_v** — ไม่มีการ modify ใน plan นี้
