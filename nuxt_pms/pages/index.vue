<template>
    <div>
        <!-- Page Title -->
        <div class="flex items-center gap-2 mb-6">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:#eff2ff;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4361ee" stroke-width="1.8">
                    <rect x="3" y="3" width="7" height="8" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="4" rx="1.5"/>
                    <rect x="14" y="11" width="7" height="10" rx="1.5"/>
                    <rect x="3" y="15" width="7" height="6" rx="1.5"/>
                </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-800">แดชบอร์ด</h1>
        </div>

        <!-- Filters -->
        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-end gap-6">
                <div class="min-w-[180px]">
                    <label class="mb-1 block text-xs font-semibold text-gray-600">รอบปีการประเมิน</label>
                    <select
                        v-model="filterYearId"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        @change="onYearChange"
                    >
                        <option :value="null">ทั้งหมด</option>
                        <option v-for="y in yearOptions" :key="y.id" :value="y.id">{{ y.year }}</option>
                    </select>
                </div>
                <div class="min-w-[180px]">
                    <label class="mb-1 block text-xs font-semibold text-gray-600">รอบการประเมิน</label>
                    <select
                        v-model="filterCycleId"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    >
                        <option :value="null">ทั้งหมด</option>
                        <option v-for="c in filteredCycleOptions" :key="c.id" :value="c.id">{{ c.cycle_label }}</option>
                    </select>
                </div>
                <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    style="background:#4361ee;"
                    :disabled="loading"
                    @click="fetchDashboard"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                    {{ loading ? 'กำลังโหลด...' : 'ค้นหา' }}
                </button>
                <span v-if="data?.generated_at" class="ml-auto text-xs text-gray-400">
                    อัพเดตล่าสุด: {{ formatTime(data.generated_at) }}
                </span>
            </div>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button class="text-red-500 hover:text-red-700" @click="errorMessage = ''">×</button>
        </div>

        <!-- Stat Cards -->
        <div class="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div class="rounded-xl p-5 text-white" style="background:#4361ee;">
                <p class="text-sm font-medium opacity-90">จำนวนงานที่ได้รับมอบหมาย</p>
                <p class="mt-3 text-5xl font-bold">{{ data?.stats.total ?? 0 }}</p>
            </div>
            <div class="rounded-xl p-5 text-white" style="background:#e7515a;">
                <p class="text-sm font-medium opacity-90">จำนวนงานที่ยังไม่ได้ทำ</p>
                <p class="mt-3 text-5xl font-bold">{{ data?.stats.pending ?? 0 }}</p>
            </div>
            <div class="rounded-xl p-5 text-white" style="background:#e2a03f;">
                <p class="text-sm font-medium opacity-90">จำนวนงานที่อยู่ระหว่างทำ</p>
                <p class="mt-3 text-5xl font-bold">{{ data?.stats.in_progress ?? 0 }}</p>
            </div>
            <div class="rounded-xl p-5 text-white" style="background:#00ab55;">
                <p class="text-sm font-medium opacity-90">จำนวนงานที่เสร็จแล้ว</p>
                <p class="mt-3 text-5xl font-bold">{{ data?.stats.done ?? 0 }}</p>
            </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <!-- Donut Chart -->
            <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 class="mb-4 text-sm font-bold text-gray-800">ความคืบหน้าทั้งองค์กร</h2>
                <client-only>
                    <div v-if="!hasData" class="flex h-[280px] items-center justify-center text-gray-400 text-sm">
                        ยังไม่มีข้อมูลสำหรับแสดงผล
                    </div>
                    <apexchart
                        v-else
                        type="donut"
                        height="280"
                        :options="donutOptions"
                        :series="donutSeries"
                    />
                    <template #fallback>
                        <div class="flex h-[280px] items-center justify-center text-gray-400 text-sm">กำลังโหลด...</div>
                    </template>
                </client-only>
            </div>

            <!-- Horizontal Stacked Bar Chart -->
            <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 class="mb-4 text-sm font-bold text-gray-800">ความคืบหน้าแต่ละแผนก</h2>
                <client-only>
                    <div v-if="deptCategories.length === 0" class="flex h-[280px] items-center justify-center text-gray-400 text-sm">
                        ยังไม่มีข้อมูลแผนก
                    </div>
                    <apexchart
                        v-else
                        type="bar"
                        height="280"
                        :options="hBarOptions"
                        :series="hBarSeries"
                    />
                    <template #fallback>
                        <div class="flex h-[280px] items-center justify-center text-gray-400 text-sm">กำลังโหลด...</div>
                    </template>
                </client-only>
            </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-sm font-bold text-gray-800">คะแนนเฉลี่ยของแต่ละแผนก</h2>
            <client-only>
                <div v-if="avgScoreCategories.length === 0" class="flex h-[300px] items-center justify-center text-gray-400 text-sm">
                    ยังไม่มีคะแนนเฉลี่ย
                </div>
                <apexchart
                    v-else
                    type="bar"
                    height="300"
                    :options="avgBarOptions"
                    :series="avgBarSeries"
                />
                <template #fallback>
                    <div class="flex h-[300px] items-center justify-center text-gray-400 text-sm">กำลังโหลด...</div>
                </template>
            </client-only>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PmsApiError } from '@/composables/usePmsApi';
