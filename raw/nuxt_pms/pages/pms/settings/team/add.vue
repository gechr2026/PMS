<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <circle cx="9" cy="7" r="3"/>
                        <circle cx="15.5" cy="7.5" r="2.5"/>
                        <path d="M3 17c0-3 2.7-5 6-5s6 2 6 5" stroke-linecap="round"/>
                        <path d="M15 13c2.5 0 4.5 1.3 4.5 4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ทีม - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/team"
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
                <!-- แผนก + ชื่อทีม + รหัสทีมย่อ (3 columns) -->
                <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                        >
                            <option :value="null">เลือก</option>
                            <option v-for="d in deptOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                        <p v-if="errors.dept" class="mt-1 text-xs text-red-500">{{ errors.dept }}</p>
                    </div>

                    <!-- ชื่อทีม -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ชื่อทีม <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="เช่น Quality Assurance"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.name
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                    </div>

                    <!-- รหัสทีมย่อ -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            รหัสทีมย่อ <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.code"
                            type="text"
                            placeholder="เช่น QA"
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

const router = useRouter();
const route  = useRoute();
const teamsApi = usePmsTeams();
const deptsApi = usePmsDepartments();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value ? 'แก้ไขทีม | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มทีม | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

const deptOptions = ref<PmsDepartment[]>([]);

interface FormState {
    department_id: number | null;
    name: string;
    code: string;
    is_active: boolean;
}
const form = reactive<FormState>({
    department_id: null,
    name: '',
    code: '',
    is_active: true,
});

const errors      = reactive({ dept: '', name: '', code: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

const validate = (): boolean => {
    errors.dept = ''; errors.name = ''; errors.code = '';
    let valid = true;
    if (form.department_id === null) { errors.dept = 'กรุณาเลือกแผนก';       valid = false; }
    if (!form.name.trim())           { errors.name = 'กรุณากรอกชื่อทีม';    valid = false; }
    if (!form.code.trim())           { errors.code = 'กรุณากรอกรหัสทีมย่อ'; valid = false; }
    if (form.name.trim().length > 200) { errors.name = 'ชื่อทีมยาวเกินไป (สูงสุด 200 ตัวอักษร)'; valid = false; }
    if (form.code.trim().length > 50)  { errors.code = 'รหัสทีมยาวเกินไป (สูงสุด 50 ตัวอักษร)';  valid = false; }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.code = 'รหัสทีมนี้มีอยู่ในแผนกนี้แล้ว';
    } else if (err.status === 403) {
        serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
    } else if (err.status === 422) {
        serverError.value = err.message || 'ข้อมูลไม่ถูกต้อง (เช่น แผนกไม่มีอยู่ในระบบ)';
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
            department_id: form.department_id as number,
            name: form.name.trim(),
            code: form.code.trim(),
            is_active: form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await teamsApi.update(editId.value, body);
        } else {
            await teamsApi.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/team');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.department_id = null; form.name = ''; form.code = ''; form.is_active = true;
    errors.dept = ''; errors.name = ''; errors.code = '';
    serverError.value = '';
};

onMounted(async () => {
    // Load department options
    try {
        const res = await deptsApi.list({ limit: 200 });
        deptOptions.value = res.data;
    } catch (e) {
        console.warn('[team/add] failed to load departments', e);
    }

    // Edit mode → fetch existing team
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await teamsApi.get(editId.value);
            form.department_id = res.data.department_id;
            form.name = res.data.name;
            form.code = res.data.code;
            form.is_active = res.data.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
