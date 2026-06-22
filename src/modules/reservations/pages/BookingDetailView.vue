<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cancellationApi } from '../api/cancellation.api'
import {
  isCancellable,
  blockedReason,
  deriveCancellationPolicy,
  cancelReservation,
} from '../services/cancellationService'
import CancellationPolicyBox     from '../components/CancellationPolicyBox.vue'
import CancelReservationModal    from '../components/CancelReservationModal.vue'
import RefundStatusBadge         from '../components/RefundStatusBadge.vue'
import ReservationStatusTimeline from '../components/ReservationStatusTimeline.vue'


const route  = useRoute()
const router = useRouter()

// ── State ────────────────────────────────────────────────────────────────────
const reservation  = ref(null)
const loading      = ref(true)
const error        = ref('')
const showModal    = ref(false)
const cancelling   = ref(false)
const cancelError  = ref('')

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchReservation() {
  loading.value = true
  error.value   = ''
  try {
    const res = await cancellationApi.getReservationById(route.params.id)
    reservation.value = res?.data?.data ?? res?.data ?? res
  } catch (e) {
    error.value = e?.response?.data?.message ?? 'Failed to load reservation details.'
  } finally {
    loading.value = false
  }
}

// ── Derived ───────────────────────────────────────────────────────────────────
const status = computed(() =>
  String(reservation.value?.reservation_status ?? '').toLowerCase()
)

const canCancel = computed(() =>
  reservation.value
    ? isCancellable(reservation.value.reservation_status, reservation.value.check_in_date)
    : false
)

const whyBlocked = computed(() =>
  blockedReason(
    reservation.value?.reservation_status ?? '',
    reservation.value?.check_in_date ?? ''
  )
)

const policy = computed(() => {
  if (!reservation.value?.check_in_date) return null
  return deriveCancellationPolicy(
    reservation.value.check_in_date,
    Number(reservation.value.total_amount) || 0
  )
})

const statusTone = computed(() => {
  if (status.value === 'completed') return 'success'
  if (status.value === 'cancelled') return 'danger'
  if (['confirmed', 'upcoming'].includes(status.value)) return 'info'
  return 'warning'
})

const isCancelledOrCompleted = computed(() =>
  ['cancelled', 'completed'].includes(status.value)
)

const timelineSteps = computed(() => {
  const r = reservation.value
  if (!r) return []

  const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const done = (cond) => cond ? 'done' : 'pending'

  const steps = [
    { label: 'Booking Created',   date: fmt(r.created_at),      state: 'done' },
    { label: 'Payment Submitted', date: '',                      state: done(['submitted','paid','verified'].includes(String(r.payment_status).toLowerCase())) },
    { label: 'Payment Verified',  date: fmt(r.verified_at),     state: done(['paid','verified'].includes(String(r.payment_status).toLowerCase())) },
    { label: 'Check-in',          date: fmt(r.check_in_date),   state: done(status.value === 'completed') },
    { label: 'Completed',         date: fmt(r.check_out_date),  state: done(status.value === 'completed') },
  ]

  if (status.value === 'cancelled') {
    steps.push({ label: 'Cancelled', date: fmt(r.updated_at), state: 'danger' })
  }

  return steps
})

