// =============================================================
// pms-score-adjustments — admin score override with revision history
// =============================================================
// Routes:
//   GET  /pms-score-adjustments?year_id=&cycle_id=&department_id=&team_id=&year=&cycle=&dept=&team=&limit=&offset=
//        → { data: MergedRow[], count, limit, offset }
//   GET  /pms-score-adjustments?history_for=<send_id>
//        → { data: AdjRow[] }   (all revisions newest first)
//   POST /pms-score-adjustments  body: { send_id, kpi_adjusted, comp_adjusted, comment }
//        → { data: AdjRow }  HTTP 201
//
// Auth: JWT required. Role must be 'admin' (checked via profiles table).
// =============================================================

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
                // All revisions for a specific send_id (newest first)
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

            // List: pms_evaluation_results_v rows + latest adjustment per send_id
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

            // ID filters
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

            // Merge report rows with their latest adjustment
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

            // Insert new revision
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
