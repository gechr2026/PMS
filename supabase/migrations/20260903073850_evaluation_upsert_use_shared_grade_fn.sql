-- Patch pms_evaluation_upsert() to call the shared pms_grade_for_score()
-- function instead of duplicating its query inline.
-- See docs/superpowers/plans/2026-09-03-grade-calculation-consolidation.md (Task 2).
--
-- Two code paths computed grades with the same query, coincidentally —
-- nothing guaranteed they'd stay in sync if either changed. Now there is
-- exactly one place in the system that maps a score to a grade.
--
-- This patches the live function definition (fetch -> replace exact block ->
-- re-execute) rather than restating the whole ~130-line function body, to
-- avoid a transcription slip in unrelated logic (RLS-equivalent checks,
-- score replacement, history snapshots). Guards make it fail loudly instead
-- of silently no-op or half-apply.

DO $mig$
DECLARE
    v_def    TEXT;
    v_anchor TEXT := '    IF v_total_score IS NOT NULL AND v_criteria_id IS NOT NULL THEN
        SELECT grade INTO v_grade FROM public.pms_criteria_grades
         WHERE criteria_id = v_criteria_id AND v_total_score BETWEEN min_score AND max_score
         ORDER BY sort_order LIMIT 1;
    END IF;';
    v_replacement TEXT := '    IF v_total_score IS NOT NULL AND v_criteria_id IS NOT NULL THEN
        v_grade := public.pms_grade_for_score(v_criteria_id, v_total_score);
    END IF;';
    v_hits INT;
BEGIN
    SELECT pg_get_functiondef(p.oid)
      INTO v_def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = 'pms_evaluation_upsert';

    IF v_def IS NULL THEN
        RAISE EXCEPTION 'pms_evaluation_upsert() not found — nothing to patch';
    END IF;

    IF position('pms_grade_for_score(v_criteria_id' IN v_def) > 0 THEN
        RAISE NOTICE 'pms_evaluation_upsert() already calls pms_grade_for_score() — skipping';
        RETURN;
    END IF;

    v_hits := (length(v_def) - length(replace(v_def, v_anchor, ''))) / length(v_anchor);
    IF v_hits <> 1 THEN
        RAISE EXCEPTION
            'expected exactly 1 inline grade lookup in pms_evaluation_upsert(), found % — refusing to patch',
            v_hits;
    END IF;

    v_def := replace(v_def, v_anchor, v_replacement);

    EXECUTE v_def;
END
$mig$;
