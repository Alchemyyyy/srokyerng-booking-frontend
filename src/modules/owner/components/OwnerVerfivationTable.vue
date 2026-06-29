<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from "vue-i18n";
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/solid';

const { t } = useI18n();

defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  clickable: { type: Boolean, default: true },
  isProcessing: { type: Boolean, default: false },
  activeModule: { type: String, default: 'payments' }
});

const emit = defineEmits([
  "row-click",
  "approve-payment",
  "reject-payment",
  "change-reservation-status",
  "approve",
  "reject"
]);

// Dropdown State ដូច ApprovalTable
const activeDropdownId = ref(null);
const isDropup = ref(false);

const toggleDropdown = (event, id) => {
  event.stopPropagation();
  if (activeDropdownId.value === id) {
    activeDropdownId.value = null;
  } else {
    activeDropdownId.value = id;
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBottom = window.innerHeight - rect.bottom;
    isDropup.value = spaceBottom < 180;
  }
};

const handleSelectStatus = (row, targetStatus) => {
  activeDropdownId.value = null;
  emit('change-reservation-status', { row, status: targetStatus });
};

const closeAllDropdowns = () => { activeDropdownId.value = null; };
onMounted(() => window.addEventListener('click', closeAllDropdowns));
onUnmounted(() => window.removeEventListener('click', closeAllDropdowns));
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)">
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-sm">
        <thead class="bg-(--color-surface-soft) text-xs uppercase tracking-wide text-(--color-muted)">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-5 py-3 font-semibold"
              :class="{ 'text-right': ['payment_action', 'reservation_action'].includes(column.key) }">
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
              :class="{ 'text-right': ['payment_action', 'reservation_action'].includes(column.key) }">

              <template v-if="column.key === 'payment_action'">
                <div class="action-buttons-container" @click.stop>
                  <template v-if="activeModule === 'payments'">
                    <div v-if="row.status === 'submitted'" class="flex gap-2">
                      <button @click="emit('approve-payment', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-approve-sm">
                        <CheckIcon class="btn-icon-sm" /> Verify Paid
                      </button>
                      <button @click="emit('reject-payment', row)" :disabled="isProcessing"
                        class="action-inline-btn btn-reject-sm">
                        <XMarkIcon class="btn-icon-sm" /> Reject Slip
                      </button>
                    </div>
                    <span v-else class="text-xs text-(--color-muted) italic px-2 capitalize">
                      {{ row.status }}
                    </span>
                  </template>

                  <template v-else-if="activeModule === 'refunds'">
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

              <template v-else-if="column.key === 'reservation_action'">
                <div class="action-buttons-container" @click.stop>
                  <template v-if="activeModule === 'payments'">
                    <div class="dropdown-menu-wrapper">

                      <button v-if="!['completed', 'cancelled'].includes(row.reservation_status)"
                        @click="toggleDropdown($event, row.id)" :disabled="isProcessing"
                        class="action-inline-btn btn-edit-sm">
                        Edit Status
                        <ChevronDownIcon class="btn-icon-sm ml-1" />
                      </button>

                      <span v-else class="text-xs text-(--color-muted) italic px-2 capitalize">
                        {{ row.reservation_status }}
                      </span>

                      <div v-if="activeDropdownId === row.id" class="dropdown-popover"
                        :class="{ 'open-upward': isDropup }">
                        <button v-if="row.reservation_status !== 'pending'" @click="handleSelectStatus(row, 'pending')"
                          class="dropdown-item text-warning-item">
                          Set Pending
                        </button>

                        <button v-if="row.reservation_status !== 'confirmed'"
                          @click="handleSelectStatus(row, 'confirmed')" class="dropdown-item text-success-item">
                          Confirm Res
                        </button>

                        <button v-if="row.reservation_status !== 'completed'"
                          @click="handleSelectStatus(row, 'completed')" class="dropdown-item text-primary-item">
                          Complete Res
                        </button>

                        <button v-if="row.reservation_status !== 'cancelled'"
                          @click="handleSelectStatus(row, 'cancelled')" class="dropdown-item text-danger-item">
                          Cancel Res
                        </button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-xs text-(--color-muted) italic px-2">-</span>
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

.btn-edit-sm {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
}

.btn-edit-sm:hover {
  background-color: var(--color-primary-soft);
}

.dropdown-menu-wrapper {
  position: relative;
  display: inline-block;
}

.dropdown-popover {
  position: absolute;
  right: 0;
  top: 110%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 999;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.dropdown-popover.open-upward {
  top: auto;
  bottom: 120%;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 0.815rem;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: var(--color-surface-soft);
}

.text-warning-item {
  color: var(--color-warning);
}

.text-success-item {
  color: var(--color-success);
}

.text-danger-item {
  color: var(--color-danger);
}

.text-primary-item {
  color: var(--color-primary);
}

.ml-1 {
  margin-left: 0.25rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon-sm {
  width: 0.75rem;
  height: 0.75rem;
}
</style>