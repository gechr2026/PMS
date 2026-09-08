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

// Admin-only rules exist only in the admin build. `__PMS_ADMIN__` is folded to
// false when building the staff app (see nuxt.config.ts), which drops this
// branch and the admin URLs inside it — those routes aren't registered there,
// so no employee can find them by reading the bundle.
const ADMIN_ACL: RouteAcl[] = __PMS_ADMIN__
    ? [
          { prefix: '/pms/settings', roles: ['admin'] },
          { prefix: '/pms/reports-edit', roles: ['admin'] },
      ]
    : [];

// Destructured so the shortcuts below can name their prefix without repeating
// the literal — repeating it would leak the URL back into the staff bundle.
const [SETTINGS_ACL, REPORTS_EDIT_ACL] = ADMIN_ACL;

export const ROUTE_ACL: RouteAcl[] = [
    ...ADMIN_ACL,
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

    // Boolean shortcuts the sidebar binds to. The two admin ones are constantly
    // false in the staff build, where those routes don't exist.
    const canSeeSettings     = computed(() => !!SETTINGS_ACL && canAccess(SETTINGS_ACL.prefix));
    const canSeeReportsEdit  = computed(() => !!REPORTS_EDIT_ACL && canAccess(REPORTS_EDIT_ACL.prefix));
    const canSeeReports      = computed(() => canAccess('/pms/reports'));
    const canSeeSummary      = computed(() => canAccess('/pms/summary'));
    const canSeeTracking     = computed(() => canAccess('/pms/report/tracking'));
    const canSeeCompare      = computed(() => canAccess('/pms/compare'));

    return {
        canAccess,
        canSeeSettings,
        canSeeReports,
        canSeeReportsEdit,
        canSeeSummary,
        canSeeTracking,
        canSeeCompare,
    };
};
