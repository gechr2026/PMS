// =============================================================
// usePmsTeams — typed wrapper for /functions/v1/pms-teams
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsTeam {
    id: number;
    department_id: number;
    /** Joined from pms_departments by edge function */
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

export interface PmsTeamListParams {
    department_id?: number;
    /** Exact department name (e.g. "Business Generator") */
    dept?: string;
    name?: string;
    code?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

export interface PmsTeamCreateBody {
    department_id: number;
    name: string;
    code: string;
    is_active?: boolean;
}

export type PmsTeamUpdateBody = Partial<PmsTeamCreateBody>;

export const usePmsTeams = () => {
    const { request } = usePmsApi();

    const list = (params: PmsTeamListParams = {}) =>
        request<ListResponse<PmsTeam>>('/pms-teams', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsTeam>>(`/pms-teams/${id}`);

    const create = (body: PmsTeamCreateBody) =>
        request<ItemResponse<PmsTeam>>('/pms-teams', { method: 'POST', body });

    const update = (id: number, body: PmsTeamUpdateBody) =>
        request<ItemResponse<PmsTeam>>(`/pms-teams/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: PmsTeam }>(`/pms-teams/${id}`, { method: 'DELETE' });

    return { list, get, create, update, remove };
};
