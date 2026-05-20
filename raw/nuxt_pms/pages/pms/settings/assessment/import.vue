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
                <h1 class="text-lg font-bold text-gray-800">แบบประเมิน - นำเข้า</h1>
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

        <!-- Upload Card -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <!-- เลือกไฟล์ -->
            <div class="mb-6">
                <label class="mb-2 block text-sm font-semibold text-gray-700">เลือกไฟล์</label>
                <div class="flex flex-wrap items-center gap-3">
                    <!-- File input (styled) -->
                    <div class="flex flex-1 min-w-0 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <label class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"/>
                                <polyline points="17 8 12 3 7 8" stroke-linecap="round"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round"/>
                            </svg>
                            Choose File
                            <input
                                ref="fileInput"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                class="hidden"
                                @change="onFileChange"
                            />
                        </label>
                        <span class="flex-1 truncate px-3 py-2 text-sm text-gray-400">
                            {{ selectedFileName || 'ไม่ได้เลือกไฟล์' }}
                        </span>
                    </div>

                    <!-- Template Button -->
                    <button
                        type="button"
                        class="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        @click="downloadTemplate"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round"/>
                        </svg>
                        Template
                    </button>
                </div>

                <!-- อัปโหลด button -->
                <div class="mt-3">
                    <button
                        type="button"
                        :disabled="!selectedFileName"
                        class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
                        :class="selectedFileName ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
                        style="background:#4361ee;"
                        @click="handleUpload"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        อัปโหลด
                    </button>
                </div>
            </div>

            <!-- Preview Table (shown after upload) -->
            <div v-if="previewData.length > 0" class="mb-6">
                <div class="overflow-x-auto rounded-xl border border-gray-200">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-14 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่อแบบประเมิน</th>
                                <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบปีประเมิน</th>
                                <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">รอบการประเมิน</th>
                                <th class="w-36 px-4 py-3 text-center font-semibold text-gray-700">ทีม</th>
                                <th class="w-28 px-4 py-3 text-center font-semibold text-gray-700">ระดับตำแหน่ง</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(row, index) in previewData"
                                :key="index"
                                class="border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                                <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-gray-800">{{ row.name }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.year }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.cycle }}</td>
                                <td class="max-w-[9rem] truncate px-4 py-3 text-center text-gray-600" :title="row.team">{{ row.team }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.level }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="mt-2 text-xs text-gray-400">พบข้อมูลทั้งหมด {{ previewData.length }} รายการ</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 border-t border-gray-100 pt-5">
                <button
                    type="button"
                    :disabled="previewData.length === 0"
                    class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
                    :class="previewData.length > 0 ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'"
                    style="background:#4361ee;"
                    @click="handleSave"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 21v-8H7v8M7 3v5h8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    บันทึก
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
                นำเข้าข้อมูลสำเร็จ {{ previewData.length }} รายการ
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

useHead({ title: 'นำเข้าแบบประเมิน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

interface PreviewRow { name: string; year: string; cycle: string; team: string; level: string; }

const fileInput       = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const previewData     = ref<PreviewRow[]>([]);
const showToast       = ref(false);

// Mock preview data — จริงๆ parse จากไฟล์ xlsx ที่อัปโหลด
const mockPreview: PreviewRow[] = [
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Human Resource (Officer)',    year: '2569', cycle: '1/2569', team: 'Human Resource',        level: 'Officer'    },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Human Resource (Supervisor)', year: '2569', cycle: '1/2569', team: 'Human Resource',        level: 'Supervisor' },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Accounting (Officer)',         year: '2569', cycle: '1/2569', team: 'Accounting Team',        level: 'Officer'    },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Accounting (Supervisor)',      year: '2569', cycle: '1/2569', team: 'Accounting Team',        level: 'Supervisor' },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Admin (Officer)',              year: '2569', cycle: '1/2569', team: 'Admin Team',             level: 'Officer'    },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Finance (Executive)',          year: '2569', cycle: '1/2569', team: 'Finance Team',           level: 'Executive'  },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Finance (Manager)',            year: '2569', cycle: '1/2569', team: 'Finance Team',           level: 'Manager'    },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Legacy (Manager)',             year: '2569', cycle: '1/2569', team: 'Legacy',                 level: 'Manager'    },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Legacy (Supervisor)',          year: '2569', cycle: '1/2569', team: 'Legacy',                 level: 'Supervisor' },
    { name: 'ประเมินผลการปฏิบัติงานประจำปี 2569 - Legacy (Officer)',             year: '2569', cycle: '1/2569', team: 'Legacy',                 level: 'Officer'    },
];

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        selectedFileName.value = input.files[0].name;
        previewData.value = [];
    }
};

const handleUpload = () => {
    if (!selectedFileName.value) return;
    // TODO: parse xlsx with SheetJS
    previewData.value = [...mockPreview];
};

const downloadTemplate = () => {
    // TODO: generate template xlsx
    // Columns: ชื่อแบบประเมิน, รอบปีการประเมิน, รอบการประเมิน, ตำแหน่ง, สัดส่วน KPI, สัดส่วน Competency, เกณฑ์การประเมิน
    alert('ดาวน์โหลด Template สำเร็จ (assessment_template.xlsx)');
};

const handleSave = () => {
    if (previewData.value.length === 0) return;
    // TODO: call API
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
        router.push('/pms/settings/assessment');
    }, 1800);
};

const handleClear = () => {
    selectedFileName.value = '';
    previewData.value = [];
    if (fileInput.value) fileInput.value.value = '';
};
</script>
