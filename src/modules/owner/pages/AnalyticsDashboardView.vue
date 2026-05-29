<script setup>
import { storeToRefs } from 'pinia';

import '@/assets/styles/variables.css';
import AnalyticsDashboardOverviewSection from '@/modules/owner/components/analytics/AnalyticsDashboardOverviewSection.vue';
import AnalyticsDashboardPaymentNote from '@/modules/owner/components/analytics/AnalyticsDashboardPaymentNote.vue';
import AnalyticsDashboardRevenueSection from '@/modules/owner/components/analytics/AnalyticsDashboardRevenueSection.vue';
import AnalyticsDashboardState from '@/modules/owner/components/analytics/AnalyticsDashboardState.vue';
import AnalyticsDashboardSummaryCards from '@/modules/owner/components/analytics/AnalyticsDashboardSummaryCards.vue';
import AnalyticsDashboardTopbar from '@/modules/owner/components/analytics/AnalyticsDashboardTopbar.vue';
import AnalyticsDashboardTrafficSection from '@/modules/owner/components/analytics/AnalyticsDashboardTrafficSection.vue';
import { useAnalyticsDashboardStore } from '@/modules/owner/store/AnalyticsDashboardStore';

import { useSidebar } from '@/shared/composables/useSidebar';

const dashboardStore = useAnalyticsDashboardStore();
const {
    loading,
    error,
    activeTab,
    monthWindow,
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

</script>

<template>
    <main class="owner-dashboard my-25 transition-all duration-300" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <AnalyticsDashboardState v-if="loading" loading />
        <AnalyticsDashboardState v-else-if="error" :error="error" @retry="fetchDashboardData" />

        <template v-else>
            <AnalyticsDashboardTopbar v-model:activeTab="activeTab" :tabs="tabs" />

            <AnalyticsDashboardSummaryCards :summary-cards="summaryCards" />

            <AnalyticsDashboardOverviewSection v-if="activeTab === 'overview'" :weekly-sessions="weeklySessions"
                :max-weekly-sessions="maxWeeklySessions" :max-weekly-conversions="maxWeeklyConversions"
                :weekly-conversion-rates="weeklyConversionRates" :active-reservations="activeReservations"
                :property-breakdown="propertyBreakdown" :segment-breakdown="segmentBreakdown" :format-date="formatDate"
                :format-money="formatMoney" :bar-height-style="barHeightStyle" />

            <AnalyticsDashboardRevenueSection v-if="activeTab === 'revenue'" v-model="monthWindow"
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
                :payment-status="dashboardData.paymentStatus" />
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