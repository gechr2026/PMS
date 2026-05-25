<template>
    <div>
        <!-- Page Header -->
        <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#f0fdf4;">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.8">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                        <path d="M9 12h6M9 16h4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1 class="text-lg font-bold text-gray-800">แบบประเมิน - {{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}</h1>
            </div>
            <NuxtLink
                to="/pms/settings/assessment"
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

                <!-- ── Section 1: ข้อมูลทั่วไป ── -->
                <div class="mb-6">
                    <div class="mb-4 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                            <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">ข้อมูลทั่วไป</span>
                    </div>

                    <!-- ประเภทเอกสาร -->
                    <div class="mb-4">
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">ประเภทเอกสาร <span class="text-red-500">*</span></label>
                        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <label
                                v-for="opt in typeOptions"
                                :key="opt.value"
                                class="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition"
                                :class="form.type === opt.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'"
                            >
                                <input
                                    type="radio"
                                    :value="opt.value"
                                    v-model="form.type"
                                    class="mt-1 accent-blue-500"
                                    @change="onTypeChange"
                                />
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-700">{{ opt.label }}</div>
                                    <div class="text-xs text-gray-500">{{ opt.hint }}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- ชื่อแบบประเมิน -->
                    <div class="mb-4">
                        <label class="mb-1.5 block text-sm font-semibold text-gray-700">ชื่อแบบประเมิน <span class="text-red-500">*</span></label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="เช่น ประเมินผลการปฏิบัติงานประจำปี 2569 - Quality Assurance (Officer)"
                            class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                            :class="errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                        />
                        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                    </div>

                    <!-- รอบปีการประเมิน + รอบการประเมิน + ตำแหน่ง -->
                    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบปีการประเมิน <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.year_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.year ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @change="form.cycle_id = null"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="y in yearOptions" :key="y.id" :value="y.id">{{ y.year }}</option>
                            </select>
                            <p v-if="errors.year" class="mt-1 text-xs text-red-500">{{ errors.year }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">รอบการประเมิน <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.cycle_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.cycle ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                :disabled="form.year_id === null"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="c in filteredCycleOptions" :key="c.id" :value="c.id">{{ c.cycle_label }}</option>
                            </select>
                            <p v-if="errors.cycle" class="mt-1 text-xs text-red-500">{{ errors.cycle }}</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ตำแหน่ง <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.position_id"
                                class="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition"
                                :class="errors.position ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'"
                                @change="onPositionChange"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="p in positionOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
                            </select>
                            <p v-if="errors.position" class="mt-1 text-xs text-red-500">{{ errors.position }}</p>
                        </div>
                    </div>

                    <!-- ระดับตำแหน่ง (auto) + ทีม (auto) + แผนก (auto) -->
                    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ระดับตำแหน่ง</label>
                            <input :value="autoInfo.level" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">ทีม</label>
                            <input :value="autoInfo.team" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">แผนก</label>
                            <input :value="autoInfo.dept" type="text" readonly class="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed" />
                        </div>
                    </div>

                    <!-- สัดส่วน KPI + Competency + เกณฑ์การประเมิน -->
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">สัดส่วนคะแนน KPI <span class="text-red-500">*</span></label>
                            <input
                                v-model="form.kpiWeight"
                                type="number" min="0" max="100"
                                placeholder="50"
                                :disabled="isCompetencyOnly"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                            <p v-if="isCompetencyOnly" class="mt-1 text-xs text-gray-400">ล็อคเป็น 0 เนื่องจากประเมิน Competency 360°</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">สัดส่วนคะแนน Competency <span class="text-red-500">*</span></label>
                            <input
                                v-model="form.competencyWeight"
                                type="number" min="0" max="100"
                                placeholder="50"
                                :disabled="isCompetencyOnly"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                            <p v-if="isCompetencyOnly" class="mt-1 text-xs text-gray-400">ล็อคเป็น 100 เนื่องจากประเมิน Competency 360°</p>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-gray-700">เกณฑ์การประเมิน <span class="text-red-500">*</span></label>
                            <select
                                v-model="form.criteria_id"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                            >
                                <option :value="null">เลือก</option>
                                <option v-for="cr in criteriaOptions" :key="cr.id" :value="cr.id">{{ cr.name }}</option>
                            </select>
                        </div>
                    </div>
                    <p v-if="errors.weights" class="mt-2 text-xs font-medium text-red-500">{{ errors.weights }}</p>
                </div>

                <!-- ── Section 2: แบบประเมิน KPIs (ซ่อนสำหรับ Competency 360°) ── -->
                <div v-if="!isCompetencyOnly" class="mb-6 border-t border-gray-100 pt-6">
                    <div class="mb-3 flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                                <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                                <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                                <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                            </svg>
                            <span class="text-sm font-bold text-gray-700">แบบประเมิน KPIs</span>
                        </div>
                        <span
                            class="rounded-full px-3 py-1 text-xs font-semibold"
                            :class="isKpiWeightSumValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                        >
                            ผลรวมน้ำหนัก: {{ kpiWeightSum.toFixed(2) }} / 1.00
                            <span v-if="!isKpiWeightSumValid">⚠</span>
                        </span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-14 px-3 py-3 text-center font-semibold text-gray-700">ข้อที่</th>
                                    <th class="w-36 px-3 py-3 text-center font-semibold text-gray-700">หัวข้อ</th>
                                    <th class="px-3 py-3 text-center font-semibold text-gray-700">รายละเอียด</th>
                                    <th class="w-28 px-3 py-3 text-center font-semibold text-gray-700">น้ำหนักคะแนน</th>
                                    <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">เป้าหมาย</th>
                                    <th class="w-10 px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(kpi, idx) in kpiRows" :key="idx">
                                    <!-- Main KPI row -->
                                    <tr class="border-b border-gray-100">
                                        <td class="px-3 py-2 text-center text-gray-500 font-medium">{{ idx + 1 }}</td>
                                        <td class="px-2 py-2">
                                            <input v-model="kpi.subject" type="text" placeholder="หัวข้อ KPI" class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition" />
                                        </td>
                                        <td class="px-2 py-2">
                                            <textarea v-model="kpi.detail" rows="2" placeholder="รายละเอียด KPI" class="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition" />
                                        </td>
                                        <td class="px-2 py-2">
                                            <input v-model="kpi.weight" type="number" step="0.01" min="0" max="1" placeholder="0.00" class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition" />
                                        </td>
                                        <td class="px-2 py-2">
                                            <select
                                                v-model.number="kpi.target_option"
                                                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                                            >
                                                <option :value="null">— เลือกเป้าหมาย —</option>
                                                <option v-for="i in availableTargetIndices(kpi)" :key="i" :value="i">
                                                    {{ i }}. {{ kpi.options[i - 1] }}
                                                </option>
                                            </select>
                                        </td>
                                        <td class="px-2 py-2 text-center">
                                            <button v-if="kpiRows.length > 1" type="button" class="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-400 transition hover:bg-red-50" @click="removeKpi(idx)">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                    <!-- Options sub-header row -->
                                    <tr class="border-b border-gray-100 bg-gray-50">
                                        <td colspan="6" class="p-0">
                                            <div class="grid grid-cols-5 divide-x divide-gray-200">
                                                <div v-for="n in 5" :key="n" class="px-3 py-1.5 text-center text-xs font-semibold text-gray-500">ตัวเลือกที่ {{ n }}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Options values row -->
                                    <tr class="border-b border-gray-200">
                                        <td colspan="6" class="p-0">
                                            <div class="grid grid-cols-5 divide-x divide-gray-200">
                                                <div v-for="(_, optIdx) in kpi.options" :key="optIdx" class="p-2">
                                                    <input
                                                        v-model="kpi.options[optIdx]"
                                                        type="text"
                                                        :placeholder="`ตัวเลือก ${optIdx + 1}`"
                                                        class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-3 flex items-center gap-3">
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50" @click="addKpi">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>
                            เพิ่มแถว
                        </button>
                        <p v-if="errors.kpis" class="text-xs font-medium text-red-500">{{ errors.kpis }}</p>
                    </div>
                </div>

                <!-- ── Section 3: แบบประเมิน Competency ── -->
                <div class="mb-6 border-t border-gray-100 pt-6">
                    <div class="mb-3 flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8">
                                <line x1="3" y1="6"  x2="21" y2="6"  stroke-linecap="round"/>
                                <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round"/>
                                <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round"/>
                            </svg>
                            <span class="text-sm font-bold text-gray-700">แบบประเมิน Competency</span>
                        </div>
                        <span
                            class="rounded-full px-3 py-1 text-xs font-semibold"
                            :class="isCompetencyWeightSumValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                        >
                            ผลรวมน้ำหนัก: {{ competencyWeightSum.toFixed(2) }} / 1.00
                            <span v-if="!isCompetencyWeightSumValid">⚠</span>
                        </span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 bg-gray-50">
                                    <th class="w-14 px-3 py-3 text-center font-semibold text-gray-700">ข้อที่</th>
                                    <th class="px-3 py-3 text-center font-semibold text-gray-700">หัวข้อ</th>
                                    <th class="w-28 px-3 py-3 text-center font-semibold text-gray-700">น้ำหนักคะแนน</th>
                                    <th class="w-24 px-3 py-3 text-center font-semibold text-gray-700">เป้าหมาย</th>
                                    <th class="w-10 px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(comp, idx) in competencyRows" :key="idx">
                                    <!-- Main Competency row -->
                                    <tr class="border-b border-gray-100">
                                        <td class="px-3 py-2 text-center text-gray-500 font-medium">{{ idx + 1 }}</td>
                                        <td class="px-2 py-2">
                                            <textarea v-model="comp.subject" rows="2" placeholder="หัวข้อ Competency (ภาษาไทย และ English)" class="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition" />
                                        </td>
                                        <td class="px-2 py-2">
                                            <input v-model="comp.weight" type="number" step="0.01" min="0" max="1" placeholder="0.00" class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition" />
                                        </td>
                                        <td class="px-2 py-2">
                                            <select
                                                v-model.number="comp.target_option"
                                                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                                            >
                                                <option :value="null">— เลือกเป้าหมาย —</option>
                                                <option v-for="i in availableTargetIndices(comp)" :key="i" :value="i">
                                                    {{ i }}. {{ comp.options[i - 1] }}
                                                </option>
                                            </select>
                                        </td>
                                        <td class="px-2 py-2 text-center">
                                            <button v-if="competencyRows.length > 1" type="button" class="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-400 transition hover:bg-red-50" @click="removeCompetency(idx)">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                    <!-- Options sub-header -->
                                    <tr class="border-b border-gray-100 bg-gray-50">
                                        <td colspan="5" class="p-0">
                                            <div class="grid grid-cols-5 divide-x divide-gray-200">
                                                <div v-for="n in 5" :key="n" class="px-3 py-1.5 text-center text-xs font-semibold text-gray-500">ตัวเลือกที่ {{ n }}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Options values (textarea for competency descriptions) -->
                                    <tr class="border-b border-gray-200">
                                        <td colspan="5" class="p-0">
                                            <div class="grid grid-cols-5 divide-x divide-gray-200">
                                                <div v-for="(_, optIdx) in comp.options" :key="optIdx" class="p-2">
                                                    <textarea
                                                        v-model="comp.options[optIdx]"
                                                        rows="4"
                                                        :placeholder="`คำอธิบายตัวเลือก ${optIdx + 1}`"
                                                        class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 transition"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-3 flex items-center gap-3">
                        <button type="button" class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50" @click="addCompetency">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>
                            เพิ่มแถว
                        </button>
                        <p v-if="errors.competencies" class="text-xs font-medium text-red-500">{{ errors.competencies }}</p>
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
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';
import type { PmsPosition } from '@/composables/usePmsPositions';
import type { PmsLevel } from '@/composables/usePmsLevels';
import type { PmsCriteria } from '@/composables/usePmsCriteria';

const router = useRouter();
const route  = useRoute();
const assessmentsApi = usePmsAssessments();
const yearsApi       = usePmsYears();
const cyclesApi      = usePmsCycles();
const positionsApi   = usePmsPositions();
const levelsApi      = usePmsLevels();
const criteriaApi    = usePmsCriteria();

const editId = computed(() => {
    const v = route.query.id;
    if (typeof v !== 'string') return null;
    const n = parseInt(v, 10);
    return Number.isInteger(n) ? n : null;
});
const isEditMode = computed(() => editId.value !== null);

useHead({
    title: computed(() => isEditMode.value ? 'แก้ไขแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' : 'เพิ่มแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน'),
});
definePageMeta({ layout: 'pms-layout' });

// ── Master data ────────────────────────────────────────────────────────
const yearOptions     = ref<PmsYear[]>([]);
const cycleOptions    = ref<PmsCycle[]>([]);
const positionOptions = ref<PmsPosition[]>([]);
const levelOptions    = ref<PmsLevel[]>([]);
const criteriaOptions = ref<PmsCriteria[]>([]);

// Filter cycles by selected year
const filteredCycleOptions = computed(() => {
    if (form.year_id === null) return [] as PmsCycle[];
    return cycleOptions.value.filter(c => c.year_id === form.year_id);
});

// ── Form state (header) ────────────────────────────────────────────────
type AssessmentType = 'annual_supervisor' | 'competency_360' | 'annual_self';

interface FormState {
    type: AssessmentType;
    name: string;
    year_id: number | null;
    cycle_id: number | null;
    position_id: number | null;
    level_id: number | null;
    criteria_id: number | null;
    kpiWeight: string;
    competencyWeight: string;
    is_active: boolean;
}
const form = reactive<FormState>({
    type:             'annual_supervisor',
    name:             '',
    year_id:          null,
    cycle_id:         null,
    position_id:      null,
    level_id:         null,
    criteria_id:      null,
    kpiWeight:        '50',
    competencyWeight: '50',
    is_active:        true,
});

const typeOptions: Array<{ value: AssessmentType; label: string; hint: string }> = [
    { value: 'annual_supervisor', label: 'ประจำปี',                  hint: 'KPI + Competency — เลือกผู้ประเมินตอนสร้าง send (self / หัวหน้า / ผู้บริหาร / CEO)' },
    { value: 'competency_360',    label: 'สมรรถนะ Competency 360°', hint: 'Competency only, ประเมินทุกทิศ (peer / subordinate / supervisor)' },
];

const isCompetencyOnly = computed(() => form.type === 'competency_360');

const onTypeChange = () => {
    if (form.type === 'competency_360') {
        form.kpiWeight = '0';
        form.competencyWeight = '100';
    } else if (form.kpiWeight === '0' && form.competencyWeight === '100') {
        // Coming back from competency_360 — restore sensible default
        form.kpiWeight = '50';
        form.competencyWeight = '50';
    }
};

const errors      = reactive({ name: '', year: '', cycle: '', position: '', weights: '', kpis: '', competencies: '' });
const showToast   = ref(false);
const submitting  = ref(false);
const serverError = ref('');

// ── Auto-fill display: team + dept from selected position ─────────────
const autoInfo = computed(() => {
    if (form.position_id === null) return { level: '', team: '', dept: '' };
    const p = positionOptions.value.find(x => x.id === form.position_id);
    if (!p) return { level: '', team: '', dept: '' };
    // Level name: try existing level_id, otherwise leave blank
    const lv = levelOptions.value.find(l => l.id === form.level_id);
    return {
        level: lv?.name ?? '',
        team:  p.team_name ?? '',
        dept:  p.department_name ?? '',
    };
});

const onPositionChange = () => {
    // No automatic level mapping in DB yet — leave level_id as user-set.
    // (Could be enhanced when pms_positions has a level_id column.)
};

// ── KPI rows (UI uses string for numeric inputs; target_option is the option index 1..5) ──
interface KpiRow { subject: string; detail: string; weight: string; target_option: number | null; options: string[]; }
const makeKpiRow = (): KpiRow => ({ subject: '', detail: '', weight: '', target_option: 3, options: ['', '', '', '', ''] });
const kpiRows = ref<KpiRow[]>([makeKpiRow()]);
const addKpi    = () => kpiRows.value.push(makeKpiRow());
const removeKpi = (i: number) => kpiRows.value.splice(i, 1);

// ── Competency rows ────────────────────────────────────────────────────
interface CompetencyRow { subject: string; weight: string; target_option: number | null; options: string[]; }
const makeCompRow = (): CompetencyRow => ({ subject: '', weight: '', target_option: 3, options: ['', '', '', '', ''] });
const competencyRows = ref<CompetencyRow[]>([makeCompRow()]);
const addCompetency    = () => competencyRows.value.push(makeCompRow());
const removeCompetency = (i: number) => competencyRows.value.splice(i, 1);

// Indices (1..5) of option slots that have non-empty text. The target dropdown
// shows only these — selecting an empty slot would be meaningless.
const availableTargetIndices = (row: { options: string[] }): number[] =>
    row.options
        .map((v, i) => (v && v.trim() !== '' ? i + 1 : null))
        .filter((x): x is number => x !== null);

// Running sum of item weights (must equal 1.00 to save). Shown live next to
// section headers so the admin sees the running total as they edit.
const kpiWeightSum        = computed(() =>
    kpiRows.value.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0));
