// =============================================================
// usePmsAssessments — typed wrapper for /functions/v1/pms-assessments
// (atomic save: header + KPIs + competencies via RPC)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsAssessmentKpi {
    id?: number;
    sort_order: number;
    subject: string;
    detail: string | null;
    weight: number;
    target: string | null;
    options: string[];
}

export interface PmsAssessmentCompetency {
    id?: number;
    sort_order: number;
    subject: string;
    weight: number;
    target: string | null;
    options: string[];
}

export interface PmsAssessment {
    id: number;
    name: string;
    /** Document classification */
    type: 'annual_supervisor' | 'competency_360' | 'annual_self';
    year_id: number;
    cycle_id: number;
    position_id: number;
    level_id: number | null;
    criteria_id: number | null;
    kpi_weight: number;
    competency_weight: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    /** Joined display fields */
    year: number | null;
    cycle_label: string | null;
    cycle_start_date: string | null;
    cycle_end_date: string | null;
    position_name: string | null;
    position_code: string | null;
    team_id: number | null;
    team_name: string | null;
    team_code: string | null;
    department_id: number | null;
    department_name: string | null;
    department_code: string | null;
    level_name: string | null;
    level_sort_order: number | null;
    criteria_name: string | null;
    /** Only present in detail/get + after upsert (not in list) */
    kpis?: PmsAssessmentKpi[];
    competencies?: PmsAssessmentCompetency[];
}

export interface PmsAssessmentListParams {
    name?: string;
    year_id?: number;
    cycle_id?: number;
    position_id?: number;
    team_id?: number;
    department_id?: number;
    level_id?: number;
    criteria_id?: number;
    /** Exact name filters */
    year?: number | string;
    cycle?: string;
    position?: string;
    team?: string;
    dept?: string;
    level?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsAssessmentSaveBody {
    name?: string;
    type?: 'annual_supervisor' | 'competency_360' | 'annual_self';
    year_id?: number;
    cycle_id?: number;
    position_id?: number;
    level_id?: number | null;
    criteria_id?: number | null;
    kpi_weight?: number;
    competency_weight?: number;
    is_active?: boolean;
    /** Pass to replace KPIs atomically; omit to keep existing */
    kpis?: Array<Omit<PmsAssessmentKpi, 'id'>>;
    /** Pass to replace competencies atomically; omit to keep existing */
    competencies?: Array<Omit<PmsAssessmentCompetency, 'id'>>;
}

export const usePmsAssessments = () => {
    const { request } = usePmsApi();

    const list = (params: PmsAssessmentListParams = {}) =>
        request<ListResponse<PmsAssessment>>('/pms-assessments', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsAssessment>>(`/pms-assessments/${id}`);

    /** Create — required: name, year_id, cycle_id, position_id */
    const create = (
        body: PmsAssessmentSaveBody & {
            name: string;
            year_id: number;
            cycle_id: number;
            position_id: number;
        }
    ) => request<ItemResponse<PmsAssessment>>('/pms-assessments', { method: 'POST', body });

    const update = (id: number, body: PmsAssessmentSaveBody) =>
        request<ItemResponse<PmsAssessment>>(`/pms-assessments/${id}`, {
            method: 'PATCH',
            body,
        });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; name: string } }>(
            `/pms-assessments/${id}`,
            { method: 'DELETE' }
        );

    return { list, get, create, update, remove };
};
