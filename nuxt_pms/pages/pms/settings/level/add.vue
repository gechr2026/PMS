<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f0fdfa;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="1.8">
                        <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"/>
                        <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round"/>
                        <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round"/>
                        <circle cx="8"  cy="6"  r="2" fill="#0d9488" stroke="none"/>
                        <circle cx="16" cy="12" r="2" fill="#0d9488" stroke="none"/>
                        <circle cx="10" cy="18" r="2" fill="#0d9488" stroke="none"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ระดับตำแหน่ง - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/level"
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

                <!-- Section: ข้อมูลระดับตำแหน่ง -->
                <div class="mb-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลระดับตำแหน่ง</span>
                    </div>
                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <!-- ชื่อระดับตำแหน่ง -->
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                ชื่อระดับตำแหน่ง <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <input
                                v-model="form.name"
                                type="text"
                                placeholder="เช่น Officer"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.name
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                        </div>
                        <!-- การจัดเรียง -->
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">
                                การจัดเรียง <span class="ml-0.5 text-red-500">*</span>
                            </label>
                            <input
                                v-model="form.order"
                                type="number"
                                min="1"
                                placeholder="เช่น 1"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.order
                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                            />
                            <p v-if="errors.order" class="mt-1 text-xs text-red-500">{{ errors.order }}</p>
                        </div>
                    </div>
                </div>

                <!-- Section: ตำแหน่งงานภายใต้ระดับ (display-only) -->
                <div class="mb-6">
                    <div class="mb-2 flex items-center gap-2 border-t border-gray-100 pt-5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ตำแหน่งงานภายใต้ระดับ</span>
                    </div>
                    <p class="mb-3 text-xs text-gray-500">
                        * ส่วนนี้เพื่อ preview เท่านั้น — การผูกตำแหน่งกับระดับยังไม่บันทึกลงฐานข้อมูล
                        (ต้องเพิ่ม level_id ใน pms_positions ก่อน)
                    </p>

                    <!-- Position groups by Team — loaded from API -->
                    <div v-if="positionsLoading" class="text-sm text-gray-400">กำลังโหลดตำแหน่ง...</div>
                    <div v-else-if="positionsByTeam.length === 0" class="text-sm text-gray-400">
                        ยังไม่มีตำแหน่งในระบบ
                    </div>
                    <div v-else class="space-y-5">
                        <div
                            v-for="teamGroup in positionsByTeam"
                            :key="teamGroup.team_id"
                        >
                            <h3 class="mb-3 text-sm font-bold text-gray-800">
                                {{ teamGroup.team_name }}
                                <span class="text-xs font-normal text-gray-400">
                                    ({{ teamGroup.department_name }})
                                </span>
                            </h3>
                            <div class="grid grid-cols-1 gap-2 pl-4 sm:grid-cols-2">
                                <label
                                    v-for="pos in teamGroup.items"
                                    :key="pos.id"
                                    class="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition"
                                    :class="selectedPositionIds.has(pos.id)
                                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'"
                                >
                                    <input
                                        type="checkbox"
                                        :value="pos.id"
                                        :checked="selectedPositionIds.has(pos.id)"
                                        class="h-4 w-4 rounded accent-blue-500"
                                        @change="togglePosition(pos.id)"
                                    />
                                    {{ pos.name }}
                                    <span class="text-xs text-gray-400">{{ pos.code }}</span>
                                </label>
                            </div>
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
import type { PmsPosition } from '@/composables/usePmsPositions';

const router = useRouter();
const route  = useRoute();
const levelsApi    = usePmsLevels();
const positionsApi = usePmsPositions();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() =>
        isEditMode.value ? 'แก้ไขระดับตำแหน่ง | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มระดับตำแหน่ง | ระบบประเมินผลการปฏิบัติงาน'
    ),
});

definePageMeta({ layout: 'pms-layout' });

// ── Form state ──────────────────────────────────────────────────────────
const form = reactive({
    name:  '',
    order: '' as string,
    is_active: true,
});

const errors      = reactive({ name: '', order: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

// ── Positions section (display-only — schema doesn't store level_id on position yet) ──
interface TeamGroup {
    team_id: number;
    team_name: string;
    department_name: string | null;
    items: PmsPosition[];
}

const positionsLoading = ref(false);
const positionsByTeam = ref<TeamGroup[]>([]);
const selectedPositionIds = ref<Set<number>>(new Set());

const togglePosition = (id: number) => {
    const set = new Set(selectedPositionIds.value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    selectedPositionIds.value = set;
};

const groupPositionsByTeam = (positions: PmsPosition[]): TeamGroup[] => {
    const map = new Map<number, TeamGroup>();
    for (const p of positions) {
        if (p.team_id === null) continue;
        if (!map.has(p.team_id)) {
            map.set(p.team_id, {
                team_id: p.team_id,
                team_name: p.team_name ?? '(ไม่ทราบทีม)',
                department_name: p.department_name,
                items: [],
            });
        }
        map.get(p.team_id)!.items.push(p);
    }
    return Array.from(map.values()).sort((a, b) => a.team_name.localeCompare(b.team_name));
};

// ── Validation + submit ─────────────────────────────────────────────────
const validate = (): boolean => {
    errors.name = ''; errors.order = '';
    let valid = true;
    if (!form.name.trim())  { errors.name  = 'กรุณากรอกชื่อระดับตำแหน่ง'; valid = false; }
    if (!form.order)        { errors.order = 'กรุณากรอกการจัดเรียง';       valid = false; }
    if (form.order) {
        const n = parseInt(form.order, 10);
        if (!Number.isInteger(n) || n < 0) { errors.order = 'การจัดเรียงต้องเป็นจำนวนเต็ม >= 0'; valid = false; }
    }
    if (form.name.trim().length > 100) { errors.name = 'ชื่อระดับยาวเกินไป (สูงสุด 100 ตัวอักษร)'; valid = false; }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        errors.name = 'ชื่อระดับนี้มีอยู่ในระบบแล้ว';
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
            sort_order: parseInt(form.order, 10),
            is_active: form.is_active,
        };
        if (isEditMode.value && editId.value !== null) {
            await levelsApi.update(editId.value, body);
        } else {
            await levelsApi.create(body);
        }
        // NOTE: selectedPositionIds is currently NOT persisted —
        // schema needs a level_id column on pms_positions for that.
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/level');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.name = ''; form.order = ''; form.is_active = true;
    errors.name = ''; errors.order = '';
    serverError.value = '';
    selectedPositionIds.value = new Set();
};

onMounted(async () => {
    // Load all positions for display-only checkboxes
    positionsLoading.value = true;
    try {
        const res = await positionsApi.list({ limit: 500 });
        positionsByTeam.value = groupPositionsByTeam(res.data);
    } catch (e) {
        console.warn('[level/add] failed to load positions', e);
    } finally {
        positionsLoading.value = false;
    }

    // Edit mode → load existing level
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await levelsApi.get(editId.value);
            form.name = res.data.name;
            form.order = String(res.data.sort_order);
            form.is_active = res.data.is_active;
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
