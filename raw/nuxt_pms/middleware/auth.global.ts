// =============================================================
// auth.global.ts
// - Skips on SSR (Supabase auth lives in localStorage on the client)
// - Restores the session on first client navigation
// - Redirects:
//     * unauthenticated user hitting protected page    -> /auth/login
//     * authenticated user hitting auth pages          -> /
//     * authenticated user hitting role-forbidden page -> /403
// =============================================================
export default defineNuxtRouteMiddleware(async (to) => {
    if (process.server) return;

    const { session, profile, restoreSession } = useAuth();
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

    // Role-based access check.
    // profile loads asynchronously after installSession; if it's not ready yet,
    // let the page render and the next navigation will re-check.
    if (session.value && profile.value && !isAuthRoute && to.path !== '/403') {
        const { canAccess } = usePmsAcl();
        if (!canAccess(to.path, profile.value.role)) {
            return navigateTo('/403', { replace: true });
        }
    }
});