// ── Cancel ────────────────────────────────────────────────────────────────────
async function handleCancel(reason) {
  cancelling.value  = true
  cancelError.value = ''
  try {
    await cancelReservation(route.params.id, reason)
    showModal.value = false
    await fetchReservation()
  } catch (e) {
    cancelError.value = e?.response?.data?.message ?? 'Failed to cancel. Please try again.'
  } finally {
    cancelling.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(fetchReservation)
</script>

<template>
  
  <div class="bv">

    <!-- Back -->
    <button class="bv__back" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Reservations
    </button>

    <!-- Loading -->
    <div v-if="loading" class="bv__center">
      <div class="bv__spinner"></div>
      <p class="bv__center-text">Loading reservation…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bv__error-card">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      <p>{{ error }}</p>
      <button class="bv__retry" @click="fetchReservation">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!reservation" class="bv__center">
      <p class="bv__center-text">Reservation not found.</p>
    </div>

    <!-- Content -->
    <template v-else>
          
      <!-- Header -->
      <div class="bv__header">
        <div class="bv__header-left">
          <p class="bv__eyebrow">Reservation · #RES-{{ reservation.id }}</p>
          <h1 class="bv__title">{{ reservation.property_name || 'Your Stay' }}</h1>
          <p class="bv__sub">{{ reservation.room_name }} <template v-if="reservation.location">· {{ reservation.location }}</template></p>
        </div>
        <span class="bv__status-badge" :class="`bv__status-badge--${statusTone}`">
          {{ reservation.reservation_status }}
        </span>
      </div>

      <!-- Dates -->
      <div class="bv__card">
        <div class="bv__dates-grid">
          <div class="bv__info-item">
            <p class="bv__info-label">Check-in</p>
            <p class="bv__info-value">{{ fmt(reservation.check_in_date) }}</p>
          </div>
          <div class="bv__dates-arrow">→</div>
          <div class="bv__info-item">
            <p class="bv__info-label">Check-out</p>
            <p class="bv__info-value">{{ fmt(reservation.check_out_date) }}</p>
          </div>
          <div class="bv__info-item">
            <p class="bv__info-label">Nights</p>
            <p class="bv__info-value">{{ reservation.total_nights ?? '—' }}</p>
          </div>
          <div class="bv__info-item">
            <p class="bv__info-label">Guests</p>
            <p class="bv__info-value">{{ reservation.total_guests ?? '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Payment & Refund status -->
      <div class="bv__card bv__card--row">
        <div class="bv__info-item">
          <p class="bv__info-label">Total Amount</p>
          <p class="bv__info-value bv__info-value--amount">${{ reservation.total_amount }}</p>
        </div>
        <div class="bv__info-item">
          <p class="bv__info-label">Payment Status</p>
          <span class="bv__payment-badge" :class="`bv__payment-badge--${String(reservation.payment_status ?? 'pending').toLowerCase()}`">
            {{ reservation.payment_status ?? 'pending' }}
          </span>
        </div>
        <div v-if="isCancelledOrCompleted" class="bv__info-item">
          <p class="bv__info-label">Refund Status</p>
          <RefundStatusBadge :status="reservation.refund_status ?? 'not_requested'" />
        </div>
      </div>

      <!-- Cancellation reason (if already cancelled) -->
      <div v-if="reservation.cancellation_reason" class="bv__card bv__card--danger">
        <p class="bv__info-label">Cancellation Reason</p>
        <p class="bv__cancelled-reason">{{ reservation.cancellation_reason }}</p>
      </div>

      <!-- Status timeline -->
      <div class="bv__card">
        <ReservationStatusTimeline :steps="timelineSteps" />
      </div>

      <!-- Cancellation policy (only if still cancellable) -->
      <CancellationPolicyBox
        v-if="policy && canCancel"
        :tone="policy.tone"
        :description="policy.description"
        :deadline="policy.deadline ?? ''"
        :refund-breakdown="policy.refundBreakdown ?? []"
      />

      <!-- Blocked message -->
      <div
        v-else-if="!canCancel && !isCancelledOrCompleted"
        class="bv__blocked"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
        <span>{{ whyBlocked }}</span>
      </div>

      <!-- Cancel button -->
      <div v-if="canCancel" class="bv__actions">
        <button class="bv__cancel-btn" @click="showModal = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          Cancel Reservation
        </button>
      </div>

    </template>

    <!-- Cancel Modal -->
    <CancelReservationModal
      :open="showModal"
      :eligible="canCancel"
      :blocked-reason="whyBlocked"
      :policy="policy"
      :refund-amount="policy?.refundAmount ?? null"
      :loading="cancelling"
      :error="cancelError"
      @close="showModal = false; cancelError = ''"
      @confirm="handleCancel"
    />

  </div>
</template>

<style scoped>
.bv {
  max-width: 680px;
  margin: 0 auto;
  padding: 6rem 1.25rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Back button */
.bv__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0;
  margin-bottom: 0.5rem;
  transition: color 0.15s;
}
.bv__back:hover { color: var(--color-primary); }

/* Loading / empty */
.bv__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
}
.bv__center-text { color: var(--color-muted); font-size: 0.9rem; margin: 0; }

.bv__spinner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error card */
.bv__error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem;
  border: 1px solid rgba(220,53,69,0.2);
  border-radius: 20px;
  background: rgba(220,53,69,0.04);
  text-align: center;
  color: #dc3545;
  font-size: 0.9rem;
}
.bv__retry {
  background: none;
  border: 1px solid rgba(220,53,69,0.3);
  color: #dc3545;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Header */
.bv__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.bv__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.bv__title {
  margin: 0.2rem 0 0;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.bv__sub {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--color-muted);
}

.bv__status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
  border: 1px solid transparent;
  flex-shrink: 0;
  margin-top: 0.4rem;
}
.bv__status-badge--success { background: rgba(29,158,117,0.1);  color: #1d9e75; border-color: rgba(29,158,117,0.25); }
.bv__status-badge--danger  { background: rgba(220,53,69,0.1);   color: #dc3545; border-color: rgba(220,53,69,0.25); }
.bv__status-badge--info    { background: rgba(55,138,221,0.1);  color: var(--color-primary); border-color: rgba(55,138,221,0.25); }
.bv__status-badge--warning { background: rgba(239,159,39,0.12); color: #c97c0a; border-color: rgba(239,159,39,0.3); }

/* Cards */
.bv__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.25rem;
}

.bv__card--row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
}

.bv__card--danger {
  background: rgba(220,53,69,0.04);
  border-color: rgba(220,53,69,0.2);
}

.bv__dates-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto auto;
  gap: 1rem;
  align-items: center;
}

.bv__dates-arrow {
  font-size: 1.1rem;
  color: var(--color-muted);
  text-align: center;
}

.bv__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bv__info-label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
}

.bv__info-value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.bv__info-value--amount {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.bv__payment-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft, #f3f4f6);
  color: var(--color-muted);
}
.bv__payment-badge--paid, .bv__payment-badge--verified {
  background: rgba(29,158,117,0.1); color: #1d9e75; border-color: rgba(29,158,117,0.25);
}
.bv__payment-badge--submitted {
  background: rgba(55,138,221,0.1); color: var(--color-primary); border-color: rgba(55,138,221,0.25);
}
.bv__payment-badge--failed, .bv__payment-badge--rejected {
  background: rgba(220,53,69,0.1); color: #dc3545; border-color: rgba(220,53,69,0.25);
}

.bv__cancelled-reason {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

/* Blocked banner */
.bv__blocked {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  background: rgba(220,53,69,0.05);
  border: 1px solid rgba(220,53,69,0.2);
  border-radius: 14px;
  font-size: 0.875rem;
  color: #dc3545;
}

/* Actions */
.bv__actions {
  display: flex;
  justify-content: flex-end;
}

.bv__cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  background: transparent;
  border: 1.5px solid rgba(220,53,69,0.4);
  color: #dc3545;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.bv__cancel-btn:hover {
  background: rgba(220,53,69,0.07);
  border-color: #dc3545;
}

/* Responsive */
@media (max-width: 600px) {
  .bv { padding: 5rem 1rem 4rem; }
  .bv__title { font-size: 1.4rem; }
  .bv__header { flex-direction: column; }
  .bv__dates-grid { grid-template-columns: 1fr 1fr; }
  .bv__dates-arrow { display: none; }
  .bv__card--row { flex-direction: column; align-items: flex-start; }
}
</style>