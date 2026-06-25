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

const reservation  = ref(null);
const loading      = ref(true);
const error        = ref("");
const cancelling   = ref(false);
const cancelError  = ref("");
const showConfirm  = ref(false);
const cancelReason = ref("");
const reasonError  = ref("");
const propertyImage = ref(null);

async function fetchPropertyImage(propertyId, reservationData) {
  // Layer 1: image already embedded directly in the reservation object
  const embedded =
    reservationData?.property_image ??
    reservationData?.image_url ??
    reservationData?.cover_image ??
    reservationData?.thumbnail ??
    null;

  if (embedded) {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api$/, "");
    propertyImage.value = embedded.startsWith("http") ? embedded : `${origin}${embedded}`;
    console.log("[IMG] set from embedded reservation field:", propertyImage.value);
    return;
  }

  // Layer 2: call /properties/:id/images
  if (!propertyId) {
    console.warn("[IMG] no property_id and no embedded image — cannot load image");
    return;
  }

  try {
    const res = await cancellationApi.getPropertyImages(propertyId);

    console.log("[IMG] raw API response:", JSON.stringify(res?.data));

    let images = res?.data?.data ?? res?.data ?? res ?? [];
    if (!Array.isArray(images)) images = images ? [images] : [];

    console.log("[IMG] images array length:", images.length, "| first item:", images[0]);

    if (images.length === 0) {
      console.warn("[IMG] API returned 0 images for property_id:", propertyId);
      return;
    }

    const cover = images.find(img => img.is_cover) ?? images[0];
    console.log("[IMG] cover object keys:", Object.keys(cover ?? {}), "| full object:", cover);

    const raw =
      cover?.image_url ??
      cover?.url ??
      cover?.path ??
      cover?.src ??
      cover?.filename ??
      cover?.photo_url ??
      null;

    if (!raw) {
      console.warn("[IMG] cover object has no recognised URL field. Keys:", Object.keys(cover ?? {}));
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api$/, "");
    propertyImage.value = raw.startsWith("http") ? raw : `${origin}${raw}`;
    console.log("[IMG] ✅ final URL:", propertyImage.value);
  } catch (err) {
    console.error("[IMG] fetch failed for property_id:", propertyId, err);
  }
}

async function fetchReservation() {
  loading.value = true;
  error.value   = "";
  try {
    const res = await cancellationApi.getReservationById(route.params.id);
    reservation.value = res?.data?.data ?? res?.data ?? res;
    console.log("[IMG] reservation object keys:", Object.keys(reservation.value ?? {}));
    const propertyId = reservation.value?.property_id;
    await fetchPropertyImage(propertyId, reservation.value);
  } catch (e) {
    error.value = e?.response?.data?.message ?? t("reservationDetail.error");
  } finally {
    loading.value = false;
  }
}

const status = computed(() =>
  String(reservation.value?.reservation_status ?? "").toLowerCase()
);

const canCancel = computed(() =>
  reservation.value
    ? isCancellable(reservation.value.reservation_status, reservation.value.check_in_date)
    : false
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

const isCancelledOrCompleted = computed(() =>
  ["cancelled", "completed"].includes(status.value)
);

const statusConfig = computed(() => {
  const map = {
    pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  dot: true  },
    confirmed: { label: "Confirmed", color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  dot: false },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   dot: false },
    completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  dot: false },
  };
  return map[status.value] ?? map.pending;
});


