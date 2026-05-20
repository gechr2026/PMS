// =============================================================
// usePmsYears — typed wrapper for /functions/v1/pms-years
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsYear {
    id: number;
    year: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsYearListParams {
    year?: string | number;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsYearCreateBody {
    year: number;
    is_active?: boolean;
}

export type PmsYearUpdateBody = Partial<PmsYearCreateBody>;

export const usePmsYears = () => {
    const { request } = usePmsApi();

    const list = (params: PmsYearListParams = {}) =>
        request<ListResponse<PmsYear>>('/pms-years', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsYear>>(`/pms-years/${id}`);

    const create = (body: PmsYearCreateBody) =>
        request<ItemResponse<PmsYear>>('/pms-years', { method: 'POST', body });

    const update = (id: number, body: PmsYearUpdateBody) =>
        request<ItemResponse<PmsYear>>(`/pms-years/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsYear }>(`/pms-years/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
