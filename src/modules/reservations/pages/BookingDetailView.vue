<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import { useToastStore } from "@/shared/store/toastStore";
import { cancellationApi } from "../api/cancellation.api";
import {
  isCancellable,
  blockedReason,
  deriveCancellationPolicy,
  cancelReservation,
} from "../services/cancellationService";
import RefundStatusBadge from "../components/RefundStatusBadge.vue";

const route  = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const toast  = useToastStore();

// ── State ─────────────────────────────────────────────────
const reservation          = ref(null);
const loading              = ref(true);
const error                = ref("");
const cancelling           = ref(false);
const cancelError          = ref("");
const showConfirm          = ref(false);
const cancelReason         = ref("");
const reasonError          = ref("");
const paymentId            = ref(null);
const fetchedPaymentStatus = ref("");
const propertyImage        = ref(null);

// ── Fetch property image ──────────────────────────────────
async function fetchPropertyImage(propId, reservationData) {
  const embedded =
    reservationData?.property_image ??
    reservationData?.image_url ??
    reservationData?.cover_image ??
    reservationData?.thumbnail ??
    null;

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
  const origin  = apiBase.replace(/\/api$/, "");

  if (embedded) {
    propertyImage.value = embedded.startsWith("http") ? embedded : `${origin}${embedded}`;
    return;
  }

  if (!propId) return;

  try {
    const res = await cancellationApi.getPropertyImages(propId);
    let images = res?.data?.data ?? res?.data ?? res ?? [];
    if (!Array.isArray(images)) images = images ? [images] : [];
    if (!images.length) return;

    const cover = images.find(img => img.is_cover) ?? images[0];
    const raw   = cover?.image_url ?? cover?.url ?? cover?.path ?? cover?.src ?? null;
    if (!raw) return;

    propertyImage.value = raw.startsWith("http") ? raw : `${origin}${raw}`;
  } catch {
    // silently ignore
  }
}

// ── Fetch payment ─────────────────────────────────────────
async function fetchPayment(reservationId) {
  try {
    const res      = await cancellationApi.getMyPayments();
    const payments = res?.data?.data ?? res?.data ?? res ?? [];
    const arr      = Array.isArray(payments) ? payments : [payments];
    const match    = arr.find(p =>
      p.reservation_id === reservationId || p.reservation_id === Number(reservationId)
    );
    if (match) {
      paymentId.value            = match.id;
      fetchedPaymentStatus.value = String(match.payment_status ?? "").toLowerCase();
    }
  } catch (err) {
    console.error("[BookingDetail] fetchPayment failed:", err);
  }
}

// ── Fetch reservation ─────────────────────────────────────
async function fetchReservation() {
  loading.value = true;
  error.value   = "";
  try {
    const res = await cancellationApi.getReservationById(route.params.id);
    reservation.value = res?.data?.data ?? res?.data ?? res;
    await Promise.all([
      fetchPropertyImage(reservation.value?.property_id, reservation.value),
      fetchPayment(route.params.id),
    ]);
  } catch (e) {
    error.value = e?.response?.data?.message ?? t("reservationDetail.error");
  } finally {
    loading.value = false;
  }
}

// ── Computed ──────────────────────────────────────────────
const status = computed(() =>
  String(reservation.value?.reservation_status ?? "").toLowerCase()
);

const paymentStatus = computed(() =>
  fetchedPaymentStatus.value ||
  String(reservation.value?.payment_status ?? "").toLowerCase()
);

// Normalized: maps backend variants to canonical values used in all logic
// backend "paid"      → "verified"  (money confirmed received)
// backend "failed"    → "rejected"  (slip invalid / rejected by admin)
// backend "submitted" → "pending"   (slip uploaded, awaiting review)
const paymentStatusNorm = computed(() => {
  const raw = paymentStatus.value;
  if (raw === "paid")      return "verified";
  if (raw === "failed")    return "rejected";
  if (raw === "submitted") return "pending";
  return raw;
});

// backend refund_requests.refund_status is "requested" while awaiting the
// owner's decision — RefundStatusBadge expects "pending" for that same state.
const refundStatusNorm = computed(() => {
  const raw = String(reservation.value?.refund_status ?? "").toLowerCase();
  if (raw === "requested") return "pending";
  return raw || "not_requested";
});

