# การวิเคราะห์โปรเจค: nuxt_pms (Performance Management System)

> เอกสารสรุปจากการอ่านโครงสร้างไฟล์ทั้งหมดของโปรเจค `nuxt_pms`
> วันที่วิเคราะห์: 7 พฤษภาคม 2026

---

## 1. ภาพรวมโปรเจค (Overview)

โปรเจคนี้เป็น **Performance Management System (PMS)** หรือ **ระบบประเมินผลการปฏิบัติงาน** ขององค์กร พัฒนาด้วย **Nuxt 3** โดยต่อยอดจาก template **VRISTO – Multipurpose Tailwind Dashboard Template** (ดูได้จากค่า title ใน `nuxt.config.ts`)

ปัจจุบันโปรเจคอยู่ในสถานะ **ส่วนหน้า (Front-end) เป็นหลัก** — ยังเป็น static UI ที่ใช้ข้อมูล mock อยู่ใน component ตรงๆ ยังไม่พบการเรียก API จริง (ไม่มี `$fetch`, `useFetch`, `useAsyncData`, axios) และยังไม่มี middleware สำหรับ auth

ส่วน UI ของระบบ PMS เป็น **ภาษาไทย** ทั้งหมด ในขณะที่หน้า template เดิม (apps, datatables, components, ฯลฯ) ยังคงเป็นภาษาอังกฤษ

---

## 2. Stack เทคโนโลยี (Tech Stack)

### Framework & Core
- **Nuxt** 3.15.4 (Vue 3, SSR/SSG ready)
- **TypeScript** 5.5.4
- **compatibilityDate** 2024-09-21

### Styling
- **Tailwind CSS** 3.4.12 + plugins `@tailwindcss/forms`, `@tailwindcss/typography`
- **PostCSS** + autoprefixer
- ธีมสีหลัก primary `#4361ee` (น้ำเงิน), success `#00ab55`, danger `#e7515a`, warning `#e2a03f`
- รองรับ Dark mode (class strategy) แต่ในส่วน PMS layout ยังเป็น light อย่างเดียว
- Font: **Nunito** จาก Google Fonts

### State Management & i18n
- **Pinia** (`@pinia/nuxt`) — มี store เดียวคือ `useAppStore` คุมธีม/เมนู/locale/sidebar
- **@nuxtjs/i18n** 8.5.4 — รองรับ 16 ภาษา (en, da, de, el, es, fr, hu, it, ja, pl, pt, ru, sv, tr, zh, ae) มีการ toggle RTL อัตโนมัติเมื่อเลือก ae

### UI / UX Libraries
หมวดที่ติดตั้งเยอะมาก (สืบทอดจาก template):
- DataTable: `@bhplugin/vue3-datatable`
- Calendar: `@fullcalendar/*` (core, daygrid, interaction, timegrid)
- Charts: `apexcharts` + `vue3-apexcharts`
- Editor: `quill` + `vue3-quill`, `easymde` + `vue3-easymde`
- Modal/Alert: `sweetalert2`, `@headlessui/vue`
- Date: `vue-flatpickr-component`
- Drag & Drop: `vue-draggable-next`
- Carousel/Slider: `swiper`, `vue-simple-range-slider`
- Form: `@vuelidate/core`, `@vuelidate/validators`, `maska` (input mask), `@suadelabs/vue3-multiselect`, `vue3-form-wizard`, `vue3-number-spinner`
- Misc: `tippy.vue`, `vue3-popper`, `vue-easy-lightbox`, `vue-clipboard3`, `vue-countup-v3`, `vue3-perfect-scrollbar`, `highlight.js`, `file-upload-with-preview`, `vue3-json-excel`

> **ข้อสังเกต:** ไลบรารีที่ติดตั้งเยอะกว่าที่ใช้จริงในส่วน PMS — สามารถ tree-shake/ตัดทิ้งได้หลายตัวเพื่อลด bundle size

### Plugins (client-only)
`maska`, `perfect-scrollbar`, `tippy`, `vue-easymde`, `vue3-apexcharts`, `vue3-json-excel`, `vue3-popper`, `vue3-quill` — ทั้งหมดเป็น `.client.ts` (ไม่รันบน SSR เพื่อหลีกเลี่ยง window/document errors)

---

## 3. โครงสร้างไดเรกทอรี (Directory Structure)

