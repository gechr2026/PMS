<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f0fdf4;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.8">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                        <path d="M9 12h6M9 16h4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">แบบประเมิน - นำเข้า</h1>
            </div>
            <NuxtLink
                to="/pms/settings/assessment"
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

            <!-- File selector + buttons -->
            <div class="mb-5">
                <label class="mb-2 block text-sm font-semibold text-gray-700">เลือกไฟล์ Excel (.xlsx)</label>
                <div class="flex flex-wrap items-center gap-3">
                    <!-- File input -->
                    <div class="flex flex-1 min-w-0 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <label class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"/>
                                <polyline points="17 8 12 3 7 8" stroke-linecap="round"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round"/>
                            </svg>
                            เลือกไฟล์
                            <input
                                ref="fileInput"
                                type="file"
                                accept=".xlsx,.xls"
                                class="hidden"
                                @change="onFileChange"
                            />
                        </label>
                        <span class="flex-1 truncate px-3 py-2 text-sm text-gray-400">
                            {{ selectedFileName || 'ยังไม่ได้เลือกไฟล์' }}
                        </span>
                    </div>

                    <!-- Template download -->
                    <button
                        type="button"
                        class="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        @click="downloadTemplate"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="18" x2="12" y2="12" stroke-linecap="round"/>
                            <polyline points="9 15 12 18 15 15" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ดาวน์โหลด Template
                    </button>
                </div>

                <!-- อัปโหลด button -->
                <div class="mt-3">
                    <button
                        type="button"
                        :disabled="!selectedFileName || parsing"
                        class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
                        :class="selectedFileName && !parsing ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
                        style="background:#4361ee;"
                        @click="handleUpload"
                    >
                        <svg v-if="!parsing" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"/>
                            <polyline points="17 8 12 3 7 8" stroke-linecap="round"/>
                            <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round"/>
                        </svg>
                        <svg v-else class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        {{ parsing ? 'กำลังอ่านไฟล์...' : 'อ่านไฟล์' }}
                    </button>
                </div>
            </div>

            <!-- Parse error -->
            <div v-if="parseError" class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <strong>ไม่สามารถอ่านไฟล์ได้:</strong> {{ parseError }}
            </div>

            <!-- Preview: header + KPI + Competency -->
            <template v-if="parsed">
                <!-- Validation errors -->
                <div v-if="validationErrors.length > 0" class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p class="mb-1.5 text-sm font-semibold text-amber-700">พบข้อผิดพลาด — กรุณาแก้ไขไฟล์แล้วอ่านใหม่</p>
                    <ul class="list-disc pl-4 text-sm text-amber-700 space-y-0.5">
                        <li v-for="(e, i) in validationErrors" :key="i">{{ e }}</li>
                    </ul>
                </div>

                <!-- Header summary -->
                <div class="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p class="mb-3 text-sm font-bold text-gray-700">ข้อมูลหลักของแบบประเมิน</p>
                    <div class="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">ชื่อแบบประเมิน</span>
                            <span class="text-gray-800">{{ parsed.header.name || '—' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">ประเภท</span>
                            <span class="text-gray-800">{{ typeLabel(parsed.header.type) }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">รอบปีการประเมิน</span>
                            <span :class="resolvedIds.year_id ? 'text-gray-800' : 'text-red-500'">
                                {{ parsed.header.yearLabel || '—' }}
                                <span v-if="!resolvedIds.year_id && parsed.header.yearLabel" class="text-red-400">(ไม่พบในระบบ)</span>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">รอบการประเมิน</span>
                            <span :class="resolvedIds.cycle_id ? 'text-gray-800' : 'text-red-500'">
                                {{ parsed.header.cycleLabel || '—' }}
                                <span v-if="!resolvedIds.cycle_id && parsed.header.cycleLabel" class="text-red-400">(ไม่พบในระบบ)</span>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">ตำแหน่ง</span>
                            <span :class="resolvedIds.position_id ? 'text-gray-800' : 'text-red-500'">
                                {{ parsed.header.positionName || '—' }}
                                <span v-if="!resolvedIds.position_id && parsed.header.positionName" class="text-red-400">(ไม่พบในระบบ)</span>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">ระดับตำแหน่ง</span>
                            <span class="text-gray-800">
                                {{ parsed.header.levelName || '—' }}
                                <span v-if="parsed.header.levelName && !resolvedIds.level_id" class="text-amber-500">(ไม่พบในระบบ)</span>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">เกณฑ์การประเมิน</span>
                            <span class="text-gray-800">
                                {{ parsed.header.criteriaName || '—' }}
                                <span v-if="parsed.header.criteriaName && !resolvedIds.criteria_id" class="text-amber-500">(ไม่พบในระบบ)</span>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <span class="w-36 flex-shrink-0 font-semibold text-gray-500">สัดส่วน KPI / Comp</span>
                            <span class="text-gray-800">{{ parsed.header.kpiWeight }}% / {{ parsed.header.competencyWeight }}%</span>
                        </div>
                    </div>
                </div>

                <!-- KPI preview -->
                <div class="mb-5">
                    <div class="mb-2 flex items-center justify-between">
                        <p class="text-sm font-bold text-gray-700">KPI ({{ parsed.kpis.length }} รายการ)</p>
                        <span
                            class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            :class="Math.abs(kpiWeightSum - 1) < 0.001 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                        >
                            ผลรวมน้ำหนัก {{ kpiWeightSum.toFixed(2) }} / 1.00
                        </span>
                    </div>
                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-12 px-3 py-2.5 text-center font-semibold text-gray-600">ข้อ</th>
                                    <th class="px-3 py-2.5 text-left font-semibold text-gray-600">หัวข้อ KPI</th>
                                    <th class="w-28 px-3 py-2.5 text-center font-semibold text-gray-600">น้ำหนัก</th>
                                    <th class="w-24 px-3 py-2.5 text-center font-semibold text-gray-600">เป้าหมาย</th>
                                    <th class="w-32 px-3 py-2.5 text-center font-semibold text-gray-600">ตัวเลือก (ที่กรอก)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(k, i) in parsed.kpis" :key="i" class="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
                                    <td class="px-3 py-2 text-gray-800">{{ k.subject }}</td>
                                    <td class="px-3 py-2 text-center text-gray-600">{{ k.weight }}</td>
                                    <td class="px-3 py-2 text-center text-gray-600">{{ k.target_option ?? '—' }}</td>
                                    <td class="px-3 py-2 text-center text-gray-500">{{ k.options.filter(o => o.trim()).length }} / 5</td>
                                </tr>
                                <tr v-if="parsed.kpis.length === 0">
                                    <td colspan="5" class="px-3 py-4 text-center text-sm text-gray-400">ไม่มีข้อมูล KPI ในไฟล์</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Competency preview -->
                <div class="mb-5">
                    <div class="mb-2 flex items-center justify-between">
                        <p class="text-sm font-bold text-gray-700">Competency ({{ parsed.competencies.length }} รายการ)</p>
                        <span
                            class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            :class="Math.abs(compWeightSum - 1) < 0.001 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                        >
                            ผลรวมน้ำหนัก {{ compWeightSum.toFixed(2) }} / 1.00
                        </span>
                    </div>
                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-12 px-3 py-2.5 text-center font-semibold text-gray-600">ข้อ</th>
                                    <th class="px-3 py-2.5 text-left font-semibold text-gray-600">หัวข้อ Competency</th>
                                    <th class="w-28 px-3 py-2.5 text-center font-semibold text-gray-600">น้ำหนัก</th>
                                    <th class="w-24 px-3 py-2.5 text-center font-semibold text-gray-600">เป้าหมาย</th>
                                    <th class="w-32 px-3 py-2.5 text-center font-semibold text-gray-600">ตัวเลือก (ที่กรอก)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(c, i) in parsed.competencies" :key="i" class="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td class="px-3 py-2 text-center text-gray-500">{{ i + 1 }}</td>
                                    <td class="px-3 py-2 text-gray-800">{{ c.subject }}</td>
                                    <td class="px-3 py-2 text-center text-gray-600">{{ c.weight }}</td>
                                    <td class="px-3 py-2 text-center text-gray-600">{{ c.target_option ?? '—' }}</td>
                                    <td class="px-3 py-2 text-center text-gray-500">{{ c.options.filter(o => o.trim()).length }} / 5</td>
                                </tr>
                                <tr v-if="parsed.competencies.length === 0">
                                    <td colspan="5" class="px-3 py-4 text-center text-sm text-gray-400">ไม่มีข้อมูล Competency ในไฟล์</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Server error -->
                <div v-if="serverError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {{ serverError }}
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 border-t border-gray-100 pt-5">
                    <button
                        type="button"
                        :disabled="validationErrors.length > 0 || submitting"
                        class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
                        :class="validationErrors.length === 0 && !submitting ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
                        style="background:#4361ee;"
                        @click="handleSave"
                    >
                        <svg v-if="!submitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
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
            </template>
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
                นำเข้าแบบประเมินสำเร็จ
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsPosition } from '@/composables/usePmsPositions';
import type { PmsLevel } from '@/composables/usePmsLevels';
import type { PmsCriteria } from '@/composables/usePmsCriteria';

const router = useRouter();
const assessmentsApi = usePmsAssessments();
const yearsApi       = usePmsYears();
const cyclesApi      = usePmsCycles();
const positionsApi   = usePmsPositions();
const levelsApi      = usePmsLevels();
const criteriaApi    = usePmsCriteria();

useHead({ title: 'นำเข้าแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

// ── Master data ────────────────────────────────────────────────────────
const yearOptions     = ref<PmsYear[]>([]);
const cycleOptions    = ref<PmsCycle[]>([]);
const positionOptions = ref<PmsPosition[]>([]);
const levelOptions    = ref<PmsLevel[]>([]);
const criteriaOptions = ref<PmsCriteria[]>([]);

// ── UI state ────────────────────────────────────────────────────────────
const fileInput        = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const selectedFile     = ref<File | null>(null);
const parsing          = ref(false);
const parseError       = ref('');
const submitting       = ref(false);
const showToast        = ref(false);
const serverError      = ref('');

// ── Parsed data ─────────────────────────────────────────────────────────
interface ParsedHeader {
    name: string;
    type: string;
    yearLabel: string;
    cycleLabel: string;
    positionName: string;
    levelName: string;
    criteriaName: string;
    kpiWeight: number;
    competencyWeight: number;
}
interface ParsedItemRow {
    subject: string;
    detail: string;
    weight: number;
    target_option: number | null;
    options: string[];
}
interface ParsedAssessment {
    header: ParsedHeader;
    kpis: ParsedItemRow[];
    competencies: ParsedItemRow[];
}
interface ResolvedIds {
    year_id: number | null;
    cycle_id: number | null;
    position_id: number | null;
    level_id: number | null;
    criteria_id: number | null;
}

const parsed     = ref<ParsedAssessment | null>(null);
const resolvedIds = ref<ResolvedIds>({ year_id: null, cycle_id: null, position_id: null, level_id: null, criteria_id: null });

const kpiWeightSum  = computed(() => (parsed.value?.kpis ?? []).reduce((s, r) => s + r.weight, 0));
const compWeightSum = computed(() => (parsed.value?.competencies ?? []).reduce((s, r) => s + r.weight, 0));

// ── Validation after parse ──────────────────────────────────────────────
const validationErrors = computed(() => {
    if (!parsed.value) return [];
    const errs: string[] = [];
    const h = parsed.value.header;

    if (!h.name.trim()) errs.push('ชื่อแบบประเมิน ว่างเปล่า');
    if (!['annual_supervisor', 'competency_360'].includes(h.type))
        errs.push(`ประเภท "${h.type}" ไม่ถูกต้อง (ใช้ annual_supervisor หรือ competency_360)`);
    if (!resolvedIds.value.year_id) errs.push(`รอบปีการประเมิน "${h.yearLabel}" ไม่พบในระบบ`);
    if (!resolvedIds.value.cycle_id) errs.push(`รอบการประเมิน "${h.cycleLabel}" ไม่พบในระบบ (หรือไม่ตรงกับปีที่เลือก)`);
    if (!resolvedIds.value.position_id) errs.push(`ตำแหน่ง "${h.positionName}" ไม่พบในระบบ`);

    if (h.type !== 'competency_360') {
        if (parsed.value.kpis.length === 0) errs.push('ต้องมี KPI อย่างน้อย 1 รายการ');
        if (parsed.value.kpis.length > 0 && Math.abs(kpiWeightSum.value - 1) > 0.001)
            errs.push(`ผลรวมน้ำหนัก KPI ต้องเท่ากับ 1.00 (ปัจจุบัน ${kpiWeightSum.value.toFixed(2)})`);
    }
    if (parsed.value.competencies.length === 0) errs.push('ต้องมี Competency อย่างน้อย 1 รายการ');
    if (parsed.value.competencies.length > 0 && Math.abs(compWeightSum.value - 1) > 0.001)
        errs.push(`ผลรวมน้ำหนัก Competency ต้องเท่ากับ 1.00 (ปัจจุบัน ${compWeightSum.value.toFixed(2)})`);

    const kw = h.kpiWeight;
    const cw = h.competencyWeight;
    if (h.type !== 'competency_360' && Math.abs(kw + cw - 100) > 0.001)
        errs.push(`สัดส่วน KPI + Competency ต้องรวมเป็น 100 (ปัจจุบัน ${kw + cw})`);

    return errs;
});

// ── Helpers ────────────────────────────────────────────────────────────
function typeLabel(t: string): string {
    if (t === 'annual_supervisor') return 'ประจำปี (KPI + Competency)';
    if (t === 'competency_360')    return 'Competency 360°';
    return t || '—';
}

function cellStr(ws: XLSX.WorkSheet, r: number, c: number): string {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (!cell) return '';
    return String(cell.v ?? '').trim();
}

function cellNum(ws: XLSX.WorkSheet, r: number, c: number): number {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (!cell) return 0;
    const v = parseFloat(String(cell.v ?? ''));
    return Number.isFinite(v) ? v : 0;
}

function resolveIds(h: ParsedHeader): ResolvedIds {
    const yearNum = parseInt(h.yearLabel, 10);
    const yr = yearOptions.value.find(y => y.year === yearNum);
    const yid = yr?.id ?? null;

    const cyc = yid ? cycleOptions.value.find(c => c.year_id === yid && c.cycle_label === h.cycleLabel) : null;
    const cid = cyc?.id ?? null;

    const pos = positionOptions.value.find(p => p.name === h.positionName);
    const pid = pos?.id ?? null;

    const lv = h.levelName ? levelOptions.value.find(l => l.name === h.levelName) : null;
    const lid = lv?.id ?? null;

    const cr = h.criteriaName ? criteriaOptions.value.find(c => c.name === h.criteriaName) : null;
    const crid = cr?.id ?? null;

    return { year_id: yid, cycle_id: cid, position_id: pid, level_id: lid, criteria_id: crid };
}

// ── HEADER KEYS — must match the template ──────────────────────────────
const HEADER_KEY_NAME       = 'ชื่อแบบประเมิน';
const HEADER_KEY_TYPE       = 'ประเภท';
const HEADER_KEY_YEAR       = 'รอบปีการประเมิน (ปี พ.ศ.)';
const HEADER_KEY_CYCLE      = 'รอบการประเมิน';
const HEADER_KEY_POSITION   = 'ตำแหน่ง';
const HEADER_KEY_LEVEL      = 'ระดับตำแหน่ง';
const HEADER_KEY_CRITERIA   = 'เกณฑ์การประเมิน';
const HEADER_KEY_KPI_W      = 'สัดส่วน KPI (0-100)';
const HEADER_KEY_COMP_W     = 'สัดส่วน Competency (0-100)';

function parseHeaderSheet(ws: XLSX.WorkSheet): ParsedHeader {
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:B1');
    const kvMap: Record<string, string> = {};
    for (let r = range.s.r; r <= range.e.r; r++) {
        const key = cellStr(ws, r, 0);
        const val = cellStr(ws, r, 1);
        if (key) kvMap[key] = val;
    }
    return {
        name:             kvMap[HEADER_KEY_NAME] ?? '',
        type:             kvMap[HEADER_KEY_TYPE] ?? 'annual_supervisor',
        yearLabel:        kvMap[HEADER_KEY_YEAR] ?? '',
        cycleLabel:       kvMap[HEADER_KEY_CYCLE] ?? '',
        positionName:     kvMap[HEADER_KEY_POSITION] ?? '',
        levelName:        kvMap[HEADER_KEY_LEVEL] ?? '',
        criteriaName:     kvMap[HEADER_KEY_CRITERIA] ?? '',
        kpiWeight:        parseFloat(kvMap[HEADER_KEY_KPI_W] ?? '50') || 0,
        competencyWeight: parseFloat(kvMap[HEADER_KEY_COMP_W] ?? '50') || 0,
    };
}

function parseItemSheet(ws: XLSX.WorkSheet | undefined, isKpi: boolean): ParsedItemRow[] {
    if (!ws) return [];
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:A1');
    const rows: ParsedItemRow[] = [];
    // row 0 = header, data starts at row 1
    for (let r = 1; r <= range.e.r; r++) {
        // col 0 = ข้อที่, col 1 = subject, col 2 = detail (KPI) or weight (Comp),
        // For KPI: 0=ข้อที่, 1=subject, 2=detail, 3=weight, 4=target, 5-9=options
        // For Comp: 0=ข้อที่, 1=subject, 2=weight, 3=target, 4-8=options
        let subject: string;
        let detail = '';
        let weight: number;
        let targetOption: number | null;
        const options: string[] = [];

        if (isKpi) {
            subject = cellStr(ws, r, 1);
            if (!subject) continue;
            detail  = cellStr(ws, r, 2);
            weight  = cellNum(ws, r, 3);
            const traw = cellStr(ws, r, 4);
            const tnum = parseInt(traw, 10);
            targetOption = (Number.isInteger(tnum) && tnum >= 1 && tnum <= 5) ? tnum : null;
            for (let c = 5; c <= 9; c++) options.push(cellStr(ws, r, c));
        } else {
            subject = cellStr(ws, r, 1);
            if (!subject) continue;
            weight  = cellNum(ws, r, 2);
            const traw = cellStr(ws, r, 3);
            const tnum = parseInt(traw, 10);
            targetOption = (Number.isInteger(tnum) && tnum >= 1 && tnum <= 5) ? tnum : null;
            for (let c = 4; c <= 8; c++) options.push(cellStr(ws, r, c));
        }

        rows.push({ subject, detail, weight, target_option: targetOption, options });
    }
    return rows;
}

// ── File events ─────────────────────────────────────────────────────────
const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        selectedFile.value     = input.files[0];
        selectedFileName.value = input.files[0].name;
        parsed.value     = null;
        parseError.value = '';
        serverError.value = '';
    }
};

const handleUpload = async () => {
    if (!selectedFile.value) return;
    parsing.value    = true;
    parseError.value = '';
    parsed.value     = null;
    serverError.value = '';

    try {
        const arrayBuffer = await selectedFile.value.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });

        const wsHeader = wb.Sheets['ข้อมูลหลัก'];
        const wsKpi    = wb.Sheets['KPI'];
        const wsComp   = wb.Sheets['Competency'];

        if (!wsHeader) throw new Error('ไม่พบ Sheet "ข้อมูลหลัก" — กรุณาใช้ Template ที่ดาวน์โหลดจากระบบ');

        const header      = parseHeaderSheet(wsHeader);
        const kpis        = parseItemSheet(wsKpi, true);
        const competencies = parseItemSheet(wsComp, false);

        parsed.value      = { header, kpis, competencies };
        resolvedIds.value = resolveIds(header);
    } catch (e) {
        parseError.value = (e as Error).message || 'ไม่สามารถอ่านไฟล์ได้';
    } finally {
        parsing.value = false;
    }
};

