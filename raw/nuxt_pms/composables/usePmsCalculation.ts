// =============================================================
// usePmsCalculation — typed wrapper for /functions/v1/pms-calculation
// =============================================================
// One snapshot row is written each time an evaluation is saved
// (draft/submit/approve). The RPC behind it averages per-item scores
// across non-self raters, skipping N/A (selected_option=0) and
// manager-closed entries. See migration 2026-05-22_pms_calculation_log.
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export type PmsCalcTrigger = 'draft' | 'sent' | 'manual';

export interface PmsCalcBreakdownRow {
    evaluation_id: number;
    evaluator_role: string;
    selected_option: number | null;
    is_closed: boolean;
    /** Whether this rater's score for this item was counted in avg_score */
    counted: boolean;
}

export interface PmsCalcKpiItem {
    kpi_id: number;
    subject: string;
    /** Item weight 0..1 at snapshot time (pms_assessment_kpis.weight). Nullable on rows logged before 2026-05-23. */
    weight: number | null;
    /** Target option 1..5 at snapshot time (pms_assessment_kpis.target_option). Nullable on legacy rows. */
    target_option: number | null;
    /** Mean of selected_option across counted raters. null = 0 counted raters */
    avg_score: number | null;
    rater_count: number;
    breakdown: PmsCalcBreakdownRow[];
}

export interface PmsCalcCompetencyItem {
    competency_id: number;
    subject: string;
    /** Item weight 0..1 at snapshot time (pms_assessment_competencies.weight). Nullable on legacy rows. */
    weight: number | null;
    /** Target option 1..5 at snapshot time. Nullable on legacy rows. */
    target_option: number | null;
    avg_score: number | null;
    rater_count: number;
    breakdown: PmsCalcBreakdownRow[];
}

export interface PmsCalculationLog {
    id: number;
    send_id: number;
    assessment_id: number;
    evaluation_id: number | null;
    trigger_event: PmsCalcTrigger;
    kpi_items: PmsCalcKpiItem[];
    competency_items: PmsCalcCompetencyItem[];
    /** Assessment header KPI ratio (0..100) at snapshot time. Use with kpi_avg for weighted total. */
    assessment_kpi_weight: number | null;
    /** Assessment header Competency ratio (0..100) at snapshot time. */
    assessment_competency_weight: number | null;
    kpi_avg: number | null;
    competency_avg: number | null;
    kpi_rater_count: number;
    competency_rater_count: number;
    created_at: string;
    created_by: string | null;
}

export interface PmsCalcSnapshotBody {
    send_id: number;
    assessment_id: number;
    evaluation_id?: number | null;
    trigger?: PmsCalcTrigger;
}

export interface PmsCalcListParams {
    send_id?: number;
    assessment_id?: number;
    evaluation_id?: number;
    trigger?: PmsCalcTrigger;
    limit?: number;
    offset?: number;
}

export const usePmsCalculation = () => {
    const { request } = usePmsApi();

    /** Compute + persist a new snapshot. Returns the new log row. */
    const snapshot = (body: PmsCalcSnapshotBody) =>
        request<ItemResponse<PmsCalculationLog>>('/pms-calculation/snapshot', {
            method: 'POST',
            body,
        });

    /** Recent snapshots, most-recent first. */
    const list = (params: PmsCalcListParams = {}) =>
        request<ListResponse<PmsCalculationLog>>('/pms-calculation', { query: params });

    /** Read one snapshot by id. */
    const get = (id: number) =>
        request<ItemResponse<PmsCalculationLog>>(`/pms-calculation/${id}`);

    return { snapshot, list, get };
};
