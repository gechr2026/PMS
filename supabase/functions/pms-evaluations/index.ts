import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
};
const JSON_HEADERS = {
  ...CORS_HEADERS,
  "Content-Type": "application/json"
};
const SELECT_DETAIL = "id, send_id, evaluator_role, evaluator_employee_id, assessment_id, status, " + "kpi_score, competency_score, total_score, grade, recommendation, overall_comment, " + "submitted_at, approved_at, created_at, updated_at, created_by, updated_by, " + "kpi_scores:pms_evaluation_kpi_scores(id, kpi_id, selected_option, is_closed, score, comment), " + "competency_scores:pms_evaluation_competency_scores(id, competency_id, selected_option, is_closed, score, comment), " + "pms_assessments!inner(name, type, year_id, cycle_id, kpi_weight, competency_weight, " + "pms_years(year), pms_cycles(cycle_label)), " + "pms_assessment_sends!inner(employee_id, cycle_id, " + "pms_employees!inner(emp_code, full_name, position_id, level_id)), " + "evaluator:pms_employees!pms_evaluations_evaluator_employee_id_fkey(emp_code, full_name)";
const SELECT_LIST = "id, send_id, evaluator_role, evaluator_employee_id, assessment_id, status, " + "kpi_score, competency_score, total_score, grade, recommendation, " + "submitted_at, approved_at, created_at, updated_at";
const VALID_ROLES = [
  "self",
  "manager",
  "executive",
  "ceo",
  "peer",
  "subordinate"
];
const VALID_STATUSES = [
  "draft",
  "sent"
];
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}
function err(message, status = 400, details) {
  return json({
    error: message,
    details: details ?? null
  }, status);
}
function mapPgError(code) {
  if (code === "23505") return 409;
  if (code === "23503") return 422;
  if (code === "42501") return 403;
  if (code === "23514") return 422;
  if (code === "22023") return 422;
  if (code === "P0002") return 404;
  return 400;
}
function isValidRole(s) {
  return typeof s === "string" && VALID_ROLES.includes(s);
}
function isValidStatus(s) {
  return typeof s === "string" && VALID_STATUSES.includes(s);
}
function validateScoreItems(arr, idKey, label) {
  if (!Array.isArray(arr)) return `${label} must be an array`;
  if (arr.length > 500) return `${label} too many items (max 500)`;
  for(let i = 0; i < arr.length; i++){
    const it = arr[i];
    if (!it || typeof it !== "object") return `${label}[${i}] must be an object`;
    const id = parseInt(it[idKey], 10);
    if (!Number.isInteger(id)) return `${label}[${i}].${idKey} is required`;
    if (it.selected_option !== undefined && it.selected_option !== null && it.selected_option !== "") {
      const n = parseInt(it.selected_option, 10);
      if (!Number.isInteger(n) || n < 0 || n > 5) {
        return `${label}[${i}].selected_option must be 0-5`;
      }
    }
  }
  return null;
}
// F6 hardening (2026-05-23): explicit upfront method allowlist.
// Unknown verbs (HEAD, TRACE, CONNECT, etc.) get rejected before any DB work.
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  if (!ALLOWED_METHODS.has(req.method)) return err("Method not allowed", 405);
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return err("Missing Authorization header", 401);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader
      }
    },
    auth: {
      persistSession: false
    }
  });
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  const last2 = segments[segments.length - 2] ?? "";
  const isBySendList = last2 === "by-send" && /^\d+$/.test(last);
  const bySendId = isBySendList ? parseInt(last, 10) : null;
  // Status workflow (simplified 2026-05-22): /submit → 'sent', /revert → 'draft' (admin-only).
  // Old /approve is removed.
  const action = (last === "submit" || last === "revert") && /^\d+$/.test(last2) ? last : null;
  const actionId = action ? parseInt(last2, 10) : null;
  const idCandidate = !action && !isBySendList && /^\d+$/.test(last) ? parseInt(last, 10) : null;
  try {
    if (action && actionId !== null) {
      if (req.method !== "POST") return err("Method not allowed", 405);
      const { data: existing, error: readErr } = await supabase.from("pms_evaluations").select("id, send_id, evaluator_role, assessment_id, status").eq("id", actionId).maybeSingle();
      if (readErr) return err(readErr.message, 400, readErr);
      if (!existing) return err("Not found", 404);
      // /revert is admin-only — return a clean 403 here in addition to the RLS lock
      if (action === "revert") {
        const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin");
        if (adminErr) return err(adminErr.message, 500, adminErr);
        if (!isAdmin) return err("Only admin can revert a sent evaluation", 403);
      }
      const newStatus = action === "submit" ? "sent" : "draft";
      const { error: rpcErr } = await supabase.rpc("pms_evaluation_upsert", {
        p_id: actionId,
        p_send_id: existing.send_id,
        p_evaluator_role: existing.evaluator_role,
        p_assessment_id: existing.assessment_id,
        p_status: newStatus,
        p_recommendation: null,
        p_overall_comment: null,
        p_kpi_scores: null,
        p_comp_scores: null
      });
      if (rpcErr) return err(rpcErr.message, mapPgError(rpcErr.code), rpcErr);
      const { data, error } = await supabase.from("pms_evaluations").select(SELECT_DETAIL).eq("id", actionId).maybeSingle();
      if (error) return err(error.message, 400, error);
      return json({
        data
      });
    }
    switch(req.method){
      case "GET":
        {
          if (isBySendList && bySendId !== null) {
            const { data, error } = await supabase.from("pms_evaluations").select(SELECT_DETAIL).eq("send_id", bySendId).order("assessment_id", {
              ascending: true
            }).order("evaluator_role", {
              ascending: true
            });
            if (error) return err(error.message, 400, error);
            return json({
              data: data ?? []
            });
          }
          if (idCandidate !== null) {
            const { data, error } = await supabase.from("pms_evaluations").select(SELECT_DETAIL).eq("id", idCandidate).maybeSingle();
            if (error) return err(error.message, 400, error);
            if (!data) return err("Not found", 404);
            return json({
              data
            });
          }
          const params = url.searchParams;
          const limit = Math.min(parseInt(params.get("limit") || "100", 10), 500);
          const offset = Math.max(parseInt(params.get("offset") || "0", 10), 0);
          let q = supabase.from("pms_evaluations").select(SELECT_LIST, {
            count: "exact"
          }).order("created_at", {
            ascending: false
          }).range(offset, offset + limit - 1);
          const sendId = params.get("send_id");
          if (sendId) {
            const n = parseInt(sendId, 10);
            if (Number.isInteger(n)) q = q.eq("send_id", n);
          }
          const assessmentId = params.get("assessment_id");
          if (assessmentId) {
            const n = parseInt(assessmentId, 10);
            if (Number.isInteger(n)) q = q.eq("assessment_id", n);
          }
          const role = params.get("evaluator_role");
          if (role && isValidRole(role)) q = q.eq("evaluator_role", role);
          const status = params.get("status");
          if (status && isValidStatus(status)) q = q.eq("status", status);
          const evaluatorEmpId = params.get("evaluator_employee_id");
          if (evaluatorEmpId) {
            const n = parseInt(evaluatorEmpId, 10);
            if (Number.isInteger(n)) q = q.eq("evaluator_employee_id", n);
          }
          const { data, count, error } = await q;
          if (error) return err(error.message, 400, error);
          return json({
            data: data ?? [],
            count,
            limit,
            offset
          });
        }
      case "POST":
      case "PUT":
      case "PATCH":
        {
          // F6 hardening (2026-05-23): separate POST (create-only) from PUT/PATCH (update-only).
          //   * POST without id  → create
          //   * POST with id     → 405 (method confusion guard)
          //   * PUT/PATCH with id    → update
          //   * PUT/PATCH without id → 400 (id required)
          const isPost = req.method === "POST";
          if (isPost && idCandidate !== null) return err("POST must not include an id in the path; use PUT/PATCH to update", 405);
          if (!isPost && idCandidate === null) return err("id is required in path", 400);
          const body = await req.json().catch(()=>({}));
          const isCreate = isPost;
          const targetId = isPost ? null : idCandidate;
          let p_send_id = null;
          let p_evaluator_role = null;
          let p_assessment_id = null;
          if (isCreate) {
            p_send_id = parseInt(body.send_id, 10);
            if (!Number.isInteger(p_send_id)) return err("'send_id' is required", 422);
            p_evaluator_role = String(body.evaluator_role ?? "");
            if (!isValidRole(p_evaluator_role)) return err("'evaluator_role' must be one of self|manager|executive|ceo|peer|subordinate", 422);
            p_assessment_id = parseInt(body.assessment_id, 10);
            if (!Number.isInteger(p_assessment_id)) return err("'assessment_id' is required", 422);
          } else {
            const { data: existing, error: readErr } = await supabase.from("pms_evaluations").select("send_id, evaluator_role, assessment_id").eq("id", targetId).maybeSingle();
            if (readErr) return err(readErr.message, 400, readErr);
            if (!existing) return err("Not found", 404);
            p_send_id = existing.send_id;
            p_evaluator_role = existing.evaluator_role;
            p_assessment_id = existing.assessment_id;
            if (body.evaluator_role !== undefined) {
              if (!isValidRole(body.evaluator_role)) return err("Invalid 'evaluator_role'", 422);
              p_evaluator_role = String(body.evaluator_role);
            }
            if (body.assessment_id !== undefined) {
              const n = parseInt(body.assessment_id, 10);
              if (!Number.isInteger(n)) return err("Invalid 'assessment_id'", 422);
              p_assessment_id = n;
            }
          }
          let p_status = null;
          if (body.status !== undefined) {
            if (!isValidStatus(body.status)) return err("Invalid 'status'", 422);
            p_status = String(body.status);
          } else if (isCreate) {
            p_status = "draft";
          }
          let p_recommendation = null;
          if (body.recommendation !== undefined && body.recommendation !== null && body.recommendation !== "") {
            const n = parseInt(body.recommendation, 10);
            if (!Number.isInteger(n)) return err("Invalid 'recommendation'", 422);
            p_recommendation = n;
          }
          if (body.kpi_scores !== undefined && body.kpi_scores !== null) {
            const v = validateScoreItems(body.kpi_scores, "kpi_id", "kpi_scores");
            if (v) return err(v, 422);
          }
          if (body.competency_scores !== undefined && body.competency_scores !== null) {
            const v = validateScoreItems(body.competency_scores, "competency_id", "competency_scores");
            if (v) return err(v, 422);
          }
          const { data: rpcId, error: rpcErr } = await supabase.rpc("pms_evaluation_upsert", {
            p_id: targetId,
            p_send_id,
            p_evaluator_role,
            p_assessment_id,
            p_status,
            p_recommendation,
            p_overall_comment: typeof body.overall_comment === "string" ? body.overall_comment : null,
            p_kpi_scores: body.kpi_scores ?? null,
            p_comp_scores: body.competency_scores ?? null
          });
          if (rpcErr) return err(rpcErr.message, mapPgError(rpcErr.code), rpcErr);
          const newId = rpcId ?? targetId;
          const { data, error } = await supabase.from("pms_evaluations").select(SELECT_DETAIL).eq("id", newId).maybeSingle();
          if (error) return err(error.message, 400, error);
          return json({
            data
          }, isCreate ? 201 : 200);
        }
      case "DELETE":
        {
          if (idCandidate === null) return err("id is required in path", 400);
          const { data, error } = await supabase.from("pms_evaluations").delete().eq("id", idCandidate).select("id, send_id, evaluator_role, assessment_id").maybeSingle();
          if (error) {
            const status = error.code === "42501" ? 403 : mapPgError(error.code);
            return err(error.message, status, error);
          }
          if (!data) return err("Not found or not allowed", 404);
          return json({
            success: true,
            data
          });
        }
      default:
        return err("Method not allowed", 405);
    }
  } catch (e) {
    return err(e.message, 500);
  }
});
