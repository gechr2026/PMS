# Design: Standardize Grade Criteria Across the System

**Date:** 2026-09-03
**Status:** Approved
**Scope:** DB — `pms_criteria`/`pms_criteria_grades` data, `pms_evaluation_upsert()` RPC; Frontend — `pms/evaluation/view.vue`

---

## Problem

ผู้ใช้ขอให้หน้า "ผลการประเมิน" (`/pms/evaluation/view`) แสดงกล่องคำนวณเกรดตามเกณฑ์คะแนน 7 ระดับ (A/B+/B/C+/C/D+/D) และย้ำว่า **"กฏการคำนวณต้องเป็น logic เดียวกันทั้งระบบ"**

สำรวจพบว่าการคำนวณเกรดในระบบใช้งานไม่ได้จริงอยู่แล้ว:

- `pms_assessments.criteria_id` เป็น `NULL` ใน **79 จาก 80** แถว — assessment เกือบทั้งหมดไม่ได้ผูกเกณฑ์เกรดใดๆ เลย
- 3 ชุดเกณฑ์ที่มีอยู่ (`criteria_id` 1/2/3) คนละช่วงคะแนน คนละจำนวนระดับ (4 ระดับ, 3 ระดับ, 3 ระดับ) ไม่มีชุดไหนตรงกับตาราง 7 ระดับที่ผู้ใช้ต้องการ — และมีแค่ 1 assessment ที่ผูกกับชุดใดชุดหนึ่ง (`criteria_id=1`)
- **123 evaluation ที่ส่งแล้ว (`status='sent'`) มีเกรดเป็น `NULL` ทั้งหมด** เพราะบันทึกไปก่อนที่ assessment ของตัวเองจะมี `criteria_id`
- มีจุดคำนวณเกรดซ้ำกัน 2 ที่ในโค้ด: ฟังก์ชันกลาง `pms_grade_for_score(criteria_id, score)` (ที่ view `pms_evaluation_results_v` ใช้คำนวณเกรดรวมแบบสด) กับ inline query ใน RPC `pms_evaluation_upsert` (ที่บันทึกเกรดต่อผู้ประเมินตอนกด "ส่งแบบประเมิน") — logic บังเอิญตรงกันตอนนี้ แต่ไม่มีอะไรการันตีว่าจะตรงกันตลอดถ้ามีคนแก้ทีหลัง

งานนี้จึงไม่ใช่แค่เพิ่ม UI กล่องหนึ่ง แต่ต้องแก้ที่ต้นตอ (data + จุดคำนวณซ้ำ) เพื่อให้ "logic เดียวกันทั้งระบบ" เป็นจริง

---

## Decisions (confirmed with user)

1. **เกณฑ์ 7 ระดับ** — ไม่มีช่องว่างระหว่างระดับ:

   | เกรด | ช่วงคะแนน |
   |---|---|
   | A  | ≥ 80 |
   | B+ | 75 – 79.99 |
   | B  | 70 – 74.99 |
   | C+ | 65 – 69.99 |
   | C  | 60 – 64.99 |
   | D+ | 55 – 59.99 |
   | D  | 0 – 54.99 |

   (ผู้ใช้ให้มาเป็น "D+ 55–59 / D <54" ซึ่งมีช่องว่าง 54.00–54.99 ไม่มีเกรดครอบคลุม — ยืนยันกับผู้ใช้แล้วว่าแก้เป็น `D < 55` เพื่อไม่ให้มีช่องว่าง)

2. **เกณฑ์เดิม 3 ชุด** (`criteria_id` 1/2/3) — ปิดใช้งาน (`is_active = false`) ไม่ลบ เพื่อความปลอดภัย ไม่กระทบ FK/ประวัติเดิม

3. **ทุก assessment** (ทั้ง 80 แถว ทั้งที่เคย `NULL` และที่เคยผูก `criteria_id=1`) ผูกกับเกณฑ์มาตรฐานชุดใหม่นี้ชุดเดียว

