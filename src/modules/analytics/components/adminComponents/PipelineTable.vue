<script setup>
import AppTable from '@/shared/components/AppTable.vue'

defineProps({
  properties: { type: Array, required: true }
})

const columns = [
  { key: 'property', label: 'Property Structural Identity' },
  { key: 'rooms', label: 'Allocated Rooms' },
  { key: 'valuation', label: 'Base Valuation' },
  { key: 'status', label: 'Verification Status' },
]
</script>

<template>
  <div class="dashboard-panel lg:col-span-3">
    <h3 class="panel-title mb-4">New Properties Pipeline & Performance</h3>

    <AppTable :columns="columns" :rows="properties">
      <template #cell-property="{ row }">
        <div class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary-soft) font-bold text-(--color-primary)">
            {{ row.name.charAt(0) }}
          </div>
          <div>
            <div class="font-bold text-(--color-text)">{{ row.name }}</div>
            <div class="text-[10px] text-(--color-muted)">{{ row.location }}</div>
          </div>
        </div>
      </template>

      <template #cell-rooms="{ value }">
        <div class="text-center font-semibold text-(--color-text)">{{ value }}</div>
      </template>

      <template #cell-valuation="{ value }">
        <div class="font-bold text-(--color-text)">${{ value }}</div>
      </template>

      <template #cell-status="{ row }">
        <div class="text-right">
          <span :class="['status-pill', row.statusClass]">
            {{ row.status }}
          </span>
        </div>
      </template>
    </AppTable>
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

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9999px;
}
</style>