async function handleCancel() {
  if (!cancelReason.value.trim()) {
    reasonError.value = t("reservationDetail.form.reasonError");
    return;
  }
  reasonError.value = "";
  cancelling.value  = true;
  cancelError.value = "";
  try {
    await cancelReservation(route.params.id, cancelReason.value.trim());
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

        <!-- ── Top Nav Bar ── -->
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

          <div
            class="status-pill"
            :style="{ background: statusConfig.bg, borderColor: statusConfig.border, color: statusConfig.color }"
          >
            <span v-if="statusConfig.dot" class="status-dot" :style="{ background: statusConfig.color }"></span>
            {{ reservation.reservation_status }}
          </div>
        </div>

        <!-- ── Main Booking Card ── -->
        <div class="booking-card">

          <!-- Left: Image hero -->
          <div class="booking-img-side">
            <img v-if="propertyImage" :src="propertyImage" class="booking-img" />
            <div v-else class="booking-img-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
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

          <!-- Right: Details -->
          <div class="booking-details-side">

            <!-- Dates grid -->
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

            <!-- Divider -->
            <div class="details-divider"></div>

            <!-- Payment row -->
            <div class="payment-row">
              <div class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.totalPaid") }}</span>
                <span class="payment-amount">${{ reservation.total_amount }}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.payment") }}</span>
                <span
                  class="pay-badge"
                  :class="`pay-badge--${String(reservation.payment_status ?? 'pending').toLowerCase()}`"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {{ reservation.payment_status ?? "Pending" }}
                </span>
              </div>
              <div v-if="isCancelledOrCompleted" class="payment-item">
                <span class="payment-label">{{ t("reservationDetail.bookingSummary.refund") }}</span>
                <RefundStatusBadge :status="reservation.refund_status ?? 'not_requested'" />
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

        <!-- ── Cancellation Policy Card ── -->
        <div v-if="policy && canCancel" class="policy-card" :class="`policy-card--${policy.tone}`">
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

        <!-- ── Blocked ── -->
        <div v-else-if="!canCancel && !isCancelledOrCompleted" class="blocked-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          <span>{{ whyBlocked }}</span>
        </div>

        <!-- ── Notice Card ── -->
        <div v-if="canCancel" class="notice-card">
          <!-- Watermark background icon -->
          <div class="notice-watermark">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.10)" stroke-width="1.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>

          

          <!-- Main content row -->
          <div class="notice-body">
            <!-- Left warning icon -->
            <div class="notice-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <!-- Text content -->
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
            {{ t("reservationDetail.form.reasonLabel") }}
            <span class="required">*</span>
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
        <div v-if="canCancel" class="action-bar">
          <button class="btn-keep" @click="showConfirm ? (showConfirm = false) : router.back()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ showConfirm ? t("reservationDetail.actions.goBack") : t("reservationDetail.actions.keep") }}
          </button>
          <button
            v-if="!showConfirm"
            class="btn-cancel"
            @click="showConfirm = true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            {{ t("reservationDetail.actions.cancel") }}
          </button>
          <button
            v-else
            class="btn-cancel"
            :disabled="cancelling"
            @click="handleCancel"
          >
            <span v-if="cancelling" class="btn-spin"></span>
            {{ cancelling ? t("reservationDetail.actions.cancelling") : t("reservationDetail.actions.confirm") }}
          </button>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Base ── */
*, *::before, *::after { box-sizing: border-box; }

.page {
  min-height: 100vh;
  background: #f1f5f9;
  padding-bottom: 6rem;
}

/* ── States ── */
.state-center {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1rem; min-height: 70vh;
  color: #6b7280; font-size: 0.9rem;
}

.spinner {
  width: 38px; height: 38px; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  animation: spin 0.8s linear infinite;
}

.state-text { margin: 0; font-size: 0.9rem; }

.error-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(239,68,68,0.1); color: #ef4444;
  display: flex; align-items: center; justify-content: center;
}

.btn-retry {
  background: none; border: 1.5px solid rgba(239,68,68,0.35);
  color: #ef4444; padding: 0.55rem 1.5rem; border-radius: 12px;
  font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
}
.btn-retry:hover { background: rgba(239,68,68,0.06); }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Wrapper ── */
.wrapper {
  max-width: 820px; margin: 0 auto;
  padding: 6.5rem 1.25rem 2rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}

/* ── Top Bar ── */
.topbar {
  display: flex; align-items: center; gap: 0.85rem;
  background: white; border: 1px solid #e2e8f0;
  border-radius: 18px; padding: 0.85rem 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  flex-wrap: wrap;
}