const competencyWeightSum = computed(() =>
    competencyRows.value.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0));
// Tolerance for float-equality on 0.01-stepped inputs (e.g. 0.3+0.7 = 0.9999…)
const WEIGHT_SUM_EPS = 0.001;
const isKpiWeightSumValid        = computed(() => Math.abs(kpiWeightSum.value - 1) < WEIGHT_SUM_EPS);
const isCompetencyWeightSumValid = computed(() => Math.abs(competencyWeightSum.value - 1) < WEIGHT_SUM_EPS);

// ── Validation ─────────────────────────────────────────────────────────
const validate = (): boolean => {
    Object.keys(errors).forEach(k => (errors as any)[k] = '');
    let valid = true;

    if (!form.name.trim())          { errors.name     = 'กรุณากรอกชื่อแบบประเมิน';      valid = false; }
    if (form.year_id === null)      { errors.year     = 'กรุณาเลือกรอบปีการประเมิน';     valid = false; }
    if (form.cycle_id === null)     { errors.cycle    = 'กรุณาเลือกรอบการประเมิน';       valid = false; }
    if (form.position_id === null)  { errors.position = 'กรุณาเลือกตำแหน่ง';             valid = false; }

    const kw = parseFloat(form.kpiWeight);
    const cw = parseFloat(form.competencyWeight);

    if (form.type === 'competency_360') {
        // DB constraint: kpi=0, comp=100
        if (kw !== 0)   { errors.weights = 'Competency 360° ต้องมี KPI weight = 0';        valid = false; }
        if (cw !== 100) { errors.weights = 'Competency 360° ต้องมี Competency weight = 100'; valid = false; }
    } else {
        if (!Number.isFinite(kw) || kw < 0 || kw > 100) { errors.weights = 'สัดส่วน KPI ต้องอยู่ระหว่าง 0-100'; valid = false; }
        if (!Number.isFinite(cw) || cw < 0 || cw > 100) { errors.weights = 'สัดส่วน Competency ต้องอยู่ระหว่าง 0-100'; valid = false; }
        // DB constraint: weights must sum exactly to 100 for annual_*
        if (Number.isFinite(kw) && Number.isFinite(cw) && (kw + cw) !== 100) {
            errors.weights = 'ผลรวมสัดส่วน KPI + Competency ต้องเท่ากับ 100';
            valid = false;
        }
    }

    // KPIs: required only when assessment has KPI (annual_*)
    if (form.type !== 'competency_360') {
        if (kpiRows.value.length === 0) { errors.kpis = 'ต้องมี KPI อย่างน้อย 1 ข้อ'; valid = false; }
        for (let i = 0; i < kpiRows.value.length; i++) {
            const r = kpiRows.value[i];
            if (!r.subject.trim())       { errors.kpis = `KPI ข้อที่ ${i + 1}: กรุณากรอกหัวข้อ`; valid = false; break; }
            const w = parseFloat(r.weight);
            if (!Number.isFinite(w) || w < 0 || w > 1) {
                errors.kpis = `KPI ข้อที่ ${i + 1}: น้ำหนักต้องอยู่ระหว่าง 0-1`;
                valid = false; break;
            }
            if (r.target_option != null) {
                if (!Number.isInteger(r.target_option) || r.target_option < 1 || r.target_option > 5) {
                    errors.kpis = `KPI ข้อที่ ${i + 1}: เป้าหมายต้องเป็นตัวเลือก 1-5`;
                    valid = false; break;
                }
                const slot = r.options[r.target_option - 1];
                if (!slot || slot.trim() === '') {
                    errors.kpis = `KPI ข้อที่ ${i + 1}: ตัวเลือกที่ ${r.target_option} ว่าง กรุณากรอกข้อความหรือเลือกเป้าหมายอื่น`;
                    valid = false; break;
                }
            }
        }
        // Sum of KPI item weights must equal 1.00 (exactly, with float tolerance).
        if (!errors.kpis && kpiRows.value.length > 0 && !isKpiWeightSumValid.value) {
            errors.kpis = `ผลรวมน้ำหนัก KPI ต้องเท่ากับ 1.00 (ปัจจุบัน ${kpiWeightSum.value.toFixed(2)})`;
            valid = false;
        }
    }
    // Competencies similar
    if (competencyRows.value.length === 0) { errors.competencies = 'ต้องมี Competency อย่างน้อย 1 ข้อ'; valid = false; }
    for (let i = 0; i < competencyRows.value.length; i++) {
        const r = competencyRows.value[i];
        if (!r.subject.trim())       { errors.competencies = `Competency ข้อที่ ${i + 1}: กรุณากรอกหัวข้อ`; valid = false; break; }
        const w = parseFloat(r.weight);
        if (!Number.isFinite(w) || w < 0 || w > 1) {
            errors.competencies = `Competency ข้อที่ ${i + 1}: น้ำหนักต้องอยู่ระหว่าง 0-1`;
            valid = false; break;
        }
        if (r.target_option != null) {
            if (!Number.isInteger(r.target_option) || r.target_option < 1 || r.target_option > 5) {
                errors.competencies = `Competency ข้อที่ ${i + 1}: เป้าหมายต้องเป็นตัวเลือก 1-5`;
                valid = false; break;
            }
            const slot = r.options[r.target_option - 1];
            if (!slot || slot.trim() === '') {
                errors.competencies = `Competency ข้อที่ ${i + 1}: ตัวเลือกที่ ${r.target_option} ว่าง กรุณากรอกข้อความหรือเลือกเป้าหมายอื่น`;
                valid = false; break;
            }
        }
    }
    // Sum of Competency item weights must equal 1.00.
    if (!errors.competencies && competencyRows.value.length > 0 && !isCompetencyWeightSumValid.value) {
        errors.competencies = `ผลรวมน้ำหนัก Competency ต้องเท่ากับ 1.00 (ปัจจุบัน ${competencyWeightSum.value.toFixed(2)})`;
        valid = false;
    }
    return valid;
};

