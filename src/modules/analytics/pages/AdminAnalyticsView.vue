<script setup>
import { useSidebar } from '@/shared/composables/useSidebar'
import { useAnalyticsDashboard } from '../composables/useAnalyticsDashboard'

import DashboardHero from '../components/adminComponents/DashboardHero.vue'
import MetricsGrid from '../components/adminComponents/MetricsGrid.vue'
import GrowthChart from '../components/adminComponents/GrowthChart.vue'
import ApprovalDoughnut from '../components/adminComponents/ApprovalDoughnut.vue'
import ActivityFeed from '../components/adminComponents/ActivityFeed.vue'
import PipelineTable from '../components/adminComponents/PipelineTable.vue'
import QuickActions from '../components/adminComponents/QuickActions.vue'

const { isSidebarOpen } = useSidebar()
const {
  loading, error, stats, propertiesPipeline, systemActivities,
  approvalBreakdown, quickLinks, loadDashboard,
  selectedHistory, historyOptions, overviewSeries, setSelectedHistory
} = useAnalyticsDashboard()

const handleChangeHistory = (value) => {
  setSelectedHistory(value)
}
</script>

<template>
  <div class="admin-dashboard-container my-25 space-y-6" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">

    <div v-if="error" class="error-alert-banner">
      <p class="text-sm font-semibold">{{ $t(`analytics.errors.${error}`) }}</p>
      <button @click="loadDashboard" class="retry-action-btn">
        {{ $t('analytics.retry') }}
      </button>
    </div>

    <DashboardHero :loading="loading" :history-options="historyOptions" :selected-history="selectedHistory"
      @change-history="handleChangeHistory" @refresh="loadDashboard" />

    <template v-if="!error">
      <MetricsGrid :stats="stats" :loading="loading" />

      <section class="grid gap-6 lg:grid-cols-3 min-h-90 relative">
        <GrowthChart :series="overviewSeries" :selected-history="selectedHistory" :history-options="historyOptions"
          :loading="loading" @change-history="handleChangeHistory" />
        <ApprovalDoughnut :breakdown="approvalBreakdown" :total-properties="stats.properties" :loading="loading" />
      </section>

      <section class="grid gap-6 lg:grid-cols-5">
        <ActivityFeed v-if="systemActivities.length > 0" :activities="systemActivities" />
        <div v-else class="empty-panel lg:col-span-2">
          {{ $t('analytics.noActivity') }}
        </div>

        <PipelineTable v-if="propertiesPipeline.length > 0" :properties="propertiesPipeline" />
        <div v-else class="empty-panel lg:col-span-3">
          {{ $t('analytics.noPipeline') }}
        </div>
      </section>

      <QuickActions :links="quickLinks" :formatter="(v) => new Intl.NumberFormat('en-US').format(v)" />
    </template>
  </div>
</template>

<style scoped>
.admin-dashboard-container {
  font-family: var(--font-main);
  background-color: var(--color-page);
  color: var(--color-text);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 var(--space-lg);
}

.error-alert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-danger-soft, #fef2f2);
  border: 1px solid var(--color-danger, #ef4444);
  color: var(--color-danger, #b91c1c);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.retry-action-btn {
  background: var(--color-danger);
  color: #fff;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.empty-panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  font-size: 13px;
}
</style>