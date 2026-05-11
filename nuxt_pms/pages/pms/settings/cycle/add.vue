<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#e0f2fe;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="1.8">
                        <path d="M21 12A9 9 0 1 1 12 3" stroke-linecap="round"/>
                        <path d="M12 3v5l4-2.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">
                    รอบการประเมินผล - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}
                </h1>
            </div>
            <NuxtLink
                to="/pms/settings/cycle"
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
                <!-- Row 1: ปี + รอบการประเมิน -->
                <div class="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- ปี -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            ปี <span class="text-red-500 ml-0.5">*</span>
                        </label>
                        <select
                            v-model="form.year_id"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.year
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        >
                            <option :value="null">เลือก</option>
                            <option v-for="y in yearOptions" :key="y.id" :value="y.id">{{ y.year }}</option>
                        </select>
                        <p v-if="errors.year" class="mt-1 text-xs text-red-500">{{ errors.year }}</p>
                    </div>

                    <!-- รอบการประเมิน -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            รอบการประเมิน <span class="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            v-model="form.cycle"
                            type="text"
                            placeholder="เช่น 1/2569"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.cycle
                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.cycle" class="mt-1 text-xs text-red-500">{{ errors.cycle }}</p>
                    </div>
                </div>

                <!-- Row 2: วันที่เริ่มต้น + วันที่สิ้นสุด -->
                <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- วันที่เริ่มต้น -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            วันที่เริ่มต้น <span class="text-red-500 ml-0.5">*</span>
                        </label>
                        <div class="relative">
                            <input
                                v-model="form.startDate"
                                type="date"
                                class="w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-700 outline-none transition"
                                :class="errors.startDate
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <rect x="3" y="4" width="18" height="17" rx="2"/>
                                    <path d="M3 9h18M8 2v4M16 2v4" stroke-linecap="round"/>
                                </svg>
                            </span>
                        </div>
                        <p v-if="errors.startDate" class="mt-1 text-xs text-red-500">{{ errors.startDate }}</p>
                    </div>

                    <!-- วันที่สิ้นสุด -->
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                            วันที่สิ้นสุด <span class="text-red-500 ml-0.5">*</span>
                        </label>
                        <div class="relative">
                            <input
                                v-model="form.endDate"
                                type="date"
                                class="w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-700 outline-none transition"
                                :class="errors.endDate
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <rect x="3" y="4" width="18" height="17" rx="2"/>
                                    <path d="M3 9h18M8 2v4M16 2v4" stroke-linecap="round"/>
                                </svg>
                            </span>
                        </div>
                        <p v-if="errors.endDate" class="mt-1 text-xs text-red-500">{{ errors.endDate }}</p>
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
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
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
import type { PmsYear } from '@/composables/usePmsYears';

const router = useRouter();
const route  = useRoute();
const cyclesApi = usePmsCycles();
const yearsApi  = usePmsYears();

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
            ? 'แก้ไขรอบการประเมินผล | ระบบประเมินผลการปฏิบัติงาน'
            : 'เพิ่มรอบการประเมินผล | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

const yearOptions = ref<PmsYear[]>([]);

interface FormState {
    year_id: number | null;
    cycle: string;
    startDate: string;
    endDate: string;
    is_active: boolean;
}
const form = reactive<FormState>({
    year_id:   null,
    cycle:     '',
    startDate: '',
    endDate:   '',
    is_active: true,
});

const errors = reactive({
    year: '', cycle: '', startDate: '', endDate: '',
});

const showToast    = ref(false);
const submitting   = ref(false);
const serverError  = ref('');

const validate = (): boolean => {
    errors.year = ''; errors.cycle = ''; errors.startDate = ''; errors.endDate = '';
    let valid = true;
    if (form.year_id === null)   { errors.year      = 'กรุณาเลือกปี';              valid = false; }
    if (!form.cycle.trim())      { errors.cycle     = 'กรุณากรอกรอบการประเมิน';   valid = false; }
    if (!form.startDate)         { errors.startDate = 'กรุณาเลือกวันที่เริ่มต้น'; valid = false; }
    if (!form.endDate)           { errors.endDate   = 'กรุณาเลือกวันที่สิ้นสุด';  valid = false; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
        errors.endDate = 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น'; valid = false;
    }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.cycle = 'รอบนี้มีอยู่ในปีนี้แล้ว';
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
            year_id:     form.year_id as number,
            cycle_label: form.cycle.trim(),
            start_date:  form.startDate,
            end_date:    form.endDate,
            is_active:   form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await cyclesApi.update(editId.value, body);
        } else {
            await cyclesApi.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/cycle');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.year_id = null; form.cycle = ''; form.startDate = ''; form.endDate = ''; form.is_active = true;
    errors.year = ''; errors.cycle = ''; errors.startDate = ''; errors.endDate = '';
    serverError.value = '';
};

onMounted(async () => {
    // Load year options
    try {
        const res = await yearsApi.list({ limit: 200 });
        yearOptions.value = res.data.slice().sort((a, b) => b.year - a.year);
    } catch (e) {
        console.warn('[cycle/add] failed to load years', e);
    }

    // Edit mode → load existing cycle
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await cyclesApi.get(editId.value);
            form.year_id   = res.data.year_id;
            form.cycle     = res.data.cycle_label;
            form.startDate = res.data.start_date;
            form.endDate   = res.data.end_date;
            form.is_active = res.data.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
