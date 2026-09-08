// =============================================================
// auth-login — role-based login
//   admin                      → password (sent with the email in one request)
//   officer/manager/executive  → our own 6-digit OTP via Gmail
// =============================================================
// v6: subject is pure ASCII (denomailer 1.6 mangles ANY non-ASCII header,
//     even already RFC 2047 encoded ones — it Q-encodes the `=` and `?`
//     delimiters, producing nested broken encoded-words).
// =============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

/** One wording for every credential failure, so none of them identifies a role. */
const GENERIC_CREDENTIALS_ERROR = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

const OTP_TTL_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function err(message: string, status = 400, details?: unknown): Response {
    return json({ error: message, details: details ?? null }, status);
}

function generate6DigitCode(): string {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return String(buf[0] % 1_000_000).padStart(6, "0");
}

async function sha256Hex(input: string): Promise<string> {
    const buf = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function otpEmailHtml(code: string, expiresMinutes: number): string {
    return `<!doctype html><html><body style="font-family:Sarabun,Arial,sans-serif;background:#f5f7fb;padding:24px;color:#1f2937">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;">
    <h2 style="margin:0 0 12px;color:#111827;font-size:18px">รหัสเข้าสู่ระบบประเมินผลการปฏิบัติงาน</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6">
      กรุณาใช้รหัสข้างล่างเพื่อเข้าสู่ระบบ — รหัสนี้จะหมดอายุใน ${expiresMinutes} นาที
    </p>
    <div style="text-align:center;margin:24px 0;padding:20px;background:#eff6ff;border-radius:10px">
      <div style="font-size:13px;color:#3b82f6;margin-bottom:6px;font-weight:600">รหัสยืนยันตัวตน</div>
      <div style="font-size:38px;font-weight:700;letter-spacing:8px;color:#1e3a8a;font-family:'Courier New',monospace">${code}</div>
    </div>
    <p style="margin:0;font-size:12px;color:#9ca3af">หากคุณไม่ได้ขอรหัสนี้ สามารถละเลยอีเมลฉบับนี้ได้</p>
  </div>
</body></html>`;
}

async function sendOtpEmail(toEmail: string, code: string, expiresMinutes: number): Promise<void> {
    const host     = Deno.env.get("SMTP_HOST");
    const portRaw  = Deno.env.get("SMTP_PORT");
    const secureRaw = Deno.env.get("SMTP_SECURE");
    const username = Deno.env.get("SMTP_USERNAME");
    const password = Deno.env.get("SMTP_PASSWORD");
    const from     = Deno.env.get("SMTP_FROM") || username || "";
    if (!host || !portRaw || !username || !password) throw new Error("SMTP is not configured");

    const port   = parseInt(portRaw, 10);
    const secure = secureRaw
        ? secureRaw.toLowerCase() === "true" || secureRaw === "1"
        : port === 465;

    const client = new SMTPClient({
        connection: {
            hostname: host,
            port,
            tls: secure,
            auth: { username, password: password.replace(/\s+/g, "") },
        },
    });
    try {
        // Subject: pure ASCII so denomailer 1.6 passes through (no Q-encoding mangling).
        // The Thai text lives in the body where QP encoding works correctly.
        const subject  = `PMS Login Code: ${code}`;
        const html     = otpEmailHtml(code, expiresMinutes);
        const plainText =
            `รหัสยืนยันตัวตน: ${code}\n` +
            `กรุณาใช้รหัสนี้เพื่อเข้าสู่ระบประเมินผลการปฏิบัติงาน\n` +
            `รหัสจะหมดอายุใน ${expiresMinutes} นาที\n\n` +
            `หากไม่ได้ขอรหัสนี้ สามารถละเลยอีเมลฉบับนี้ได้`;

        await client.send({
            from,
            to: toEmail,
            subject,
            content: plainText,
            html,
        });
    } finally {
        try { await client.close(); } catch (_) { /* ignore */ }
    }
}

// F6 hardening (2026-05-23): explicit HTTP method allowlist (defense-in-depth).
const ALLOWED_METHODS = new Set(["POST", "OPTIONS"]);

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
    if (!ALLOWED_METHODS.has(req.method)) return err("Method not allowed", 405);
    if (req.method !== "POST") return err("Method not allowed", 405);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!SUPABASE_SERVICE_ROLE_KEY) return err("Server misconfigured: missing service role key", 500);

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const url = new URL(req.url);
    const segs = url.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] ?? "";

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { return err("Invalid JSON body", 400); }

    const email = (typeof body.email === "string" ? body.email.trim().toLowerCase() : "");
    if (!email) return err("'email' is required", 422);

    try {
        if (last === "start") {
            // Every reply from this endpoint is identical no matter who the
            // address belongs to. Answering differently per role (a 422 for
            // admins, a 200 for everyone else) let anyone enumerate the admins
            // by posting their colleagues' addresses — it needs no auth at all.
            // See docs/superpowers/specs/2026-09-08-admin-build-separation-design.md
            const password = typeof body.password === "string" ? body.password : "";

            const { data: lookup, error: lookErr } = await adminClient.rpc("pms_login_lookup", { p_email: email });
            if (lookErr) return err("Failed to look up user", 500, lookErr);
            const role = (lookup as { role?: string } | null)?.role ?? null;

            // Password path — only admins have a password. A wrong password, a
            // non-admin address and an address that isn't in the system all end
            // in the same 401 with the same wording.
            if (password) {
                if (role !== "admin") return err(GENERIC_CREDENTIALS_ERROR, 401);

                const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
                    email, password,
                });
                if (signInErr || !signInData?.session) {
                    // No `details`: the non-admin branch above sends none, and a
                    // body that differs between the two would give the role away
                    // again.
                    return err(GENERIC_CREDENTIALS_ERROR, 401);
                }
                return json({
                    method: "password",
                    session: {
                        access_token:  signInData.session.access_token,
                        refresh_token: signInData.session.refresh_token,
                        expires_in:    signInData.session.expires_in,
                        expires_at:    signInData.session.expires_at,
                        token_type:    signInData.session.token_type,
                    },
                    user: { id: signInData.user?.id, email: signInData.user?.email, role },
                });
            }

            // OTP path — only staff roles are actually sent a code. Admins,
            // unknown addresses and accounts with no role reach the same reply
            // below having been sent nothing.
            if (role === "officer" || role === "manager" || role === "executive" || role === "supervisor") {
                const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
                    type: "magiclink",
                    email,
                });
                if (linkErr || !linkData) return err("ไม่สามารถสร้างรหัสได้", 500, linkErr);

                const props = (linkData as { properties?: { hashed_token?: string } }).properties;
                const tokenHash = props?.hashed_token;
                if (!tokenHash) return err("ไม่สามารถรับ token_hash จาก Supabase ได้", 500);

                const code = generate6DigitCode();
                const codeHash = await sha256Hex(code);
                const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString();

                await adminClient.from("pms_otp_codes")
                    .update({ used_at: new Date().toISOString() })
                    .eq("email", email)
                    .is("used_at", null);

                const { error: insErr } = await adminClient.from("pms_otp_codes").insert({
                    email,
                    code_hash: codeHash,
                    supabase_token_hash: tokenHash,
                    expires_at: expiresAt,
                });
                if (insErr) return err("ไม่สามารถบันทึกรหัสได้", 500, insErr);

                try {
                    await sendOtpEmail(email, code, OTP_TTL_MIN);
                } catch (sendErr) {
                    return err("ส่งอีเมลรหัสไม่สำเร็จ", 502, (sendErr as Error).message);
                }
            }

            return json({
                method: "otp",
                message: `หากมีบัญชีอีเมลนี้ในระบบ ระบบได้ส่งรหัส 6 หลักไปทางอีเมลแล้ว (หมดอายุใน ${OTP_TTL_MIN} นาที)`,
            });
        }

        if (last === "verify") {
            const token = typeof body.token === "string" ? body.token.trim() : "";
            if (!token || !/^\d{6}$/.test(token)) return err("รหัสต้องเป็นตัวเลข 6 หลัก", 422);

            const { data: rows, error: selErr } = await adminClient
                .from("pms_otp_codes")
                .select("id, code_hash, supabase_token_hash, expires_at, attempts")
                .eq("email", email)
                .is("used_at", null)
                .gt("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false })
                .limit(1);
            if (selErr) return err("ไม่สามารถตรวจสอบรหัสได้", 500, selErr);
            if (!rows || rows.length === 0) {
                return err("รหัสหมดอายุหรือยังไม่ได้ขอรหัส — กรุณาขอรหัสใหม่อีกครั้ง", 401);
            }
            const row = rows[0] as { id: number; code_hash: string; supabase_token_hash: string; expires_at: string; attempts: number };

            if (row.attempts >= OTP_MAX_ATTEMPTS) {
                await adminClient.from("pms_otp_codes")
                    .update({ used_at: new Date().toISOString() })
                    .eq("id", row.id);
                return err("พยายามหลายครั้งเกินกำหนด กรุณาขอรหัสใหม่อีกครั้ง", 429);
            }

            const tokenHash = await sha256Hex(token);
            if (tokenHash !== row.code_hash) {
                await adminClient.from("pms_otp_codes")
                    .update({ attempts: row.attempts + 1 })
                    .eq("id", row.id);
                const remaining = OTP_MAX_ATTEMPTS - (row.attempts + 1);
                return err(`รหัสไม่ถูกต้อง (เหลืออีก ${remaining} ครั้ง)`, 401);
            }

            const { data: vData, error: vErr } = await anonClient.auth.verifyOtp({
                token_hash: row.supabase_token_hash,
                type: "magiclink",
            });
            if (vErr || !vData?.session) {
                return err("ไม่สามารถสร้าง session ได้ — รหัสอาจหมดอายุ", 401, vErr);
            }

            await adminClient.from("pms_otp_codes")
                .update({ used_at: new Date().toISOString() })
                .eq("id", row.id);

            const { data: lookup } = await adminClient.rpc("pms_login_lookup", { p_email: email });
            const role = (lookup as { role?: string } | null)?.role ?? null;

            return json({
                method: "otp",
                session: {
                    access_token:  vData.session.access_token,
                    refresh_token: vData.session.refresh_token,
                    expires_in:    vData.session.expires_in,
                    expires_at:    vData.session.expires_at,
                    token_type:    vData.session.token_type,
                },
                user: { id: vData.user?.id, email: vData.user?.email, role },
            });
        }

        return err("Unknown route. Use /auth-login/start or /auth-login/verify", 404);
    } catch (e) {
        return err((e as Error).message, 500);
    }
});
