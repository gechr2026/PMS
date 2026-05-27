// =============================================================
// usePmsSends — typed wrapper for /functions/v1/pms-sends
// =============================================================
// Schema migrated 2026-05-22: pms_assessment_sends.assessment_id removed.
// A send is now (employee × cycle). The assessment(s) live on each rater row.
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export type PmsSendStatus =
    | 'pending'
    | 'sent'
    | 'opened'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

/** Sub-array entry — one per distinct assessment referenced by the send's raters */
export interface PmsSendAssessment {
    id: number;
    name: string | null;
    type: 'annual_supervisor' | 'competency_360' | 'annual_self' | null;
}

export interface PmsSend {
    id: number;
    cycle_id: number;
    employee_id: number;
    status: PmsSendStatus;
    sent_at: string | null;
    opened_at: string | null;
    completed_at: string | null;
    note: string | null;
    is_active: boolean;
    position_id_snapshot: number | null;
    level_id_snapshot: number | null;
    team_id_snapshot: number | null;
    department_id_snapshot: number | null;
    created_at: string;
    updated_at: string;
    /** Joined display fields (cycle side) */
    cycle_label: string | null;
    cycle_start_date: string | null;
    cycle_end_date: string | null;
    year_id: number | null;
    year: number | null;
    /** Joined display fields (employee side) */
    emp_code: string | null;
    full_name: string | null;
    username: string | null;
    employee_position_name: string | null;
    employee_team_id: number | null;
    employee_team_name: string | null;
    employee_department_id: number | null;
    employee_department_name: string | null;
    employee_level_name: string | null;
    /** Assessments referenced by this send's raters (distinct, may be empty if no raters yet) */
    assessments: PmsSendAssessment[];
    assessment_count: number;
    primary_assessment_name: string | null;
    primary_assessment_type: PmsSendAssessment['type'];
    /** Populated by the API only when listed with `as_rater='me'`: the
     *  specific assessment the current user is assigned to rate on this
     *  send (vs `primary_assessment_*` which is just the send's first
     *  assessment regardless of rater). */
    my_rater_assessment_id?: number | null;
    my_rater_assessment_name?: string | null;
    my_rater_assessment_type?: PmsSendAssessment['type'];
    my_rater_evaluator_role?: PmsEvaluatorRole | null;
}

export type PmsEvaluatorRole = 'self' | 'manager' | 'executive' | 'ceo' | 'peer' | 'subordinate';

export interface PmsSendListParams {
    cycle_id?: number;
    employee_id?: number;
    status?: PmsSendStatus;
    is_active?: boolean;
    year_id?: number;
    /** Numeric year value (e.g. 2569) */
    year?: number | string;
    /** Cycle label (e.g. "1/2569") */
    cycle?: string;
    position_id?: number;
    level_id?: number;
    emp_code?: string;
    full_name?: string;
    /** Restrict list to sends where the current user is a rater. Use with evaluator_role. */
    as_rater?: 'me';
    /** Combine with as_rater='me' to scope to a specific evaluator role. */
    evaluator_role?: PmsEvaluatorRole;
    limit?: number;
    offset?: number;
}

export interface PmsSendCreateBody {
    cycle_id: number;
    employee_id: number;
    note?: string | null;
    status?: PmsSendStatus;
}

export interface PmsSendBulkByEmployeeIdsBody {
    cycle_id: number;
    employee_ids: number[];
    note?: string | null;
    status?: PmsSendStatus;
}

export interface PmsSendBulkResponse {
    data: PmsSend[];
    inserted: number;
    skipped?: number;
}

export interface PmsSendUpdateBody {
    cycle_id?: number;
    employee_id?: number;
    status?: PmsSendStatus;
    sent_at?: string | null;
    opened_at?: string | null;
    completed_at?: string | null;
    note?: string | null;
    is_active?: boolean;
}

export const usePmsSends = () => {
    const { request } = usePmsApi();

    const list = (params: PmsSendListParams = {}) =>
        request<ListResponse<PmsSend>>('/pms-sends', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsSend>>(`/pms-sends/${id}`);

    const create = (body: PmsSendCreateBody) =>
        request<ItemResponse<PmsSend>>('/pms-sends', { method: 'POST', body });

    /** Bulk fan-out: same cycle → multiple employees */
    const bulkByEmployees = (body: PmsSendBulkByEmployeeIdsBody) =>
        request<PmsSendBulkResponse>('/pms-sends', { method: 'POST', body });

    const update = (id: number, body: PmsSendUpdateBody) =>
        request<ItemResponse<PmsSend>>(`/pms-sends/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; cycle_id: number; employee_id: number } }>(
            `/pms-sends/${id}`,
            { method: 'DELETE' }
        );

    /** Workflow action endpoints */
    const sendNow  = (id: number) => request<ItemResponse<PmsSend>>(`/pms-sends/${id}/send`,     { method: 'POST' });
    const open     = (id: number) => request<ItemResponse<PmsSend>>(`/pms-sends/${id}/open`,     { method: 'POST' });
    const complete = (id: number) => request<ItemResponse<PmsSend>>(`/pms-sends/${id}/complete`, { method: 'POST' });
    const cancel   = (id: number) => request<ItemResponse<PmsSend>>(`/pms-sends/${id}/cancel`,   { method: 'POST' });

    return { list, get, create, bulkByEmployees, update, remove, sendNow, open, complete, cancel };
};
