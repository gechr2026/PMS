<template>
    <div class="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col" style="background: linear-gradient(135deg, #b8d4f0 0%, #c8e0f8 40%, #a8c8e8 100%);">

        <!-- Header Bar -->
        <div class="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3">
            <div class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0" style="background: linear-gradient(135deg, #4a90d9 0%, #5b9bd5 100%);">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="7" r="3" fill="white" />
                    <circle cx="15" cy="7" r="2" fill="white" fill-opacity="0.7" />
                    <path d="M3 17c0-3 2.7-5 6-5s6 2 6 5" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M15 13c2 0 4 1 4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M19 10l2 2-2 2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="min-w-0">
                <h1 class="text-gray-800 font-bold text-sm sm:text-base leading-tight truncate">ระบบประเมินผลการปฏิบัติงาน</h1>
                <p class="text-gray-600 text-[10px] sm:text-xs truncate">Performance Management System</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 min-h-0 flex justify-center px-4 sm:px-6 lg:px-10 pt-2 pb-4 sm:pb-6">
            <div class="flex flex-col lg:flex-row w-full max-w-full gap-4 lg:gap-5 lg:h-full lg:max-w-[1100px]">

                <!-- Left Panel — hidden on small screens (decorative only) -->
                <div class="hidden lg:flex lg:flex-[58] min-h-0 bg-white rounded-2xl px-10 pt-8 pb-0 shadow-lg flex-col overflow-hidden">

                    <div class="flex-shrink-0 mb-4">
                        <h2 class="text-3xl font-bold text-gray-800 mb-1">เข้าสู่ระบบ</h2>
                        <p class="text-gray-400 text-sm">ยินดีต้อนรับ</p>
                        <div class="mt-3 border-b border-gray-200"></div>
                    </div>

                    <div class="flex-shrink-0 mb-4">
                        <h3 class="text-gray-700 font-semibold text-sm mb-3">กำหนดการ</h3>
                        <div class="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                            <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style="background: #f0f4ff;">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4361ee" stroke-width="1.5" />
                                    <path d="M3 9h18" stroke="#4361ee" stroke-width="1.5" />
                                    <path d="M8 2v4M16 2v4" stroke="#4361ee" stroke-width="1.5" stroke-linecap="round" />
                                    <rect x="7" y="12" width="4" height="3" rx="0.5" fill="#4361ee" />
                                    <rect x="13" y="12" width="4" height="3" rx="0.5" fill="#4361ee" fill-opacity="0.4" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-gray-800 font-semibold text-sm">แบบประเมินผลการปฏิบัติงานประจำปี 2569/1</p>
                                <div class="flex items-center gap-1 mt-1">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#9ca3af" stroke-width="1.5" />
                                        <path d="M3 9h18" stroke="#9ca3af" stroke-width="1.5" />
                                        <path d="M8 2v4M16 2v4" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" />
                                    </svg>
                                    <p class="text-gray-500 text-xs">15 ตุลาคม 2569 - 25 พฤศจิกายน 2569</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 min-h-0 flex items-end justify-center">
                        <img
                            src="/assets/images/s1.png"
                            alt="Illustration"
                            style="width: 100%; max-width: 500px; height: 100%; object-fit: contain; object-position: bottom;"
                        />
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="w-full max-w-md mx-auto lg:max-w-none lg:mx-0 lg:flex-[42] bg-white rounded-2xl px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-0 shadow-lg flex flex-col items-center justify-center">

                    <!-- Mobile-only header (since left panel is hidden) -->
                    <div class="lg:hidden w-full mb-4 text-center">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
                        <p class="text-gray-400 text-xs sm:text-sm">ยินดีต้อนรับ</p>
                    </div>

                    <!-- Company Logo -->
                    <div class="mb-4 sm:mb-6 flex flex-col items-center w-full">
                        <img
                            src="/assets/images/LogoGEC.jpg"
                            alt="GEC Logo"
                            class="mb-3 sm:mb-4 object-contain h-16 sm:h-24 lg:h-44 w-auto max-w-full"
                        />
                        <p class="text-gray-700 font-semibold text-center text-xs sm:text-sm lg:text-base leading-relaxed break-words">
                            บริษัท เจเนอรัล อิเลคทรอนิค คอมเมอร์ช เซอร์วิสเซส จำกัด
                        </p>
                    </div>

                    <!-- ───────── Step 1: email + password ───────── -->
                    <div v-if="step === 'credentials'" class="w-full space-y-4 sm:space-y-5">
                        <div>
                            <label class="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                อีเมล / บัญชีผู้ใช้งาน
                            </label>
                            <input
                                v-model="form.email"
                                type="text"
                                autocomplete="username"
                                placeholder="email@gec.co.th"
                                class="w-full rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                @keyup.enter="handleStart"
                            />
                        </div>

                        <div>
                            <label class="flex flex-wrap items-center gap-x-2 text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">
                                <span class="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                                    </svg>
                                    รหัสผ่าน
                                </span>
                                <span class="text-[10px] sm:text-xs text-gray-400 font-normal">(เฉพาะ admin — ผู้ใช้อื่นเว้นว่าง)</span>
                            </label>
                            <input
                                v-model="form.password"
                                type="password"
                                autocomplete="current-password"
                                class="w-full rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                @keyup.enter="handleStart"
                            />
                        </div>

                        <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                            {{ errorMessage }}
                        </div>

                        <button
                            type="button"
                            class="w-full rounded-xl py-3 sm:py-3.5 text-white font-semibold text-sm tracking-wide transition hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style="background: #1a1a2e;"
                            :disabled="loading"
                            @click="handleStart"
                        >
                            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
                        </button>
                    </div>

                    <!-- ───────── Step 2: OTP ───────── -->
                    <div v-else class="w-full space-y-4 sm:space-y-5">
                        <div class="text-center">
                            <div class="mx-auto mb-3 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full" style="background: #eff6ff;">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke-linecap="round"/>
                                    <polyline points="22,6 12,13 2,6" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <h3 class="text-sm sm:text-base font-bold text-gray-800">ยืนยันตัวตน</h3>
                            <p class="mt-1 text-[11px] sm:text-xs text-gray-500">ระบบส่งรหัส 6 หลักไปที่</p>
                            <p class="mt-1 text-xs sm:text-sm font-semibold text-blue-600 break-all">{{ form.email }}</p>
                        </div>

                        <div>
                            <label class="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2 text-center">รหัสยืนยัน 6 หลัก</label>
                            <input
                                v-model="form.otp"
                                type="text"
                                inputmode="numeric"
                                maxlength="6"
                                autocomplete="one-time-code"
                                class="w-full rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xl sm:text-2xl font-bold text-gray-800 outline-none tracking-[0.3em] sm:tracking-[0.5em] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="000000"
                                @keyup.enter="handleVerify"
                            />
                        </div>

                        <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                            {{ errorMessage }}
                        </div>
                        <div v-if="infoMessage" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            {{ infoMessage }}
                        </div>

                        <button
                            type="button"
                            class="w-full rounded-xl py-3 sm:py-3.5 text-white font-semibold text-sm tracking-wide transition hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            style="background: #1a1a2e;"
                            :disabled="loading || form.otp.length !== 6"
                            @click="handleVerify"
                        >
                            {{ loading ? 'กำลังยืนยัน...' : 'ยืนยัน' }}
                        </button>

                        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <button type="button" class="text-gray-500 hover:text-gray-700" @click="goBackToCredentials">
                                ← เปลี่ยนอีเมล
                            </button>
                            <button type="button" class="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50" :disabled="loading || resendCooldown > 0" @click="handleResend">
                                {{ resendCooldown > 0 ? `ส่งอีกครั้ง (${resendCooldown}s)` : 'ส่งรหัสอีกครั้ง' }}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 text-center px-4 py-3">
            <p class="text-gray-600 text-[10px] sm:text-xs">© 2026 Performance Management System. Powered by General Electronic Commerce Services Co.,Ltd.</p>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PmsAuthError } from '@/composables/useAuth';