import type { PmsDashboardPayload } from '@/composables/usePmsDashboard';
import type { PmsYear } from '@/composables/usePmsYears';
import type { PmsCycle } from '@/composables/usePmsCycles';

useHead({ title: 'แดชบอร์ด | ระบบประเมินผลการปฏิบัติงาน' });
definePageMeta({ layout: 'pms-layout' });

const dashboardApi = usePmsDashboard();
const yearsApi     = usePmsYears();
const cyclesApi    = usePmsCycles();

// ── Filters ────────────────────────────────────────────────────
const filterYearId  = ref<number | null>(null);
const filterCycleId = ref<number | null>(null);

const yearOptions   = ref<PmsYear[]>([]);
const cycleOptions  = ref<PmsCycle[]>([]);

const filteredCycleOptions = computed(() => {
    if (filterYearId.value === null) return cycleOptions.value;
    return cycleOptions.value.filter(c => c.year_id === filterYearId.value);
});

const onYearChange = () => {
    // Clear cycle when year changes (cascading)
    filterCycleId.value = null;
};

// ── Data ───────────────────────────────────────────────────────
const data         = ref<PmsDashboardPayload | null>(null);
const loading      = ref(false);
const errorMessage = ref('');

const hasData = computed(() => (data.value?.stats.total ?? 0) > 0);

const fetchDashboard = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await dashboardApi.summary({
            year_id:  filterYearId.value ?? undefined,
            cycle_id: filterCycleId.value ?? undefined,
        });
        data.value = res.data;
    } catch (e) {
        errorMessage.value = (e as PmsApiError).message || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้';
        data.value = null;
    } finally {
        loading.value = false;
    }
};

const fetchMasters = async () => {
    try {
        const [y, c] = await Promise.all([
            yearsApi.list({ limit: 200 }),
            cyclesApi.list({ limit: 500 }),
        ]);
        yearOptions.value  = y.data.slice().sort((a, b) => b.year - a.year);
        cycleOptions.value = c.data;
        // Default to most recent year + cycle if available
        if (yearOptions.value.length > 0 && filterYearId.value === null) {
            filterYearId.value = yearOptions.value[0].id;
            const firstCycle = cycleOptions.value
                .filter(c => c.year_id === filterYearId.value)[0];
            if (firstCycle) filterCycleId.value = firstCycle.id;
        }
    } catch (e) {
        console.warn('[dashboard] failed to load masters', e);
    }
};

