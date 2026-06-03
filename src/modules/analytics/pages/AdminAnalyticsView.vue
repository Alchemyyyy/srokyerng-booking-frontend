<script setup>
import { useSidebar } from '@/shared/composables/useSidebar'
import { useAnalyticsDashboard } from '../composables/useAnalyticsDashboard'

// Modular Component Layer Implementations
import DashboardHero from '../components/adminComponents/DashboardHero.vue'
import MetricsGrid from '../components/adminComponents/MetricsGrid.vue'
import GrowthChart from '../components/adminComponents/GrowthChart.vue'
import ApprovalDoughnut from '../components/adminComponents/ApprovalDoughnut.vue'
import ActivityFeed from '../components/adminComponents/ActivityFeed.vue'
import PipelineTable from '../components/adminComponents/PipelineTable.vue'
import QuickActions from '../components/adminComponents/QuickActions.vue'

const { isSidebarOpen } = useSidebar()
const {
  loading, stats, propertiesPipeline, systemActivities,
  approvalBreakdown, quickLinks, formatNumber, loadDashboard,
  selectedHistory, historyOptions, overviewSeries, setSelectedHistory
} = useAnalyticsDashboard()

const handleChangeHistory = (value) => {
  setSelectedHistory(value)
}
</script>

<template>
  <div class="admin-dashboard-container my-25 space-y-6" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">

    <DashboardHero :loading="loading" :history-options="historyOptions" :selected-history="selectedHistory"
      @change-history="handleChangeHistory" @refresh="loadDashboard" />

    <MetricsGrid :stats="stats" :loading="loading" />

    <section class="grid gap-6 lg:grid-cols-3 min-h-90 relative">
      <GrowthChart :series="overviewSeries" :selected-history="selectedHistory" :history-options="historyOptions"
        :loading="loading" @change-history="handleChangeHistory" />
      <ApprovalDoughnut :breakdown="approvalBreakdown" :total-properties="stats.properties" :loading="loading" />
    </section>

    <section class="grid gap-6 lg:grid-cols-5">
      <ActivityFeed :activities="systemActivities" />
      <PipelineTable :properties="propertiesPipeline" />
    </section>

    <QuickActions :links="quickLinks" :formatter="formatNumber" />

  </div>
</template>

<style scoped>
.admin-dashboard-container {
  font-family: var(--font-main);
  background-color: var(--color-page);
  color: var(--color-text);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>