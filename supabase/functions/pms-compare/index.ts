// =============================================================
// pms-compare — employee historical comparison
// =============================================================
// Routes:
//   GET /pms-compare/employees                          Returns only the current user's own employee record
//   GET /pms-compare/:employee_id?year=&limit=&offset=  Comparison rows for the current user only
//
// Auth: requires Authorization Bearer <jwt>.
//   - Both routes resolve the caller's employee via profiles → pms_employees (username bridge)
//   - Requesting another employee's data returns 403
// =============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function err(message: string, status = 400, details?: unknown): Response {
    return json({ error: message, details: details ?? null }, status);
}

async function resolveCurrentEmployee(
    supabase: ReturnType<typeof createClient>,
): Promise<{ id: number } | Response> {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return err("Unauthorized", 401);

    const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
    if (profErr) return err(profErr.message, 400, profErr);
    if (!prof?.username) return err("Forbidden: no employee record linked to this account", 403);

    const { data: emp, error: empErr } = await supabase
        .from("pms_employees")
        .select("id")
        .eq("username", prof.username)
        .maybeSingle();
    if (empErr) return err(empErr.message, 400, empErr);
    if (!emp) return err("Forbidden: no employee record linked to this account", 403);

    return { id: emp.id as number };
}

// F6 hardening (2026-05-23): explicit HTTP method allowlist (defense-in-depth).
const ALLOWED_METHODS = new Set(["GET", "OPTIONS"]);

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
    if (!ALLOWED_METHODS.has(req.method)) return err("Method not allowed", 405);
    if (req.method !== "GET") return err("Method not allowed", 405);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Missing Authorization header", 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
    });

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const last  = segments[segments.length - 1] ?? "";

    try {
        // ---------- /employees — returns only the current user's own record ----------
        if (last === "employees") {
            const self = await resolveCurrentEmployee(supabase);
            if (self instanceof Response) return self;

            const select =
                "id, emp_code, full_name, username, is_active, position_id, level_id, " +
                "pms_positions(name, team_id, pms_teams(name, department_id, pms_departments(name))), " +
                "pms_levels(name)";

            const { data, count, error } = await supabase
                .from("pms_employees")
                .select(select, { count: "exact" })
                .eq("id", self.id)
                .limit(1);

            if (error) return err(error.message, 400, error);

            type EmpRow = {
                id: number;
                emp_code: string | null;
                full_name: string | null;
                username: string | null;
                is_active: boolean;
                position_id: number | null;
                level_id: number | null;
                pms_positions?: {
                    name?: string;
                    team_id?: number;
                    pms_teams?: { name?: string; department_id?: number; pms_departments?: { name?: string } };
                };
                pms_levels?: { name?: string };
            };

            const flat = (data ?? []).map((r: EmpRow) => ({
                id: r.id,
                emp_code: r.emp_code,
                full_name: r.full_name,
                username: r.username,
                is_active: r.is_active,
                position_id: r.position_id,
                position_name: r.pms_positions?.name ?? null,
                team_id: r.pms_positions?.team_id ?? null,
                team_name: r.pms_positions?.pms_teams?.name ?? null,
                department_id: r.pms_positions?.pms_teams?.department_id ?? null,
                department_name: r.pms_positions?.pms_teams?.pms_departments?.name ?? null,
                level_id: r.level_id,
                level_name: r.pms_levels?.name ?? null,
                /** Convenient label for autocomplete dropdowns */
                label: r.emp_code && r.full_name ? `${r.emp_code} — ${r.full_name}` : (r.emp_code ?? r.full_name ?? `#${r.id}`),
            }));
            return json({ data: flat, count, limit: 1 });
        }

        // ---------- /:employee_id — comparison rows (self only) ----------
        if (/^\d+$/.test(last)) {
            const employeeId = parseInt(last, 10);

            const self = await resolveCurrentEmployee(supabase);
            if (self instanceof Response) return self;
            if (employeeId !== self.id) return err("Forbidden: you may only view your own evaluation history", 403);

            const params = url.searchParams;
            const year   = params.get("year");
            const limit  = Math.min(parseInt(params.get("limit")  || "100", 10), 500);
            const offset = Math.max(parseInt(params.get("offset") || "0", 10), 0);

            // 1) Resolve employee meta (so caller can render header)
            const { data: emp, error: empErr } = await supabase
                .from("pms_employees")
                .select("id, emp_code, full_name, username, is_active, level_id, pms_levels(name)")
                .eq("id", employeeId)
                .maybeSingle();
            if (empErr) return err(empErr.message, 400, empErr);
            if (!emp)  return err("Employee not found", 404);

            // 2) Pull comparison rows from the aggregated view
            let q = supabase
                .from("pms_evaluation_results_v")
                .select(
                    "send_id, year_id, cycle_id, year, cycle_label, " +
                    "avg_kpi_score, avg_competency_score, avg_total_score, " +
                    "final_total_score, final_grade, final_recommendation, " +
                    "submitted_count, is_approved, " +
                    "assessment_id, assessment_name",
                    { count: "exact" }
                )
                .eq("employee_id", employeeId)
                .order("year", { ascending: false })
                .order("cycle_label", { ascending: false })
                .range(offset, offset + limit - 1);

            if (year) {
                const n = parseInt(year, 10);
                if (Number.isInteger(n)) q = q.eq("year", n);
            }

            const { data: rows, count, error: rowsErr } = await q;
            if (rowsErr) return err(rowsErr.message, 400, rowsErr);

            // 3) Decorate each row with `promoted` (recommendation === 1 = เลื่อนตำแหน่ง)
            type Row = {
                send_id: number;
                year: number | null;
                cycle_label: string | null;
                avg_kpi_score: number | null;
                avg_competency_score: number | null;
                avg_total_score: number | null;
                final_total_score: number | null;
                final_grade: string | null;
                final_recommendation: number | null;
                submitted_count: number | null;
                is_approved: boolean | null;
                assessment_id: number;
                assessment_name: string | null;
            };
            const decorated = (rows as Row[] | null ?? []).map((r) => ({
                ...r,
                /** เลื่อนตำแหน่ง — derived from final_recommendation */
                promoted: r.final_recommendation === 1,
            }));

            type EmpMeta = {
                id: number;
                emp_code: string | null;
                full_name: string | null;
                username: string | null;
                is_active: boolean;
                level_id: number | null;
                pms_levels?: { name?: string };
            };
            const empMeta = emp as EmpMeta;

            return json({
                employee: {
                    id: empMeta.id,
                    emp_code: empMeta.emp_code,
                    full_name: empMeta.full_name,
                    username: empMeta.username,
                    is_active: empMeta.is_active,
                    level_id: empMeta.level_id,
                    level_name: empMeta.pms_levels?.name ?? null,
                },
                data: decorated,
                count, limit, offset,
            });
        }

        return err("Bad path. Use /employees or /:employee_id", 400);
    } catch (e) {
        return err((e as Error).message, 500);
    }
});
