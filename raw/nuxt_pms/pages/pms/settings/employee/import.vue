<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ข้อมูลพนักงาน - นำเข้า</h1>
            </div>
            <NuxtLink
                to="/pms/settings/employee"
                class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8l-4 4 4 4M8 12h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                กลับ
            </NuxtLink>
        </div>

        <!-- Upload Card -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <!-- เลือกไฟล์ -->
            <div class="mb-6">
                <label class="mb-2 block text-sm font-semibold text-gray-700">เลือกไฟล์</label>
                <div class="flex flex-wrap items-center gap-3">
                    <!-- File input (styled) -->
                    <div class="flex flex-1 min-w-0 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <label
                            class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"/>
                                <polyline points="17 8 12 3 7 8" stroke-linecap="round"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round"/>
                            </svg>
                            Choose File
                            <input
                                ref="fileInput"
                                type="file"
                                accept=".xlsx,.xls"
                                class="hidden"
                                @change="onFileChange"
                            />
                        </label>
                        <span class="flex-1 truncate px-3 py-2 text-sm text-gray-500">
                            {{ selectedFileName || 'ไม่ได้เลือกไฟล์' }}
                        </span>
                    </div>

                    <!-- Template Button -->
                    <a
                        href="/templates/employee_import_template.xlsx"
                        download="employee_import_template.xlsx"
                        class="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round"/>
                            <polyline points="10 9 9 9 8 9" stroke-linecap="round"/>
                        </svg>
                        Template
                    </a>
                </div>

                <p v-if="parseError" class="mt-2 text-xs text-red-500">{{ parseError }}</p>

                <p class="mt-2 text-xs text-gray-400">
                    รองรับ .xlsx ตาม template เท่านั้น (ชีท ‘พนักงาน’ คอลัมน์ A–J)
                </p>
            </div>

            <!-- Summary banner -->
            <div
                v-if="parsed.length > 0"
                class="mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                :class="invalidCount > 0
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'"
            >
                <div>
                    พบข้อมูลทั้งหมด <b>{{ parsed.length }}</b> แถว —
                    ผ่าน <b>{{ validCount }}</b> แถว, ผิดพลาด <b>{{ invalidCount }}</b> แถว
                </div>
                <span v-if="invalidCount === 0">✓ พร้อมบันทึก</span>
                <span v-else>✕ ต้องแก้ไขก่อนบันทึก</span>
            </div>

            <!-- Preview Table -->
            <div v-if="parsed.length > 0" class="mb-6">
                <div class="overflow-x-auto rounded-xl border border-gray-200">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-16 px-3 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                                <th class="px-3 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                <th class="px-3 py-3 text-left font-semibold text-gray-700">ชื่อบัญชี</th>
                                <th class="px-3 py-3 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                                <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">ระดับ</th>
                                <th class="w-20 px-3 py-3 text-center font-semibold text-gray-700">ใช้งาน</th>
                                <th class="w-20 px-3 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(row, index) in parsed" :key="index">
                                <tr
                                    class="border-b border-gray-100 transition"
                                    :class="row.errors.length > 0 ? 'bg-red-50' : 'hover:bg-gray-50'"
                                >
                                    <td class="px-3 py-2 text-center text-gray-600">{{ index + 1 }}</td>
                                    <td class="px-3 py-2 text-center font-mono text-gray-700">{{ row.empCode || '—' }}</td>
                                    <td class="px-3 py-2 text-gray-800">{{ row.fullName || '—' }}</td>
                                    <td class="px-3 py-2 text-gray-600 break-all">{{ row.username || '—' }}</td>
                                    <td class="px-3 py-2 text-gray-700">{{ row.positionName || '—' }}</td>
                                    <td class="px-3 py-2 text-center text-gray-700">{{ row.levelName || '—' }}</td>
                                    <td class="px-3 py-2 text-center">
                                        <span v-if="row.isActive" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">ใช้งาน</span>
                                        <span v-else class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">ปิด</span>
                                    </td>
                                    <td class="px-3 py-2 text-center">
                                        <span v-if="row.errors.length === 0" class="text-emerald-600 font-bold">✓</span>
                                        <span v-else class="text-red-500 font-bold" :title="row.errors.join(' / ')">✕</span>
                                    </td>
                                </tr>
                                <tr v-if="row.errors.length > 0" class="bg-red-50 border-b border-red-100">
                                    <td colspan="8" class="px-3 pb-2 pt-0 text-xs text-red-600">
                                        <ul class="ml-8 list-disc">
                                            <li v-for="(e, ei) in row.errors" :key="ei">{{ e }}</li>
                                        </ul>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Server error banner -->
            <div
                v-if="serverError"
                class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
            >
                {{ serverError }}
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 border-t border-gray-100 pt-5">
                <button
                    type="button"
                    :disabled="parsed.length === 0 || invalidCount > 0 || submitting"
                    class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
                    :class="parsed.length > 0 && invalidCount === 0 && !submitting
                        ? 'hover:opacity-90 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'"
                    style="background:#4361ee;"
                    @click="handleSave"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
                </button>
                <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                    @click="handleClear"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11v6M14 11v6" stroke-linecap="round"/>
                    </svg>
                    ล้าง
                </button>
            </div>
        </div>

        <!-- Success Toast -->
        <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="showToast"
                class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ toastMessage }}
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsPosition } from '@/composables/usePmsPositions';
import type { PmsLevel } from '@/composables/usePmsLevels';

