// =============================================================
// usePmsPositions — typed wrapper for /functions/v1/pms-positions
// (positions belong to a team; team belongs to a department)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsPosition {
    id: number;
    team_id: number;
    /** Joined fields (added by edge function) */
    team_name: string | null;
    team_code: string | null;
    department_id: number | null;
    department_name: string | null;
    department_code: string | null;
    name: string;
    code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsPositionListParams {
    team_id?: number;
    department_id?: number;
    /** Exact team name */
    team?: string;
    /** Exact department name */
    dept?: string;
    name?: string;
    code?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsPositionCreateBody {
    team_id: number;
    name: string;
    code: string;
    is_active?: boolean;
}

export type PmsPositionUpdateBody = Partial<PmsPositionCreateBody>;

export const usePmsPositions = () => {
    const { request } = usePmsApi();

    const list = (params: PmsPositionListParams = {}) =>
        request<ListResponse<PmsPosition>>('/pms-positions', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsPosition>>(`/pms-positions/${id}`);

    const create = (body: PmsPositionCreateBody) =>
        request<ItemResponse<PmsPosition>>('/pms-positions', { method: 'POST', body });

    const update = (id: number, body: PmsPositionUpdateBody) =>
        request<ItemResponse<PmsPosition>>(`/pms-positions/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsPosition }>(`/pms-positions/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
