<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff6ff;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">แบบประเมิน</h1>
            </div>
            <NuxtLink
                to="/pms/assigned"
                class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8l-4 4 4 4M8 12h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                กลับ
            </NuxtLink>
        </div>

        <!-- Loading / Error banners -->
        <div v-if="loading" class="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
            <div class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                กำลังโหลดข้อมูล...
            </div>
        </div>
        <div v-if="serverError" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ serverError }}</span>
            <button class="text-red-500 hover:text-red-700" @click="serverError = ''">×</button>
        </div>

        <!-- ── Section: ข้อมูลแบบประเมิน ── -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="mb-4">
                <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">ชื่อแบบประเมิน</p>
                <p class="text-sm font-medium text-gray-800">{{ assessment.name }}</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div>
                    <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">รอบปีการประเมิน</p>
                    <p class="text-sm text-gray-800">{{ assessment.year }}</p>
                </div>
                <div>
                    <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">รอบการประเมิน</p>
                    <p class="text-sm text-gray-800">{{ assessment.cycle }}</p>
                </div>
                <div>
                    <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">สถานะ</p>
                    <p class="text-sm font-semibold text-red-500">{{ assessment.status }}</p>
                </div>
            </div>
        </div>

        <!-- ── Section: ผู้ประเมิน (admin only) ── -->
        <div v-if="profile?.role === 'admin'" class="mb-5 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
            <div class="flex items-center gap-2 border-b border-blue-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                </svg>
                <span class="text-sm font-semibold text-blue-700">ผู้ประเมิน</span>
            </div>
            <div class="grid grid-cols-3 gap-6 px-6 py-4">
                <div><p class="mb-1 text-xs font-semibold text-blue-600">รหัสพนักงาน</p><p class="text-sm text-gray-800">{{ evaluatorInfo.empCode || '-' }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-blue-600">ชื่อผู้ประเมิน</p><p class="text-sm text-gray-800">{{ evaluatorInfo.name || '-' }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-blue-600">บทบาท</p><p class="text-sm text-gray-800">{{ evaluatorRoleLabel }}</p></div>
            </div>
        </div>

        <!-- ── Section: ข้อมูลผู้ถูกประเมิน ── -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                    <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/>
                    <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/>
                </svg>
                <span class="text-sm font-semibold text-gray-700">ข้อมูลผู้ถูกประเมิน</span>
            </div>
            <div class="grid grid-cols-3 gap-6 px-6 py-5">
                <div><p class="mb-1 text-xs font-semibold text-gray-500">รหัสพนักงาน</p><p class="text-sm text-gray-800">{{ employee.empCode }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-gray-500">ชื่อผู้ถูกประเมิน</p><p class="text-sm text-gray-800">{{ employee.name }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-gray-500">ตำแหน่ง</p><p class="text-sm text-gray-800">{{ employee.position }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-gray-500">ระดับตำแหน่ง</p><p class="text-sm text-gray-800">{{ employee.level }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-gray-500">ทีม</p><p class="text-sm text-gray-800">{{ employee.team }}</p></div>
                <div><p class="mb-1 text-xs font-semibold text-gray-500">แผนก</p><p class="text-sm text-gray-800">{{ employee.dept }}</p></div>
            </div>
        </div>

        <!-- ── Score Summary (Manager + Executive) ── -->
        <div v-if="isManager || isExecutive" class="mb-5 grid grid-cols-3 gap-4">
            <div class="rounded-xl border border-amber-200 px-6 py-5 text-center" style="background:#fef9c3;">
                <p class="mb-1 text-xs font-semibold text-amber-700">คะแนนการประเมิน KPI</p>
                <p class="text-3xl font-bold text-amber-700">{{ kpiScore }}</p>
            </div>
            <div class="rounded-xl border border-blue-200 px-6 py-5 text-center" style="background:#dbeafe;">
                <p class="mb-1 text-xs font-semibold text-blue-700">คะแนนการประเมิน Competency</p>
                <p class="text-3xl font-bold text-blue-700">{{ competencyScore }}</p>
            </div>
            <div class="rounded-xl border border-green-200 px-6 py-5 text-center" style="background:#dcfce7;">
                <p class="mb-1 text-xs font-semibold text-green-700">ผลการประเมินรวม</p>
                <p class="text-3xl font-bold text-green-700">{{ totalScore }}</p>
            </div>
        </div>

        <!-- ── เปรียบเทียบในระดับเดียวกันภายในทีม (Manager + Executive) ── -->
        <div v-if="isManager || isExecutive" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">เปรียบเทียบในระดับเดียวกันภายในทีม</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                            <th class="w-20 px-4 py-3 text-center font-semibold text-gray-700">KPI</th>
                            <th class="w-24 px-4 py-3 text-center font-semibold text-gray-700">Competency</th>
                            <th class="w-20 px-4 py-3 text-center font-semibold text-gray-700">เฉลี่ย</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">% ความคืบหน้า</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in peerRows" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                            <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.empCode }}</td>
                            <td class="px-4 py-3 text-gray-800">{{ row.name }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ row.position }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.kpi }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.competency }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.average }}</td>
                            <td class="px-4 py-3 text-center text-gray-700">{{ row.progress }}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── แบบประเมิน KPIs (ซ่อนถ้าแบบประเมินนี้ไม่มี KPI เช่น competency_360) ── -->
        <div v-if="kpiRows.length > 0" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">แบบประเมิน KPIs</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-3 py-3 text-center font-semibold text-gray-700">ข้อที่</th>
                            <th class="w-28 px-3 py-3 text-center font-semibold text-gray-700">หัวข้อ</th>
                            <th class="px-3 py-3 text-left font-semibold text-gray-700">รายละเอียด</th>
                            <th class="w-20 px-3 py-3 text-center font-semibold text-gray-700">เป้าหมาย</th>
                            <th v-for="n in 5" :key="n" class="w-20 px-2 py-3 text-center font-semibold text-gray-700">{{ n }}</th>
                            <th class="w-24 px-2 py-3 text-center font-semibold text-gray-700 text-xs">ไม่สามารถ<br>ประเมินได้</th>
                            <th v-if="isExecutive" class="w-16 px-2 py-3 text-center font-semibold text-gray-700">คะแนน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(kpi, idx) in kpiRows" :key="idx" class="border-b border-gray-100 hover:bg-gray-50" :class="kpi.closed ? 'opacity-60' : ''">
                            <td class="px-3 py-3 text-center font-medium text-gray-600">{{ idx + 1 }}</td>
                            <td class="px-3 py-3 text-center font-medium text-gray-800">{{ kpi.subject }}</td>
                            <td class="px-3 py-3 text-gray-700 text-xs leading-relaxed">{{ kpi.detail }}</td>
                            <td class="px-3 py-3 text-center font-semibold text-gray-700">{{ kpi.target }}</td>
                            <td v-for="n in 5" :key="n" class="px-2 py-3 text-center align-top">
                                <div class="flex flex-col items-center gap-1">
                                    <input
                                        type="radio"
                                        :name="`kpi-${idx}`"
                                        :value="n"
                                        v-model="kpi.selected"
                                        :disabled="kpi.closed"
                                        class="h-4 w-4 cursor-pointer accent-blue-600"
                                    />
                                    <span class="text-xs text-gray-500 whitespace-pre-line">{{ kpi.options[n - 1] }}</span>
                                </div>
                            </td>
                            <td class="px-2 py-3 text-center align-top">
                                <input
                                    type="radio"
                                    :name="`kpi-${idx}`"
                                    :value="0"
                                    v-model="kpi.selected"
                                    :disabled="kpi.closed"
                                    class="h-4 w-4 cursor-pointer accent-blue-600"
                                />
                            </td>
                            <td v-if="isExecutive" class="px-2 py-3 text-center font-semibold text-gray-700">{{ kpi.managerScore }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── แบบประเมิน Competency (ซ่อนถ้าแบบประเมินนี้ไม่มี Competency) ── -->
        <div v-if="competencyRows.length > 0" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">แบบประเมิน Competency</span>
            </div>

            <!-- Scale Info Box -->
            <div class="mx-5 mt-4">
                <PmsScoreScaleLegend />
            </div>

            <div class="mt-4 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-3 py-3 text-center font-semibold text-gray-700">ข้อที่</th>
                            <th class="w-40 px-3 py-3 text-left font-semibold text-gray-700">หัวข้อ</th>
                            <th class="w-16 px-3 py-3 text-center font-semibold text-gray-700">เป้าหมาย</th>
                            <th v-for="n in 5" :key="n" class="px-3 py-3 text-center font-semibold text-gray-700 min-w-[130px]">ระดับ {{ n }}</th>
                            <th class="w-24 px-2 py-3 text-center font-semibold text-gray-700 text-xs">ไม่สามารถ<br>ประเมินได้</th>
                            <th v-if="isExecutive" class="w-16 px-2 py-3 text-center font-semibold text-gray-700">คะแนน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(comp, idx) in competencyRows" :key="idx" class="border-b border-gray-100 hover:bg-gray-50" :class="comp.closed ? 'opacity-60' : ''">
                            <td class="px-3 py-4 text-center font-medium text-gray-600 align-top">{{ idx + 1 }}</td>
                            <td class="px-3 py-4 align-top">
                                <p class="text-xs font-medium text-gray-800 whitespace-pre-line leading-relaxed">{{ comp.subject }}</p>
                            </td>
                            <td class="px-3 py-4 text-center font-semibold text-gray-700 align-top">{{ comp.target }}</td>
                            <td v-for="n in 5" :key="n" class="px-3 py-4 text-center align-top">
                                <div class="flex flex-col items-center gap-1.5">
                                    <input
                                        type="radio"
                                        :name="`comp-${idx}`"
                                        :value="n"
                                        v-model="comp.selected"
                                        :disabled="comp.closed"
                                        class="h-4 w-4 cursor-pointer accent-blue-600"
                                    />
                                    <span class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{{ comp.options[n - 1] }}</span>
                                </div>
                            </td>
                            <td class="px-2 py-4 text-center align-top">
                                <input
                                    type="radio"
                                    :name="`comp-${idx}`"
                                    :value="0"
                                    v-model="comp.selected"
                                    :disabled="comp.closed"
                                    class="h-4 w-4 cursor-pointer accent-blue-600"
                                />
                            </td>
                            <td v-if="isExecutive" class="px-2 py-4 text-center font-semibold text-gray-700 align-top">{{ comp.managerScore }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── แสดงเพื่อพิจารณา (Manager) ── -->
        <div v-if="isManager" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">แสดงเพื่อพิจารณา</span>
            </div>
            <div class="grid grid-cols-3 gap-4 p-5">
                <button
                    v-for="(opt, idx) in recommendOptions" :key="idx"
                    type="button"
                    class="rounded-xl border-2 p-4 text-left text-xs leading-relaxed transition"
                    :class="managerRecommend === idx ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
                    @click="managerRecommend = idx"
                >{{ opt }}</button>
            </div>
        </div>

        <!-- ── ข้อเสนอเพื่อพิจารณา (Executive) ── -->
        <div v-if="isExecutive" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">ข้อเสนอเพื่อพิจารณา</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="w-12 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                            <th class="w-44 px-4 py-3 text-left font-semibold text-gray-700">ผู้เสนอ</th>
                            <th class="w-36 px-4 py-3 text-left font-semibold text-gray-700">ตำแหน่ง</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ข้อเสนอเพื่อพิจารณา</th>
                            <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">เลขมือ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(p, idx) in proposals" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                            <td class="px-4 py-3 text-center text-gray-600">{{ idx + 1 }}</td>
                            <td class="px-4 py-3 text-gray-800">{{ p.proposer }}</td>
                            <td class="px-4 py-3 text-gray-700">{{ p.position }}</td>
                            <td class="px-4 py-3 text-gray-700 text-xs">{{ p.content }}</td>
                            <td class="px-4 py-3 text-center text-gray-600">{{ p.date }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── ผลการพิจารณา (Executive) ── -->
        <div v-if="isExecutive" class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">ผลการพิจารณา</span>
            </div>
            <div class="grid grid-cols-3 gap-4 p-5">
                <button
                    v-for="(opt, idx) in recommendOptions" :key="idx"
                    type="button"
                    class="rounded-xl border-2 p-4 text-left text-xs leading-relaxed transition"
                    :class="executiveVerdict === idx ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
                    @click="executiveVerdict = idx"
                >{{ opt }}</button>
            </div>
        </div>

        <!-- ── Action Buttons ── -->
        <div v-if="!readonly" class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <button
                v-if="profile?.role !== 'admin'"
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style="background:#16a34a;"
                :disabled="busy || isSent"
                @click="handleSubmit"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ busy ? 'กำลังบันทึก...' : 'ส่งแบบประเมิน' }}
            </button>
            <button
                v-if="profile?.role !== 'admin'"
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style="background:#4361ee;"
                :disabled="busy || isSent"
                @click="handleSaveDraft"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                บันทึกร่าง
            </button>
            <!-- Admin-only: revert a sent evaluation back to draft so the owner can re-edit -->
            <button
                v-if="profile?.role === 'admin' && myEvalId !== null && isSent"
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style="background:#f59e0b;"
                :disabled="busy"
                @click="handleRevert"
                title="ปลดล็อกแบบประเมินที่ส่งแล้ว ให้ผู้ประเมินกลับมาแก้ไขได้"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ปลดล็อกเป็นร่าง
            </button>
            <button
                v-if="profile?.role !== 'admin'"
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
        <div v-else class="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-700">
            โหมดดูอย่างเดียว — แบบประเมินถูกล็อกแล้ว
        </div>

        <!-- Toast -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ toastMessage }}
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsEvaluation, PmsEvaluationRole } from '@/composables/usePmsEvaluations';

