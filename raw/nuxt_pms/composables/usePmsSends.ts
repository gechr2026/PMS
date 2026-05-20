// =============================================================
// usePmsSends — typed wrapper for /functions/v1/pms-sends
// (junction: assessment ↔ employee + status workflow)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export type PmsSendStatus =
    | 'pending'
    | 'sent'
    | 'opened'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export interface PmsSend {
    id: number;
    assessment_id: number;
    employee_id: number;
    status: PmsSendStatus;
    sent_at: string | null;
    opened_at: string | null;
    completed_at: string | null;
    note: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    /** Joined display fields (assessment side) */
    assessment_name: string | null;
    year: number | null;
    cycle_label: string | null;
    cycle_start_date: string | null;
    cycle_end_date: string | null;
    assessment_position_name: string | null;
    assessment_team_id: number | null;
    assessment_team_name: string | null;
    assessment_department_id: number | null;
    assessment_department_name: string | null;
    assessment_level_name: string | null;
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
}

export interface PmsSendListParams {
    assessment_id?: number;
    employee_id?: number;
    status?: PmsSendStatus;
    is_active?: boolean;
    year_id?: number;
    cycle_id?: number;
    /** Numeric year value (e.g. 2569) */
    year?: number | string;
    /** Cycle label (e.g. "1/2569") */
    cycle?: string;
    department_id?: number;
    dept?: string;
    team_id?: number;
    team?: string;
    position_id?: number;
    position?: string;
    level_id?: number;
    level?: string;
    emp_code?: string;
    full_name?: string;
    assessment_name?: string;
    limit?: number;
    offset?: number;
}

export interface PmsSendCreateBody {
    assessment_id: number;
    employee_id: number;
    note?: string | null;
    status?: PmsSendStatus;
}

export interface PmsSendBulkByEmployeeIdsBody {
    assessment_id: number;
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
    assessment_id?: number;
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

    /** Bulk fan-out: same assessment → multiple employees */
    const bulkByEmployees = (body: PmsSendBulkByEmployeeIdsBody) =>
        request<PmsSendBulkResponse>('/pms-sends', { method: 'POST', body });

    const update = (id: number, body: PmsSendUpdateBody) =>
        request<ItemResponse<PmsSend>>(`/pms-sends/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; assessment_id: number; employee_id: number } }>(
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
