// =============================================================
// usePmsAssigned — typed wrapper for /functions/v1/pms-assigned
// "งานที่ฉันต้องประเมิน" — read-only list of rater assignments
// =============================================================
import type { PmsAssessmentType, PmsEvaluationRole, PmsEvaluationStatus } from './usePmsEvaluations';

export type PmsWorkloadStatus = 'pending' | 'in_progress' | 'completed';

/** One row per rater assignment, joined with evaluatee + evaluator org meta */
export interface PmsAssignedRow {
    rater_id: number;
    send_id: number;
    assessment_id: number;
    assessment_name: string | null;
    assessment_type: PmsAssessmentType;
    year_id: number | null;
    cycle_id: number | null;
    year: number | null;
    cycle_label: string | null;
    send_status: string | null;

    /* Rater assignment */
    evaluator_role: PmsEvaluationRole;
    evaluator_employee_id: number | null;
    notified_at: string | null;
    completed_at: string | null;

    /* Evaluatee (ผู้ถูกประเมิน) */
    evaluatee_employee_id: number | null;
    evaluatee_emp_code: string | null;
    evaluatee_name: string | null;
    evaluatee_position: string | null;
    evaluatee_position_id: number | null;
    evaluatee_level_name: string | null;
    evaluatee_level_id: number | null;

    /* Evaluator org meta */
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

    /* Evaluation status of this rater's row (if any) */
    evaluation_id: number | null;
    eval_status: PmsEvaluationStatus | null;
    workload_status: PmsWorkloadStatus;
}

export interface PmsAssignedListParams {
    /** Default = current user. Admin can override. */
    evaluator_employee_id?: number;
    send_id?: number;
    evaluator_role?: PmsEvaluationRole;
    workload_status?: PmsWorkloadStatus;
    assessment_type?: PmsAssessmentType;
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    position_id?: number;
    level_id?: number;
    evaluatee_employee_id?: number;
    /** Exact names */
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    position?: string;
    level?: string;
    /** ilike on evaluatee */
    emp_code?: string;
    full_name?: string;
    limit?: number;
    offset?: number;
}

export interface PmsAssignedListResponse {
    data: PmsAssignedRow[];
    count: number | null;
    limit: number;
    offset: number;
    /** Echoed back so the page can show "ตารางงานของ <employee>" */
    evaluator_employee_id: number | null;
}

export const usePmsAssigned = () => {
    const { request } = usePmsApi();

    const list = (params: PmsAssignedListParams = {}) =>
        request<PmsAssignedListResponse>('/pms-assigned', { query: params });

    return { list };
};
