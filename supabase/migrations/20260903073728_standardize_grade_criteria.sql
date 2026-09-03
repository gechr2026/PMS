-- Standardize the grade scale across the system.
-- See docs/superpowers/specs/2026-09-03-grade-calculation-consolidation-design.md
-- and docs/superpowers/plans/2026-09-03-grade-calculation-consolidation.md (Task 1).
--
-- 79/80 assessments had no criteria_id, so grades were never computable in
-- practice. Creates one shared A/B+/B/C+/C/D+/D scale, deactivates the 3
-- unused legacy criteria sets, and points every assessment at it.

DO $mig$
DECLARE
    v_criteria_id BIGINT;
BEGIN
    INSERT INTO public.pms_criteria (name, is_active)
    VALUES ('เกณฑ์มาตรฐาน (A–D)', true)
    RETURNING id INTO v_criteria_id;

    INSERT INTO public.pms_criteria_grades
        (criteria_id, grade, min_score, max_score, sort_order, description)
    VALUES
        (v_criteria_id, 'A',  80.00, 100.00, 1, 'โดดเด่น: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ที่เกินความคาดหวังของงาน และขององค์กรอย่างโดดเด่น'),
        (v_criteria_id, 'B+', 75.00, 79.99,  2, 'ดีเยี่ยม: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ที่เกินความคาดหวังของงานอย่างดีเยี่ยม'),
        (v_criteria_id, 'B',  70.00, 74.99,  3, 'ดีมาก: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ที่เกินความคาดหวังของงานอย่างดีมาก'),
        (v_criteria_id, 'C+', 65.00, 69.99,  4, 'ดี: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ของงานได้ดีกว่ามาตรฐานที่คาดหวัง'),
        (v_criteria_id, 'C',  60.00, 64.99,  5, 'มาตรฐาน: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ตามความคาดหวังของงาน'),
        (v_criteria_id, 'D+', 55.00, 59.99,  6, 'ต้องปรับปรุง: บรรลุเป้าหมายการทำงานได้บางส่วน ยังไม่ถึงความคาดหวังของตำแหน่งงาน'),
        (v_criteria_id, 'D',   0.00, 54.99,  7, 'ต้องปรับปรุงอย่างมาก: ไม่สามารถบรรลุเป้าหมายการทำงานได้ตามความคาดหวังของตำแหน่งงาน');

    UPDATE public.pms_criteria
       SET is_active = false
     WHERE id IN (1, 2, 3);

    UPDATE public.pms_assessments
       SET criteria_id = v_criteria_id;
END
$mig$;
