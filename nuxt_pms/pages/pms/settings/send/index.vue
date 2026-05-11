<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">การส่งแบบประเมิน</h1>
            </div>
            <NuxtLink
                to="/pms/settings/send/add"
                class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style="background:#4361ee;"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v8M8 12h8" stroke-linecap="round"/>
                </svg>
                เพิ่ม
            </NuxtLink>
        </div>

        <!-- Search Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <!-- Row 1 -->
            <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                    <select v-model="searchYear" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
                        <option value="">ทั้งหมด</option>
                        <option v-for="y in yearOptions" :key="y.id" :value="y.year">{{ y.year }}</option>
                    </select>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน</label>
                    <select v-model="searchCycle" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
                        <option value="">ทั้งหมด</option>
                        <option v-for="c in cycleOptions" :key="c.id" :value="c.cycle_label">{{ c.cycle_label }}</option>
                    </select>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อแบบประเมิน</label>
                    <input v-model="searchForm" type="text" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
            </div>
            <!-- Row 2 -->
            <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <select v-model="searchDept" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" @change="searchTeam = ''; searchPosition = ''">
                        <option value="">ทั้งหมด</option>
                        <option v-for="d in deptOptions" :key="d.id" :value="d.name">{{ d.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                    <select v-model="searchTeam" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" @change="searchPosition = ''">
                        <option value="">ทั้งหมด</option>
                        <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ตำแหน่ง</label>
                    <select v-model="searchPosition" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
                        <option value="">ทั้งหมด</option>
                        <option v-for="p in filteredPositionOptions" :key="p.id" :value="p.name">{{ p.name }}</option>
                    </select>
                </div>
            </div>
            <!-- Row 3 -->
            <div class="flex flex-wrap items-end gap-4">
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน</label>
                    <input v-model="searchEmpCode" type="text" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</label>
                    <input v-model="searchName" type="text" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
                <div class="flex gap-2">
                    <button class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90" style="background:#4361ee;" @click="handleSearch">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                        ค้นหา
                    </button>
                    <button class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100" @click="handleClear">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        ล้าง
                    </button>
                </div>
            </div>
        </div>

        <!-- Data Table -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                            <th class="w-36 px-4 py-3 text-center font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="7" class="px-5 py-10 text-center text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="sendList.length === 0">
                            <td colspan="7" class="px-5 py-10 text-center text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in sendList"
                            :key="item.id"
                            class="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                            <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.year }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.cycle_label }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.emp_code }}</td>
                            <td class="px-4 py-3 text-center text-gray-800">
                                <div>{{ item.full_name }}</div>
                                <span class="inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" :class="statusBadgeClass(item.status)">{{ item.status }}</span>
                            </td>
                            <td class="px-4 py-3 text-gray-800">{{ item.assessment_name }}</td>
                            <td class="px-4 py-3 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button
                                        v-if="item.status === 'pending'"
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
                                        title="ส่งแบบประเมิน"
                                        :disabled="actionId === item.id"
                                        @click="sendNow(item)"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                    <NuxtLink
                                        :to="`/pms/settings/send/add?id=${item.id}`"
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-500 transition hover:bg-blue-50"
                                        title="แก้ไข"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </NuxtLink>
                                    <button class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50" title="ลบ" @click="confirmDelete(item)">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M10 11v6M14 11v6" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Error banner -->
        <div
            v-if="errorMessage"
            class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
        >
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Delete Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e7515a" stroke-width="2">
                            <path d="M12 9v4M12 17h.01" stroke-linecap="round"/>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800">ยืนยันการลบ</h3>
                        <p class="text-sm text-gray-500">ต้องการลบการส่งแบบประเมินของ "{{ deleteTarget?.full_name }}" ใช่หรือไม่?</p>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="showDeleteModal = false">ยกเลิก</button>
                    <button class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style="background:#e7515a;" :disabled="deleting" @click="executeDelete">{{ deleting ? 'กำลังลบ...' : 'ลบ' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsSend, PmsSendStatus } from '@/composables/usePmsSends';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';
import type { PmsPosition } from '@/composables/usePmsPositions';

useHead({ title: 'การส่งแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const sendsApi     = usePmsSends();
const yearsApi     = usePmsYears();
const cyclesApi    = usePmsCycles();
const deptsApi     = usePmsDepartments();
const teamsApi     = usePmsTeams();
const positionsApi = usePmsPositions();

const sendList        = ref<PmsSend[]>([]);
const yearOptions     = ref<PmsYear[]>([]);
const cycleOptions    = ref<PmsCycle[]>([]);
const deptOptions     = ref<PmsDepartment[]>([]);
const teamOptions     = ref<PmsTeam[]>([]);
const positionOptions = ref<PmsPosition[]>([]);

const loading      = ref(false);
const deleting     = ref(false);
const actionId     = ref<number | null>(null);
const errorMessage = ref('');

const searchYear     = ref('');
const searchCycle    = ref('');
const searchForm     = ref('');
const searchDept     = ref('');
const searchTeam     = ref('');
const searchPosition = ref('');
const searchEmpCode  = ref('');
const searchName     = ref('');

// Cascading filter dropdowns (filter master options by parent selection)
const filteredTeamOptions = computed(() => {
    if (!searchDept.value) return teamOptions.value;
    return teamOptions.value.filter(t => t.department_name === searchDept.value);
});
const filteredPositionOptions = computed(() => {
    if (searchTeam.value) {
        return positionOptions.value.filter(p => p.team_name === searchTeam.value);
    }
    if (searchDept.value) {
        return positionOptions.value.filter(p => p.department_name === searchDept.value);
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
        console.warn('[send] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await sendsApi.list({
            year: searchYear.value ? Number(searchYear.value) : undefined,
            cycle: searchCycle.value || undefined,
            assessment_name: searchForm.value.trim() || undefined,
            dept: searchDept.value || undefined,
            team: searchTeam.value || undefined,
            position: searchPosition.value || undefined,
            emp_code: searchEmpCode.value.trim() || undefined,
            full_name: searchName.value.trim() || undefined,
            limit: 500,
        });
        sendList.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    searchYear.value = ''; searchCycle.value = ''; searchForm.value = '';
    searchDept.value = ''; searchTeam.value = ''; searchPosition.value = '';
    searchEmpCode.value = ''; searchName.value = '';
    fetchList();
};

const statusBadgeClass = (s: PmsSendStatus): string => {
    switch (s) {
        case 'pending':     return 'bg-gray-100 text-gray-600';
        case 'sent':        return 'bg-blue-100 text-blue-700';
        case 'opened':      return 'bg-cyan-100 text-cyan-700';
        case 'in_progress': return 'bg-yellow-100 text-yellow-700';
        case 'completed':   return 'bg-green-100 text-green-700';
        case 'cancelled':   return 'bg-red-100 text-red-700';
        default:            return 'bg-gray-100 text-gray-600';
    }
};

const sendNow = async (item: PmsSend) => {
    actionId.value = item.id;
    errorMessage.value = '';
    try {
        const res = await sendsApi.sendNow(item.id);
        const idx = sendList.value.findIndex(s => s.id === item.id);
        if (idx >= 0) sendList.value[idx] = res.data;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 403
            ? 'ไม่มีสิทธิ์ส่งแบบประเมิน'
            : (err.message || 'ส่งไม่สำเร็จ');
    } finally {
        actionId.value = null;
    }
};

// Delete
const showDeleteModal = ref(false);
const deleteTarget    = ref<PmsSend | null>(null);
const confirmDelete   = (item: PmsSend) => { deleteTarget.value = item; showDeleteModal.value = true; };
const executeDelete   = async () => {
    if (!deleteTarget.value) return;
    deleting.value = true;
    errorMessage.value = '';
    try {
        await sendsApi.remove(deleteTarget.value.id);
        sendList.value = sendList.value.filter(s => s.id !== deleteTarget.value!.id);
        showDeleteModal.value = false;
        deleteTarget.value = null;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 403
            ? 'ไม่มีสิทธิ์ลบข้อมูล (admin เท่านั้น)'
            : (err.message || 'ลบข้อมูลไม่สำเร็จ');
    } finally {
        deleting.value = false;
    }
};

onMounted(async () => {
    await Promise.all([fetchMasters(), fetchList()]);
});
</script>
