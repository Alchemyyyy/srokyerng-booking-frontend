<script setup>
import { computed, ref, watch } from 'vue'
import { BuildingOfficeIcon, HomeIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: { type: Object, required: true },
  loading: { type: Boolean, default: false }
})

// Local display values to drive the incremental counting sequence layout
const displayProperties = ref(0)
const displayRooms = ref(0)
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
    animateCount(0, props.stats.rooms, displayRooms)
    animateCount(0, props.stats.bookings, displayBookings)
    animateCount(0, props.stats.users, displayUsers)
  } else {
    // Reset back to zero during reload transitions
    displayProperties.value = 0
    displayRooms.value = 0
    displayBookings.value = 0
    displayUsers.value = 0
  }
}, { immediate: true }) // Catches browser webpage refresh runs automatically

const processedMetrics = computed(() => [
  { label: 'Total Properties', value: displayProperties.value, trend: '↑ 12.5%', sub: 'vs last month', trendClass: 'text-emerald-500', icon: BuildingOfficeIcon, iconClass: 'bg-indigo-500/10 text-[var(--color-primary)]' },
  { label: 'Total Rooms', value: displayRooms.value, trend: '↑ 8.2%', sub: 'vs last week', trendClass: 'text-emerald-500', icon: HomeIcon, iconClass: 'bg-purple-500/10 text-purple-400' },
  { label: 'Total Bookings', value: displayBookings.value, trend: '↑ 5.7%', sub: 'active cycles', trendClass: 'text-emerald-500', icon: CalendarDaysIcon, iconClass: 'bg-blue-500/10 text-blue-400' },
  { label: 'Active Users', value: displayUsers.value, trend: '↓ 2.1%', sub: 'bounce rate', trendClass: 'text-rose-500', icon: UserGroupIcon, iconClass: 'bg-amber-500/10 text-amber-500' },
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
  font-size: 11px;
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