// =============================================================
// pms-employees CRUD Edge Function — v11
// =============================================================
// v11: Added supervisor_id (nullable self-ref FK) — read returns
//      supervisor_name + supervisor_emp_code via join; PATCH accepts
//      supervisor_id with self-reference guard.
//
// v10: PUT/PATCH now syncs auth.users.email + profiles.email/username
//      when 'username' changes, so login continues to work after
//      an email edit.
//
// v9: bulk POST now performs pre-flight uniqueness check.
//     Per-row errors (in-file + vs. DB) returned as 422 with
//     details: { code: 'bulk_validation', rows: [{ index, field, value, error }] }.
//
// Routes:
//   GET    /pms-employees                 list (filters below)
//   GET    /pms-employees/:id             read one (deep join)
//   POST   /pms-employees                 create one OR bulk
//                                         body: object | { items: object[] }
//   PUT    /pms-employees/:id             update
//   PATCH  /pms-employees/:id             partial update
//   DELETE /pms-employees/:id             delete
// =============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

const SELECT_COLS =
    "id, username, emp_code, national_id, full_name, " +
    "position_id, level_id, supervisor_id, auth_user_id, is_active, " +
    "created_at, updated_at, created_by, updated_by, " +
    "pms_positions!inner(name, code, team_id, pms_teams!inner(name, code, department_id, pms_departments!inner(name, code))), " +
    "pms_levels(name, sort_order), " +
    "supervisor:pms_employees!pms_employees_supervisor_id_fkey(id, emp_code, full_name)";

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function err(message: string, status = 400, details?: unknown): Response {
    return json({ error: message, details: details ?? null }, status);
}
function mapPgError(code?: string): number {
    if (code === "23505") return 409;
    if (code === "23503") return 422;
    if (code === "42501") return 403;
    if (code === "23514") return 422;
    return 400;
}

type DeptJoin = { name?: string; code?: string };
type TeamJoin = {
    name?: string;
    code?: string;
    department_id?: number;
    pms_departments?: DeptJoin;
};
type PosJoin = {
    name?: string;
    code?: string;
    team_id?: number;
    pms_teams?: TeamJoin;
};
type LevelJoin = { name?: string; sort_order?: number };
type SupervisorJoin = { id?: number; emp_code?: string | null; full_name?: string | null };

function flatten<T extends { pms_positions?: PosJoin | null; pms_levels?: LevelJoin | null; supervisor?: SupervisorJoin | null }>(row: T) {
    if (!row) return row;
    const { pms_positions, pms_levels, supervisor, ...rest } = row as Record<string, unknown> & {
        pms_positions?: PosJoin;
        pms_levels?: LevelJoin;
        supervisor?: SupervisorJoin;
    };
    return {
        ...rest,
        position_name: pms_positions?.name ?? null,
        position_code: pms_positions?.code ?? null,
        team_id: pms_positions?.team_id ?? null,
        team_name: pms_positions?.pms_teams?.name ?? null,
        team_code: pms_positions?.pms_teams?.code ?? null,
        department_id: pms_positions?.pms_teams?.department_id ?? null,
        department_name: pms_positions?.pms_teams?.pms_departments?.name ?? null,
        department_code: pms_positions?.pms_teams?.pms_departments?.code ?? null,
        level_name: pms_levels?.name ?? null,
        level_sort_order: pms_levels?.sort_order ?? null,
        supervisor_name: supervisor?.full_name ?? null,
        supervisor_emp_code: supervisor?.emp_code ?? null,
    };
}

