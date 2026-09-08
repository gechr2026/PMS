<!--
  AdminSidebarNav — sidebar entries that exist only in the admin build.

  This file sits outside every Nuxt auto-scan directory and is reached only
  through the `__PMS_ADMIN__` branch in layouts/pms-layout.vue. In the staff
  build that constant folds to false, the dynamic import is dropped, and no
  admin URL survives anywhere in the bundle.

  The role checks below are kept even so: the admin build is the full app, and
  a non-admin signing in there must still not see these links.
  See docs/superpowers/specs/2026-09-08-admin-build-separation-design.md
-->
<template>
    <template v-if="section === 'reports'">
                    <NuxtLink v-if="acl.canSeeReportsEdit.value" to="/pms/reports-edit" class="sidebar-link" :class="{ active: $route.path.startsWith('/pms/reports-edit') }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>แก้ไขรายงาน</span>
                    </NuxtLink>
    </template>

    <template v-else-if="section === 'settings' && acl.canSeeSettings.value">
                    <p class="px-2 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">การตั้งค่า</p>
                    <NuxtLink to="/pms/settings/year" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke-linecap="round"/>
                    </svg>
                    <span>รอบปีการประเมินผล</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/cycle" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M21 12A9 9 0 1 1 12 3" stroke-linecap="round"/>
                        <path d="M12 3v5l4-2.5" stroke-linecap="round"/>
                    </svg>
                    <span>รอบการประเมิน</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/department" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="2" y="7" width="6" height="14" rx="1"/><rect x="9" y="2" width="6" height="19" rx="1"/><rect x="16" y="10" width="6" height="11" rx="1"/>
                    </svg>
                    <span>แผนกในองค์กร</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/team" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="2.5" fill-opacity="0.5"/>
                        <path d="M3 17c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke-linecap="round"/>
                        <path d="M15 13c2.5 0 4.5 1.3 4.5 4" stroke-linecap="round"/>
                    </svg>
                    <span>ทีม</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/position" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="7" y="2" width="10" height="6" rx="2"/><path d="M12 8v4M7 14h10M5 14v6h14v-6" stroke-linecap="round"/>
                    </svg>
                    <span>ตำแหน่งงาน</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/level" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M4 20h16M4 14h10M4 8h6" stroke-linecap="round" stroke-width="2.5"/>
                    </svg>
                    <span>ระดับตำแหน่ง</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/employee" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="7" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                    </svg>
                    <span>ข้อมูลพนักงาน</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/criteria" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
                    </svg>
                    <span>เกณฑ์การประเมินผล</span>
                </NuxtLink>
                <NuxtLink to="/pms/settings/assessment" class="sidebar-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke-linecap="round"/>
                    </svg>
                    <span>แบบประเมิน</span>
                </NuxtLink>
                    <NuxtLink to="/pms/settings/send" class="sidebar-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>การส่งแบบประเมิน</span>
                    </NuxtLink>
    </template>
</template>

<script lang="ts" setup>
defineProps<{ section: 'reports' | 'settings' }>();

const acl = usePmsAcl();
</script>
