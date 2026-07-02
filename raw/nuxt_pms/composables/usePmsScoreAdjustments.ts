// =============================================================
// usePmsScoreAdjustments — typed wrapper for /functions/v1/pms-score-adjustments
// =============================================================
import type { ListResponse } from './usePmsApi';

/** Raw adjustment row (one revision) from pms_score_adjustments */
export interface PmsScoreAdjustmentRow {
    id: number;
    send_id: number;
    revision: number;
    orig_kpi: number | null;
    orig_comp: number | null;
    orig_score_100: number | null;
    kpi_weight: number;
    comp_weight: number;
    kpi_adjusted: number;
    comp_adjusted: number;
    score_100_adjusted: number;
    comment: string;
    adjusted_by: string;
    adjusted_at: string;
}

/** Merged row returned by GET list: pms_evaluation_results_v fields + nested latest adjustment */
export interface PmsScoreAdjustmentListRow {
    send_id: number;
    assessment_id: number | null;
    employee_id: number | null;
    send_status: string | null;
    year_id: number | null;
    cycle_id: number | null;
    year: number | null;
    cycle_label: string | null;
    assessment_name: string | null;
    emp_code: string | null;
    employee_name: string | null;
    employee_position_id: number | null;
    position_name: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    level_id: number | null;
    level_name: string | null;
    kpi_weight: number | null;
    competency_weight: number | null;
    avg_kpi_excl_self: number | null;
    avg_comp_excl_self: number | null;
    score_100: number | null;
    submitted_count: number | null;
    is_approved: boolean | null;
    /** Latest revision for this send_id, or null if never adjusted */
    adjustment: PmsScoreAdjustmentRow | null;
}

export interface PmsScoreAdjustmentListParams {
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    limit?: number;
    offset?: number;
}

export interface PmsScoreAdjustmentCreateBody {
    send_id: number;
    kpi_adjusted: number;   // สเกล 0-100 (UI ส่ง kpiInput × 20)
    comp_adjusted: number;  // สเกล 0-100 (UI ส่ง compInput × 20)
    comment: string;
}

export const usePmsScoreAdjustments = () => {
    const { request } = usePmsApi();

    /** GET list — report rows + latest revision per send_id */
    const list = (params: PmsScoreAdjustmentListParams = {}) =>
        request<ListResponse<PmsScoreAdjustmentListRow>>('/pms-score-adjustments', { query: params });

    /** GET all revisions for a send_id (newest first) */
    const listRevisions = (send_id: number) =>
        request<{ data: PmsScoreAdjustmentRow[] }>('/pms-score-adjustments', {
            query: { history_for: send_id },
        });

    /** POST — create a new revision */
    const createRevision = (body: PmsScoreAdjustmentCreateBody) =>
        request<{ data: PmsScoreAdjustmentRow }>('/pms-score-adjustments', {
            method: 'POST',
            body,
        });

    return { list, listRevisions, createRevision };
};
