<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import http from "@/app/api/http";
import AppButton from "@/shared/components/AppButton.vue";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  ReceiptPercentIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const router = useRouter();
const route = useRoute();

const payment = ref(null);
const loading = ref(false);
const error = ref(null);

const paymentId = computed(() => route.params.paymentId);

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

const goToUpload = () => {
  router.push({
    name: "customer.payment-upload",
    params: { paymentId: paymentId.value },
  });
};

const fetchPayment = async () => {
  try {
    loading.value = true;
    error.value = null;
    // FIX #1: always use res.data consistently (axios always wraps in .data)
    const res = await http.get(`/payments/${paymentId.value}`);
    payment.value = res.data;
  } catch (err) {
    error.value = t("paymentDetailPage.errors.fetchFailed");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Helper to determine status styling classes dynamically
const getStatusMeta = (status) => {
  const norm = String(status).toLowerCase();
  if (norm.includes("pending")) {
    return {
      label: t("paymentDetailPage.status.pending"),
      bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: ClockIcon,
    };
  }
  // FIX #4: handle "submitted" status — was incorrectly falling into "Rejected/Failed"
  if (norm.includes("submitted")) {
    return {
      label: t("paymentDetailPage.status.submitted"),
      bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: ClockIcon,
    };
  }
  if (
    norm.includes("completed") ||
    norm.includes("success") ||
    norm.includes("paid")
  ) {
    return {
      label: t("paymentDetailPage.status.approved"),
      bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckCircleIcon,
    };
  }
  return {
    label: t("paymentDetailPage.status.rejected"),
    bg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    icon: XCircleIcon,
  };
};

// FIX #2: compute statusMeta once instead of calling getStatusMeta multiple times in template
const statusMeta = computed(() =>
  payment.value ? getStatusMeta(payment.value.payment_status) : null,
);

// FIX #3: show upload button when no receipt, pending, OR rejected
const canUpload = computed(() => {
  if (!payment.value) return false;
  const status = String(payment.value.payment_status).toLowerCase();
  return (
    !payment.value.receipt_image_url ||
    status.includes("pending") ||
    status.includes("rejected") ||
    status.includes("failed")
  );
});

onMounted(() => {
  fetchPayment();
});
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) antialiased pb-24 relative"
  >
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[250px] bg-gradient-to-b from-(--color-primary-soft)/15 via-transparent to-transparent blur-3xl pointer-events-none"
    ></div>

    <div class="max-w-2xl mx-auto px-4 pt-28 relative z-10">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-muted) hover:text-(--color-primary) transition-colors mb-6 group"
      >
        <ArrowLeftIcon
          class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
        />
        <span>{{ t("paymentDetailPage.backButton") }}</span>
      </button>

      <header class="mb-8">
        <h1 class="text-3xl font-black tracking-tight text-(--color-text)">
          {{ t("paymentDetailPage.heading") }}
        </h1>
        <p class="text-sm text-(--color-muted) mt-1">
          {{ t("paymentDetailPage.subheading") }}
        </p>
      </header>

      <div
        v-if="loading"
        class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-12 text-center shadow-xs"
      >
        <div
          class="inline-block w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-sm font-semibold text-(--color-muted)">
          {{ t("paymentDetailPage.loadingText") }}
        </p>
      </div>

      <div
        v-else-if="error"
        class="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center"
      >
        <p class="text-sm font-bold text-rose-600">{{ error }}</p>
        <button
          @click="fetchPayment"
          class="mt-3 text-xs font-black text-(--color-primary) uppercase tracking-wider hover:underline"
        >
          {{ t("paymentDetailPage.retryButton") }}
        </button>
      </div>

      <div v-else-if="payment" class="space-y-6">
        <div
          class="bg-(--color-surface) border border-(--color-border) rounded-[32px] overflow-hidden shadow-sm"
        >
          <div
            class="h-1.5 w-full bg-gradient-to-r from-(--color-primary) to-sky-400"
          ></div>

          <div class="p-6 sm:p-8 space-y-6">
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--color-border)/50 pb-5"
            >
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)"
                >
                  {{ t("paymentDetailPage.transactionIdLabel") }}
                </p>
                <p
                  class="text-sm font-mono font-bold text-(--color-text) mt-0.5"
                >
                  {{ t("paymentDetailPage.transactionIdValue", { id: payment.id }) }}
                </p>
              </div>

              <!-- FIX #2: use computed statusMeta instead of calling function twice -->
              <div
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold self-start sm:self-center"
                :class="statusMeta.bg"
              >
                <component :is="statusMeta.icon" class="w-4 h-4" />
                <span>{{ statusMeta.label }}</span>
              </div>
            </div>

            <div
              class="text-center py-4 bg-gradient-to-b from-(--color-surface-soft) to-transparent rounded-2xl border border-(--color-border)/30"
            >
              <p
                class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)"
              >
                {{ t("paymentDetailPage.totalLabel") }}
              </p>
              <h2
                class="text-4xl font-black tracking-tight text-(--color-text) mt-1"
              >
                ${{ payment.amount }}
              </h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                class="flex items-start gap-3 p-3.5 rounded-2xl border border-(--color-border)/50 bg-(--color-surface-soft)/40"
              >
                <BuildingOfficeIcon
                  class="w-5 h-5 text-(--color-primary) shrink-0 mt-0.5"
                />
                <div>
                  <p
                    class="text-[10px] font-black uppercase tracking-wider text-(--color-muted)"
                  >
                    {{ t("paymentDetailPage.propertyLabel") }}
                  </p>
                  <p class="text-sm font-bold text-(--color-text) mt-0.5">
                    {{ payment.property_name || t("paymentDetailPage.notAvailable") }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 p-3.5 rounded-2xl border border-(--color-border)/50 bg-(--color-surface-soft)/40"
              >
                <ReceiptPercentIcon
                  class="w-5 h-5 text-sky-400 shrink-0 mt-0.5"
                />
                <div>
                  <p
                    class="text-[10px] font-black uppercase tracking-wider text-(--color-muted)"
                  >
                    {{ t("paymentDetailPage.roomLabel") }}
                  </p>
                  <p class="text-sm font-bold text-(--color-text) mt-0.5">
                    {{ payment.room_name || t("paymentDetailPage.notAvailable") }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="payment.receipt_image_url"
              class="pt-4 border-t border-(--color-border)/50"
            >
              <p
                class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-3"
              >
                {{ t("paymentDetailPage.receiptLabel") }}
              </p>
              <div
                class="relative rounded-2xl overflow-hidden border border-(--color-border) group shadow-xs hover:shadow-md transition duration-300"
              >
                <img
                  :src="`${BASE_URL}${payment.receipt_image_url}`"
                  class="w-full h-auto object-cover max-h-[380px] transition duration-500 group-hover:scale-[1.01]"
                  :alt="t('paymentDetailPage.receiptAlt')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- FIX #3: use computed canUpload for cleaner, correct button visibility logic -->
        <div class="pt-2 flex justify-end">
          <AppButton
            v-if="canUpload"
            variant="primary"
            size="lg"
            class="w-full sm:w-auto shadow-md shadow-(--color-primary)/10 group font-bold tracking-wide"
            @click="goToUpload"
          >
            <ArrowUpTrayIcon
              class="w-4 h-4 transition-transform group-hover:-translate-y-0.5"
            />
            <span>{{
              payment.receipt_image_url
                ? t("paymentDetailPage.uploadButton.update")
                : t("paymentDetailPage.uploadButton.upload")
            }}</span>
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
