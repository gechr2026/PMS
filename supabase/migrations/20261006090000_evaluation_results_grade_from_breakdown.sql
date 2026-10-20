-- Make final_total_score / final_grade for annual_supervisor sends use the same
-- calculation as usePmsScoreBreakdown (the headline box on /pms/evaluation/view
-- and /pms/summary/view), so the grade matches the score the user sees.
--
-- Before: final_total_score = the top supervisor's own total_score, where
-- pms_evaluation_upsert drops "ไม่สามารถประเมินได้" (selected_option = 0) items
-- and re-normalises the remaining weights. Send 378 showed 67.50 on screen but
-- was graded A from the manager's 85.00.
--
-- After (decided with the user 2026-10-06):
--   * every sent rater except self is averaged per item on the 1-5 scale;
--   * option 0, closed and unanswered rows are left out of that item's mean,
--     but the item keeps its weight, so an item nobody could rate earns nothing;
--   * section score = (Σ item mean × item weight) ÷ 5 × section header weight;
--   * a grade is still only given once a ceo/executive/manager has submitted
--     (sup.send_id IS NOT NULL), so the list keeps its "รอหัวหน้าประเมิน" state.
-- The score is rounded to 2 dp before grading because the grade bands are
-- 2-dp ranges with gaps between them (79.99 / 80.00).
-- final_recommendation still comes from the top supervisor.

