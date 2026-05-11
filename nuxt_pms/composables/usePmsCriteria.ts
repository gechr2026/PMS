// =============================================================
// usePmsCriteria — typed wrapper for /functions/v1/pms-criteria
// (atomic header + grades save via RPC pms_criteria_upsert)
// =============================================================
import type { ItemResponse, ListResponse } from './usePmsApi';

export interface PmsCriteriaGrade {
    id?: number;
    grade: string;
    /** min_score is numeric in DB; values arrive as JSON numbers */
    min_score: number;
    max_score: number;
    description: string | null;
    sort_order: number;
}

export interface PmsCriteria {
    id: number;
    name: string;
    is_active: boolean;
    /** Always present in detail/get; may be empty array */
    grades: PmsCriteriaGrade[];
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
}

export interface PmsCriteriaListParams {
    name?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}

/** Body for POST/PUT/PATCH — pass `grades` to replace the entire grade list atomically */
export interface PmsCriteriaSaveBody {
    name?: string;
    is_active?: boolean;
    grades?: Array<{
        grade: string;
        min_score: number;
        max_score: number;
        description?: string | null;
        sort_order?: number;
    }>;
}

export const usePmsCriteria = () => {
    const { request } = usePmsApi();

    const list = (params: PmsCriteriaListParams = {}) =>
        request<ListResponse<PmsCriteria>>('/pms-criteria', { query: params });

    const get = (id: number) =>
        request<ItemResponse<PmsCriteria>>(`/pms-criteria/${id}`);

    /** Create — `name` and `grades` are required */
    const create = (body: PmsCriteriaSaveBody & { name: string; grades: NonNullable<PmsCriteriaSaveBody['grades']> }) =>
        request<ItemResponse<PmsCriteria>>('/pms-criteria', { method: 'POST', body });

    /** Update — pass `grades` to replace; omit to keep existing */
    const update = (id: number, body: PmsCriteriaSaveBody) =>
        request<ItemResponse<PmsCriteria>>(`/pms-criteria/${id}`, { method: 'PATCH', body });

    const remove = (id: number) =>
        request<{ success: true; data: { id: number; name: string } }>(`/pms-criteria/${id}`, {
            method: 'DELETE',
        });

    return { list, get, create, update, remove };
};
