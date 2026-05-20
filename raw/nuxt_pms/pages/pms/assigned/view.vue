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

        <!-- Role Switcher (admin only — test perspectives) -->
        <div v-if="profile?.role === 'admin'" class="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <span class="text-xs font-semibold text-blue-600">Admin — Switch role view:</span>
            <div class="flex gap-1">
                <button
                    v-for="r in roles" :key="r.value"
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    :class="userRole === r.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                    @click="onRoleSwitch(r.value)"
                >{{ r.label }}</button>
            </div>
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

        <!-- ── แบบประเมิน KPIs ── -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
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
                            <th v-if="isManager || isExecutive" class="w-20 px-2 py-3 text-center font-semibold text-gray-700 text-xs" title="ยกเว้นข้อนี้ไม่นับใน total score (admin override)">ยกเว้น</th>
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
                                    <span class="text-xs text-gray-500 whitespace-nowrap">{{ kpi.options[n - 1] }}</span>
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
                            <td v-if="isManager || isExecutive" class="px-2 py-3 text-center">
                                <button
                                    type="button"
                                    class="inline-flex h-7 w-7 items-center justify-center rounded-full border transition"
                                    :class="kpi.closed ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50'"
                                    @click="kpi.closed = !kpi.closed"
                                    :title="kpi.closed ? 'ยกเว้นจากการคำนวณ — คลิกเพื่อนำกลับมาประเมิน' : 'นับในคะแนนรวม — คลิกเพื่อยกเว้น'"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle v-if="!kpi.closed" cx="12" cy="12" r="8" stroke-linecap="round"/>
                                        <g v-else>
                                            <circle cx="12" cy="12" r="9" stroke-linecap="round"/>
                                            <path d="M6 6l12 12" stroke-linecap="round"/>
                                        </g>
                                    </svg>
                                </button>
                            </td>
                            <td v-if="isExecutive" class="px-2 py-3 text-center font-semibold text-gray-700">{{ kpi.managerScore }}</td>
                        </tr>
                    </tbody>
                </table>
                <p v-if="isManager || isExecutive" class="px-5 pb-3 pt-1 text-xs text-gray-500">
                    💡 คอลัมน์ <b>ยกเว้น</b> ใช้สำหรับ manager/executive เพื่อระบุว่า KPI ข้อนี้ <b>ไม่นำมานับใน total score</b> เช่น พนักงานลาคลอดทั้งรอบ ทำ KPI นี้ไม่ทัน
                </p>
            </div>
        </div>

        <!-- ── แบบประเมิน Competency ── -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div class="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="2.5"/></svg>
                <span class="text-sm font-semibold text-gray-700">แบบประเมิน Competency</span>
            </div>

            <!-- Scale Info Box -->
            <div class="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p class="mb-2 text-xs font-bold text-amber-800">ระดับคะแนน</p>
                <div class="space-y-0.5 text-xs text-amber-700 leading-relaxed">
                    <p><strong>1 = ไม่สังเกตเห็น (Non Observe):</strong> ไม่สามารถแสดงให้เห็นถึงพฤติกรรมตามระบุในพฤนานกรมสมรรถนะได้</p>
                    <p><strong>2 = กำลังพัฒนา (Developing):</strong> สามารถทำตามสมรรถนะตามที่กำหนดได้บ้าง ต้องได้รับการพัฒนาเพิ่มเติม</p>
                    <p><strong>3 = อยู่ในระดับที่ใช้งานได้ (Proficient):</strong> สามารถทำได้ถึงสมรรถนะที่คาดหวัง ต้องปรับปรุงบ้าง</p>
                    <p><strong>4 = อยู่ในระดับที่ใช้งานได้ดี (Proficient):</strong> สามารถทำได้ครบหรือเกินสมรรถนะที่กำหนด โดยไม่ปรากฏประเด็นต้องปรับแก้ไข</p>
                    <p><strong>5 = เป็นแบบอย่างที่ดีให้กับผู้อื่น (Role Model):</strong> ทำได้ครบตามสมรรถนะในระดับสูง สามารถอ้างอิงเป็นแบบอย่างให้กับผู้อื่น</p>
                </div>
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
                            <th v-if="isManager || isExecutive" class="w-20 px-2 py-3 text-center font-semibold text-gray-700 text-xs" title="ยกเว้นข้อนี้ไม่นับใน total score (admin override)">ยกเว้น</th>
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
                            <td v-for="n in 5" :key="n" class="px-3 py-4 align-top">
                                <div class="flex flex-col items-start gap-1.5">
                                    <input
                                        type="radio"
                                        :name="`comp-${idx}`"
                                        :value="n"
                                        v-model="comp.selected"
                                        :disabled="comp.closed"
                                        class="h-4 w-4 cursor-pointer accent-blue-600"
                                    />
                                    <span class="text-xs text-gray-600 leading-relaxed">{{ comp.options[n - 1] }}</span>
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
                            <td v-if="isManager || isExecutive" class="px-2 py-4 text-center align-top">
                                <button
                                    type="button"
                                    class="inline-flex h-7 w-7 items-center justify-center rounded-full border transition"
                                    :class="comp.closed ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50'"
                                    @click="comp.closed = !comp.closed"
                                    :title="comp.closed ? 'ยกเว้นจากการคำนวณ — คลิกเพื่อนำกลับมาประเมิน' : 'นับในคะแนนรวม — คลิกเพื่อยกเว้น'"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle v-if="!comp.closed" cx="12" cy="12" r="8" stroke-linecap="round"/>
                                        <g v-else>
                                            <circle cx="12" cy="12" r="9" stroke-linecap="round"/>
                                            <path d="M6 6l12 12" stroke-linecap="round"/>
                                        </g>
                                    </svg>
                                </button>
                            </td>
                            <td v-if="isExecutive" class="px-2 py-4 text-center font-semibold text-gray-700 align-top">{{ comp.managerScore }}</td>
                        </tr>
                    </tbody>
                </table>
                <p v-if="isManager || isExecutive" class="px-5 pb-3 pt-1 text-xs text-gray-500">
                    💡 คอลัมน์ <b>ยกเว้น</b> ใช้สำหรับ manager/executive เพื่อระบุว่า Competency ข้อนี้ <b>ไม่นำมานับใน total score</b> เช่น ข้อที่ไม่เหมาะกับ position ปัจจุบัน
                </p>
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
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style="background:#16a34a;"
                :disabled="busy || isApproved"
                @click="handleSubmit"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ busy ? 'กำลังบันทึก...' : 'ส่งแบบประเมิน' }}
            </button>
            <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style="background:#4361ee;"
                :disabled="busy || isApproved"
                @click="handleSaveDraft"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                บันทึกร่าง
            </button>
            <button
                v-if="isExecutive && myEvalId !== null && !isApproved"
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style="background:#a855f7;"
                :disabled="busy"
                @click="handleApprove"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                อนุมัติผลการประเมิน
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
const { profile }    = useAuth();

