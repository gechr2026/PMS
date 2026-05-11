<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#fdf4ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.8">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 12v4M10 14h4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ตำแหน่งงาน - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/position"
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
                <!-- แผนก + ทีม (Row 1) -->
                <div class="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- แผนก -->
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
                            @change="form.team_id = null"
                        >
                            <option :value="null">เลือก</option>
                            <option v-for="d in deptOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                        <p v-if="errors.dept" class="mt-1 text-xs text-red-500">{{ errors.dept }}</p>
                    </div>

                    <!-- ทีม -->
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
                        >
                            <option :value="null">เลือก</option>
                            <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                        <p v-if="errors.team" class="mt-1 text-xs text-red-500">{{ errors.team }}</p>
                    </div>
                </div>

                <!-- ชื่อตำแหน่งงาน + รหัสตำแหน่งย่อ (Row 2) -->
                <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- ชื่อตำแหน่งงาน -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ชื่อตำแหน่งงาน <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="เช่น Software Engineer"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.name
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                    </div>

                    <!-- รหัสตำแหน่งย่อ -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            รหัสตำแหน่งย่อ <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.code"
                            type="text"
                            placeholder="เช่น SWE"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.code
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.code" class="mt-1 text-xs text-red-500">{{ errors.code }}</p>
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

const router = useRouter();
const route  = useRoute();
const positionsApi = usePmsPositions();
const deptsApi     = usePmsDepartments();
const teamsApi     = usePmsTeams();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value ? 'แก้ไขตำแหน่งงาน | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มตำแหน่งงาน | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

const deptOptions = ref<PmsDepartment[]>([]);
const teamOptions = ref<PmsTeam[]>([]);

interface FormState {
    department_id: number | null;
    team_id:       number | null;
    name:          string;
    code:          string;
    is_active:     boolean;
}
const form = reactive<FormState>({
    department_id: null,
    team_id:       null,
    name:          '',
    code:          '',
    is_active:     true,
});

const errors      = reactive({ dept: '', team: '', name: '', code: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

// Cascade: filter teams by selected department
const filteredTeamOptions = computed(() => {
    if (form.department_id === null) return [] as PmsTeam[];
    return teamOptions.value.filter(t => t.department_id === form.department_id);
});

const validate = (): boolean => {
    errors.dept = ''; errors.team = ''; errors.name = ''; errors.code = '';
    let valid = true;
    if (form.department_id === null) { errors.dept = 'กรุณาเลือกแผนก';           valid = false; }
    if (form.team_id === null)       { errors.team = 'กรุณาเลือกทีม';             valid = false; }
    if (!form.name.trim())           { errors.name = 'กรุณากรอกชื่อตำแหน่งงาน'; valid = false; }
    if (!form.code.trim())           { errors.code = 'กรุณากรอกรหัสตำแหน่งย่อ'; valid = false; }
    if (form.name.trim().length > 200) { errors.name = 'ชื่อตำแหน่งยาวเกินไป (สูงสุด 200 ตัวอักษร)'; valid = false; }
    if (form.code.trim().length > 50)  { errors.code = 'รหัสตำแหน่งยาวเกินไป (สูงสุด 50 ตัวอักษร)';  valid = false; }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.code = 'รหัสตำแหน่งนี้มีอยู่ในทีมนี้แล้ว';
    } else if (err.status === 403) {
        serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
    } else if (err.status === 422) {
        serverError.value = err.message || 'ข้อมูลไม่ถูกต้อง (เช่น ทีมไม่มีอยู่)';
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
            team_id: form.team_id as number,
            name: form.name.trim(),
            code: form.code.trim(),
            is_active: form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await positionsApi.update(editId.value, body);
        } else {
            await positionsApi.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/position');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.department_id = null; form.team_id = null;
    form.name = ''; form.code = ''; form.is_active = true;
    errors.dept = ''; errors.team = ''; errors.name = ''; errors.code = '';
    serverError.value = '';
};

onMounted(async () => {
    // Load master data
    try {
        const [d, t] = await Promise.all([
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
        ]);
        deptOptions.value = d.data;
        teamOptions.value = t.data;
    } catch (e) {
        console.warn('[position/add] failed to load masters', e);
    }

    // Edit mode → load existing position
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await positionsApi.get(editId.value);
            form.department_id = res.data.department_id;
            form.team_id       = res.data.team_id;
            form.name          = res.data.name;
            form.code          = res.data.code;
            form.is_active     = res.data.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
