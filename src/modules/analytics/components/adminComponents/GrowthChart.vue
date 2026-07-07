<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
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
import { useI18n } from 'vue-i18n'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend, Filler)

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  series: {
    type: Object,
    default: () => ({ labels: [], datasets: [] }),
  },
  selectedHistory: {
    type: String,
    default: '24m',
  },
  historyOptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change-history'])

const visibleDatasetIds = ref(['properties', 'users'])
const chartRenderKey = ref(0)
const chartReady = ref(false)

const restartChartAnimation = async () => {
  chartReady.value = false
  await nextTick()

  chartRenderKey.value += 1
  chartReady.value = true
}

watch(
  () => props.loading,
  async (isNowLoading, wasLoading) => {
    if (wasLoading && !isNowLoading) {
      await runChartAnimation()
    }
  }
)

watch(
  () => props.series,
  async () => {
    if (!props.loading) {
      await runChartAnimation()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await runChartAnimation()
})

const toggleDataset = async (datasetId) => {
  if (!datasetId) return

  if (visibleDatasetIds.value.includes(datasetId)) {
    if (visibleDatasetIds.value.length === 1) return
    visibleDatasetIds.value = visibleDatasetIds.value.filter((id) => id !== datasetId)
  } else {
    visibleDatasetIds.value = [...visibleDatasetIds.value, datasetId]
  }

  await runChartAnimation()
}

// const chartReady = ref(false)
const animatedChartData = ref({
  labels: [],
  datasets: [],
})

const getVisibleDatasets = () => {
  return (props.series?.datasets || []).filter((dataset) =>
    visibleDatasetIds.value.includes(dataset.id)
  )
}

const buildChartData = (useZeroValues = false) => ({
  labels: props.series?.labels || [],
  datasets: getVisibleDatasets().map((dataset) => ({
    ...dataset,
    data: useZeroValues
      ? (dataset.data || []).map(() => 0)
      : dataset.data || [],
  })),
})

const runChartAnimation = async () => {
  chartReady.value = false
  await nextTick()

  animatedChartData.value = buildChartData(true)
  chartReady.value = true

  await nextTick()

  requestAnimationFrame(() => {
    animatedChartData.value = buildChartData(false)
  })
}

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  transitions: {
    active: {
      animation: {
        duration: 1200,
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(169, 189, 209, 0.9)',
        font: { family: 'Poppins' },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(200, 217, 228, 0.15)' },
      ticks: { color: '#4b628f' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#4b628f' },
    },
  },
})
</script>

<template>
  <div class="dashboard-panel lg:col-span-2" :class="{ 'panel--refreshing': loading }">
    <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div>
        <h3 class="panel-title">{{ t('admin.analyticsPage.growthChart.title') }}</h3>
        <p class="panel-subtitle">
          {{ t('admin.analyticsPage.growthChart.subtitle') }}
        </p>
      </div>

      <div class="overview-controls">
        <div v-if="historyOptions.length > 0" class="history-actions">
          <button v-for="option in historyOptions" :key="option.value" type="button" class="cursor-pointer"
            :class="['action-pill', { 'action-pill--active': option.value === selectedHistory }]"
            @click="emit('change-history', option.value)">
            {{ option.label }}
          </button>
        </div>

        <div class="dataset-actions">
          <button v-for="dataset in series.datasets || []" :key="dataset.id || dataset.label" type="button"
            class="cursor-pointer"
            :class="['action-pill', { 'action-pill--active': visibleDatasetIds.includes(dataset.id) }]"
            @click="toggleDataset(dataset.id)">
            {{ dataset.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="chart-wrapper">
      <Line v-if="chartReady" :data="animatedChartData" :options="lineChartOptions" />
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