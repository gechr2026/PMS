-- Add supervisor_id (nullable self-referencing FK) to pms_employees
-- Used to record direct-report relationships and build org chart.
-- ON DELETE SET NULL: removing a supervisor clears the field on their reports.

ALTER TABLE pms_employees
  ADD COLUMN IF NOT EXISTS supervisor_id INT REFERENCES pms_employees(id) ON DELETE SET NULL;

COMMENT ON COLUMN pms_employees.supervisor_id IS 'ผู้บังคับบัญชา — nullable self-ref FK';
