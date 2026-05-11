<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 3" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">ผลการประเมิน</h1>
            </div>
            <NuxtLink to="/pms/evaluation" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                กลับ
            </NuxtLink>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
            <div class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                กำลังโหลดข้อมูล...
            </div>
        </div>
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <template v-if="!loading && data">
            <!-- Assessment Info Card -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ชื่อแบบประเมิน</p>
                    <p class="mt-0.5 text-sm font-semibold text-gray-800">{{ data.summary.assessment_name || '—' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">รอบปีการประเมิน</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-700">{{ data.summary.year ?? '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">รอบการประเมิน</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-700">{{ data.summary.cycle_label || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- Employee Info Card -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ข้อมูลผู้ถูกประเมิน</span>
                </div>
                <div class="grid grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">รหัสพนักงาน</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.emp_code || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ชื่อผู้ถูกประเมิน</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.employee_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ตำแหน่ง</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.position_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ระดับตำแหน่ง</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.level_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ทีม</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.team_name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">แผนก</p>
                        <p class="mt-0.5 text-sm font-medium text-gray-800">{{ data.summary.department_name || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- Score Boxes -->
            <div class="mb-4 grid grid-cols-3 gap-4">
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#f59e0b,#fbbf24);">
                    <p class="text-xs font-semibold opacity-90">คะแนนการประเมิน KPI เฉลี่ย</p>
                    <p class="mt-1 text-2xl font-bold">{{ formatScore(data.summary.avg_kpi_score) }}</p>
                </div>
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#3b82f6,#60a5fa);">
                    <p class="text-xs font-semibold opacity-90">คะแนนการประเมิน Competency เฉลี่ย</p>
                    <p class="mt-1 text-2xl font-bold">{{ formatScore(data.summary.avg_competency_score) }}</p>
                </div>
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#10b981,#34d399);">
                    <p class="text-xs font-semibold opacity-90">ผลการประเมินรวมเฉลี่ย</p>
                    <p class="mt-1 text-2xl font-bold">
                        {{ formatScore(data.summary.avg_total_score) }}
                        <span v-if="data.summary.final_grade" class="text-base font-semibold opacity-80">({{ data.summary.final_grade }})</span>
                    </p>
                </div>
            </div>

            <!-- Per-role aggregates (360°) — peer mean / subordinate mean / etc. -->
            <div v-if="data.per_role && data.per_role.length > 0" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18" stroke-linecap="round"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">สรุปคะแนนเฉลี่ยตามบทบาท (360°)</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">บทบาท</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">จำนวน rater</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">ส่งแล้ว</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">KPI mean</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">Competency mean</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">รวม mean</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pr in data.per_role" :key="pr.evaluator_role" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-2.5 font-medium text-gray-800">{{ perRoleLabel(pr.evaluator_role) }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-600">{{ pr.rater_count }}</td>
                                <td class="px-4 py-2.5 text-center" :class="pr.submitted_count === pr.rater_count ? 'text-green-600 font-semibold' : 'text-gray-600'">{{ pr.submitted_count }}/{{ pr.rater_count }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-700">{{ formatScore(pr.kpi_mean) }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-700">{{ formatScore(pr.competency_mean) }}</td>
                                <td class="px-4 py-2.5 text-center font-semibold text-gray-800">{{ formatScore(pr.total_mean) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Per-evaluator breakdown -->
            <div v-if="data.evaluations.length > 0" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">คะแนนแยกตามผู้ประเมิน</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">ผู้ประเมิน</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">สถานะ</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">KPI</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">Competency</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">รวม</th>
                                <th class="w-20 px-4 py-2.5 text-center font-semibold text-gray-700">เกรด</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="ev in data.evaluations" :key="ev.id" class="border-b border-gray-100">
                                <td class="px-4 py-3 font-medium text-gray-800">{{ roleLabel(ev.evaluator_role) }}</td>
                                <td class="px-4 py-3 text-center">
                                    <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusClass(ev.status)">
                                        {{ statusLabel(ev.status) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ formatScore(ev.kpi_score) }}</td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ formatScore(ev.competency_score) }}</td>
                                <td class="px-4 py-3 text-center font-semibold text-gray-800">{{ formatScore(ev.total_score) }}</td>
                                <td class="px-4 py-3 text-center">
                                    <span v-if="ev.grade" class="inline-block rounded-full px-2 py-0.5 text-xs font-bold" :class="gradeClass(ev.grade)">{{ ev.grade }}</span>
                                    <span v-else class="text-xs text-gray-400">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- แปลผลการประเมิน -->
            <div v-if="data.grade_definition" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">แปลผลการประเมิน</span>
                </div>
                <p class="text-sm text-gray-700 leading-relaxed">{{ data.grade_definition }}</p>
            </div>

            <!-- KPI Table -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">แบบประเมิน KPIs</span>
                </div>
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ข้อที่</th>
                                <th class="w-40 px-4 py-2.5 text-left font-semibold text-gray-700">หัวข้อ</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">รายละเอียด</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">คะแนนเฉลี่ย</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.kpis.length === 0">
                                <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-400">ไม่มีข้อมูล KPI</td>
                            </tr>
                            <tr v-for="(kpi, idx) in data.kpis" :key="kpi.id" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 font-medium text-gray-800">{{ kpi.subject }}</td>
                                <td class="px-4 py-3 text-gray-600">{{ kpi.detail || '—' }}</td>
                                <td class="px-4 py-3 text-center font-semibold text-gray-800">{{ formatScore(kpi.avg_score) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- สิ่งที่ต้องปรับปรุง -->
                <div v-if="data.kpi_improvements.length > 0">
                    <p class="mb-2 text-sm font-semibold text-gray-700">สิ่งที่ต้องปรับปรุง</p>
                    <ol class="list-decimal pl-5 space-y-1">
                        <li v-for="item in data.kpi_improvements" :key="item.id" class="text-sm text-gray-600">
                            {{ item.subject }}
                            <span class="ml-2 text-xs text-gray-400">(คะแนนเฉลี่ย: {{ formatScore(item.avg_score) }})</span>
                        </li>
                    </ol>
                </div>
            </div>

            <!-- Competency Table -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">แบบประเมิน Competency</span>
                </div>
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ข้อที่</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">หัวข้อ</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">คะแนนเฉลี่ย</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.competencies.length === 0">
                                <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">ไม่มีข้อมูล Competency</td>
                            </tr>
                            <tr v-for="(comp, idx) in data.competencies" :key="comp.id" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 text-gray-800 whitespace-pre-line">{{ comp.subject }}</td>
                                <td class="px-4 py-3 text-center font-semibold text-gray-800">{{ formatScore(comp.avg_score) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ด้านที่ต้องปรับปรุง -->
                <div v-if="data.competency_improvements.length > 0">
                    <p class="mb-2 text-sm font-semibold text-gray-700">ด้านที่ต้องปรับปรุง</p>
                    <ol class="list-decimal pl-5 space-y-1">
                        <li v-for="item in data.competency_improvements" :key="item.id" class="text-sm text-gray-600">
                            {{ item.subject }}
                            <span class="ml-2 text-xs text-gray-400">(คะแนนเฉลี่ย: {{ formatScore(item.avg_score) }})</span>
                        </li>
                    </ol>
                </div>
            </div>

            <!-- ผลการพิจารณา -->
            <div v-if="finalRecommendationText" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ผลการพิจารณา</span>
                </div>
                <p class="text-sm text-gray-700">{{ finalRecommendationText }}</p>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsEvaluationResultDetail } from '@/composables/usePmsEvaluationResults';

useHead({ title: 'ผลการประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const route = useRoute();
const resultsApi = usePmsEvaluationResults();

const sendId = computed<number | null>(() => {
    const v = route.query.send_id ?? route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});

const data         = ref<PmsEvaluationResultDetail | null>(null);
const loading      = ref(false);
const errorMessage = ref('');

// Same recommendation labels used in /pms/assigned/view
const recommendOptions = [
    'พนักงานมีความพร้อมที่จะรับผิดชอบในบทบาทที่สูงขึ้น โดยแนะนำให้มีการพิจารณาเลื่อนตำแหน่ง/เงินเดือน',
    'พนักงานปฏิบัติงานในหน้าที่ปัจจุบันได้อย่างครบถ้วน และมีความตั้งใจที่จะตอบสนองต่อบทบาทที่สูงขึ้นภายในระยะเวลา (0)',
    'สามารถปฏิบัติงานปัจจุบันได้ในระดับที่น่าพอใจ',
];

const finalRecommendationText = computed<string>(() => {
    const idx = data.value?.summary.final_recommendation;
    if (idx === null || idx === undefined) return '';
    return recommendOptions[idx - 1] ?? '';
});

const formatScore = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(2);
};

const gradeClass = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    const map: Record<string, string> = {
        'A+': 'bg-purple-100 text-purple-700',
        'A' : 'bg-blue-100 text-blue-700',
        'B' : 'bg-green-100 text-green-700',
        'C' : 'bg-amber-100 text-amber-700',
        'D' : 'bg-red-100 text-red-700',
        'F' : 'bg-red-200 text-red-800',
    };
    return map[grade] ?? 'bg-gray-100 text-gray-600';
};

const roleLabel = (role: string): string => {
    if (role === 'self')        return 'ตนเอง (Self)';
    if (role === 'manager')     return 'หัวหน้า (Manager)';
    if (role === 'executive')   return 'ผู้บริหาร (Executive)';
    if (role === 'ceo')         return 'CEO';
    if (role === 'peer')        return 'เพื่อนร่วมงาน (Peer)';
    if (role === 'subordinate') return 'ผู้ใต้บังคับบัญชา (Subordinate)';
    return role;
};
const perRoleLabel = (role: string): string => {
    if (role === 'self')        return 'ตนเอง';
    if (role === 'manager')     return 'หัวหน้า';
    if (role === 'executive')   return 'ผู้บริหาร';
    if (role === 'ceo')         return 'CEO';
    if (role === 'peer')        return 'เพื่อนร่วมงาน';
    if (role === 'subordinate') return 'ผู้ใต้บังคับบัญชา';
    return role;
};
const statusLabel = (s: string): string => {
    if (s === 'draft')     return 'ร่าง';
    if (s === 'submitted') return 'ส่งแล้ว';
    if (s === 'approved')  return 'อนุมัติแล้ว';
    return s;
};
const statusClass = (s: string): string => {
    if (s === 'draft')     return 'bg-gray-100 text-gray-600';
    if (s === 'submitted') return 'bg-blue-100 text-blue-700';
    if (s === 'approved')  return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
};

const loadDetail = async () => {
    if (sendId.value === null) {
        errorMessage.value = 'ไม่พบ send_id ใน URL';
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await resultsApi.detail(sendId.value);
        data.value = res.data;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 404
            ? 'ไม่พบผลการประเมินที่ระบุ'
            : (err.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
        loading.value = false;
    }
};

onMounted(() => loadDetail());
</script>
