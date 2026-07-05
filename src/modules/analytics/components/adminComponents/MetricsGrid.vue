<script setup>
import { computed, ref, watch } from 'vue'
import { BuildingOffice2Icon, HomeIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  stats: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})

// Local display values to drive the incremental counting sequence layout
const displayProperties = ref(0)
const displayPendingProperties = ref(0)
const displayBookings = ref(0)
const displayUsers = ref(0)

// Helper function that builds a smooth frame-by-frame counting calculation loop
const animateCount = (start, end, refTarget, duration = 500) => {
  if (start === end) return
  let startTime = null
  
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    refTarget.value = Math.floor(progress * (end - start) + start)
    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      refTarget.value = end
    }
  }
  window.requestAnimationFrame(step)
}

// Watch layout loading properties. When complete, run the counts rollup loop setup
watch(() => props.loading, (isNowLoading) => {
  if (!isNowLoading) {
    animateCount(0, props.stats.properties, displayProperties)
    animateCount(0, props.stats.pendingProperties, displayPendingProperties)
    animateCount(0, props.stats.bookings, displayBookings)
    animateCount(0, props.stats.users, displayUsers)
  } else {
    // Reset back to zero during reload transitions
    displayProperties.value = 0
    displayPendingProperties.value = 0
    displayBookings.value = 0
    displayUsers.value = 0
  }
}, { immediate: true }) // Catches browser webpage refresh runs automatically

const processedMetrics = computed(() => [
  { label: t('admin.analyticsPage.metrics.totalProperties'), value: displayProperties.value, trend: '↑ 12.5%', sub: t('admin.analyticsPage.metrics.vsLastMonth'), trendClass: 'text-emerald-500', icon: BuildingOffice2Icon, iconClass: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]' },
  { label: t('admin.analyticsPage.metrics.pendingProperties'), value: displayPendingProperties.value, trend: '↑ 8.2%', sub: t('admin.analyticsPage.metrics.vsLastWeek'), trendClass: 'text-emerald-500', icon: HomeIcon, iconClass: 'bg-[var(--color-info-soft)] text-[var(--color-info)]' },
  { label: t('admin.analyticsPage.metrics.totalBookings'), value: displayBookings.value, trend: '↑ 5.7%', sub: t('admin.analyticsPage.metrics.activeCycles'), trendClass: 'text-emerald-500', icon: CalendarDaysIcon, iconClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
  { label: t('admin.analyticsPage.metrics.activeUsers'), value: displayUsers.value, trend: '↓ 2.1%', sub: t('admin.analyticsPage.metrics.bounceRate'), trendClass: 'text-rose-500', icon: UserGroupIcon, iconClass: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' },
])

const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val)
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div v-for="item in processedMetrics" :key="item.label" class="metrics-card" :class="{ 'metrics-card--fade': loading }">
      <div class="flex items-center justify-between">
        <div>
          <p class="metrics-label">{{ item.label }}</p>
          <h3 class="metrics-value">{{ formatNumber(item.value) }}</h3>
          <span :class="['metrics-trend font-medium', item.trendClass]">
            {{ item.trend }} <span class="trend-sub">{{ item.sub }}</span>
          </span>
        </div>
        <div :class="['metrics-icon', item.iconClass]">
          <component :is="item.icon" class="h-6 w-6" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metrics-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.25s ease;
  opacity: 1;
}
.metrics-card--fade {
  opacity: 0.4;
}
.metrics-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}
.metrics-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.metrics-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  margin: var(--space-xs) 0;
  font-variant-numeric: tabular-nums; /* Prevents text layout shifting while counting */
}
.metrics-trend {
  font-size: 11px;
}
.trend-sub {
  color: var(--color-muted);
  font-weight: 400;
}
.metrics-icon {
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>