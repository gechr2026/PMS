// =============================================================
// usePmsCycles — typed wrapper for /functions/v1/pms-cycles
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsCycle {
    id: number;
    year_id: number;
    /** Joined year value from pms_years (added by edge function) */
    year: number | null;
    cycle_label: string;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsCycleListParams {
    year_id?: number;
    /** Filter by year value (e.g. 2569) — API will JOIN through pms_years */
    year?: number | string;
    /** Substring match on cycle_label */
    cycle?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsCycleCreateBody {
    year_id: number;
    cycle_label: string;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}

export type PmsCycleUpdateBody = Partial<PmsCycleCreateBody>;

export const usePmsCycles = () => {
    const { request } = usePmsApi();

    const list = (params: PmsCycleListParams = {}) =>
        request<ListResponse<PmsCycle>>('/pms-cycles', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsCycle>>(`/pms-cycles/${id}`);

    const create = (body: PmsCycleCreateBody) =>
        request<ItemResponse<PmsCycle>>('/pms-cycles', { method: 'POST', body });

    const update = (id: number, body: PmsCycleUpdateBody) =>
        request<ItemResponse<PmsCycle>>(`/pms-cycles/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsCycle }>(`/pms-cycles/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
