<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">เกณฑ์การประเมินผล - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/criteria"
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

                <!-- ชื่อเกณฑ์การประเมิน -->
                <div class="mb-6">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                        ชื่อเกณฑ์การประเมิน <span class="ml-0.5 text-red-500">*</span>
                    </label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="เช่น เกณฑ์การประเมิน 2569 - 1"
                        class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                        :class="errors.name
                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                    />
                    <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                </div>

                <!-- Section: เกณฑ์การประเมินผล -->
                <div class="mb-5">
                    <div class="mb-3 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">เกณฑ์การประเมินผล</span>
                    </div>

                    <!-- Grade Table -->
                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-36 px-4 py-3 text-center font-semibold text-gray-700">ระดับแต้มคะแนน</th>
                                    <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">ช่วงคะแนนเริ่มต้น</th>
                                    <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">ช่วงคะแนนสิ้นสุด</th>
                                    <th class="px-4 py-3 text-center font-semibold text-gray-700">คำจำกัดความ</th>
                                    <th class="w-12 px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(row, index) in gradeRows"
                                    :key="index"
                                    class="border-b border-gray-100"
                                >
                                    <!-- ระดับแต้มคะแนน -->
                                    <td class="px-3 py-2">
                                        <input
                                            v-model="row.grade"
                                            type="text"
                                            placeholder="เช่น A"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                    </td>
                                    <!-- ช่วงคะแนนเริ่มต้น -->
                                    <td class="px-3 py-2">
                                        <input
                                            v-model="row.minScore"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="0.00"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                    </td>
                                    <!-- ช่วงคะแนนสิ้นสุด -->
                                    <td class="px-3 py-2">
                                        <input
                                            v-model="row.maxScore"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="0.00"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                    </td>
                                    <!-- คำจำกัดความ -->
                                    <td class="px-3 py-2">
                                        <textarea
                                            v-model="row.description"
                                            rows="3"
                                            placeholder="คำอธิบายระดับคะแนนนี้"
                                            class="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                        />
                                    </td>
                                    <!-- Delete row -->
                                    <td class="px-2 py-2 text-center">
                                        <button
                                            v-if="gradeRows.length > 1"
                                            type="button"
                                            class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 transition hover:bg-red-50"
                                            title="ลบแถว"
                                            @click="removeRow(index)"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- เพิ่มแถว -->
                    <div class="mt-3">
                        <button
                            type="button"
                            class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            @click="addRow"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v8M8 12h8" stroke-linecap="round"/>
                            </svg>
                            เพิ่มแถว
                        </button>
                    </div>

                    <!-- Grade rows validation error -->
                    <p v-if="errors.grades" class="mt-2 text-xs text-red-500">{{ errors.grades }}</p>
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
const api = usePmsCriteria();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value ? 'แก้ไขเกณฑ์การประเมินผล | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มเกณฑ์การประเมินผล | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

// ── Grade row type (UI uses strings to allow empty inputs) ────────────
interface GradeRow {
    grade: string;
    minScore: string;
    maxScore: string;
    description: string;
}

const defaultRows = (): GradeRow[] => [
    {
        grade: 'A', minScore: '80.00', maxScore: '100.00',
        description: 'โดดเด่น: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ที่เกินความคาดหวังของงาน และขององค์กรอย่างโดดเด่น หรือสามารถปฏิบัติงานได้ผลงานที่ดีเยี่ยม',
    },
    {
        grade: 'B', minScore: '70.00', maxScore: '79.99',
        description: 'ดีมาก: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ที่เกินความคาดหวังของงานอย่างดีมาก หรือสามารถปฏิบัติงานได้ผลงานที่ดีมาก',
    },
    {
        grade: 'C', minScore: '60.00', maxScore: '69.99',
        description: 'มาตรฐาน: สามารถบรรลุเป้าหมายหรือวัตถุประสงค์ตามความคาดหวังของงาน หรือสามารถปฏิบัติงานได้ผลงานตามมาตรฐานที่กำหนด',
    },
];

const form = reactive({
    name: '',
    is_active: true,
});