// ── Build payload ──────────────────────────────────────────────────────
const buildKpiPayload = () =>
    kpiRows.value.map((r, i) => ({
        sort_order:    i + 1,
        subject:       r.subject.trim(),
        detail:        r.detail.trim() || null,
        weight:        parseFloat(r.weight),
        target_option: r.target_option,
        options:       r.options.map(o => (o ?? '').toString()),
    }));

const buildCompetencyPayload = () =>
    competencyRows.value.map((r, i) => ({
        sort_order:    i + 1,
        subject:       r.subject.trim(),
        weight:        parseFloat(r.weight),
        target_option: r.target_option,
        options:       r.options.map(o => (o ?? '').toString()),
    }));

const handleApiError = (e: unknown) => {
    const err = e as PmsApiError;
    if (err.status === 403) serverError.value = 'ไม่มีสิทธิ์บันทึกข้อมูล (admin เท่านั้น)';
    else if (err.status === 422) serverError.value = err.message || 'ข้อมูลไม่ถูกต้อง';
    else if (err.status === 409) serverError.value = err.message || 'ข้อมูลซ้ำในระบบ';
    else serverError.value = err.message || 'บันทึกไม่สำเร็จ';
};

const handleSubmit = async () => {
    serverError.value = '';
    if (!validate()) return;

    submitting.value = true;
    try {
        const body = {
            name: form.name.trim(),
            type: form.type,
            year_id: form.year_id as number,
            cycle_id: form.cycle_id as number,
            position_id: form.position_id as number,
            level_id: form.level_id ?? null,
            criteria_id: form.criteria_id ?? null,
            kpi_weight: parseFloat(form.kpiWeight),
            competency_weight: parseFloat(form.competencyWeight),
            is_active: form.is_active,
            // Competency 360° has no KPI items
            kpis: form.type === 'competency_360' ? [] : buildKpiPayload(),
            competencies: buildCompetencyPayload(),
        };
        if (isEditMode.value && editId.value !== null) {
            await assessmentsApi.update(editId.value, body);
        } else {
            await assessmentsApi.create(body);
        }
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
            router.push('/pms/settings/assessment');
        }, 800);
    } catch (e) {
        handleApiError(e);
    } finally {
        submitting.value = false;
    }
};

