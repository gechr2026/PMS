<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">การส่งแบบประเมิน - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/send"
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

                <!-- ── Section 1: ข้อมูลผู้ถูกประเมิน ── -->
                <div class="mb-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลผู้ถูกประเมิน</span>
                    </div>

                    <!-- รหัสพนักงาน (searchable → auto-fill) -->
                    <div class="mb-4">
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน <span class="text-red-500">*</span></label>
                        <div class="relative max-w-xs">
                            <input
                                v-model="empCodeSearch"
                                type="text"
                                placeholder="กรอกรหัสพนักงาน เช่น GEC602"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.empCode ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @input="onEmpCodeInput"
                            />
                            <!-- Dropdown suggestions -->
                            <div v-if="empSuggestions.length > 0" class="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                <button
                                    v-for="emp in empSuggestions"
                                    :key="emp.emp_code"
                                    type="button"
                                    class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition"
                                    @click="selectEmployee(emp)"
                                >
                                    <span class="font-semibold text-blue-600">{{ emp.emp_code }}</span> — {{ emp.full_name }}
                                </button>
                            </div>
                        </div>
                        <p v-if="errors.empCode" class="mt-1 text-xs text-red-500">{{ errors.empCode }}</p>
                    </div>

                    <!-- ชื่อ-นามสกุล + ตำแหน่ง (auto-fill) -->
                    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รหัสพนักงาน</label>
                            <input :value="employeeInfo.empCode" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</label>
                            <input :value="employeeInfo.fullName" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ตำแหน่ง</label>
                            <input :value="employeeInfo.position" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                    </div>

                    <!-- ระดับตำแหน่ง + ทีม + แผนก (auto-fill) -->
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ระดับตำแหน่ง</label>
                            <input :value="employeeInfo.level" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                            <input :value="employeeInfo.team" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                            <input :value="employeeInfo.dept" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                <!-- ── Section 2: ข้อมูลการประเมิน ── -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลการประเมิน</span>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <!-- ชื่อแบบประเมิน (dropdown) -->
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อแบบประเมิน <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.assessment_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.assessmentId ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @change="onAssessmentChange"
                            >
                                <option value="">เลือก</option>
                                <option v-for="a in assessmentOptions" :key="a.id" :value="a.id">{{ a.name }}</option>
                            </select>
                            <p v-if="errors.assessmentId" class="mt-1 text-xs text-red-500">{{ errors.assessmentId }}</p>
                        </div>
                        <!-- รอบปีการประเมิน (auto) -->
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                            <input :value="assessmentInfo.year" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                        <!-- รอบการประเมิน (auto) -->
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน</label>
                            <input :value="assessmentInfo.cycle" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                <!-- Note (kept open between sections) -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">หมายเหตุ</label>
                    <textarea
                        v-model="form.note"
                        rows="2"
                        placeholder="ข้อความเพิ่มเติม (ไม่บังคับ)"
                        class="w-full max-w-2xl rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    />
                </div>

                <!-- ── Section 3: ข้อมูลผู้ประเมิน (raters) ── -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <div class="mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">รายชื่อผู้ประเมิน (raters)</span>
                    </div>
                    <p v-if="assessmentInfo.typeHint" class="mb-3 text-xs text-blue-600">{{ assessmentInfo.typeHint }}</p>

                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                                    <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">บทบาท</th>
                                    <th class="px-4 py-3 text-center font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                    <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">ตำแหน่ง</th>
                                    <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">ระดับตำแหน่ง</th>
                                    <th class="w-10 px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(evaluator, idx) in evaluatorRows"
                                    :key="idx"
                                    class="border-b border-gray-100"
                                >
                                    <td class="px-4 py-2 text-center text-gray-500 font-medium">{{ idx + 1 }}</td>
                                    <td class="px-2 py-2">
                                        <select
                                            v-model="evaluator.evaluator_role"
                                            class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition"
                                        >
                                            <option v-for="r in availableRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
                                        </select>
                                    </td>
                                    <td class="px-2 py-2">
                                        <div class="relative">
                                            <input
                                                v-model="evaluator.search"
                                                type="text"
                                                placeholder="รหัส หรือ ชื่อพนักงาน"
                                                class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                                                @input="onEvaluatorInput(idx)"
                                            />
                                            <div v-if="evaluator.showDropdown && evaluator.suggestions.length > 0" class="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                                <button
                                                    v-for="emp in evaluator.suggestions"
                                                    :key="emp.id"
                                                    type="button"
                                                    class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition"
                                                    @click="selectEvaluator(idx, emp)"
                                                >
                                                    <span class="font-semibold text-blue-600">{{ emp.emp_code }}</span> — {{ emp.full_name }}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-2 py-2">
                                        <input :value="evaluator.position" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-600 outline-none cursor-not-allowed" />
                                    </td>
                                    <td class="px-2 py-2">
                                        <input :value="evaluator.level" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-600 outline-none cursor-not-allowed" />
                                    </td>
                                    <td class="px-2 py-2 text-center">
                                        <button v-if="evaluatorRows.length > 1" type="button" class="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-400 transition hover:bg-red-50" @click="removeEvaluator(idx)">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="evaluatorRows.length === 0">
                                    <td colspan="6" class="px-4 py-6 text-center text-sm text-gray-400">ยังไม่มีผู้ประเมิน — กดปุ่ม "เพิ่มแถว" หรือ "เติมตามประเภท"</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50" @click="addEvaluator">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>
                            เพิ่มแถว
                        </button>
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100" :disabled="!form.assessment_id || !form.employee_id" @click="autoFillRolesByType">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            เติม Self ตามประเภท
                        </button>
                    </div>
                    <p v-if="errors.raters" class="mt-2 text-xs text-red-500">{{ errors.raters }}</p>
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
                    <button type="submit" class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" style="background:#4361ee;" :disabled="submitting">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
                    </button>
                    <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100" @click="handleClear">
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
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                บันทึกข้อมูลสำเร็จ
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsEmployee } from '@/composables/usePmsEmployees';
import type { PmsAssessment } from '@/composables/usePmsAssessments';
import type { PmsEvaluationRole } from '@/composables/usePmsEvaluations';

