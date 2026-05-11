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
                <h1 class="text-lg font-bold text-gray-800">ข้อมูลพนักงาน - นำเข้า</h1>
            </div>
            <NuxtLink
                to="/pms/settings/employee"
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
                        <label
                            class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
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
                        <span class="flex-1 truncate px-3 py-2 text-sm text-gray-500">
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
                            <polyline points="10 9 9 9 8 9" stroke-linecap="round"/>
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
                        :class="selectedFileName
                            ? 'hover:opacity-90 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'"
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

            <!-- Preview Table -->
            <div v-if="previewData.length > 0" class="mb-6">
                <div class="overflow-x-auto rounded-xl border border-gray-200">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                                <th class="w-16 px-4 py-3 text-center font-semibold text-gray-700">ลำดับ</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-700">ชื่อบัญชี</th>
                                <th class="w-32 px-4 py-3 text-center font-semibold text-gray-700">รหัสพนักงาน</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-700">ตำแหน่ง</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-700">ทีม</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-700">แผนก</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(row, index) in previewData"
                                :key="index"
                                class="border-b border-gray-100 hover:bg-gray-50 transition"
                                :class="row.hasError ? 'bg-red-50' : ''"
                            >
                                <td class="px-4 py-3 text-center text-gray-600">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-center text-gray-800">{{ row.username }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.empCode }}</td>
                                <td class="px-4 py-3 text-center text-gray-800">{{ row.fullName }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.position }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.team }}</td>
                                <td class="px-4 py-3 text-center text-gray-600">{{ row.dept }}</td>
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

useHead({ title: 'นำเข้าข้อมูลพนักงาน | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

interface PreviewRow {
    username: string; empCode: string; fullName: string;
    position: string; team: string; dept: string; hasError?: boolean;
}

const fileInput      = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const previewData    = ref<PreviewRow[]>([]);
const showToast      = ref(false);

// Mock preview data — จริงๆ parse จากไฟล์ xlsx ที่อัปโหลด
const mockPreview: PreviewRow[] = [
    { username: 'somchai.jai@gec.co.th',  empCode: 'GEC578', fullName: 'สมชาย ใจดี',          position: '', team: 'Management',           dept: 'Management'         },
    { username: 'niti.rak@gec.co.th',      empCode: 'GEC489', fullName: 'นิติ รักงาน',          position: '', team: 'Non-bank',             dept: 'Business Generator' },
    { username: 'opas.kay@gec.co.th',      empCode: 'GEC523', fullName: 'โอภาส ขยันกิจ',        position: '', team: 'Supply Chain Finance', dept: 'Business Generator' },
    { username: 'nipa.rak@gec.co.th',      empCode: 'GEC433', fullName: 'นิภา รักดี',            position: '', team: 'e-Commerce',           dept: 'Business Generator' },
    { username: 'sommai.mee@gec.co.th',    empCode: 'GEC635', fullName: 'สมหมาย มีดี',          position: '', team: 'Digital Order 2 Cash', dept: 'Business Generator' },
    { username: 'arsar.kha@gec.co.th',     empCode: 'GEC611', fullName: 'อาสา ขยันงาน',         position: '', team: 'Digital excellence',   dept: 'Digital excellence' },
    { username: 'itthipol.moo@gec.co.th',  empCode: 'GEC698', fullName: 'อิทธิพล มุ่งทำดี',     position: '', team: 'Application Excellence', dept: 'Digital excellence' },
    { username: 'kingkan.roo@gec.co.th',   empCode: 'GEC510', fullName: 'กิ่งกาญจน์ รุ่งเรือง',  position: '', team: 'Application Support',  dept: 'Digital excellence' },
    { username: 'piti.suk@gec.co.th',      empCode: 'GEC602', fullName: 'ปิติ สุขใจ',            position: '', team: 'Quality Assurance',    dept: 'Digital excellence' },
    { username: 'dendow.saw@gec.co.th',    empCode: 'GEC622', fullName: 'เด่นดาว สว่างศรี',      position: '', team: 'Innovation Initiative', dept: 'Digital excellence' },
];

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        selectedFileName.value = input.files[0].name;
        // Reset preview when new file selected
        previewData.value = [];
    }
};

const handleUpload = () => {
    if (!selectedFileName.value) return;
    // TODO: parse xlsx file using SheetJS
    // For now, show mock preview data
    previewData.value = [...mockPreview];
};

const downloadTemplate = () => {
    // TODO: generate and download xlsx template file
    // Template columns: ชื่อบัญชี, รหัสพนักงาน, หมายเลขบัตรประชาชน, ชื่อ-นามสกุล, แผนก, ทีม, ตำแหน่ง
    alert('ดาวน์โหลด Template สำเร็จ (employee_template.xlsx)');
};

const handleSave = () => {
    if (previewData.value.length === 0) return;
    // TODO: call API to save all preview rows
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
        router.push('/pms/settings/employee');
    }, 1800);
};

const handleClear = () => {
    selectedFileName.value = '';
    previewData.value = [];
    if (fileInput.value) fileInput.value.value = '';
};
</script>
