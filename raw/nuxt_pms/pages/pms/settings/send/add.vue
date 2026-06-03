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

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.cycle_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.cycleId ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @change="onCycleChange"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="c in cycleOptions" :key="c.id" :value="c.id">{{ c.cycle_label }}</option>
                            </select>
                            <p v-if="errors.cycleId" class="mt-1 text-xs text-red-500">{{ errors.cycleId }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน</label>
                            <input :value="cycleInfo.year" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                <!-- Note -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <label class="mb-1.5 block text-sm font-semibold text-gray-700">หมายเหตุ</label>
                    <textarea
                        v-model="form.note"
                        rows="2"
                        placeholder="ข้อความเพิ่มเติม (ไม่บังคับ)"
                        class="w-full max-w-2xl rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    />
                </div>

                <!-- Action Buttons (header save) -->
                <div class="mb-6 flex items-center gap-2 border-t border-gray-100 pt-5">
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
                    <span v-if="currentSendId" class="ml-2 text-xs text-green-600 font-medium">
                        ✓ บันทึกข้อมูลส่วนหัวแล้ว (ID: {{ currentSendId }})
                    </span>
                </div>

                <!-- Server error -->
                <div v-if="serverError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {{ serverError }}
                </div>

                <!-- ── Section 3: รายชื่อผู้ประเมิน (raters) ── -->
                <div class="mb-4 border-t border-gray-100 pt-6">
                    <div class="mb-2 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                                <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                                <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                                <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                            </svg>
                            <span class="text-sm font-bold text-gray-700">รายชื่อผู้ประเมิน (raters)</span>
                        </div>
                        <span class="text-xs text-gray-500">
                            <span class="font-semibold text-gray-600">บันทึก draft</span> = บันทึกก่อน (ผู้ประเมินยังไม่เห็น) &nbsp;|&nbsp; <span class="font-semibold text-blue-600">ส่ง</span> = แจ้งผู้ประเมินทันที
                        </span>
                    </div>

                    <div class="overflow-visible rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-10 px-3 py-3 text-center font-semibold text-gray-700">#</th>
                                    <th class="w-32 px-3 py-3 text-center font-semibold text-gray-700">บทบาท</th>
                                    <th class="w-48 px-3 py-3 text-center font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                                    <th class="px-3 py-3 text-center font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                    <th class="w-36 px-3 py-3 text-center font-semibold text-gray-700">ตำแหน่ง</th>
                                    <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">ระดับ</th>
                                    <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">สถานะ</th>
                                    <th class="w-20 px-2 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(evaluator, idx) in evaluatorRows"
                                    :key="idx"
                                    class="border-b border-gray-100"
                                    :class="evaluator.rater_id ? 'bg-green-50/30' : ''"
                                >
                                    <td class="px-3 py-2 text-center text-gray-500 font-medium">{{ idx + 1 }}</td>

                                    <!-- บทบาท -->
                                    <td class="px-2 py-2">
                                        <template v-if="evaluator.rater_id">
                                            <span class="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                {{ ALL_ROLES.find(r => r.value === evaluator.evaluator_role)?.label ?? evaluator.evaluator_role }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            <select
                                                v-model="evaluator.evaluator_role"
                                                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition"
                                            >
                                                <option v-for="r in ALL_ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
                                            </select>
                                        </template>
                                    </td>

                                    <!-- ชื่อแบบประเมิน -->
                                    <td class="px-2 py-2">
                                        <template v-if="evaluator.rater_id">
                                            <span class="block truncate text-xs text-gray-600 max-w-[10rem]" :title="allAssessments.find(a => a.id === evaluator.assessment_id)?.name">
                                                {{ allAssessments.find(a => a.id === evaluator.assessment_id)?.name ?? `#${evaluator.assessment_id}` }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            <select
                                                v-model="evaluator.assessment_id"
                                                class="w-full rounded-lg border px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition"
                                                :class="invalidAssessmentRows.has(idx)
                                                    ? 'border-red-400 bg-red-50/60 ring-1 ring-red-200'
                                                    : 'border-gray-200'"
                                                :disabled="form.cycle_id === null"
                                                @change="invalidAssessmentRows.delete(idx)"
                                            >
                                                <option :value="null">— เลือกแบบประเมิน —</option>
                                                <option v-for="a in assessmentOptions" :key="a.id" :value="a.id">{{ a.name }}</option>
                                            </select>
                                        </template>
                                    </td>

                                    <!-- ชื่อ-นามสกุล -->
                                    <td class="px-2 py-2">
                                        <template v-if="evaluator.rater_id">
                                            <span class="block text-xs font-medium text-gray-700">{{ evaluator.search }}</span>
                                        </template>
                                        <template v-else>
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
                                        </template>
                                    </td>

                                    <!-- ตำแหน่ง -->
                                    <td class="px-2 py-2">
                                        <input :value="evaluator.position" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-600 outline-none cursor-not-allowed" />
                                    </td>

                                    <!-- ระดับ -->
                                    <td class="px-2 py-2">
                                        <input :value="evaluator.level" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-600 outline-none cursor-not-allowed" />
                                    </td>

                                    <!-- สถานะ -->
                                    <td class="px-2 py-2 text-center">
                                        <span v-if="evaluator.rater_id && evaluator.isSent" class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                            ส่งแล้ว
                                        </span>
                                        <span v-else-if="evaluator.rater_id && !evaluator.isSent" class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                            Draft
                                        </span>
                                        <span v-else class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            รอบันทึก
                                        </span>
                                    </td>

                                    <!-- จัดการ -->
                                    <td class="px-2 py-2">
                                        <div class="flex items-center justify-center gap-1">
                                            <!-- Unsaved row: "บันทึก draft" + "ส่ง" -->
                                            <template v-if="!evaluator.rater_id">
                                                <button
                                                    type="button"
                                                    class="inline-flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    :disabled="sendingRaterIdxs[idx]"
                                                    @click="saveDraftRater(idx)"
                                                >
                                                    <svg v-if="!sendingRaterIdxs[idx]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                    {{ sendingRaterIdxs[idx] ? '...' : 'Draft' }}
                                                </button>
                                                <button
                                                    type="button"
                                                    class="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    :disabled="sendingRaterIdxs[idx]"
                                                    @click="sendRater(idx)"
                                                >
                                                    <svg v-if="!sendingRaterIdxs[idx]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                    {{ sendingRaterIdxs[idx] ? '...' : 'ส่ง' }}
                                                </button>
                                            </template>
                                            <!-- Draft row (saved, not notified): "ส่ง" only -->
                                            <button
                                                v-else-if="!evaluator.isSent"
                                                type="button"
                                                class="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                :disabled="sendingRaterIdxs[idx]"
                                                @click="sendRater(idx)"
                                            >
                                                <svg v-if="!sendingRaterIdxs[idx]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                {{ sendingRaterIdxs[idx] ? '...' : 'ส่ง' }}
                                            </button>
                                            <!-- ลบ button (always) -->
                                            <button
                                                type="button"
                                                class="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-400 transition hover:bg-red-50 disabled:opacity-50"
                                                :disabled="removingRaterIdxs[idx]"
                                                @click="removeEvaluator(idx)"
                                            >
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                <tr v-if="evaluatorRows.length === 0">
                                    <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-400">ยังไม่มีผู้ประเมิน — กดปุ่ม "เพิ่มแถว" หรือ "เติม Self"</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50" @click="addEvaluator">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>
                            เพิ่มแถว
                        </button>
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100" :disabled="!form.cycle_id || !form.employee_id" @click="autoFillSelfRow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            เติม Self
                        </button>
                        <!-- ส่งทั้งหมด: shows only when there are unsent saved-draft rows -->
                        <button
                            v-if="evaluatorRows.some(r => r.rater_id && !r.isSent)"
                            type="button"
                            class="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="sendingAllDrafts"
                            @click="sendAllDrafts"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            {{ sendingAllDrafts ? 'กำลังส่ง...' : 'ส่งทั้งหมด draft' }}
                        </button>
                    </div>
                    <p v-if="errors.raters" class="mt-2 text-xs text-red-500">{{ errors.raters }}</p>
                </div>

            </form>
        </div>

        <!-- Success Toast (header save) -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                บันทึกข้อมูลสำเร็จ
            </div>
        </transition>

        <!-- Rater draft saved Toast -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showDraftToast" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                บันทึก draft แล้ว (ผู้ประเมินยังไม่เห็น)
            </div>
        </transition>

        <!-- Rater sent Toast -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="showRaterToast" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 10 11 13 14 22 22 3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                ส่งแบบประเมินสำเร็จ — ผู้ประเมินเห็น assignment แล้ว
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
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsEvaluationRole } from '@/composables/usePmsEvaluations';

const router = useRouter();
const route  = useRoute();
const sendsApi       = usePmsSends();
const employeesApi   = usePmsEmployees();
const assessmentsApi = usePmsAssessments();
const cyclesApi      = usePmsCycles();
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

// ── Master data ───────────────────────────────────────────────────────
const employeeMaster   = ref<PmsEmployee[]>([]);
const allAssessments   = ref<PmsAssessment[]>([]);
const cycleOptions     = ref<PmsCycle[]>([]);

const assessmentOptions = computed(() =>
    form.cycle_id === null ? [] : allAssessments.value.filter(a => a.cycle_id === form.cycle_id)
);

// ── Form state (header: evaluatee + cycle + note) ─────────────────────
interface FormState {
    employee_id: number | null;
    cycle_id: number | null;
    note: string;
}
const form = reactive<FormState>({
    employee_id: null,
    cycle_id: null,
    note: '',
});

// Tracks the saved send ID (null = header not yet saved)
const currentSendId = ref<number | null>(null);

const errors      = reactive({ empCode: '', cycleId: '', raters: '' });
const invalidAssessmentRows = ref<Set<number>>(new Set());
const showToast      = ref(false);
const showRaterToast = ref(false);
const showDraftToast = ref(false);
const submitting     = ref(false);
const serverError    = ref('');

// Per-row loading flags (reactive object instead of Set for Vue reactivity)
const sendingRaterIdxs   = reactive<Record<number, boolean>>({});
const removingRaterIdxs  = reactive<Record<number, boolean>>({});

// ── Employee search ───────────────────────────────────────────────────
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

// ── Cycle selection ───────────────────────────────────────────────────
const cycleInfo = reactive({ year: '' });

const onCycleChange = () => {
    const found = cycleOptions.value.find(c => c.id === Number(form.cycle_id));
    cycleInfo.year = found?.year ? String(found.year) : '';
    // Reset unsent rater assessment selections when cycle changes
    for (const r of evaluatorRows.value) {
        if (!r.rater_id) r.assessment_id = null;
    }
};

// ── Rater rows ────────────────────────────────────────────────────────
const ALL_ROLES: Array<{ value: PmsEvaluationRole; label: string }> = [
    { value: 'self',        label: 'ตนเอง (Self)' },
    { value: 'manager',     label: 'หัวหน้า (Manager)' },
    { value: 'executive',   label: 'ผู้บริหาร (Executive)' },
    { value: 'ceo',         label: 'CEO' },
    { value: 'peer',        label: 'เพื่อนร่วมงาน (Peer)' },
    { value: 'subordinate', label: 'ผู้ใต้บังคับบัญชา (Subordinate)' },
];

interface EvaluatorRow {
    rater_id?: number;
    isSent: boolean;
    evaluator_employee_id: number | null;
    evaluator_role: PmsEvaluationRole;
    assessment_id: number | null;
    search: string;
    position: string;
    level: string;
    showDropdown: boolean;
    suggestions: PmsEmployee[];
}
const makeEvaluatorRow = (role: PmsEvaluationRole = 'self'): EvaluatorRow => ({
    isSent: false,
    evaluator_employee_id: null,
    evaluator_role: role,
    assessment_id: null,
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

const addEvaluator = () => evaluatorRows.value.push(makeEvaluatorRow('self'));

const removeEvaluator = async (idx: number) => {
    const row = evaluatorRows.value[idx];
    // If already in DB: delete from DB first
    if (row.rater_id) {
        removingRaterIdxs[idx] = true;
        try {
            await sendRatersApi.remove(row.rater_id);
        } catch (e) {
            serverError.value = (e as Error).message || 'ลบไม่สำเร็จ';
            return;
        } finally {
            delete removingRaterIdxs[idx];
        }
    }
    evaluatorRows.value.splice(idx, 1);
};

const autoFillSelfRow = () => {
    if (form.employee_id === null || form.cycle_id === null) return;
    const exists = evaluatorRows.value.some(r => r.evaluator_role === 'self' && r.evaluator_employee_id === form.employee_id);
    if (exists) return;
    const emp = employeeMaster.value.find(e => e.id === form.employee_id);
    if (!emp) return;
    const firstAssessment = assessmentOptions.value[0];
    const row = makeEvaluatorRow('self');
    row.evaluator_employee_id = emp.id;
    row.assessment_id = firstAssessment?.id ?? null;
    row.search   = `${emp.emp_code ?? ''} - ${emp.full_name ?? ''}`;
    row.position = emp.position_name ?? '';
    row.level    = emp.level_name ?? '';
    evaluatorRows.value.unshift(row);
};

// ── Ensure header saved, return sendId ───────────────────────────────
const ensureHeaderSaved = async (): Promise<number | null> => {
    if (currentSendId.value) return currentSendId.value;
    errors.empCode = ''; errors.cycleId = '';
    if (form.employee_id === null) { errors.empCode = 'กรุณาเลือกผู้ถูกประเมินก่อน'; return null; }
    if (form.cycle_id === null)    { errors.cycleId = 'กรุณาเลือกรอบการประเมินก่อน'; return null; }
    const note = form.note.trim() || null;
    const res = await sendsApi.create({ cycle_id: form.cycle_id, employee_id: form.employee_id, note });
    const id = (res as { data?: { id?: number } })?.data?.id ?? (res as { id?: number })?.id ?? 0;
    if (!id) throw new Error('สร้าง send ไม่สำเร็จ');
    currentSendId.value = id;
    router.replace(`/pms/settings/send/add?id=${id}`);
    return id;
};

// ── Save rater as draft (no notification) ────────────────────────────
const saveDraftRater = async (idx: number) => {
    const row = evaluatorRows.value[idx];
    errors.raters = '';
    serverError.value = '';

    if (row.evaluator_employee_id == null) {
        errors.raters = 'กรุณาเลือกผู้ประเมินก่อนบันทึก';
        return;
    }
    if (row.assessment_id == null) {
        invalidAssessmentRows.value.add(idx);
        errors.raters = 'กรุณาเลือกแบบประเมินก่อนบันทึก';
        return;
    }

    sendingRaterIdxs[idx] = true;
    try {
        const sendId = await ensureHeaderSaved();
        if (!sendId) return;

        const saved = await sendRatersApi.create({
            send_id: sendId,
            evaluator_employee_id: row.evaluator_employee_id,
            evaluator_role: row.evaluator_role,
            assessment_id: row.assessment_id,
        });
        row.rater_id = (saved as { id: number }).id;
        row.isSent = false;
        invalidAssessmentRows.value.delete(idx);

        showDraftToast.value = true;
        setTimeout(() => { showDraftToast.value = false; }, 1500);
    } catch (e) {
        serverError.value = (e as PmsApiError).message || 'บันทึกไม่สำเร็จ';
    } finally {
        delete sendingRaterIdxs[idx];
    }
};

// ── Send single rater (save if needed, then markNotified) ─────────────
const sendRater = async (idx: number) => {
    const row = evaluatorRows.value[idx];
    errors.raters = '';
    serverError.value = '';

    sendingRaterIdxs[idx] = true;
    try {
        // If not yet saved: validate and create first
        if (!row.rater_id) {
            if (row.evaluator_employee_id == null) {
                errors.raters = 'กรุณาเลือกผู้ประเมินก่อนกดส่ง';
                return;
            }
            if (row.assessment_id == null) {
                invalidAssessmentRows.value.add(idx);
                errors.raters = 'กรุณาเลือกแบบประเมินก่อนกดส่ง';
                return;
            }
            const sendId = await ensureHeaderSaved();
            if (!sendId) return;

            const saved = await sendRatersApi.create({
                send_id: sendId,
                evaluator_employee_id: row.evaluator_employee_id,
                evaluator_role: row.evaluator_role,
                assessment_id: row.assessment_id,
            });
            row.rater_id = (saved as { id: number }).id;
            invalidAssessmentRows.value.delete(idx);
        }

        // Mark as notified so the evaluator can see the assignment
        await sendRatersApi.markNotified(row.rater_id!);
        row.isSent = true;

        showRaterToast.value = true;
        setTimeout(() => { showRaterToast.value = false; }, 1500);
    } catch (e) {
        serverError.value = (e as PmsApiError).message || 'ส่งไม่สำเร็จ';
    } finally {
        delete sendingRaterIdxs[idx];
    }
};

// ── Send all saved-draft raters at once ───────────────────────────────
const sendingAllDrafts = ref(false);
const sendAllDrafts = async () => {
    const draftIdxs = evaluatorRows.value
        .map((r, i) => i)
        .filter(i => evaluatorRows.value[i].rater_id && !evaluatorRows.value[i].isSent);
    if (draftIdxs.length === 0) return;
    sendingAllDrafts.value = true;
    try {
        for (const idx of draftIdxs) await sendRater(idx);
    } finally {
        sendingAllDrafts.value = false;
    }
};

// ── Save header only ──────────────────────────────────────────────────
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
    errors.empCode = ''; errors.cycleId = '';
    if (form.employee_id === null) { errors.empCode = 'กรุณาเลือกผู้ถูกประเมิน'; return; }
    if (form.cycle_id === null)    { errors.cycleId = 'กรุณาเลือกรอบการประเมิน';  return; }

    submitting.value = true;
    try {
        const note = form.note.trim() || null;
        if (currentSendId.value) {
            await sendsApi.update(currentSendId.value, {
                cycle_id:    form.cycle_id    as number,
                employee_id: form.employee_id as number,
                note,
            });
        } else {
            const res = await sendsApi.create({
                cycle_id:    form.cycle_id    as number,
                employee_id: form.employee_id as number,
                note,
            });
            const id = (res as { data?: { id?: number } })?.data?.id ?? (res as { id?: number })?.id ?? 0;
            if (!id) throw new Error('สร้าง send ไม่สำเร็จ');
            currentSendId.value = id;
            router.replace(`/pms/settings/send/add?id=${id}`);
        }
        showToast.value = true;
        setTimeout(() => { showToast.value = false; }, 1500);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    if (currentSendId.value) {
        // Edit mode: only remove unsent rows + clear note
        evaluatorRows.value = evaluatorRows.value.filter(r => r.rater_id);
        form.note = '';
    } else {
        // Add mode: clear everything
        empCodeSearch.value = '';
        setEmployeeInfo(null);
        form.employee_id = null;
        form.cycle_id = null;
        form.note = '';
        cycleInfo.year = '';
        evaluatorRows.value = [];
    }
    errors.empCode = ''; errors.cycleId = ''; errors.raters = '';
    invalidAssessmentRows.value = new Set();
    serverError.value = '';
};

onMounted(async () => {
    try {
        const [emp, asm, cyc] = await Promise.all([
            employeesApi.list({ limit: 1000 }),
            assessmentsApi.list({ limit: 500 }),
            cyclesApi.list({ limit: 100 }),
        ]);
        employeeMaster.value = emp.data;
        allAssessments.value = asm.data;
        cycleOptions.value   = cyc.data;
    } catch (e) {
        console.warn('[send/add] failed to load masters', e);
    }

    if (isEditMode.value && editId.value !== null) {
        currentSendId.value = editId.value;
        try {
            const res = await sendsApi.get(editId.value);
            const s = res.data;
            form.cycle_id    = s.cycle_id;
            form.employee_id = s.employee_id;
            form.note        = s.note ?? '';
            empCodeSearch.value = s.emp_code ?? '';
            employeeInfo.empCode  = s.emp_code ?? '';
            employeeInfo.fullName = s.full_name ?? '';
            employeeInfo.position = s.employee_position_name ?? '';
            employeeInfo.level    = s.employee_level_name ?? '';
            employeeInfo.team     = s.employee_team_name ?? '';
            employeeInfo.dept     = s.employee_department_name ?? '';
            cycleInfo.year        = s.year ? String(s.year) : '';

            const raters = await sendRatersApi.listBySend(editId.value) as unknown as Array<{
                id: number;
                evaluator_employee_id: number;
                evaluator_role: PmsEvaluationRole;
                assessment_id: number;
                notified_at: string | null;
                pms_employees?: {
                    emp_code?: string;
                    full_name?: string;
                    pms_positions?: { name?: string };
                    pms_levels?: { name?: string };
                };
            }>;
            evaluatorRows.value = raters.map(r => ({
                rater_id: r.id,
                isSent: r.notified_at !== null,
                evaluator_employee_id: r.evaluator_employee_id,
                evaluator_role: r.evaluator_role,
                assessment_id: r.assessment_id,
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