```
nuxt_pms/
├── app-setting.ts          # ฟังก์ชัน init theme/locale จาก localStorage
├── theme.config.ts         # ค่า default ของ theme
├── nuxt.config.ts
├── tailwind.config.cjs
├── i18n.config.ts
├── package.json (pnpm + npm compatible)
├── pnpm-lock.yaml / pnpm-workspace.yaml
│
├── pages/                  # 134 ไฟล์ .vue, ~70,000 บรรทัด
│   ├── index.vue           # Dashboard PMS (ใช้ pms-layout)
│   ├── analytics.vue, charts.vue, crypto.vue, finance.vue, widgets.vue, …
│   ├── apps/               # invoice, calendar, chat, contacts, mailbox, notes, scrumboard, todolist
│   ├── auth/               # 9 หน้า (login, signup, lockscreen, password-reset × boxed/cover)
│   ├── components/         # demo: accordions, cards, modals, sweetalert, …
│   ├── datatables/         # 13 หน้า demo ของ vue3-datatable
│   ├── elements/           # alerts, buttons, badges, typography, …
│   ├── forms/              # demo: validation, wizards, quill-editor, …
│   ├── pages/              # error404/500/503, coming-soon, faq, knowledge-base, …
│   ├── users/              # profile, account-settings
│   └── pms/                # ★ ส่วนงานจริง (32 ไฟล์)
│       ├── assigned/       # งานที่ได้รับมอบหมาย (index, view)
│       ├── evaluation/     # ผลการประเมิน (index, view)
│       ├── compare/        # เปรียบเทียบผลการประเมิน
│       ├── summary/        # สรุปผลการประเมิน (index, view)
│       ├── reports/        # รายงาน
│       ├── report/tracking/# ติดตามภาระงานประเมิน (index, view)
│       └── settings/       # หน้า master data ทั้งหมด
│           ├── year/       # รอบปีการประเมิน
│           ├── cycle/      # รอบการประเมิน
│           ├── department/ # แผนก
│           ├── team/       # ทีม
│           ├── position/   # ตำแหน่งงาน
│           ├── level/      # ระดับตำแหน่ง
│           ├── employee/   # ข้อมูลพนักงาน (มี import เพิ่ม)
│           ├── criteria/   # เกณฑ์การประเมิน
│           ├── assessment/ # แบบประเมิน (มี import เพิ่ม)
│           └── send/       # ส่งแบบประเมิน
│
├── components/
│   ├── icon/               # 162 ไฟล์ Vue icon components
│   │   └── menu/
│   ├── layout/             # Header.vue, Sidebar.vue, Footer.vue (template เดิม)
│   └── plugins/            # highlight.vue
│
├── layouts/
│   ├── default.vue         # Layout เดิมของ template (header/sidebar แบบ vertical/horizontal)
│   ├── auth-layout.vue     # สำหรับหน้า auth (boxed/cover)
│   └── pms-layout.vue      # ★ Layout หลักของระบบ PMS (Sidebar ภาษาไทย, สีฟ้า)
│
├── plugins/                # 8 client-only plugins
├── stores/index.ts         # Pinia store เดียว (app)
├── composables/codePreview.ts
│
├── locales/                # 16 ไฟล์ JSON (i18n)
├── assets/css/             # global stylesheet
└── public/assets/images/   # รูปภาพและธงประเทศกว่า 200+ รูป
```

**สถิติบรรทัดโค้ด:**
- pages/ ≈ 70,092 บรรทัด
- components/ ≈ 4,868 บรรทัด
- layouts/ ≈ 432 บรรทัด

---

## 4. ฟังก์ชันหลักของระบบ PMS (Domain Features)

จากการอ่าน `layouts/pms-layout.vue` พบ Sidebar Navigation 4 กลุ่มหลัก:

### 4.1 แดชบอร์ด (Dashboard)
- หน้า `/` แสดง stat cards (งานมอบหมาย/ยังไม่ทำ/อยู่ระหว่างทำ/เสร็จแล้ว)
- มี filter เลือก **รอบปี (เช่น 2569)** และ **รอบการประเมิน (เช่น 1/2569)**
- มี Donut chart และกราฟอื่น (ใช้ apexcharts)

### 4.2 การประเมินผล
| เมนู | Path | คำอธิบาย |
|---|---|---|
| งานที่ได้รับมอบหมาย | `/pms/assigned` | รายการแบบประเมินที่ผู้ใช้ต้องทำ + view detail |
| ผลการประเมิน | `/pms/evaluation` | ดู/บันทึกคะแนน + view detail |
| เปรียบเทียบผลการประเมิน | `/pms/compare` | เทียบผลข้ามรอบ/ข้ามผู้ประเมิน |

### 4.3 รายงานและสรุปผล
| เมนู | Path |
|---|---|
| ติดตามภาระงานประเมิน | `/pms/report/tracking` |
| สรุปผลการประเมิน | `/pms/summary` |
| รายงาน | `/pms/reports` |