const router = useRouter();
const employeesApi = usePmsEmployees();
const positionsApi = usePmsPositions();
const levelsApi    = usePmsLevels();

useHead({ title: 'นำเข้าข้อมูลพนักงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

interface ParsedRow {
    rowNum: number;          // Excel row index (4-based)
    empCode: string;
    fullName: string;
    username: string;        // email > Username
    nationalId: string;      // '' = empty
    positionName: string;
    levelName: string;
    isActive: boolean;
    position_id: number | null;
    level_id: number | null;
    errors: string[];
}

const fileInput        = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const parsed           = ref<ParsedRow[]>([]);
const parseError       = ref('');
const serverError      = ref('');
const submitting       = ref(false);
const showToast        = ref(false);
const toastMessage     = ref('');

const positions        = ref<PmsPosition[]>([]);
const levels           = ref<PmsLevel[]>([]);
const positionByName   = ref<Map<string, PmsPosition>>(new Map());
const levelByName      = ref<Map<string, PmsLevel>>(new Map());

const validCount   = computed(() => parsed.value.filter(r => r.errors.length === 0).length);
const invalidCount = computed(() => parsed.value.filter(r => r.errors.length > 0).length);

// ── Helpers ──────────────────────────────────────────────────────────────
const norm = (v: unknown): string =>
    v === null || v === undefined ? '' : String(v).trim();

const normKey = (v: string): string => v.trim().toLowerCase();

const parseIsActive = (v: unknown): boolean => {
    const s = norm(v).toLowerCase();
    if (!s) return true;
    if (['n', 'no', 'false', '0', 'ปิด', 'inactive'].includes(s)) return false;
    return true;     // Y / Yes / true / 1 / ใช้งาน / anything else → active
};

const sanitizeNationalId = (v: unknown): string =>
    norm(v).replace(/[\s-]/g, '');

// ── File handler ─────────────────────────────────────────────────────────
const onFileChange = async (e: Event) => {
    parseError.value  = '';
    serverError.value = '';
    parsed.value      = [];

    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    selectedFileName.value = file.name;

    try {
        const buf = await file.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        if (!sheetName) {
            parseError.value = 'ไม่พบ worksheet ในไฟล์';
            return;
        }
        const sheet = wb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            header: 'A',
            range: 3,        // skip rows 1–3 (header + instructions + column titles)
            defval: '',
            raw: false,
        });

        // Drop fully blank rows (all critical cols empty)
        const rows = rawRows
            .map((r, i) => parseRow(r, i + 4))
            .filter(r =>
                r.empCode || r.fullName || r.username || r.positionName || r.levelName || r.nationalId
            );

        if (rows.length === 0) {
            parseError.value = 'ไม่พบข้อมูลพนักงาน (เริ่มกรอกที่แถวที่ 4 เป็นต้นไป)';
            return;
        }

        parsed.value = rows;
        validateAll();
    } catch (err) {
        parseError.value = 'อ่านไฟล์ไม่สำเร็จ — ตรวจสอบรูปแบบไฟล์ตาม template';
        // eslint-disable-next-line no-console
        console.warn('[employee/import] parse error', err);
    }
};

const parseRow = (r: Record<string, unknown>, rowNum: number): ParsedRow => {
    const email    = norm(r.H);
    const userCol  = norm(r.D);
    return {
        rowNum,
        empCode:      norm(r.B),
        fullName:     norm(r.C),
        username:     email || userCol,
        nationalId:   sanitizeNationalId(r.E),
        positionName: norm(r.F),
        levelName:    norm(r.G),
        isActive:     parseIsActive(r.J),
        position_id:  null,
        level_id:     null,
        errors:       [],
    };
};

