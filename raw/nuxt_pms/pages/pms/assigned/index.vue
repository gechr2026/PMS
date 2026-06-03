<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">งานที่ได้รับมอบหมาย</h1>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid grid-cols-3 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterYear" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="y in yearOptions" :key="y.id" :value="y.year">{{ y.year }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน</label>
                    <div class="relative">
                        <select v-model="filterCycle" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="c in cycleOptions" :key="c.id" :value="c.cycle_label">{{ c.cycle_label }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">สถานะ</label>
                    <div class="relative">
                        <select v-model="filterStatus" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option>ยังไม่เข้าทำแบบประเมิน</option>
                            <option>อยู่ระหว่างการประเมิน</option>
                            <option>ประเมินเสร็จสิ้นแล้ว</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button type="button" class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90" style="background:#4361ee;" @click="handleSearch">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                    ค้นหา
                </button>
                <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100" @click="handleClear">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20L4 4M20 4L4 20" stroke-linecap="round"/></svg>
                    ล้าง
                </button>
            </div>
        </div>

        <!-- Table Card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ผู้ถูกประเมิน</th>
                            <th v-if="isAdmin" class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ผู้ประเมิน</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีการประเมิน</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                            <th class="w-44 px-4 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                            <th class="w-20 px-4 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td :colspan="isAdmin ? 8 : 7" class="px-4 py-10 text-center text-sm text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                    </svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td :colspan="isAdmin ? 8 : 7" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in rows"
                            :key="item.send_id"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-4 py-3 font-medium text-gray-800">{{ item.full_name }}</td>
                            <td v-if="isAdmin" class="px-4 py-3 text-gray-700">
                                <span class="font-medium text-gray-800">{{ item.evaluatorName || '-' }}</span>
                                <span v-if="item.evaluatorEmpCode" class="block text-xs text-gray-400">{{ item.evaluatorEmpCode }}</span>
                            </td>
                            <td class="px-4 py-3 text-gray-700">{{ item.assessment_name }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.year }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ item.cycle_label }}</td>
                            <td class="px-4 py-3 text-center">
                                <span
                                    class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                                    :class="{
                                        'bg-gray-100 text-gray-600'  : item.derivedStatus === 'ยังไม่เข้าทำแบบประเมิน',
                                        'bg-amber-100 text-amber-700': item.derivedStatus === 'อยู่ระหว่างการประเมิน',
                                        'bg-green-100 text-green-700': item.derivedStatus === 'ประเมินเสร็จสิ้นแล้ว',
                                    }"
                                >{{ item.derivedStatus }}</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <!-- Edit (or admin-revert): not-yet-sent OR caller is admin -->
                                <NuxtLink
                                    v-if="item.derivedStatus !== 'ประเมินเสร็จสิ้นแล้ว' || isAdmin"
                                    :to="`/pms/assigned/view?send_id=${item.send_id}${item.assessment_id ? '&assessment_id=' + item.assessment_id : ''}&evaluator_role=${item.evaluatorRole}${item.evaluatorName ? '&evaluator_name=' + encodeURIComponent(item.evaluatorName) : ''}${item.evaluatorEmpCode ? '&evaluator_emp_code=' + encodeURIComponent(item.evaluatorEmpCode) : ''}`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500 transition hover:bg-blue-100"
                                    :title="item.derivedStatus === 'ประเมินเสร็จสิ้นแล้ว' ? 'เปิดดู / ปลดล็อกเป็นร่าง' : 'ทำแบบประเมิน'"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </NuxtLink>
                                <!-- View (read-only) for non-admin once status='sent' -->
                                <NuxtLink
                                    v-else
                                    :to="`/pms/assigned/view?send_id=${item.send_id}&readonly=1`"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 transition hover:bg-amber-100"
                                    title="ดูผลประเมิน"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </NuxtLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsSend } from '@/composables/usePmsSends';
import type { PmsEvaluation, PmsEvaluationRole } from '@/composables/usePmsEvaluations';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';

