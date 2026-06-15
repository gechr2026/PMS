<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">สรุปผลการประเมิน</h1>
            </div>
            <NuxtLink to="/pms/summary" class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
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
            <!-- Assessment Info -->
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

            <!-- Employee Info -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
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

            <!-- Score Boxes — คำนวณจาก เฉลี่ย(ไม่รวมตนเอง) × น้ำหนัก ตามแบบประเมิน -->
            <div class="mb-4 grid grid-cols-3 gap-4">
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#f59e0b,#fbbf24);">
                    <p class="text-xs font-semibold opacity-90">คะแนน KPI (× {{ kpiHeaderRatio }}%)</p>
                    <p class="mt-1 text-2xl font-bold">{{ formatScore(kpiSubtotal) }}</p>
                    <p class="mt-0.5 text-xs opacity-80">→ {{ formatScore(kpiSubtotal * kpiHeaderRatio / 100) }}</p>
                </div>
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#3b82f6,#60a5fa);">
                    <p class="text-xs font-semibold opacity-90">คะแนน Competency (× {{ competencyHeaderRatio }}%)</p>
                    <p class="mt-1 text-2xl font-bold">{{ formatScore(competencySubtotal) }}</p>
                    <p class="mt-0.5 text-xs opacity-80">→ {{ formatScore(competencySubtotal * competencyHeaderRatio / 100) }}</p>
                </div>
                <div class="rounded-xl p-4 text-white" style="background:linear-gradient(135deg,#10b981,#34d399);">
                    <p class="text-xs font-semibold opacity-90">ผลการประเมินรวม</p>
                    <p class="mt-1 text-2xl font-bold">
                        {{ formatScore(finalScore) }}
                        <span v-if="data.summary.final_grade" class="text-base font-semibold opacity-80">({{ data.summary.final_grade }})</span>
                    </p>
                    <p class="mt-0.5 text-xs opacity-80">KPI + Competency (ถ่วงน้ำหนัก)</p>
                </div>
            </div>

            <!-- Peer Comparison -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">เปรียบเทียบในระดับเดียวกันภายในทีม</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                                <th class="w-20 px-4 py-2.5 text-center font-semibold text-gray-700">KPI</th>
                                <th class="w-24 px-4 py-2.5 text-center font-semibold text-gray-700">Competency</th>
                                <th class="w-20 px-4 py-2.5 text-center font-semibold text-gray-700">รวม</th>
                                <th class="w-20 px-4 py-2.5 text-center font-semibold text-gray-700">เกรด</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.peers.length === 0">
                                <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-400">ไม่มีพนักงานในระดับเดียวกัน</td>
                            </tr>
                            <tr v-for="(peer, idx) in data.peers" :key="peer.send_id" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-2.5 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-600">{{ peer.emp_code || '—' }}</td>
                                <td class="px-4 py-2.5 font-medium text-gray-800">{{ peer.full_name || '—' }}</td>
                                <td class="px-4 py-2.5 text-gray-600">{{ peer.position_name || '—' }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-700">{{ formatScore(peer.kpi_score) }}</td>
                                <td class="px-4 py-2.5 text-center text-gray-700">{{ formatScore(peer.competency_score) }}</td>
                                <td class="px-4 py-2.5 text-center font-semibold text-gray-800">{{ formatScore(peer.total_score) }}</td>
                                <td class="px-4 py-2.5 text-center">
                                    <span v-if="peer.grade" class="inline-block rounded-full px-2 py-0.5 text-xs font-bold" :class="gradeClass(peer.grade)">{{ peer.grade }}</span>
                                    <span v-else class="text-xs text-gray-400">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Per-role aggregates (360°) — only shown if more than the trivial self/manager pair -->
            <div v-if="data.per_role && data.per_role.length > 0" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18" stroke-linecap="round"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">สรุปคะแนนเฉลี่ยตามบทบาท</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">บทบาท</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">จำนวน rater</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">ส่งแล้ว</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">KPI mean</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">Competency mean</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">รวม mean</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pr in perRoleStats" :key="pr.evaluator_role" class="border-b border-gray-100 transition hover:bg-gray-50">
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

            <!-- KPI Table with per-rater matrix -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">แบบประเมิน KPIs</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ข้อที่</th>
                                <th class="w-32 px-4 py-2.5 text-left font-semibold text-gray-700">หัวข้อ</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">รายละเอียด</th>
                                <th
                                    v-for="rater in raterColumns" :key="`${rater.evaluator_role}:${rater.evaluator_employee_id ?? ''}`"
                                    class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700 whitespace-pre-line"
                                    :title="rater.evaluator_full_name ?? ''"
                                >{{ raterLabel(rater) }}</th>
                                <th class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700" title="ค่าเฉลี่ยเฉพาะหัวหน้า + ผู้บริหาร (ไม่รวมตนเอง)">เฉลี่ย</th>
                                <th class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700">น้ำหนัก</th>
                                <th class="w-24 px-3 py-2.5 text-center font-semibold text-gray-700" title="เฉลี่ย × น้ำหนัก">คะแนนที่ได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.kpis.length === 0">
                                <td :colspan="raterColumns.length + 6" class="px-4 py-6 text-center text-sm text-gray-400">ไม่มีข้อมูล KPI</td>
                            </tr>
                            <tr v-for="(kpi, idx) in data.kpis" :key="kpi.id" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 font-medium text-gray-800">{{ kpi.subject }}</td>
                                <td class="px-4 py-3 text-gray-600">{{ kpi.detail || '—' }}</td>
                                <td v-for="rater in raterColumns" :key="`${rater.evaluator_role}:${rater.evaluator_employee_id ?? ''}`" class="px-3 py-3 text-center text-gray-700">
                                    {{ ratingFor(kpi.by_rater, rater.evaluator_role, rater.evaluator_employee_id) }}
                                </td>
                                <td class="px-3 py-3 text-center font-semibold text-gray-800">{{ formatScore(itemAvgExclSelf(kpi)) }}</td>
                                <td class="px-3 py-3 text-center text-gray-700">{{ Number(kpi.weight ?? 0).toFixed(2) }}</td>
                                <td class="px-3 py-3 text-center font-semibold text-blue-700">{{ formatScore(itemEarnedScore(kpi)) }}</td>
                            </tr>
                        </tbody>
                        <tfoot v-if="data.kpis.length > 0">
                            <tr class="border-t-2 border-gray-300 bg-gray-50">
                                <td :colspan="raterColumns.length + 4" class="px-4 py-3 text-right font-bold text-gray-700">รวมคะแนน KPI</td>
                                <td class="px-3 py-3 text-center font-bold text-gray-700">{{ kpiTotalWeight.toFixed(2) }}</td>
                                <td class="px-3 py-3 text-center font-bold text-blue-700">{{ formatScore(kpiSubtotal) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Competency Table -->
            <div class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">แบบประเมิน Competency</span>
                </div>

                <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <p class="mb-1 font-semibold">ระดับคะแนน</p>
                    <p>1 = ไม่สังเกตเห็น (Non Observe) · 2 = กำลังพัฒนา (Developing) · 3 = อยู่ในระดับที่ใช้งานได้ (Proficient) · 4 = อยู่ในระดับที่ใช้งานได้ดี · 5 = เป็นแบบอย่างที่ดี (Role Model)</p>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ข้อที่</th>
                                <th class="w-44 px-4 py-2.5 text-left font-semibold text-gray-700">หัวข้อ</th>
                                <th
                                    v-for="rater in raterColumns" :key="`${rater.evaluator_role}:${rater.evaluator_employee_id ?? ''}`"
                                    class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700 whitespace-pre-line"
                                    :title="rater.evaluator_full_name ?? ''"
                                >{{ raterLabel(rater) }}</th>
                                <th class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700" title="ค่าเฉลี่ยเฉพาะหัวหน้า + ผู้บริหาร (ไม่รวมตนเอง)">เฉลี่ย</th>
                                <th class="w-20 px-3 py-2.5 text-center font-semibold text-gray-700">น้ำหนัก</th>
                                <th class="w-24 px-3 py-2.5 text-center font-semibold text-gray-700" title="เฉลี่ย × น้ำหนัก">คะแนนที่ได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="data.competencies.length === 0">
                                <td :colspan="raterColumns.length + 5" class="px-4 py-6 text-center text-sm text-gray-400">ไม่มีข้อมูล Competency</td>
                            </tr>
                            <tr v-for="(comp, idx) in data.competencies" :key="comp.id" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 font-medium text-gray-800 whitespace-pre-line">{{ comp.subject }}</td>
                                <td v-for="rater in raterColumns" :key="`${rater.evaluator_role}:${rater.evaluator_employee_id ?? ''}`" class="px-3 py-3 text-center text-gray-700">
                                    {{ ratingFor(comp.by_rater, rater.evaluator_role, rater.evaluator_employee_id) }}
                                </td>
                                <td class="px-3 py-3 text-center font-semibold text-gray-800">{{ formatScore(itemAvgExclSelf(comp)) }}</td>
                                <td class="px-3 py-3 text-center text-gray-700">{{ Number(comp.weight ?? 0).toFixed(2) }}</td>
                                <td class="px-3 py-3 text-center font-semibold text-blue-700">{{ formatScore(itemEarnedScore(comp)) }}</td>
                            </tr>
                        </tbody>
                        <tfoot v-if="data.competencies.length > 0">
                            <tr class="border-t-2 border-gray-300 bg-gray-50">
                                <td :colspan="raterColumns.length + 3" class="px-4 py-3 text-right font-bold text-gray-700">รวมคะแนน Competency</td>
                                <td class="px-3 py-3 text-center font-bold text-gray-700">{{ competencyTotalWeight.toFixed(2) }}</td>
                                <td class="px-3 py-3 text-center font-bold text-blue-700">{{ formatScore(competencySubtotal) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Proposals -->
            <div v-if="data.proposals.length > 0" class="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ข้อเสนอเพื่อพิจารณา</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-2.5 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="w-32 px-4 py-2.5 text-left font-semibold text-gray-700">บทบาท</th>
                                <th class="w-32 px-4 py-2.5 text-left font-semibold text-gray-700">ผู้เสนอ</th>
                                <th class="w-36 px-4 py-2.5 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                                <th class="px-4 py-2.5 text-left font-semibold text-gray-700">ผลการพิจารณา</th>
                                <th class="w-28 px-4 py-2.5 text-center font-semibold text-gray-700">เสนอเมื่อ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(proposal, idx) in data.proposals" :key="idx" class="border-b border-gray-100 transition hover:bg-gray-50">
                                <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 text-gray-800">{{ roleLabel(proposal.evaluator_role) }}</td>
                                <td class="px-4 py-3 font-medium text-gray-800">
                                    <span v-if="proposal.evaluator_emp_code" class="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 mr-1.5">{{ proposal.evaluator_emp_code }}</span>
                                    {{ proposal.evaluator_full_name || '—' }}
                                </td>
                                <td class="px-4 py-3 text-gray-600">{{ proposal.evaluator_position || '—' }}</td>
                                <td class="px-4 py-3 text-gray-700">{{ recommendationText(proposal.recommendation) }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ formatDate(proposal.submitted_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Final verdict (read-only) -->
            <div v-if="finalRecommendation" class="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="4" rx="1"/><rect x="3" y="11" width="7" height="4" rx="1"/><rect x="3" y="19" width="7" height="2" rx="1"/>
                        <rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="4" rx="1"/>
                    </svg>
                    <span class="text-sm font-semibold text-gray-700">ผลการพิจารณา (ขั้นสุดท้าย)</span>
                </div>
                <div class="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                    <p class="text-sm font-semibold text-blue-700">{{ finalRecommendation }}</p>
                    <p v-if="data.summary.is_approved" class="mt-2 text-xs text-green-700">
                        ✓ อนุมัติโดยผู้บริหารแล้ว
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsSummaryDetail, PmsSummaryRater } from '@/composables/usePmsSummary';

useHead({ title: 'สรุปผลการประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const route = useRoute();
const summaryApi = usePmsSummary();
const { profile } = useAuth();
const MANAGER_VISIBLE_ROLES = new Set(['self', 'manager']);

const sendId = computed<number | null>(() => {
    const v = route.query.send_id ?? route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});

const data         = ref<PmsSummaryDetail | null>(null);
const loading      = ref(false);
const errorMessage = ref('');

// Fixed recommendation labels
const recommendOptions = [
    'พนักงานมีความพร้อมที่จะรับผิดชอบในบทบาทที่สูงขึ้น โดยแนะนำให้มีการพิจารณาเลื่อนตำแหน่ง/เงินเดือน',
    'พนักงานปฏิบัติงานในหน้าที่ปัจจุบันได้อย่างครบถ้วน และมีความตั้งใจที่จะตอบสนองต่อบทบาทที่สูงขึ้นภายในระยะเวลา',
    'สามารถปฏิบัติงานปัจจุบันได้ในระดับที่น่าพอใจ',
];

/** Build column list from KPI raters (unique by role+employee combo) */
const raterColumns = computed<PmsSummaryRater[]>(() => {
    if (!data.value) return [];
    const seen = new Set<string>();
    const result: PmsSummaryRater[] = [];
    const order: Record<string, number> = {
        self: 1, manager: 2, executive: 3, ceo: 4, peer: 5, subordinate: 6,
    };
    const allRaters = [
        ...data.value.kpis.flatMap(k => k.by_rater),
        ...data.value.competencies.flatMap(c => c.by_rater),
    ];
    for (const r of allRaters) {
        if (profile.value?.role === 'manager' && !MANAGER_VISIBLE_ROLES.has(r.evaluator_role)) continue;
        // Include rater employee id in the key so multiple peers/subordinates
        // each get their own column (rather than collapsing into one).
        const key = `${r.evaluator_role}:${r.evaluator_employee_id ?? ''}`;
        if (!seen.has(key)) {
            seen.add(key);
            result.push(r);
        }
    }
    return result.sort((a, b) => {
        const oa = (order[a.evaluator_role] ?? 99);
        const ob = (order[b.evaluator_role] ?? 99);
        if (oa !== ob) return oa - ob;
        return (a.evaluator_emp_code ?? '').localeCompare(b.evaluator_emp_code ?? '');
    });
});

const finalRecommendation = computed<string>(() => {
    const idx = data.value?.summary.final_recommendation;
    if (idx === null || idx === undefined) return '';
    return recommendOptions[idx - 1] ?? '';
});

const formatScore = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(2);
};

// ── Per-item "เฉลี่ย" excluding self + closed + N/A ──────────────────
// Uses raw selected_option (1..5), NOT the percent-converted `score`.
// Returns null when no rater contributed; UI shows '—' in that case.
const itemAvgExclSelf = (item: { by_rater: PmsSummaryRater[] }): number | null => {
    const counted = item.by_rater.filter(r =>
        r.evaluator_role !== 'self'
        && !r.is_closed
        && r.selected_option !== null
        && r.selected_option !== 0
    );
    if (counted.length === 0) return null;
    const sum = counted.reduce((s, r) => s + Number(r.selected_option), 0);
    return sum / counted.length;
};

// คะแนนที่ได้ ต่อข้อ = avg(เฉพาะ non-self) × น้ำหนัก
const itemEarnedScore = (item: PmsSummaryItem): number | null => {
    const avg = itemAvgExclSelf(item);
    if (avg === null) return null;
    return avg * Number(item.weight ?? 0);
};

// Σ คะแนนที่ได้ ของทั้ง KPI / Competency (already weighted by item.weight)
const kpiSubtotal = computed<number>(() => {
    if (!data.value) return 0;
    return data.value.kpis.reduce((s, k) => s + (itemEarnedScore(k) ?? 0), 0);
});
const competencySubtotal = computed<number>(() => {
    if (!data.value) return 0;
    return data.value.competencies.reduce((s, c) => s + (itemEarnedScore(c) ?? 0), 0);
});

// Σ น้ำหนัก (ใช้แสดงในแถวสรุป)
const kpiTotalWeight = computed<number>(() =>
    data.value ? data.value.kpis.reduce((s, k) => s + Number(k.weight ?? 0), 0) : 0);
const competencyTotalWeight = computed<number>(() =>
    data.value ? data.value.competencies.reduce((s, c) => s + Number(c.weight ?? 0), 0) : 0);

// Assessment header ratios (e.g. 50/50)
const kpiHeaderRatio = computed<number>(() =>
    data.value ? Number(data.value.summary.kpi_weight ?? 0) : 0);
const competencyHeaderRatio = computed<number>(() =>
    data.value ? Number(data.value.summary.competency_weight ?? 0) : 0);

// Final score = kpiSubtotal × kpi_weight/100 + compSubtotal × competency_weight/100
const finalScore = computed<number>(() =>
    kpiSubtotal.value * kpiHeaderRatio.value / 100
    + competencySubtotal.value * competencyHeaderRatio.value / 100);

// ── Per-role mean (raw selected_option 1..5, not %-converted) ────────
// Replaces values from pms_evaluation_per_role_v (which stores weighted %).
const meanSelectedOption = (
    items: PmsSummaryItem[],
    role: string,
): number | null => {
    const samples: number[] = [];
    for (const it of items) {
        for (const r of it.by_rater) {
            if (r.evaluator_role !== role) continue;
            if (r.is_closed) continue;
            if (r.selected_option === null || r.selected_option === undefined) continue;
            if (r.selected_option === 0) continue;
            samples.push(Number(r.selected_option));
        }
    }
    if (samples.length === 0) return null;
    return samples.reduce((s, n) => s + n, 0) / samples.length;
};

interface PerRoleRow {
    evaluator_role: string;
    rater_count: number;
    submitted_count: number;
    kpi_mean: number | null;
    competency_mean: number | null;
    total_mean: number | null;
}

const perRoleStats = computed<PerRoleRow[]>(() => {
    if (!data.value) return [];
    let roles = data.value.per_role;
    if (profile.value?.role === 'manager') {
        roles = roles.filter(pr => MANAGER_VISIBLE_ROLES.has(pr.evaluator_role));
    }
    return roles.map(pr => {
        const kpi  = meanSelectedOption(data.value!.kpis,         pr.evaluator_role);
        const comp = meanSelectedOption(data.value!.competencies, pr.evaluator_role);
        // total = simple average of available means (mirrors existing "(kpi+comp)/2" pattern)
        let total: number | null = null;
        if (kpi !== null && comp !== null) total = (kpi + comp) / 2;
        else if (kpi !== null)              total = kpi;
        else if (comp !== null)             total = comp;
        return {
            evaluator_role:  pr.evaluator_role,
            rater_count:     Number(pr.rater_count ?? 0),
            submitted_count: Number(pr.submitted_count ?? 0),
            kpi_mean:        kpi,
            competency_mean: comp,
            total_mean:      total,
        };
    });
});

/** Get rating cell value for a specific (role + evaluator_employee_id) */
const ratingFor = (raters: PmsSummaryRater[], role: string, empId?: number | null): string => {
    const r = raters.find(x => x.evaluator_role === role && (empId == null || x.evaluator_employee_id === empId));
    if (!r) return '—';
    if (r.is_closed) return '×';
    if (r.selected_option === null || r.selected_option === undefined) return '—';
    if (r.selected_option === 0) return 'N/A';
    return String(r.selected_option);
};

const ROLE_LABEL: Record<string, string> = {
    self: 'ตนเอง',
    manager: 'หัวหน้า',
    executive: 'ผู้บริหาร',
    ceo: 'CEO',
    peer: 'เพื่อนร่วมงาน',
    subordinate: 'ผู้ใต้บังคับบัญชา',
};

const raterLabel = (rater: PmsSummaryRater): string => {
    const base = ROLE_LABEL[rater.evaluator_role] ?? rater.evaluator_role;
    // For peer/subordinate (likely many), show emp_code in label to disambiguate columns
    if (rater.evaluator_role === 'peer' || rater.evaluator_role === 'subordinate') {
        return rater.evaluator_emp_code ? `${base}\n(${rater.evaluator_emp_code})` : base;
    }
    return base;
};

const roleLabel = (role: string): string => {
    if (role === 'manager')   return 'Manager (หัวหน้า)';
    if (role === 'executive') return 'Executive (ผู้บริหาร)';
    if (role === 'ceo')       return 'CEO';
    return ROLE_LABEL[role] ?? role;
};

/** Per-role aggregate label */
const perRoleLabel = (role: string): string => ROLE_LABEL[role] ?? role;

const recommendationText = (idx: number | null | undefined): string => {
    if (idx === null || idx === undefined) return '—';
    return recommendOptions[idx - 1] ?? `Recommendation ${idx}`;
};

const formatDate = (s: string | null | undefined): string => {
    if (!s) return '—';
    try {
        const d = new Date(s);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return s.slice(0, 10);
    }
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

const loadDetail = async () => {
    if (sendId.value === null) {
        errorMessage.value = 'ไม่พบ send_id ใน URL';
        return;
    }
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await summaryApi.detail(sendId.value);
        data.value = res.data;
    } catch (e) {
        const err = e as PmsApiError;
        errorMessage.value = err.status === 404
            ? 'ไม่พบสรุปผลการประเมินที่ระบุ'
            : (err.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
        loading.value = false;
    }
};

onMounted(() => loadDetail());
</script>