### 4.4 การตั้งค่า (Master Data)
ทุกโมดูลมีรูปแบบ index (list + filter) + add (form) เหมือนกัน:

- **รอบปีการประเมินผล** (year)
- **รอบการประเมิน** (cycle)
- **แผนกในองค์กร** (department)
- **ทีม** (team)
- **ตำแหน่งงาน** (position)
- **ระดับตำแหน่ง** (level)
- **ข้อมูลพนักงาน** (employee) — มีหน้า `import.vue` สำหรับนำเข้า batch
- **เกณฑ์การประเมินผล** (criteria)
- **แบบประเมิน** (assessment) — มีหน้า `import.vue` ด้วย
- **ส่งแบบประเมิน** (send)

---

## 5. Authentication & Routing

- หน้า `/auth/login` ใช้ `definePageMeta({ layout: false })` — เป็น layout custom ใน-page (เพราะต้องการ full-screen gradient พื้นหลัง)
- หน้า auth อื่นๆ (boxed/cover-signin, signup, password-reset, lockscreen) ใช้ `auth-layout`
- หน้า PMS ทั้งหมด default ใช้ `pms-layout`
- ⚠ **ยังไม่พบ middleware ตรวจสอบ session/auth** — ใครก็เข้า `/pms/*` ได้
- ⚠ **ยังไม่มี state ของ user ที่ login** — store เก็บแค่ค่า UI (theme, menu, locale)

---

## 6. การจัดการ State

`stores/index.ts` มี store เดียวชื่อ `app` เก็บ:
- `theme` (light/dark/system) + `isDarkMode`
- `mainLayout` (app/auth)
- `menu` (vertical/collapsible-vertical/horizontal)
- `layout` (full/boxed-layout)
- `rtlClass`, `animation`, `navbar`
- `locale` + `languageList` (16 ภาษา)
- `sidebar` (เปิด/ปิด)
- `isShowMainLoader`, `semidark`

ทุก action จะ persist ลง `localStorage` ทำให้ตัวเลือก UI คงอยู่หลัง refresh

---

## 7. จุดเด่น (Strengths)

1. **โครงสร้างไฟล์เป็นระบบ** ใช้ convention ของ Nuxt 3 (file-based routing) ครบ
2. **แยก layout ของ PMS ออกจาก default** ทำให้ส่วนงานจริงสะอาด ไม่ปนกับ template
3. **i18n + RTL พร้อมใช้** สำหรับขยายเป็นหลายภาษาได้ทันที
4. **UI library ครบมือ** — datatable, chart, calendar, editor, ฯลฯ ติดตั้งและตั้งค่าไว้แล้ว
5. **Master data ครอบคลุมโดเมน HR/PMS** — year, cycle, department, team, position, level, employee, criteria, assessment
6. **มี import flow** สำหรับ employee และ assessment (เตรียมรองรับการ migrate ข้อมูลจำนวนมาก)
7. **TypeScript ทั้งโปรเจค**

---

## 8. ข้อสังเกต / จุดที่ควรปรับปรุง (Issues / Suggestions)

### 8.1 Backend Integration (สำคัญสุด)
- ❌ ยังไม่พบการเรียก API จริง — หน้าทั้งหมดใช้ mock data
- ✅ แนะนำ: สร้าง `composables/useApi.ts` ครอบ `$fetch` + interceptor ใส่ token + handle 401, สร้าง `server/api/*.ts` หรือชี้ไป backend จริง

### 8.2 Authentication
- ❌ ไม่มี middleware ตรวจ login → ผู้ใช้ที่ไม่ได้ login เข้า `/pms/*` ได้
- ✅ แนะนำ: เพิ่ม `middleware/auth.global.ts` redirect ไป `/auth/login` ถ้าไม่มี token, สร้าง `stores/auth.ts` เก็บ user, role, permission

### 8.3 Authorization (Role-based)
- ❌ ไม่มีระบบ role/permission ในตอนนี้ ทั้งที่ระบบ PMS โดยทั่วไปมีหลาย role (พนักงาน, หัวหน้า, HR, ผู้บริหาร)
- ✅ แนะนำ: ออกแบบ permission matrix ก่อน (เช่น พนักงานเห็นเฉพาะ assigned ของตัวเอง, HR เห็น summary ทั้งองค์กร)

### 8.4 Bundle Size
- มีไลบรารีหนัก ๆ ที่อาจไม่ได้ใช้ในส่วน PMS เช่น `quill`, `easymde`, `swiper`, `fullcalendar`, `vue-easy-lightbox`, `vue3-form-wizard`, `vue-clipboard3`
- ✅ แนะนำ: review ว่าหน้าที่ deploy จริงใช้ตัวไหนบ้าง แล้ว uninstall ที่เหลือ + ใช้ dynamic import สำหรับ component หนัก

