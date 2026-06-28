<script setup>
import { useI18n } from "vue-i18n";
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid';

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
    default: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  // activeModule សម្រាប់សម្គាល់ 'payments' ឬ 'refunds'
  activeModule: {
    type: String,
    default: 'payments'
  }
});

const emit = defineEmits(["row-click", "approve", "reject"]);
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-sm">
        <thead class="bg-(--color-surface-soft) text-xs uppercase tracking-wide text-(--color-muted)">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-5 py-3 font-semibold"
              :class="{ 'text-right': column.key === 'action' }">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--color-border)">
          <tr v-for="(row, rowIndex) in rows" :key="row.id || rowIndex" :class="[
            'transition-colors duration-150',
            clickable ? 'cursor-pointer hover:bg-(--color-surface-soft)' : '',
          ]" @click="clickable && emit('row-click', row)">
            <td v-for="column in columns" :key="column.key" class="px-5 py-4 text-(--color-text)"
              :class="{ 'text-right': column.key === 'action' }">
              
              <template v-if="column.key === 'action'">
                <div class="action-buttons-container" @click.stop>
                  
                  <template v-if="activeModule === 'payments'">
                    <div v-if="row.status === 'submitted'" class="flex gap-2">
                      <button @click="emit('approve', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-approve-sm">
                        <CheckIcon class="btn-icon-sm" /> Confirm
                      </button>
                      <button @click="emit('reject', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-reject-sm">
                        <XMarkIcon class="btn-icon-sm" /> Reject
                      </button>
                    </div>
                    <span v-else class="text-xs text-(--color-muted) italic px-2">Processed</span>
                  </template>

                  <template v-if="activeModule === 'refunds'">
                    <div v-if="row.refund_status === 'requested'" class="flex gap-2">
                      <button @click="emit('approve', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-approve-sm">
                        <CheckIcon class="btn-icon-sm" /> Approve
                      </button>
                      <button @click="emit('reject', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-reject-sm">
                        <XMarkIcon class="btn-icon-sm" /> Reject
                      </button>
                    </div>
                    <span v-else class="text-xs text-(--color-muted) italic px-2">Decision Logged</span>
                  </template>

                </div>
              </template>

              <template v-else>
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </template>

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

<style scoped>
.action-buttons-container {
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
  justify-content: flex-end;
}

.action-inline-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-approve-sm {
  background-color: var(--color-success);
  border: 1px solid var(--color-success);
  color: white;
}

[data-theme="dark"] {
  .btn-approve-sm {
    background-color: #2da154;
    border: 1px solid var(--color-success);
    color: var(--color-text);
  }
}

.btn-approve-sm:hover {
  background-color: var(--color-success-soft);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.btn-reject-sm {
  background-color: transparent;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}

.btn-reject-sm:hover {
  background-color: var(--color-danger-soft);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon-sm {
  width: 0.75rem;
  height: 0.75rem;
}

.text-right {
  text-align: right;
}
</style>