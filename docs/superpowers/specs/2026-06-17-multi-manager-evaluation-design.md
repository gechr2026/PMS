# Design: Multi-Manager Evaluation Support

**Date:** 2026-06-17  
**Status:** Approved  
**Scope:** `pms/assigned/view` — หน้าทำแบบประเมิน (rater view)

---

## Problem

เมื่อ send มี `evaluator_role = 'manager'` มากกว่า 1 คน (เช่น อัจรีย์ + กมลวรรณ ประเมินชนิดาพร้อมกัน):

1. **Bug**: `view.vue` ใช้ `getEvalByRole('manager')` โดยไม่กรอง `evaluator_employee_id` → `.find()` คืน eval ของ manager คนแรก (กมลวรรณ, status=`sent`) → `isSent=true` → ปุ่มของ manager คนที่สอง (อัจรีย์) ถูก disable
2. **Executive view**: แสดงคะแนน manager แค่คนแรก — ต้องการ average ของทุก manager

---

## Root Cause

**DB ถูกต้องแล้ว** — unique constraint: `UNIQUE(send_id, evaluator_employee_id, evaluator_role, assessment_id)` รองรับ multi-manager โดยไม่ต้องเปลี่ยน schema

**Bug อยู่ใน frontend เท่านั้น:**

```ts
// view.vue:540 — ไม่กรอง evaluator_employee_id
allEvaluations.value.find(e => e.evaluator_role === role && ...)
```

---

## Approach: Frontend fix + minimal backend enhancement

### Backend — `supabase/functions/pms-evaluations/index.ts`

เพิ่ม join evaluator name ใน `SELECT_DETAIL`:
```
evaluator:pms_employees!pms_evaluations_evaluator_employee_id_fkey(emp_code, full_name)
```
เพื่อให้ `bySend()` คืนชื่อ evaluator มาด้วย → ใช้แสดงในตาราง "ข้อเสนอเพื่อพิจารณา"

### Type — `usePmsEvaluations.ts`

เพิ่ม `evaluator` field ใน `PmsEvaluation`:
```ts
evaluator?: { emp_code: string | null; full_name: string | null } | null;
```

### Frontend — `view.vue`

1. เพิ่ม `myEmpId = ref<number | null>(null)`
2. ใน `loadAll()` — store `myEmpId.value = meRow?.id` หลัง resolve employee
3. แก้ `getEvalByRole(role, empId?)` — เพิ่ม optional `empId` filter
4. `applyMyEvaluationToRows()` — เรียก `getEvalByRole(evaluatorRole.value, myEmpId.value)`
5. `assessment.status` — เรียก `getEvalByRole(evaluatorRole.value, myEmpId.value)`
6. `applyManagerScoresForExecutive()` — aggregate ทุก manager:
   - KPI/Competency: average `selected_option` ข้าม managers (ข้าม 0=N/A)
   - Proposals: 1 row ต่อ manager ที่มี recommendation (แสดงชื่อจาก `evaluator` field)

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/pms-evaluations/index.ts` | เพิ่ม evaluator join ใน SELECT_DETAIL |
| `raw/nuxt_pms/composables/usePmsEvaluations.ts` | เพิ่ม `evaluator` field ใน PmsEvaluation |
| `raw/nuxt_pms/pages/pms/assigned/view.vue` | fix getEvalByRole, myEmpId, average manager scores |

---

## Out of Scope

- ไม่แก้ admin view สำหรับ multi-manager (admin เห็น eval manager คนแรกอยู่ — known limitation)
- ไม่เปลี่ยน schema / RLS
- ไม่แก้ ACL