---

## Approach

เก็บสถาปัตยกรรมเดิมไว้ (ตาราง config `pms_criteria`/`pms_criteria_grades` + ฟังก์ชันกลาง `pms_grade_for_score()`) — ออกแบบไว้ถูกต้องอยู่แล้วและมีหน้า settings ให้ admin จัดการ ปัญหาคือ data ไม่ครบและมีจุดคำนวณซ้ำ ไม่ใช่สถาปัตยกรรมผิด

### 1. Data migration — สร้างเกณฑ์มาตรฐานและผูกทุก assessment

Migration เดียว, transactional:

1. `INSERT INTO pms_criteria (name, is_active) VALUES ('เกณฑ์มาตรฐาน (A–D)', true) RETURNING id`
2. `INSERT INTO pms_criteria_grades (criteria_id, grade, min_score, max_score, sort_order, description)` — 7 แถวตามตารางข้างบน (`sort_order` 1–7 เรียงจาก A→D เหมือน 3 ชุดเดิม)
3. `UPDATE pms_criteria SET is_active = false WHERE id IN (1, 2, 3)`
4. `UPDATE pms_assessments SET criteria_id = <new_id>` — ทุกแถว ไม่มีเงื่อนไข (ทับทั้งที่ `NULL` และที่เคยเป็น 1)

### 2. Code — รวมจุดคำนวณเกรดให้เหลือจุดเดียว

แก้ RPC `pms_evaluation_upsert`: จุดที่คำนวณ `v_grade` (ปัจจุบันเป็น inline `SELECT grade FROM pms_criteria_grades WHERE criteria_id = v_criteria_id AND v_total_score BETWEEN min_score AND max_score ORDER BY sort_order LIMIT 1`) เปลี่ยนเป็นเรียก `public.pms_grade_for_score(v_criteria_id, v_total_score)` แทน ผลลัพธ์เหมือนเดิมทุกกรณี (logic เดียวกันเป๊ะ) แต่ตอนนี้มีจุดคำนวณเดียวจริงๆ ในระบบ ทุกจุดที่ต้องหาเกรดเรียกผ่านฟังก์ชันนี้เท่านั้น

### 3. Backfill — เกรดของ evaluation ที่ส่งไปแล้ว

`pms_evaluation_upsert` เขียน `grade` ลงคอลัมน์ตอน INSERT/UPDATE เท่านั้น ไม่ recompute อัตโนมัติเมื่อไม่มีการบันทึกซ้ำ — ต้อง backfill 123 แถวที่ `status='sent'` และมี `grade IS NULL`:

```sql
UPDATE pms_evaluations e
SET grade = pms_grade_for_score(a.criteria_id, e.total_score)
FROM pms_assessments a
WHERE a.id = e.assessment_id
  AND e.status = 'sent'
  AND e.total_score IS NOT NULL
  AND e.grade IS NULL;
```

รันหลังขั้นตอน 1 (ต้องมี `criteria_id` ผูกแล้วก่อน)

### 4. Frontend — กล่องม่วง "สรุปคะแนนและเกรด"

ไฟล์: [`raw/nuxt_pms/pages/pms/evaluation/view.vue`](../../../raw/nuxt_pms/pages/pms/evaluation/view.vue)

ไม่ต้องแตะ backend เพิ่ม — edge function `pms-criteria` มี `GET /pms-criteria/:id` คืน `grades[]` (grade, min_score, max_score, description, sort_order) ให้อยู่แล้ว (ดู [`composables/usePmsCriteria.ts`](../../../raw/nuxt_pms/composables/usePmsCriteria.ts))

