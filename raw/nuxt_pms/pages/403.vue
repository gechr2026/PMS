<template>
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div class="text-6xl font-bold text-gray-300">403</div>
        <h1 class="mt-2 text-xl font-bold text-gray-700">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p class="mt-1 text-sm text-gray-500">
            บัญชี
            <span class="font-semibold text-gray-700">{{ profile?.role ?? '—' }}</span>
            ของคุณไม่ได้รับอนุญาตให้ดูหน้านี้
        </p>
        <NuxtLink
            to="/"
            class="mt-6 flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style="background:#4361ee;"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            กลับสู่แดชบอร์ด
        </NuxtLink>
    </div>
</template>

<script lang="ts" setup>
const { profile } = useAuth();

useHead({ title: 'ไม่มีสิทธิ์เข้าถึง | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });
</script>
