// =============================================================
// usePmsCompare — typed wrapper for /functions/v1/pms-compare
// =============================================================

export interface PmsComparePickerEmployee {
    id: number;
    emp_code: string | null;
    full_name: string | null;
    username: string | null;
    is_active: boolean;
    position_id: number | null;
    position_name: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    level_id: number | null;
    level_name: string | null;
    /** "GEC003 — อรุณ มีชัย" */
    label: string;
}

export interface PmsComparePickerResponse {
    data: PmsComparePickerEmployee[];
    count: number | null;
    limit: number;
}

export interface PmsCompareEmployeeMeta {
    id: number;
    emp_code: string | null;
    full_name: string | null;
    username: string | null;
    is_active: boolean;
    level_id: number | null;
    level_name: string | null;
}

export interface PmsCompareRow {
    send_id: number;
    year_id: number | null;
    cycle_id: number | null;
    year: number | null;
    cycle_label: string | null;
    avg_kpi_score: number | null;
    avg_competency_score: number | null;
    avg_total_score: number | null;
    final_total_score: number | null;
    final_grade: string | null;
    final_recommendation: number | null;
    submitted_count: number | null;
    is_approved: boolean | null;
    assessment_id: number;
    assessment_name: string | null;
    /** Derived from final_recommendation === 1 */
    promoted: boolean;
}

export interface PmsCompareResponse {
    employee: PmsCompareEmployeeMeta;
    data: PmsCompareRow[];
    count: number | null;
    limit: number;
    offset: number;
}

export interface PmsComparePickerParams {
    q?: string;
    limit?: number;
    active?: boolean;
}

export interface PmsCompareParams {
    year?: number | string;
    limit?: number;
    offset?: number;
}

export const usePmsCompare = () => {
    const { request } = usePmsApi();

    /** Search employees for the picker dropdown (by emp_code OR full_name) */
    const searchEmployees = (params: PmsComparePickerParams = {}) => {
        const q: Record<string, string | number | boolean | undefined> = {};
        if (params.q) q.q = params.q;
        if (params.limit !== undefined) q.limit = params.limit;
        if (params.active !== undefined) q.active = params.active;
        return request<PmsComparePickerResponse>('/pms-compare/employees', { query: q });
    };

    /** Get historical comparison rows for an employee */
    const get = (employeeId: number, params: PmsCompareParams = {}) =>
        request<PmsCompareResponse>(`/pms-compare/${employeeId}`, { query: params });

    return { searchEmployees, get };
};
