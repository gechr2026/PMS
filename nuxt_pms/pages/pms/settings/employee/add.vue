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
                <h1 class="text-lg font-bold text-gray-800">ข้อมูลพนักงาน - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/employee"
                class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8l-4 4 4 4M8 12h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                กลับ
            </NuxtLink>
        </div>

        <!-- Form Card -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <form @submit.prevent="handleSubmit">

                <!-- ── Section 1: ข้อมูลส่วนบุคคล ── -->
                <div class="mb-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลส่วนบุคคล</span>
                    </div>

                    <!-- ชื่อบัญชี (full width) -->
                    <div class="mb-4">
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ชื่อบัญชี <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.username"
                            type="text"
                            placeholder="เช่น somchai.jai@gec.co.th"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.username
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.username" class="mt-1 text-xs text-red-500">{{ errors.username }}</p>
                    </div>

                    <!-- รหัสพนักงาน + หมายเลขบัตรประจำตัวประชาชน -->
                    <div class="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                รหัสพนักงาน <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <input
                                v-model="form.empCode"
                                type="text"
                                placeholder="เช่น GEC578"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.empCode
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <p v-if="errors.empCode" class="mt-1 text-xs text-red-500">{{ errors.empCode }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                หมายเลขบัตรประจำตัวประชาชน
                            </label>
                            <input
                                v-model="form.nationalId"
                                type="text"
                                placeholder="เช่น 1234567890123"
                                maxlength="13"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.nationalId
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <p v-if="errors.nationalId" class="mt-1 text-xs text-red-500">{{ errors.nationalId }}</p>
                        </div>
                    </div>

                    <!-- ชื่อ-นามสกุล (full width) -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ชื่อ-นามสกุล <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.fullName"
                            type="text"
                            placeholder="เช่น สมชาย ใจดี"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.fullName
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.fullName" class="mt-1 text-xs text-red-500">{{ errors.fullName }}</p>
                    </div>
                </div>

                <!-- ── Section 2: ข้อมูลต้นสังกัด ── -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลต้นสังกัด</span>
                    </div>

                    <!-- แผนก + ทีม -->
                    <div class="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                แผนก <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <select
                                v-model="form.department_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.dept
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @change="onDeptChange"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="d in deptOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
                            </select>
                            <p v-if="errors.dept" class="mt-1 text-xs text-red-500">{{ errors.dept }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                ทีม <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <select
                                v-model="form.team_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.team
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                :disabled="form.department_id === null"
                                @change="onTeamChange"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                            </select>
                            <p v-if="errors.team" class="mt-1 text-xs text-red-500">{{ errors.team }}</p>
                        </div>
                    </div>

                    <!-- ตำแหน่ง + ระดับตำแหน่ง -->
                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                ตำแหน่ง <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <select
                                v-model="form.position_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.position
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                :disabled="form.team_id === null"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="p in filteredPositionOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
                            </select>
                            <p v-if="errors.position" class="mt-1 text-xs text-red-500">{{ errors.position }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ระดับตำแหน่ง</label>
                            <select
                                v-model="form.level_id"
                                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                            >
                                <option :value="null">— ไม่ระบุ —</option>
                                <option v-for="l in levelOptions" :key="l.id" :value="l.id">{{ l.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Server error -->
                <div
                    v-if="serverError"
                    class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
                >
                    {{ serverError }}
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 border-t border-gray-100 pt-5">
                    <button
                        type="submit"
                        class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        style="background:#4361ee;"
                        :disabled="submitting"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
                    </button>
                    <button
                        type="button"
                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                        @click="handleClear"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke-linecap="round"/>
                        </svg>
                        ล้าง
                    </button>
                </div>
            </form>
        </div>

        <!-- Success Toast -->
        <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="showToast"
                class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                บันทึกข้อมูลสำเร็จ
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';
import type { PmsPosition } from '@/composables/usePmsPositions';
import type { PmsLevel } from '@/composables/usePmsLevels';

const router = useRouter();
const route  = useRoute();
const employeesApi = usePmsEmployees();
const deptsApi     = usePmsDepartments();
const teamsApi     = usePmsTeams();
const positionsApi = usePmsPositions();
const levelsApi    = usePmsLevels();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value ? 'แก้ไขข้อมูลพนักงาน | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มข้อมูลพนักงาน | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

// ── Master data (loaded from API) ──────────────────────────────────────
const deptOptions     = ref<PmsDepartment[]>([]);
const teamOptions     = ref<PmsTeam[]>([]);
const positionOptions = ref<PmsPosition[]>([]);
const levelOptions    = ref<PmsLevel[]>([]);

// ── Reactive form ──────────────────────────────────────────────────────
interface FormState {
    username: string;
    empCode: string;
    nationalId: string;
    fullName: string;
    department_id: number | null;
    team_id: number | null;
    position_id: number | null;
    level_id: number | null;
    is_active: boolean;
}
const form = reactive<FormState>({
    username:      '',
    empCode:       '',
    nationalId:    '',
    fullName:      '',
    department_id: null,
    team_id:       null,
    position_id:   null,
    level_id:      null,
    is_active:     true,
});

const errors      = reactive({ username: '', empCode: '', fullName: '', dept: '', team: '', position: '', nationalId: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

// ── Cascading options (frontend filtering for instant UX) ─────────────
const filteredTeamOptions = computed(() => {
    if (form.department_id === null) return [] as PmsTeam[];
    return teamOptions.value.filter(t => t.department_id === form.department_id);
});

const filteredPositionOptions = computed(() => {
    if (form.team_id === null) return [] as PmsPosition[];
    return positionOptions.value.filter(p => p.team_id === form.team_id);
});

const onDeptChange = () => { form.team_id = null; form.position_id = null; };
const onTeamChange = () => { form.position_id = null; };

// ── Validation ─────────────────────────────────────────────────────────
const validate = (): boolean => {
    Object.keys(errors).forEach(k => (errors as any)[k] = '');
    let valid = true;
    if (!form.username.trim())       { errors.username   = 'กรุณากรอกชื่อบัญชี';     valid = false; }
    if (!form.empCode.trim())        { errors.empCode    = 'กรุณากรอกรหัสพนักงาน';   valid = false; }
    if (!form.fullName.trim())       { errors.fullName   = 'กรุณากรอกชื่อ-นามสกุล';  valid = false; }
    if (form.department_id === null) { errors.dept       = 'กรุณาเลือกแผนก';          valid = false; }
    if (form.team_id === null)       { errors.team       = 'กรุณาเลือกทีม';            valid = false; }
    if (form.position_id === null)   { errors.position   = 'กรุณาเลือกตำแหน่ง';       valid = false; }
    if (form.nationalId && !/^\d{13}$/.test(form.nationalId.trim())) {
        errors.nationalId = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
        valid = false;
    }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        const msg = err.message || '';
        if (/username/i.test(msg))         errors.username = 'ชื่อบัญชีนี้มีอยู่ในระบบแล้ว';
        else if (/emp_code/i.test(msg))    errors.empCode  = 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว';
        else if (/national_id/i.test(msg)) errors.nationalId = 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว';
        else                                serverError.value = 'ข้อมูลซ้ำในระบบ';
    } else if (err.status === 403) {
        serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
    } else if (err.status === 422) {
        serverError.value = err.message || 'ข้อมูลไม่ถูกต้อง';
    } else {
        serverError.value = err.message || 'บันทึกไม่สำเร็จ';
    }
};

const handleSubmit = async () => {
    serverError.value = '';
    if (!validate()) return;

    submitting.value = true;
    try {
        const body = {
            username:    form.username.trim(),
            emp_code:    form.empCode.trim(),
            full_name:   form.fullName.trim(),
            national_id: form.nationalId.trim() || null,
            position_id: form.position_id as number,
            level_id:    form.level_id ?? null,
            is_active:   form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await employeesApi.update(editId.value, body);
        } else {
            await employeesApi.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/employee');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.username = ''; form.empCode = ''; form.nationalId = ''; form.fullName = '';
    form.department_id = null; form.team_id = null; form.position_id = null;
    form.level_id = null; form.is_active = true;
    Object.keys(errors).forEach(k => (errors as any)[k] = '');
    serverError.value = '';
};

onMounted(async () => {
    // Load all master data in parallel
    try {
        const [d, t, p, l] = await Promise.all([
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
            positionsApi.list({ limit: 500 }),
            levelsApi.list({ limit: 100 }),
        ]);
        deptOptions.value     = d.data;
        teamOptions.value     = t.data;
        positionOptions.value = p.data;
        levelOptions.value    = l.data;
    } catch (e) {
        console.warn('[employee/add] failed to load masters', e);
    }

    // Edit mode → load existing employee + populate cascade chain
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await employeesApi.get(editId.value);
            const e = res.data;
            form.username      = e.username;
            form.empCode       = e.emp_code;
            form.nationalId    = e.national_id ?? '';
            form.fullName      = e.full_name;
            form.department_id = e.department_id;
            form.team_id       = e.team_id;
            form.position_id   = e.position_id;
            form.level_id      = e.level_id;
            form.is_active     = e.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