useHead({ title: 'แบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const router = useRouter();
const route  = useRoute();

const sendsApi       = usePmsSends();
const assessmentsApi = usePmsAssessments();
const evaluationsApi = usePmsEvaluations();
const calculationApi = usePmsCalculation();
const { profile, user } = useAuth();
const supabase = useSupabase();

// ── Param parsing ───────────────────────────────────────────────────────
const sendId = computed<number | null>(() => {
    const v = route.query.send_id ?? route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const readonly = computed(() => route.query.readonly === '1');

// Admin-only: evaluator display info (populated in loadAll for admin)
const evaluatorInfo = reactive({ name: '', empCode: '', role: '' });
const ROLE_LABELS: Record<string, string> = {
    self: 'Self (ประเมินตนเอง)', manager: 'Manager', executive: 'Executive',
    ceo: 'CEO', peer: 'Peer', subordinate: 'Subordinate',
};
const evaluatorRoleLabel = computed(() => ROLE_LABELS[evaluatorInfo.role] ?? evaluatorInfo.role ?? '-');

// ── Role (auto-detected; admin can switch via UI) ───────────────────────
// `supervisor` reuses the officer self-form when evaluating their own send,
// and the dedicated 'supervisor' branch when peer-evaluating a team member.
type UiRole = 'officer' | 'manager' | 'executive' | 'supervisor';
const userRole   = ref<UiRole>('officer');
const isOfficer  = computed(() => userRole.value === 'officer');
const isManager  = computed(() => userRole.value === 'manager');
const isExecutive= computed(() => userRole.value === 'executive');
const isSupervisor = computed(() => userRole.value === 'supervisor');
// Supervisor branches at form time: viewing own send → 'self'; viewing a
// pre-assigned teammate's send → 'peer'. RLS enforces both.
const isOwnSend = ref(false);
// When navigating from the assigned list, evaluator_role is passed as a URL
// param and takes precedence over the system role. This allows a manager
// assigned as a peer/subordinate rater to submit with the correct role.
const VALID_EVAL_ROLES: PmsEvaluationRole[] = ['self', 'manager', 'executive', 'ceo', 'peer', 'subordinate'];
// Set by loadAll() after verifying the rater's actual role from DB.
// Takes precedence over the URL param to prevent wrong sections when the
// URL carries a stale/incorrect evaluator_role (e.g. manager assigned as peer).
const confirmedEvalRole = ref<PmsEvaluationRole | null>(null);
const evaluatorRole = computed<PmsEvaluationRole>(() => {
    if (confirmedEvalRole.value) return confirmedEvalRole.value;
    const q = route.query.evaluator_role;
    if (typeof q === 'string' && (VALID_EVAL_ROLES as string[]).includes(q)) return q as PmsEvaluationRole;
    if (isManager.value)    return 'manager';
    if (isExecutive.value)  return 'executive';
    if (isSupervisor.value) return isOwnSend.value ? 'self' : 'peer';
    return 'self';
});

// ── Assessment / Employee display (legacy field names kept) ─────────────
const assessment = reactive({ name: '', year: '', cycle: '', status: '' });
const employee   = reactive({ empCode: '', name: '', position: '', level: '', team: '', dept: '' });

// ── Items loaded from assessment template ───────────────────────────────
interface KpiRow {
    kpi_id: number;
    subject: string;
    detail: string;
    target: string;
    options: string[];
    weight: number;
    selected: number;        // 0 = N/A, 1-5 = ระดับ, -1 = ยังไม่เลือก
    closed: boolean;
    managerScore: number | string;
}
interface CompetencyRow {
    competency_id: number;
    subject: string;
    target: string | number;
    options: string[];
    weight: number;
    selected: number;
    closed: boolean;
    managerScore: number | string;
}
const kpiRows        = ref<KpiRow[]>([]);
const competencyRows = ref<CompetencyRow[]>([]);

// ── Evaluations cache ───────────────────────────────────────────────────
const allEvaluations = ref<PmsEvaluation[]>([]);
/** The assessment this page is currently viewing (set by loadAll from URL or fallback) */
const activeAssessmentId = ref<number | null>(null);
const myEvalId       = ref<number | null>(null);
/** Numeric pms_employees.id for the currently logged-in user (resolved in loadAll). */
const myEmpId        = ref<number | null>(null);
/** True when this evaluation is in 'sent' state — locked for non-admin editing. */
const isSent         = ref(false);
const managerRecommend = ref<number | null>(null);
const executiveVerdict = ref<number | null>(null);

// ── Score summary ───────────────────────────────────────────────────────
const kpiScore        = ref('0.00');
const competencyScore = ref('0.00');
const totalScore      = ref('0.00');

// ── Peer rows + Proposals (display) ─────────────────────────────────────
const peerRows  = ref<{ empCode: string; name: string; position: string; kpi: string; competency: string; average: string; progress: string }[]>([]);
const proposals = ref<{ proposer: string; position: string; content: string; date: string }[]>([]);

// ── Recommendation options (fixed UI) ───────────────────────────────────
const recommendOptions = [
    'พนักงานมีความพร้อมที่จะรับผิดชอบในบทบาทที่สูงขึ้น โดยแนะนำให้มีการพิจารณาเลื่อนตำแหน่ง/เงินเดือน',
    'พนักงานปฏิบัติงานในหน้าที่ปัจจุบันได้อย่างครบถ้วน และมีความตั้งใจที่จะตอบสนองต่อบทบาทที่สูงขึ้นภายในระยะเวลา (0)',
    'สามารถปฏิบัติงานปัจจุบันได้ในระดับที่น่าพอใจ',
];

// ── State flags ─────────────────────────────────────────────────────────
const loading      = ref(false);
const busy         = ref(false);
const serverError  = ref('');
const showToast    = ref(false);
const toastMessage = ref('');

// ── Helpers ─────────────────────────────────────────────────────────────
function getEvalByRole(role: PmsEvaluationRole, empId?: number | null): PmsEvaluation | undefined {
    return allEvaluations.value.find(e =>
        e.evaluator_role === role &&
        (activeAssessmentId.value === null || e.assessment_id === activeAssessmentId.value) &&
        (empId == null || e.evaluator_employee_id === empId)
    );
}

function statusLabel(status: string): string {
    // Active evaluation lifecycle (2026-05-22): 'draft' | 'sent'.
    // Send-level statuses (pms_assessment_sends) may still surface here.
    if (status === 'sent' || status === 'completed' || status === 'approved' || status === 'submitted')
        return 'ส่งแบบประเมินแล้ว';
    if (status === 'in_progress' || status === 'opened' || status === 'draft')
        return 'อยู่ระหว่างการประเมิน';
    return 'ยังไม่เข้าทำแบบประเมิน';
}

function applyMyEvaluationToRows() {
    const myEval = getEvalByRole(evaluatorRole.value, myEmpId.value);
    // reset row selections first
    kpiRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    competencyRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    managerRecommend.value = null;
    executiveVerdict.value = null;

    if (!myEval) {
        myEvalId.value = null;
        isSent.value = false;
        kpiScore.value = '0.00'; competencyScore.value = '0.00'; totalScore.value = '0.00';
        return;
    }

    myEvalId.value = myEval.id;
    isSent.value   = myEval.status === 'sent';

    const kpiMap = new Map<number, { selected_option: number | null; is_closed: boolean }>();
    for (const s of myEval.kpi_scores ?? []) {
        kpiMap.set(s.kpi_id, { selected_option: s.selected_option, is_closed: s.is_closed });
    }
    for (const row of kpiRows.value) {
        const m = kpiMap.get(row.kpi_id);
        if (m) {
            row.selected = m.selected_option ?? -1;
            row.closed   = m.is_closed;
        }
    }
    const compMap = new Map<number, { selected_option: number | null; is_closed: boolean }>();
    for (const s of myEval.competency_scores ?? []) {
        compMap.set(s.competency_id, { selected_option: s.selected_option, is_closed: s.is_closed });
    }
    for (const row of competencyRows.value) {
        const m = compMap.get(row.competency_id);
        if (m) {
            row.selected = m.selected_option ?? -1;
            row.closed   = m.is_closed;
        }
    }

    if (isManager.value)   managerRecommend.value = myEval.recommendation;
    if (isExecutive.value) executiveVerdict.value = myEval.recommendation;

    kpiScore.value        = myEval.kpi_score        != null ? Number(myEval.kpi_score).toFixed(2)        : '0.00';
    competencyScore.value = myEval.competency_score != null ? Number(myEval.competency_score).toFixed(2) : '0.00';
    totalScore.value      = myEval.total_score      != null ? Number(myEval.total_score).toFixed(2)      : '0.00';
}

function applyManagerScoresForExecutive() {
    if (!isExecutive.value) return;

    const mgrEvals = allEvaluations.value.filter(e =>
        e.evaluator_role === 'manager' &&
        (activeAssessmentId.value === null || e.assessment_id === activeAssessmentId.value)
    );
    if (mgrEvals.length === 0) return;

    // KPI: average selected_option per kpi_id across all managers (skip 0 = N/A)
    const kpiAgg = new Map<number, { sum: number; count: number }>();
    for (const ev of mgrEvals) {
        for (const s of ev.kpi_scores ?? []) {
            if (s.selected_option != null && s.selected_option > 0) {
                const a = kpiAgg.get(s.kpi_id) ?? { sum: 0, count: 0 };
                kpiAgg.set(s.kpi_id, { sum: a.sum + s.selected_option, count: a.count + 1 });
            }
        }
    }
    for (const row of kpiRows.value) {
        const a = kpiAgg.get(row.kpi_id);
        row.managerScore = a ? (a.sum / a.count).toFixed(2) : '-';
    }

    // Competency: same aggregation
    const compAgg = new Map<number, { sum: number; count: number }>();
    for (const ev of mgrEvals) {
        for (const s of ev.competency_scores ?? []) {
            if (s.selected_option != null && s.selected_option > 0) {
                const a = compAgg.get(s.competency_id) ?? { sum: 0, count: 0 };
                compAgg.set(s.competency_id, { sum: a.sum + s.selected_option, count: a.count + 1 });
            }
        }
    }
    for (const row of competencyRows.value) {
        const a = compAgg.get(row.competency_id);
        row.managerScore = a ? (a.sum / a.count).toFixed(2) : '-';
    }

    // Proposals: one row per manager that has a recommendation
    proposals.value = mgrEvals
        .filter(ev => ev.recommendation != null)
        .map(ev => ({
            proposer: ev.evaluator?.full_name ?? (ev.evaluator_employee_id ? `Manager #${ev.evaluator_employee_id}` : 'Manager'),
            position: 'Manager',
            content: recommendOptions[(ev.recommendation! - 1)] ?? '-',
            date: ev.submitted_at?.slice(0, 10) ?? '',
        }));
}

// ── Load all ────────────────────────────────────────────────────────────
async function loadAll() {
    if (sendId.value === null) {
        serverError.value = 'ไม่พบ send_id ใน URL';
        return;
    }
    loading.value = true;
    serverError.value = '';

    // If arriving from the assigned list with an explicit evaluator_role in the
    // URL, peer/subordinate raters render as 'officer' (competency-only form).
    // Otherwise derive from the user's system role as before.
    const urlEvalRole = route.query.evaluator_role as string | undefined;
    if (urlEvalRole === 'peer' || urlEvalRole === 'subordinate') {
        userRole.value = 'officer';
    } else {
        const r = profile.value?.role;
        if (r === 'manager')         userRole.value = 'manager';
        else if (r === 'executive')  userRole.value = 'executive';
        else if (r === 'supervisor') userRole.value = 'supervisor';
        else                         userRole.value = 'officer';
    }

    try {
        const sendRes = await sendsApi.get(sendId.value);
        const s = sendRes.data;

        // Supervisor: pick self vs peer based on whether this send targets them.
        if (userRole.value === 'supervisor' && user.value?.id) {
            const { data: me } = await supabase
                .from('pms_employees')
                .select('id')
                .eq('auth_user_id', user.value.id)
                .maybeSingle();
            isOwnSend.value = me?.id != null && s.employee_id === me.id;
        } else {
            isOwnSend.value = false;
        }

        // For non-admin raters: confirm actual evaluator_role from DB to prevent
        // wrong section display when the URL param is missing or incorrect
        // (e.g. a manager-level user who was assigned as peer).
        if (profile.value?.role !== 'admin' && user.value?.id) {
            const { data: meRow } = await supabase
                .from('pms_employees')
                .select('id')
                .eq('auth_user_id', user.value.id)
                .maybeSingle();
            myEmpId.value = meRow?.id ?? null;
            if (meRow?.id) {
                const { data: raterRow } = await supabase
                    .from('pms_assessment_send_raters')
                    .select('evaluator_role')
                    .eq('send_id', sendId.value!)
                    .eq('evaluator_employee_id', meRow.id)
                    .eq('is_active', true)
                    .maybeSingle();
                if (raterRow) {
                    const dbRole = raterRow.evaluator_role as PmsEvaluationRole;
                    confirmedEvalRole.value = dbRole;
                    if (dbRole === 'peer' || dbRole === 'subordinate')  userRole.value = 'officer';
                    else if (dbRole === 'manager')                       userRole.value = 'manager';
                    else if (dbRole === 'executive')                     userRole.value = 'executive';
                    else if (dbRole === 'supervisor')                    userRole.value = 'supervisor';
                    else                                                 userRole.value = 'officer';
                }
            }
        }

        // After 2026-05-22 schema change: a send carries cycle info only.
        // The specific assessment for this view comes from the URL query param.
        // Fallback to the send's primary assessment for old single-assessment sends.
        const queryAssessmentId = (() => {
            const q = route.query.assessment_id;
            if (typeof q === 'string') {
                const n = parseInt(q, 10);
                if (Number.isInteger(n)) return n;
            }
            return null;
        })();
        const targetAssessmentId = queryAssessmentId ?? s.assessments[0]?.id ?? null;
        if (!targetAssessmentId) {
            throw new Error('ไม่พบ assessment สำหรับ send นี้ — กรุณากลับไปที่หน้ารายการแล้วเลือกใหม่');
        }
        activeAssessmentId.value = targetAssessmentId;

        assessment.name   = s.assessments.find(a => a.id === targetAssessmentId)?.name ?? s.primary_assessment_name ?? '';
        assessment.year   = s.year != null ? String(s.year) : '';
        assessment.cycle  = s.cycle_label ?? '';
        assessment.status = 'ยังไม่เข้าทำแบบประเมิน'; // updated after evaluations load

        employee.empCode  = s.emp_code ?? '';
        employee.name     = s.full_name ?? '';
        employee.position = s.employee_position_name ?? '';
        employee.level    = s.employee_level_name ?? '';
        employee.team     = s.employee_team_name ?? '';
        employee.dept     = s.employee_department_name ?? '';

        const aRes = await assessmentsApi.get(targetAssessmentId);
        const a = aRes.data;

        // peer and subordinate raters evaluate competencies only.
        // self/manager/executive/ceo see both KPI and competency sections.
        const skipKpi = evaluatorRole.value === 'peer' || evaluatorRole.value === 'subordinate';
        kpiRows.value = skipKpi ? [] : (a.kpis ?? []).map(k => ({
            kpi_id:    k.id ?? 0,
            subject:   k.subject,
            detail:    k.detail ?? '',
            target:    k.target ?? '',
            options:   Array.isArray(k.options) ? k.options.slice(0, 5).concat(Array(5).fill('')).slice(0, 5) : ['', '', '', '', ''],
            weight:    k.weight,
            selected:  -1,
            closed:    false,
            managerScore: '-',
        }));
        competencyRows.value = (a.competencies ?? []).map(c => ({
            competency_id: c.id ?? 0,
            subject:       c.subject,
            target:        c.target ?? '',
            options:       Array.isArray(c.options) ? c.options.slice(0, 5).concat(Array(5).fill('')).slice(0, 5) : ['', '', '', '', ''],
            weight:        c.weight,
            selected:      -1,
            closed:        false,
            managerScore:  '-',
        }));

        const evRes = await evaluationsApi.bySend(sendId.value);
        allEvaluations.value = evRes.data;

        // Admin: resolve evaluator identity for display
        if (profile.value?.role === 'admin') {
            const urlRole    = typeof route.query.evaluator_role    === 'string' ? route.query.evaluator_role    : '';
            const urlName    = typeof route.query.evaluator_name    === 'string' ? route.query.evaluator_name    : '';
            const urlEmpCode = typeof route.query.evaluator_emp_code === 'string' ? route.query.evaluator_emp_code : '';
            evaluatorInfo.role = urlRole;
            if (urlName) {
                evaluatorInfo.name    = urlName;
                evaluatorInfo.empCode = urlEmpCode;
            } else {
                // Fallback: fetch from send_raters → pms_employees
                const { data: rater } = await supabase
                    .from('pms_assessment_send_raters')
                    .select('evaluator_role, pms_employees!pms_assessment_send_raters_evaluator_employee_id_fkey(emp_code, full_name)')
                    .eq('send_id', sendId.value!)
                    .eq('evaluator_role', urlRole || evaluatorRole.value)
                    .eq('is_active', true)
                    .maybeSingle();
                if (rater) {
                    const emp = (rater as unknown as { pms_employees?: { emp_code?: string; full_name?: string } }).pms_employees;
                    evaluatorInfo.name    = emp?.full_name ?? '-';
                    evaluatorInfo.empCode = emp?.emp_code  ?? '-';
                }
            }
        }

        applyMyEvaluationToRows();
        assessment.status = statusLabel(getEvalByRole(evaluatorRole.value, myEmpId.value)?.status ?? '');
        applyManagerScoresForExecutive();
    } catch (e) {
        serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
    } finally {
        loading.value = false;
    }
}

// ── Build payload + save ────────────────────────────────────────────────
function buildPayload(status: 'draft' | 'sent') {
    const recommendation = isManager.value
        ? (managerRecommend.value ?? null)
        : isExecutive.value
            ? (executiveVerdict.value ?? null)
            : null;

    return {
        send_id: sendId.value!,
        evaluator_role: evaluatorRole.value,
        assessment_id: activeAssessmentId.value!,
        status,
        recommendation,
        kpi_scores: kpiRows.value.map(r => ({
            kpi_id: r.kpi_id,
            selected_option: r.selected >= 0 ? r.selected : null,
            is_closed: r.closed,
        })),
        competency_scores: competencyRows.value.map(r => ({
            competency_id: r.competency_id,
            selected_option: r.selected >= 0 ? r.selected : null,
            is_closed: r.closed,
        })),
    };
}

async function saveAndReload(status: 'draft' | 'sent') {
    busy.value = true;
    serverError.value = '';
    try {
        const payload = buildPayload(status);
        if (myEvalId.value !== null) {
            await evaluationsApi.update(myEvalId.value, payload);
        } else {
            await evaluationsApi.create(payload as Parameters<typeof evaluationsApi.create>[0]);
        }
        await loadAll();

        // Snapshot the computed averages each time an evaluation saves.
        // Non-blocking: a failed snapshot must not block the save toast.
        if (sendId.value !== null && activeAssessmentId.value !== null) {
            calculationApi.snapshot({
                send_id: sendId.value,
                assessment_id: activeAssessmentId.value,
                evaluation_id: myEvalId.value,
                trigger: status,
            }).catch(e => console.warn('[view] snapshot calc failed', e));
        }

        toastMessage.value = status === 'sent' ? 'ส่งแบบประเมินสำเร็จ' : 'บันทึกร่างสำเร็จ';
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            if (status === 'sent') router.push('/pms/assigned');
        }, 1500);
    } catch (e) {
        const err = e as PmsApiError;
        if (err.status === 403) serverError.value = `ไม่มีสิทธิ์ ${status === 'sent' ? 'ส่ง' : 'บันทึก'}แบบประเมิน (ตรวจสอบ role)`;
        else                     serverError.value = err.message || 'บันทึกไม่สำเร็จ';
    } finally {
        busy.value = false;
    }
}

const handleSubmit    = () => saveAndReload('sent');
const handleSaveDraft = () => saveAndReload('draft');

// Admin-only: flip a sent evaluation back to draft so its owner can re-edit.
const handleRevert = async () => {
    if (myEvalId.value === null) return;
    if (!confirm('ปลดล็อกแบบประเมินนี้ให้กลับเป็นร่าง? ผู้ประเมินจะสามารถแก้ไขได้อีกครั้ง')) return;
    busy.value = true;
    serverError.value = '';
    try {
        await evaluationsApi.revert(myEvalId.value);
        await loadAll();
        toastMessage.value = 'ปลดล็อกเป็นร่างสำเร็จ';
        showToast.value = true;
        setTimeout(() => { showToast.value = false; }, 1500);
    } catch (e) {
        const err = e as PmsApiError;
        if (err.status === 403) serverError.value = 'เฉพาะ admin เท่านั้นที่ปลดล็อกได้';
        else                     serverError.value = err.message || 'ปลดล็อกไม่สำเร็จ';
    } finally {
        busy.value = false;
    }
};

const handleClear = () => {
    kpiRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    competencyRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    managerRecommend.value = null;
    executiveVerdict.value = null;
};

onMounted(() => loadAll());
</script>
