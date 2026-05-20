<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff2ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="17" rx="2"/>
                        <path d="M3 9h18M8 2v4M16 2v4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">
                    รอบปีการประเมินผล - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}
                </h1>
            </div>
            <NuxtLink
                to="/pms/settings/year"
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
                <!-- ปี Field -->
                <div class="mb-6 max-w-sm">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                        ปี
                        <span class="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        v-model="form.year"
                        type="text"
                        maxlength="4"
                        placeholder="เช่น 2569"
                        class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                        :class="errors.year
                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                    />
                    <p v-if="errors.year" class="mt-1 text-xs text-red-500">{{ errors.year }}</p>
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
        <div
            v-if="showToast"
            class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            บันทึกข้อมูลสำเร็จ
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';

const router = useRouter();
const route = useRoute();
const api = usePmsYears();

// Check edit mode from query param e.g. /pms/settings/year/add?id=1&year=2568
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
            ? 'แก้ไขรอบปีการประเมินผล | ระบบประเมินผลการปฏิบัติงาน'
            : 'เพิ่มรอบปีการประเมินผล | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({
    layout: 'pms-layout',
});

const form = reactive({
    year: (route.query.year as string) || '',
});

const errors = reactive({
    year: '',
});

const showToast = ref(false);
const submitting = ref(false);
const serverError = ref('');

const validate = (): boolean => {
    errors.year = '';
    const yr = form.year.trim();
    if (!yr) {
        errors.year = 'กรุณากรอกปี';
        return false;
    }
    if (!/^\d{4}$/.test(yr)) {
        errors.year = 'กรุณากรอกปีให้ถูกต้อง (ตัวเลข 4 หลัก)';
        return false;
    }
    const n = parseInt(yr, 10);
    if (n < 2400 || n > 2700) {
        errors.year = 'ปีอยู่นอกช่วงที่อนุญาต (2400-2700)';
        return false;
    }
    return true;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.year = 'ปีนี้มีอยู่ในระบบแล้ว';
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
        const yearNum = parseInt(form.year.trim(), 10);
        if (isEditMode.value && editId.value !== null) {
            await api.update(editId.value, { year: yearNum });
        } else {
            await api.create({ year: yearNum });
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/year');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.year = '';
    errors.year = '';
    serverError.value = '';
};

// In edit mode, fetch fresh value (URL might be stale)
onMounted(async () => {
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await api.get(editId.value);
            form.year = String(res.data.year);
        } catch (e) {
            // ignore — fall back to URL value
        }
    }
});
</script>
