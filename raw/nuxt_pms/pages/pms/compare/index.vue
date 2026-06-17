<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                    <path d="M8 6h13M8 12h9M8 18h7"/>
                    <circle cx="4" cy="6" r="1.5" fill="#3b82f6"/>
                    <circle cx="4" cy="12" r="1.5" fill="#3b82f6"/>
                    <circle cx="4" cy="18" r="1.5" fill="#3b82f6"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">เปรียบเทียบผลการประเมิน</h1>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div style="max-width: 360px;">
                <!-- Year filter -->
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
            </div>

            <!-- Current user chip (read-only) -->
            <div v-if="resolving" class="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <svg class="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                กำลังโหลดข้อมูลพนักงาน...
            </div>
            <div v-else-if="selectedEmployee" class="mt-4 flex items-center rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5">
                <div class="flex items-center gap-3 text-sm">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="rounded bg-white px-1.5 py-0.5 text-xs font-bold text-blue-700">{{ selectedEmployee.emp_code }}</span>
                            <span class="font-semibold text-gray-800">{{ selectedEmployee.full_name }}</span>
                        </div>
                        <div class="text-xs text-gray-600">
                            {{ selectedEmployee.position_name }} · {{ selectedEmployee.team_name }} · {{ selectedEmployee.department_name }}
                            <span v-if="selectedEmployee.level_name" class="ml-1 rounded bg-gray-100 px-1.5 py-0.5">{{ selectedEmployee.level_name }}</span>
                        </div>
                    </div>
                </div>
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
                            <th class="w-36 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">KPI</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">Competency</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รวม</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">ระดับคะแนน</th>
                            <th class="w-36 px-4 py-3 text-center font-semibold text-gray-700">ได้เลื่อนตำแหน่ง</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading || resolving">
                            <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="filteredRows.length === 0">
                            <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูลผลการประเมิน</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in filteredRows"
                            :key="item.send_id"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-4 py-3.5 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3.5 text-center text-gray-700">{{ item.year ?? '—' }}</td>
                            <td class="px-4 py-3.5 text-center text-gray-700">{{ item.cycle_label || '—' }}</td>
                            <td class="px-4 py-3.5 text-center font-medium text-gray-800">{{ formatScore(item.avg_kpi_score) }}</td>
                            <td class="px-4 py-3.5 text-center font-medium text-gray-800">{{ formatScore(item.avg_competency_score) }}</td>
                            <td class="px-4 py-3.5 text-center font-semibold text-gray-900">{{ formatScore(item.final_total_score ?? item.avg_total_score) }}</td>
                            <td class="px-4 py-3.5 text-center">
                                <span
                                    v-if="item.final_grade"
                                    class="inline-block rounded-full px-3 py-1 text-xs font-bold"
                                    :class="gradeClass(item.final_grade)"
                                >{{ item.final_grade }}</span>
                                <span v-else class="text-xs text-gray-400">—</span>
                            </td>
                            <td class="px-4 py-3.5 text-center">
                                <div v-if="item.promoted" class="flex justify-center" title="ได้เลื่อนตำแหน่ง">
                                    <div class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M8 21h8M12 17v4M17 3H7l1 8a4 4 0 0 0 8 0l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M7 3H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 3h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                                <span v-else class="text-xs text-gray-300">—</span>
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
import type { PmsComparePickerEmployee, PmsCompareRow } from '@/composables/usePmsCompare';
import type { PmsYear } from '@/composables/usePmsYears';

useHead({ title: 'เปรียบเทียบผลการประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const { profile }  = useAuth();
const compareApi   = usePmsCompare();
const yearsApi     = usePmsYears();

const selectedEmployee = ref<PmsComparePickerEmployee | null>(null);
const resolving        = ref(false);

const yearOptions = ref<PmsYear[]>([]);
const filterYear  = ref<string>('');

const rows         = ref<PmsCompareRow[]>([]);
const loading      = ref(false);
const errorMessage = ref('');

const filteredRows = computed(() => {
    if (!filterYear.value) return rows.value;
    return rows.value.filter(r => String(r.year) === filterYear.value);
});

const fetchYears = async () => {
    try {
        const res = await yearsApi.list({ limit: 200 });
        yearOptions.value = res.data.slice().sort((a, b) => b.year - a.year);
    } catch (e) {
        console.warn('[compare] failed to load years', e);
    }
};

const loadCompare = async () => {
    if (!selectedEmployee.value) return;
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await compareApi.get(selectedEmployee.value.id, { limit: 200 });
        rows.value = res.data;
    } catch (e) {
        const apiErr = e as PmsApiError;
        errorMessage.value = apiErr.status === 404
            ? 'ไม่พบข้อมูลพนักงานที่เลือก'
            : (apiErr.message || 'โหลดข้อมูลเปรียบเทียบไม่สำเร็จ');
        rows.value = [];
    } finally {
        loading.value = false;
    }
};

const resolveSelf = async () => {
    const username = profile.value?.username;
    if (!username) {
        errorMessage.value = 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่';
        return;
    }
    resolving.value = true;
    try {
        const res = await compareApi.searchEmployees({ q: username, limit: 1 });
        const emp = res.data[0];
        if (!emp) {
            errorMessage.value = 'ไม่พบข้อมูลพนักงาน กรุณาติดต่อผู้ดูแลระบบ';
            return;
        }
        selectedEmployee.value = emp;
        await loadCompare();
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        resolving.value = false;
    }
};

const formatScore = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(2);
};

const gradeClass = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    const map: Record<string, string> = {
        'A+': 'bg-purple-100 text-purple-700',
        'A' : 'bg-blue-100 text-blue-700',
        'B' : 'bg-green-100 text-green-700',
        'C' : 'bg-amber-100 text-amber-700',
        'D' : 'bg-red-100 text-red-700',
        'F' : 'bg-red-200 text-red-800',
    };
    return map[grade] ?? 'bg-gray-100 text-gray-600';
};

onMounted(async () => {
    await fetchYears();
    await resolveSelf();
});
</script>