function validateNewRow(body: Record<string, unknown>): string | null {
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const empCode = typeof body.emp_code === "string" ? body.emp_code.trim() : "";
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const positionId = parseInt(body.position_id as string, 10);
    if (!username) return "'username' is required";
    if (username.length > 200) return "'username' too long";
    if (!empCode) return "'emp_code' is required";
    if (empCode.length > 50) return "'emp_code' too long";
    if (!fullName) return "'full_name' is required";
    if (fullName.length > 200) return "'full_name' too long";
    if (!Number.isInteger(positionId)) return "'position_id' is required";
    if (body.national_id !== null && body.national_id !== undefined && body.national_id !== "") {
        if (typeof body.national_id !== "string" || !/^[0-9]{13}$/.test(body.national_id))
            return "'national_id' must be 13 digits";
    }
    if (body.level_id !== undefined && body.level_id !== null && !Number.isInteger(parseInt(body.level_id as string, 10))) {
        return "Invalid 'level_id'";
    }
    return null;
}

function shapeForInsert(body: Record<string, unknown>, userId: string | null) {
    return {
        username: (body.username as string).trim(),
        emp_code: (body.emp_code as string).trim(),
        full_name: (body.full_name as string).trim(),
        national_id: body.national_id ? String(body.national_id).trim() : null,
        position_id: parseInt(body.position_id as string, 10),
        level_id: body.level_id != null && body.level_id !== "" ? parseInt(body.level_id as string, 10) : null,
        supervisor_id: body.supervisor_id != null && body.supervisor_id !== "" ? parseInt(body.supervisor_id as string, 10) : null,
        auth_user_id: body.auth_user_id ?? null,
        is_active: body.is_active ?? true,
        created_by: userId,
        updated_by: userId,
    };
}

// ─── BulkRowError type ────────────────────────────────────────────────
type BulkRowError = {
    index: number;
    field: "emp_code" | "username" | "national_id" | "row";
    value: string | null;
    error: string;
};

function collectInFileDuplicates(
    rows: Array<{ emp_code: string; username: string; national_id: string | null }>,
): BulkRowError[] {
    const errs: BulkRowError[] = [];
    const seen = new Map<string, Map<string, number[]>>();
    seen.set("emp_code", new Map());
    seen.set("username", new Map());
    seen.set("national_id", new Map());

    rows.forEach((r, i) => {
        const trio: Array<[BulkRowError["field"], string | null]> = [
            ["emp_code", r.emp_code],
            ["username", r.username],
            ["national_id", r.national_id],
        ];
        for (const [field, raw] of trio) {
            if (!raw) continue;
            const key = raw.trim().toLowerCase();
            if (!key) continue;
            const bucket = seen.get(field)!;
            const idxs = bucket.get(key);
            if (idxs) {
                idxs.push(i);
            } else {
                bucket.set(key, [i]);
            }
        }
    });

    for (const [field, bucket] of seen.entries()) {
        for (const [, idxs] of bucket.entries()) {
            if (idxs.length > 1) {
                idxs.forEach((idx) => {
                    const r = rows[idx];
                    const value =
                        field === "emp_code" ? r.emp_code :
                        field === "username" ? r.username :
                        r.national_id;
                    errs.push({
                        index: idx,
                        field: field as BulkRowError["field"],
                        value,
                        error: `${field} ซ้ำในไฟล์ (แถวอื่น: ${idxs.filter(x => x !== idx).map(x => x + 1).join(", ")})`,
                    });
                });
            }
        }
    }
    return errs;
}

