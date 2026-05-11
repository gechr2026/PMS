// =============================================================
// usePmsApi — generic edge-function client
// - injects Authorization: Bearer <jwt>
// - normalises errors into PmsApiError with status + details
// - on 401 it clears the session and navigates to /auth/login
// =============================================================

export class PmsApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'PmsApiError';
        this.status = status;
        this.details = details ?? null;
    }
}

export interface ListResponse<T> {
    data: T[];
    count: number | null;
    limit: number;
    offset: number;
}

export interface ItemResponse<T> {
    data: T;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    /** When true, do not throw on 4xx — caller wants to inspect the error body */
    silent?: boolean;
}

export const usePmsApi = () => {
    const config = useRuntimeConfig();
    const auth = useAuth();
    const baseUrl = `${config.public.supabaseUrl}/functions/v1`;

    const buildQuery = (q?: RequestOptions['query']): string => {
        if (!q) return '';
        const sp = new URLSearchParams();
        for (const [k, v] of Object.entries(q)) {
            if (v === undefined || v === null || v === '') continue;
            sp.set(k, String(v));
        }
        const qs = sp.toString();
        return qs ? `?${qs}` : '';
    };

    const request = async <T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> => {
        const token = auth.session.value?.access_token;
        if (!token) {
            throw new PmsApiError('Not authenticated', 401);
        }

        const url = `${baseUrl}${path}${buildQuery(opts.query)}`;
        try {
            return await $fetch<T>(url, {
                method: opts.method ?? 'GET',
                body: opts.body,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (e: unknown) {
            const fe = e as { response?: { status?: number; _data?: unknown }; data?: unknown; message?: string };
            const status = fe?.response?.status ?? 0;
            const body = (fe?.response?._data ?? fe?.data ?? null) as { error?: string; details?: unknown } | null;
            const message = body?.error || fe?.message || `HTTP ${status}`;

            // Auto-handle expired/invalid session
            if (status === 401) {
                await auth.signOut();
                if (process.client) await navigateTo('/auth/login', { replace: true });
            }

            if (opts.silent) {
                throw new PmsApiError(message, status, body?.details);
            }
            throw new PmsApiError(message, status, body?.details);
        }
    };

    return { request, baseUrl };
};
