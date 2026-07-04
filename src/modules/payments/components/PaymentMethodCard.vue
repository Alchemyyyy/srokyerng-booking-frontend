<script setup>
/**
 * PaymentMethodCard
 * Displays the KHQR / Bakong QR payment info.
 * No card/bank variant — QR Bakong only.
 *
 * Props:
 *   accountName   : string  — merchant name shown under QR
 *   qrImageUrl    : string  — URL of the QR image (null = placeholder)
 *   bakongId      : string  — Bakong ID e.g. "012345678@aclb"
 *   methodName    : string  — bank/method name, e.g. "ABA"
 *   accountNumber : string  — manual-transfer fallback when no QR is set
 */
import { QrCodeIcon } from "@heroicons/vue/24/outline";

defineProps({
  accountName: { type: String, default: "" },
  qrImageUrl: { type: String, default: null },
  bakongId: { type: String, default: "" },
  methodName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
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
        <p class="qr-card__sub">{{ methodName ? `KHQR · ${methodName}` : "KHQR" }}</p>
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
      <div class="qr-card__detail-row" v-if="methodName">
        <span class="qr-card__detail-label">Bank</span>
        <span class="qr-card__detail-value">{{ methodName }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="accountName">
        <span class="qr-card__detail-label">Merchant</span>
        <span class="qr-card__detail-value">{{ accountName }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="accountNumber">
        <span class="qr-card__detail-label">Account Number</span>
        <span class="qr-card__detail-value qr-card__detail-value--mono">{{
          accountNumber
        }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="bakongId">
        <span class="qr-card__detail-label">Bakong ID</span>
        <span class="qr-card__detail-value qr-card__detail-value--mono">{{
          bakongId
        }}</span>
      </div>
    </div>

    <!-- Manual transfer fallback note -->
    <p v-if="!qrImageUrl && accountNumber" class="qr-card__manual-hint">
      No QR code yet? Transfer manually to the account number above.
    </p>

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
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* Header */
.qr-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qr-card__icon-wrap {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 12px;
  background: var(--color-success-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-card__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-success);
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
  color: var(--color-success);
}

/* QR area */
.qr-card__qr-area {
  display: flex;
  justify-content: center;
}

.qr-card__qr-img {
  width: 172px;
  height: 172px;
  object-fit: contain;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 0.5rem;
}

.qr-card__qr-placeholder {
  width: 172px;
  height: 172px;
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
  padding: 0.5rem 0.75rem;
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
  font-size: 0.7rem;
  color: var(--color-muted);
  text-align: center;
  line-height: 1.6;
}

.qr-card__manual-hint {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-align: center;
  line-height: 1.5;
}
</style>
