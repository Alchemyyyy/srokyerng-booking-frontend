<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSidebar } from '@/shared/composables/useSidebar'
import { useAdminAnalyticsStore } from '../stores/AdminAnalyticsStore'

import DashboardHero from '../components/adminComponents/DashboardHero.vue'
import MetricsGrid from '../components/adminComponents/MetricsGrid.vue'
import GrowthChart from '../components/adminComponents/GrowthChart.vue'
import ApprovalDoughnut from '../components/adminComponents/ApprovalDoughnut.vue'
import ActivityFeed from '../components/adminComponents/ActivityFeed.vue'
import PipelineTable from '../components/adminComponents/PipelineTable.vue'
import QuickActions from '../components/adminComponents/QuickActions.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const { isSidebarOpen } = useSidebar()

const store = useAdminAnalyticsStore()
const {
  loading, error, stats, propertiesPipeline, systemActivities,
  approvalBreakdown, quickLinks, selectedHistory, historyOptions, overviewSeries
} = storeToRefs(store)

onMounted(() => {
  store.fetchDashboardData()
})

const handleChangeHistory = (value) => {
  store.setHistoryWindow(value)
}

const handleRefresh = () => {
  store.fetchDashboardData()
}
</script>

<template>
  <div class="admin-dashboard-container my-25 space-y-6" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">

    <div v-if="error" class="error-alert-banner">
      <p class="text-sm font-semibold">Error: {{ error }}</p>
      <button @click="handleRefresh" class="retry-action-btn">Retry</button>
    </div>

    <DashboardHero :loading="loading" :history-options="historyOptions" :selected-history="selectedHistory"
      @change-history="handleChangeHistory" @refresh="handleRefresh" />

    <!-- Full-page loading overlay on first load -->
    <div v-if="loading && !stats.properties" class="loading-overlay">
      <LoadingSpinner />
    </div>

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
          <LoadingSpinner v-if="loading" />
          <span v-else>No system activities found.</span>
        </div>

        <!-- <PipelineTable v-if="propertiesPipeline.length > 0" :properties="propertiesPipeline" />
        <div v-else class="empty-panel lg:col-span-3">
          <LoadingSpinner v-if="loading" />
          <span v-else>No pending property pipeline recorded.</span>
        </div> -->
        <div class="lg:col-span-3">
          <QuickActions :links="quickLinks" :formatter="(v) => new Intl.NumberFormat('en-US').format(v)" />
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.admin-dashboard-container {
  font-family: var(--font-main, sans-serif);
  background-color: var(--color-page, #f9fafb);
  color: var(--color-text, #111827);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 var(--space-lg, 1.5rem);
}

.error-alert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 8px;
}

.retry-action-btn {
  background: #ef4444;
  color: #fff;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.empty-panel {
  background-color: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-panel, 12px);
  padding: var(--space-xl, 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted, #6b7280);
  font-size: 13px;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl, 2rem);
  background-color: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-panel, 12px);
  min-height: 120px;
}
</style>