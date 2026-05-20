// =============================================================
// usePmsDepartments — typed wrapper for /functions/v1/pms-departments
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsDepartment {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsDepartmentListParams {
    name?: string;
    code?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsDepartmentCreateBody {
    name: string;
    code: string;
    is_active?: boolean;
}

export type PmsDepartmentUpdateBody = Partial<PmsDepartmentCreateBody>;

export const usePmsDepartments = () => {
    const { request } = usePmsApi();

    const list = (params: PmsDepartmentListParams = {}) =>
        request<ListResponse<PmsDepartment>>('/pms-departments', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsDepartment>>(`/pms-departments/${id}`);

    const create = (body: PmsDepartmentCreateBody) =>
        request<ItemResponse<PmsDepartment>>('/pms-departments', { method: 'POST', body });

    const update = (id: number, body: PmsDepartmentUpdateBody) =>
        request<ItemResponse<PmsDepartment>>(`/pms-departments/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsDepartment }>(`/pms-departments/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
