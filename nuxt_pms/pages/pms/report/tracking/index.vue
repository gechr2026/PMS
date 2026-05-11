<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#fefce8;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="1.8">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                        <path d="M9 12h6M9 16h4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ติดตามภาระงานประเมิน</h1>
            </div>
            <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style="background:#16a34a;"
                @click="handleExport"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"/>
                    <polyline points="7 10 12 15 17 10" stroke-linecap="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round"/>
                </svg>
                ส่งออก
            </button>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <!-- Row 1 -->
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

            <!-- Row 2 -->
            <div class="mb-4 grid grid-cols-3 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <div class="relative">
                        <select
                            v-model="filterDept"
                            class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                            @change="filterTeam = ''; filterPosition = ''"
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
                        <select
                            v-model="filterTeam"
                            class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                            @change="filterPosition = ''"
                        >
                            <option value="">ทั้งหมด</option>
                            <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ตำแหน่ง</label>
                    <div class="relative">
                        <select v-model="filterPosition" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="p in filteredPositionOptions" :key="p.id" :value="p.name">{{ p.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>

            <!-- Row 3 -->
            <div class="mb-5 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน</label>
                    <input
                        v-model="filterEmpCode"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                        placeholder=""
                    />
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</label>
                    <input
                        v-model="filterName"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                        placeholder=""
                    />
                </div>
            </div>

            <!-- Search/Clear Buttons -->
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style="background:#4361ee;"
                    @click="handleSearch"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
                    </svg>
                    ค้นหา
                </button>
                <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100"
                    @click="handleClear"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 20L4 4M20 4L4 20" stroke-linecap="round"/>
                    </svg>
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
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการ<br>ประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการ<br>ประเมิน</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รหัส<br>พนักงาน</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">จำนวนงาน<br>ที่ได้รับ</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">จำนวนงาน<br>ที่ยังไม่ทำ</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">จำนวนงาน<br>ที่อยู่ระหว่างทำ</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">จำนวนงาน<br>ที่เสร็จแล้ว</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">% Completed</th>
                            <th class="w-20 px-4 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="11" class="px-4 py-10 text-center text-sm text-gray-400">
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
                            <td colspan="11" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(row, index) in rows"
                            :key="`${row.employee_id}-${row.year_id}-${row.cycle_id}`"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.year ?? '—' }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.cycle_label || '—' }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.emp_code || '—' }}</td>
                            <td class="px-4 py-3 text-gray-800">{{ row.employee_name || '—' }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.total }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.pending }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.in_progress }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.done }}</td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    class="font-semibold"
                                    :class="pctClass(row.completed_pct)"
                                >{{ formatPct(row.completed_pct) }}</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <NuxtLink
                                    :to="`/pms/report/tracking/view?employee_id=${row.employee_id}${row.year ? '&year=' + row.year : ''}${row.cycle_label ? '&cycle=' + encodeURIComponent(row.cycle_label) : ''}`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                                    title="ดูรายละเอียด"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </NuxtLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsTrackingSummaryRow } from '@/composables/usePmsTracking';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';
import type { PmsPosition } from '@/composables/usePmsPositions';

useHead({ title: 'ติดตามภาระงานประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const trackingApi  = usePmsTracking();
const yearsApi     = usePmsYears();
const cyclesApi    = usePmsCycles();
const deptsApi     = usePmsDepartments();
const teamsApi     = usePmsTeams();
const positionsApi = usePmsPositions();

const rows         = ref<PmsTrackingSummaryRow[]>([]);
const yearOptions  = ref<PmsYear[]>([]);
const cycleOptions = ref<PmsCycle[]>([]);
const deptOptions  = ref<PmsDepartment[]>([]);
const teamOptions  = ref<PmsTeam[]>([]);
const positionOptions = ref<PmsPosition[]>([]);

const loading      = ref(false);
const errorMessage = ref('');

const filterYear     = ref('');
const filterCycle    = ref('');
const filterDept     = ref('');
const filterTeam     = ref('');
const filterPosition = ref('');
const filterEmpCode  = ref('');
const filterName     = ref('');

// Cascading dropdowns (frontend filter)
const filteredTeamOptions = computed(() => {
    if (!filterDept.value) return teamOptions.value;
    return teamOptions.value.filter(t => t.department_name === filterDept.value);
});
const filteredPositionOptions = computed(() => {
    if (filterTeam.value) {
        return positionOptions.value.filter(p => p.team_name === filterTeam.value);
    }
    if (filterDept.value) {
        return positionOptions.value.filter(p => p.department_name === filterDept.value);
    }
    return positionOptions.value;
});

const fetchMasters = async () => {
    try {
        const [y, c, d, t, p] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
            positionsApi.list({ limit: 500 }),
        ]);
        yearOptions.value     = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value    = c.data;
        deptOptions.value     = d.data;
        teamOptions.value     = t.data;
        positionOptions.value = p.data;
    } catch (e) {
        console.warn('[tracking] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await trackingApi.list({
            year:      filterYear.value ? Number(filterYear.value) : undefined,
            cycle:     filterCycle.value || undefined,
            dept:      filterDept.value || undefined,
            team:      filterTeam.value || undefined,
            position:  filterPosition.value || undefined,
            emp_code:  filterEmpCode.value.trim() || undefined,
            full_name: filterName.value.trim() || undefined,
            limit:     500,
        });
        rows.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    filterYear.value = ''; filterCycle.value = '';
    filterDept.value = ''; filterTeam.value  = ''; filterPosition.value = '';
    filterEmpCode.value = ''; filterName.value = '';
    fetchList();
};

// Quick CSV export of current rows (in-memory)
const handleExport = () => {
    if (rows.value.length === 0) {
        alert('ไม่มีข้อมูลสำหรับส่งออก');
        return;
    }
    const headers = [
        'รอบปีการประเมิน', 'รอบการประเมิน', 'รหัสพนักงาน', 'ชื่อ-นามสกุล',
        'แผนก', 'ทีม', 'ตำแหน่ง',
        'จำนวนงานที่ได้รับ', 'ยังไม่ทำ', 'อยู่ระหว่างทำ', 'เสร็จแล้ว', '% Completed',
    ];
    const csvRows = [headers.join(',')];
    for (const r of rows.value) {
        const values = [
            r.year ?? '',
            r.cycle_label ?? '',
            r.emp_code ?? '',
            r.employee_name ?? '',
            r.department_name ?? '',
            r.team_name ?? '',
            r.position_name ?? '',
            r.total,
            r.pending,
            r.in_progress,
            r.done,
            (r.completed_pct ?? 0).toFixed(2) + '%',
        ];
        csvRows.push(values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    const csv = '﻿' + csvRows.join('\n');   // BOM for Excel + Thai
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const formatPct = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '0.00%';
    return Number(n).toFixed(2) + '%';
};

const pctClass = (n: number | null | undefined): string => {
    const v = n ?? 0;
    if (v >= 100) return 'text-green-600';
    if (v >=  67) return 'text-blue-600';
    if (v >=  34) return 'text-amber-600';
    return 'text-red-500';
};

onMounted(async () => {
    await fetchMasters();
    await fetchList();
});
</script>