// ── Validation ───────────────────────────────────────────────────────────
const validateAll = () => {
    // Reset errors + resolved IDs
    for (const r of parsed.value) {
        r.errors = [];
        r.position_id = null;
        r.level_id = null;
    }

    // Per-row checks
    for (const r of parsed.value) {
        if (!r.empCode)  r.errors.push('รหัสพนักงานว่าง');
        if (!r.fullName) r.errors.push('ชื่อ-นามสกุลว่าง');
        if (!r.username) r.errors.push('ชื่อบัญชีว่าง (กรอกคอลัมน์อีเมลหรือ Username)');

        if (r.positionName) {
            const p = positionByName.value.get(normKey(r.positionName));
            if (!p) {
                r.errors.push(`ตำแหน่ง "${r.positionName}" ไม่พบในระบบ`);
            } else {
                r.position_id = p.id;
            }
        } else {
            r.errors.push('ไม่ได้ระบุตำแหน่ง');
        }

        if (r.levelName) {
            const l = levelByName.value.get(normKey(r.levelName));
            if (!l) {
                r.errors.push(`ระดับ "${r.levelName}" ไม่พบในระบบ`);
            } else {
                r.level_id = l.id;
            }
        } else {
            r.errors.push('ไม่ได้ระบุระดับ');
        }

        if (r.nationalId && !/^\d{13}$/.test(r.nationalId)) {
            r.errors.push('เลขบัตรประชาชนต้องเป็นเลข 13 หลัก');
        }
    }

    // In-file duplicate detection
    const buckets: Array<{ field: 'empCode' | 'username' | 'nationalId'; label: string }> = [
        { field: 'empCode',    label: 'รหัสพนักงาน' },
        { field: 'username',   label: 'ชื่อบัญชี' },
        { field: 'nationalId', label: 'เลขบัตรประชาชน' },
    ];
    for (const { field, label } of buckets) {
        const groups = new Map<string, number[]>();
        parsed.value.forEach((r, i) => {
            const v = (r[field] as string).trim().toLowerCase();
            if (!v) return;
            const arr = groups.get(v);
            if (arr) arr.push(i);
            else groups.set(v, [i]);
        });
        for (const idxs of groups.values()) {
            if (idxs.length > 1) {
                const otherRowNums = idxs.map(i => parsed.value[i].rowNum);
                idxs.forEach(i => {
                    const otherSet = otherRowNums.filter(n => n !== parsed.value[i].rowNum);
                    parsed.value[i].errors.push(
                        `${label}ซ้ำในไฟล์ (แถว ${otherSet.join(', ')})`
                    );
                });
            }
        }
    }
};

// ── Save ─────────────────────────────────────────────────────────────────
const handleSave = async () => {
    serverError.value = '';
    if (parsed.value.length === 0) return;
    if (invalidCount.value > 0) {
        serverError.value = `แก้ไข ${invalidCount.value} แถวที่ผิดพลาดก่อนบันทึก`;
        return;
    }

    submitting.value = true;
    try {
        const items = parsed.value.map(r => ({
            username:    r.username,
            emp_code:    r.empCode,
            full_name:   r.fullName,
            national_id: r.nationalId || null,
            position_id: r.position_id as number,
            level_id:    r.level_id,
            is_active:   r.isActive,
        }));
        const res = await employeesApi.bulkCreate(items);
        toastMessage.value = `นำเข้าข้อมูลสำเร็จ ${res.inserted} รายการ`;
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/employee');
        }, 1500);
    } catch (e) {
        const err = e as PmsApiError;
        const details = err.details as { code?: string; rows?: Array<{ index: number; field: string; value: string | null; error: string }> } | null;
        if (err.status === 422 && details?.code === 'bulk_validation' && Array.isArray(details.rows)) {
            for (const se of details.rows) {
                const target = parsed.value[se.index];
                if (target) target.errors.push(`[เซิร์ฟเวอร์] ${se.error}`);
            }
            serverError.value = `พบข้อมูลซ้ำ/ไม่ผ่าน ${details.rows.length} รายการ — ดูในตาราง`;
        } else if (err.status === 403) {
            serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
        } else {
            serverError.value = err.message || 'บันทึกไม่สำเร็จ';
        }
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    selectedFileName.value = '';
    parsed.value           = [];
    parseError.value       = '';
    serverError.value      = '';
    if (fileInput.value) fileInput.value.value = '';
};

// ── Mount: load master data ──────────────────────────────────────────────
onMounted(async () => {
    try {
        const [p, l] = await Promise.all([
            positionsApi.list({ limit: 1000 }),
            levelsApi.list({ limit: 100 }),
        ]);
        positions.value = p.data;
        levels.value    = l.data;
        positionByName.value = new Map(p.data.map(x => [normKey(x.name), x]));
        levelByName.value    = new Map(l.data.map(x => [normKey(x.name), x]));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[employee/import] failed to load masters', e);
        parseError.value = 'โหลดข้อมูลตำแหน่ง/ระดับไม่สำเร็จ — ลองรีเฟรชหน้า';
    }
});
</script>