const router = useRouter();
const route  = useRoute();
const sendsApi       = usePmsSends();
const employeesApi   = usePmsEmployees();
const assessmentsApi = usePmsAssessments();
const sendRatersApi  = usePmsSendRaters();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() => isEditMode.value ? 'แก้ไขการส่งแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มการส่งแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน'),
});
definePageMeta({ layout: 'pms-layout' });

// ── Master data loaded from API ───────────────────────────────────────
const employeeMaster   = ref<PmsEmployee[]>([]);
const assessmentOptions = ref<PmsAssessment[]>([]);

// ── Form state ─────────────────────────────────────────────────────────
interface FormState {
    employee_id: number | null;
    assessment_id: number | null;
    note: string;
    is_active: boolean;
}
const form = reactive<FormState>({
    employee_id: null,
    assessment_id: null,
    note: '',
    is_active: true,
});

const errors      = reactive({ empCode: '', assessmentId: '', raters: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

// ── Employee search ────────────────────────────────────────────────────
const empCodeSearch  = ref('');
const empSuggestions = ref<PmsEmployee[]>([]);
const employeeInfo = reactive({
    empCode: '', fullName: '', position: '', level: '', team: '', dept: '',
});

const setEmployeeInfo = (e: PmsEmployee | null) => {
    if (!e) {
        Object.assign(employeeInfo, { empCode: '', fullName: '', position: '', level: '', team: '', dept: '' });
        return;
    }
    employeeInfo.empCode  = e.emp_code ?? '';
    employeeInfo.fullName = e.full_name ?? '';
    employeeInfo.position = e.position_name ?? '';
    employeeInfo.level    = e.level_name ?? '';
    employeeInfo.team     = e.team_name ?? '';
    employeeInfo.dept     = e.department_name ?? '';
};

const onEmpCodeInput = () => {
    const q = empCodeSearch.value.trim().toLowerCase();
    if (!q) { empSuggestions.value = []; return; }
    empSuggestions.value = employeeMaster.value
        .filter(e => (e.emp_code ?? '').toLowerCase().includes(q) || (e.full_name ?? '').toLowerCase().includes(q))
        .slice(0, 5);
};

const selectEmployee = (emp: PmsEmployee) => {
    empCodeSearch.value = emp.emp_code ?? '';
    form.employee_id = emp.id;
    setEmployeeInfo(emp);
    empSuggestions.value = [];
};

// ── Assessment selection ───────────────────────────────────────────────
const assessmentInfo = reactive({ year: '', cycle: '', type: 'annual_supervisor' as 'annual_supervisor' | 'competency_360' | 'annual_self', typeHint: '' });

const onAssessmentChange = () => {
    const found = assessmentOptions.value.find(a => a.id === Number(form.assessment_id));
    assessmentInfo.year  = found?.year ? String(found.year) : '';
    assessmentInfo.cycle = found?.cycle_label ?? '';
    assessmentInfo.type  = (found?.type ?? 'annual_supervisor') as typeof assessmentInfo.type;
    assessmentInfo.typeHint =
        assessmentInfo.type === 'annual_supervisor' ? 'แบบ 180° — ใส่หัวหน้างาน (Manager / Executive / CEO)' :
        assessmentInfo.type === 'competency_360'    ? 'แบบ 360° — ใส่ self + peers + subordinates + supervisors' :
        'แบบ Self — มีเพียงผู้ถูกประเมินประเมินตนเอง';
};

// ── Rater rows (saved to pms_assessment_send_raters) ──────────────────
const ALL_ROLES: Array<{ value: PmsEvaluationRole; label: string }> = [
    { value: 'self',        label: 'ตนเอง (Self)' },
    { value: 'manager',     label: 'หัวหน้า (Manager)' },
    { value: 'executive',   label: 'ผู้บริหาร (Executive)' },
    { value: 'ceo',         label: 'CEO' },
    { value: 'peer',        label: 'เพื่อนร่วมงาน (Peer)' },
    { value: 'subordinate', label: 'ผู้ใต้บังคับบัญชา (Subordinate)' },
];

/** Roles available for current assessment type */
const availableRoles = computed(() => {
    if (assessmentInfo.type === 'annual_self')        return ALL_ROLES.filter(r => r.value === 'self');
    if (assessmentInfo.type === 'annual_supervisor')  return ALL_ROLES.filter(r => ['manager','executive','ceo'].includes(r.value));
    return ALL_ROLES;   // competency_360 — all 6
});

interface EvaluatorRow {
    rater_id?: number;             // existing pms_assessment_send_raters.id (edit mode)
    evaluator_employee_id: number | null;
    evaluator_role: PmsEvaluationRole;
    search: string;
    position: string;
    level: string;
    showDropdown: boolean;
    suggestions: PmsEmployee[];
}
const makeEvaluatorRow = (role: PmsEvaluationRole = 'self'): EvaluatorRow => ({
    evaluator_employee_id: null,
    evaluator_role: role,
    search: '', position: '', level: '',
    showDropdown: false, suggestions: [],
});
const evaluatorRows = ref<EvaluatorRow[]>([]);

const onEvaluatorInput = (idx: number) => {
    const row = evaluatorRows.value[idx];
    const q   = row.search.trim().toLowerCase();
    if (!q) { row.showDropdown = false; row.suggestions = []; row.evaluator_employee_id = null; return; }
    row.suggestions = employeeMaster.value
        .filter(e => (e.emp_code ?? '').toLowerCase().includes(q) || (e.full_name ?? '').toLowerCase().includes(q))
        .slice(0, 5);
    row.showDropdown = row.suggestions.length > 0;
};

const selectEvaluator = (idx: number, emp: PmsEmployee) => {
    const row        = evaluatorRows.value[idx];
    row.evaluator_employee_id = emp.id;
    row.search       = `${emp.emp_code ?? ''} - ${emp.full_name ?? ''}`;
    row.position     = emp.position_name ?? '';
    row.level        = emp.level_name ?? '';
    row.showDropdown = false;
    row.suggestions  = [];
};

const addEvaluator    = () => {
    const defaultRole = (availableRoles.value[0]?.value ?? 'self') as PmsEvaluationRole;
    evaluatorRows.value.push(makeEvaluatorRow(defaultRole));
};
const removeEvaluator = (i: number) => evaluatorRows.value.splice(i, 1);

/** Auto-add a "self" row pointing to the evaluatee (handy for annual_self / competency_360) */
const autoFillRolesByType = () => {
    if (form.employee_id === null) return;
    const exists = evaluatorRows.value.some(r => r.evaluator_role === 'self' && r.evaluator_employee_id === form.employee_id);
    if (!exists) {
        const emp = employeeMaster.value.find(e => e.id === form.employee_id);
        if (emp) {
            const row = makeEvaluatorRow('self');
            row.evaluator_employee_id = emp.id;
            row.search   = `${emp.emp_code ?? ''} - ${emp.full_name ?? ''}`;
            row.position = emp.position_name ?? '';
            row.level    = emp.level_name ?? '';
            evaluatorRows.value.unshift(row);
        }
    }
};

// ── Validate & Submit ──────────────────────────────────────────────────
const validate = (): boolean => {
    errors.empCode = ''; errors.assessmentId = ''; errors.raters = '';
    let valid = true;
    if (form.employee_id === null)   { errors.empCode      = 'กรุณาเลือกผู้ถูกประเมิน'; valid = false; }
    if (form.assessment_id === null) { errors.assessmentId = 'กรุณาเลือกแบบประเมิน';    valid = false; }

    // Validate rater rows
    const cleaned = evaluatorRows.value.filter(r => r.evaluator_employee_id !== null);
    if (cleaned.length === 0) {
        errors.raters = 'กรุณาเลือกผู้ประเมินอย่างน้อย 1 คน';
        valid = false;
    }
    // No duplicate evaluator ids
    const seen = new Set<number>();
    for (const r of cleaned) {
        const k = r.evaluator_employee_id as number;
        if (seen.has(k)) { errors.raters = 'มีผู้ประเมินซ้ำในรายการ'; valid = false; break; }
        seen.add(k);
    }
    return valid;
};

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 409) {
        serverError.value = 'แบบประเมินนี้ถูกส่งให้พนักงานคนนี้แล้ว';
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
        const note = form.note.trim() || null;
        let sendId: number;
        if (isEditMode.value && editId.value !== null) {
            await sendsApi.update(editId.value, {
                assessment_id: form.assessment_id as number,
                employee_id:   form.employee_id   as number,
                note,
            });
            sendId = editId.value;
        } else {
            const res = await sendsApi.create({
                assessment_id: form.assessment_id as number,
                employee_id:   form.employee_id   as number,
                note,
            });
            sendId = (res as { data?: { id?: number } })?.data?.id ?? 0;
            if (!sendId) throw new Error('ไม่สามารถสร้าง send ได้');
        }

        // Sync raters: delete old rows then insert new ones
        try {
            const existing = await sendRatersApi.listBySend(sendId);
            for (const r of existing as Array<{ id: number }>) {
                await sendRatersApi.remove(r.id);
            }
            const cleaned = evaluatorRows.value
                .filter(r => r.evaluator_employee_id !== null)
                .map(r => ({
                    send_id: sendId,
                    evaluator_employee_id: r.evaluator_employee_id as number,
                    evaluator_role: r.evaluator_role,
                }));
            if (cleaned.length > 0) {
                await sendRatersApi.bulkCreate(cleaned);
            }
        } catch (raterErr) {
            console.warn('[send/add] failed to sync raters', raterErr);
            serverError.value = 'บันทึก send สำเร็จ แต่ไม่สามารถบันทึกผู้ประเมินได้: ' + ((raterErr as Error).message || '');
            submitting.value = false;
            return;
        }

        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/send');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    empCodeSearch.value = '';
    setEmployeeInfo(null);
    form.employee_id = null;
    form.assessment_id = null;
    form.note = '';
    Object.assign(assessmentInfo, { year: '', cycle: '', type: 'annual_supervisor', typeHint: '' });
    evaluatorRows.value = [];
    errors.empCode = ''; errors.assessmentId = ''; errors.raters = '';
    serverError.value = '';
};

onMounted(async () => {
    // Load all employees + assessments for selection
    try {
        const [emp, asm] = await Promise.all([
            employeesApi.list({ limit: 1000 }),
            assessmentsApi.list({ limit: 500 }),
        ]);
        employeeMaster.value = emp.data;
        assessmentOptions.value = asm.data;
    } catch (e) {
        console.warn('[send/add] failed to load masters', e);
    }

    // Edit mode → load existing send + raters
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await sendsApi.get(editId.value);
            const s = res.data;
            form.assessment_id = s.assessment_id;
            form.employee_id   = s.employee_id;
            form.note          = s.note ?? '';
            empCodeSearch.value = s.emp_code ?? '';
            employeeInfo.empCode  = s.emp_code ?? '';
            employeeInfo.fullName = s.full_name ?? '';
            employeeInfo.position = s.employee_position_name ?? '';
            employeeInfo.level    = s.employee_level_name ?? '';
            employeeInfo.team     = s.employee_team_name ?? '';
            employeeInfo.dept     = s.employee_department_name ?? '';
            assessmentInfo.year   = s.year ? String(s.year) : '';
            assessmentInfo.cycle  = s.cycle_label ?? '';
            // Re-resolve type from loaded assessment options
            onAssessmentChange();

            // Load existing raters for this send
            const raters = await sendRatersApi.listBySend(editId.value) as Array<{
                id: number;
                evaluator_employee_id: number;
                evaluator_role: PmsEvaluationRole;
                pms_employees?: {
                    emp_code?: string;
                    full_name?: string;
                    pms_positions?: { name?: string };
                    pms_levels?: { name?: string };
                };
            }>;
            evaluatorRows.value = raters.map(r => ({
                rater_id: r.id,
                evaluator_employee_id: r.evaluator_employee_id,
                evaluator_role: r.evaluator_role,
                search: `${r.pms_employees?.emp_code ?? ''} - ${r.pms_employees?.full_name ?? ''}`,
                position: r.pms_employees?.pms_positions?.name ?? '',
                level:    r.pms_employees?.pms_levels?.name ?? '',
                showDropdown: false,
                suggestions: [],
            }));
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});
</script>
