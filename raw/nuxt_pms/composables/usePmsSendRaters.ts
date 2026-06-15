// =============================================================
// usePmsSendRaters — direct PostgREST access to pms_assessment_send_raters
// =============================================================
// The raters table is small and admin-managed; we use the supabase
// client directly rather than building yet another edge function.
// =============================================================
import type { PmsEvaluationRole } from './usePmsEvaluations';

export interface PmsSendRater {
    id: number;
    send_id: number;
    evaluator_employee_id: number;
    evaluator_role: PmsEvaluationRole;
    /** Assessment this rater is evaluating against (added 2026-05-22) */
    assessment_id: number;
    notified_at: string | null;
    completed_at: string | null;
    is_active: boolean;
    note: string | null;
    created_at: string;
    updated_at: string;
}

export interface PmsSendRaterCreate {
    send_id: number;
    evaluator_employee_id: number;
    evaluator_role: PmsEvaluationRole;
    assessment_id: number;
    note?: string | null;
}

export const usePmsSendRaters = () => {
    const supabase = useSupabase();

    /** List raters for one send, joined with employee meta */
    const listBySend = async (sendId: number) => {
        const { data, error } = await supabase
            .from('pms_assessment_send_raters')
            .select(
                'id, send_id, evaluator_employee_id, evaluator_role, assessment_id, ' +
                'notified_at, completed_at, is_active, note, created_at, updated_at, ' +
                'pms_employees:evaluator_employee_id(id, emp_code, full_name, username, ' +
                    'position_id, level_id, ' +
                    'pms_positions(name, code, team_id, pms_teams(name, department_id, pms_departments(name))), ' +
                    'pms_levels(name))'
            )
            .eq('send_id', sendId)
            .eq('is_active', true)
            .order('id', { ascending: true });
        if (error) throw error;
        return data ?? [];
    };

    /** Add a single rater */
    const create = async (body: PmsSendRaterCreate) => {
        const { data, error } = await supabase
            .from('pms_assessment_send_raters')
            .insert(body)
            .select('*')
            .single();
        if (error) throw error;
        return data;
    };

    /** Bulk add raters (atomic via single insert) */
    const bulkCreate = async (rows: PmsSendRaterCreate[]) => {
        if (rows.length === 0) return [];
        const { data, error } = await supabase
            .from('pms_assessment_send_raters')
            .insert(rows)
            .select('*');
        if (error) throw error;
        return data ?? [];
    };

    /** Remove an assignment and cascade-delete all evaluation data atomically */
    const remove = async (id: number) => {
        const { error } = await supabase.rpc('pms_remove_send_rater', { p_rater_id: id });
        if (error) throw error;
    };

    /** Mark a reminder email as sent */
    const markNotified = async (id: number) => {
        const { error } = await supabase
            .from('pms_assessment_send_raters')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    };

    /** Toggle is_active (soft-disable) */
    const setActive = async (id: number, active: boolean) => {
        const { error } = await supabase
            .from('pms_assessment_send_raters')
            .update({ is_active: active })
            .eq('id', id);
        if (error) throw error;
    };

    return { listBySend, create, bulkCreate, remove, markNotified, setActive };
};
