<script setup>
/**
 * PaymentUploadView
 * Left: KHQR/Bakong QR card — right: receipt upload form.
 * Route: /payments/:id/upload
 */
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeftIcon, ShieldCheckIcon } from "@heroicons/vue/24/outline";
import AppButton from "@/shared/components/AppButton.vue";
import ReceiptUploadForm from "@/modules/payments/components/ReceiptUploadForm.vue";
import PaymentMethodCard from "@/modules/payments/components/PaymentMethodCard.vue";
import { usePaymentStore } from "@/modules/payments/store/paymentStore";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const uploadType = ref("receipt");

const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentStore();

const paymentId = computed(() => route.params.paymentId);
const payment = computed(() => paymentStore.activePayment);
const isUploading = computed(() => paymentStore.loadingSubmitProof);
const uploadError = computed(() => paymentStore.errorSubmitProof);
const uploadSuccess = ref(false);

// The account actually selected for this payment at booking time
// (joined onto the payment record itself — not guessed from the
// property's account list, which could include unrelated accounts).
const khqrAccount = computed(() =>
  payment.value
    ? {
        account_name: payment.value.account_name,
        account_number: payment.value.account_number,
        qr_image_url: payment.value.qr_image_url,
        method_name: payment.value.payment_method,
      }
    : null,
);

const assetBaseUrl = computed(() =>
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace(
    /\/api\/?$/,
    "",
  ),
);

const resolveAssetUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${assetBaseUrl.value}${url.startsWith("/") ? "" : "/"}${url}`;
};

const qrImageUrl = computed(() => resolveAssetUrl(khqrAccount.value?.qr_image_url));

const formattedAmount = computed(() => {
  if (!payment.value?.amount) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.value.currency ?? "USD",
  }).format(payment.value.amount);
});

async function handleSubmit(file, transactionReference) {
  const ok = await paymentStore.submitPaymentProof(
    paymentId.value,
    file,
    uploadType.value,
    transactionReference,
  );
  if (ok) {
    uploadSuccess.value = true;
    setTimeout(
      () =>
        router.push({
          name: "customer.booking-history",
        }),
      2000,
    );
  }
}
onMounted(async () => {
  await paymentStore.fetchPaymentById(paymentId.value);
});
</script>

<template>
  <div class="upload-page">
    <!-- Progress bar -->
    <div class="upload-page__progress-track" aria-hidden="true">
      <div class="upload-page__progress-fill" />
    </div>

    <div class="upload-page__inner">
      <!-- Back -->
      <button type="button" class="upload-page__back" @click="router.back()">
        <ArrowLeftIcon class="upload-page__back-icon" />
        <span>{{ t("paymentUploadPage.backButton") }}</span>
      </button>

      <!-- ── Success screen ── -->
      <div v-if="uploadSuccess" class="success-state">
        <div class="success-state__icon-wrap">
          <ShieldCheckIcon class="success-state__icon" />
        </div>
        <h2 class="success-state__heading">{{ t("paymentUploadPage.success.heading") }}</h2>
        <p class="success-state__text">
          {{ t("paymentUploadPage.success.text") }}
        </p>
        <p class="success-state__redirect">{{ t("paymentUploadPage.success.redirecting") }}</p>
      </div>

      <!-- ── Main grid ── -->
      <div v-else class="upload-page__grid">
        <!-- Left: QR + instructions -->
        <div class="upload-page__left">
          <div class="upload-page__intro">
            <h1 class="upload-page__heading">
              {{
                t("paymentUploadPage.payVia", {
                  method: khqrAccount?.method_name || t("paymentUploadPage.defaultMethod"),
                })
              }}
            </h1>
            <p class="upload-page__subheading">
              {{ t("paymentUploadPage.subheading") }}
            </p>

            <!-- Amount pill -->
            <div v-if="formattedAmount" class="upload-page__amount-pill">
              <span class="upload-page__amount-label">{{ t("paymentUploadPage.amountDue") }}</span>
              <span class="upload-page__amount-value">{{
                formattedAmount
              }}</span>
            </div>
          </div>

          <!-- QR card -->
          <div
            v-if="paymentStore.loadingDetail"
            class="upload-page__qr-loading"
          >
            <div class="loader" />
          </div>

          <PaymentMethodCard
            v-else
            :account-name="khqrAccount?.account_name ?? ''"
            :qr-image-url="qrImageUrl"
            :bakong-id="khqrAccount?.bakong_id ?? ''"
            :method-name="khqrAccount?.method_name ?? ''"
            :account-number="khqrAccount?.account_number ?? ''"
          />

          <!-- Security badge -->
          <div class="upload-page__security">
            <ShieldCheckIcon class="upload-page__security-icon" />
            <p class="upload-page__security-text">
              {{ t("paymentUploadPage.securityText") }}
            </p>
          </div>
        </div>

        <!-- Right: upload form -->
        <div class="upload-page__right">
          <p class="upload-page__step-label">{{ t("paymentUploadPage.stepLabel") }}</p>

          <ReceiptUploadForm :loading="isUploading" @submit="handleSubmit" />

          <p v-if="uploadError" class="upload-page__error" role="alert">
            {{ uploadError }}
          </p>

          <p class="upload-page__formats">
            {{ t("paymentUploadPage.formatsHint") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: var(--color-page);
  color: var(--color-text);
  padding-bottom: 1rem;
}

.upload-page__progress-track {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--color-border);
  z-index: 50;
}

.upload-page__progress-fill {
  height: 100%;
  width: 100%;
  background: var(--color-primary);
  transition: width 0.5s ease;
}

.upload-page__inner {
  max-width: 1024px;
  margin: 0 auto;
  padding: 3.25rem 1.25rem 0;
}

/* Back */
.upload-page__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0;
  margin-bottom: 1.25rem;
  transition: color 0.15s;
}
.upload-page__back:hover {
  color: var(--color-primary);
}
.upload-page__back:hover .upload-page__back-icon {
  transform: translateX(-3px);
}
.upload-page__back-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.15s;
}

/* Grid */
.upload-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 900px) {
  .upload-page__grid {
    grid-template-columns: minmax(300px, 0.9fr) minmax(420px, 1.1fr);
    align-items: stretch;
  }
}

/* Left */
.upload-page__left {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.upload-page__heading {
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
}

.upload-page__subheading {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.55;
  font-size: 0.84rem;
}

/* Amount pill */
.upload-page__amount-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 1rem 0.4rem 0.75rem;
  width: fit-content;
}

.upload-page__amount-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.upload-page__amount-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
}

/* QR loading */
.upload-page__qr-loading {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Security */
.upload-page__security {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  background: var(--color-success-soft);
  border: 1px solid var(--color-success-soft);
  border-radius: 14px;
}

.upload-page__security-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--color-success);
  flex-shrink: 0;
}

.upload-page__security-text {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-success);
}

/* Right */
.upload-page__right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-page__step-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-muted);
}

.upload-page__error {
  margin: 0;
  padding: 0.75rem 1rem;
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-soft);
  border-radius: 10px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.upload-page__formats {
  margin: 0;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-muted);
}

/* Success */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1rem;
  gap: 0.75rem;
}

.success-state__icon-wrap {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--color-success-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.success-state__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-success);
}
.success-state__heading {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
}
.success-state__text {
  margin: 0;
  color: var(--color-muted);
  max-width: 36ch;
}
.success-state__redirect {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Loader */
.loader {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