.btn-back {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #f8fafc; border: 1px solid #e2e8f0;
  color: #475569; padding: 0.5rem 1rem; border-radius: 12px;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; flex-shrink: 0; white-space: nowrap;
}
.btn-back:hover { background: #eff6ff; border-color: #bfdbfe; color: #3b82f6; }

.topbar-center {
  flex: 1; display: flex; align-items: center; gap: 0.6rem; min-width: 0;
}

.topbar-title {
  margin: 0; font-size: 1.05rem; font-weight: 800;
  color: #0f172a; letter-spacing: -0.02em; white-space: nowrap;
}

.res-badge {
  font-size: 0.7rem; font-weight: 700; color: #64748b;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  padding: 0.2rem 0.65rem; border-radius: 8px;
  font-family: monospace; white-space: nowrap;
}

.status-pill {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.45rem 1rem; border-radius: 999px;
  font-size: 0.78rem; font-weight: 700; text-transform: capitalize;
  border: 1.5px solid; flex-shrink: 0; white-space: nowrap;
}

.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

/* ── Booking Card ── */
.booking-card {
  display: flex; border-radius: 24px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
  background: white; min-height: 420px; align-items: stretch;
}

/* Left image side */
.booking-img-side {
  width: 38%; min-width: 220px; position: relative;
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  flex-shrink: 0; align-self: stretch;
}

.booking-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover;
}

.booking-img-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}

.booking-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%);
}

.booking-img-info {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 1.5rem 1.25rem; z-index: 1;
}

.img-prop-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.6rem;
}

.img-eyebrow {
  margin: 0; font-size: 0.6rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.55);
}

.img-prop-name {
  margin: 0.25rem 0 0; font-size: 1.3rem; font-weight: 800;
  color: white; letter-spacing: -0.02em; line-height: 1.2;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.img-room-name {
  margin: 0.2rem 0 0; font-size: 0.8rem; color: rgba(255,255,255,0.65);
  font-weight: 500;
}

/* Right details side */
.booking-details-side {
  flex: 1; padding: 2rem 1.75rem;
  display: flex; flex-direction: column; gap: 1.5rem;
  justify-content: center;
}

/* Dates grid — flex row, 4 equal columns with dividers */
.dates-grid {
  display: flex; align-items: stretch;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 16px; padding: 1.25rem 0.5rem;
  gap: 0;
}

.date-col {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  gap: 0.2rem;
  padding: 0 0.5rem;
}

.date-col--center { align-items: center; }

.date-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.3rem; flex-shrink: 0;
}

