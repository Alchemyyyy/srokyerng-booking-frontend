<!-- modules/analytics/components/ActivityFeed.vue -->
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

defineProps({
  activities: { type: Array, required: true }
})
</script>

<template>
  <div class="dashboard-panel lg:col-span-2">
    <h3 class="panel-title mb-4">{{ t('admin.analyticsPage.activityFeed.title') }}</h3>
    <div class="space-y-4 max-h-95 overflow-y-auto pr-1">
      <div v-for="act in activities" :key="act.id" class="flex gap-3 items-start text-xs border-b border-(--color-border) pb-3 last:border-0 last:pb-0">
        <div :class="['p-2 rounded-lg shrink-0', act.iconBg]">
          <component :is="act.icon" class="h-4 w-4" />
        </div>
        <div class="space-y-0.5">
          <h4 class="font-bold text-(--color-text)">{{ act.title }}</h4>
          <p class="text-(--color-muted)">{{ act.description }}</p>
          <span class="text-[10px] text-(--color-muted) font-mono block pt-1">{{ act.time }}</span>
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
}
.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}
</style>