// F6 hardening (2026-05-23): explicit HTTP method allowlist (defense-in-depth).
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
    if (!ALLOWED_METHODS.has(req.method)) return err("Method not allowed", 405);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Missing Authorization header", 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
    });
    const adminClient = SUPABASE_SERVICE_ROLE_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const idCandidate = /^\d+$/.test(last) ? parseInt(last, 10) : null;

    try {
        switch (req.method) {
            // ---------- READ ----------
            case "GET": {
                if (idCandidate !== null) {
                    const { data, error } = await supabase
                        .from("pms_employees")
                        .select(SELECT_COLS)
                        .eq("id", idCandidate)
                        .maybeSingle();
                    if (error) return err(error.message, 400, error);
                    if (!data) return err("Not found", 404);
                    return json({ data: flatten(data as never) });
                }

                const username = url.searchParams.get("username");
                const empCode = url.searchParams.get("emp_code");
                const fullName = url.searchParams.get("full_name");
                const positionId = url.searchParams.get("position_id");
                const teamId = url.searchParams.get("team_id");
                const departmentId = url.searchParams.get("department_id");
                const levelId = url.searchParams.get("level_id");
                const positionName = url.searchParams.get("position");
                const teamName = url.searchParams.get("team");
                const deptName = url.searchParams.get("dept");
                const levelName = url.searchParams.get("level");
                const isActive = url.searchParams.get("is_active");
                const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
                const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

                let q = supabase
                    .from("pms_employees")
                    .select(SELECT_COLS, { count: "exact" })
                    .order("emp_code", { ascending: true })
                    .range(offset, offset + limit - 1);

                if (username) q = q.ilike("username", `%${username}%`);
                if (empCode) q = q.ilike("emp_code", `%${empCode}%`);
                if (fullName) q = q.ilike("full_name", `%${fullName}%`);
                if (positionId) {
                    const n = parseInt(positionId, 10);
                    if (Number.isInteger(n)) q = q.eq("position_id", n);
                }
                if (levelId) {
                    const n = parseInt(levelId, 10);
                    if (Number.isInteger(n)) q = q.eq("level_id", n);
                }
                if (teamId) {
                    const n = parseInt(teamId, 10);
                    if (Number.isInteger(n)) q = q.eq("pms_positions.team_id", n);
                }
                if (departmentId) {
                    const n = parseInt(departmentId, 10);
                    if (Number.isInteger(n)) q = q.eq("pms_positions.pms_teams.department_id", n);
                }
                if (positionName) q = q.eq("pms_positions.name", positionName);
                if (teamName) q = q.eq("pms_positions.pms_teams.name", teamName);
                if (deptName) q = q.eq("pms_positions.pms_teams.pms_departments.name", deptName);
                if (levelName) q = q.eq("pms_levels.name", levelName);
                if (isActive === "true") q = q.eq("is_active", true);
                if (isActive === "false") q = q.eq("is_active", false);

                const { data, count, error } = await q;
                if (error) return err(error.message, 400, error);
                return json({
                    data: (data ?? []).map((r) => flatten(r as never)),
                    count,
                    limit,
                    offset,
                });
            }

            // ---------- CREATE (single or bulk) ----------
            case "POST": {
                const body = await req.json().catch(() => ({}));
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id ?? null;

                // Bulk: { items: [...] }  or  array directly
                const items: unknown =
                    Array.isArray(body) ? body : (body && Array.isArray(body.items) ? body.items : null);

                if (items) {
                    if (!Array.isArray(items) || items.length === 0)
                        return err("'items' must be a non-empty array", 422);
                    if (items.length > 1000) return err("Max 1000 items per bulk insert", 422);

                    // ── Step 1: per-row shape validation ──────────────────
                    const shapeErrs: BulkRowError[] = [];
                    const shaped: Array<{ emp_code: string; username: string; national_id: string | null; position_id: number; level_id: number | null; auth_user_id: string | null; is_active: boolean; full_name: string; created_by: string | null; updated_by: string | null }> = [];
                    items.forEach((it, i) => {
                        const msg = validateNewRow(it as Record<string, unknown>);
                        if (msg) {
                            shapeErrs.push({ index: i, field: "row", value: null, error: msg });
                            return;
                        }
                        shaped.push(shapeForInsert(it as Record<string, unknown>, userId) as never);
                    });
                    if (shapeErrs.length > 0) {
                        return err("Validation failed for some rows", 422, {
                            code: "bulk_validation",
                            rows: shapeErrs,
                        });
                    }

                    // ── Step 2: in-file duplicate detection ────────────────
                    const inFileErrs = collectInFileDuplicates(
                        shaped.map((r) => ({ emp_code: r.emp_code, username: r.username, national_id: r.national_id }))
                    );

                    // ── Step 3: pre-flight uniqueness vs. DB ───────────────
                    const empCodes = Array.from(new Set(shaped.map((r) => r.emp_code)));
                    const usernames = Array.from(new Set(shaped.map((r) => r.username)));
                    const nationalIds = Array.from(
                        new Set(shaped.map((r) => r.national_id).filter((v): v is string => !!v))
                    );

                    const dbErrs: BulkRowError[] = [];

                    // Fetch any existing rows that collide on the three unique columns.
                    // We do three lightweight selects to keep filter logic simple.
                    const [empRes, userRes, idRes] = await Promise.all([
                        empCodes.length
                            ? supabase.from("pms_employees").select("emp_code").in("emp_code", empCodes)
                            : Promise.resolve({ data: [] as Array<{ emp_code: string }>, error: null }),
                        usernames.length
                            ? supabase.from("pms_employees").select("username").in("username", usernames)
                            : Promise.resolve({ data: [] as Array<{ username: string }>, error: null }),
                        nationalIds.length
                            ? supabase.from("pms_employees").select("national_id").in("national_id", nationalIds)
                            : Promise.resolve({ data: [] as Array<{ national_id: string }>, error: null }),
                    ]);
                    if (empRes.error) return err(empRes.error.message, 400, empRes.error);
                    if (userRes.error) return err(userRes.error.message, 400, userRes.error);
                    if (idRes.error) return err(idRes.error.message, 400, idRes.error);

                    const empConflicts = new Set((empRes.data ?? []).map((r) => r.emp_code));
                    const userConflicts = new Set((userRes.data ?? []).map((r) => r.username));
                    const idConflicts = new Set((idRes.data ?? []).map((r) => r.national_id));

                    shaped.forEach((r, i) => {
                        if (empConflicts.has(r.emp_code)) {
                            dbErrs.push({ index: i, field: "emp_code", value: r.emp_code, error: "รหัสพนักงานซ้ำในระบบ" });
                        }
                        if (userConflicts.has(r.username)) {
                            dbErrs.push({ index: i, field: "username", value: r.username, error: "ชื่อบัญชีซ้ำในระบบ" });
                        }
                        if (r.national_id && idConflicts.has(r.national_id)) {
                            dbErrs.push({ index: i, field: "national_id", value: r.national_id, error: "เลขบัตรประชาชนซ้ำในระบบ" });
                        }
                    });

                    const allErrs = [...inFileErrs, ...dbErrs];
                    if (allErrs.length > 0) {
                        return err("Validation failed for some rows", 422, {
                            code: "bulk_validation",
                            rows: allErrs,
                        });
                    }

                    // ── Step 4: safe to insert ─────────────────────────────
                    const { data, error } = await supabase
                        .from("pms_employees")
                        .insert(shaped)
                        .select(SELECT_COLS);
                    if (error) return err(error.message, mapPgError(error.code), error);
                    return json({
                        data: (data ?? []).map((r) => flatten(r as never)),
                        inserted: data?.length ?? 0,
                    }, 201);
                }

                // Single insert
                const v = validateNewRow(body);
                if (v) return err(v, 422);

                const { data, error } = await supabase
                    .from("pms_employees")
                    .insert(shapeForInsert(body, userId))
                    .select(SELECT_COLS)
                    .single();
                if (error) return err(error.message, mapPgError(error.code), error);
                return json({ data: flatten(data as never) }, 201);
            }

            // ---------- UPDATE ----------
            case "PUT":
            case "PATCH": {
                if (idCandidate === null) return err("id is required in path", 400);
                const body = await req.json().catch(() => ({}));
                const patch: Record<string, unknown> = {};

                if (body.username !== undefined) {
                    if (typeof body.username !== "string" || !body.username.trim()) return err("Invalid 'username'", 422);
                    if (body.username.trim().length > 200) return err("'username' too long", 422);
                    patch.username = body.username.trim();
                }
                if (body.emp_code !== undefined) {
                    if (typeof body.emp_code !== "string" || !body.emp_code.trim()) return err("Invalid 'emp_code'", 422);
                    if (body.emp_code.trim().length > 50) return err("'emp_code' too long", 422);
                    patch.emp_code = body.emp_code.trim();
                }
                if (body.full_name !== undefined) {
                    if (typeof body.full_name !== "string" || !body.full_name.trim()) return err("Invalid 'full_name'", 422);
                    if (body.full_name.trim().length > 200) return err("'full_name' too long", 422);
                    patch.full_name = body.full_name.trim();
                }
                if (body.national_id !== undefined) {
                    if (body.national_id === null || body.national_id === "") {
                        patch.national_id = null;
                    } else {
                        if (typeof body.national_id !== "string" || !/^[0-9]{13}$/.test(body.national_id))
                            return err("'national_id' must be 13 digits", 422);
                        patch.national_id = body.national_id;
                    }
                }
                if (body.position_id !== undefined) {
                    const n = parseInt(body.position_id as string, 10);
                    if (!Number.isInteger(n)) return err("Invalid 'position_id'", 422);
                    patch.position_id = n;
                }
                if (body.level_id !== undefined) {
                    if (body.level_id === null || body.level_id === "") {
                        patch.level_id = null;
                    } else {
                        const n = parseInt(body.level_id as string, 10);
                        if (!Number.isInteger(n)) return err("Invalid 'level_id'", 422);
                        patch.level_id = n;
                    }
                }
                if (body.supervisor_id !== undefined) {
                    if (body.supervisor_id === null || body.supervisor_id === "") {
                        patch.supervisor_id = null;
                    } else {
                        const n = parseInt(body.supervisor_id as string, 10);
                        if (!Number.isInteger(n)) return err("Invalid 'supervisor_id'", 422);
                        if (n === idCandidate) return err("'supervisor_id' cannot refer to the employee itself", 422);
                        patch.supervisor_id = n;
                    }
                }
                if (body.auth_user_id !== undefined) patch.auth_user_id = body.auth_user_id || null;
                if (body.is_active !== undefined) patch.is_active = !!body.is_active;

                if (Object.keys(patch).length === 0) return err("No updatable fields provided", 422);

                // If username is changing, we need the current auth_user_id before updating.
                let authUserIdForSync: string | null = null;
                if (patch.username && adminClient) {
                    const { data: cur } = await supabase
                        .from("pms_employees")
                        .select("auth_user_id, username")
                        .eq("id", idCandidate)
                        .maybeSingle();
                    const newUsername = patch.username as string;
                    if (cur?.auth_user_id && cur.username !== newUsername) {
                        authUserIdForSync = cur.auth_user_id as string;
                    }
                }

                const { data: { user } } = await supabase.auth.getUser();
                patch.updated_by = user?.id ?? null;

                const { data, error } = await supabase
                    .from("pms_employees")
                    .update(patch)
                    .eq("id", idCandidate)
                    .select(SELECT_COLS)
                    .maybeSingle();

                if (error) return err(error.message, mapPgError(error.code), error);
                if (!data) return err("Not found or not allowed", 404);

                // Sync auth.users email + profiles when username (= login email) changed.
                if (authUserIdForSync && adminClient) {
                    const newEmail = patch.username as string;
                    await adminClient.auth.admin.updateUserById(authUserIdForSync, { email: newEmail });
                    await adminClient.from("profiles").update({
                        email: newEmail,
                        username: newEmail,
                        updated_at: new Date().toISOString(),
                    }).eq("id", authUserIdForSync);
                }

                return json({ data: flatten(data as never) });
            }

            // ---------- DELETE ----------
            case "DELETE": {
                if (idCandidate === null) return err("id is required in path", 400);
                const { data, error } = await supabase
                    .from("pms_employees")
                    .delete()
                    .eq("id", idCandidate)
                    .select(SELECT_COLS)
                    .maybeSingle();
                if (error) {
                    const status = error.code === "23503" ? 409 : mapPgError(error.code);
                    return err(error.message, status, error);
                }
                if (!data) return err("Not found or not allowed", 404);
                return json({ success: true, data: flatten(data as never) });
            }

            default:
                return err("Method not allowed", 405);
        }
    } catch (e) {
        return err((e as Error).message, 500);
    }
});
