<script setup>
/**
 * PaymentMethodCard
 * Displays the KHQR / Bakong QR payment info.
 * No card/bank variant — QR Bakong only.
 *
 * Props:
 *   accountName  : string  — merchant name shown under QR
 *   qrImageUrl   : string  — URL of the QR image (null = placeholder)
 *   bakongId     : string  — Bakong ID e.g. "012345678@aclb"
 */
import { QrCodeIcon } from "@heroicons/vue/24/outline";

defineProps({
  accountName: { type: String, default: "" },
  qrImageUrl: { type: String, default: null },
  bakongId: { type: String, default: "" },
});
</script>

<template>
  <div class="qr-card">
    <!-- Header -->
    <div class="qr-card__header">
      <div class="qr-card__icon-wrap">
        <QrCodeIcon class="qr-card__icon" />
      </div>
      <div>
        <p class="qr-card__label">Scan to Pay</p>
        <p class="qr-card__sub">KHQR · Bakong</p>
      </div>
    </div>

    <!-- QR image -->
    <div class="qr-card__qr-area">
      <img
        v-if="qrImageUrl"
        :src="qrImageUrl"
        alt="Bakong KHQR code"
        class="qr-card__qr-img"
      />
      <div v-else class="qr-card__qr-placeholder">
        <QrCodeIcon class="qr-card__placeholder-icon" />
        <span>QR not configured</span>
      </div>
    </div>

    <!-- Account details -->
    <div class="qr-card__details">
      <div class="qr-card__detail-row" v-if="accountName">
        <span class="qr-card__detail-label">Merchant</span>
        <span class="qr-card__detail-value">{{ accountName }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="bakongId">
        <span class="qr-card__detail-label">Bakong ID</span>
        <span class="qr-card__detail-value qr-card__detail-value--mono">{{
          bakongId
        }}</span>
      </div>
    </div>

    <!-- Instruction -->
    <p class="qr-card__hint">
      Open your banking app · Scan this QR · Transfer the exact amount
    </p>
  </div>
</template>

<style scoped>
.qr-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: var(--shadow-card);
}

/* Header */
.qr-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qr-card__icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: rgba(29, 158, 117, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-card__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #1d9e75;
}

.qr-card__label {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text);
}

.qr-card__sub {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #1d9e75;
}

/* QR area */
.qr-card__qr-area {
  display: flex;
  justify-content: center;
}

.qr-card__qr-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 0.5rem;
}

.qr-card__qr-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 2px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.qr-card__placeholder-icon {
  width: 2.5rem;
  height: 2.5rem;
  opacity: 0.3;
}

/* Details */
.qr-card__details {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

.qr-card__detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.qr-card__detail-row:last-child {
  border-bottom: none;
}

.qr-card__detail-label {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.qr-card__detail-value {
  font-weight: 700;
  color: var(--color-text);
}

.qr-card__detail-value--mono {
  font-family: "Courier New", monospace;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
}

/* Hint */
.qr-card__hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-muted);
  text-align: center;
  line-height: 1.6;
}
</style>
