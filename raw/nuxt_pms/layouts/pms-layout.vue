<template>
    <div class="flex min-h-screen bg-gray-50">
        <!-- Sidebar Overlay (mobile) -->
        <div
            v-if="sidebarOpen"
            class="fixed inset-0 z-40 bg-black/40 lg:hidden"
            @click="sidebarOpen = false"
        ></div>

        <!-- Sidebar -->
        <aside
            class="fixed top-0 left-0 z-50 flex h-screen w-60 flex-col bg-white shadow-md transition-transform duration-300"
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        >
            <!-- Logo -->
            <div class="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0" style="background: linear-gradient(135deg,#4361ee,#5b9bd5);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="7" r="3" fill="white"/>
                        <circle cx="15.5" cy="7.5" r="2" fill="white" fill-opacity="0.65"/>
                        <path d="M3 17c0-3 2.7-5 6-5s6 2 6 5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M15 13c2.2 0 4 1.2 4 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div>
                    <p class="text-xs font-bold leading-tight text-gray-800">Performance Management</p>
                    <p class="text-xs text-gray-500 leading-tight">System</p>
                </div>
            </div>

            <!-- Menu -->
            <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-sm">
                <!-- แดชบอร์ด -->
                <p class="px-2 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">แดชบอร์ด</p>
                <NuxtLink to="/" class="sidebar-link" :class="{ active: $route.path === '/' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="8" rx="1.5"/>
                        <rect x="14" y="3" width="7" height="4" rx="1.5"/>
                        <rect x="14" y="11" width="7" height="10" rx="1.5"/>
                        <rect x="3" y="15" width="7" height="6" rx="1.5"/>
                    </svg>
                    <span>แดชบอร์ด</span>
                </NuxtLink>

                <!-- การประเมินผล -->
                <p class="px-2 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">การประเมินผล</p>
                <NuxtLink to="/pms/assigned" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/assigned') }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <path d="M9 7h6M9 11h6M9 15h4" stroke-linecap="round"/>
                    </svg>
                    <span>งานที่ได้รับมอบหมาย</span>
                </NuxtLink>
                <NuxtLink to="/pms/evaluation" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/evaluation') }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 3" stroke-linecap="round"/>
                    </svg>
                    <span>ผลการประเมิน</span>
                </NuxtLink>
                <NuxtLink v-if="acl.canSeeCompare.value" to="/pms/compare" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/compare') }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M8 6h13M8 12h9M8 18h7"/>
                        <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
                        <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
                    </svg>
                    <span>เปรียบเทียบผลการประเมิน</span>
                </NuxtLink>

                <!-- รายงานและสรุปผล -->
                <template v-if="acl.canSeeTracking.value || acl.canSeeSummary.value || acl.canSeeReports.value || acl.canSeeReportsEdit.value">
                    <p class="px-2 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">รายงานและสรุปผล</p>
                    <NuxtLink v-if="acl.canSeeTracking.value" to="/pms/report/tracking" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/report/tracking') }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M22 12A10 10 0 1 1 12 2" stroke-linecap="round"/>
                            <path d="M22 2L12 12M22 2h-6M22 2v6" stroke-linecap="round"/>
                        </svg>
                        <span>ติดตามภาระงานประเมิน</span>
                    </NuxtLink>
                    <NuxtLink v-if="acl.canSeeSummary.value" to="/pms/summary" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/summary') }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                        </svg>
                        <span>สรุปผลการประเมิน</span>
                    </NuxtLink>
                    <NuxtLink v-if="acl.canSeeReports.value" to="/pms/reports" class="sidebar-link" :class="{ active: $route.path === '/pms/reports' }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="5" y="2" width="14" height="20" rx="2"/>
                            <path d="M9 7h6M9 11h6M9 15h6" stroke-linecap="round"/>
                        </svg>
                        <span>รายงาน</span>
                    </NuxtLink>
                    <ClientOnly><component :is="AdminNav" v-if="AdminNav" section="reports" /></ClientOnly>
                </template>

                <ClientOnly><component :is="AdminNav" v-if="AdminNav" section="settings" /></ClientOnly>
            </nav>
        </aside>

        <!-- Main area -->
        <div class="flex flex-1 flex-col lg:ml-60">
            <!-- Header -->
            <header class="sticky top-0 z-30 flex items-center justify-between bg-white px-5 py-3 shadow-sm border-b border-gray-100">
                <button
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition lg:hidden"
                    @click="sidebarOpen = !sidebarOpen"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/>
                    </svg>
                </button>
                <button
                    class="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition border border-blue-200"
                    @click="sidebarOpen = !sidebarOpen"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/>
                    </svg>
                </button>

                <div class="flex items-center gap-3 ml-auto">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <span class="hidden sm:inline">{{ profile?.full_name || profile?.username || profile?.email || 'ผู้ใช้งาน' }}</span>
                        <span v-if="profile?.role" class="hidden md:inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600">{{ profile.role }}</span>
                    </div>
                    <button
                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
                        @click="handleLogout"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 p-6">
                <NuxtPage />
            </main>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { profile, signOut } = useAuth();
const acl = usePmsAcl();

// Admin-only sidebar entries live outside every auto-scan directory and are
// reached only through this branch. `__PMS_ADMIN__` folds to false in the staff
// build, so the import — and the chunk behind it — is dropped entirely.
//
// The mount points are wrapped in <ClientOnly>: SSR renders an async component
// by awaiting it, but on the client hydration starts before the chunk has
// loaded, so the server's markup meets a placeholder and Vue reports
// "Hydration completed but contains mismatches". Rendering it after mount
// sidesteps that. The rest of this sidebar is already effectively client-only —
// every acl.canSee* flag reads a profile that is loaded from localStorage.
const AdminNav = __PMS_ADMIN__
    ? defineAsyncComponent(() => import('~/admin/AdminSidebarNav.vue'))
    : null;

const sidebarOpen = ref(false);

const handleLogout = async () => {
    await signOut();
    await router.push('/auth/login');
};
</script>
