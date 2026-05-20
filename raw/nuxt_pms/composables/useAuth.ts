// =============================================================
// useAuth — login (password / OTP) + session + role
// - admin                      → password via /auth-login/start
// - officer/manager/executive  → OTP: /auth-login/start then /auth-login/verify
// =============================================================
import type { Session, User } from '@supabase/supabase-js';

export type PmsRole = 'admin' | 'officer' | 'manager' | 'executive' | 'supervisor';
export type PmsLoginMethod = 'password' | 'otp' | 'unknown';

export interface PmsProfile {
    id: string;
    username: string | null;
    email: string | null;
    full_name: string | null;
    role: PmsRole;
    is_active: boolean;
}

export class PmsAuthError extends Error {
    code: string | null;
    status: number;
    constructor(message: string, status: number, code?: string | null) {
        super(message);
        this.name = 'PmsAuthError';
        this.status = status;
        this.code = code ?? null;
    }
}

interface SessionShape {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
}

interface StartResponse {
    method: PmsLoginMethod;
    message?: string;
    session?: SessionShape;
    user?: { id: string; email: string; role: PmsRole | null };
}

interface VerifyResponse {
    method: 'otp';
    session: SessionShape;
    user?: { id: string; email: string; role: PmsRole | null };
}

const RESTORED = '__pms_session_restored__';

export const useAuth = () => {
    const supabase = useSupabase();
    const config = useRuntimeConfig();

    const user = useState<User | null>('auth-user', () => null);
    const session = useState<Session | null>('auth-session', () => null);
    const profile = useState<PmsProfile | null>('auth-profile', () => null);
    const restored = useState<boolean>(RESTORED, () => false);

    const baseUrl = `${config.public.supabaseUrl}/functions/v1`;

    const loadProfile = async (uid: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, email, full_name, role, is_active')
            .eq('id', uid)
            .maybeSingle();
        if (error) {
            console.warn('[useAuth] failed to load profile:', error.message);
            profile.value = null;
            return null;
        }
        profile.value = (data as PmsProfile) ?? null;
        return profile.value;
    };

    const installSession = async (s: SessionShape) => {
        const { data, error } = await supabase.auth.setSession({
            access_token:  s.access_token,
            refresh_token: s.refresh_token,
        });
        if (error) {
            throw new PmsAuthError(error.message, 401, 'SESSION_INSTALL_FAILED');
        }
        session.value = data.session;
        user.value    = data.user;
        // Defer profile load to next tick to avoid Supabase auth-lock deadlock
        // (calling supabase.from(...) while setSession's lock is still held hangs).
        if (data.user) {
            const uid = data.user.id;
            setTimeout(() => { void loadProfile(uid); }, 0);
        }
    };

    const handleApiError = (e: unknown): never => {
        const fe = e as { response?: { status?: number; _data?: { error?: string; code?: string } } };
        const status = fe?.response?.status ?? 0;
        const body = fe?.response?._data ?? null;
        throw new PmsAuthError(
            body?.error || 'ไม่สามารถเข้าสู่ระบบได้',
            status,
            body?.code ?? null,
        );
    };

    /**
     * Start the login flow.
     *   - admin + password → returns { method: 'password' }, session installed
     *   - non-admin        → returns { method: 'otp' }, must follow with verifyOtp()
     *   - unknown email    → returns { method: 'unknown' } (no enumeration)
     */
    const signIn = async (email: string, password?: string): Promise<StartResponse> => {
        let res: StartResponse;
        try {
            res = await $fetch<StartResponse>(`${baseUrl}/auth-login/start`, {
                method: 'POST',
                body: { email, password },
            });
        } catch (e) {
            handleApiError(e);
        }
        if (res!.method === 'password' && res!.session) {
            await installSession(res!.session);
        }
        return res!;
    };

    /**
     * Complete OTP login. On success the session is installed.
     */
    const verifyOtp = async (email: string, token: string): Promise<VerifyResponse> => {
        let res: VerifyResponse;
        try {
            res = await $fetch<VerifyResponse>(`${baseUrl}/auth-login/verify`, {
                method: 'POST',
                body: { email, token },
            });
        } catch (e) {
            handleApiError(e);
        }
        await installSession(res!.session);
        return res!;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        session.value = null;
        user.value = null;
        profile.value = null;
    };

    /**
     * Restore session from local storage (called once at app boot).
     * Idempotent — subsequent calls short-circuit.
     */
    const restoreSession = async () => {
        if (restored.value) return;
        restored.value = true;

        const { data } = await supabase.auth.getSession();
        session.value = data.session;
        user.value = data.session?.user ?? null;
        if (user.value) await loadProfile(user.value.id);

        // IMPORTANT: don't `await` Supabase queries directly inside this
        // callback — Supabase JS holds an internal auth lock during the event
        // and any from()/rpc() call will deadlock. Defer to next tick.
        supabase.auth.onAuthStateChange((_event, newSession) => {
            session.value = newSession;
            user.value = newSession?.user ?? null;
            if (newSession?.user) {
                const uid = newSession.user.id;
                setTimeout(() => { void loadProfile(uid); }, 0);
            } else {
                profile.value = null;
            }
        });
    };

    const isAuthenticated = computed(() => !!session.value);
    const isAdmin = computed(() => profile.value?.role === 'admin');
    const role = computed(() => profile.value?.role ?? null);
    const accessToken = computed(() => session.value?.access_token ?? null);

    return {
        // state
        user, session, profile,
        // computed
        isAuthenticated, isAdmin, role, accessToken,
        // actions
        signIn, verifyOtp, signOut, restoreSession, loadProfile,
    };
};
