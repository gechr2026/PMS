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
            <NuxtLink
                to="/pms/report/tracking"
                class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8l-4 4 4 4M8 12h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                กลับ
            </NuxtLink>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
            <div class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                กำลังโหลดข้อมูล...
            </div>
        </div>
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <template v-if="!loading && data">
            <!-- Section 1: ข้อมูลการประเมิน -->
            <div class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
                        <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                        <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        <line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ข้อมูลการประเมิน</span>
                </div>
                <div class="grid grid-cols-2 gap-6 px-6 py-5">
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">รอบปีการประเมิน</p>
                        <p class="text-sm text-gray-800">{{ filterYear || 'ทั้งหมด' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">รอบการประเมิน</p>
                        <p class="text-sm text-gray-800">{{ filterCycle || 'ทั้งหมด' }}</p>
                    </div>
                </div>
            </div>

            <!-- Section 2: ข้อมูลผู้ประเมิน -->
            <div class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
                        <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                        <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        <line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ข้อมูลผู้ประเมิน</span>
                </div>
                <div class="grid grid-cols-3 gap-6 px-6 py-5">
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">รหัสพนักงาน</p>
                        <p class="text-sm text-gray-800">{{ data.employee.emp_code || '—' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">ชื่อผู้ประเมิน</p>
                        <p class="text-sm text-gray-800">{{ data.employee.full_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">ตำแหน่ง</p>
                        <p class="text-sm text-gray-800">{{ data.employee.position_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">ระดับตำแหน่ง</p>
                        <p class="text-sm text-gray-800">{{ data.employee.level_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">ทีม</p>
                        <p class="text-sm text-gray-800">{{ data.employee.team_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="mb-1 text-sm font-semibold text-gray-600">แผนก</p>
                        <p class="text-sm text-gray-800">{{ data.employee.department_name || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- KPI cards: workload summary -->
            <div class="mb-5 grid grid-cols-4 gap-4">
                <div class="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                    <p class="mb-1 text-xs font-semibold text-gray-500">งานที่ได้รับ</p>
                    <p class="text-2xl font-bold text-gray-800">{{ data.summary.total }}</p>
                </div>
                <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center shadow-sm">
                    <p class="mb-1 text-xs font-semibold text-amber-700">ยังไม่ทำ + อยู่ระหว่างทำ</p>
                    <p class="text-2xl font-bold text-amber-700">{{ data.summary.pending + data.summary.in_progress }}</p>
                </div>
                <div class="rounded-xl border border-green-100 bg-green-50 p-4 text-center shadow-sm">
                    <p class="mb-1 text-xs font-semibold text-green-700">เสร็จแล้ว</p>
                    <p class="text-2xl font-bold text-green-700">{{ data.summary.done }}</p>
                </div>
                <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center shadow-sm">
                    <p class="mb-1 text-xs font-semibold text-blue-700">% Completed</p>
                    <p class="text-2xl font-bold text-blue-700">{{ formatPct(data.summary.completed_pct) }}</p>
                </div>
            </div>

            <!-- Section 3: ภาระงานประเมิน -->
            <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
                        <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                        <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        <line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/>
                        <line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ภาระงานประเมิน</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปี</th>
                                <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                                <th class="w-40 px-4 py-3 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                                <th class="w-40 px-4 py-3 text-center font-semibold text-gray-700">แผนก</th>
                                <th class="w-48 px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.tasks.length === 0">
                                <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบงานประเมิน</td>
                            </tr>
                            <tr
                                v-else
                                v-for="(task, index) in data.tasks"
                                :key="task.send_id"
                                class="border-b border-gray-100 transition hover:bg-gray-50"
                            >
                                <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ task.year ?? '—' }}</td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ task.cycle_label || '—' }}</td>
                                <td class="px-4 py-3 text-gray-800">{{ task.assessment_name || '—' }}</td>
                                <td class="px-4 py-3 text-gray-700">{{ task.position_name || '—' }}</td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ task.department_name || '—' }}</td>
                                <td class="px-4 py-3 text-center">
                                    <span
                                        class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                                        :class="statusClass(task.workload_status)"
                                    >{{ task.ui_status }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsTrackingDetailResponse } from '@/composables/usePmsTracking';

useHead({ title: 'รายละเอียดภาระงานประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const route = useRoute();
const trackingApi = usePmsTracking();

const employeeId = computed<number | null>(() => {
    const v = route.query.employee_id ?? route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});

const filterYear  = computed(() => (route.query.year  as string) || '');
const filterCycle = computed(() => (route.query.cycle as string) || '');

const data         = ref<PmsTrackingDetailResponse | null>(null);
const loading      = ref(false);
const errorMessage = ref('');

const formatPct = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '0.00%';
    return Number(n).toFixed(2) + '%';
};

const statusClass = (s: string) => {
    if (s === 'completed')   return 'bg-green-100 text-green-700';
    if (s === 'in_progress') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
};

const loadDetail = async () => {
    if (employeeId.value === null) {
        errorMessage.value = 'ไม่พบ employee_id ใน URL';
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await trackingApi.detail(employeeId.value, {
            year:  filterYear.value  ? Number(filterYear.value)  : undefined,
            cycle: filterCycle.value || undefined,
            limit: 200,
        });
        data.value = res;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 404
            ? 'ไม่พบข้อมูลพนักงานที่เลือก'
            : (err.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
        loading.value = false;
    }
};

onMounted(() => loadDetail());
</script>
