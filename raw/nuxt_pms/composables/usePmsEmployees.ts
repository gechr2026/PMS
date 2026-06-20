// =============================================================
// usePmsEmployees — typed wrapper for /functions/v1/pms-employees
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsEmployee {
    id: number;
    username: string;
    emp_code: string;
    national_id: string | null;
    full_name: string;
    position_id: number;
    level_id: number | null;
    supervisor_id: number | null;
    auth_user_id: string | null;
    is_active: boolean;
    /** Joined fields (added by edge function) */
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
    supervisor_name: string | null;
    supervisor_emp_code: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsEmployeeListParams {
    username?: string;
    emp_code?: string;
    full_name?: string;
    position_id?: number;
    team_id?: number;
    department_id?: number;
    level_id?: number;
    /** Exact name filters (alternative to *_id) */
    position?: string;
    team?: string;
    dept?: string;
    level?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsEmployeeCreateBody {
    username: string;
    emp_code: string;
    full_name: string;
    position_id: number;
    national_id?: string | null;
    level_id?: number | null;
    supervisor_id?: number | null;
    auth_user_id?: string | null;
    is_active?: boolean;
}

export type PmsEmployeeUpdateBody = Partial<PmsEmployeeCreateBody>;

export interface PmsEmployeeBulkResponse {
    data: PmsEmployee[];
    inserted: number;
    skipped?: number;
}

export const usePmsEmployees = () => {
    const { request } = usePmsApi();

    const list = (params: PmsEmployeeListParams = {}) =>
        request<ListResponse<PmsEmployee>>('/pms-employees', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsEmployee>>(`/pms-employees/${id}`);

    const create = (body: PmsEmployeeCreateBody) =>
        request<ItemResponse<PmsEmployee>>('/pms-employees', { method: 'POST', body });

    /** Bulk create — accepts an items array, edge function returns inserted count */
    const bulkCreate = (items: PmsEmployeeCreateBody[]) =>
        request<PmsEmployeeBulkResponse>('/pms-employees', { method: 'POST', body: { items } });

    const update = (id: number, body: PmsEmployeeUpdateBody) =>
        request<ItemResponse<PmsEmployee>>(`/pms-employees/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsEmployee }>(`/pms-employees/${id}`, { method: 'DELETE' });

    return { list, get, create, bulkCreate, update, remove };
};
