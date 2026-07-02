<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f5f3ff;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.8">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1 class="text-lg font-bold text-gray-800">แก้ไขรายงาน</h1>
        </div>

        <!-- Filter Card -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-4 grid grid-cols-2 gap-4">
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
            </div>
            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                    <div class="relative">
                        <select v-model="filterDept" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none" @change="filterTeam = ''">
                            <option value="">ทั้งหมด</option>
                            <option v-for="d in deptOptions" :key="d.id" :value="d.name">{{ d.name }}</option>
                        </select>
                        <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                    <div class="relative">
                        <select v-model="filterTeam" class="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-blue-400 focus:outline-none">
                            <option value="">ทั้งหมด</option>
                            <option v-for="t in filteredTeamOptions" :key="t.id" :value="t.name">{{ t.name }}</option>
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

        <!-- Error banner -->
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Table Card -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-3 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">ปีประเมิน</th>
                            <th class="w-28 px-3 py-3 text-center font-semibold text-gray-700">รอบประเมิน</th>
                            <th class="px-3 py-3 text-left font-semibold text-gray-700">แผนก</th>
                            <th class="px-3 py-3 text-left font-semibold text-gray-700">ทีม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">รหัส</th>
                            <th class="w-36 px-3 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-500">KPI เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-500">Comp เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-gray-500">Score เดิม</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">KPI แก้</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">Comp แก้</th>
                            <th class="w-24 px-3 py-3 text-center font-semibold text-purple-700">Score แก้</th>
                            <th class="w-20 px-3 py-3 text-center font-semibold text-gray-700">Rev.</th>
                            <th class="w-36 px-3 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="15" class="px-4 py-10 text-center text-sm text-gray-400">
                                <div class="inline-flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
                                    กำลังโหลดข้อมูล...
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="rows.length === 0">
                            <td colspan="15" class="px-4 py-10 text-center text-sm text-gray-400">ไม่พบข้อมูล — กรุณาเลือก filter แล้วกดค้นหา</td>
                        </tr>
                        <tr
                            v-else
                            v-for="(item, index) in rows"
                            :key="item.send_id"
                            class="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                            <td class="px-3 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                            <td class="px-3 py-3 text-center text-gray-700">{{ item.year ?? '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-700">{{ item.cycle_label || '—' }}</td>
                            <td class="px-3 py-3 text-gray-700">{{ item.department_name || '—' }}</td>
                            <td class="px-3 py-3 text-gray-700">{{ item.team_name || '—' }}</td>
                            <td class="px-3 py-3 text-center font-medium text-gray-800">{{ item.emp_code || '—' }}</td>
                            <td class="px-3 py-3 font-medium text-gray-800">{{ item.employee_name || '—' }}</td>
                            <!-- ค่าเดิม -->
                            <td class="px-3 py-3 text-center text-gray-500">{{ item.avg_kpi_excl_self != null ? (Number(item.avg_kpi_excl_self) / 20).toFixed(2) : '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-500">{{ item.avg_comp_excl_self != null ? (Number(item.avg_comp_excl_self) / 20).toFixed(2) : '—' }}</td>
                            <td class="px-3 py-3 text-center text-gray-500">{{ item.score_100 != null ? Number(item.score_100).toFixed(2) : '—' }}</td>
                            <!-- ค่าที่แก้ไข (latest revision) -->
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#d1d5db;'">
                                {{ item.adjustment ? (item.adjustment.kpi_adjusted / 20).toFixed(2) : '—' }}
                            </td>
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#d1d5db;'">
                                {{ item.adjustment ? (item.adjustment.comp_adjusted / 20).toFixed(2) : '—' }}
                            </td>
                            <td class="px-3 py-3 text-center font-semibold" :style="item.adjustment ? 'color:#7c3aed;' : 'color:#d1d5db;'">
                                {{ item.adjustment ? Number(item.adjustment.score_100_adjusted).toFixed(2) : '—' }}
                            </td>
                            <!-- Revision badge -->
                            <td class="px-3 py-3 text-center">
                                <span v-if="item.adjustment" class="inline-block rounded-full px-2 py-0.5 text-xs font-bold" style="background:#f5f3ff;color:#7c3aed;">#{{ item.adjustment.revision }}</span>
                                <span v-else class="text-gray-300">—</span>
                            </td>
                            <!-- Actions -->
                            <td class="px-3 py-3 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        class="rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-80"
                                        style="background:#4361ee;"
                                        @click="openEditModal(item)"
                                    >แก้ไข</button>
                                    <button
                                        v-if="item.adjustment"
                                        type="button"
                                        class="rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:bg-purple-50"
                                        style="border-color:#7c3aed;color:#7c3aed;"
                                        @click="openHistoryModal(item)"
                                    >ประวัติ</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ─── Edit Modal ──────────────────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="editModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeEditModal">
                <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">
                    <!-- Header -->
                    <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div>
                            <h2 class="text-base font-bold text-gray-800">แก้ไขคะแนน</h2>
                            <p class="text-xs text-gray-500 mt-0.5">
                                {{ editModal.row?.employee_name }} ({{ editModal.row?.emp_code }})
                                — Revision ถัดไป: <span class="font-semibold text-purple-700">#{{ nextRevision }}</span>
                            </p>
                        </div>
                        <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                        </button>
                    </div>

                    <div class="px-6 py-5 space-y-5">
                        <!-- ค่าเดิม (read-only) -->
                        <div class="rounded-xl bg-gray-50 p-4">
                            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">ค่าเดิม (คำนวณอัตโนมัติ)</p>
                            <div class="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p class="text-xs text-gray-500">KPI</p>
                                    <p class="text-lg font-bold text-gray-800">
                                        {{ editModal.row?.avg_kpi_excl_self != null ? (Number(editModal.row.avg_kpi_excl_self) / 20).toFixed(2) : '—' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Comp.</p>
                                    <p class="text-lg font-bold text-gray-800">
                                        {{ editModal.row?.avg_comp_excl_self != null ? (Number(editModal.row.avg_comp_excl_self) / 20).toFixed(2) : '—' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Score 100</p>
                                    <p class="text-lg font-bold text-gray-800">
                                        {{ editModal.row?.score_100 != null ? Number(editModal.row.score_100).toFixed(2) : '—' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- ค่าใหม่ -->
                        <div>
                            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">ค่าใหม่ (สเกล 1–5)</p>
                            <div class="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">คะแนน KPI</label>
                                    <div class="flex items-center gap-1.5">
                                        <input
                                            v-model.number="editForm.kpiInput"
                                            type="number" min="0" max="5" step="0.01"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <span class="text-sm text-gray-400 whitespace-nowrap">/ 5</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-gray-700">คะแนน Comp.</label>
                                    <div class="flex items-center gap-1.5">
                                        <input
                                            v-model.number="editForm.compInput"
                                            type="number" min="0" max="5" step="0.01"
                                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                        <span class="text-sm text-gray-400 whitespace-nowrap">/ 5</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Score 100 preview -->
                            <div class="rounded-lg p-3 text-center" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);">
                                <p class="text-xs text-white opacity-80">คะแนนรวม 100 คะแนน (Preview)</p>
                                <p class="text-2xl font-bold text-white mt-0.5">{{ score100Preview.toFixed(2) }}</p>
                                <p class="text-xs text-white opacity-70 mt-0.5">
                                    KPI {{ editForm.kpiInput ?? 0 }} × {{ editModal.row?.kpi_weight ?? 50 }}% +
                                    Comp {{ editForm.compInput ?? 0 }} × {{ editModal.row?.competency_weight ?? 50 }}%
                                </p>
                            </div>
                        </div>

                        <!-- Comment -->
                        <div>
                            <label class="mb-1 block text-sm font-medium text-gray-700">
                                เหตุผล / หมายเหตุ <span class="text-red-500">*</span>
                            </label>
                            <textarea
                                v-model="editForm.comment"
                                rows="3"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none resize-none"
                                placeholder="ระบุเหตุผลในการแก้ไข..."
                            ></textarea>
                        </div>

                        <!-- Error -->
                        <p v-if="editModal.error" class="text-xs text-red-600">{{ editModal.error }}</p>
                    </div>

                    <!-- Footer -->
                    <div class="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                        <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="closeEditModal">
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            class="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style="background:#7c3aed;"
                            :disabled="editModal.saving || !editForm.comment.trim() || editForm.kpiInput == null || editForm.compInput == null"
                            @click="handleSaveEdit"
                        >
                            <span v-if="editModal.saving">กำลังบันทึก...</span>
                            <span v-else>บันทึก</span>
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ─── History Modal ───────────────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="historyModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="historyModal.show = false">
                <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                    <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h2 class="text-base font-bold text-gray-800">ประวัติการแก้ไข — {{ historyModal.employeeName }}</h2>
                        <button class="text-gray-400 hover:text-gray-600" @click="historyModal.show = false">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                        </button>
                    </div>
                    <div class="max-h-96 overflow-y-auto px-6 py-4 space-y-4">
                        <div v-if="historyModal.loading" class="text-center text-sm text-gray-400 py-6">กำลังโหลด...</div>
                        <div v-else-if="historyModal.revisions.length === 0" class="text-center text-sm text-gray-400 py-6">ไม่พบประวัติ</div>
                        <div
                            v-else
                            v-for="(rev, idx) in historyModal.revisions"
                            :key="rev.id"
                            class="rounded-xl border border-gray-100 p-4"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style="background:#f5f3ff;color:#7c3aed;">#{{ rev.revision }}</span>
                                <span class="text-xs text-gray-400">{{ formatDate(rev.adjusted_at) }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">KPI</p>
                                    <p class="font-semibold text-gray-700">
                                        {{ prevKpi(idx).toFixed(2) }} → {{ (rev.kpi_adjusted / 20).toFixed(2) }}
                                    </p>
                                </div>
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">Comp.</p>
                                    <p class="font-semibold text-gray-700">
                                        {{ prevComp(idx).toFixed(2) }} → {{ (rev.comp_adjusted / 20).toFixed(2) }}
                                    </p>
                                </div>
                                <div class="rounded-lg bg-gray-50 p-2">
                                    <p class="text-gray-500 mb-0.5">Score 100</p>
                                    <p class="font-semibold text-purple-700">
                                        {{ prevScore(idx).toFixed(2) }} → {{ Number(rev.score_100_adjusted).toFixed(2) }}
                                    </p>
                                </div>
                            </div>
                            <p class="text-xs text-gray-600 italic">"{{ rev.comment }}"</p>
                        </div>
                    </div>
                    <div class="border-t border-gray-100 px-6 py-3 flex justify-end">
                        <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition" @click="historyModal.show = false">
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsScoreAdjustmentListRow, PmsScoreAdjustmentRow } from '@/composables/usePmsScoreAdjustments';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsDepartment } from '@/composables/usePmsDepartments';
import type { PmsTeam } from '@/composables/usePmsTeams';

useHead({ title: 'แก้ไขรายงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const adjustApi  = usePmsScoreAdjustments();
const yearsApi   = usePmsYears();
const cyclesApi  = usePmsCycles();
const deptsApi   = usePmsDepartments();
const teamsApi   = usePmsTeams();

// ─── Data ─────────────────────────────────────────────────────────────────────
const rows         = ref<PmsScoreAdjustmentListRow[]>([]);
const yearOptions  = ref<PmsYear[]>([]);
const cycleOptions = ref<PmsCycle[]>([]);
const deptOptions  = ref<PmsDepartment[]>([]);
const teamOptions  = ref<PmsTeam[]>([]);
const loading      = ref(false);
const errorMessage = ref('');

// ─── Filters ──────────────────────────────────────────────────────────────────
const filterYear  = ref<number | ''>('');
const filterCycle = ref('');
const filterDept  = ref('');
const filterTeam  = ref('');

const filteredTeamOptions = computed(() => {
    if (!filterDept.value) return teamOptions.value;
    return teamOptions.value.filter(t => t.department_name === filterDept.value);
});

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const editModal = ref<{
    show: boolean;
    row: PmsScoreAdjustmentListRow | null;
    saving: boolean;
    error: string;
}>({ show: false, row: null, saving: false, error: '' });

const editForm = ref({
    kpiInput:  null as number | null,
    compInput: null as number | null,
    comment:   '',
});

const nextRevision = computed(() =>
    editModal.value.row?.adjustment ? editModal.value.row.adjustment.revision + 1 : 1
);

const score100Preview = computed(() => {
    if (!editModal.value.row) return 0;
    const kpi = editForm.value.kpiInput  ?? 0;
    const comp = editForm.value.compInput ?? 0;
    const kw  = Number(editModal.value.row.kpi_weight)        || 50;
    const cw  = Number(editModal.value.row.competency_weight) || 50;
    return Math.round((kpi * 20 * kw / 100 + comp * 20 * cw / 100) * 100) / 100;
});

const openEditModal = (row: PmsScoreAdjustmentListRow) => {
    editModal.value = { show: true, row, saving: false, error: '' };
    const adj = row.adjustment;
    editForm.value = {
        kpiInput:  adj ? +(adj.kpi_adjusted / 20).toFixed(2) : null,
        compInput: adj ? +(adj.comp_adjusted / 20).toFixed(2) : null,
        comment:   '',
    };
};

const closeEditModal = () => {
    editModal.value.show = false;
};

const handleSaveEdit = async () => {
    if (!editModal.value.row) return;
    if (!editForm.value.comment.trim()) {
        editModal.value.error = 'กรุณาระบุเหตุผล';
        return;
    }
    if (editForm.value.kpiInput == null || editForm.value.compInput == null) {
        editModal.value.error = 'กรุณาระบุคะแนน KPI และ Comp.';
        return;
    }

    editModal.value.saving = true;
    editModal.value.error  = '';
    try {
        await adjustApi.createRevision({
            send_id:       editModal.value.row.send_id,
            kpi_adjusted:  +(editForm.value.kpiInput * 20).toFixed(2),
            comp_adjusted: +(editForm.value.compInput * 20).toFixed(2),
            comment:       editForm.value.comment.trim(),
        });
        closeEditModal();
        await fetchList();
    } catch (e) {
        editModal.value.error = e instanceof PmsApiError ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่';
    } finally {
        editModal.value.saving = false;
    }
};

// ─── History Modal ────────────────────────────────────────────────────────────
const historyModal = ref<{
    show: boolean;
    loading: boolean;
    revisions: PmsScoreAdjustmentRow[];
    employeeName: string;
}>({ show: false, loading: false, revisions: [], employeeName: '' });

const openHistoryModal = async (row: PmsScoreAdjustmentListRow) => {
    historyModal.value = { show: true, loading: true, revisions: [], employeeName: row.employee_name ?? '' };
    try {
        const res = await adjustApi.listRevisions(row.send_id);
        historyModal.value.revisions = res.data;
    } catch {
        historyModal.value.revisions = [];
    } finally {
        historyModal.value.loading = false;
    }
};

// revisions sorted newest→oldest (idx=0 is newest)
// prevKpi(0) = revisions[1].kpi_adjusted/20  (previous revision)
// prevKpi(last) = orig_kpi/20                (before any adjustment)
const prevKpi = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return (revs[idx].orig_kpi ?? 0) / 20;
    return revs[idx + 1].kpi_adjusted / 20;
};
const prevComp = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return (revs[idx].orig_comp ?? 0) / 20;
    return revs[idx + 1].comp_adjusted / 20;
};
const prevScore = (idx: number): number => {
    const revs = historyModal.value.revisions;
    if (idx === revs.length - 1) return Number(revs[idx].orig_score_100 ?? 0);
    return Number(revs[idx + 1].score_100_adjusted);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const fetchMasters = async () => {
    try {
        const [y, c, d, t] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            deptsApi.list({ limit: 200 }),
            teamsApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
        deptOptions.value  = d.data;
        teamOptions.value  = t.data;
    } catch (e) {
        console.warn('[reports-edit] failed to load masters', e);
    }
};

const fetchList = async () => {
    loading.value      = true;
    errorMessage.value = '';
    try {
        const res = await adjustApi.list({
            year:  filterYear.value === '' ? undefined : Number(filterYear.value),
            cycle: filterCycle.value || undefined,
            dept:  filterDept.value  || undefined,
            team:  filterTeam.value  || undefined,
            limit: 1000,
        });
        rows.value = res.data;
    } catch (e) {
        errorMessage.value = e instanceof PmsApiError ? e.message : 'โหลดข้อมูลไม่สำเร็จ';
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => fetchList();
const handleClear  = () => {
    filterYear.value  = '';
    filterCycle.value = '';
    filterDept.value  = '';
    filterTeam.value  = '';
    rows.value        = [];
};

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

onMounted(fetchMasters);
</script>
