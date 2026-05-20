<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 3" stroke-linecap="round"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">ผลการประเมิน</h1>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid grid-cols-2 gap-4" style="max-width:420px;">
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

        <!-- Table Card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">คะแนนที่ได้</th>
                            <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">ระดับผลการประเมิน</th>
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
                            <td class="px-4 py-3 font-medium text-gray-800">{{ item.assessment_name }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.year }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.cycle_label }}</td>
                            <td class="px-4 py-3 text-center font-semibold text-gray-800">
                                {{ formatScore(item.final_total_score ?? item.avg_total_score) }}
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    v-if="item.final_grade"
                                    class="inline-block rounded-full px-3 py-1 text-xs font-bold"
                                    :class="gradeClass(item.final_grade)"
                                >{{ item.final_grade }}</span>
                                <span v-else class="text-xs text-gray-400">—</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <NuxtLink
                                    :to="`/pms/evaluation/view?send_id=${item.send_id}`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                                    title="ดูผลการประเมิน"
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
import { ref, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsEvaluationResultRow } from '@/composables/usePmsEvaluationResults';
import type { PmsYear } from '@/composables/usePmsYears';

useHead({ title: 'ผลการประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const resultsApi = usePmsEvaluationResults();
const yearsApi   = usePmsYears();

const rows         = ref<PmsEvaluationResultRow[]>([]);
const yearOptions  = ref<PmsYear[]>([]);
const loading      = ref(false);
const errorMessage = ref('');

const filterYear = ref<string>('');

const fetchYears = async () => {
    try {
        const res = await yearsApi.list({ limit: 200 });
        yearOptions.value = res.data.slice().sort((a, b) => b.year - a.year);
    } catch (e) {
        console.warn('[evaluation] failed to load years', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await resultsApi.list({
            year: filterYear.value ? Number(filterYear.value) : undefined,
            // Show only sends that have at least one submitted/approved evaluation
            // so the page doesn't surface empty rows. Toggle if you want to see all.
            has_results: true,
            limit: 200,
        });
        rows.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const formatScore = (n: number | null): string => {
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

const handleSearch = () => fetchList();
const handleClear  = () => { filterYear.value = ''; fetchList(); };

onMounted(async () => {
    await fetchYears();
    await fetchList();
});
</script>