// ── Save ────────────────────────────────────────────────────────────────
const handleSave = async () => {
    if (!parsed.value || validationErrors.value.length > 0) return;
    submitting.value  = true;
    serverError.value = '';
    const h   = parsed.value.header;
    const ids = resolvedIds.value;

    try {
        await assessmentsApi.create({
            name:              h.name.trim(),
            type:              h.type as 'annual_supervisor' | 'competency_360',
            year_id:           ids.year_id!,
            cycle_id:          ids.cycle_id!,
            position_id:       ids.position_id!,
            level_id:          ids.level_id ?? null,
            criteria_id:       ids.criteria_id ?? null,
            kpi_weight:        h.kpiWeight,
            competency_weight: h.competencyWeight,
            kpis: h.type === 'competency_360' ? [] : parsed.value.kpis.map((k, i) => ({
                sort_order:    i + 1,
                subject:       k.subject,
                detail:        k.detail || null,
                weight:        k.weight,
                target_option: k.target_option,
                options:       k.options,
            })),
            competencies: parsed.value.competencies.map((c, i) => ({
                sort_order:    i + 1,
                subject:       c.subject,
                weight:        c.weight,
                target_option: c.target_option,
                options:       c.options,
            })),
        });
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/assessment');
        }, 1500);
    } catch (e) {
        serverError.value = (e as Error).message || 'บันทึกไม่สำเร็จ';
    } finally {
        submitting.value = false;
    }
};

