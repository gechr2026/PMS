// =============================================================
// usePmsEvaluationResults — typed wrapper for /functions/v1/pms-evaluation-results
// (read-only aggregated view — list from VIEW + detail from RPC)
// =============================================================
import type { ListResponse } from './usePmsApi';
import type { PmsAssessmentType, PmsEvaluationRole, PmsEvaluationStatus } from './usePmsEvaluations';

/** Row shape returned by the list endpoint (from `pms_evaluation_results_v`) */
export interface PmsEvaluationResultRow {
    send_id: number;
    assessment_id: number;
    employee_id: number;
    send_status: string;
    assessment_name: string;
    assessment_type: PmsAssessmentType;
    year_id: number | null;
    cycle_id: number | null;
    kpi_weight: number;
    competency_weight: number;
    criteria_id: number | null;
    year: number | null;
    cycle_label: string | null;
    /* Employee chain */
    emp_code: string | null;
    employee_name: string | null;
    employee_position_id: number | null;
    position_name: string | null;
    position_code: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    level_id: number | null;
    level_name: string | null;
    /* Aggregates */
    avg_kpi_score: number | null;
    avg_competency_score: number | null;
    avg_total_score: number | null;
    final_total_score: number | null;
    submitted_count: number | null;
    expected_count: number | null;
    is_approved: boolean | null;
    final_recommendation: number | null;
    final_grade: string | null;
}

/** Per-evaluator breakdown (inside detail) */
export interface PmsEvaluationResultEvalEntry {
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
}

/** Per-role aggregate (peer mean, subordinate mean, etc.) */
export interface PmsEvaluationPerRoleAgg {
    evaluator_role: PmsEvaluationRole;
    rater_count: number;
    submitted_count: number;
    kpi_mean: number | null;
    competency_mean: number | null;
    total_mean: number | null;
}

/** Per-item with averaged score across evaluators */
export interface PmsEvaluationResultItem {
    id: number;
    subject: string;
    detail?: string | null;
    target: string | null;
    weight: number;
    sort_order: number;
    options: string[];
    avg_score: number | null;
    by_evaluator: Array<{
        evaluation_id: number;
        evaluator_role: PmsEvaluationRole;
        selected_option: number | null;
        is_closed: boolean;
        score: number | null;
    }>;
}

export interface PmsEvaluationResultImprovement {
    id: number;
    subject: string;
    avg_score: number | null;
}

/** Detail returned by the RPC (full nested JSONB) */
export interface PmsEvaluationResultDetail {
    summary: PmsEvaluationResultRow;
    grade_definition: string | null;
    evaluations: PmsEvaluationResultEvalEntry[];
    per_role: PmsEvaluationPerRoleAgg[];
    kpis: PmsEvaluationResultItem[];
    competencies: PmsEvaluationResultItem[];
    kpi_improvements: PmsEvaluationResultImprovement[];
    competency_improvements: PmsEvaluationResultImprovement[];
}

export interface PmsEvaluationResultListParams {
    employee_id?: number;
    year_id?: number;
    year?: number | string;
    cycle_id?: number;
    cycle?: string;
    team_id?: number;
    department_id?: number;
    is_approved?: boolean;
    has_results?: boolean;
    limit?: number;
    offset?: number;
}

export const usePmsEvaluationResults = () => {
    const { request } = usePmsApi();

    const list = (params: PmsEvaluationResultListParams = {}) =>
        request<ListResponse<PmsEvaluationResultRow>>('/pms-evaluation-results', { query: params });

    const detail = (sendId: number) =>
        request<{ data: PmsEvaluationResultDetail }>(`/pms-evaluation-results/${sendId}`);

    return { list, detail };
};
