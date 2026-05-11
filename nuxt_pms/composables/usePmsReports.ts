// =============================================================
// usePmsReports — typed wrapper for /functions/v1/pms-reports
// =============================================================
import type { ListResponse } from './usePmsApi';

/** Flat row shape returned from pms_evaluation_results_v */
export interface PmsReportRow {
    send_id: number;
    assessment_id: number | null;
    employee_id: number | null;
    send_status: string | null;
    year_id: number | null;
    cycle_id: number | null;
    year: number | null;
    cycle_label: string | null;
    assessment_name: string | null;
    emp_code: string | null;
    employee_name: string | null;
    employee_position_id: number | null;
    position_name: string | null;
    position_code: string | null;
    team_id: number | null;
    team_name: string | null;
    department_id: number | null;
    department_name: string | null;
    level_id: number | null;
    level_name: string | null;
    avg_kpi_score: number | null;
    avg_competency_score: number | null;
    avg_total_score: number | null;
    final_total_score: number | null;
    final_grade: string | null;
    final_recommendation: number | null;
    submitted_count: number | null;
    is_approved: boolean | null;
}

export interface PmsReportListParams {
    /** ID filters */
    year_id?: number;
    cycle_id?: number;
    department_id?: number;
    team_id?: number;
    position_id?: number;
    level_id?: number;
    employee_id?: number;
    assessment_id?: number;
    /** Exact-name filters */
    year?: number | string;
    cycle?: string;
    dept?: string;
    team?: string;
    position?: string;
    level?: string;
    /** ilike search */
    emp_code?: string;
    full_name?: string;
    assessment_name?: string;
    /** Boolean filters */
    is_approved?: boolean;
    has_results?: boolean;
    /** Paging */
    limit?: number;
    offset?: number;
}

export const usePmsReports = () => {
    const { request } = usePmsApi();

    const list = (params: PmsReportListParams = {}) =>
        request<ListResponse<PmsReportRow>>('/pms-reports', { query: params });

    return { list };
};
