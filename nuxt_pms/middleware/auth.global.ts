// =============================================================
// auth.global.ts
// - Skips on SSR (Supabase auth lives in localStorage on the client)
// - Restores the session on first client navigation
// - Redirects:
//     * unauthenticated user hitting protected page  -> /auth/login
//     * authenticated user hitting auth pages         -> /
// =============================================================
export default defineNuxtRouteMiddleware(async (to) => {
    if (process.server) return;

    const { session, restoreSession } = useAuth();
    await restoreSession();

    const isAuthRoute = to.path.startsWith('/auth/');

    if (!session.value && !isAuthRoute) {
        // Preserve where the user was trying to go so we can return there after login
        return navigateTo({
            path: '/auth/login',
            query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
        }, { replace: true });
    }
    if (session.value && isAuthRoute) {
        return navigateTo('/', { replace: true });
    }
});
