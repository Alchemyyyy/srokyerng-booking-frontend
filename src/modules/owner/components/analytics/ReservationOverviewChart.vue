<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

import { useTheme } from '@/modules/owner/composables/useTheme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const getCssColor = (token) => {
    if (typeof window === 'undefined') {
        return token
    }

    return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || token
}

const props = defineProps({
    chart: {
        type: Object,
        default: () => ({})
    },
    yearLabel: {
        type: [Number, String],
        default: ''
    },
    animationSeed: {
        type: Number,
        default: 0
    }
})

const { resolvedTheme } = useTheme()
const { t, locale } = useI18n()

const chartLabel = computed(() => t('owner.analytics.bookingsCompleted'))
const yearLabelText = computed(() => t('owner.analytics.yearly'))

const chartVersion = ref(0)
let animationFrameId = null
const chartKey = computed(() => `reservation-overview-${resolvedTheme.value}-${props.animationSeed}-${chartVersion.value}`)

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            grid: { color: getCssColor('--color-border') },
            ticks: { color: getCssColor('--color-muted'), font: { size: 11 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: getCssColor('--color-muted'), font: { size: 11 } }
        }
    }
})

const chartData = ref({
    labels: props.chart?.labels ?? [],
    datasets: [
        {
            label: chartLabel.value,
            backgroundColor: getCssColor('--color-primary'),
            borderColor: getCssColor('--color-secondary'),
            pointBackgroundColor: getCssColor('--color-primary'),
            tension: 0.35,
            borderWidth: 3,
            data: props.chart?.data ?? []
        }
    ]
})

const rebuildChart = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }

    const labels = props.chart?.labels ?? []
    const targetData = (props.chart?.data ?? []).map((value) => Number(value) || 0)

    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 850,
            easing: 'easeOutCubic'
        },
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                grid: { color: getCssColor('--color-border') },
                ticks: { color: getCssColor('--color-muted'), font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: getCssColor('--color-muted'), font: { size: 11 } }
            }
        }
    }

    chartData.value = {
        labels,
        datasets: [
            {
                label: chartLabel.value,
                backgroundColor: getCssColor('--color-primary'),
                borderColor: getCssColor('--color-secondary'),
                pointBackgroundColor: getCssColor('--color-primary'),
                tension: 0.35,
                borderWidth: 3,
                data: targetData.map(() => 0)
            }
        ]
    }

    chartVersion.value += 1

    animationFrameId = requestAnimationFrame(() => {
        chartData.value = {
            labels,
            datasets: [
                {
                    label: chartLabel.value,
                    backgroundColor: getCssColor('--color-primary'),
                    borderColor: getCssColor('--color-secondary'),
                    pointBackgroundColor: getCssColor('--color-primary'),
                    tension: 0.35,
                    borderWidth: 3,
                    data: targetData
                }
            ]
        }
    })
}

watch(
    () => [resolvedTheme.value, locale.value, props.animationSeed, props.chart?.labels, props.chart?.data],
    () => {
        rebuildChart()
    },
    { immediate: true, deep: true }
)

onBeforeUnmount(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }
})
</script>

<template>
    <section
        class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card) lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-(--color-text)">{{ t('owner.analytics.reservationOverviewTitle') }}</h3>
            <span
                class="rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--color-primary)">{{
                yearLabelText }}
                {{ yearLabel }}</span>
        </div>
        <div class="h-64">
            <Line :key="chartKey" :data="chartData" :options="chartOptions" />
        </div>
    </section>
</template>