<script setup>
import { computed, onActivated, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
    BuildingOfficeIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    HomeIcon,
} from '@heroicons/vue/24/outline';

import '@/assets/styles/variables.css';
import ApprovalStatusPanel from '@/modules/owner/components/analytics/ApprovalStatusPanel.vue';
import AnalyticsDashboardState from '@/modules/owner/components/analytics/AnalyticsDashboardState.vue';
import AnalyticsDashboardSummaryCards from '@/modules/owner/components/analytics/AnalyticsDashboardSummaryCards.vue';
import AnalyticsDashboardTopbar from '@/modules/owner/components/analytics/AnalyticsDashboardTopbar.vue';
import RecentReservationsPanel from '@/modules/owner/components/analytics/RecentReservationsPanel.vue';
import RevenueBySegmentCard from '@/modules/owner/components/analytics/RevenueBySegmentCard.vue';
import ReservationOverviewChart from '@/modules/owner/components/analytics/ReservationOverviewChart.vue';
import { useAnalyticsDashboardStore } from '@/modules/owner/store/AnalyticsDashboardStore';

import { useSidebar } from '@/shared/composables/useSidebar';

const dashboardStore = useAnalyticsDashboardStore();
const {
    loading,
    error,
    activeTab,
    monthWindow,
    selectedYear,
    yearOptions,
    selectedYearLabel,
    dashboardData,
    tabs,
    summaryCards,
    visibleMonthlySeries,
    profitPoints,
    profitLinePath,
    profitAreaPath,
    weeklySessions,
    weeklyConversionRates,
    propertyBreakdown,
    segmentBreakdown,
    activityFeed,
    activeReservations,
    maxRevenueValue,
    maxExpenseValue,
    maxWeeklySessions,
    maxWeeklyConversions,
} = storeToRefs(dashboardStore);

const { fetchDashboardData, formatMoney, formatDate, barHeightStyle } = dashboardStore;

const { isSidebarOpen } = useSidebar();

const reservationOverviewChart = computed(() => ({
    labels: visibleMonthlySeries.value.map((item) => item.label),
    data: visibleMonthlySeries.value.map((item) => Number(item.profit) || 0),
}));

const revenueSegments = computed(() => segmentBreakdown.value.map((segment) => ({
    id: segment.id,
    name: segment.name,
    share: segment.share,
    color: segment.color,
})));

const propertyCount = computed(() => dashboardData.value.summary?.totalProperties || 1);

const approvalStatuses = computed(() => {
    const properties = dashboardData.value.properties || [];
    const approved = properties.filter((property) => String(property.status).toLowerCase() === 'approved').length;
    const pending = properties.filter((property) => String(property.status).toLowerCase() === 'pending').length;
    const suspended = Math.max(properties.length - approved - pending, 0);

    return [
        {
            label: 'Approved & Active Listings',
            count: approved,
            tone: 'success',
        },
        {
            label: 'Pending Compliance Audits',
            count: pending,
            tone: 'warning',
        },
        {
            label: 'Draft Mode / Suspended',
            count: suspended,
            tone: 'danger',
        },
    ];
});

const quickLinks = [
    { label: 'Properties Catalog', href: '/owner/properties', icon: 'BuildingOfficeIcon' },
    { label: 'Room Allocator', href: '/owner/rooms', icon: 'HomeIcon' },
    { label: 'Reservations Registry', href: '/owner/reservations', icon: 'CalendarDaysIcon' },
    { label: 'Financial Ledger', href: '/owner/payment-accounts', icon: 'CreditCardIcon' },
];

const iconMap = {
    BuildingOfficeIcon,
    HomeIcon,
    CalendarDaysIcon,
    CreditCardIcon,
};

const animationSeed = ref(0);
const bumpAnimationSeed = () => {
    animationSeed.value += 1;
};

onMounted(() => {
    bumpAnimationSeed();
});

onActivated(() => {
    bumpAnimationSeed();
});

</script>

<template>
    <main class="owner-dashboard my-25 transition-all duration-300" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <AnalyticsDashboardState v-if="loading" loading />
        <AnalyticsDashboardState v-else-if="error" :error="error" @retry="fetchDashboardData" />

        <template v-else>
            <AnalyticsDashboardTopbar v-model:selected-year="selectedYear" :year-options="yearOptions" />

            <AnalyticsDashboardSummaryCards :summary-cards="summaryCards" :animation-seed="animationSeed" />

            <section v-if="activeTab === 'overview'" class="grid gap-6">
                <div class="grid gap-6 lg:grid-cols-3">
                    <ReservationOverviewChart :chart="reservationOverviewChart" :year-label="selectedYearLabel"
                        :animation-seed="animationSeed" />
                    <ApprovalStatusPanel :statuses="approvalStatuses" :quick-links="quickLinks"
                        :property-count="propertyCount" :icon-map="iconMap" />
                </div>

                <div class="grid gap-6 lg:grid-cols-3">
                    <RevenueBySegmentCard :segments="revenueSegments" :animation-seed="animationSeed"
                        class="lg:col-span-1" />
                    <RecentReservationsPanel :reservations="activeReservations" :format-date="formatDate"
                        :format-money="formatMoney" class="lg:col-span-2" />
                </div>
            </section>

            <!-- <AnalyticsDashboardRevenueSection v-if="activeTab === 'revenue'" v-model="monthWindow"
                :visible-monthly-series="visibleMonthlySeries" :profit-points="profitPoints"
                :profit-line-path="profitLinePath" :profit-area-path="profitAreaPath" :activity-feed="activityFeed"
                :segment-breakdown="segmentBreakdown" :max-revenue-value="maxRevenueValue"
                :max-expense-value="maxExpenseValue" :bar-height-style="barHeightStyle" />

            <AnalyticsDashboardTrafficSection v-if="activeTab === 'traffic'" :weekly-sessions="weeklySessions"
                :max-weekly-sessions="maxWeeklySessions" :max-weekly-conversions="maxWeeklyConversions"
                :weekly-conversion-rates="weeklyConversionRates" :property-breakdown="propertyBreakdown"
                :segment-breakdown="segmentBreakdown" :active-reservations="activeReservations"
                :format-date="formatDate" :format-money="formatMoney" :bar-height-style="barHeightStyle" />

            <AnalyticsDashboardPaymentNote v-if="dashboardData.paymentStatus && !dashboardData.paymentStatus.isComplete"
                :payment-status="dashboardData.paymentStatus" /> -->
        </template>
    </main>
</template>

<style scoped>
.owner-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    color: var(--color-text);
}
</style>