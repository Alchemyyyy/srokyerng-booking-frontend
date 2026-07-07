<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { reservationApi } from "../api/reservation.api";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { formatPrice } from "@/shared/utils/currency";

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const loading = ref(true);
const error = ref("");
const reservation = ref(null);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)";
    case "confirmed":
      return "border-(--color-success) bg-(--color-success-soft) text-(--color-success)";
    case "cancelled":
      return "border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)";
    case "completed":
      return "border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)";
    default:
      return "border-(--color-border) bg-(--color-surface-soft) text-(--color-muted)";
  }
};

const fetchReservation = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await reservationApi.getReservationById(route.params.id);
    reservation.value = response?.data?.data || response?.data || response;
  } catch (requestError) {
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      t("owner.reservationDetail.loadError");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReservation);
</script>

<template> <div class="owner-reservation-detail ">
    <header class="mb-6 flex items-center pb-4">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 px-4 py-2 bg-(--color-surface) border border-(--color-border) rounded-xl text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer shadow-sm"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        <span>{{ t("owner.reservationDetail.backToList") }}</span>
      </button>
    </header>

    <OwnerLoadingState v-if="loading" :label="t('owner.reservationDetail.loading')" />

    <div
      v-else-if="error"
      class="p-6 bg-(--color-danger-soft) border border-(--color-danger) rounded-2xl text-(--color-danger) text-center font-bold text-sm"
    >
      {{ error }}
    </div>

    <div v-else-if="reservation" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div
        class="lg:col-span-8 space-y-6 bg-(--color-surface) rounded-2xl border border-(--color-border) p-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-(--color-text)">
            {{ t("owner.reservationDetail.reservationHash") }}{{ reservation.id }}
          </h1>
          <span
            class="inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
            :class="getStatusBadgeClass(reservation.reservation_status)"
          >
            {{ statusLabel(reservation.reservation_status) }}
          </span>
        </div>

        <div class="space-y-3">
          <span
            class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5"
          >
            {{ t("owner.reservationDetail.guestInformation") }}
          </span>
          <div
            class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)"
          >
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.fullName") }}</span>
              <span class="font-bold text-(--color-text) text-sm">{{ reservation.customer_name }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.phoneNumber") }}</span>
              <span class="font-semibold text-(--color-primary) text-sm">{{ reservation.customer_phone || "N/A" }}</span>
            </div>
            <div class="overflow-hidden">
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.emailAddress") }}</span>
              <span
                class="font-medium text-(--color-text) text-sm truncate block"
                :title="reservation.customer_email"
                >{{ reservation.customer_email }}</span
              >
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <span
            class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5"
          >
            {{ t("owner.reservationDetail.stayDetails") }}
          </span>
          <div
            class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)"
          >
            <div class="col-span-2">
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.property") }}</span>
              <span class="font-bold text-(--color-text) text-sm truncate block">{{ reservation.property_name }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.room") }}</span>
              <span class="font-semibold text-(--color-text) text-sm">{{ reservation.room_name }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.guests") }}</span>
              <span class="font-bold text-(--color-primary) text-sm">{{ reservation.total_guests }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.checkIn") }}</span>
              <span class="font-medium text-(--color-text) text-xs">{{ formatDate(reservation.check_in_date) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.checkOut") }}</span>
              <span class="font-medium text-(--color-text) text-xs">{{ formatDate(reservation.check_out_date) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.nights") }}</span>
              <span class="font-medium text-(--color-text) text-xs">{{ reservation.total_nights }}</span>
            </div>
            <div>
              <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.pricePerNight") }}</span>
              <span class="font-medium text-(--color-text) text-xs">{{ formatPrice(reservation.price_per_night) }}</span>
            </div>
          </div>
        </div>

        <div v-if="reservation.special_request" class="space-y-2">
          <span class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block">{{ t("owner.reservationDetail.specialRequest") }}</span>
          <div class="bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)">
            <p class="text-sm font-medium text-(--color-text)">"{{ reservation.special_request }}"</p>
          </div>
        </div>

        <div v-if="reservation.cancellation_reason" class="space-y-2">
          <span class="text-xs font-bold text-(--color-danger) uppercase tracking-wider block">{{ t("owner.reservationDetail.cancellationReason") }}</span>
          <div class="bg-(--color-danger-soft) p-4 rounded-xl border border-(--color-danger)">
            <p class="text-sm font-bold text-(--color-danger)">"{{ reservation.cancellation_reason }}"</p>
          </div>
        </div>
      </div>

      <div
        class="lg:col-span-4 space-y-4 bg-(--color-surface) rounded-2xl border border-(--color-border) p-6 shadow-sm"
      >
        <span
          class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5"
        >
          {{ t("owner.reservationDetail.bookingSummary") }}
        </span>

        <div>
          <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.totalAmount") }}</span>
          <span class="font-black text-(--color-success) text-2xl">{{ formatPrice(reservation.total_amount) }}</span>
        </div>

        <div>
          <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.bookingId") }}</span>
          <span class="font-mono text-xs font-bold text-(--color-primary)">#{{ reservation.id }}</span>
        </div>

        <div>
          <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.createdAt") }}</span>
          <span class="font-medium text-(--color-muted) text-xs">{{ formatDateTime(reservation.created_at) }}</span>
        </div>

        <div>
          <span class="text-[10px] text-(--color-muted) uppercase font-bold block">{{ t("owner.reservationDetail.lastUpdated") }}</span>
          <span class="font-medium text-(--color-muted) text-xs">{{ formatDateTime(reservation.updated_at) }}</span>
        </div>

        <router-link
          v-if="reservation.property_id"
          :to="{ name: 'owner.property-detail', params: { id: reservation.property_id } }"
          class="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2.5 text-xs font-bold text-(--color-text) transition hover:bg-(--color-surface)"
        >
          {{ t("owner.reservationDetail.viewProperty") }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-reservation-detail {
  font-family: var(--font-main);
  background-color: var(--color-page);
  color: var(--color-text);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
