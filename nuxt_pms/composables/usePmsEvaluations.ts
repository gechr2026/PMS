// =============================================================
// usePmsEvaluations — typed wrapper for /functions/v1/pms-evaluations
// (atomic save: header + KPI/Competency scores + auto-compute totals)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export type PmsEvaluationRole   = 'self' | 'manager' | 'executive' | 'ceo' | 'peer' | 'subordinate';
export type PmsEvaluationStatus = 'draft' | 'submitted' | 'approved';

/** Document classification used by pms_assessments.type */
export type PmsAssessmentType = 'annual_supervisor' | 'competency_360' | 'annual_self';

export interface PmsEvalKpiScore {
    id?: number;
    kpi_id: number;
    selected_option: number | null;   // 0 = N/A, 1-5 = ระดับ
    is_closed: boolean;
    score: number | null;             // computed by RPC
    comment: string | null;
}

export interface PmsEvalCompetencyScore {
    id?: number;
    competency_id: number;
    selected_option: number | null;
    is_closed: boolean;
    score: number | null;
    comment: string | null;
}

/** Joined info from assessment and employee (returned by detail endpoint) */
export interface PmsEvaluationContext {
    employee_id?: number;
    assessment_id?: number;
    pms_assessments?: {
        name?: string;
        type?: PmsAssessmentType;
        kpi_weight?: number;
        competency_weight?: number;
        pms_years?: { year?: number };
        pms_cycles?: { cycle_label?: string };
    };
    pms_employees?: {
        emp_code?: string;
        full_name?: string;
        position_id?: number;
        level_id?: number;
    };
}

export interface PmsEvaluation {
    id: number;
    send_id: number;
    evaluator_role: PmsEvaluationRole;
    evaluator_employee_id: number | null;
    status: PmsEvaluationStatus;
    kpi_score: number | null;
    competency_score: number | null;
    total_score: number | null;
    grade: string | null;
    recommendation: number | null;
    overall_comment: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    /** Detail-only (not in list response) */
    kpi_scores?: PmsEvalKpiScore[];
    competency_scores?: PmsEvalCompetencyScore[];
    pms_assessment_sends?: PmsEvaluationContext;
}

export interface PmsEvaluationListParams {
    send_id?: number;
    evaluator_role?: PmsEvaluationRole;
    status?: PmsEvaluationStatus;
    evaluator_employee_id?: number;
    limit?: number;
    offset?: number;
}

export interface PmsEvaluationSaveBody {
    send_id?: number;             // required for create
    evaluator_role?: PmsEvaluationRole;  // required for create
    status?: PmsEvaluationStatus;
    recommendation?: number | null;
    overall_comment?: string | null;
    kpi_scores?: Array<{
        kpi_id: number;
        selected_option?: number | null;
        is_closed?: boolean;
        comment?: string | null;
    }>;
    competency_scores?: Array<{
        competency_id: number;
        selected_option?: number | null;
        is_closed?: boolean;
        comment?: string | null;
    }>;
}

export const usePmsEvaluations = () => {
    const { request } = usePmsApi();

    const list = (params: PmsEvaluationListParams = {}) =>
        request<ListResponse<PmsEvaluation>>('/pms-evaluations', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}`);

    /** Get all evaluations (self + manager + executive) for one send */
    const bySend = (sendId: number) =>
        request<{ data: PmsEvaluation[] }>(`/pms-evaluations/by-send/${sendId}`);

    /** Create new — required: send_id, evaluator_role */
    const create = (body: PmsEvaluationSaveBody & { send_id: number; evaluator_role: PmsEvaluationRole }) =>
        request<ItemResponse<PmsEvaluation>>('/pms-evaluations', { method: 'POST', body });

    /** Update existing by id */
    const update = (id: number, body: PmsEvaluationSaveBody) =>
        request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}`, { method: 'PATCH', body });

    /** Workflow actions */
    const submit  = (id: number) => request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}/submit`,  { method: 'POST' });
    const approve = (id: number) => request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}/approve`, { method: 'POST' });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; send_id: number; evaluator_role: string } }>(
            `/pms-evaluations/${id}`,
            { method: 'DELETE' }
        );

    return { list, get, bySend, create, update, submit, approve, remove };
};