const canCancel = computed(() => {
  if (!reservation.value) return false;
  const resStatus = status.value;
  const pmtStatus = paymentStatusNorm.value; // normalized: paid→verified, failed→rejected, submitted→pending

  // Terminal states — hide cancel entirely
  if (resStatus === "cancelled" || resStatus === "completed") return false;

  // PENDING + no-payment / pending / rejected → cancel only, no refund
  if (resStatus === "pending") {
    if (!pmtStatus || pmtStatus === "pending" || pmtStatus === "rejected") return true;
    // verified payment while PENDING → refund flow on detail page (shouldn't normally happen)
    return false;
  }

  // CONFIRMED + any payment state → deadline-gated
  if (resStatus === "confirmed") {
    return isCancellable(reservation.value.reservation_status, reservation.value.check_in_date);
  }

  return false;
});

// Use normalized status so "failed" also triggers re-upload banner
const paymentRejected = computed(() => paymentStatusNorm.value === "rejected");

const canPay = computed(() =>
  ["pending", "confirmed"].includes(status.value) && !paymentId.value
);

const isCancelledOrCompleted = computed(() =>
  ["cancelled", "completed"].includes(status.value)
);

const whyBlocked = computed(() =>
  blockedReason(
    reservation.value?.reservation_status ?? "",
    reservation.value?.check_in_date ?? "",
    t
  )
);

const policy = computed(() => {
  if (!reservation.value?.check_in_date) return null;
  return deriveCancellationPolicy(
    reservation.value.check_in_date,
    Number(reservation.value.total_amount) || 0,
    t
  );
});

const statusConfig = computed(() => {
  const map = {
    pending:   { color: "var(--color-warning)", bg: "var(--color-warning-soft)", border: "var(--color-warning)", dot: true  },
    confirmed: { color: "var(--color-primary)", bg: "var(--color-primary-soft)", border: "var(--color-primary)", dot: false },
    cancelled: { color: "var(--color-danger)",  bg: "var(--color-danger-soft)",  border: "var(--color-danger)",  dot: false },
    completed: { color: "var(--color-success)", bg: "var(--color-success-soft)", border: "var(--color-success)", dot: false },
  };
  return map[status.value] ?? map.pending;
});

// ── Actions ───────────────────────────────────────────────
async function handleCancel() {
  if (!cancelReason.value.trim()) {
    reasonError.value = t("reservationDetail.form.reasonError");
    return;
  }
  reasonError.value = "";
  cancelling.value  = true;
  cancelError.value = "";
  try {
    const cancelResult = await cancelReservation(route.params.id, cancelReason.value.trim());

    // The backend already auto-creates a refund request when eligible (see
    // cancelReservation's `refund_info`) — only fall back to a manual request
    // here if that auto-creation didn't happen (e.g. it failed server-side).
    const resStatus = status.value;
    const pmtStatus = paymentStatusNorm.value; // normalized
    if (resStatus === "confirmed" && pmtStatus === "verified" && !cancelResult?.refund_info) {
      const amount = Number(reservation.value?.total_amount) || 0;
      // policy.refundAmount already accounts for deadline (full vs 50%)
      const refundAmount = policy.value?.refundAmount ?? amount;
      try {
        await cancellationApi.requestRefund(route.params.id, {
          amount: refundAmount,
          reason: cancelReason.value.trim(),
        });
      } catch (refundErr) {
        // Cancellation succeeded; refund request failed — surface a warning but don't block
        console.warn("[BookingDetail] Refund request failed after cancel:", refundErr);
      }
    }
    // PENDING + null/pending/rejected → no refund (nothing to refund)

    toast.success(t("reservationDetail.toast.successMessage"), {
      title: t("reservationDetail.toast.successTitle"),
    });
    setTimeout(() => router.push({ name: "customer.booking-history" }), 1500);
  } catch (e) {
    cancelError.value = e?.response?.data?.message ?? t("reservationDetail.form.cancelError");
  } finally {
    cancelling.value = false;
  }
}

