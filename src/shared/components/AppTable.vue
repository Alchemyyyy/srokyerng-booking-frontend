<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  clickable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["row-click"]);
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-sm">
        <thead class="bg-(--color-surface-soft) text-xs uppercase tracking-wide text-(--color-muted)">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-5 py-3 font-semibold">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--color-border)">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="row.id || rowIndex"
            :class="clickable ? 'cursor-pointer transition hover:bg-(--color-surface-soft)' : ''"
            @click="clickable && $emit('row-click', row)"
          >
            <td v-for="column in columns" :key="column.key" class="px-5 py-4 text-(--color-text)">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length || 1" class="px-5 py-8 text-center text-(--color-muted)">
              {{ t("components.noRecords") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
