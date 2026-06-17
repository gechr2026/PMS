# Design: Lock Compare Page to Current User Only

**Date:** 2026-06-17  
**Status:** Approved  
**Scope:** `pms/compare` — หน้าเปรียบเทียบผลการประเมิน

---

## Problem

หน้า `/pms/compare` มี employee picker ที่ให้ user ทุก role ค้นหาและดูข้อมูลผลประเมินของพนักงานท่านอื่นได้ ซึ่งขัดกับ business rule ที่กำหนดว่าหน้านี้ใช้สำหรับดูข้อมูลของตนเองเปรียบเทียบกับปีที่ผ่านมาเท่านั้น

**Affected roles:** admin, executive, manager, supervisor (ทุก role ที่เข้าถึง `/pms/compare` ได้)

---

## Approach: Frontend lock + Backend enforcement (defense-in-depth)

### Frontend — `raw/nuxt_pms/pages/pms/compare/index.vue`

**ลบออก:**
- `<input>` employee picker และ dropdown suggestions ทั้งหมด
- State: `empSearch`, `suggestions`, `pickerLoading`, `showDropdown`
- Functions: `fetchSuggestions`, `onEmpInput`, `onEmpFocus`, `onEmpBlur`
- ปุ่ม "ล้าง ×" ใน selected chip

**เพิ่ม / เปลี่ยน:**
- `onMounted` → เรียก `compareApi.searchEmployees({ q: profile.value?.username, limit: 1 })`
  - ถ้า resolve ได้ → auto-select employee และเรียก `loadCompare()` ทันที
  - ถ้า resolve ไม่ได้ → แสดง error "ไม่พบข้อมูลพนักงาน กรุณาติดต่อผู้ดูแลระบบ"
- Selected chip เป็น **read-only** (แสดงชื่อ+รหัสตัวเอง ไม่มีปุ่มล้าง)
- Filter ปีการประเมินยังใช้งานได้ปกติ

### Backend — `supabase/functions/pms-compare/index.ts`

**เพิ่ม helper `resolveCurrentEmployee(supabase)`:**
```
1. supabase.auth.getUser()              → uid (UUID); ถ้าไม่มี user → 401
2. SELECT username FROM profiles        WHERE id = uid; ถ้าไม่พบหรือ username = null → 403
3. SELECT id FROM pms_employees         WHERE username = <username>; ถ้าไม่พบ → 403
→ คืน { id: number }
```

**`/employees` endpoint:**
- ลบ free-text search logic ออก
- แทนด้วย `resolveCurrentEmployee()` → คืน record ของ user ปัจจุบัน 1 record (shape เดิม)

**`/:employee_id` endpoint:**
- เรียก `resolveCurrentEmployee()` ก่อน query ข้อมูล
- ถ้า `employeeId !== currentEmployee.id` → return `403 Forbidden`
- ถ้าตรงกัน → ทำงานตามปกติ

---

## Files Changed

| File | Action |
|------|--------|
| `raw/nuxt_pms/pages/pms/compare/index.vue` | แก้ไข — ลบ picker, auto-select ตัวเอง |
| `supabase/functions/pms-compare/index.ts` | แก้ไข — เพิ่ม self-guard ทั้ง 2 endpoints |

---

## Out of Scope

- ไม่แก้ไข ACL (`usePmsAcl.ts`) — ยังให้ทุก role เข้าหน้านี้ได้เหมือนเดิม
- ไม่สร้าง endpoint ใหม่ — ใช้ endpoint เดิมที่มีอยู่แล้ว
- ไม่แก้ไข RLS policy บน Supabase