useHead({
    title: 'เข้าสู่ระบบ | ระบบประเมินผลการปฏิบัติงาน',
    meta: [
        // Defensive: ensure the viewport meta wins even if a stale build / SSR
        // edge dropped the one from nuxt.config.ts.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    ],
});

definePageMeta({
    layout: false,
});

const router = useRouter();
const route  = useRoute();
const { signIn, verifyOtp } = useAuth();

const form = reactive({
    email: '',
    password: '',
    otp: '',
});

const step = ref<'credentials' | 'otp'>('credentials');
const loading      = ref(false);
const errorMessage = ref('');
const infoMessage  = ref('');
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const startCooldown = (seconds = 30) => {
    resendCooldown.value = seconds;
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        resendCooldown.value--;
        if (resendCooldown.value <= 0 && cooldownTimer) {
            clearInterval(cooldownTimer);
            cooldownTimer = null;
        }
    }, 1000);
};
onUnmounted(() => {
    if (cooldownTimer) clearInterval(cooldownTimer);
});

const redirectAfterLogin = async () => {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await router.push(redirect);
};

const handleApiError = (e: unknown) => {
    if (e instanceof PmsAuthError) {
        errorMessage.value = e.message || 'ไม่สามารถเข้าสู่ระบบได้';
    } else {
        const msg = (e as { message?: string })?.message ?? '';
        errorMessage.value = msg || 'ไม่สามารถเข้าสู่ระบบได้';
    }
};

const handleStart = async () => {
    errorMessage.value = '';
    infoMessage.value  = '';

    const email = form.email.trim().toLowerCase();
    if (!email) {
        errorMessage.value = 'กรุณากรอกอีเมล';
        return;
    }

    loading.value = true;
    try {
        const res = await signIn(email, form.password || undefined);
        if (res.method === 'password') {
            // session already installed by useAuth
            await redirectAfterLogin();
        } else if (res.method === 'otp') {
            step.value = 'otp';
            infoMessage.value = res.message || 'ระบบส่งรหัส 6 หลักไปทางอีเมลแล้ว';
            startCooldown(30);
        } else {
            // unknown — message says "if email exists, OTP sent" — show same UX
            errorMessage.value = res.message || 'ไม่พบบัญชีอีเมลนี้';
        }
    } catch (e) {
        handleApiError(e);
    } finally {
        loading.value = false;
    }
};

const handleVerify = async () => {
    errorMessage.value = '';
    if (form.otp.length !== 6) {
        errorMessage.value = 'กรุณากรอกรหัสยืนยัน 6 หลัก';
        return;
    }

    loading.value = true;
    try {
        await verifyOtp(form.email.trim().toLowerCase(), form.otp);
        await redirectAfterLogin();
    } catch (e) {
        handleApiError(e);
    } finally {
        loading.value = false;
    }
};

const handleResend = async () => {
    if (resendCooldown.value > 0) return;
    errorMessage.value = '';
    infoMessage.value  = '';
    loading.value = true;
    try {
        const res = await signIn(form.email.trim().toLowerCase(), undefined);
        if (res.method === 'otp') {
            infoMessage.value = res.message || 'ส่งรหัสใหม่แล้ว';
            startCooldown(30);
        }
    } catch (e) {
        handleApiError(e);
    } finally {
        loading.value = false;
    }
};

const goBackToCredentials = () => {
    step.value = 'credentials';
    form.otp = '';
    errorMessage.value = '';
    infoMessage.value  = '';
};
</script>
