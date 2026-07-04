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
import QuickActionsPanel from '@/modules/analytics/components/ownerComponents/QuickActionsPanel.vue';
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
  recentBookingsList, // Extract the new array ref here
  allReservationsList,
} = storeToRefs(dashboardStore);

const { fetchDashboardData, formatMoney, formatDate } = dashboardStore;

const { isSidebarOpen } = useSidebar();

// ── ReservationOverviewChart: restored original Line shape { labels, data } ──
// labels = status names (Cancelled, Confirmed, Pending)
// data   = total amounts per status
const reservationOverviewChart = computed(() => ({
  labels: visibleMonthlySeries.value.map((item) => item.label),
  data: visibleMonthlySeries.value.map((item) => Number(item.profit) || 0),
}));

// ── RevenueBySegmentCard ──────────────────────────────────────────────────────
const revenueSegments = computed(() =>
  segmentBreakdown.value.map((segment) => ({
    id: segment.id,
    name: segment.name,
    share: segment.share,
    color: segment.color,
  })),
);

const revenuePeriodLabel = computed(() => {
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  return `Q${currentQuarter} ${selectedYearLabel.value}`;
});

// ── ApprovalStatusPanel ───────────────────────────────────────────────────────
const propertyCount = computed(() => dashboardData.value.properties?.length || 0);

const approvalStatuses = computed(() => {
  const properties = dashboardData.value.properties || [];
  const approved = properties.filter(p => String(p.status).toLowerCase() === 'approved').length;
  const pending = properties.filter(p => String(p.status).toLowerCase() === 'pending').length;
  const suspended = Math.max(properties.length - approved - pending, 0);

  return [
    { label: t('owner.analytics.approval.activeListings'), count: approved, tone: 'success' },
    { label: t('owner.analytics.approval.pendingAudits'), count: pending, tone: 'warning' },
    { label: t('owner.analytics.approval.draftModeSuspended'), count: suspended, tone: 'danger' },
  ];
});

const quickLinks = computed(() => [
  { label: t('owner.sidebar.properties'), href: '/owner/properties', icon: 'BuildingOfficeIcon' },
  { label: t('owner.sidebar.rooms'), href: '/owner/rooms', icon: 'HomeIcon' },
  { label: t('owner.sidebar.reservations'), href: '/owner/reservations', icon: 'CalendarDaysIcon' },
  { label: t('owner.sidebar.paymentAccounts'), href: '/owner/payment-accounts', icon: 'CreditCardIcon' },
]);

const iconMap = { BuildingOfficeIcon, HomeIcon, CalendarDaysIcon, CreditCardIcon };

// ── Empty-state (new owner with no properties/reservations yet) ──────────────
const isDashboardEmpty = computed(() => {
  const s = dashboardData.value.summary || {};
  return !s.totalProperties && !s.totalReservations;
});

// ── Animation seed ────────────────────────────────────────────────────────────
const animationSeed = ref(0);
const bumpAnimationSeed = () => { animationSeed.value += 1; };

onMounted(bumpAnimationSeed);
onActivated(bumpAnimationSeed);
</script>

<template>
  <main class="owner-dashboard my-25 transition-all duration-300" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
    <AnalyticsDashboardState v-if="loading" loading />
    <AnalyticsDashboardState v-else-if="error" :error="error" @retry="fetchDashboardData" />

    <template v-else>
      <AnalyticsDashboardTopbar v-model:selected-year="selectedYear" :year-options="yearOptions" />

      <AnalyticsDashboardSummaryCards :summary-cards="summaryCards" :animation-seed="animationSeed" />

      <div v-if="isDashboardEmpty" class="empty-dashboard">
        <BuildingOfficeIcon class="empty-dashboard__icon" />
        <h3 class="empty-dashboard__title">{{ t('owner.analytics.empty.title', 'No data yet') }}</h3>
        <p class="empty-dashboard__subtitle">
          {{ t('owner.analytics.empty.subtitle', 'Add your first property to start receiving bookings — your analytics will show up here once you do.') }}
        </p>
        <RouterLink to="/owner/properties" class="empty-dashboard__cta">
          {{ t('owner.sidebar.properties', 'Go to Properties') }}
        </RouterLink>
      </div>

      <section v-else class="grid gap-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Restored original Line chart — amounts by reservation status -->
          <ReservationOverviewChart :chart="allReservationsList" :year-label="selectedYearLabel"
            :animation-seed="animationSeed" />
          <QuickActionsPanel :quick-links="quickLinks" :property-count="propertyCount" :icon-map="iconMap" />
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <RevenueBySegmentCard :segments="revenueSegments" :period-label="revenuePeriodLabel"
            :animation-seed="animationSeed" class="lg:col-span-1" />

          <RecentReservationsPanel :reservations="recentBookingsList" :format-date="formatDate"
            :format-money="formatMoney" class="lg:col-span-2" />
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <ApprovalStatusPanel :statuses="approvalStatuses" :property-count="propertyCount" :icon-map="iconMap"
            class="lg:col-span-1" />
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

.empty-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 3.5rem 1.5rem;
  border: 1px dashed var(--color-border);
  border-radius: 24px;
  background: var(--color-surface);
}

.empty-dashboard__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-muted);
  margin-bottom: 0.5rem;
}

.empty-dashboard__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-dashboard__subtitle {
  max-width: 40ch;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.empty-dashboard__cta {
  margin-top: 0.75rem;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  background: var(--color-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>