// ── Donut Chart ────────────────────────────────────────────────
const donutSeries = computed<number[]>(() => {
    const s = data.value?.stats;
    if (!s) return [0, 0, 0];
    return [s.done, s.in_progress, s.pending];
});
const donutOptions = computed(() => ({
    chart: { type: 'donut', fontFamily: 'Sarabun, Nunito, sans-serif' },
    labels: ['ประเมินเสร็จสิ้นแล้ว', 'อยู่ระหว่างการประเมิน', 'ยังไม่ทำแบบประเมิน'],
    colors: ['#00ab55', '#4361ee', '#bfc9d4'],
    legend: {
        position: 'bottom',
        fontSize: '12px',
        formatter: (val: string, opts: { w: { globals: { series: number[] } }; seriesIndex: number }) =>
            `${val}  ${opts.w.globals.series[opts.seriesIndex]}`,
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Math.round(val)}%`,
    },
    plotOptions: {
        pie: {
            donut: {
                size: '65%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'ทั้งหมด',
                        fontSize: '13px',
                        color: '#374151',
                        formatter: () => String(data.value?.stats.total ?? 0),
                    },
                },
            },
        },
    },
    tooltip: { y: { formatter: (val: number) => `${val} งาน` } },
}));

// ── Horizontal Stacked Bar (per-dept progress %) ───────────────
const deptCategories = computed<string[]>(() =>
    (data.value?.by_department ?? []).map(d => d.department_name ?? '—')
);
const hBarSeries = computed(() => {
    const depts = data.value?.by_department ?? [];
    return [
        { name: 'ประเมินเสร็จสิ้นแล้ว', data: depts.map(d => d.total > 0 ? Math.round((d.done        / d.total) * 100) : 0) },
        { name: 'อยู่ระหว่างการประเมิน', data: depts.map(d => d.total > 0 ? Math.round((d.in_progress / d.total) * 100) : 0) },
        { name: 'ยังไม่ทำแบบประเมิน',   data: depts.map(d => d.total > 0 ? Math.round((d.pending     / d.total) * 100) : 0) },
    ];
});
const hBarOptions = computed(() => ({
    chart: {
        type: 'bar',
        stacked: true,
        stackType: '100%',
        fontFamily: 'Sarabun, Nunito, sans-serif',
        toolbar: { show: false },
    },
    colors: ['#00ab55', '#4361ee', '#bfc9d4'],
    plotOptions: {
        bar: { horizontal: true, barHeight: '60%', borderRadius: 3 },
    },
    xaxis: {
        categories: deptCategories.value,
        labels: { formatter: (val: number) => `${val}%`, style: { fontSize: '11px' } },
    },
    yaxis: { labels: { style: { fontSize: '11px' } } },
    legend: {
        position: 'bottom',
        fontSize: '12px',
        markers: { width: 10, height: 10, radius: 2 },
    },
    dataLabels: {
        enabled: true,
        formatter: (val: number) => (val > 4 ? `${Math.round(val)}%` : ''),
        style: { fontSize: '11px', colors: ['#fff'] },
    },
    tooltip: { y: { formatter: (val: number) => `${val}%` } },
    grid: { borderColor: '#f1f1f1' },
}));

// ── Average Score Bar Chart ────────────────────────────────────
/** Only departments that have at least one composite avg_score */
const deptsWithScore = computed(() =>
    (data.value?.by_department ?? []).filter(d => d.avg_score !== null && d.avg_score !== undefined)
);
const avgScoreCategories = computed(() => deptsWithScore.value.map(d => d.department_name ?? '—'));
const avgBarSeries = computed(() => [
    { name: 'คะแนนเฉลี่ย', data: deptsWithScore.value.map(d => Number(d.avg_score ?? 0)) },
]);
const avgBarOptions = computed(() => ({
    chart: {
        type: 'bar',
        fontFamily: 'Sarabun, Nunito, sans-serif',
        toolbar: { show: false },
    },
    colors: ['#4361ee'],
    plotOptions: {
        bar: { columnWidth: '55%', borderRadius: 6 },
    },
    xaxis: {
        categories: avgScoreCategories.value,
        labels: { style: { fontSize: '11px' } },
    },
    yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: { formatter: (val: number) => `${val}`, style: { fontSize: '11px' } },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f1f1' },
    tooltip: { y: { formatter: (val: number) => `${val} คะแนน` } },
}));

const formatTime = (s: string): string => {
    try {
        const d = new Date(s);
        return d.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return s;
    }
};

onMounted(async () => {
    await fetchMasters();
    await fetchDashboard();
});
</script>
