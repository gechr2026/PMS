<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">งานที่ได้รับมอบหมาย</h1>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid grid-cols-3 gap-4">
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
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">สถานะ</label>
                    <div class="relative">
                        <select v-model="filterStatus" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option>ยังไม่เข้าทำแบบประเมิน</option>
                            <option>อยู่ระหว่างการประเมิน</option>
                            <option>ประเมินเสร็จสิ้นแล้ว</option>
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
                            <th class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
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
                            <td class="px-4 py-3 font-medium text-gray-800">{{ item.full_name }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ item.assessment_name }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.year }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.cycle_label }}</td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                                    :class="{
                                        'bg-gray-100 text-gray-600'  : item.derivedStatus === 'ยังไม่เข้าทำแบบประเมิน',
                                        'bg-amber-100 text-amber-700': item.derivedStatus === 'อยู่ระหว่างการประเมิน',
                                        'bg-green-100 text-green-700': item.derivedStatus === 'ประเมินเสร็จสิ้นแล้ว',
                                    }"
                                >{{ item.derivedStatus }}</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <!-- Edit: ยังไม่ทำ / กำลังทำ -->
                                <NuxtLink
                                    v-if="item.derivedStatus !== 'ประเมินเสร็จสิ้นแล้ว'"
                                    :to="`/pms/assigned/view?send_id=${item.send_id}`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500 transition hover:bg-blue-100"
                                    title="ทำแบบประเมิน"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </NuxtLink>
                                <!-- View: ประเมินเสร็จ -->
                                <NuxtLink
                                    v-else
                                    :to="`/pms/assigned/view?send_id=${item.send_id}&readonly=1`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                                    title="ดูผลประเมิน"
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
import type { PmsSend } from '@/composables/usePmsSends';
import type { PmsEvaluation, PmsEvaluationRole } from '@/composables/usePmsEvaluations';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';

useHead({ title: 'งานที่ได้รับมอบหมาย | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const sendsApi       = usePmsSends();
const evaluationsApi = usePmsEvaluations();
const yearsApi       = usePmsYears();
const cyclesApi      = usePmsCycles();
const { profile }    = useAuth();

type DerivedStatus = 'ยังไม่เข้าทำแบบประเมิน' | 'อยู่ระหว่างการประเมิน' | 'ประเมินเสร็จสิ้นแล้ว';

interface Row {
    send_id: number;
    full_name: string;
    emp_code: string;
    assessment_name: string;
    year: number | string;
    cycle_label: string;
    derivedStatus: DerivedStatus;
    rawSendStatus: string;
}

const rows           = ref<Row[]>([]);
const yearOptions    = ref<PmsYear[]>([]);
const cycleOptions   = ref<PmsCycle[]>([]);
const loading        = ref(false);
const errorMessage   = ref('');

const filterYear   = ref('');
const filterCycle  = ref('');
const filterStatus = ref<DerivedStatus | ''>('');

// Map current user's role -> evaluator_role they're responsible for
const evaluatorRoleForUser = (): PmsEvaluationRole => {
    const r = profile.value?.role;
    if (r === 'manager')   return 'manager';
    if (r === 'executive') return 'executive';
    // admin/officer/null → default to 'self'
    return 'self';
};

const fetchMasters = async () => {
    try {
        const [y, c] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
    } catch (e) {
        console.warn('[assigned] failed to load masters', e);
    }
};

const fetchData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // 1) sends — officer ดูเฉพาะของตนเอง · role อื่นดูทุก send
        const role = profile.value?.role;
        const isOfficer = role === 'officer';

        const sendsRes = await sendsApi.list({
            year:  filterYear.value  ? Number(filterYear.value) : undefined,
            cycle: filterCycle.value || undefined,
            // Officer: filter by their own employee record (auth_user_id matched)
            // We don't know our own employee_id here, so we let RLS filter:
            // (sends are visible to all auth users, but downstream we filter rows)
            limit: 500,
        });

        let sends: PmsSend[] = sendsRes.data;

        // For officer: only keep sends where employee.username matches user's email
        // (since pms_employees.auth_user_id may not be linked, we fallback to username)
        if (isOfficer && profile.value?.email) {
            sends = sends.filter(s => s.username === profile.value!.email);
        }

        if (sends.length === 0) {
            rows.value = [];
            return;
        }

        // 2) Load my evaluation for each send (parallel)
        const myRole = evaluatorRoleForUser();
        const evals = await Promise.all(
            sends.map(s =>
                evaluationsApi
                    .list({ send_id: s.id, evaluator_role: myRole, limit: 1 })
                    .then(r => r.data[0] ?? null)
                    .catch(() => null)
            )
        );

        // 3) Build rows
        const built: Row[] = sends.map((s, i) => {
            const e = evals[i];
            let derived: DerivedStatus = 'ยังไม่เข้าทำแบบประเมิน';
            if (e) {
                if (e.status === 'submitted' || e.status === 'approved') {
                    derived = 'ประเมินเสร็จสิ้นแล้ว';
                } else if (e.status === 'draft') {
                    derived = 'อยู่ระหว่างการประเมิน';
                }
            }
            return {
                send_id: s.id,
                full_name: s.full_name ?? '-',
                emp_code: s.emp_code ?? '',
                assessment_name: s.assessment_name ?? '-',
                year: s.year ?? '',
                cycle_label: s.cycle_label ?? '',
                rawSendStatus: s.status,
                derivedStatus: derived,
            };
        });

        // Apply status filter (frontend, since derivedStatus is computed)
        rows.value = filterStatus.value
            ? built.filter(r => r.derivedStatus === filterStatus.value)
            : built;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchData();
const handleClear  = () => {
    filterYear.value = '';
    filterCycle.value = '';
    filterStatus.value = '';
    fetchData();
};

onMounted(async () => {
    await fetchMasters();
    await fetchData();
});
</script>
