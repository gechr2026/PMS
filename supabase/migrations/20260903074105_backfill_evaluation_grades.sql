-- One-time backfill: compute grade for sent evaluations saved before their
-- assessment had a criteria_id.
-- See docs/superpowers/plans/2026-09-03-grade-calculation-consolidation.md (Task 3).
--
-- pms_evaluation_upsert() only writes `grade` when a row is INSERTed or
-- UPDATEd, so it never recomputed automatically for rows that already
-- existed. 114 sent evaluations (with a non-null total_score) had grade=NULL
-- at the time this migration was written.

UPDATE public.pms_evaluations e
SET grade = public.pms_grade_for_score(a.criteria_id, e.total_score)
FROM public.pms_assessments a
WHERE a.id = e.assessment_id
  AND e.status = 'sent'
  AND e.total_score IS NOT NULL
  AND e.grade IS NULL;
