// =============================================================
// usePmsSummary — typed wrapper for /functions/v1/pms-summary
// =============================================================
import type { ListResponse } from './usePmsApi';
import type { PmsEvaluationResultRow, PmsEvaluationPerRoleAgg } from './usePmsEvaluationResults';
import type { PmsEvaluationRole, PmsEvaluationStatus } from './usePmsEvaluations';

/** Reuses the row shape from evaluation-results view */
export type PmsSummaryRow = PmsEvaluationResultRow & {
    /** view exposes employee_position_id (renamed to avoid collision) */
    employee_position_id?: number | null;
};

/* ---- Detail-only types (from RPC pms_summary_detail) ---- */

export interface PmsSummaryEvalEntry {
    id: number;
    evaluator_role: PmsEvaluationRole;
    status: PmsEvaluationStatus;
    kpi_score: number | null;
    competency_score: number | null;
    total_score: number | null;
    grade: string | null;
    recommendation: number | null;
    overall_comment: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    evaluator_employee_id: number | null;
    evaluator_emp_code: string | null;
    evaluator_full_name: string | null;
    evaluator_position: string | null;
}

export interface PmsSummaryRater {
    evaluator_role: PmsEvaluationRole;
    evaluator_employee_id: number | null;
    evaluator_full_name: string | null;
    evaluator_emp_code: string | null;
    selected_option: number | null;
    is_closed: boolean;
    score: number | null;
    /** Free-text note this rater left on the item. null when none. */
    comment: string | null;
}

export interface PmsSummaryItem {
    id: number;
    subject: string;
    detail?: string | null;
    target: string | null;
    weight: number;
    sort_order: number;
    options?: string[];
    avg_score: number | null;
    by_rater: PmsSummaryRater[];
}

export interface PmsSummaryPeer {
    send_id: number;
    employee_id: number;
    emp_code: string | null;
    full_name: string | null;
    position_name: string | null;
    kpi_score: number | null;
    competency_score: number | null;
    total_score: number | null;
    grade: string | null;
    submitted_count: number | null;
}

export interface PmsSummaryProposal {
    evaluator_role: Extract<PmsEvaluationRole, 'manager' | 'executive' | 'ceo'>;
    evaluator_emp_code: string | null;
    evaluator_full_name: string | null;
    evaluator_position: string | null;
    recommendation: number | null;
    overall_comment: string | null;
    submitted_at: string | null;
    approved_at: string | null;
    status: string;
}

export interface PmsSummaryDetail {
    summary: PmsSummaryRow;
    grade_definition: string | null;
    evaluations: PmsSummaryEvalEntry[];
    /** Per-role aggregates (peer mean, subordinate mean, etc.) — added in 360° rewrite */
    per_role: PmsEvaluationPerRoleAgg[];
    kpis: PmsSummaryItem[];
    competencies: PmsSummaryItem[];
    peers: PmsSummaryPeer[];
    proposals: PmsSummaryProposal[];
}

export interface PmsSummaryListParams {
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    position_id?: number;
    level_id?: number;
    employee_id?: number;
    assessment_id?: number;
    /** Exact names */
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    position?: string;
    level?: string;
    /** ilike search */
    emp_code?: string;
    full_name?: string;
    assessment_name?: string;
    is_approved?: boolean;
    has_results?: boolean;
    limit?: number;
    offset?: number;
}

export const usePmsSummary = () => {
    const { request } = usePmsApi();

    const list = (params: PmsSummaryListParams = {}) => request<ListResponse<PmsSummaryRow>>('/pms-summary', { query: params });

    const detail = (sendId: number) => request<{ data: PmsSummaryDetail }>(`/pms-summary/${sendId}`);

    return { list, detail };
};
