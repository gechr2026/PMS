// =============================================================
// usePmsDashboard — typed wrapper for /functions/v1/pms-dashboard
// =============================================================
import type { PmsAssessmentType, PmsEvaluationRole } from './usePmsEvaluations';

export interface PmsDashboardStats {
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    completed_pct: number;
}

export interface PmsDashboardByDepartment {
    department_id: number;
    department_name: string | null;
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    completed_pct: number;
    avg_score: number | null;
    final_avg_score: number | null;
}

export interface PmsDashboardByAssessmentType {
    assessment_type: PmsAssessmentType;
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    completed_pct: number;
}

export interface PmsDashboardByRole {
    evaluator_role: PmsEvaluationRole;
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    completed_pct: number;
}

export interface PmsDashboardPayload {
    filters: { year_id: number | null; cycle_id: number | null };
    stats: PmsDashboardStats;
    by_department: PmsDashboardByDepartment[];
    by_assessment_type: PmsDashboardByAssessmentType[];
    by_role: PmsDashboardByRole[];
    generated_at: string;
}

export interface PmsDashboardParams {
    year_id?: number;
    cycle_id?: number;
}

export const usePmsDashboard = () => {
    const { request } = usePmsApi();

    const summary = (params: PmsDashboardParams = {}) =>
        request<{ data: PmsDashboardPayload }>('/pms-dashboard', { query: params });

    return { summary };
};