CREATE OR REPLACE VIEW public.pms_evaluation_results_v AS
 WITH send_assessments AS (
         SELECT DISTINCT pms_assessment_send_raters.send_id,
            pms_assessment_send_raters.assessment_id
           FROM pms_assessment_send_raters
          WHERE pms_assessment_send_raters.is_active = true
        UNION
         SELECT DISTINCT pms_evaluations.send_id,
            pms_evaluations.assessment_id
           FROM pms_evaluations
        ), role_agg AS (
         SELECT pms_evaluation_per_role_v.send_id,
            pms_evaluation_per_role_v.assessment_id,
            avg(pms_evaluation_per_role_v.kpi_mean) AS avg_kpi_score,
            avg(pms_evaluation_per_role_v.competency_mean) AS avg_competency_score,
            avg(pms_evaluation_per_role_v.total_mean) AS avg_total_score,
            sum(pms_evaluation_per_role_v.submitted_count) AS submitted_count,
            sum(pms_evaluation_per_role_v.rater_count) AS expected_count,
            bool_or(pms_evaluation_per_role_v.has_approved) AS is_approved
           FROM pms_evaluation_per_role_v
          GROUP BY pms_evaluation_per_role_v.send_id, pms_evaluation_per_role_v.assessment_id
        ), role_agg_excl_self AS (
         SELECT pms_evaluation_per_role_v.send_id,
            pms_evaluation_per_role_v.assessment_id,
            avg(pms_evaluation_per_role_v.kpi_mean) AS avg_kpi_excl_self,
            avg(pms_evaluation_per_role_v.competency_mean) AS avg_comp_excl_self
           FROM pms_evaluation_per_role_v
          WHERE pms_evaluation_per_role_v.evaluator_role <> 'self'::pms_evaluation_role
          GROUP BY pms_evaluation_per_role_v.send_id, pms_evaluation_per_role_v.assessment_id
        ), supervisor_pick AS (
         SELECT DISTINCT ON (pr.send_id, pr.assessment_id) pr.send_id,
            pr.assessment_id,
            pr.total_mean AS final_total_score,
            pr.recommendation_latest AS final_recommendation
           FROM pms_evaluation_per_role_v pr
          WHERE pr.submitted_count > 0 AND (pr.evaluator_role = ANY (ARRAY['ceo'::pms_evaluation_role, 'executive'::pms_evaluation_role, 'manager'::pms_evaluation_role]))
          ORDER BY pr.send_id, pr.assessment_id, (
                CASE pr.evaluator_role
                    WHEN 'ceo'::pms_evaluation_role THEN 1
                    WHEN 'executive'::pms_evaluation_role THEN 2
                    WHEN 'manager'::pms_evaluation_role THEN 3
                    ELSE NULL::integer
                END)
        ), self_pick AS (
         SELECT pr.send_id,
            pr.assessment_id,
            pr.total_mean AS final_total_score,
            pr.recommendation_latest AS final_recommendation
           FROM pms_evaluation_per_role_v pr
          WHERE pr.evaluator_role = 'self'::pms_evaluation_role AND pr.submitted_count > 0
        ), non_self_breakdown AS (
         SELECT sa_1.send_id,
            sa_1.assessment_id,
            COALESCE(( SELECT sum(ia.avg_opt * k.weight) AS sum
                   FROM pms_assessment_kpis k
                     CROSS JOIN LATERAL ( SELECT avg(s_1.selected_option) AS avg_opt
                           FROM pms_evaluation_kpi_scores s_1
                             JOIN pms_evaluations e ON e.id = s_1.evaluation_id
                          WHERE e.send_id = sa_1.send_id AND e.status = 'sent'::pms_evaluation_status AND e.evaluator_role <> 'self'::pms_evaluation_role AND s_1.kpi_id = k.id AND s_1.is_closed IS NOT TRUE AND s_1.selected_option <> 0) ia
                  WHERE k.assessment_id = sa_1.assessment_id), 0::numeric) AS kpi_subtotal,
            COALESCE(( SELECT sum(ia.avg_opt * c_1.weight) AS sum
                   FROM pms_assessment_competencies c_1
                     CROSS JOIN LATERAL ( SELECT avg(s_1.selected_option) AS avg_opt
                           FROM pms_evaluation_competency_scores s_1
                             JOIN pms_evaluations e ON e.id = s_1.evaluation_id
                          WHERE e.send_id = sa_1.send_id AND e.status = 'sent'::pms_evaluation_status AND e.evaluator_role <> 'self'::pms_evaluation_role AND s_1.competency_id = c_1.id AND s_1.is_closed IS NOT TRUE AND s_1.selected_option <> 0) ia
                  WHERE c_1.assessment_id = sa_1.assessment_id), 0::numeric) AS competency_subtotal
           FROM send_assessments sa_1
        )
 SELECT s.id AS send_id,
    sa.assessment_id,
    s.employee_id,
    s.status AS send_status,
    a.name AS assessment_name,
    a.type AS assessment_type,
    a.year_id,
    a.cycle_id,
    a.kpi_weight,
    a.competency_weight,
    a.criteria_id,
    y.year,
    c.cycle_label,
    em.emp_code,
    em.full_name AS employee_name,
    s.position_id_snapshot AS employee_position_id,
    pos.name AS position_name,
    pos.code AS position_code,
    s.team_id_snapshot AS team_id,
    tm.name AS team_name,
    s.department_id_snapshot AS department_id,
    dp.name AS department_name,
    s.level_id_snapshot AS level_id,
    lv.name AS level_name,
    round(ra.avg_kpi_score, 2) AS avg_kpi_score,
    round(ra.avg_competency_score, 2) AS avg_competency_score,
    round(ra.avg_total_score, 2) AS avg_total_score,
    round(
        CASE a.type
            WHEN 'annual_supervisor'::pms_assessment_type THEN
            CASE WHEN sup.send_id IS NOT NULL THEN nsb.kpi_subtotal / 5::numeric * a.kpi_weight + nsb.competency_subtotal / 5::numeric * a.competency_weight ELSE NULL::numeric END
            WHEN 'annual_self'::pms_assessment_type THEN slf.final_total_score
            WHEN 'competency_360'::pms_assessment_type THEN ra.avg_total_score
            ELSE NULL::numeric
        END, 2) AS final_total_score,
        CASE a.type
            WHEN 'annual_supervisor'::pms_assessment_type THEN sup.final_recommendation
            WHEN 'annual_self'::pms_assessment_type THEN slf.final_recommendation
            ELSE NULL::smallint
        END AS final_recommendation,
    ra.submitted_count,
    ra.expected_count,
    ra.is_approved,
    pms_grade_for_score(a.criteria_id, round(
        CASE a.type
            WHEN 'annual_supervisor'::pms_assessment_type THEN
            CASE WHEN sup.send_id IS NOT NULL THEN nsb.kpi_subtotal / 5::numeric * a.kpi_weight + nsb.competency_subtotal / 5::numeric * a.competency_weight ELSE NULL::numeric END
            WHEN 'annual_self'::pms_assessment_type THEN slf.final_total_score
            WHEN 'competency_360'::pms_assessment_type THEN ra.avg_total_score
            ELSE NULL::numeric
        END, 2)) AS final_grade,
    round(raex.avg_kpi_excl_self, 2) AS avg_kpi_excl_self,
    round(raex.avg_comp_excl_self, 2) AS avg_comp_excl_self,
        CASE
            WHEN raex.avg_kpi_excl_self IS NOT NULL OR raex.avg_comp_excl_self IS NOT NULL THEN round(COALESCE(raex.avg_kpi_excl_self, 0::numeric) * a.kpi_weight / 100::numeric + COALESCE(raex.avg_comp_excl_self, 0::numeric) * a.competency_weight / 100::numeric, 2)
            ELSE NULL::numeric
        END AS score_100
   FROM pms_assessment_sends s
     JOIN send_assessments sa ON sa.send_id = s.id
     JOIN pms_assessments a ON a.id = sa.assessment_id
     LEFT JOIN pms_years y ON y.id = a.year_id
     LEFT JOIN pms_cycles c ON c.id = a.cycle_id
     LEFT JOIN pms_employees em ON em.id = s.employee_id
     LEFT JOIN pms_positions pos ON pos.id = s.position_id_snapshot
     LEFT JOIN pms_teams tm ON tm.id = s.team_id_snapshot
     LEFT JOIN pms_departments dp ON dp.id = s.department_id_snapshot
     LEFT JOIN pms_levels lv ON lv.id = s.level_id_snapshot
     LEFT JOIN role_agg ra ON ra.send_id = s.id AND ra.assessment_id = sa.assessment_id
     LEFT JOIN role_agg_excl_self raex ON raex.send_id = s.id AND raex.assessment_id = sa.assessment_id
     LEFT JOIN supervisor_pick sup ON sup.send_id = s.id AND sup.assessment_id = sa.assessment_id
     LEFT JOIN self_pick slf ON slf.send_id = s.id AND slf.assessment_id = sa.assessment_id
     LEFT JOIN non_self_breakdown nsb ON nsb.send_id = s.id AND nsb.assessment_id = sa.assessment_id;
