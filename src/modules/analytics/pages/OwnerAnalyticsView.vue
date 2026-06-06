<script setup>
import { computed, onActivated, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  HomeIcon,
} from '@heroicons/vue/24/outline';

import '@/assets/styles/variables.css';
import ApprovalStatusPanel from '@/modules/analytics/components/ownerComponents/ApprovalStatusPanel.vue';
import AnalyticsDashboardState from '@/modules/analytics/components/ownerComponents/AnalyticsDashboardState.vue';
import AnalyticsDashboardSummaryCards from '@/modules/analytics/components/ownerComponents/AnalyticsDashboardSummaryCards.vue';
import AnalyticsDashboardTopbar from '@/modules/analytics/components/ownerComponents/AnalyticsDashboardTopbar.vue';
import RecentReservationsPanel from '@/modules/analytics/components/ownerComponents/RecentReservationsPanel.vue';
import RevenueBySegmentCard from '@/modules/analytics/components/ownerComponents/RevenueBySegmentCard.vue';
import ReservationOverviewChart from '@/modules/analytics/components/ownerComponents/ReservationOverviewChart.vue';
import { useAnalyticsDashboardStore } from '@/modules/analytics/stores/OwnerAnalyticsStore';

import { useSidebar } from '@/shared/composables/useSidebar';

const dashboardStore = useAnalyticsDashboardStore();
const { t } = useI18n();
const {
  loading,
  error,
  selectedYear,
  yearOptions,
  selectedYearLabel,
  dashboardData,
  summaryCards,
  visibleMonthlySeries,
  segmentBreakdown,
  activeReservations,
} = storeToRefs(dashboardStore);

const { fetchDashboardData, formatMoney, formatDate } = dashboardStore;

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

const revenuePeriodLabel = computed(() => {
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  return `Q${currentQuarter} ${selectedYearLabel.value}`;
});

const propertyCount = computed(() => dashboardData.value.summary?.totalProperties || 1);

const approvalStatuses = computed(() => {
  const properties = dashboardData.value.properties || [];
  const approved = properties.filter((property) => String(property.status).toLowerCase() === 'approved').length;
  const pending = properties.filter((property) => String(property.status).toLowerCase() === 'pending').length;
  const suspended = Math.max(properties.length - approved - pending, 0);

  return [
    {
      label: t('owner.analytics.approval.activeListings'),
      count: approved,
      tone: 'success',
    },
    {
      label: t('owner.analytics.approval.pendingAudits'),
      count: pending,
      tone: 'warning',
    },
    {
      label: t('owner.analytics.approval.draftModeSuspended'),
      count: suspended,
      tone: 'danger',
    },
  ];
});

const quickLinks = computed(() => [
  { label: t('owner.sidebar.properties'), href: '/owner/properties', icon: 'BuildingOfficeIcon' },
  { label: t('owner.sidebar.rooms'), href: '/owner/rooms', icon: 'HomeIcon' },
  { label: t('owner.sidebar.reservations'), href: '/owner/reservations', icon: 'CalendarDaysIcon' },
  { label: t('owner.sidebar.paymentAccounts'), href: '/owner/payment-accounts', icon: 'CreditCardIcon' },
]);

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

      <section class="grid gap-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <ReservationOverviewChart :chart="reservationOverviewChart" :year-label="selectedYearLabel"
            :animation-seed="animationSeed" />
          <ApprovalStatusPanel :statuses="approvalStatuses" :quick-links="quickLinks" :property-count="propertyCount"
            :icon-map="iconMap" />
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <RevenueBySegmentCard :segments="revenueSegments" :period-label="revenuePeriodLabel"
            :animation-seed="animationSeed" class="lg:col-span-1" />
          <RecentReservationsPanel :reservations="activeReservations" :format-date="formatDate"
            :format-money="formatMoney" class="lg:col-span-2" />
        </div>
      </section>
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