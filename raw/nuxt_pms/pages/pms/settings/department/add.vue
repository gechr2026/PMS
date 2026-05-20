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
                <h1 class="text-lg font-bold text-gray-800">
                    แผนกในองค์กร - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}
                </h1>
            </div>
            <NuxtLink
                to="/pms/settings/department"
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
                <!-- ชื่อแผนก + รหัสแผนกย่อ -->
                <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ชื่อแผนก <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="เช่น Human Resource"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.name
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            รหัสแผนกย่อ <span class="ml-0.5 text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.code"
                            type="text"
                            placeholder="เช่น HR"
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

const router = useRouter();
const route  = useRoute();
const api = usePmsDepartments();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value
            ? 'แก้ไขแผนกในองค์กร | ระบบประเมินผลการปฏิบัติงาน'
            : 'เพิ่มแผนกในองค์กร | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

const form = reactive({
    name: '',
    code: '',
    is_active: true,
});

const errors = reactive({ name: '', code: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

const validate = (): boolean => {
    errors.name = ''; errors.code = '';
    let valid = true;
    if (!form.name.trim()) { errors.name = 'กรุณากรอกชื่อแผนก';     valid = false; }
    if (!form.code.trim()) { errors.code = 'กรุณากรอกรหัสแผนกย่อ'; valid = false; }
    if (form.name.trim().length > 200) { errors.name = 'ชื่อแผนกยาวเกินไป (สูงสุด 200 ตัวอักษร)'; valid = false; }
    if (form.code.trim().length > 50)  { errors.code = 'รหัสแผนกยาวเกินไป (สูงสุด 50 ตัวอักษร)';  valid = false; }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.code = 'รหัสแผนกนี้มีอยู่ในระบบแล้ว';
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
            name: form.name.trim(),
            code: form.code.trim(),
            is_active: form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await api.update(editId.value, body);
        } else {
            await api.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/department');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.name = ''; form.code = ''; form.is_active = true;
    errors.name = ''; errors.code = '';
    serverError.value = '';
};

onMounted(async () => {
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await api.get(editId.value);
            form.name = res.data.name;
            form.code = res.data.code;
            form.is_active = res.data.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