const errors      = reactive({ name: '', grades: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

const gradeRows = ref<GradeRow[]>(defaultRows());

const addRow = () => {
    gradeRows.value.push({ grade: '', minScore: '', maxScore: '', description: '' });
};

const removeRow = (index: number) => {
    gradeRows.value.splice(index, 1);
};

const validate = (): boolean => {
    errors.name = ''; errors.grades = '';
    let valid = true;

    if (!form.name.trim()) { errors.name = 'กรุณากรอกชื่อเกณฑ์การประเมิน'; valid = false; }
    if (form.name.trim().length > 200) { errors.name = 'ชื่อเกณฑ์ยาวเกินไป (สูงสุด 200 ตัวอักษร)'; valid = false; }

    if (gradeRows.value.length === 0) {
        errors.grades = 'ต้องมีระดับคะแนนอย่างน้อย 1 แถว';
        valid = false;
    }

    for (let i = 0; i < gradeRows.value.length; i++) {
        const r = gradeRows.value[i];
        if (!r.grade.trim()) {
            errors.grades = `แถวที่ ${i + 1}: กรุณากรอกระดับแต้มคะแนน`;
            valid = false; break;
        }
        const min = parseFloat(r.minScore);
        const max = parseFloat(r.maxScore);
        if (!Number.isFinite(min) || min < 0 || min > 100) {
            errors.grades = `แถวที่ ${i + 1}: ช่วงคะแนนเริ่มต้นต้องอยู่ระหว่าง 0-100`;
            valid = false; break;
        }
        if (!Number.isFinite(max) || max < 0 || max > 100) {
            errors.grades = `แถวที่ ${i + 1}: ช่วงคะแนนสิ้นสุดต้องอยู่ระหว่าง 0-100`;
            valid = false; break;
        }
        if (max < min) {
            errors.grades = `แถวที่ ${i + 1}: ช่วงคะแนนสิ้นสุดต้องมากกว่าหรือเท่ากับช่วงคะแนนเริ่มต้น`;
            valid = false; break;
        }
    }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.name = 'ชื่อเกณฑ์การประเมินนี้มีอยู่ในระบบแล้ว';
    } else if (err.status === 403) {
        serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
    } else if (err.status === 422) {
        serverError.value = err.message || 'ข้อมูลไม่ถูกต้อง';
    } else {
        serverError.value = err.message || 'บันทึกไม่สำเร็จ';
    }
};

const buildGradesPayload = () =>
    gradeRows.value.map((r, i) => ({
        grade: r.grade.trim(),
        min_score: parseFloat(r.minScore),
        max_score: parseFloat(r.maxScore),
        description: r.description.trim() || null,
        sort_order: i + 1,
    }));

const handleSubmit = async () => {
    serverError.value = '';
    if (!validate()) return;

    submitting.value = true;
    try {
        const grades = buildGradesPayload();
        if (isEditMode.value && editId.value !== null) {
            await api.update(editId.value, {
                name: form.name.trim(),
                is_active: form.is_active,
                grades,
            });
        } else {
            await api.create({
                name: form.name.trim(),
                is_active: form.is_active,
                grades,
            });
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/criteria');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.name = ''; form.is_active = true;
    errors.name = ''; errors.grades = '';
    serverError.value = '';
    gradeRows.value = [{ grade: '', minScore: '', maxScore: '', description: '' }];
};

onMounted(async () => {
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await api.get(editId.value);
            form.name      = res.data.name;
            form.is_active = res.data.is_active;
            // map API grades → form rows (sort_order ascending already from API)
            gradeRows.value = (res.data.grades ?? []).map(g => ({
                grade: g.grade,
                minScore: g.min_score?.toFixed?.(2) ?? String(g.min_score ?? ''),
                maxScore: g.max_score?.toFixed?.(2) ?? String(g.max_score ?? ''),
                description: g.description ?? '',
            }));
            if (gradeRows.value.length === 0) {
                gradeRows.value = [{ grade: '', minScore: '', maxScore: '', description: '' }];
            }
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
