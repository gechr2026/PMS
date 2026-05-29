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
                <h1 class="text-lg font-bold text-gray-800">ข้อมูลพนักงาน</h1>
            </div>
            <div class="flex items-center gap-2">
                <!-- นำเข้า -->
                <NuxtLink
                    to="/pms/settings/employee/import"
                    class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style="background:#22c55e;"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="17 8 12 3 7 8" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round"/>
                    </svg>
                    นำเข้า
                </NuxtLink>
                <!-- เพิ่ม -->
                <NuxtLink
                    to="/pms/settings/employee/add"
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
        </div>

        <!-- Search Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <!-- Row 1: ชื่อบัญชี + รหัสพนักงาน + ชื่อ-นามสกุล -->
            <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อบัญชี</label>
                    <input
                        v-model="searchUsername"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน</label>
                    <input
                        v-model="searchCode"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</label>
                    <input
                        v-model="searchName"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                </div>
            </div>
            <!-- Row 2: ทีม + สถานะ + buttons -->
            <div class="flex flex-wrap items-end gap-4">
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                    <select
                        v-model="searchTeam"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    >
                        <option value="">ทั้งหมด</option>
                        <option v-for="t in teamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
                    </select>
                </div>
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">สถานะ</label>
                    <select
                        v-model="searchStatus"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    >
                        <option value="">ทั้งหมด</option>
                        <option value="active">ใช้งาน</option>
                        <option value="inactive">ไม่ใช้งาน</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button
                        class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        style="background:#4361ee;"
                        @click="handleSearch"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
                        </svg>
                        ค้นหา
                    </button>
                    <button
                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                        @click="handleClear"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
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
                            <th class="w-16 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">ชื่อบัญชี</th>
                            <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">ทีม</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                            <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">จัดการ</th>
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
                        <tr v-else-if="employeeList.length === 0">
                            <td colspan="7" class="px-5 py-10 text-center text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in employeeList"
                            :key="item.id"
                            class="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                            <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3 text-center text-gray-800">{{ item.username }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.emp_code }}</td>
                            <td class="px-4 py-3 text-center text-gray-800">{{ item.full_name }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.team_name }}</td>
                            <td class="px-4 py-3 text-center">
                                <button
                                    type="button"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
                                    :class="item.is_active ? 'bg-green-500' : 'bg-gray-300'"
                                    :disabled="togglingId === item.id"
                                    @click="toggleStatus(item)"
                                >
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                                        :class="item.is_active ? 'translate-x-6' : 'translate-x-1'"
                                    />
                                </button>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button
                                        v-if="!item.auth_user_id"
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                                        title="สร้างบัญชีผู้ใช้"
                                        @click="openCreateUser(item)"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <line x1="19" y1="8" x2="19" y2="14" stroke-linecap="round"/>
                                            <line x1="22" y1="11" x2="16" y2="11" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                    <span
                                        v-else
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-500"
                                        title="มีบัญชีผู้ใช้แล้ว"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                    <NuxtLink
                                        :to="`/pms/settings/employee/add?id=${item.id}`"
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-500 transition hover:bg-blue-50"
                                        title="แก้ไข"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </NuxtLink>
                                    <button
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-200 text-cyan-500 transition hover:bg-cyan-50"
                                        title="รีเซ็ต"
                                        @click="confirmReset(item)"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                    <button
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
                                        title="ลบ"
                                        @click="confirmDelete(item)"
                                    >
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
                        <p class="text-sm text-gray-500">ต้องการลบพนักงาน "{{ deleteTarget?.full_name }}" ใช่หรือไม่?</p>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="showDeleteModal = false">ยกเลิก</button>
                    <button class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style="background:#e7515a;" :disabled="deleting" @click="executeDelete">{{ deleting ? 'กำลังลบ...' : 'ลบ' }}</button>
                </div>
            </div>
        </div>

        <!-- Create User Modal -->
        <div v-if="showCreateUserModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14" stroke-linecap="round"/>
                            <line x1="22" y1="11" x2="16" y2="11" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800">สร้างบัญชีผู้ใช้</h3>
                        <p class="text-sm text-gray-500">สำหรับ "{{ createUserTarget?.full_name }}" ({{ createUserTarget?.emp_code }})</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-600">อีเมล / ชื่อผู้ใช้</label>
                        <input
                            v-model="createUserForm.email"
                            type="email"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-600">บทบาท (role) <span class="text-red-500">*</span></label>
                        <select
                            v-model="createUserForm.role"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        >
                            <option value="officer">Officer — พนักงาน</option>
                            <option value="supervisor">Supervisor — หัวหน้างาน (peer)</option>
                            <option value="manager">Manager — หัวหน้า</option>
                            <option value="executive">Executive — ผู้บริหาร</option>
                            <option value="admin">Admin — ผู้ดูแลระบบ</option>
                        </select>
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-600">รหัสผ่านเริ่มต้น (ไม่บังคับ)</label>
                        <input
                            v-model="createUserForm.password"
                            type="text"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            placeholder="เว้นว่างเพื่อใช้ค่าเริ่มต้น (Temp@2026!)"
                        />
                    </div>
                </div>
                <div v-if="createUserError" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ createUserError }}</div>
                <div class="mt-5 flex justify-end gap-2">
                    <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" :disabled="creatingUser" @click="showCreateUserModal = false">ยกเลิก</button>
                    <button
                        class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        style="background:#059669;"
                        :disabled="creatingUser || !createUserForm.email.trim()"
                        @click="executeCreateUser"
                    >{{ creatingUser ? 'กำลังสร้าง...' : 'สร้างบัญชี' }}</button>
                </div>
            </div>
        </div>

        <!-- Reset Modal -->
        <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div class="mb-4 flex items-center gap-3">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke-linecap="round"/>
                            <path d="M3 3v5h5" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800">ยืนยันการรีเซ็ต</h3>
                        <p class="text-sm text-gray-500">ต้องการรีเซ็ตข้อมูลพนักงาน "{{ resetTarget?.full_name }}" ใช่หรือไม่?</p>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="showResetModal = false">ยกเลิก</button>
                    <button class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style="background:#06b6d4;" @click="showResetModal = false">รีเซ็ต</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsEmployee } from '@/composables/usePmsEmployees';
