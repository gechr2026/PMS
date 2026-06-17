// =============================================================
// usePmsEvaluations — typed wrapper for /functions/v1/pms-evaluations
// (atomic save: header + KPI/Competency scores + auto-compute totals)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export type PmsEvaluationRole   = 'self' | 'manager' | 'executive' | 'ceo' | 'peer' | 'subordinate';
/**
 * Evaluation lifecycle (simplified 2026-05-22). Only two active values:
 *   - 'draft' → editable by owner+role
 *   - 'sent'  → locked; admin can flip back to 'draft' via /revert
 * Legacy 'submitted'/'approved' rows were folded into 'sent' by migration
 * 2026-05-22_evaluation_status_simplify.
 */
export type PmsEvaluationStatus = 'draft' | 'sent';

/**
 * Document classification used by `pms_assessments.type`.
 *
 * NOTE: `'annual_self'` is **deprecated** as of 2026-05-22 — soft-consolidated
 * into `'annual_supervisor'` (one annual form, raters chosen per-send via
 * pms_assessment_send_raters). Kept in the union to read any legacy rows that
 * may still carry it. Never write new rows with this value.
 */
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

/** Joined send info (returned by detail endpoint) — send now carries cycle_id, not assessment_id */
export interface PmsEvaluationSendContext {
    employee_id?: number;
    cycle_id?: number;
    pms_employees?: {
        emp_code?: string;
        full_name?: string;
        position_id?: number;
        level_id?: number;
    };
}

/** Joined assessment info (returned by detail endpoint) — directly via evaluation.assessment_id */
export interface PmsEvaluationAssessmentContext {
    name?: string;
    type?: PmsAssessmentType;
    year_id?: number;
    cycle_id?: number;
    kpi_weight?: number;
    competency_weight?: number;
    pms_years?: { year?: number };
    pms_cycles?: { cycle_label?: string };
}

export interface PmsEvaluation {
    id: number;
    send_id: number;
    evaluator_role: PmsEvaluationRole;
    evaluator_employee_id: number | null;
    evaluator?: { emp_code: string | null; full_name: string | null } | null;
    /** Which assessment this evaluation is for (added 2026-05-22) */
    assessment_id: number;
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
    pms_assessments?: PmsEvaluationAssessmentContext;
    pms_assessment_sends?: PmsEvaluationSendContext;
}

export interface PmsEvaluationListParams {
    send_id?: number;
    assessment_id?: number;
    evaluator_role?: PmsEvaluationRole;
    status?: PmsEvaluationStatus;
    evaluator_employee_id?: number;
    limit?: number;
    offset?: number;
}

export interface PmsEvaluationSaveBody {
    send_id?: number;                     // required for create
    evaluator_role?: PmsEvaluationRole;   // required for create
    assessment_id?: number;               // required for create
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

    /** Create new — required: send_id, evaluator_role, assessment_id */
    const create = (body: PmsEvaluationSaveBody & { send_id: number; evaluator_role: PmsEvaluationRole; assessment_id: number }) =>
        request<ItemResponse<PmsEvaluation>>('/pms-evaluations', { method: 'POST', body });

    /** Update existing by id */
    const update = (id: number, body: PmsEvaluationSaveBody) =>
        request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}`, { method: 'PATCH', body });

    /** Workflow actions */
    const submit = (id: number) => request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}/submit`, { method: 'POST' });
    /** Admin-only: revert a 'sent' evaluation back to 'draft' for re-editing. 403 if non-admin. */
    const revert = (id: number) => request<ItemResponse<PmsEvaluation>>(`/pms-evaluations/${id}/revert`, { method: 'POST' });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; send_id: number; evaluator_role: string } }>(
            `/pms-evaluations/${id}`,
            { method: 'DELETE' }
        );

    return { list, get, bySend, create, update, submit, revert, remove };
};
