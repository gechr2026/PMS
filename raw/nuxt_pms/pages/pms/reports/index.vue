<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <path d="M9 7h6M9 11h6M9 15h6" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">รายงาน</h1>
            </div>
            <button
                type="button"
                class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style="background:#10b981;"
                :disabled="loading || rows.length === 0"
                @click="handleExport"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="7 10 12 15 17 10" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round"/>
                </svg>
                ส่งออก
            </button>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <!-- Row 1: รอบปีการประเมิน + รอบการประเมิน -->
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterYear" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="y in yearOptions" :key="y.id" :value="y.year">{{ y.year }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterCycle" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="c in cycleOptions" :key="c.id" :value="c.cycle_label">{{ c.cycle_label }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>

            <!-- Row 2: แผนก + ทีม -->
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <div class="relative">
                        <select
                            v-model="filterDept"
                            class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                            @change="filterTeam = ''"
                        >
                            <option value="">ทั้งหมด</option>
                            <option v-for="d in deptOptions" :key="d.id" :value="d.name">{{ d.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                    <div class="relative">
                        <select v-model="filterTeam" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2">
                <button type="button" class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90" style="background:#4361ee;" @click="handleSearch">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                    ค้นหา
                </button>
                <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100" @click="handleClear">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20L4 4M20 4L4 20" stroke-linecap="round"/></svg>
                    ล้าง
                </button>
            </div>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Table Card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">แผนก</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ทีม</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                            <th class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in rows"
                            :key="item.send_id"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ item.year ?? '—' }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ item.cycle_label || '—' }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ item.department_name || '—' }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ item.team_name || '—' }}</td>
                            <td class="px-4 py-3 text-center font-medium text-gray-800">{{ item.emp_code || '—' }}</td>
                            <td class="px-4 py-3 font-medium text-gray-800">{{ item.employee_name || '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Export Toast -->
        <Transition name="toast">
            <div v-if="toastShow" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg" style="background:#10b981;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                ส่งออกข้อมูลเรียบร้อยแล้ว
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsReportRow } from '@/composables/usePmsReports';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';

useHead({ title: 'รายงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const reportsApi = usePmsReports();
const yearsApi   = usePmsYears();
const cyclesApi  = usePmsCycles();
const deptsApi   = usePmsDepartments();
const teamsApi   = usePmsTeams();

const rows         = ref<PmsReportRow[]>([]);
const yearOptions  = ref<PmsYear[]>([]);
const cycleOptions = ref<PmsCycle[]>([]);
const deptOptions  = ref<PmsDepartment[]>([]);
const teamOptions  = ref<PmsTeam[]>([]);

const loading      = ref(false);
const errorMessage = ref('');
const toastShow    = ref(false);

const filterYear  = ref<number | ''>('');
const filterCycle = ref('');
const filterDept  = ref('');
const filterTeam  = ref('');

/** Cascade: ทีม filtered by department */
const filteredTeamOptions = computed(() => {
    if (!filterDept.value) return teamOptions.value;
    return teamOptions.value.filter(t => t.department_name === filterDept.value);
});

const fetchMasters = async () => {
    try {
        const [y, c, d, t] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
        deptOptions.value  = d.data;
        teamOptions.value  = t.data;
    } catch (e) {
        console.warn('[reports] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await reportsApi.list({
            year:  filterYear.value === '' ? undefined : Number(filterYear.value),
            cycle: filterCycle.value || undefined,
            dept:  filterDept.value  || undefined,
            team:  filterTeam.value  || undefined,
            limit: 1000,
        });
        rows.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
        rows.value = [];
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    filterYear.value = ''; filterCycle.value = '';
    filterDept.value = ''; filterTeam.value = '';
    fetchList();
};

/** CSV export of current rows (UTF-8 BOM so Excel opens Thai correctly) */
const csvCell = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const handleExport = () => {
    if (rows.value.length === 0) return;
    const headers = [
        'ลำดับ', 'รอบปีการประเมิน', 'รอบการประเมิน',
        'แผนก', 'ทีม', 'รหัสพนักงาน', 'ชื่อ-นามสกุล',
        'ตำแหน่ง', 'ระดับ', 'แบบประเมิน',
        'คะแนน KPI เฉลี่ย', 'คะแนน Competency เฉลี่ย', 'คะแนนรวมเฉลี่ย',
        'คะแนนสรุป', 'เกรด', 'อนุมัติแล้ว',
    ];
    const lines = [headers.map(csvCell).join(',')];
    rows.value.forEach((item, i) => {
        lines.push([
            i + 1,
            item.year ?? '',
            item.cycle_label ?? '',
            item.department_name ?? '',
            item.team_name ?? '',
            item.emp_code ?? '',
            item.employee_name ?? '',
            item.position_name ?? '',
            item.level_name ?? '',
            item.assessment_name ?? '',
            item.avg_kpi_score ?? '',
            item.avg_competency_score ?? '',
            item.avg_total_score ?? '',
            item.final_total_score ?? '',
            item.final_grade ?? '',
            item.is_approved ? 'ใช่' : (item.is_approved === false ? 'ไม่' : ''),
        ].map(csvCell).join(','));
    });

    const csv = '﻿' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pms-reports-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toastShow.value = true;
    setTimeout(() => { toastShow.value = false; }, 3000);
};

onMounted(async () => {
    await fetchMasters();
    await fetchList();
});
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
