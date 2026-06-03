<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend, Filler)

const props = defineProps({
  series: {
    type: Object,
    default: () => ({ labels: [], datasets: [] }),
  },
  selectedHistory: {
    type: String,
    default: '12m',
  },
  historyOptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change-history'])

const visibleDatasetIds = ref(['properties', 'rooms'])
const chartRenderKey = ref(0)

// Watch the global loading state. When refreshing turns off, update key to trigger entrance animation
watch(() => props.loading, (isNowLoading) => {
  if (!isNowLoading) {
    chartRenderKey.value++
  }
}, { immediate: true }) // Also catches initial load execution

const toggleDataset = (datasetId) => {
  if (!datasetId) return
  if (visibleDatasetIds.value.includes(datasetId)) {
    if (visibleDatasetIds.value.length === 1) return
    visibleDatasetIds.value = visibleDatasetIds.value.filter((id) => id !== datasetId)
    return
  }
  visibleDatasetIds.value = [...visibleDatasetIds.value, datasetId]
}

const chartData = computed(() => ({
  labels: props.series?.labels || [],
  datasets: (props.series?.datasets || []).filter((dataset) => visibleDatasetIds.value.includes(dataset.id)),
}))

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: 'rgba(169, 189, 209, 0.9)', font: { family: 'Poppins' } } } },
  scales: {
    y: { grid: { color: 'rgba(200, 217, 228, 0.15)' }, ticks: { color: '#4b628f' } },
    x: { grid: { display: false }, ticks: { color: '#4b628f' } }
  }
})
</script>

<template>
  <div class="dashboard-panel lg:col-span-2" :class="{ 'panel--refreshing': loading }">
    <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div>
        <h3 class="panel-title">Platform Growth Overview</h3>
        <p class="panel-subtitle">Historical tracking of system properties, rooms, and registered users</p>
      </div>
      <div class="overview-controls">
        <div class="history-actions" v-if="historyOptions.length > 0">
          <button v-for="option in historyOptions" :key="option.value" type="button"
            :class="['action-pill', { 'action-pill--active': option.value === selectedHistory }]"
            @click="emit('change-history', option.value)">
            {{ option.label }}
          </button>
        </div>

        <div class="dataset-actions">
          <button v-for="dataset in series.datasets || []" :key="dataset.id || dataset.label" type="button"
            :class="['action-pill', { 'action-pill--active': visibleDatasetIds.includes(dataset.id) }]"
            @click="toggleDataset(dataset.id)">
            {{ dataset.label }}
          </button>
        </div>

        <button class="export-btn" aria-label="Export dataset link">
          <ArrowDownTrayIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="chart-wrapper">
      <Line :key="chartRenderKey" :data="chartData" :options="lineChartOptions" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: var(--space-lg);
  box-shadow: var(--shadow-panel);
  transition: opacity 0.25s ease;
}

.panel--refreshing {
  opacity: 0.6;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.panel-subtitle {
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 2px;
}

.chart-wrapper {
  height: 280px;
  position: relative;
}

.overview-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.history-actions,
.dataset-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.action-pill {
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-muted);
  border-radius: 9999px;
  padding: 0.3rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 0.15s ease;
}

.action-pill--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
</style>