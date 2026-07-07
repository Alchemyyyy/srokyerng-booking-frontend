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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { QrCodeIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  accountName: { type: String, default: "" },
  qrImageUrl: { type: String, default: null },
  bakongId: { type: String, default: "" },
  methodName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
});

const subLabel = computed(() =>
  props.methodName
    ? t("components.paymentMethodCard.khqrWithMethod", { method: props.methodName })
    : t("components.paymentMethodCard.khqrOnly")
);

const isPreviewOpen = ref(false);
</script>

<template>
  <div class="qr-card">
    <!-- Header -->
    <div class="qr-card__header">
      <div class="qr-card__icon-wrap">
        <QrCodeIcon class="qr-card__icon" />
      </div>
      <div>
        <p class="qr-card__label">{{ t("components.paymentMethodCard.scanToPay") }}</p>
        <p class="qr-card__sub">{{ subLabel }}</p>
      </div>
    </div>

    <!-- QR image -->
    <div class="qr-card__qr-area">
      <button
        v-if="qrImageUrl"
        type="button"
        class="qr-card__qr-btn"
        :aria-label="t('components.paymentMethodCard.previewQr')"
        @click="isPreviewOpen = true"
      >
        <img
          :src="qrImageUrl"
          :alt="t('components.paymentMethodCard.qrAlt')"
          class="qr-card__qr-img"
        />
      </button>
      <div v-else class="qr-card__qr-placeholder">
        <QrCodeIcon class="qr-card__placeholder-icon" />
        <span>{{ t("components.paymentMethodCard.qrNotConfigured") }}</span>
      </div>
    </div>

    <!-- Account details -->
    <div class="qr-card__details">
      <div class="qr-card__detail-row" v-if="methodName">
        <span class="qr-card__detail-label">{{ t("components.paymentMethodCard.bank") }}</span>
        <span class="qr-card__detail-value">{{ methodName }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="accountName">
        <span class="qr-card__detail-label">{{ t("components.paymentMethodCard.merchant") }}</span>
        <span class="qr-card__detail-value">{{ accountName }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="accountNumber">
        <span class="qr-card__detail-label">{{ t("components.paymentMethodCard.accountNumber") }}</span>
        <span class="qr-card__detail-value qr-card__detail-value--mono">{{
          accountNumber
        }}</span>
      </div>
      <div class="qr-card__detail-row" v-if="bakongId">
        <span class="qr-card__detail-label">{{ t("components.paymentMethodCard.bakongId") }}</span>
        <span class="qr-card__detail-value qr-card__detail-value--mono">{{
          bakongId
        }}</span>
      </div>
    </div>

    <!-- Manual transfer fallback note -->
    <p v-if="!qrImageUrl && accountNumber" class="qr-card__manual-hint">
      {{ t("components.paymentMethodCard.manualHint") }}
    </p>

    <!-- Instruction -->
    <p class="qr-card__hint">
      {{ t("components.paymentMethodCard.instructionHint") }}
    </p>
  </div>

  <!-- QR preview lightbox -->
  <Teleport to="body">
    <div
      v-if="isPreviewOpen"
      class="qr-preview"
      role="dialog"
      aria-modal="true"
      @click.self="isPreviewOpen = false"
    >
      <button
        type="button"
        class="qr-preview__close"
        :aria-label="t('common.close')"
        @click="isPreviewOpen = false"
      >
        <XMarkIcon class="qr-preview__close-icon" />
      </button>
      <img
        :src="qrImageUrl"
        :alt="t('components.paymentMethodCard.qrAlt')"
        class="qr-preview__img"
      />
      <p class="qr-preview__hint">
        {{ t("components.paymentMethodCard.instructionHint") }}
      </p>
    </div>
  </Teleport>
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
  align-items: center;
  justify-content: center;
}

.qr-card__qr-btn {
  display: block;
  width: fit-content;
  margin: 0 auto;
  border: none;
  background: none;
  padding: 0;
  cursor: zoom-in;
  border-radius: 16px;
  transition: transform 0.15s ease;
}
.qr-card__qr-btn:hover {
  transform: scale(1.02);
}
.qr-card__qr-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.qr-card__qr-img {
  display: block;
  width: min(280px, 100%);
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 0.75rem;
}

.qr-card__qr-placeholder {
  width: min(280px, 100%);
  aspect-ratio: 1 / 1;
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

/* Preview lightbox */
.qr-preview {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1.25rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}

.qr-preview__close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}
.qr-preview__close:hover {
  background: rgba(255, 255, 255, 0.22);
}
.qr-preview__close-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.qr-preview__img {
  display: block;
  width: min(420px, 90vw);
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
  border-radius: 20px;
  background: #fff;
  padding: 1.25rem;
}

.qr-preview__hint {
  margin: 0;
  max-width: 32ch;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
</style>
