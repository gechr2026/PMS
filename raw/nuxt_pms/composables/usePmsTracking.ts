// =============================================================
// usePmsTracking — typed wrapper for /functions/v1/pms-tracking
// =============================================================
import type { ListResponse } from './usePmsApi';

/** Aggregated row per (employee, year, cycle) — list endpoint */
export interface PmsTrackingSummaryRow {
    employee_id: number;
    emp_code: string | null;
    employee_name: string | null;
    username: string | null;
    position_id: number | null;
    position_name: string | null;
    position_code: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    level_id: number | null;
    level_name: string | null;
    year_id: number | null;
    year: number | null;
    cycle_id: number | null;
    cycle_label: string | null;
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    completed_pct: number;
}

/** One task row inside the detail view */
export interface PmsTrackingTask {
    send_id: number;
    assessment_id: number;
    assessment_name: string | null;
    year_id: number | null;
    cycle_id: number | null;
    year: number | null;
    cycle_label: string | null;
    /** Rater (evaluator) — the row's owner, i.e. the person whose detail page this is */
    emp_code: string | null;
    employee_name: string | null;
    position_name: string | null;
    position_code: string | null;
    team_name: string | null;
    department_name: string | null;
    level_name: string | null;
    /** Evaluatee (recipient/ผู้ถูกประเมิน) — who this task is about */
    evaluatee_employee_id: number | null;
    evaluatee_emp_code: string | null;
    evaluatee_name: string | null;
    evaluatee_position: string | null;
    evaluatee_team_name: string | null;
    evaluatee_department_name: string | null;
    evaluatee_level_name: string | null;
    evaluator_role: 'self' | 'manager' | 'executive' | 'ceo' | 'peer' | 'subordinate' | null;
    evaluation_id: number | null;
    eval_status: 'draft' | 'submitted' | 'approved' | null;
    send_status: string;
    workload_status: 'pending' | 'in_progress' | 'completed';
    /** Pre-translated Thai status from backend */
    ui_status: string;
}

export interface PmsTrackingDetailResponse {
    employee: {
        id: number;
        emp_code: string | null;
        full_name: string | null;
        username: string | null;
        is_active: boolean;
        level_id: number | null;
        level_name: string | null;
        position_id: number | null;
        position_name: string | null;
        position_code: string | null;
        team_id: number | null;
        team_name: string | null;
        department_id: number | null;
        department_name: string | null;
    };
    summary: {
        total: number;
        pending: number;
        in_progress: number;
        done: number;
        completed_pct: number;
    };
    tasks: PmsTrackingTask[];
    count: number | null;
    limit: number;
    offset: number;
}

export interface PmsTrackingListParams {
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    position_id?: number;
    level_id?: number;
    /** Exact name filters */
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    position?: string;
    level?: string;
    /** Substring filters */
    emp_code?: string;
    full_name?: string;
    limit?: number;
    offset?: number;
}

export interface PmsTrackingDetailParams {
    year_id?: number;
    cycle_id?: number;
    year?: number | string;
    cycle?: string;
    limit?: number;
    offset?: number;
}

export const usePmsTracking = () => {
    const { request } = usePmsApi();

    const list = (params: PmsTrackingListParams = {}) =>
        request<ListResponse<PmsTrackingSummaryRow>>('/pms-tracking', { query: params });

    const detail = (employeeId: number, params: PmsTrackingDetailParams = {}) =>
        request<PmsTrackingDetailResponse>(`/pms-tracking/${employeeId}`, { query: params });

    return { list, detail };
};
