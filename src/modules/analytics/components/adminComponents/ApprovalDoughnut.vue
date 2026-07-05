<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

import { useTheme } from '@/shared/composables/useTheme';

ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend);

const { t, te } = useI18n({ useScope: 'global' });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || '').toLowerCase()}`, value);

const resolveBreakdownLabel = (label) => {
  const normalized = String(label || '').toLowerCase();
  if (normalized === 'all requests') {
    return t('admin.analyticsPage.approvalDoughnut.allRequests');
  }
  return statusLabel(label);
};

const getCssColor = (token) => {
  if (typeof window === 'undefined') {
    return token;
  }

  const resolvedToken = token.startsWith('var(')
    ? token.slice(4, -1).trim()
    : token;

  return getComputedStyle(document.documentElement).getPropertyValue(resolvedToken).trim() || token;
};

const resolveStatusColor = (bgClass) => {
  if (bgClass.includes('emerald')) return getCssColor('--color-success');
  if (bgClass.includes('amber')) return getCssColor('--color-warning');
  if (bgClass.includes('rose')) return getCssColor('--color-danger');

  return getCssColor('--color-primary');
};

const props = defineProps({
  animationSeed: { type: Number, default: 0 },
  breakdown: { type: Array, required: true },
  totalProperties: { type: Number, default: 12 },
  loading: { type: Boolean, default: false },
});

const statusViewMode = ref('count');
const { resolvedTheme } = useTheme();
const chartVersion = ref(0);
const chartData = ref({ labels: [], datasets: [] });
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  animation: {
    duration: 850,
    easing: 'easeOutCubic',
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const suffix = statusViewMode.value === 'percentage' ? '%' : ` ${t('admin.analyticsPage.approvalDoughnut.propertiesUnit')}`;
          return `${context.label}: ${context.parsed}${suffix}`;
        },
      },
    },
  },
});

let animationFrameId = null;

const chartKey = computed(() => `approval-${resolvedTheme.value}-${props.animationSeed}-${chartVersion.value}`);

const statusChartValues = computed(() => {
  if (statusViewMode.value === 'percentage') {
    return props.breakdown.map((status) => Number(((status.count / Math.max(props.totalProperties, 1)) * 100).toFixed(1)));
  }

  return props.breakdown.map((status) => status.count);
});

const rebuildChart = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const labels = props.breakdown.map((status) => resolveBreakdownLabel(status.label));
  const targetValues = statusChartValues.value;
  const backgroundColors = props.breakdown.map((status) => resolveStatusColor(status.bgClass));

  chartData.value = {
    labels,
    datasets: [
      {
        data: targetValues.map(() => 0),
        backgroundColor: backgroundColors,
        borderColor: getCssColor('--color-surface'),
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  chartVersion.value += 1;

  animationFrameId = requestAnimationFrame(() => {
    chartData.value = {
      labels,
      datasets: [
        {
          data: targetValues,
          backgroundColor: backgroundColors,
          borderColor: getCssColor('--color-surface'),
          borderWidth: 3,
          hoverOffset: 4,
        },
      ],
    };
  });
};

watch(
  () => [props.loading, props.breakdown, statusViewMode.value, props.animationSeed, resolvedTheme.value],
  ([isLoading]) => {
    if (!isLoading) {
      rebuildChart();
    }
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div class="dashboard-panel" :class="{ 'panel--refreshing': loading }">
    <div class="mb-4 flex items-start justify-between gap-3">
      <h3 class="panel-title">{{ t('admin.analyticsPage.approvalDoughnut.title') }}</h3>
      <div class="mode-actions">
        <button type="button" class="mode-pill" :class="{ 'mode-pill--active': statusViewMode === 'count' }"
          @click="statusViewMode = 'count'">
          {{ t('admin.analyticsPage.approvalDoughnut.countMode') }}
        </button>
        <button type="button" class="mode-pill" :class="{ 'mode-pill--active': statusViewMode === 'percentage' }"
          @click="statusViewMode = 'percentage'">
          {{ t('admin.analyticsPage.approvalDoughnut.percentageMode') }}
        </button>
      </div>
    </div>
    <p class="panel-subtitle">{{ t('admin.analyticsPage.approvalDoughnut.subtitle') }}</p>

    <div class="chart-wrapper-doughnut relative flex items-center justify-center mt-2">
      <Doughnut :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-6 space-y-3">
      <div v-for="status in breakdown" :key="status.label" class="space-y-1">
        <div class="flex justify-between text-xs font-medium">
          <span class="flex items-center gap-2 text-(--color-muted)">
            <span :class="['h-2 w-2 rounded-full', status.bgClass]"></span>
            {{ resolveBreakdownLabel(status.label) }}
          </span>
          <span class="text-(--color-text) font-bold">
            {{ statusViewMode === 'count' ? `${status.count} ${t('admin.analyticsPage.approvalDoughnut.propertiesUnit')}` : `${((status.count / Math.max(totalProperties,
              1)) * 100).toFixed(1)}%` }}
          </span>
        </div>
        <div class="w-full bg-(--color-surface-soft) h-1.5 rounded-full overflow-hidden">
          <div :class="['h-full rounded-full', status.bgClass]"
            :style="{ width: `${(status.count / Math.max(totalProperties, 1)) * 100}%` }"></div>
        </div>
      </div>
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

.chart-wrapper-doughnut {
  height: 180px;
}
</style>
