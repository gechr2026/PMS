// =============================================================
// usePmsAcl — role → menu/route access matrix
// - Single source of truth for which roles can see which routes.
// - Backend RLS already enforces *data* permissions; this composable
//   only governs UI affordances (sidebar links + route guard).
// =============================================================
import type { PmsRole } from './useAuth';

export interface RouteAcl {
    /** Route path prefix (no trailing slash). Matches the path itself or any sub-path. */
    prefix: string;
    /** Roles allowed. Empty list = nobody. */
    roles: PmsRole[];
}

export const ROUTE_ACL: RouteAcl[] = [
    { prefix: '/pms/settings',        roles: ['admin'] },
    { prefix: '/pms/reports',         roles: ['admin', 'executive', 'manager'] },
    { prefix: '/pms/evaluation',      roles: ['admin', 'executive', 'manager'] },
    { prefix: '/pms/summary',         roles: ['admin', 'executive', 'manager'] },
    { prefix: '/pms/report/tracking', roles: ['admin', 'executive', 'manager', 'supervisor'] },
    { prefix: '/pms/compare',         roles: ['admin', 'executive', 'manager', 'supervisor', 'officer'] },
    // Anything not listed (eg. '/', '/pms/assigned') is open to all authenticated roles.
];

// Cache the sorted-by-longest-prefix list so each canAccess() call doesn't re-sort.
const SORTED_ACL = [...ROUTE_ACL].sort((a, b) => b.prefix.length - a.prefix.length);

export const usePmsAcl = () => {
    const { role } = useAuth();

    /** True if the given role can access `path`. Falls back to current role when omitted. */
    const canAccess = (path: string, asRole: PmsRole | null = role.value): boolean => {
        if (!asRole) return false;
        const match = SORTED_ACL.find(
            (r) => path === r.prefix || path.startsWith(r.prefix + '/')
        );
        if (!match) return true;                  // no rule → open to authenticated users
        return match.roles.includes(asRole);
    };

    // Boolean shortcuts the sidebar binds to.
    const canSeeSettings = computed(() => canAccess('/pms/settings'));
    const canSeeReports  = computed(() => canAccess('/pms/reports'));
    const canSeeSummary  = computed(() => canAccess('/pms/summary'));
    const canSeeTracking = computed(() => canAccess('/pms/report/tracking'));
    const canSeeCompare  = computed(() => canAccess('/pms/compare'));

    return {
        canAccess,
        canSeeSettings,
        canSeeReports,
        canSeeSummary,
        canSeeTracking,
        canSeeCompare,
    };
};
