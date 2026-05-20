<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">สรุปผลการประเมิน</h1>
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

            <!-- Row 2: แผนก + ทีม + ตำแหน่ง -->
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

            <!-- Row 3: รหัสพนักงาน + ชื่อ-นามสกุล -->
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน</label>
                    <input
                        v-model="filterEmpCode"
                        type="text"
                        placeholder=""
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</label>
                    <input
                        v-model="filterName"
                        type="text"
                        placeholder=""
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                    />
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
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                            <th class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                            <th class="w-20 px-4 py-3 text-center font-semibold text-gray-700">จัดการ</th>
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
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.year ?? '—' }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.cycle_label || '—' }}</td>
                            <td class="px-4 py-3 text-center font-medium text-gray-700">{{ item.emp_code || '—' }}</td>
                            <td class="px-4 py-3 font-medium text-gray-800">{{ item.employee_name || '—' }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ item.assessment_name || '—' }}</td>
                            <td class="px-4 py-3 text-center">
                                <NuxtLink
                                    :to="`/pms/summary/view?send_id=${item.send_id}`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                                    title="ดูสรุปผลการประเมิน"
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
import type { PmsSummaryRow } from '@/composables/usePmsSummary';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';
import type { PmsPosition } from '@/composables/usePmsPositions';

useHead({ title: 'สรุปผลการประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const summaryApi   = usePmsSummary();
const yearsApi     = usePmsYears();
const cyclesApi    = usePmsCycles();
const deptsApi     = usePmsDepartments();
const teamsApi     = usePmsTeams();
const positionsApi = usePmsPositions();

const rows         = ref<PmsSummaryRow[]>([]);
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
        console.warn('[summary] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await summaryApi.list({
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
    filterDept.value = ''; filterTeam.value = ''; filterPosition.value = '';
    filterEmpCode.value = ''; filterName.value = '';
    fetchList();
};

onMounted(async () => {
    await fetchMasters();
    await fetchList();
});
</script>