**เพิ่ม:**
- state ใหม่ `criteriaGrades = ref<PmsCriteriaGrade[]>([])`
- หลังโหลด `data` (RPC ผลการประเมิน) เสร็จ และมี `data.summary.criteria_id` → เรียก `criteriaApi.get(criteria_id)` เก็บผลลัพธ์ `.grades` (sort ตาม `sort_order` ที่ API คืนมาอยู่แล้ว) ลง `criteriaGrades`
- ถ้าไม่มี `criteria_id` หรือโหลดไม่สำเร็จ → `criteriaGrades` ว่าง ไม่ throw

**แทนที่กล่อง "แปลผลการประเมิน" เดิม** (ที่โชว์แค่ `data.grade_definition` เป็น text บรรยาย) **ด้วยกล่องม่วง gradient** ใหม่ (pattern เดียวกับกล่อง "คะแนนรวม 100 คะแนน" ที่มีอยู่แล้วใน `pms/summary/view.vue` — `background:linear-gradient(135deg,#7c3aed,#a78bfa)`):

- หัวข้อ "สรุปคะแนนและเกรด"
- บรรทัด "คะแนนรวมเต็ม 100 คะแนน"
- ตัวเลขใหญ่ `summaryTotalAvg` (computed ที่มีอยู่แล้วในไฟล์ — ไม่คิดสูตรใหม่)
- แถบ breakdown เป็น chip ต่อกันตาม `criteriaGrades` จริงจาก DB (ไม่ hardcode จำนวน/ช่วงคะแนน) — แต่ละ chip แสดง `grade` + ช่วงคะแนน (`min_score`–`max_score`, กรณี `max_score` เป็นค่าสูงสุดของช่วงบนแสดงเป็น `≥ min_score`); chip ที่ตรงกับ `data.summary.final_grade` ไฮไลต์เด่น (พื้นขาว/ตัวหนังสือม่วง ตัวอื่นโปร่งแสง)
- กล่องเกรดใหญ่ด้านขวา แสดง `data.summary.final_grade` (ตัวใหญ่ ตรงกลาง)
- ถ้า `criteriaGrades` ว่าง (โหลดไม่สำเร็จ) → กล่องยังแสดงคะแนนรวม/เกรดได้ตามปกติ เพียงไม่มีแถบ breakdown

---

## Testing

**SQL (หลัง migration + backfill):**
- `SELECT count(*) FROM pms_assessments WHERE criteria_id IS NULL` ต้องเป็น `0`
- `SELECT count(*) FROM pms_evaluations WHERE status='sent' AND total_score IS NOT NULL AND grade IS NULL` ต้องเป็น `0`
- เช็ค boundary ด้วยมือ: คะแนน `54.99` → `D`, `55.00` → `D+`, `59.99` → `D+`, `60.00` → `C`, `79.99` → `B`, `80.00` → `A`
- `SELECT is_active FROM pms_criteria WHERE id IN (1,2,3)` ต้องเป็น `false` ทั้งหมด

**Manual:**
- เปิด `/pms/evaluation/view?send_id=<id>` หลาย record (ต่างเกรดกัน) เช็คว่า breakdown 7 chip แสดงถูกช่วงคะแนน และ chip ที่ไฮไลต์ตรงกับเกรดจริง
- เปิด `/pms/settings/criteria` เช็คว่า 3 ชุดเดิมยังอยู่ (แสดงเป็น inactive) และเกณฑ์มาตรฐานใหม่ active
- ลองบันทึกแบบประเมินใหม่ (ให้ครบทุกข้อ แล้วกดส่ง) → เช็คว่า `pms_evaluations.grade` ที่เพิ่งบันทึกตรงกับตารางเกณฑ์ใหม่

---

## Out of scope

- ไม่แก้ UI หน้า `/pms/settings/criteria` (ยังจัดการเกณฑ์แบบ per-record เหมือนเดิม เผื่ออนาคตต้องการเกณฑ์อื่นสำหรับ assessment ประเภทอื่น)
- ไม่ลบ 3 ชุดเกณฑ์เดิม
- ไม่แก้ `pms_evaluation_results_v` (เรียก `pms_grade_for_score()` อยู่แล้ว ไม่ต้องแตะ)