.date-icon--blue   { background: rgba(59,130,246,0.1);  color: #3b82f6; }
.date-icon--green  { background: rgba(16,185,129,0.1);  color: #10b981; }
.date-icon--purple { background: rgba(139,92,246,0.1);  color: #8b5cf6; }
.date-icon--amber  { background: rgba(245,158,11,0.1);  color: #f59e0b; }

/* hide the arrow — dividers handle separation */
.date-arrow { display: none; }

.date-divider {
  width: 1px; background: #e2e8f0; flex-shrink: 0;
  align-self: stretch; margin: 0;
}

.date-label {
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.09em; color: #94a3b8; text-align: center;
}

.date-value {
  font-size: 0.9rem; font-weight: 800; color: #0f172a; text-align: center;
  white-space: nowrap;
}

.date-time {
  font-size: 0.7rem; color: #94a3b8; text-align: center; white-space: nowrap;
}

/* Details divider */
.details-divider {
  height: 1px; background: #f1f5f9;
}

/* Payment row */
.payment-row {
  display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap;
}

.payment-item {
  display: flex; flex-direction: column; gap: 0.35rem;
}

.payment-label {
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.09em; color: #94a3b8;
}

.payment-amount {
  font-size: 1.65rem; font-weight: 900; color: #0f172a;
  letter-spacing: -0.03em;
}

.pay-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.75rem;
  font-weight: 700; border: 1.5px solid #e2e8f0;
  background: #f8fafc; color: #64748b;
}
.pay-badge--paid, .pay-badge--verified  { background: rgba(16,185,129,0.08); color: #10b981; border-color: rgba(16,185,129,0.25); }
.pay-badge--submitted                   { background: rgba(59,130,246,0.08); color: #3b82f6; border-color: rgba(59,130,246,0.25); }
.pay-badge--failed                      { background: rgba(239,68,68,0.08);  color: #ef4444; border-color: rgba(239,68,68,0.25); }

/* ── Cancelled reason ── */
.cancel-reason-card {
  display: flex; align-items: flex-start; gap: 1rem;
  background: white; border: 1px solid rgba(239,68,68,0.2);
  border-radius: 18px; padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(239,68,68,0.06);
}

.cancel-reason-icon {
  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
  background: rgba(239,68,68,0.1); color: #ef4444;
  display: flex; align-items: center; justify-content: center;
}

.cancel-reason-label {
  margin: 0; font-size: 0.65rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.1em; color: #ef4444;
}

.cancel-reason-text {
  margin: 0.35rem 0 0; font-size: 0.9rem; color: #334155; line-height: 1.5;
}

/* ── Policy card ── */
.policy-card {
  border-radius: 20px; padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  border: 1.5px solid #e2e8f0;
}

.policy-card--free    { background: #f0fdf9;                border-color: rgba(16,185,129,0.25); }
.policy-card--partial { background: #fff8f0;                border-color: #f5c88a; }
.policy-card--strict  { background: #fff5f5;                border-color: rgba(239,68,68,0.2); }

.policy-top {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;
}

.policy-icon {
  width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.policy-icon--free    { background: rgba(16,185,129,0.1);  color: #10b981; }
.policy-icon--partial { background: #fde9c8;               color: #d97706; }
.policy-icon--strict  { background: rgba(239,68,68,0.1);   color: #ef4444; }

.policy-text { flex: 1; }

.policy-eyebrow {
  margin: 0; font-size: 0.62rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8;
}

.policy-title {
  margin: 0.2rem 0 0; font-size: 1.15rem; font-weight: 800; color: #0f172a;
}

.policy-refund-block {
  text-align: right; flex-shrink: 0;
  background: #f8fafc; border-radius: 14px;
  padding: 0.75rem 1rem; border: 1px solid #e2e8f0;
}

.policy-refund-block--free    { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.2); }
.policy-refund-block--partial { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.2); }
.policy-refund-block--strict  { background: rgba(100,116,139,0.06); }

.policy-refund-eyebrow {
  margin: 0; font-size: 0.6rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;
}

.policy-refund-amount {
  margin: 0.15rem 0; font-size: 1.5rem; font-weight: 900;
  letter-spacing: -0.03em;
}

.policy-card--free    .policy-refund-amount { color: #10b981; }
.policy-card--partial .policy-refund-amount { color: #d97706; }
.policy-card--strict  .policy-refund-amount { color: #94a3b8; }

.refund-tag {
  display: inline-block; font-size: 0.6rem; font-weight: 800;
  background: rgba(245,158,11,0.12); color: #d97706;
  padding: 0.18rem 0.55rem; border-radius: 6px; letter-spacing: 0.08em;
}

.policy-desc {
  font-size: 0.875rem; color: #64748b; margin: 0 0 1rem; line-height: 1.65;
}

.policy-deadline {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.83rem; color: #334155;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 0.7rem 0.95rem; border-radius: 12px; margin-bottom: 1rem;
}

/* Breakdown */
.breakdown {
  border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden;
  background: white;
}

.policy-card--free    .breakdown { border-color: rgba(16,185,129,0.25); }
.policy-card--partial .breakdown { border-color: #f2e0c8; }
.policy-card--strict  .breakdown { border-color: rgba(239,68,68,0.2); }

.breakdown-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; font-size: 0.85rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}
.policy-card--partial .breakdown-row { border-bottom-color: #eae0cf; }
.breakdown-row:last-child { border-bottom: none; }

.breakdown-left {
  display: flex; align-items: center; gap: 0.5rem; color: #64748b;
}

.breakdown-val { font-weight: 700; }
.breakdown-val--full    { color: #10b981; }
.breakdown-val--partial { color: #d97706; }
.breakdown-val--none    { color: #ef4444; }

/* ── Blocked ── */
.blocked-banner {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 1rem 1.1rem; background: white;
  border: 1px solid rgba(239,68,68,0.2); border-radius: 16px;
  font-size: 0.875rem; color: #ef4444;
  box-shadow: 0 1px 4px rgba(239,68,68,0.06);
}

/* ── Notice card ── */
.notice-card {
  background: rgba(254,242,242,0.85);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: 18px;
  padding: 1.1rem 1.35rem 1.6rem;
  box-shadow: 0 2px 10px rgba(239,68,68,0.07);
  position: relative;
  overflow: visible;
}

/* Ghost watermark document icon – right side */
.notice-watermark {
  position: absolute;
  right: 14px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Red ! badge – overlaps the bottom edge of the card */
.notice-badge {
  position: absolute;
  bottom: -13px; right: 22px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #ef4444;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 8px rgba(239,68,68,0.45);
  z-index: 2;
}

/* Horizontal layout: icon + content */
.notice-body {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.notice-icon {
  width: 40px; height: 40px;
  border-radius: 12px; flex-shrink: 0;
  background: rgba(239,68,68,0.1);
  display: flex; align-items: center; justify-content: center;
  margin-top: 2px;
}

.notice-content {
  flex: 1; min-width: 0;
}

.notice-title {
  margin: 0 0 0.6rem; font-size: 0.92rem; font-weight: 800;
  color: #ef4444; letter-spacing: 0;
}

.notice-list {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 0.5rem;
}

.notice-list li {
  display: flex; align-items: flex-start; gap: 0.55rem;
  font-size: 0.84rem; color: #334155; line-height: 1.5;
}

.notice-list svg { flex-shrink: 0; margin-top: 2px; }

/* ── Reason card ── */
.reason-card {
  background: white; border: 1px solid rgba(239,68,68,0.18);
  border-radius: 18px; padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  box-shadow: 0 1px 6px rgba(239,68,68,0.06);
}

.reason-label {
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: #334155;
}

.required { color: #ef4444; margin-left: 2px; }

.reason-textarea {
  width: 100%; padding: 0.85rem; border: 1.5px solid #e2e8f0;
  border-radius: 12px; background: #f8fafc; color: #0f172a;
  font-size: 0.9rem; line-height: 1.5; resize: vertical;
  outline: none; transition: border-color 0.2s, background 0.2s;
  font-family: inherit;
}
.reason-textarea:focus { border-color: #3b82f6; background: white; }
.reason-textarea:disabled { opacity: 0.6; }

.reason-footer {
  display: flex; justify-content: space-between; align-items: center;
}

.reason-error { font-size: 0.78rem; color: #ef4444; font-weight: 600; }
.char-count   { font-size: 0.72rem; color: #94a3b8; }

.cancel-api-error {
  padding: 0.7rem 0.9rem; background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
  color: #ef4444; font-size: 0.83rem; font-weight: 600; margin: 0;
}

/* ── Action Bar ── */
.action-bar {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;
  position: sticky; bottom: 1.25rem;
  background: rgba(241,245,249,0.85); backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0; border-radius: 20px;
  padding: 1rem 1.1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
}

.btn-keep {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.9rem 1rem; border: 1.5px solid #e2e8f0;
  border-radius: 14px; background: white; color: #334155;
  font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-keep:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

.btn-cancel {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.9rem 1rem; background: #ef4444; border: none;
  border-radius: 14px; color: white; font-size: 0.875rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}
.btn-cancel:hover:not(:disabled) { background: #dc2626; box-shadow: 0 6px 16px rgba(239,68,68,0.4); transform: translateY(-1px); }
.btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.btn-spin {
  width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .wrapper { padding: 5.5rem 0.85rem 2rem; }
  .booking-card { flex-direction: column; }
  .booking-img-side { width: 100%; min-height: 220px; }
  .booking-details-side { padding: 1.5rem 1.25rem; }
  .dates-grid { padding: 1rem 0.25rem; }
  .date-value { font-size: 0.78rem; }
  .date-time { font-size: 0.65rem; }
  .policy-top { flex-wrap: wrap; }
  .policy-refund-block { text-align: left; width: 100%; }
  .action-bar { grid-template-columns: 1fr; position: relative; bottom: 0; }
  .topbar { padding: 0.75rem; }
  .topbar-title { font-size: 0.95rem; }
}
</style>