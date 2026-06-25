<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
    // ទទួលទិន្នន័យ Array ផ្ទាល់ពី API របស់ Postman
    chart: {
        type: [Object, Array],
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

const chartLabel = computed(() => t('owner.analytics.bookingsCompleted', 'Bookings'))
const yearLabelText = computed(() => t('owner.analytics.yearly', 'Yearly'))

const chartVersion = ref(0)
let animationFrameId = null
const chartKey = computed(() => `reservation-overview-${resolvedTheme.value}-${props.animationSeed}-${chartVersion.value}`)

// ១. រៀបចំបញ្ជីឈ្មោះខែទាំង ១២ ជាភាសាអង់គ្លេសសម្រាប់ដៅលើអ័ក្ស X ដូចរូបភាពគំរូ
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ២. មុខងារគណនាបូកសរុបចំនួននៃការកក់បន្ទប់បំបែកតាមខែនីមួយៗ (Aggregate data by month)
const processedMonthlyData = computed(() => {
    // ពិនិត្យរកមើលទីតាំង Array នៃទិន្នន័យ
    const rawList = Array.isArray(props.chart)
        ? props.chart
        : (props.chart?.data || props.chart?.reservations || [])

    // បង្កើតអារ៉េលំនាំដើមចំនួន ១២ តំណាងឱ្យ ១២ ខែ ដែលមានតម្លៃដំបូងស្មើសូន្យ
    const monthlyCounts = new Array(12).fill(0)

    rawList.forEach(res => {
        // ប្រើប្រាស់ created_at ឬ check_in_date ដើម្បីសម្គាល់ខែ
        const dateStr = res.created_at || res.check_in_date
        if (dateStr) {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
                const monthIndex = date.getMonth() // ទទួលបានលេខរៀងខែពី 0 ដល់ 11
                monthlyCounts[monthIndex] += 1     // បូកបង្កើនចំនួនកក់ក្នុងខែនោះ +1
            }
        }
    })

    return monthlyCounts
})

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
    labels: monthLabels,
    datasets: [
        {
            label: chartLabel.value,
            backgroundColor: getCssColor('--color-primary'),
            borderColor: getCssColor('--color-primary'),
            pointBackgroundColor: getCssColor('--color-primary'),
            tension: 0.35,
            borderWidth: 3,
            data: processedMonthlyData.value
        }
    ]
})

const rebuildChart = async () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }

    await nextTick()

    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 850,
            easing: 'easeOutCubic'
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: getCssColor('--color-surface-strong'),
                // titleColor: getCssColor('--color-text'),
                // bodyColor: getCssColor('--color-muted'),
                borderColor: getCssColor('--color-border'),
                borderWidth: 1,
            },
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
        labels: monthLabels,
        datasets: [
            {
                label: chartLabel.value,
                backgroundColor: getCssColor('--color-primary'),
                borderColor: getCssColor('--color-primary'),
                pointBackgroundColor: getCssColor('--color-primary'),
                tension: 0.35,
                borderWidth: 3,
                data: new Array(12).fill(0)
            }
        ]
    }

    chartVersion.value += 1

    animationFrameId = requestAnimationFrame(() => {
        chartData.value = {
            labels: monthLabels,
            datasets: [
                {
                    label: chartLabel.value,
                    backgroundColor: getCssColor('--color-primary'),
                    borderColor: getCssColor('--color-primary'),
                    pointBackgroundColor: getCssColor('--color-primary'),
                    tension: 0.35,
                    borderWidth: 3,
                    data: processedMonthlyData.value
                }
            ]
        }
    })
}

watch(
    () => [resolvedTheme.value, locale.value, props.animationSeed, props.chart, processedMonthlyData.value],
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
                class="rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--color-primary)">
                {{ yearLabelText }} {{ yearLabel }}
            </span>
        </div>
        <div class="h-64">
            <Line :key="chartKey" :data="chartData" :options="chartOptions" />
        </div>
    </section>
</template>