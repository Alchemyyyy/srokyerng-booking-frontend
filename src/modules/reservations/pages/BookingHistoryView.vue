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
} from "@heroicons/vue/24/outline";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";

const router = useRouter();
const toast  = useToastStore();
const { t }  = useI18n();

const loading      = ref(true);
const error        = ref("");
const bookings     = ref([]);
const activeFilter = ref("all");

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
      err?.response?.data?.message ?? t('bookingHistory.state.cancelFailed');
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
    <PublicNavbar />
    <div class="min-h-screen bg-(--color-page) text-(--color-text) antialiased pb-24 font-sans">

      <div class="absolute top-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-tr from-(--color-primary-soft)/10 to-transparent blur-3xl pointer-events-none"></div>

      <header class="border-b border-(--color-border)/60 bg-(--color-surface)/70 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center gap-2 text-(--color-muted)">
            <a href="#" class="hover:text-(--color-primary) transition duration-300">{{ t('bookingHistory.breadcrumb.dashboard') }}</a>
            <span class="text-(--color-muted)/40 text-[10px] font-light">/</span>
            <span class="text-(--color-text) font-bold tracking-tight">{{ t('bookingHistory.breadcrumb.title') }}</span>
          </div>
          <button class="inline-flex items-center gap-1.5 text-(--color-muted) hover:text-(--color-text) text-xs font-bold transition-colors border border-(--color-border)/60 px-3 py-1.5 rounded-xl bg-(--color-surface-soft)/40">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" />
            <span>{{ t('bookingHistory.export') }}</span>
          </button>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 mt-10">

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">

          <div class="bg-(--color-surface) border border-(--color-border)/80 rounded-[28px] p-6 shadow-xs relative overflow-hidden group hover:border-(--color-primary)/30 transition-all duration-300">
            <div class="absolute top-4 right-4 p-2 bg-(--color-surface-soft) rounded-2xl text-(--color-primary) group-hover:scale-105 transition-transform duration-300 border border-(--color-border)/30">
              <BriefcaseIcon class="w-5 h-5" />
            </div>
            <p class="text-[10px] font-black uppercase text-(--color-muted) tracking-widest">{{ t('bookingHistory.stats.totalBookings') }}</p>
            <p class="text-4xl font-black text-(--color-text) mt-3 tracking-tight">{{ stats.totalReservations }}</p>
            <p class="text-[11px] text-(--color-muted) font-semibold mt-2">{{ t('bookingHistory.stats.acrossProperties') }}</p>
          </div>

          <div class="bg-(--color-surface) border border-(--color-border)/80 rounded-[28px] p-6 shadow-xs relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
            <div class="absolute top-4 right-4 p-2 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:scale-105 transition-transform duration-300 border border-indigo-500/10">
              <MoonIcon class="w-5 h-5" />
            </div>
            <p class="text-[10px] font-black uppercase text-(--color-muted) tracking-widest">{{ t('bookingHistory.stats.totalNights') }}</p>
            <p class="text-4xl font-black text-indigo-500 mt-3 tracking-tight">{{ stats.totalNights }}</p>
            <p class="text-[11px] text-(--color-muted) font-semibold mt-2 inline-flex items-center gap-1">
              <SparklesIcon class="w-3 h-3 text-amber-500" />
              {{ t('bookingHistory.stats.tierStatus') }}: <span class="text-indigo-500 font-bold">{{ t('bookingHistory.stats.tierLabel') }}</span>
            </p>
          </div>

          <div class="bg-(--color-surface) border border-(--color-border)/80 rounded-[28px] p-6 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div class="absolute top-4 right-4 p-2 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-105 transition-transform duration-300 border border-emerald-500/10">
              <BanknotesIcon class="w-5 h-5" />
            </div>
            <p class="text-[10px] font-black uppercase text-(--color-muted) tracking-widest">{{ t('bookingHistory.stats.capitalInvested') }}</p>
            <p class="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">${{ stats.totalSpent }}</p>
            <p class="text-[11px] text-(--color-muted) font-semibold mt-2">{{ t('bookingHistory.stats.inclusive') }}</p>
          </div>

          <div class="bg-gradient-to-br from-[#0f2942] to-[#1d4166] dark:from-slate-950 dark:to-slate-900 rounded-[28px] p-6 shadow-xs relative overflow-hidden text-white border border-transparent dark:border-(--color-border)/50">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
            <p class="text-[10px] font-black uppercase text-slate-300 tracking-widest">{{ t('bookingHistory.stats.activeItinerary') }}</p>
            <p class="text-4xl font-black mt-3 tracking-tight">{{ t('bookingHistory.stats.live', { count: stats.activeCount }) }}</p>
            <p class="text-[11px] text-blue-300 font-semibold mt-2 flex items-center gap-1.5">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              {{ t('bookingHistory.stats.checkInActive') }}
            </p>
          </div>

        </div>

        <!-- Filter Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-(--color-border)/60 pb-5">
          <div>
            <h2 class="text-2xl font-black text-(--color-text) tracking-tight">{{ t('bookingHistory.filters.title') }}</h2>
            <p class="text-xs text-(--color-muted) font-semibold mt-0.5">{{ t('bookingHistory.filters.subtitle') }}</p>
          </div>
          <div class="inline-flex bg-(--color-surface-soft) p-1 rounded-2xl border border-(--color-border)/60 text-xs font-bold self-start md:self-center shadow-inner">
            <button
              :class="activeFilter === 'all' ? 'bg-(--color-surface) text-(--color-text) shadow-xs' : 'text-(--color-muted) hover:text-(--color-text)'"
              class="px-4 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5"
              @click="activeFilter = 'all'"
            >
              <QueueListIcon class="w-3.5 h-3.5" />
              <span>{{ t('bookingHistory.filters.all') }}</span>
            </button>
            <button
              :class="activeFilter === 'upcoming' ? 'bg-(--color-surface) text-(--color-text) shadow-xs' : 'text-(--color-muted) hover:text-(--color-text)'"
              class="px-4 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5"
              @click="activeFilter = 'upcoming'"
            >
              <ClockIcon class="w-3.5 h-3.5" />
              <span>{{ t('bookingHistory.filters.upcoming') }}</span>
            </button>
            <button
              :class="activeFilter === 'completed' ? 'bg-(--color-surface) text-(--color-text) shadow-xs' : 'text-(--color-muted) hover:text-(--color-text)'"
              class="px-4 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5"
              @click="activeFilter = 'completed'"
            >
              <CheckCircleIcon class="w-3.5 h-3.5" />
              <span>{{ t('bookingHistory.filters.completed') }}</span>
            </button>
          </div>
        </div>

        <!-- Booking List -->
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

          <div v-else-if="filteredBookings.length === 0" class="text-center py-20 text-(--color-muted) border-2 border-dashed border-(--color-border) rounded-[32px] text-sm font-semibold">
            <BriefcaseIcon class="w-10 h-10 mx-auto mb-3 opacity-30 text-(--color-muted)" />
            <p>{{ t('bookingHistory.state.empty') }}</p>
          </div>

          <div v-else class="space-y-4">
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

      <!-- Cancel Modal -->
      <CancelReservationModal
        :open="cancelModalOpen"
        :eligible="true"
        :loading="cancelLoading"
        :error="cancelError"
        @close="dismissCancel"
        @confirm="confirmCancel"
      />

    </div>
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