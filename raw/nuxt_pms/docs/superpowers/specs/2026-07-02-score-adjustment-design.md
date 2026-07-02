# Design Spec: Score Adjustment (แก้ไขรายงาน)

**Date:** 2026-07-02  
**Status:** Approved  
**Scope:** Admin-only feature for manually overriding KPI/Competency scores with full revision history

---

## Overview

เพิ่มเมนู **"แก้ไขรายงาน"** สำหรับ admin เท่านั้น เพื่อให้สามารถปรับคะแนน KPI และ Competency ของพนักงานได้ โดย:
- ไม่แตะข้อมูลหรือหน้าจอเดิม (`/pms/reports`) เลย
- copy ค่าเดิมมา snapshot ไว้ในตารางใหม่
- ทุกการแก้ไขสร้าง revision ใหม่ (1, 2, 3...) พร้อม comment บังคับ
- ใช้ revision ล่าสุดเป็นค่าปัจจุบัน (ดูประวัติย้อนหลังได้)
- คะแนน 100 คำนวณอัตโนมัติจาก KPI × kpi_weight% + Comp × comp_weight%

---

## 1. Database Schema

### ตาราง `pms_score_adjustments`

```sql
CREATE TABLE pms_score_adjustments (
    id                 BIGSERIAL PRIMARY KEY,
    send_id            BIGINT NOT NULL REFERENCES pms_sends(id),
    revision           INTEGER NOT NULL,        -- 1, 2, 3... per send_id
    -- Snapshot ค่าเดิม ณ เวลาที่สร้าง revision แรก
    orig_kpi           NUMERIC(6,2),            -- avg_kpi_excl_self สเกล 0-100
    orig_comp          NUMERIC(6,2),            -- avg_comp_excl_self สเกล 0-100
    orig_score_100     NUMERIC(6,2),
    kpi_weight         NUMERIC(5,2) NOT NULL,   -- snapshot จาก assessment
    comp_weight        NUMERIC(5,2) NOT NULL,
    -- ค่าที่แก้ไข (เก็บสเกล 0-100; UI รับ/แสดง 1-5 แล้วแปลง ×20)
    kpi_adjusted       NUMERIC(6,2) NOT NULL,
    comp_adjusted      NUMERIC(6,2) NOT NULL,
    score_100_adjusted NUMERIC(6,2) NOT NULL,
    -- Metadata
    comment            TEXT NOT NULL,
    adjusted_by        UUID NOT NULL REFERENCES auth.users(id),
    adjusted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (send_id, revision)
);
```

**หลักการ:**
- `UNIQUE(send_id, revision)` ป้องกัน revision ซ้ำ
- `revision` ถัดไป = `MAX(revision) WHERE send_id = X` + 1 คำนวณใน edge function
- Snapshot `orig_*` และ `kpi_weight`/`comp_weight` เก็บถาวร ไม่เปลี่ยนแม้ view จะเปลี่ยน
- สเกล 0-100 ใช้เก็บ (สอดคล้องกับ `avg_kpi_excl_self` ใน view); UI แสดง ÷20

---

## 2. Edge Function

### `pms-score-adjustments`

| Method | Query/Body | หน้าที่ |
|--------|------------|---------|
| `GET` | `?year_id=&cycle_id=&department_id=&team_id=` | List ทุก send พร้อม latest revision (หรือ null ถ้ายังไม่เคยแก้) + ข้อมูลพนักงานจาก `pms_evaluation_results_v` |
| `GET` | `?history=<send_id>` | ดึง revision ทั้งหมดของ send_id นั้น เรียงจากใหม่ไปเก่า |
| `POST` | body JSON | สร้าง revision ใหม่ |

**POST body:**
```json
{
  "send_id": 6,
  "kpi_adjusted": 75.0,
  "comp_adjusted": 58.0,
  "comment": "ปรับตามมติที่ประชุม HR วันที่ ..."
}
```

**POST flow (ใน edge function):**
1. ตรวจ JWT → role ต้องเป็น `admin`
2. ดึง `kpi_weight`, `comp_weight`, `orig_kpi`, `orig_comp`, `orig_score_100` จาก `pms_evaluation_results_v` โดยใช้ `send_id`
3. คำนวณ `score_100_adjusted = kpi_adjusted × kpi_weight/100 + comp_adjusted × comp_weight/100`
4. คำนวณ `revision = MAX(revision) + 1` (หรือ 1 ถ้ายังไม่มี)
5. INSERT และ return row ใหม่

