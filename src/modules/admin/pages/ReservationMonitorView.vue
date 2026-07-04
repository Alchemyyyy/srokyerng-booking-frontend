<script setup>
import { onMounted, ref } from "vue";
import { useReservationStore } from "../store/Reservation.store";
import { usePaymentStore } from "../store/Payment.store";
import {
  formatMoney,
  formatDate,
  statusBadgeClass,
  getImageUrl,
} from "../utils/formatters";
import {
  EyeIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from "@heroicons/vue/24/outline";

const reservationStore = useReservationStore();
const paymentStore = usePaymentStore();

// ── Status tabs (reservation) ─────────────────────────────────────────────────
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed"];

// ── Detail panel state ────────────────────────────────────────────────────────
const detailPanel = ref({
  open: false,
  reservation: null,
  payment: null,
  loading: false,
});
const activeTab = ref("reservation"); // "reservation" | "payment" | "proof"

// ── Open detail panel — fetch matching payment ────────────────────────────────
const openDetail = async (reservation) => {
  detailPanel.value = { open: true, reservation, payment: null, loading: true };
  activeTab.value = "reservation";

  try {
    // Ensure payments are loaded
    await paymentStore.fetchPayments();
    // Find payment matching this reservation — try both possible array names
    const list = paymentStore.payments ?? paymentStore.filteredPayments ?? [];
    const match = list.find((p) => p.reservation_id === reservation.id) ?? null;
    detailPanel.value.payment = match;
  } catch {
    detailPanel.value.payment = null;
  } finally {
    detailPanel.value.loading = false;
  }
};

const closeDetail = () => {
  detailPanel.value = {
    open: false,
    reservation: null,
    payment: null,
    loading: false,
  };
};

// ── Status change (called from inside detail panel only) ──────────────────────
const handleStatusChange = async (reservation, newStatus) => {
  if (newStatus === reservation.reservation_status) return;
  await reservationStore.updateStatus(reservation.id, newStatus);

  // Keep panel in sync if it's open
  if (detailPanel.value.reservation?.id === reservation.id) {
    detailPanel.value.reservation = {
      ...detailPanel.value.reservation,
      reservation_status: newStatus,
    };
  }
};

// ── Date formatter ────────────────────────────────────────────────────────────
const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

onMounted(() => {
  reservationStore.fetchReservations();
});
</script>

<template>
  <div class="ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Reservations</h1>
      <p class="text-sm text-(--color-muted) mt-1">
        Monitor and manage all reservations across the platform.
      </p>
    </header>

    <!-- Error -->
    <div
      v-if="reservationStore.error"
      class="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500 flex items-center gap-2"
    >
      <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
      {{ reservationStore.error }}
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
    >
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.key"
          @click="reservationStore.setStatusFilter(tab.key)"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2',
            reservationStore.statusFilter === tab.key
              ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
              : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
          ]"
        >
          {{ tab.label }}
          <span
            :class="[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              reservationStore.statusFilter === tab.key
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface-soft) text-(--color-muted)',
            ]"
          >
            {{ reservationStore.statusCounts[tab.key] ?? 0 }}
          </span>
        </button>
      </nav>

      <input
        type="text"
        placeholder="Search guest, property, room..."
        :value="reservationStore.searchQuery"
        @input="reservationStore.setSearchQuery($event.target.value)"
        class="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-(--color-border) bg-(--color-surface) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="reservationStore.loading"
      class="py-24 text-center text-(--color-muted) text-sm"
    >
      Loading reservations...
    </div>

    <!-- Empty -->
    <div
      v-else-if="reservationStore.filteredReservations.length === 0"
      class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-16 text-center"
    >
      <p class="text-sm text-(--color-muted)">
        No reservations match this filter.
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
              <th class="table-th">ID</th>
              <th class="table-th">Guest</th>
              <th class="table-th">Property / Room</th>
              <th class="table-th">Owner</th>
              <th class="table-th">Dates</th>
              <th class="table-th">Amount</th>
              <th class="table-th">Status</th>
              <th class="table-th text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="reservation in reservationStore.filteredReservations"
              :key="reservation.id"
              @click="openDetail(reservation)"
              class="border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-soft)/60 transition-colors cursor-pointer"
            >
              <!-- ID -->
              <td class="px-4 py-3 font-mono text-xs text-(--color-muted)">
                #{{ reservation.id }}
              </td>

              <!-- Guest -->
              <td class="px-4 py-3">
                <p class="font-semibold">
                  {{ reservation.customer_name || "-" }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.customer_email || "-" }}
                </p>
              </td>

              <!-- Property / Room -->
              <td class="px-4 py-3">
                <p class="font-semibold text-(--color-primary)">
                  {{ reservation.property_name || "-" }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.room_name || "-" }}
                </p>
              </td>

              <!-- Owner -->
              <td class="px-4 py-3 text-(--color-muted)">
                {{ reservation.owner_name || "-" }}
              </td>

              <!-- Dates -->
              <td class="px-4 py-3">
                <p>
                  {{ formatDateOnly(reservation.check_in_date) }} →
                  {{ formatDateOnly(reservation.check_out_date) }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.total_nights }} night{{
                    reservation.total_nights !== 1 ? "s" : ""
                  }}
                </p>
              </td>

              <!-- Amount -->
              <td class="px-4 py-3 font-semibold">
                {{ formatMoney(reservation.total_amount) }}
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span :class="statusBadgeClass(reservation.reservation_status)">
                  {{ reservation.reservation_status }}
                </span>
              </td>

              <!-- Action -->
              <td class="px-4 py-3 text-center relative" @click.stop>
                <button
                  @click="openDetail(reservation)"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary-soft) transition"
                >
                  View detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════════
       DETAIL PANEL (slide-in from right)
  ══════════════════════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="panel-fade">
      <div
        v-if="detailPanel.open"
        class="panel-overlay"
        @click.self="closeDetail"
      >
        <Transition name="panel-slide">
          <div v-if="detailPanel.open" class="detail-panel">
            <!-- Panel Header -->
            <div class="panel-header">
              <div class="flex items-center gap-3">
                <div class="panel-id-badge">
                  #{{ detailPanel.reservation?.id }}
                </div>
                <div>
                  <p
                    class="font-bold leading-tight"
                    style="color: var(--color-text-inverse)"
                  >
                    {{ detailPanel.reservation?.customer_name || "-" }}
                  </p>
                  <p class="text-xs" style="color: var(--color-secondary-soft)">
                    {{ detailPanel.reservation?.customer_email || "-" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="
                    statusBadgeClass(
                      detailPanel.reservation?.reservation_status,
                    )
                  "
                >
                  {{ detailPanel.reservation?.reservation_status }}
                </span>
                <button @click="closeDetail" class="close-btn">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="panel-tabs">
              <button
                v-for="tab in [
                  { key: 'reservation', label: 'Reservation' },
                  { key: 'payment', label: 'Payment' },
                  { key: 'proof', label: 'Proof' },
                ]"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'panel-tab',
                  activeTab === tab.key ? 'panel-tab--active' : '',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Panel Body -->
            <div class="panel-body">
              <!-- Loading -->
              <div
                v-if="detailPanel.loading"
                class="py-16 text-center text-(--color-muted) text-sm"
              >
                Loading payment details…
              </div>

              <template v-else>
                <!-- ── TAB: RESERVATION ──────────────────────────────────── -->
                <div v-if="activeTab === 'reservation'" class="space-y-5">
                  <!-- Stay summary card -->
                  <div class="summary-card">
                    <div class="summary-card-top">
                      <div>
                        <p class="summary-label">Property</p>
                        <p class="summary-title">
                          {{ detailPanel.reservation?.property_name || "-" }}
                        </p>
                        <p class="text-sm text-slate-300 mt-0.5">
                          Room: {{ detailPanel.reservation?.room_name || "-" }}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="summary-label">Total</p>
                        <p class="text-2xl font-bold text-emerald-400">
                          {{
                            formatMoney(detailPanel.reservation?.total_amount)
                          }}
                        </p>
                        <p class="text-xs text-slate-400">
                          {{ detailPanel.reservation?.total_nights }} night{{
                            detailPanel.reservation?.total_nights !== 1
                              ? "s"
                              : ""
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="summary-card-bottom grid grid-cols-2 gap-4">
                      <div>
                        <p class="info-label">Check-in</p>
                        <p class="info-value">
                          <span class="text-emerald-500 mr-1">→</span>
                          {{
                            formatDateOnly(
                              detailPanel.reservation?.check_in_date,
                            )
                          }}
                        </p>
                      </div>
                      <div>
                        <p class="info-label">Check-out</p>
                        <p class="info-value">
                          <span class="text-rose-400 mr-1">←</span>
                          {{
                            formatDateOnly(
                              detailPanel.reservation?.check_out_date,
                            )
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Guest & Owner -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="info-card">
                      <p class="info-section-title">Guest</p>
                      <div class="space-y-2.5">
                        <div>
                          <p class="info-label">Name</p>
                          <p class="info-value">
                            {{ detailPanel.reservation?.customer_name || "-" }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Email</p>
                          <p class="info-value text-xs break-all">
                            {{ detailPanel.reservation?.customer_email || "-" }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="info-card">
                      <p class="info-section-title">Owner</p>
                      <div class="space-y-2.5">
                        <div>
                          <p class="info-label">Name</p>
                          <p class="info-value">
                            {{ detailPanel.reservation?.owner_name || "-" }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Reservation ID</p>
                          <p class="info-value font-mono">
                            #{{ detailPanel.reservation?.id }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Payment snapshot -->
                  <div class="info-card">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          :class="
                            detailPanel.payment
                              ? 'bg-emerald-500/10'
                              : 'bg-amber-500/10'
                          "
                        >
                          {{ detailPanel.payment ? "✅" : "⏳" }}
                        </div>
                        <div>
                          <p class="font-semibold text-sm text-(--color-text)">
                            {{
                              detailPanel.payment?.payment_method ||
                              "No payment yet"
                            }}
                          </p>
                          <p class="text-xs text-(--color-muted)">
                            {{
                              detailPanel.payment
                                ? `Submitted ${formatDate(detailPanel.payment.created_at)}`
                                : "Payment not received"
                            }}
                          </p>
                        </div>
                      </div>
                      <button
                        @click="activeTab = 'payment'"
                        class="text-xs text-(--color-primary) font-semibold hover:underline"
                      >
                        View details →
                      </button>
                    </div>
                  </div>

                  <!-- Change Status -->
                  <div class="info-card">
                    <p class="info-section-title mb-3">
                      Change Reservation Status
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="status in STATUS_OPTIONS"
                        :key="status"
                        @click="
                          handleStatusChange(detailPanel.reservation, status)
                        "
                        :disabled="reservationStore.processing"
                        :class="[
                          'px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition',
                          status === detailPanel.reservation?.reservation_status
                            ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
                            : 'border-(--color-border) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)',
                        ]"
                      >
                        {{ status }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ── TAB: PAYMENT ───────────────────────────────────────── -->
                <div v-else-if="activeTab === 'payment'" class="space-y-5">
                  <!-- No payment -->
                  <div
                    v-if="!detailPanel.payment"
                    class="rounded-2xl border border-dashed border-(--color-border) p-14 text-center"
                  >
                    <CreditCardIcon class="h-8 w-8 mx-auto mb-3 text-(--color-muted)" />
                    <p class="text-sm font-semibold text-(--color-text)">
                      No payment record
                    </p>
                    <p class="text-xs text-(--color-muted) mt-1">
                      The guest has not submitted any payment yet.
                    </p>
                  </div>

                  <template v-else>
                    <!-- Amount header -->
                    <div
                      class="rounded-2xl overflow-hidden"
                      :class="
                        detailPanel.payment.payment_status === 'verified'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-amber-500/10 border border-amber-500/20'
                      "
                    >
                      <div class="px-5 py-4 flex items-center justify-between">
                        <div>
                          <p
                            class="text-xs font-bold uppercase tracking-widest mb-1"
                            :class="
                              detailPanel.payment.payment_status === 'verified'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            "
                          >
                            {{
                              detailPanel.payment.payment_status === "verified"
                                ? "Payment Verified"
                                : "Pending Verification"
                            }}
                          </p>
                          <p class="text-2xl font-bold text-(--color-text)">
                            {{ formatMoney(detailPanel.payment.amount) }}
                            <span
                              class="text-sm font-normal text-(--color-muted) ml-1"
                              >{{ detailPanel.payment.currency }}</span
                            >
                          </p>
                        </div>
                        <span
                          :class="
                            statusBadgeClass(detailPanel.payment.payment_status)
                          "
                        >
                          {{ detailPanel.payment.payment_status }}
                        </span>
                      </div>
                    </div>

                    <!-- Payment details grid -->
                    <div class="info-card">
                      <p class="info-section-title mb-3">Payment Details</p>
                      <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p class="info-label">Payment ID</p>
                          <p class="info-value font-mono">
                            #{{ detailPanel.payment.id }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Reservation</p>
                          <p class="info-value font-mono">
                            #{{ detailPanel.payment.reservation_id }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Method</p>
                          <p class="info-value">
                            {{ detailPanel.payment.payment_method || "—" }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Reference</p>
                          <p class="info-value font-mono text-xs">
                            {{
                              detailPanel.payment.transaction_reference || "—"
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Submitted</p>
                          <p class="info-value">
                            {{ formatDate(detailPanel.payment.created_at) }}
                          </p>
                        </div>
                        <div>
                          <p class="info-label">Customer</p>
                          <p class="info-value">
                            {{ detailPanel.payment.customer_name || "—" }}
                          </p>
                        </div>
                        <div class="col-span-2">
                          <p class="info-label">Customer Email</p>
                          <p class="info-value text-xs break-all">
                            {{ detailPanel.payment.customer_email || "—" }}
                          </p>
                        </div>
                        <div
                          v-if="detailPanel.payment.customer_phone"
                          class="col-span-2"
                        >
                          <p class="info-label">Phone</p>
                          <p class="info-value">
                            {{ detailPanel.payment.customer_phone }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- View proof shortcut -->
                    <button
                      v-if="detailPanel.payment.receipt_image_url"
                      @click="activeTab = 'proof'"
                      class="w-full py-3 rounded-xl border-2 border-dashed border-(--color-border) text-(--color-muted) text-sm font-semibold hover:border-(--color-primary) hover:text-(--color-primary) transition flex items-center justify-center gap-2"
                    >
                      <EyeIcon class="w-4 h-4" />
                      View Payment Proof
                    </button>
                  </template>
                </div>

                <!-- ── TAB: PROOF ─────────────────────────────────────────── -->
                <div v-else-if="activeTab === 'proof'" class="space-y-4">
                  <p class="info-section-title">Payment Proof</p>

                  <!-- No proof -->
                  <div
                    v-if="!detailPanel.payment?.receipt_image_url"
                    class="rounded-2xl border border-dashed border-(--color-border) p-14 text-center"
                  >
                    <DocumentTextIcon class="h-8 w-8 mx-auto mb-3 text-(--color-muted)" />
                    <p class="text-sm font-semibold text-(--color-text)">
                      No proof uploaded
                    </p>
                    <p class="text-xs text-(--color-muted) mt-1">
                      The guest has not submitted a payment receipt yet.
                    </p>
                  </div>

                  <div
                    v-else
                    class="rounded-2xl border border-(--color-border) overflow-hidden"
                  >
                    <img
                      :src="getImageUrl(detailPanel.payment.receipt_image_url)"
                      alt="Payment receipt"
                      class="w-full object-contain max-h-[55vh]"
                    />
                    <div
                      class="px-5 py-4 bg-(--color-surface-soft) flex items-center justify-between border-t border-(--color-border)"
                    >
                      <div>
                        <p class="text-sm font-semibold text-(--color-text)">
                          Transfer Receipt
                        </p>
                        <p class="text-xs text-(--color-muted)">
                          {{ detailPanel.payment.transaction_reference || "—" }}
                          ·
                          {{ formatDate(detailPanel.payment.created_at) }}
                        </p>
                      </div>
                      <a
                        :href="
                          getImageUrl(detailPanel.payment.receipt_image_url)
                        "
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs px-3 py-1.5 bg-(--color-primary) text-white rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        Open ↗
                      </a>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Panel Footer -->
            <div class="panel-footer">
              <span class="text-xs" style="color: var(--color-secondary-soft)">
                Reservation #{{ detailPanel.reservation?.id }} ·
                {{ detailPanel.reservation?.property_name }}
              </span>
              <button @click="closeDetail" class="close-footer-btn">
                Close
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Table ──────────────────────────────────────────────────────────────────── */
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

/* ── Panel Overlay ──────────────────────────────────────────────────────────── */
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--color-overlay);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
}

/* ── Detail Panel ───────────────────────────────────────────────────────────── */
.detail-panel {
  width: 100%;
  max-width: 600px;
  height: 100%;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-panel);
}

/* ── Panel Header — uses surface-strong for the bold dark blue look ─────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-strong);
  flex-shrink: 0;
}

.panel-id-badge {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: monospace;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary-soft);
  transition:
    background 0.15s,
    color 0.15s;
}
.close-btn:hover {
  background: var(--color-surface-soft);
  color: var(--color-text-inverse);
}

/* ── Tabs — surface-strong matches header, primary accent for active ─────────── */
.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.5rem;
  flex-shrink: 0;
  background: var(--color-surface-strong);
}

.panel-tab {
  padding: 0.75rem 0;
  margin-right: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-secondary-soft);
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.panel-tab:hover {
  color: var(--color-text-inverse);
}
.panel-tab--active {
  color: var(--color-text-inverse);
  border-bottom-color: var(--color-secondary);
}

/* ── Panel Body ─────────────────────────────────────────────────────────────── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--color-page);
}

/* ── Panel Footer — matches header ───────────────────────────────────────────── */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-strong);
  flex-shrink: 0;
}

.close-footer-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
  transition: opacity 0.15s;
}
.close-footer-btn:hover {
  opacity: 0.88;
}

/* ── Summary Card — surface-strong top, surface body ────────────────────────── */
.summary-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}
.summary-card-top {
  background: var(--color-surface-strong);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.summary-card-bottom {
  background: var(--color-surface);
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
.summary-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-secondary-soft);
  margin-bottom: 0.25rem;
}
.summary-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-inverse);
}

/* ── Info helpers ───────────────────────────────────────────────────────────── */
.info-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.info-section-title {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}
.info-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-muted);
  margin-bottom: 0.15rem;
}
.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

/* ── Transitions ────────────────────────────────────────────────────────────── */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
