<script setup>
import { onMounted, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "../store/Payment.store";
import { useSidebar } from "@/shared/composables/useSidebar";
import TablePagination from "../components/TablePagination.vue";
import {
  formatMoney,
  formatDate,
  statusBadgeClass,
  getImageUrl,
} from "../utils/formatters";
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const store = usePaymentStore();
const { isSidebarOpen } = useSidebar();

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = computed(() => [
  { key: "all", label: t("admin.paymentMonitorPage.tabs.all") },
  { key: "submitted", label: t("admin.paymentMonitorPage.tabs.pendingVerification") },
  { key: "verified", label: t("admin.paymentMonitorPage.tabs.verified") },
  { key: "rejected", label: t("admin.paymentMonitorPage.tabs.rejected") },
]);

// ── Receipt modal state ───────────────────────────────────────────────────────
// This is the only modal left — admin can only view what was submitted,
// not act on it. There's no verify/reject endpoint on the backend for
// this role, so those controls have been removed rather than left to 404.
const receiptModal = ref({ open: false, imageUrl: null, paymentId: null });

const openReceiptModal = (payment) => {
  receiptModal.value = {
    open: true,
    paymentId: payment.id,
    imageUrl: getImageUrl(payment.receipt_image_url),
  };
};

onMounted(() => {
  store.fetchPayments();
});
</script>

<template>
  <div
    class="payment-monitor-container my-25 mx-auto px-6"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <!-- Header -->
    <header class="page-header mb-6">
      <h1 class="text-2xl font-black tracking-tight text-(--color-text)">
        {{ t("admin.paymentMonitorPage.title") }}
      </h1>
      <p class="text-sm text-(--color-muted) mt-1">
        {{ t("admin.paymentMonitorPage.subtitle") }}
      </p>
    </header>

    <!-- Error -->
    <div
      v-if="store.error && !store.loading"
      class="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500 flex items-center gap-2"
    >
      <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
      {{ store.error }}
    </div>

    <!-- Filters bar -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
    >
      <!-- Status tabs -->
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.key"
          @click="store.setStatusFilter(tab.key)"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2',
            store.statusFilter === tab.key
              ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
              : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
          ]"
        >
          {{ tab.label }}
          <span
            :class="[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              store.statusFilter === tab.key
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface-soft) text-(--color-muted)',
            ]"
          >
            {{ store.statusCounts[tab.key] ?? 0 }}
          </span>
        </button>
      </nav>

      <!-- Search -->
      <div class="relative flex items-center">
        <MagnifyingGlassIcon
          class="absolute left-3 w-4 h-4 text-(--color-muted) pointer-events-none"
        />
        <input
          type="text"
          :placeholder="t('admin.paymentMonitorPage.searchPlaceholder')"
          :value="store.searchQuery"
          @input="store.setSearchQuery($event.target.value)"
          class="pl-9 pr-4 py-2 text-sm rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30 w-full sm:w-72"
        />
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="py-24 text-center text-(--color-muted) text-sm"
    >
      {{ t("admin.paymentMonitorPage.loading") }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="store.filteredPayments.length === 0"
      class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-16 text-center"
    >
      <InboxIcon
        class="w-10 h-10 mx-auto mb-3 text-(--color-muted) opacity-50"
      />
      <p class="text-sm text-(--color-muted)">
        {{ t("admin.paymentMonitorPage.empty") }}
      </p>
    </div>

    <!-- Table -->
    <div
      v-else
      class="rounded-2xl border border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-(--color-border) bg-(--color-surface-soft)"
            >
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.id") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.customer") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.reservation") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.method") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.reference") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.amount") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.submitted") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.receipt") }}</th>
              <th class="table-th">{{ t("admin.paymentMonitorPage.columns.status") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="payment in store.pagedPayments"
              :key="payment.id"
              class="border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-soft)/60 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs text-(--color-muted)">
                #{{ payment.id }}
              </td>

              <td class="px-4 py-3">
                <p class="font-semibold">{{ payment.customer_name || "-" }}</p>
                <p class="text-xs text-(--color-muted)">
                  {{ payment.customer_email || "-" }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ payment.customer_phone || "" }}
                </p>
              </td>

              <td class="px-4 py-3 font-mono text-xs text-(--color-muted)">
                #{{ payment.reservation_id }}
              </td>

              <td class="px-4 py-3 font-medium">
                {{ payment.payment_method || "-" }}
              </td>

              <td class="px-4 py-3 font-mono text-xs text-(--color-muted)">
                {{ payment.transaction_reference || "-" }}
              </td>

              <td class="px-4 py-3 font-semibold">
                {{ formatMoney(payment.amount) }}
                <span class="text-xs text-(--color-muted) font-normal ml-1">
                  {{ payment.currency }}
                </span>
              </td>

              <td class="px-4 py-3 text-xs text-(--color-muted)">
                {{ formatDate(payment.created_at) }}
              </td>

              <!-- Receipt image thumbnail -->
              <td class="px-4 py-3">
                <button
                  v-if="payment.receipt_image_url"
                  @click="openReceiptModal(payment)"
                  class="flex items-center gap-1 text-xs text-(--color-primary) hover:underline"
                >
                  <EyeIcon class="w-3.5 h-3.5" />
                  {{ t("admin.paymentMonitorPage.receipt.view") }}
                </button>
                <span v-else class="text-xs text-(--color-muted)">—</span>
              </td>

              <td class="px-4 py-3">
                <span :class="statusBadgeClass(payment.payment_status)">
                  {{ statusLabel(payment.payment_status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TablePagination
      v-if="store.pagination.total_pages > 1"
      :current-page="store.pagination.page"
      :total-pages="store.pagination.total_pages"
      @update:current-page="store.setPage($event)"
    />
  </div>

  <!-- ── Receipt Image Modal ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="receiptModal.open"
        class="modal-overlay"
        @click.self="receiptModal.open = false"
      >
        <div class="receipt-modal-box">
          <div class="flex items-center justify-between mb-4">
            <h3 class="modal-title mb-0">
              {{ t("admin.paymentMonitorPage.modal.title", { id: receiptModal.paymentId }) }}
            </h3>
            <button
              @click="receiptModal.open = false"
              :aria-label="t('admin.paymentMonitorPage.receipt.close')"
              class="text-(--color-muted) hover:text-(--color-text) text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <img
            :src="receiptModal.imageUrl"
            :alt="t('admin.paymentMonitorPage.modal.imageAlt')"
            class="w-full rounded-xl object-contain max-h-[70vh]"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.payment-monitor-container {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.page-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

/* Table */
.table-th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  white-space: nowrap;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.receipt-modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
