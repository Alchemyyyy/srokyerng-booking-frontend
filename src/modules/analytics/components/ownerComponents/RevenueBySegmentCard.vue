<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';

import { useTheme } from '@/shared/composables/useTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

const getCssColor = (token) => {
    if (typeof window === 'undefined') {
        return token;
    }

    const resolvedToken = token.startsWith('var(')
        ? token.slice(4, -1).trim()
        : token;

    return getComputedStyle(document.documentElement).getPropertyValue(resolvedToken).trim() || token;
};

const resolveSegmentColor = (color) => getCssColor(color);

const props = defineProps({
    segments: {
        type: Array,
        default: () => [],
    },
    periodLabel: {
        type: String,
        default: '',
    },
    animationSeed: {
        type: Number,
        default: 0,
    },
});

const { resolvedTheme } = useTheme();
const { t } = useI18n();

const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
const displayPeriodLabel = computed(() => props.periodLabel || `Q${currentQuarter} ${new Date().getFullYear()}`);

const chartVersion = ref(0);
let animationFrameId = null;
const chartKey = computed(() => `segment-revenue-${resolvedTheme.value}-${props.animationSeed}-${chartVersion.value}`);

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: getCssColor('--color-surface-strong'),
            // titleColor: getCssColor('--color-text-inverse'),
            // bodyColor: getCssColor('--color-text-inverse'),
            borderColor: getCssColor('--color-border'),
            borderWidth: 1,
        },
    },
});

const chartData = ref({
    labels: props.segments.map((segment) => segment.name),
    datasets: [
        {
            data: props.segments.map((segment) => segment.share),
            backgroundColor: props.segments.map((segment) => resolveSegmentColor(segment.color)),
            borderColor: getCssColor('--color-surface'),
            borderWidth: 3,
            hoverOffset: 6,
        },
    ],
});

const rebuildChart = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const labels = props.segments.map((segment) => segment.name);
    const targetValues = props.segments.map((segment) => Number(segment.share) || 0);
    const backgroundColors = props.segments.map((segment) => resolveSegmentColor(segment.color));

    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 850,
            easing: 'easeOutCubic',
        },
        cutout: '68%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: getCssColor('--color-surface-strong'),
                // titleColor: getCssColor('--color-text-inverse'),
                // bodyColor: getCssColor('--color-text-inverse'),
                borderColor: getCssColor('--color-border'),
                borderWidth: 1,
            },
        },
    };

    chartData.value = {
        labels,
        datasets: [
            {
                data: targetValues.map(() => 0),
                backgroundColor: backgroundColors,
                borderColor: getCssColor('--color-surface'),
                borderWidth: 3,
                hoverOffset: 6,
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
                    hoverOffset: 6,
                },
            ],
        };
    });
};

watch(
    () => [resolvedTheme.value, props.animationSeed, props.segments],
    () => {
        rebuildChart();
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
    <section
        class="segment-card rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <div class="card-hdr">
            <div>
                <div class="card-title">{{ t('owner.analytics.revenueBySegmentTitle') }}</div>
                <div class="card-sub">{{ t('owner.analytics.currentQuarter') }}</div>
            </div>
            <span class="badge badge-teal">{{ displayPeriodLabel }}</span>
        </div>

        <div class="chart-wrap">
            <Doughnut :key="chartKey" :data="chartData" :options="chartOptions" />
        </div>

        <div class="legend">
            <span v-for="segment in segments" :key="segment.id" class="leg-item">
                <span class="leg-dot" :style="{ background: segment.color }"></span>
                {{ segment.name }} {{ segment.share }}%
            </span>
        </div>
    </section>
</template>

<style scoped>
.card-hdr {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
}

.card-title {
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 700;
}

.card-sub {
    margin-top: 0.2rem;
    color: var(--color-muted);
    font-size: 0.9rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
}

.badge-teal {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.badge-blue {
    background: var(--color-primary-soft);
    color: var(--color-primary);
}

.chart-wrap {
    position: relative;
    height: 230px;
}

.legend {
    margin-top: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    width: fit-content;
    max-width: 100%;
    margin-inline: auto;
    justify-content: center;
    justify-items: start;
}

.leg-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-muted);
    font-size: 0.82rem;
    min-width: 0;
}

.leg-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 999px;
    flex-shrink: 0;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
}
</style>