**Auth:** ตรวจ `role = 'admin'` จาก JWT claims ก่อนทุก operation

---

## 3. Composable

### `usePmsScoreAdjustments.ts`

```typescript
export interface PmsScoreAdjustmentRow {
    id: number;
    send_id: number;
    revision: number;
    orig_kpi: number | null;
    orig_comp: number | null;
    orig_score_100: number | null;
    kpi_weight: number;
    comp_weight: number;
    kpi_adjusted: number;
    comp_adjusted: number;
    score_100_adjusted: number;
    comment: string;
    adjusted_by: string;
    adjusted_at: string;
    // joined from pms_evaluation_results_v (GET list)
    emp_code?: string;
    employee_name?: string;
    department_name?: string;
    team_name?: string;
    year?: number;
    cycle_label?: string;
    avg_kpi_excl_self?: number | null;
    avg_comp_excl_self?: number | null;
    score_100?: number | null;
}

export interface PmsScoreAdjustmentCreateBody {
    send_id: number;
    kpi_adjusted: number;   // สเกล 0-100
    comp_adjusted: number;  // สเกล 0-100
    comment: string;
}

// methods:
// list(params)           → GET list + latest revision per send
// listRevisions(send_id) → GET all revisions for send_id
// createRevision(body)   → POST
```

---

## 4. Frontend

### เมนู (pms-layout.vue)

เพิ่มใต้ "รายงานและสรุปผล" มองเห็นเฉพาะ `admin`:

```
รายงานและสรุปผล
  ├── ติดตามภาระงานประเมิน
  ├── สรุปผลการประเมิน
  ├── รายงาน
  └── แก้ไขรายงาน   ← ใหม่ (admin only)
```

Route: `/pms/reports-edit`  
ไฟล์: `pages/pms/reports-edit/index.vue`

---

### หน้า `/pms/reports-edit`

**Filter bar:** ปีประเมิน, รอบการประเมิน, แผนก, ทีม (เหมือน `/pms/reports`)

**ตาราง:**

| คอลัมน์ | แหล่งข้อมูล |
|---------|------------|
| ลำดับ | index |
| ปีประเมิน | `year` |
| รอบการประเมิน | `cycle_label` |
| แผนก | `department_name` |
| ทีม | `team_name` |
| รหัสพนักงาน | `emp_code` |
| ชื่อ-นามสกุล | `employee_name` |
| KPI เดิม | `avg_kpi_excl_self / 20` |
| Comp เดิม | `avg_comp_excl_self / 20` |
| Score เดิม | `score_100` |
| KPI แก้ไข | `kpi_adjusted / 20` (สีม่วง) หรือ `—` |
| Comp แก้ไข | `comp_adjusted / 20` (สีม่วง) หรือ `—` |
| Score แก้ไข | `score_100_adjusted` (สีม่วง) หรือ `—` |
| Revision | `#N` (badge สีม่วง) หรือ `—` |
| จัดการ | ปุ่ม "แก้ไข" + ปุ่ม "ประวัติ" (ปุ่มหลังแสดงเฉพาะแถวที่เคยแก้แล้ว) |

---

### Modal "แก้ไขคะแนน"

- แสดงชื่อพนักงาน + รหัส + revision ถัดไป
- Section **ค่าเดิม** (read-only): KPI / Comp / Score 100
- Section **ค่าใหม่**: input KPI (1–5), input Comp (1–5), preview Score 100 คำนวณ real-time
- Field **เหตุผล/หมายเหตุ** (required)
- ปุ่ม "บันทึก" → POST → refresh แถวนั้น

**การคำนวณ Score 100 preview (client-side):**
```
score100 = (kpiInput × 20) × kpiWeight/100 + (compInput × 20) × compWeight/100
```

---

### Modal "ประวัติ Revision"

Timeline เรียงจาก revision ใหม่ไปเก่า แต่ละรายการแสดง:
- หมายเลข revision, วันที่, ผู้แก้ไข
- KPI เดิม → ใหม่, Comp เดิม → ใหม่, Score 100 เดิม → ใหม่
- comment

---

## 5. ขอบเขตที่ไม่รวม (Out of Scope)

- ไม่มี approval workflow (admin แก้ได้ทันที)
- ไม่มีการส่ง notification
- ไม่มีการเชื่อมค่า adjusted กลับไปยัง `/pms/reports` หรือ summary view
- ไม่มี export CSV สำหรับหน้านี้ (สามารถเพิ่มในภายหลัง)