import type { PmsTeam } from '@/composables/usePmsTeams';

useHead({ title: 'ข้อมูลพนักงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const employeesApi = usePmsEmployees();
const teamsApi     = usePmsTeams();

const employeeList = ref<PmsEmployee[]>([]);
const teamOptions  = ref<PmsTeam[]>([]);
const loading      = ref(false);
const deleting     = ref(false);
const togglingId   = ref<number | null>(null);
const errorMessage = ref('');

const searchUsername = ref('');
const searchCode     = ref('');
const searchName     = ref('');
const searchTeam     = ref('');
const searchStatus   = ref('');

const fetchTeams = async () => {
    try {
        const res = await teamsApi.list({ limit: 500 });
        teamOptions.value = res.data;
    } catch (e) {
        console.warn('[employee] failed to load teams', e);
    }
};

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await employeesApi.list({
            username: searchUsername.value.trim() || undefined,
            emp_code: searchCode.value.trim()     || undefined,
            full_name: searchName.value.trim()    || undefined,
            team: searchTeam.value || undefined,
            is_active: searchStatus.value === 'active' ? true
                : searchStatus.value === 'inactive' ? false
                : undefined,
            limit: 500,
        });
        employeeList.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    searchUsername.value = ''; searchCode.value = ''; searchName.value = '';
    searchTeam.value = ''; searchStatus.value = '';
    fetchList();
};

const handleImport = () => {
    // import flow is on a separate page; left as no-op here
};

const toggleStatus = async (item: PmsEmployee) => {
    togglingId.value = item.id;
    errorMessage.value = '';
    try {
        const res = await employeesApi.update(item.id, { is_active: !item.is_active });
        const idx = employeeList.value.findIndex(e => e.id === item.id);
        if (idx >= 0) employeeList.value[idx] = res.data;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 403
            ? 'ไม่มีสิทธิ์เปลี่ยนสถานะ (admin เท่านั้น)'
            : (err.message || 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally {
        togglingId.value = null;
    }
};

// Delete
const showDeleteModal = ref(false);
const deleteTarget    = ref<PmsEmployee | null>(null);
const confirmDelete   = (item: PmsEmployee) => { deleteTarget.value = item; showDeleteModal.value = true; };
const executeDelete   = async () => {
    if (!deleteTarget.value) return;
    deleting.value = true;
    errorMessage.value = '';
    try {
        await employeesApi.remove(deleteTarget.value.id);
        employeeList.value = employeeList.value.filter(e => e.id !== deleteTarget.value!.id);
        showDeleteModal.value = false;
        deleteTarget.value = null;
    } catch (e) {
        const err = e as PmsApiError;
        if (err.status === 403)      errorMessage.value = 'ไม่มีสิทธิ์ลบข้อมูล (admin เท่านั้น)';
        else if (err.status === 409) errorMessage.value = 'ลบไม่ได้: มีข้อมูลอื่นอ้างอิงถึงพนักงานนี้';
        else                          errorMessage.value = err.message || 'ลบข้อมูลไม่สำเร็จ';
    } finally {
        deleting.value = false;
    }
};

// Reset (no-op stub)
const showResetModal = ref(false);
const resetTarget    = ref<PmsEmployee | null>(null);
const confirmReset   = (item: PmsEmployee) => { resetTarget.value = item; showResetModal.value = true; };

// Create user — calls public.pms_create_user(p_email, p_role, p_full_name, p_username, p_password).
// The RPC's auto-link logic populates pms_employees.auth_user_id when the
// employee row's username matches the new auth account's email/username,
// so successful creation also wires up the rater-lookup chain.
const supabase = useSupabase();
const showCreateUserModal = ref(false);
const createUserTarget    = ref<PmsEmployee | null>(null);
const createUserError     = ref('');
const creatingUser        = ref(false);
type CreateUserRole = 'officer' | 'supervisor' | 'manager' | 'executive' | 'admin';
const createUserForm = ref<{ email: string; role: CreateUserRole; password: string }>({
    email: '', role: 'officer', password: '',
});

const openCreateUser = (item: PmsEmployee) => {
    createUserTarget.value = item;
    createUserError.value = '';
    createUserForm.value = {
        email: (item.username ?? '').trim(),
        role: 'officer',
        password: '',
    };
    showCreateUserModal.value = true;
};

const executeCreateUser = async () => {
    if (!createUserTarget.value) return;
    creatingUser.value = true;
    createUserError.value = '';
    try {
        const target = createUserTarget.value;
        const { error } = await supabase.rpc('pms_create_user', {
            p_email:     createUserForm.value.email.trim(),
            p_role:      createUserForm.value.role,
            p_full_name: target.full_name ?? null,
            p_username:  target.username ?? null,
            p_password:  createUserForm.value.password.trim() || null,
        });
        if (error) {
            const code = (error as { code?: string }).code;
            if (code === '42501')      createUserError.value = 'ไม่มีสิทธิ์สร้างบัญชี (admin เท่านั้น)';
            else if (code === '23505') createUserError.value = 'บัญชีนี้มีอยู่แล้วในระบบ';
            else                        createUserError.value = error.message || 'สร้างบัญชีไม่สำเร็จ';
            return;
        }
        showCreateUserModal.value = false;
        createUserTarget.value = null;
        // Reload so the new auth_user_id link shows as the green check icon.
        await fetchList();
    } catch (e) {
        createUserError.value = (e as Error).message || 'สร้างบัญชีไม่สำเร็จ';
    } finally {
        creatingUser.value = false;
    }
};

onMounted(async () => {
    await Promise.all([fetchTeams(), fetchList()]);
});
</script>
