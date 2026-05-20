<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f0fdf4;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.8">
                        <rect x="2" y="7" width="6" height="14" rx="1"/>
                        <rect x="9" y="2" width="6" height="19" rx="1"/>
                        <rect x="16" y="10" width="6" height="11" rx="1"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">แผนกในองค์กร</h1>
            </div>
            <NuxtLink
                to="/pms/settings/department/add"
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
            <div class="flex flex-wrap items-end gap-4">
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <input
                        v-model="searchName"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                </div>
                <div class="min-w-[200px]">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสแผนกย่อ</label>
                    <input
                        v-model="searchCode"
                        type="text"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
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

        <!-- Error banner -->
        <div
            v-if="errorMessage"
            class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
        >
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Data Table -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-gray-50">
                        <th class="w-20 px-5 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                        <th class="px-5 py-3 text-center font-semibold text-gray-700">แผนก</th>
                        <th class="px-5 py-3 text-center font-semibold text-gray-700">รหัสแผนกย่อ</th>
                        <th class="w-28 px-5 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                        <th class="w-36 px-5 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="5" class="px-5 py-10 text-center text-gray-400">
                            <div class="inline-flex items-center gap-2">
                                <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                </svg>
                                กำลังโหลดข้อมูล...
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="deptList.length === 0">
                        <td colspan="5" class="px-5 py-10 text-center text-gray-400">ไม่พบข้อมูล</td>
                    </tr>
                    <tr
                        v-else
                        v-for="(item, index) in deptList"
                        :key="item.id"
                        class="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                        <td class="px-5 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                        <td class="px-5 py-3 text-center text-gray-800">{{ item.name }}</td>
                        <td class="px-5 py-3 text-center text-gray-600">{{ item.code }}</td>
                        <td class="px-5 py-3 text-center">
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
                        <td class="px-5 py-3 text-center">
                            <div class="flex items-center justify-center gap-1.5">
                                <NuxtLink
                                    :to="`/pms/settings/department/add?id=${item.id}`"
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
                        <p class="text-sm text-gray-500">ต้องการลบแผนก "{{ deleteTarget?.name }}" ใช่หรือไม่?</p>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="showDeleteModal = false">ยกเลิก</button>
                    <button class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style="background:#e7515a;" :disabled="deleting" @click="executeDelete">{{ deleting ? 'กำลังลบ...' : 'ลบ' }}</button>
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
                        <p class="text-sm text-gray-500">ต้องการรีเซ็ตแผนก "{{ resetTarget?.name }}" ใช่หรือไม่?</p>
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
import type { PmsDepartment } from '@/composables/usePmsDepartments';

useHead({ title: 'แผนกในองค์กร | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const api = usePmsDepartments();

const deptList     = ref<PmsDepartment[]>([]);
const loading      = ref(false);
const deleting     = ref(false);
const togglingId   = ref<number | null>(null);
const errorMessage = ref('');

const searchName = ref('');
const searchCode = ref('');

const fetchList = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await api.list({
            name: searchName.value.trim() || undefined,
            code: searchCode.value.trim() || undefined,
            limit: 200,
        });
        deptList.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => { searchName.value = ''; searchCode.value = ''; fetchList(); };

const toggleStatus = async (item: PmsDepartment) => {
    togglingId.value = item.id;
    errorMessage.value = '';
    try {
        const res = await api.update(item.id, { is_active: !item.is_active });
        const idx = deptList.value.findIndex(d => d.id === item.id);
        if (idx >= 0) deptList.value[idx] = res.data;
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
const deleteTarget    = ref<PmsDepartment | null>(null);
const confirmDelete   = (item: PmsDepartment) => { deleteTarget.value = item; showDeleteModal.value = true; };
const executeDelete   = async () => {
    if (!deleteTarget.value) return;
    deleting.value = true;
    errorMessage.value = '';
    try {
        await api.remove(deleteTarget.value.id);
        deptList.value = deptList.value.filter(d => d.id !== deleteTarget.value!.id);
        showDeleteModal.value = false;
        deleteTarget.value = null;
    } catch (e) {
        const err = e as PmsApiError;
        if (err.status === 403)      errorMessage.value = 'ไม่มีสิทธิ์ลบข้อมูล (admin เท่านั้น)';
        else if (err.status === 409) errorMessage.value = 'ลบไม่ได้: มีทีม/ตำแหน่งอ้างอิงถึงแผนกนี้';
        else                          errorMessage.value = err.message || 'ลบข้อมูลไม่สำเร็จ';
    } finally {
        deleting.value = false;
    }
};

// Reset modal kept as no-op stub
const showResetModal = ref(false);
const resetTarget    = ref<PmsDepartment | null>(null);
const confirmReset   = (item: PmsDepartment) => { resetTarget.value = item; showResetModal.value = true; };

onMounted(() => fetchList());
</script>
