// =============================================================
// usePmsLevels — typed wrapper for /functions/v1/pms-levels
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsLevel {
    id: number;
    name: string;
    /** Backend column is `sort_order` (the UI label is "การจัดเรียง") */
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsLevelListParams {
    name?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsLevelCreateBody {
    name: string;
    sort_order?: number;
    is_active?: boolean;
}

export type PmsLevelUpdateBody = Partial<PmsLevelCreateBody>;

export const usePmsLevels = () => {
    const { request } = usePmsApi();

    const list = (params: PmsLevelListParams = {}) =>
        request<ListResponse<PmsLevel>>('/pms-levels', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsLevel>>(`/pms-levels/${id}`);

    const create = (body: PmsLevelCreateBody) =>
        request<ItemResponse<PmsLevel>>('/pms-levels', { method: 'POST', body });

    const update = (id: number, body: PmsLevelUpdateBody) =>
        request<ItemResponse<PmsLevel>>(`/pms-levels/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsLevel }>(`/pms-levels/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