// ── Helpers ───────────────────────────────────────────────
function fmt(d) {
  if (!d) return "—";
  const loc = locale.value === "km" ? "km-KH" : "en-US";
  return new Date(d).toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

onMounted(fetchReservation);
</script>

<template>
  <div class="page">
    <PublicNavbar />

    <!-- Loading -->
    <div v-if="loading" class="state-center">
      <div class="spinner"></div>
      <p class="state-text">{{ t("reservationDetail.loading") }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-center">
      <div class="error-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <p class="state-text" style="color:#ef4444">{{ error }}</p>
      <button class="btn-retry" @click="fetchReservation">{{ t("reservationDetail.retry") }}</button>
    </div>

    <!-- Content -->
    <template v-else-if="reservation">
      <div class="wrapper">

        <!-- ── Top Bar ── -->
        <div class="topbar">
          <button class="btn-back" @click="router.back()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {{ t("reservationDetail.back") }}
          </button>
          <div class="topbar-center">
            <h1 class="topbar-title">{{ t("reservationDetail.title") }}</h1>
            <span class="res-badge">#RES-{{ reservation.id }}</span>
          </div>
          <div class="status-pill" :style="{ background: statusConfig.bg, borderColor: statusConfig.border, color: statusConfig.color }">
            <span v-if="statusConfig.dot" class="status-dot" :style="{ background: statusConfig.color }"></span>
            {{ reservation.reservation_status }}
          </div>
        </div>

        <!-- ── Main Booking Card ── -->
        <div class="booking-card">
          <!-- Image side -->
          <div class="booking-img-side">
            <img v-if="propertyImage" :src="propertyImage" class="booking-img" />
            <div v-else class="booking-img-placeholder">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="booking-img-overlay"></div>
            <div class="booking-img-info">
              <div class="img-prop-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <p class="img-eyebrow">{{ t("reservationDetail.bookingSummary.label") }}</p>
              <h2 class="img-prop-name">{{ reservation.property_name || "Property" }}</h2>
              <p class="img-room-name">{{ reservation.room_name }}</p>
            </div>
          </div>

          <!-- Details side -->
          <div class="booking-details-side">
            <div class="dates-grid">
              <div class="date-col">
                <div class="date-icon date-icon--blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01" stroke-width="2.5"/>
                  </svg>
                </div>
                <span class="date-label">{{ t("reservationDetail.bookingSummary.checkIn") }}</span>
                <span class="date-value">{{ fmt(reservation.check_in_date) }}</span>
                <span class="date-time">{{ fmtTime(reservation.check_in_date) }}</span>
              </div>
              <div class="date-divider"></div>
              <div class="date-col">
                <div class="date-icon date-icon--green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="M9 14l2 2 4-4" stroke-width="2.5"/>
                  </svg>
                </div>
                <span class="date-label">{{ t("reservationDetail.bookingSummary.checkOut") }}</span>
                <span class="date-value">{{ fmt(reservation.check_out_date) }}</span>
                <span class="date-time">{{ fmtTime(reservation.check_out_date) }}</span>
              </div>
              <div class="date-divider"></div>
              <div class="date-col date-col--center">
                <div class="date-icon date-icon--purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </div>
                <span class="date-label">{{ t("reservationDetail.bookingSummary.nights") }}</span>
                <span class="date-value">{{ reservation.total_nights ?? "—" }}</span>
                <span class="date-time">{{ t("reservationDetail.bookingSummary.nights") }}</span>
              </div>
              <div class="date-divider"></div>
              <div class="date-col date-col--center">
                <div class="date-icon date-icon--amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span class="date-label">{{ t("reservationDetail.bookingSummary.guests") }}</span>
                <span class="date-value">{{ reservation.total_guests ?? "—" }}</span>
                <span class="date-time">{{ t("reservationDetail.bookingSummary.guests") }}</span>
              </div>
            </div>

            <div class="details-divider"></div>

            <div class="payment-row">
              <div class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.totalPaid") }}</span>
                <span class="payment-amount">${{ reservation.total_amount }}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.payment") }}</span>
                <span class="pay-badge" :class="`pay-badge--${paymentStatus || 'pending'}`">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {{ paymentStatus || "Pending" }}
                </span>
              </div>
              <div v-if="isCancelledOrCompleted" class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.refund") }}</span>
                <RefundStatusBadge :status="refundStatusNorm" />
              </div>
            </div>
          </div>
        </div>

        <!-- ── Cancelled Reason ── -->
        <div v-if="reservation.cancellation_reason" class="cancel-reason-card">
          <div class="cancel-reason-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </div>
          <div>
            <p class="cancel-reason-label">{{ t("reservationDetail.cancellationReason.label") }}</p>
            <p class="cancel-reason-text">{{ reservation.cancellation_reason }}</p>
          </div>
        </div>

        <!-- ── Cancellation Policy ── -->
        <div v-if="policy && paymentStatusNorm === 'verified'" class="policy-card" :class="`policy-card--${policy.tone}`">
          <div class="policy-top">
            <div class="policy-icon" :class="`policy-icon--${policy.tone}`">
              <svg v-if="policy.tone === 'free'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
              </svg>
              <svg v-else-if="policy.tone === 'partial'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8M8 12h8"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </div>
            <div class="policy-text">
              <p class="policy-eyebrow">{{ t("reservationDetail.policy.label") }}</p>
              <p class="policy-title">
                {{ policy.tone === "free" ? t("reservationDetail.policy.free") : policy.tone === "partial" ? t("reservationDetail.policy.partial") : t("reservationDetail.policy.strict") }}
              </p>
            </div>
            <div class="policy-refund-block" :class="`policy-refund-block--${policy.tone}`">
              <p class="policy-refund-eyebrow">{{ t("reservationDetail.policy.youReceive") }}</p>
              <p class="policy-refund-amount">${{ Number(policy.refundAmount ?? 0).toFixed(2) }}</p>
              <span v-if="policy.tone === 'partial'" class="refund-tag">50% REFUND</span>
            </div>
          </div>
          <p class="policy-desc">{{ policy.description }}</p>
          <div v-if="policy.deadline" class="policy-deadline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span>{{ t("reservationDetail.policy.cancelBy", { deadline: policy.deadline }) }}</span>
          </div>
          <div v-if="policy.refundBreakdown?.length" class="breakdown">
            <div v-for="row in policy.refundBreakdown" :key="row.label" class="breakdown-row">
              <div class="breakdown-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <span>{{ row.label }}</span>
              </div>
              <span class="breakdown-val" :class="`breakdown-val--${row.type}`">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- ── Blocked banner ── -->
        <div v-else-if="!canCancel && !isCancelledOrCompleted && !(status === 'cancelled' && paymentStatusNorm === 'verified')" class="blocked-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          <span>{{ whyBlocked }}</span>
        </div>

        <!-- ── Re-upload banner ── -->
        <div v-if="paymentRejected" class="reupload-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>{{ t("reservationDetail.blocked.paymentRejected") }}</span>
          <button class="btn-reupload" @click="router.push({ name: 'customer.payment-upload', params: { paymentId: paymentId } })">
            {{ t("reservationDetail.actions.reupload") }}
          </button>
        </div>

        <!-- ── Notice Card ── -->
        <div v-if="canCancel" class="notice-card">
          <div class="notice-body">
            <div class="notice-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="notice-content">
              <p class="notice-title">{{ t("reservationDetail.notice.title") }}</p>
              <ul class="notice-list">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.4">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>{{ t("reservationDetail.notice.irreversible") }}</span>
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.4">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  <span>{{ t("reservationDetail.notice.refundTime") }}</span>
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.4">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 15.01 9 12.01"/>
                  </svg>
                  <span>{{ t("reservationDetail.notice.notification") }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ── Cancel Reason Textarea ── -->
        <div v-if="canCancel && showConfirm" class="reason-card">
          <label class="reason-label">
            {{ t("reservationDetail.form.reasonLabel") }}<span class="required">*</span>
          </label>
          <textarea
            v-model="cancelReason"
            class="reason-textarea"
            rows="3"
            maxlength="500"
            :placeholder="t('reservationDetail.form.reasonPlaceholder')"
            :disabled="cancelling"
          />
          <div class="reason-footer">
            <span class="reason-error">{{ reasonError }}</span>
            <span class="char-count">{{ cancelReason.length }}/500</span>
          </div>
          <p v-if="cancelError" class="cancel-api-error">{{ cancelError }}</p>
        </div>

        <!-- ── Sticky Action Bar ── -->
        <div v-if="canCancel || canPay" class="action-bar">
          <button v-if="canCancel" class="btn-keep" @click="showConfirm ? (showConfirm = false) : router.back()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ showConfirm ? t("reservationDetail.actions.goBack") : t("reservationDetail.actions.keep") }}
          </button>
          <button v-if="canPay" class="btn-pay"
            @click="router.push({ name: 'customer.payment-upload', params: { paymentId: paymentId } })">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            {{ t("reservationDetail.actions.payNow") }}
          </button>
          <button v-if="canCancel && !showConfirm" class="btn-cancel" @click="showConfirm = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            {{ t("reservationDetail.actions.cancel") }}
          </button>
          <button v-else-if="canCancel" class="btn-cancel" :disabled="cancelling" @click="handleCancel">
            <span v-if="cancelling" class="btn-spin"></span>
            {{ cancelling ? t("reservationDetail.actions.cancelling") : t("reservationDetail.actions.confirm") }}
          </button>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.page { min-height: 100vh; background: var(--color-page); padding-bottom: 6rem; }

/* States */
.state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; min-height: 70vh; color: var(--color-muted); font-size: 0.9rem; }
.spinner { width: 38px; height: 38px; border-radius: 50%; border: 3px solid var(--color-border); border-top-color: var(--color-primary); animation: spin 0.8s linear infinite; }
.state-text { margin: 0; }
.error-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--color-danger-soft); color: var(--color-danger); display: flex; align-items: center; justify-content: center; }
.btn-retry { background: none; border: 1.5px solid var(--color-danger); color: var(--color-danger); padding: 0.55rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Wrapper */
.wrapper { max-width: 820px; margin: 0 auto; padding: 6.5rem 1.25rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* Top bar */
.topbar { display: flex; align-items: center; gap: 0.85rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 18px; padding: 0.85rem 1.1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); flex-wrap: wrap; }
.btn-back { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--color-surface-soft); border: 1px solid var(--color-border); color: var(--color-text); padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.btn-back:hover { background: var(--color-primary-soft); border-color: var(--color-primary); color: var(--color-primary); }
.topbar-center { flex: 1; display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
.topbar-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--color-text); letter-spacing: -0.02em; }
.res-badge { font-size: 0.7rem; font-weight: 700; color: var(--color-muted); background: var(--color-surface-soft); border: 1px solid var(--color-border); padding: 0.2rem 0.65rem; border-radius: 8px; font-family: monospace; }
.status-pill { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 1rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; text-transform: capitalize; border: 1.5px solid; flex-shrink: 0; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

/* Booking card */
.booking-card { display: flex; border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-card); background: var(--color-surface); border: 1px solid var(--color-border); min-height: 300px; }
.booking-img-side { width: 40%; min-width: 180px; position: relative; background: linear-gradient(135deg, #0f172a, #1e3a5f); flex-shrink: 0; }
.booking-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.booking-img-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.booking-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.08) 100%); }
.booking-img-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem 1.25rem; z-index: 1; }
.img-prop-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 0.55rem; }
.img-eyebrow { margin: 0; font-size: 0.58rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.55); }
.img-prop-name { margin: 0.2rem 0 0; font-size: 1.25rem; font-weight: 800; color: white; letter-spacing: -0.02em; line-height: 1.2; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.img-room-name { margin: 0.2rem 0 0; font-size: 0.78rem; color: rgba(255,255,255,0.65); font-weight: 500; }
.booking-details-side { flex: 1; padding: 1.75rem 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; justify-content: center; }

/* Dates */
.dates-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  background: var(--color-surface-soft); border: 1px solid var(--color-border);
  border-radius: 16px; padding: 1rem 0.25rem;
  overflow: hidden;
}
.date-col {
  display: flex; flex-direction: column; gap: 0.2rem;
  align-items: center;
  padding: 0 0.5rem;
  border-right: 1px solid var(--color-border);
  min-width: 0;
  overflow: hidden;
}
.date-col:last-child { border-right: none; }
.date-col--center { align-items: center; }
.date-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.3rem; }
.date-icon--blue   { background: rgba(59,130,246,0.1);  color: #3b82f6; }
.date-icon--green  { background: rgba(16,185,129,0.1);  color: #10b981; }
.date-icon--purple { background: rgba(139,92,246,0.1);  color: #8b5cf6; }
.date-icon--amber  { background: rgba(245,158,11,0.1);  color: #f59e0b; }
.date-divider { display: none; }
.date-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-muted); white-space: nowrap; }
.date-value { font-size: 0.82rem; font-weight: 800; color: var(--color-text); white-space: nowrap; }
.date-time  { font-size: 0.68rem; color: var(--color-muted); white-space: nowrap; }
.details-divider { height: 1px; background: var(--color-border); }

/* Payment */
.payment-row { display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap; }
.payment-item { display: flex; flex-direction: column; gap: 0.35rem; }
.payment-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-muted); }
.payment-amount { font-size: 1.65rem; font-weight: 900; color: var(--color-text); letter-spacing: -0.03em; }
.pay-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; border: 1.5px solid var(--color-border); background: var(--color-surface-soft); color: var(--color-muted); }
.pay-badge--paid, .pay-badge--verified { background: rgba(16,185,129,0.08); color: #10b981; border-color: rgba(16,185,129,0.25); }
.pay-badge--submitted { background: rgba(59,130,246,0.08); color: #3b82f6; border-color: rgba(59,130,246,0.25); }
.pay-badge--failed    { background: rgba(239,68,68,0.08);  color: #ef4444; border-color: rgba(239,68,68,0.25); }
.pay-badge--refunded  { background: rgba(59,130,246,0.08);  color: #3b82f6; border-color: rgba(59,130,246,0.25); }

/* Cancelled reason */
.cancel-reason-card { display: flex; align-items: flex-start; gap: 1rem; background: var(--color-surface); border: 1px solid var(--color-danger); border-radius: 18px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 4px rgba(239,68,68,0.06); }
.cancel-reason-icon { width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; background: rgba(239,68,68,0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; }
.cancel-reason-label { margin: 0; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #ef4444; }
.cancel-reason-text { margin: 0.35rem 0 0; font-size: 0.9rem; color: var(--color-text); line-height: 1.5; }

/* Policy card */
.policy-card { background: var(--color-surface); border-radius: 20px; padding: 1.5rem; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.policy-card--free    { border-color: var(--color-accent); }
.policy-card--partial { border-color: var(--color-accent); }
.policy-card--strict  { border-color: var(--color-danger); }
.policy-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.policy-icon { width: 50px; height: 50px; border-radius: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.policy-icon--free    { background: rgba(245,158,11,0.1);  color: #d97706; }
.policy-icon--partial { background: rgba(245,158,11,0.1);  color: #d97706; }
.policy-icon--strict  { background: rgba(239,68,68,0.1);   color: #ef4444; }
.policy-text { flex: 1; }
.policy-eyebrow { margin: 0; font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-muted); }
.policy-title { margin: 0.2rem 0 0; font-size: 1.15rem; font-weight: 800; color: var(--color-text); }
.policy-refund-block { text-align: right; flex-shrink: 0; background: var(--color-surface-soft); border-radius: 14px; padding: 0.75rem 1rem; border: 1px solid var(--color-border); }
.policy-refund-block--free    { background: var(--color-accent-soft); border-color: var(--color-accent); }
.policy-refund-block--partial { background: var(--color-accent-soft); border-color: var(--color-accent); }
.policy-refund-eyebrow { margin: 0; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-muted); }
.policy-refund-amount { margin: 0.15rem 0; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.03em; }
.policy-card--free    .policy-refund-amount { color: #d97706; }
.policy-card--partial .policy-refund-amount { color: #d97706; }
.policy-card--strict  .policy-refund-amount { color: var(--color-muted); }
.refund-tag { display: inline-block; font-size: 0.6rem; font-weight: 800; background: rgba(245,158,11,0.12); color: #d97706; padding: 0.18rem 0.55rem; border-radius: 6px; letter-spacing: 0.08em; }
.policy-desc { font-size: 0.875rem; color: var(--color-muted); margin: 0 0 1rem; line-height: 1.65; }
.policy-deadline { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: var(--color-text); background: var(--color-surface-soft); border: 1px solid var(--color-border); padding: 0.7rem 0.95rem; border-radius: 12px; margin-bottom: 1rem; }
.breakdown { border: 1px solid var(--color-border); border-radius: 14px; overflow: hidden; }
.breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid var(--color-border); }
.breakdown-row:last-child { border-bottom: none; }
.breakdown-left { display: flex; align-items: center; gap: 0.5rem; color: var(--color-muted); }
.breakdown-val { font-weight: 700; }
.breakdown-val--full    { color: #10b981; }
.breakdown-val--partial { color: #d97706; }
.breakdown-val--none    { color: #ef4444; }

/* Blocked */
.blocked-banner { display: flex; align-items: center; gap: 0.65rem; padding: 1rem 1.1rem; background: var(--color-surface); border: 1px solid var(--color-danger); border-radius: 16px; font-size: 0.875rem; color: var(--color-danger); box-shadow: 0 1px 4px rgba(239,68,68,0.06); }

/* Re-upload */
.reupload-banner { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.1rem; background: var(--color-accent-soft); border: 1px solid var(--color-accent); border-radius: 16px; font-size: 0.875rem; color: var(--color-accent); }
.btn-reupload { margin-left: auto; background: var(--color-accent); border: none; color: white; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }

/* Notice card */
.notice-card { background: var(--color-danger-soft); border: 1.5px solid var(--color-danger); border-radius: 20px; padding: 1.35rem 1.5rem; box-shadow: 0 2px 12px rgba(239,68,68,0.06); }
.notice-body { display: flex; align-items: flex-start; gap: 0.85rem; }
.notice-icon { width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0; background: var(--color-danger-soft); display: flex; align-items: center; justify-content: center; }
.notice-content { flex: 1; }
.notice-title { margin: 0 0 0.75rem; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-danger); }
.notice-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.85rem; }
.notice-list li { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.875rem; color: var(--color-text); line-height: 1.55; }
.notice-list svg { flex-shrink: 0; margin-top: 2px; }

/* Reason card */
.reason-card { background: var(--color-surface); border: 1px solid var(--color-danger); border-radius: 18px; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 1px 6px rgba(239,68,68,0.06); }
.reason-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text); }
.required { color: var(--color-danger); margin-left: 2px; }
.reason-textarea { width: 100%; padding: 0.85rem; border: 1.5px solid var(--color-border); border-radius: 12px; background: var(--color-surface-soft); color: var(--color-text); font-size: 0.9rem; line-height: 1.5; resize: vertical; outline: none; transition: border-color 0.2s, background 0.2s; font-family: inherit; }
.reason-textarea:focus { border-color: var(--color-primary); background: var(--color-surface); }
.reason-textarea:disabled { opacity: 0.6; }
.reason-footer { display: flex; justify-content: space-between; align-items: center; }
.reason-error { font-size: 0.78rem; color: var(--color-danger); font-weight: 600; }
.char-count   { font-size: 0.72rem; color: var(--color-muted); }
.cancel-api-error { padding: 0.7rem 0.9rem; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; color: var(--color-danger); font-size: 0.83rem; font-weight: 600; margin: 0; }

/* Action bar */
.action-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; position: sticky; bottom: 1.25rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 20px; padding: 1rem 1.1rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
.btn-keep { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem 1rem; border: 1.5px solid var(--color-border); border-radius: 14px; background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-keep:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-soft); }
.btn-pay { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem 1rem; background: #10b981; border: none; border-radius: 14px; color: white; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-pay:hover { background: #059669; }
.btn-cancel { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem 1rem; background: var(--color-danger); border: none; border-radius: 14px; color: white; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
.btn-cancel:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
.btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
.btn-spin { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; animation: spin 0.7s linear infinite; flex-shrink: 0; }

/* Responsive */
@media (max-width: 640px) {
  .wrapper { padding: 5.5rem 0.85rem 2rem; }
  .booking-card { flex-direction: column; }
  .booking-img-side { width: 100%; min-height: 200px; }
  .booking-details-side { padding: 1.25rem; }
  .dates-grid { grid-template-columns: repeat(2, 1fr); row-gap: 1rem; padding: 0.9rem 0.25rem; }
  .date-col:nth-child(2) { border-right: none; }
  .date-divider { display: none; }
  .policy-top { flex-wrap: wrap; }
  .policy-refund-block { text-align: left; width: 100%; }
  .action-bar { grid-template-columns: 1fr; position: relative; bottom: 0; }
  .topbar { padding: 0.75rem; }
  .topbar-title { font-size: 0.95rem; }
}
</style>