// ── Param parsing ───────────────────────────────────────────────────────
const sendId = computed<number | null>(() => {
    const v = route.query.send_id ?? route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const readonly = computed(() => route.query.readonly === '1');

// ── Role (auto-detected; admin can switch via UI) ───────────────────────
type UiRole = 'officer' | 'manager' | 'executive';
const roles = [
    { value: 'officer'   as UiRole, label: 'Officer'   },
    { value: 'manager'   as UiRole, label: 'Manager'   },
    { value: 'executive' as UiRole, label: 'Executive' },
];
const userRole   = ref<UiRole>('officer');
const isOfficer  = computed(() => userRole.value === 'officer');
const isManager  = computed(() => userRole.value === 'manager');
const isExecutive= computed(() => userRole.value === 'executive');
const evaluatorRole = computed<PmsEvaluationRole>(() =>
    isOfficer.value ? 'self' : isManager.value ? 'manager' : 'executive'
);

const onRoleSwitch = (r: UiRole) => {
    userRole.value = r;
    applyMyEvaluationToRows();
    applyManagerScoresForExecutive();
};

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
const myEvalId       = ref<number | null>(null);
const isApproved     = ref(false);
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
function getEvalByRole(role: PmsEvaluationRole): PmsEvaluation | undefined {
    return allEvaluations.value.find(e => e.evaluator_role === role);
}

function statusLabel(status: string): string {
    if (status === 'completed' || status === 'approved') return 'ประเมินเสร็จสิ้นแล้ว';
    if (status === 'submitted') return 'ส่งแบบประเมินแล้ว';
    if (status === 'in_progress' || status === 'opened' || status === 'draft') return 'อยู่ระหว่างการประเมิน';
    if (status === 'sent') return 'รอการประเมิน';
    return 'ยังไม่เข้าทำแบบประเมิน';
}

function applyMyEvaluationToRows() {
    const myEval = getEvalByRole(evaluatorRole.value);
    // reset row selections first
    kpiRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    competencyRows.value.forEach(r => { r.selected = -1; r.closed = false; });
    managerRecommend.value = null;
    executiveVerdict.value = null;

    if (!myEval) {
        myEvalId.value = null;
        isApproved.value = false;
        kpiScore.value = '0.00'; competencyScore.value = '0.00'; totalScore.value = '0.00';
        return;
    }

    myEvalId.value   = myEval.id;
    isApproved.value = myEval.status === 'approved';

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
    const mgrEval = getEvalByRole('manager');
    if (!mgrEval) return;

    const mgrKpiMap = new Map<number, number | null>();
    for (const s of mgrEval.kpi_scores ?? []) mgrKpiMap.set(s.kpi_id, s.selected_option ?? null);
    for (const row of kpiRows.value) {
        const v = mgrKpiMap.get(row.kpi_id);
        row.managerScore = v ?? '-';
    }
    const mgrCompMap = new Map<number, number | null>();
    for (const s of mgrEval.competency_scores ?? []) mgrCompMap.set(s.competency_id, s.selected_option ?? null);
    for (const row of competencyRows.value) {
        const v = mgrCompMap.get(row.competency_id);
        row.managerScore = v ?? '-';
    }

    if (mgrEval.recommendation && proposals.value.length === 0) {
        proposals.value = [{
            proposer: mgrEval.evaluator_employee_id ? `Employee #${mgrEval.evaluator_employee_id}` : 'Manager',
            position: 'Manager',
            content: recommendOptions[(mgrEval.recommendation - 1)] ?? '-',
            date: mgrEval.submitted_at?.slice(0, 10) ?? '',
        }];
    }
}

// ── Load all ────────────────────────────────────────────────────────────
async function loadAll() {
    if (sendId.value === null) {
        serverError.value = 'ไม่พบ send_id ใน URL';
        return;
    }
    loading.value = true;
    serverError.value = '';

    // Auto-detect role from profile
    const r = profile.value?.role;
    if (r === 'manager')        userRole.value = 'manager';
    else if (r === 'executive') userRole.value = 'executive';
    else                         userRole.value = 'officer';

    try {
        const sendRes = await sendsApi.get(sendId.value);
        const s = sendRes.data;

        assessment.name   = s.assessment_name ?? '';
        assessment.year   = s.year != null ? String(s.year) : '';
        assessment.cycle  = s.cycle_label ?? '';
        assessment.status = statusLabel(s.status);

        employee.empCode  = s.emp_code ?? '';
        employee.name     = s.full_name ?? '';
        employee.position = s.employee_position_name ?? '';
        employee.level    = s.employee_level_name ?? '';
        employee.team     = s.employee_team_name ?? '';
        employee.dept     = s.employee_department_name ?? '';

        const aRes = await assessmentsApi.get(s.assessment_id);
        const a = aRes.data;

        kpiRows.value = (a.kpis ?? []).map(k => ({
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

        applyMyEvaluationToRows();
        applyManagerScoresForExecutive();
    } catch (e) {
        serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
    } finally {
        loading.value = false;
    }
}

// ── Build payload + save ────────────────────────────────────────────────
function buildPayload(status: 'draft' | 'submitted') {
    const recommendation = isManager.value
        ? (managerRecommend.value ?? null)
        : isExecutive.value
            ? (executiveVerdict.value ?? null)
            : null;

    return {
        send_id: sendId.value!,
        evaluator_role: evaluatorRole.value,
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

async function saveAndReload(status: 'draft' | 'submitted') {
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
        toastMessage.value = status === 'submitted' ? 'ส่งแบบประเมินสำเร็จ' : 'บันทึกร่างสำเร็จ';
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            if (status === 'submitted') router.push('/pms/assigned');
        }, 1500);
    } catch (e) {
        const err = e as PmsApiError;
        if (err.status === 403) serverError.value = `ไม่มีสิทธิ์ ${status === 'submitted' ? 'ส่ง' : 'บันทึก'}แบบประเมิน (ตรวจสอบ role)`;
        else                     serverError.value = err.message || 'บันทึกไม่สำเร็จ';
    } finally {
        busy.value = false;
    }
}

const handleSubmit    = () => saveAndReload('submitted');
const handleSaveDraft = () => saveAndReload('draft');

const handleApprove = async () => {
    if (myEvalId.value === null) return;
    busy.value = true;
    serverError.value = '';
    try {
        await evaluationsApi.approve(myEvalId.value);
        await loadAll();
        toastMessage.value = 'อนุมัติผลสำเร็จ';
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/assigned');
        }, 1500);
    } catch (e) {
        const err = e as PmsApiError;
        serverError.value = err.message || 'อนุมัติไม่สำเร็จ';
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