### 8.5 Template Pages ที่ไม่ใช้
- `pages/apps/`, `pages/components/`, `pages/datatables/`, `pages/elements/`, `pages/forms/`, `pages/pages/`, `pages/charts.vue`, `pages/crypto.vue`, `pages/finance.vue`, `pages/widgets.vue`, ฯลฯ — เป็นหน้า demo ของ template
- ✅ แนะนำ: ลบทิ้งเมื่อขึ้น production (หรือย้ายไปสาขา `dev-references`) เพื่อลด build time และความสับสน

### 8.6 Type Safety
- เห็น `payload: any = null` หลายที่ใน `stores/index.ts`
- ✅ แนะนำ: ใส่ literal types เช่น `'light' | 'dark' | 'system'` ให้ชัด

### 8.7 Component ซ้ำซ้อน
- หน้า settings/* แต่ละโมดูลใช้ pattern เดียวกัน (header + filter card + table + pagination)
- ✅ แนะนำ: แยกเป็น `<MasterDataLayout>` หรือ `<DataTableCard>` re-usable component เพื่อลด LOC ~70k บรรทัดให้น้อยลง

### 8.8 Inline SVG
- pms-layout.vue ฝัง SVG icon เป็น inline เยอะมาก ทำให้ไฟล์ยาวและซ้ำ
- ✅ แนะนำ: ใช้ `components/icon/*.vue` ที่มีอยู่แล้ว 162 ตัว หรือเพิ่ม icon ที่ขาดเข้าไปแทนการ inline

### 8.9 i18n ของส่วน PMS
- ข้อความในหน้า PMS เป็น hard-coded ภาษาไทยทั้งหมด ไม่ผ่าน `$t()`
- ✅ แนะนำ: ถ้าต้องการ multi-lang จริง ต้องย้ายข้อความไปไฟล์ `locales/*.json`

### 8.10 ปีพ.ศ./ค.ศ.
- เห็นใช้ปี **2569 (พ.ศ.)** ในหน้า dashboard และ login → ควรกำหนดมาตรฐานชัดเจน (เก็บ DB เป็นค.ศ., แสดงผลเป็นพ.ศ.) เพื่อกัน bug เวลาเชื่อม backend

### 8.11 Accessibility & Mobile
- Sidebar มี responsive (`lg:translate-x-0`) แต่ควรตรวจสอบ touch target, contrast, aria-label โดยเฉพาะปุ่ม icon-only

---

## 9. แผนทำงานต่อที่แนะนำ (Suggested Roadmap)

| ลำดับ | งาน | เหตุผล |
|---|---|---|
| 1 | ทำ Auth flow + middleware + role | ก่อนต่อ backend ต้องคุม access ก่อน |
| 2 | ออกแบบ API contract (OpenAPI/tRPC) สำหรับ master data ทั้ง 10 โมดูล | ให้ทีม backend/frontend คุยภาษาเดียวกัน |
| 3 | สร้าง `composables/useApi.ts` + แทนที่ mock data ในหน้า settings ทีละโมดูล | เริ่มจาก year → cycle → department → … (ลำดับ dependency) |
| 4 | ทำหน้า evaluation/assigned ให้ส่งคะแนนได้จริง | คือ core flow ของระบบ |
| 5 | Refactor master data pages ใช้ component ร่วม | ลดโค้ดซ้ำ |
| 6 | ลบ template pages ที่ไม่ใช้, uninstall lib ที่ไม่ใช้ | ลด bundle |
| 7 | ทำ unit test (vitest) + E2E (playwright) สำหรับ flow หลัก | ความเสถียรก่อน production |
| 8 | i18n ครอบคลุม PMS (ถ้าต้องรองรับหลายภาษา) | |

---

## 10. สรุปสั้น

`nuxt_pms` เป็น **front-end ของระบบประเมินผลการปฏิบัติงานองค์กร** ที่สร้างบน Nuxt 3 + Tailwind โดยใช้ VRISTO เป็น base template แล้วเพิ่มโมดูล `pms/` (32 หน้า) สำหรับ master data, assignment, evaluation, comparison, summary และ report

โครงสร้างและ UI พร้อมใช้แล้วในระดับ presentation แต่**ยังต้องการงานสำคัญ 3 ส่วนเพื่อขึ้น production จริง**: (1) เชื่อม backend API, (2) ระบบ authentication + authorization, (3) refactor ลด code duplication และ bundle size

— จบรายงาน —