useHead({ title: 'งานที่ได้รับมอบหมาย | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const sendsApi       = usePmsSends();
const evaluationsApi = usePmsEvaluations();
const yearsApi       = usePmsYears();
const cyclesApi      = usePmsCycles();
const { request }    = usePmsApi();
const { profile, user } = useAuth();
const supabase       = useSupabase();

type DerivedStatus = 'ยังไม่เข้าทำแบบประเมิน' | 'อยู่ระหว่างการประเมิน' | 'ประเมินเสร็จสิ้นแล้ว';

interface Row {
    send_id: number;
    /** Primary assessment for this task — when a send has multiple assessments,
     *  we link to the first (admin can navigate further from view page). */
    assessment_id: number | null;
    full_name: string;
    emp_code: string;
    assessment_name: string;
    year: number | string;
    cycle_label: string;
    derivedStatus: DerivedStatus;
    rawSendStatus: string;
    /** Which evaluator perspective this row represents for the current user.
     *  Drives the per-row evaluation lookup (a supervisor may have both
     *  a 'self' row for their own send and 'peer' rows for teammates). */
    evaluatorRole: PmsEvaluationRole;
    evaluatorName: string;
    evaluatorEmpCode: string;
}

const rows           = ref<Row[]>([]);
const yearOptions    = ref<PmsYear[]>([]);
const cycleOptions   = ref<PmsCycle[]>([]);
const loading        = ref(false);
const errorMessage   = ref('');

const filterYear   = ref('');
const filterCycle  = ref('');
const filterStatus = ref<DerivedStatus | ''>('');

// Admin sees edit-link even for sent rows so they can revert via the view page.
const isAdmin = computed(() => profile.value?.role === 'admin');

// Map current user's role -> evaluator_role they're responsible for.
// Supervisor is handled separately in fetchData (sees both 'self' for their
// own send AND 'peer' for teammates they're pre-assigned to rate), so it
// isn't represented here.
const evaluatorRoleForUser = (): PmsEvaluationRole => {
    const r = profile.value?.role;
    if (r === 'manager')   return 'manager';
    if (r === 'executive') return 'executive';
    // admin/officer/null → default to 'self'
    return 'self';
};

const fetchMasters = async () => {
    try {
        const [y, c] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
    } catch (e) {
        console.warn('[assigned] failed to load masters', e);
    }
};

const fetchData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // 1) Fetch sends, tagged per-row with the evaluator role the current
        // user holds on that send. Behavior per role:
        //   * admin       → all sends, role='self' as a UI default
        //   * supervisor  → two queries merged: own send (role='self') +
        //                   peer-rater assignments (role='peer')
        //   * manager     → as_rater='me' & evaluator_role='manager'
        //   * executive   → as_rater='me' & evaluator_role='executive'
        //   * officer     → as_rater='me' & evaluator_role='self'
        const role = profile.value?.role;
        const isAdmin = role === 'admin';
        const yearParam  = filterYear.value  ? Number(filterYear.value) : undefined;
        const cycleParam = filterCycle.value || undefined;

        // Resolve my employee id once — needed for (a) supervisor's own-send
        // query, and (b) the per-row evaluation lookup so we only consider
        // the CURRENT user's evaluation (critical for peer rows where many
        // raters can have evals on the same send).
        let myEmpId: number | null = null;
        if (!isAdmin && user.value?.id) {
            const { data: me } = await supabase
                .from('pms_employees')
                .select('id')
                .eq('auth_user_id', user.value.id)
                .maybeSingle();
            myEmpId = me?.id ?? null;
        }

        // ── Admin path: call pms-assigned?all=true → one row per rater assignment ──
        if (isAdmin) {
            interface AssignedRow {
                send_id: number;
                assessment_id: number | null;
                assessment_name: string | null;
                year: number | null;
                cycle_label: string | null;
                evaluator_role: string | null;
                evaluatee_name: string | null;
                evaluatee_emp_code: string | null;
                eval_status: string | null;
                employee_name: string | null;
                emp_code: string | null;
            }
            const q: Record<string, string | number | undefined> = { all: 'true', limit: 500 };
            if (yearParam)  q.year  = yearParam;
            if (cycleParam) q.cycle = cycleParam;
            const res = await request<{ data: AssignedRow[] }>('/pms-assigned', { query: q });
            const built: Row[] = (res.data ?? []).map(r => {
                let derived: DerivedStatus = 'ยังไม่เข้าทำแบบประเมิน';
                if (r.eval_status === 'sent')  derived = 'ประเมินเสร็จสิ้นแล้ว';
                else if (r.eval_status === 'draft') derived = 'อยู่ระหว่างการประเมิน';
                return {
                    send_id: r.send_id,
                    assessment_id: r.assessment_id,
                    full_name: r.evaluatee_name ?? '-',
                    emp_code: r.evaluatee_emp_code ?? '',
                    assessment_name: r.assessment_name ?? '-',
                    year: r.year ?? '',
                    cycle_label: r.cycle_label ?? '',
                    rawSendStatus: '',
                    derivedStatus: derived,
                    evaluatorRole: (r.evaluator_role ?? 'self') as PmsEvaluationRole,
                    evaluatorName: r.employee_name ?? '-',
                    evaluatorEmpCode: r.emp_code ?? '',
                };
            });
            rows.value = filterStatus.value ? built.filter(r => r.derivedStatus === filterStatus.value) : built;
            return;
        }

        // ── Non-admin path ──
        type TaggedSend = { send: PmsSend; evaluatorRole: PmsEvaluationRole };
        const tagged: TaggedSend[] = [];

        // All non-admin: fetch every rater assignment for this user without
        // filtering by evaluator_role. The API populates my_rater_evaluator_role
        // per row so the correct role (self/manager/peer/subordinate/…) is
        // used for each assignment regardless of the user's system role.
        const res = await sendsApi.list({
            year: yearParam, cycle: cycleParam,
            as_rater: 'me',
            limit: 500,
        });
        for (const s of res.data) {
            tagged.push({
                send: s,
                evaluatorRole: (s.my_rater_evaluator_role ?? evaluatorRoleForUser()) as PmsEvaluationRole,
            });
        }

        if (tagged.length === 0) {
            rows.value = [];
            return;
        }

        // 2) Load my evaluation for each send (parallel). Scope strictly to
        // (send_id, assessment_id, evaluator_role, evaluator_employee_id).
        // Without assessment_id + employee_id filters this leaks status from
        // a different rater or a different assessment that happens to share
        // (send_id, role) — e.g. supervisor's prior peer eval on another
        // assessment marked the new assignment as "done".
        const evals = await Promise.all(
            tagged.map(t => {
                const aid = t.send.my_rater_assessment_id ?? t.send.assessments[0]?.id ?? undefined;
                return evaluationsApi
                    .list({
                        send_id: t.send.id,
                        evaluator_role: t.evaluatorRole,
                        ...(aid != null ? { assessment_id: aid } : {}),
                        ...(myEmpId != null ? { evaluator_employee_id: myEmpId } : {}),
                        limit: 1,
                    })
                    .then(r => r.data[0] ?? null)
                    .catch(() => null);
            })
        );

        // 3) Build rows
        const built: Row[] = tagged.map((t, i) => {
            const s = t.send;
            const e = evals[i];
            let derived: DerivedStatus = 'ยังไม่เข้าทำแบบประเมิน';
            if (e) {
                // Status simplified 2026-05-22: 'sent' = locked/done; 'draft' = in-progress.
                if (e.status === 'sent') {
                    derived = 'ประเมินเสร็จสิ้นแล้ว';
                } else if (e.status === 'draft') {
                    derived = 'อยู่ระหว่างการประเมิน';
                }
            }
            // Prefer the assessment the current user is specifically assigned
            // to rate (set by the API when as_rater='me'); fall back to the
            // send's first assessment for admin / self rows.
            const ratedAssessmentId   = s.my_rater_assessment_id   ?? s.assessments[0]?.id   ?? null;
            const ratedAssessmentName = s.my_rater_assessment_name ?? s.primary_assessment_name ?? '-';
            return {
                send_id: s.id,
                assessment_id: ratedAssessmentId,
                full_name: s.full_name ?? '-',
                emp_code: s.emp_code ?? '',
                assessment_name: ratedAssessmentName,
                year: s.year ?? '',
                cycle_label: s.cycle_label ?? '',
                rawSendStatus: s.status,
                derivedStatus: derived,
                evaluatorRole: t.evaluatorRole,
                evaluatorName: '',
                evaluatorEmpCode: '',
            };
        });

        // Apply status filter (frontend, since derivedStatus is computed)
        rows.value = filterStatus.value
            ? built.filter(r => r.derivedStatus === filterStatus.value)
            : built;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลได้';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchData();
const handleClear  = () => {
    filterYear.value = '';
    filterCycle.value = '';
    filterStatus.value = '';
    fetchData();
};

onMounted(async () => {
    await fetchMasters();
    await fetchData();
});
</script>