// ── Clear ───────────────────────────────────────────────────────────────
const handleClear = () => {
    selectedFileName.value = '';
    selectedFile.value     = null;
    parsed.value           = null;
    parseError.value       = '';
    serverError.value      = '';
    if (fileInput.value) fileInput.value.value = '';
};

// ── Download Template ───────────────────────────────────────────────────
const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: ข้อมูลหลัก
    const headerData = [
        [HEADER_KEY_NAME,     'ประเมินผลการปฏิบัติงานประจำปี 2569 - ตัวอย่าง (Officer)'],
        [HEADER_KEY_TYPE,     'annual_supervisor'],
        [HEADER_KEY_YEAR,     '2569'],
        [HEADER_KEY_CYCLE,    '1/2569'],
        [HEADER_KEY_POSITION, '(ชื่อตำแหน่งที่ตรงกับในระบบ)'],
        [HEADER_KEY_LEVEL,    '(ชื่อระดับตำแหน่ง หรือเว้นว่าง)'],
        [HEADER_KEY_CRITERIA, '(ชื่อเกณฑ์การประเมิน หรือเว้นว่าง)'],
        [HEADER_KEY_KPI_W,    '50'],
        [HEADER_KEY_COMP_W,   '50'],
    ];
    const wsHeader = XLSX.utils.aoa_to_sheet(headerData);
    wsHeader['!cols'] = [{ wch: 34 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsHeader, 'ข้อมูลหลัก');

    // Sheet 2: KPI
    const kpiData = [
        ['ข้อที่', 'หัวข้อ KPI', 'รายละเอียด (optional)', 'น้ำหนัก (0.00-1.00)', 'เป้าหมาย (1-5)', 'ตัวเลือก1', 'ตัวเลือก2', 'ตัวเลือก3', 'ตัวเลือก4', 'ตัวเลือก5'],
        [1, 'ตัวอย่าง KPI 1', 'รายละเอียด KPI 1', 0.25, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
        [2, 'ตัวอย่าง KPI 2', 'รายละเอียด KPI 2', 0.25, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
        [3, 'ตัวอย่าง KPI 3', 'รายละเอียด KPI 3', 0.25, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
        [4, 'ตัวอย่าง KPI 4', 'รายละเอียด KPI 4', 0.25, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
    ];
    const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
    wsKpi['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI');

    // Sheet 3: Competency
    const compData = [
        ['ข้อที่', 'หัวข้อ Competency', 'น้ำหนัก (0.00-1.00)', 'เป้าหมาย (1-5)', 'ตัวเลือก1', 'ตัวเลือก2', 'ตัวเลือก3', 'ตัวเลือก4', 'ตัวเลือก5'],
        [1, 'ตัวอย่าง Competency 1', 0.50, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
        [2, 'ตัวอย่าง Competency 2', 0.50, 3, 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'],
    ];
    const wsComp = XLSX.utils.aoa_to_sheet(compData);
    wsComp['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsComp, 'Competency');

    // Download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob  = new Blob([wbout], { type: 'application/octet-stream' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = 'assessment_template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
};

// ── Load master data on mount ────────────────────────────────────────────
onMounted(async () => {
    try {
        const [y, c, p, l, cr] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            positionsApi.list({ limit: 500 }),
            levelsApi.list({ limit: 100 }),
            criteriaApi.list({ limit: 200 }),
        ]);
        yearOptions.value     = y.data;
        cycleOptions.value    = c.data;
        positionOptions.value = p.data;
        levelOptions.value    = l.data;
        criteriaOptions.value = cr.data;
    } catch (e) {
        console.warn('[assessment/import] failed to load masters', e);
    }
});
</script>