const handleClear = () => {
    form.type = 'annual_supervisor';
    form.name = '';
    form.year_id = null; form.cycle_id = null; form.position_id = null;
    form.level_id = null; form.criteria_id = null;
    form.kpiWeight = '50'; form.competencyWeight = '50'; form.is_active = true;
    kpiRows.value = [makeKpiRow()];
    competencyRows.value = [makeCompRow()];
    Object.keys(errors).forEach(k => (errors as any)[k] = '');
    serverError.value = '';
};

onMounted(async () => {
    // Load all master data in parallel
    try {
        const [y, c, p, l, cr] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
            positionsApi.list({ limit: 500 }),
            levelsApi.list({ limit: 100 }),
            criteriaApi.list({ limit: 200 }),
        ]);
        yearOptions.value     = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value    = c.data;
        positionOptions.value = p.data;
        levelOptions.value    = l.data;
        criteriaOptions.value = cr.data;
    } catch (e) {
        console.warn('[assessment/add] failed to load masters', e);
    }

    // Edit mode → load full assessment with KPIs + Competencies
    if (isEditMode.value && editId.value !== null) {
        try {
            const res = await assessmentsApi.get(editId.value);
            const a = res.data;
            // Coerce legacy 'annual_self' rows to 'annual_supervisor' on display.
            // DB migration on 2026-05-22 swept all of them, but coerce defensively
            // in case any slip in via direct SQL or an older client.
            const rawType = a.type ?? 'annual_supervisor';
            form.type = (rawType === 'annual_self' ? 'annual_supervisor' : rawType) as AssessmentType;
            form.name             = a.name;
            form.year_id          = a.year_id;
            form.cycle_id         = a.cycle_id;
            form.position_id      = a.position_id;
            form.level_id         = a.level_id;
            form.criteria_id      = a.criteria_id;
            form.kpiWeight        = String(a.kpi_weight);
            form.competencyWeight = String(a.competency_weight);
            form.is_active        = a.is_active;

            kpiRows.value = (a.kpis ?? []).map(k => ({
                subject:       k.subject,
                detail:        k.detail ?? '',
                weight:        String(k.weight),
                target_option: k.target_option ?? null,    // preserve server NULL on load; only new rows default to 3
                options:       padOptions(k.options),
            }));
            if (kpiRows.value.length === 0) kpiRows.value = [makeKpiRow()];

            competencyRows.value = (a.competencies ?? []).map(c => ({
                subject:       c.subject,
                weight:        String(c.weight),
                target_option: c.target_option ?? null,
                options:       padOptions(c.options),
            }));
            if (competencyRows.value.length === 0) competencyRows.value = [makeCompRow()];
        } catch (e) {
            serverError.value = (e as PmsApiError).message || 'โหลดข้อมูลไม่สำเร็จ';
        }
    }
});

// Pad options array to length 5 (UI fixed at 5 slots)
function padOptions(opts: string[] | undefined): string[] {
    const arr = (opts ?? []).slice(0, 5);
    while (arr.length < 5) arr.push('');
    return arr;
}
</script>
