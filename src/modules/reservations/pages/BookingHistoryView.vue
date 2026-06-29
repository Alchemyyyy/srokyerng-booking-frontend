<script setup>
import { ref, computed, onMounted } from "vue";
import { reservationApi } from "../api/reservation.api";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BookingCard from "../components/BookingCard.vue";
import CancelReservationModal from "../components/CancelReservationModal.vue";
import { useToastStore } from "@/shared/store/toastStore";
import http from "@/app/api/http";
import {
  BriefcaseIcon,
  MoonIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

defineProps({
  hideNavbarAndFooter: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const toast  = useToastStore();
const { t }  = useI18n();

const loading      = ref(true);
const error        = ref("");
const bookings     = ref([]);
const activeFilter = ref("upcoming");

const cancelModalOpen = ref(false);
const cancellingId    = ref(null);
const cancelLoading   = ref(false);
const cancelError     = ref("");

const paymentMap = ref({});

const fetchPayments = async () => {
  try {
    const res = await http.get("/payments/my");
    const payments = Array.isArray(res) ? res : res?.data || [];
    payments.forEach((p) => {
      paymentMap.value[p.reservation_id] = p;
    });
  } catch (err) {
    console.error("Failed to load payments:", err);
  }
};


const handleCancel = (id) => {
  cancellingId.value    = id
  cancelError.value     = ''
  cancelModalOpen.value = true
}

const confirmCancel = async (reason) => {
  if (cancelLoading.value) return;
  cancelLoading.value = true;
  cancelError.value   = "";
  try {
    await reservationApi.cancelReservation(cancellingId.value, reason);
    cancelModalOpen.value = false;
    cancellingId.value    = null;
    await fetchBookings();
    toast.success(t('reservationDetail.toast.successMessage'), { title: t('reservationDetail.toast.successTitle') });
  } catch (err) {
    cancelError.value =
      err?.message || err?.response?.data?.message || t('bookingHistory.state.cancelFailed');
  } finally {
    cancelLoading.value = false;
  }
};

const dismissCancel = () => {
  cancelModalOpen.value = false;
  cancellingId.value    = null;
  cancelError.value     = "";
};

const filteredBookings = computed(() => {
  if (activeFilter.value === "all") return bookings.value;
  if (activeFilter.value === "upcoming")
    return bookings.value.filter((b) =>
      ["confirmed", "pending"].includes(String(b.status).toLowerCase()),
    );
  if (activeFilter.value === "completed")
    return bookings.value.filter(
      (b) => String(b.status).toLowerCase() === "completed",
    );
  return bookings.value;
});

const filterOptions = computed(() => [
  {
    value: "all",
    label: t("bookingHistory.filters.all"),
    count: bookings.value.length,
    icon: QueueListIcon,
  },
  {
    value: "upcoming",
    label: t("bookingHistory.filters.upcoming"),
    count: stats.value.activeCount,
    icon: ClockIcon,
  },
  {
    value: "completed",
    label: t("bookingHistory.filters.completed"),
    count: bookings.value.filter(
      (b) => String(b.status).toLowerCase() === "completed",
    ).length,
    icon: CheckCircleIcon,
  },
]);

const stats = computed(() => ({
  totalReservations: bookings.value.length,
  totalNights: bookings.value.reduce((sum, b) => sum + (b.nights || 0), 0),
  totalSpent: bookings.value.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0),
  activeCount: bookings.value.filter((b) =>
    ["confirmed", "pending"].includes(String(b.status).toLowerCase()),
  ).length,
}));

const normalizeBooking = (item, index) => {
  const checkIn  = item.check_in_date  || item.check_in  || "-";
  const checkOut = item.check_out_date || item.check_out || "-";
  const nights =
    checkIn !== "-" && checkOut !== "-"
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      : 0;

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const payment = paymentMap.value[item.id];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate   = checkIn !== "-" ? new Date(checkIn) : null;
  const checkInPassed = checkInDate ? checkInDate <= today : false;
  const status        = String(item.reservation_status || item.status || "pending").toLowerCase();
  const paymentSt     = String(payment?.payment_status ?? "").toLowerCase();
  const canCancel =
    ["pending", "confirmed"].includes(status) &&
    !checkInPassed &&
    !["submitted", "paid", "verified"].includes(paymentSt);

  return {
    id: item.id || index + 1,
    roomName: item.room_name || item.room?.name || "Room",
    roomImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    location: item.property_name || item.property?.name || "Unknown",
    checkIn:  formatDate(checkIn),
    checkOut: formatDate(checkOut),
    nights,
    totalPrice: Number(item.total_amount || item.total_price || 0),
    status,
    paymentId:     payment?.id ?? null,
    paymentStatus: payment?.payment_status ?? null,
    paymentAmount: payment?.amount ?? null,
    roomId: item.room_id || item.room?.id || null,
    canCancel,
    cancellationReason: null,
  };
};

const fetchBookings = async () => {
  loading.value = true;
  error.value   = "";
  try {
    const response = await reservationApi.getMyReservations();
    const items = Array.isArray(response) ? response : response?.data || [];
    console.log("First item:", JSON.stringify(items[0]));

    bookings.value = items.map(normalizeBooking);

    await Promise.allSettled(
      items.map(async (item, index) => {
        try {
          const policyRes = await reservationApi.getCancellationPolicy(item.id);
          const policy = Array.isArray(policyRes) ? policyRes[0] : policyRes?.data || policyRes;
          const canCancel = policy?.cancellation_eligibility?.can_cancel ?? false;
          const reason    = policy?.cancellation_eligibility?.reasons?.[0] ?? null;
          bookings.value[index] = { ...bookings.value[index], canCancel, cancellationReason: reason };
        } catch {
          // keep frontend-calculated canCancel as fallback
        }
      }),
    );
  } catch (err) {
    error.value = err?.message || "Failed to load reservations.";
  } finally {
    loading.value = false;
  }
};

const goToReceipt = (paymentId) => {
  if (!paymentId) {
    toast.warning(t('bookingHistory.state.noPayment'), { title: t('bookingHistory.state.noPaymentTitle') });
    return;
  }
  router.push({ name: 'customer.payment-detail', params: { paymentId } })
};

const goToUpload = (paymentId) => {
  if (!paymentId) {
    toast.warning(t('bookingHistory.state.noPayment'), { title: t('bookingHistory.state.noPaymentTitle') });
    return;
  }
  router.push({ name: "customer.payment-upload", params: { paymentId } });
};

onMounted(async () => {
  await fetchPayments();
  await fetchBookings();
});
</script>

<template>
  <div>
    <PublicNavbar v-if="!hideNavbarAndFooter" />
    <div
      :class="[
        hideNavbarAndFooter
          ? 'pb-12 font-sans'
          : 'min-h-screen bg-(--color-page) text-(--color-text) antialiased pb-24 font-sans pt-32'
      ]"
    >
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        <!-- Airbnb Header -->
        <div class="border-b border-(--color-border) pb-5 mb-8">
          <h1 class="text-4xl font-black tracking-tight text-(--color-text)">
            Trips
          </h1>
          
          <!-- Airbnb Tab Switcher -->
          <div class="flex gap-6 mt-6 text-sm font-bold">
            <button
              type="button"
              class="pb-3 border-b-2 transition-all duration-200 cursor-pointer"
              :class="activeFilter === 'upcoming' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
              @click="activeFilter = 'upcoming'"
            >
              Upcoming
            </button>
            <button
              type="button"
              class="pb-3 border-b-2 transition-all duration-200 cursor-pointer"
              :class="activeFilter === 'completed' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
              @click="activeFilter = 'completed'"
            >
              Past
            </button>
            <button
              type="button"
              class="pb-3 border-b-2 transition-all duration-200 cursor-pointer"
              :class="activeFilter === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
              @click="activeFilter = 'all'"
            >
              All
            </button>
          </div>
        </div>

        <!-- Booking List Content -->
        <main>
          <div v-if="loading" class="text-center py-20 bg-(--color-surface) border border-(--color-border)/60 rounded-3xl shadow-xs">
            <div class="inline-block w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm font-semibold text-(--color-muted)">{{ t('bookingHistory.state.loading') }}</p>
          </div>

          <div v-else-if="error" class="text-center py-16 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
            <ExclamationTriangleIcon class="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p class="text-sm font-bold text-rose-600">{{ error }}</p>
            <button @click="fetchBookings" class="mt-2 text-xs font-black text-(--color-primary) uppercase tracking-wider hover:underline">
              {{ t('bookingHistory.state.retry') }}
            </button>
          </div>

          <!-- Empty State (Airbnb style) -->
          <div v-else-if="filteredBookings.length === 0" class="py-16 text-left border border-(--color-border) bg-(--color-surface) rounded-[32px] p-8 max-w-xl shadow-xs">
            <span class="text-4xl block mb-4">🧳</span>
            <h2 class="text-2xl font-black text-(--color-text) tracking-tight">No trips booked... yet!</h2>
            <p class="text-sm text-(--color-muted) leading-relaxed mt-2 max-w-md">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <RouterLink :to="{ name: 'public.properties' }">
              <button
                type="button"
                class="mt-6 px-6 py-3 bg-(--color-primary) hover:opacity-90 text-white text-sm font-bold rounded-xl transition duration-200 active:scale-95 cursor-pointer"
              >
                Start searching
              </button>
            </RouterLink>
          </div>

          <!-- Booking Cards Stack -->
          <div v-else class="space-y-6">
            <BookingCard
              v-for="booking in filteredBookings"
              :key="booking.id"
              :booking="booking"
              @view="router.push({ name: 'customer.booking-detail', params: { id: $event } })"
              @cancel="handleCancel"
              @pay="goToUpload($event)"
              @receipt="goToReceipt($event)"
            />
          </div>
        </main>
      </div>

      <!-- Cancel Reservation Modal -->
      <CancelReservationModal
        :open="cancelModalOpen"
        :eligible="true"
        :loading="cancelLoading"
        :error="cancelError"
        @close="dismissCancel"
        @confirm="confirmCancel"
      />
    </div>
    <PublicFooter v-if="!hideNavbarAndFooter" />
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
