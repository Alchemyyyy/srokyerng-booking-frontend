<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { reservationApi } from "../api/reservation.api";
import { useToastStore } from "@/shared/store/toastStore";
import http from "@/app/api/http";
import { getPropertyPaymentAccounts } from "@/modules/payments/services/paymentService";
import AppButton from "@/shared/components/AppButton.vue";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MoonIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import BookingForm from "../components/BookingForm.vue";

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const roomId = route.params.id;
const propertyId = route.query.propertyId;
const checkInDate = ref(route.query.checkIn || "");
const checkOutDate = ref(route.query.checkOut || "");
const guestCount = ref(Number(route.query.guests) || 2);

const room = ref(null);
const property = ref(null);
const isSubmitting = ref(false);

const paymentAccounts = ref([]);
const loadingAccounts = ref(false);
const selectedAccountId = ref(null);
const dateErrors = ref({ checkIn: "", checkOut: "" });

onMounted(async () => {
  try {
    const roomRes = await http.get(`/rooms/${roomId}`);
    const r = roomRes.data || roomRes;
    room.value = {
      id: r.id,
      name: r.room_name,
      price: Number(r.price_per_night) || 0,
      capacity: r.max_guests,
    };

    const propRes = await http.get(`/properties/${propertyId}`);
    const p = propRes.data?.data || propRes;
    property.value = {
      name: p.property_name || p.name,
      city: p.city,
    };
  } catch (err) {
    console.error("Failed to load booking data:", err);
  }

  loadingAccounts.value = true;
  try {
    paymentAccounts.value = await getPropertyPaymentAccounts(propertyId);
    if (paymentAccounts.value.length === 1) {
      selectedAccountId.value = paymentAccounts.value[0].id;
    }
  } catch (err) {
    console.error("Failed to load payment accounts:", err);
  } finally {
    loadingAccounts.value = false;
  }
});

const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const start = new Date(checkInDate.value);
  const end = new Date(checkOutDate.value);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
});

const roomCost = computed(() => (room.value?.price || 0) * stayNights.value);
const calculatedTotal = computed(() => roomCost.value);

const handleSubmit = async (formData) => {
  if (paymentAccounts.value.length > 0 && !selectedAccountId.value) {
    toastStore.danger("Please select a payment method.");
    return;
  }
  if (paymentAccounts.value.length === 0) {
    toastStore.danger("This host hasn't set up a payment method yet. Please contact them before booking.");
    return;
  }

  const selectedAccount = paymentAccounts.value.find(
    (a) => a.id === selectedAccountId.value,
  );

  isSubmitting.value = true;
  try {
    // ── Step 1: Create Reservation ──────────────────────────
    const reservation = await reservationApi.createReservation({
      room_id: Number(roomId),
      check_in_date: checkInDate.value,
      check_out_date: checkOutDate.value,
      total_guests: Number(guestCount.value),
      special_request: formData?.special_request || "",
    });

    const reservationId = reservation.data?.id ?? reservation.id;

    // ── Step 2: Create Payment ──────────────────────────────
    // transaction_reference is intentionally omitted here — the customer
    // only knows the real reference after making the transfer, so it's
    // collected on the upload step instead.
    const payment = await http.post("/payments", {
      reservation_id: reservationId,
      payment_method_id: selectedAccount.payment_method_id,
      owner_payment_account_id: selectedAccount.id,
    });

    const paymentId = payment.data?.id ?? payment.id;

    toastStore.success("Booking created! Please upload your receipt.");

    // ── Step 3: Go to upload page ───────────────────────────
    router.push({
      name: "customer.payment-upload",
      params: { paymentId },
    });
  } catch (err) {
    const status = err?.status || err?.statusCode;
    if (status === 409) {
      toastStore.danger("This room is already booked for selected dates.");
    } else if (status === 400) {
      toastStore.danger("Invalid booking details. Please check your dates.");
    } else {
      toastStore.danger(err?.message || "Failed to create booking.");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) antialiased selection:bg-sky-500/20"
  >
    <div
      class="absolute top-0 left-1/4 right-1/4 h-[350px] bg-gradient-to-b from-(--color-primary-soft)/20 via-transparent to-transparent blur-3xl pointer-events-none"
    ></div>

    <div
      class="max-w-6xl mx-auto px-4 pt-6 pb-8 sm:px-6 lg:px-8 relative z-10"
    >
      <div class="flex items-center justify-between gap-4 mb-4">
        <AppButton
          variant="secondary"
          size="sm"
          @click="router.back()"
          class="group shadow-xs hover:shadow-md transition-all duration-200"
        >
          <ArrowLeftIcon
            class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span class="font-semibold text-xs tracking-wide">Back to Explorer</span>
        </AppButton>

        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) shrink-0"
        >
          <ShieldCheckIcon class="w-3.5 h-3.5" />
          <span class="text-[10px] font-black uppercase tracking-[0.15em]"
            >Secure Checkout</span
          >
        </div>
      </div>

      <header class="mb-5">
        <h1
          class="text-2xl font-black text-(--color-text) tracking-tight sm:text-3xl"
        >
          Complete Your Booking
        </h1>
        <p
          class="text-xs sm:text-sm text-(--color-muted) mt-1 max-w-xl leading-relaxed"
        >
          Review your stay details and choose a payment method to confirm
          your reservation.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        <main class="lg:col-span-7 space-y-6">
          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition duration-300"
          >
            <BookingForm
              :room="room"
              :check-in-date="checkInDate"
              :check-out-date="checkOutDate"
              :guest-count="guestCount"
              :is-submitting="isSubmitting"
              :calculated-total="calculatedTotal"
              :payment-accounts="paymentAccounts"
              :loading-accounts="loadingAccounts"
              :selected-account-id="selectedAccountId"
              @update:checkInDate="checkInDate = $event"
              @update:checkOutDate="checkOutDate = $event"
              @update:selectedAccountId="selectedAccountId = $event"
              @date-errors="dateErrors = $event"
              @submit="handleSubmit"
            />
          </div>
        </main>

        <aside class="lg:col-span-5 lg:sticky lg:top-24">
          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-3xl overflow-hidden shadow-md relative group"
          >
            <div
              class="h-1.5 w-full bg-gradient-to-r from-(--color-primary) via-sky-400 to-sky-500"
            ></div>

            <div class="p-5 sm:p-6 space-y-4">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-primary) mb-1"
                >
                  Your Stay
                </p>
                <h3
                  class="text-xl font-black text-(--color-text) tracking-tight leading-tight"
                >
                  {{ room?.name || "Loading room…" }}
                </h3>
                <p
                  class="text-sm font-semibold text-(--color-muted) mt-1 flex items-center gap-1"
                >
                  <span
                    class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                  ></span>
                  {{ property?.name || "Loading property…" }}
                </p>
              </div>

              <div
                class="grid grid-cols-2 gap-3 p-1 bg-(--color-surface-soft) rounded-2xl border border-(--color-border)/40"
              >
                <div
                  class="p-2.5 bg-(--color-surface) rounded-[14px] shadow-xs group/date"
                  :class="dateErrors.checkIn ? 'border border-rose-400' : ''"
                >
                  <label
                    class="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1"
                  >
                    <CalendarIcon class="w-3 h-3 text-(--color-primary)" />
                    Check-In <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="checkInDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer focus:text-(--color-primary) transition-colors"
                  />
                </div>

                <div
                  class="p-2.5 bg-(--color-surface) rounded-[14px] shadow-xs group/date"
                  :class="dateErrors.checkOut ? 'border border-rose-400' : ''"
                >
                  <label
                    class="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1"
                  >
                    <CalendarIcon class="w-3 h-3 text-sky-400" />
                    Check-Out <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="checkOutDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer focus:text-(--color-primary) transition-colors"
                  />
                </div>
              </div>

              <p v-if="dateErrors.checkIn" class="text-xs text-rose-500 font-medium -mt-2">
                {{ dateErrors.checkIn }}
              </p>
              <p v-if="dateErrors.checkOut" class="text-xs text-rose-500 font-medium -mt-2">
                {{ dateErrors.checkOut }}
              </p>

              <div
                class="flex items-center justify-between p-3 bg-gradient-to-r from-(--color-primary-soft)/30 to-sky-500/5 rounded-2xl border border-(--color-primary-soft)/40"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-xl bg-(--color-surface) shadow-xs flex items-center justify-center"
                  >
                    <MoonIcon class="w-4 h-4 text-(--color-primary)" />
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-bold tracking-wider uppercase text-(--color-muted)"
                    >
                      Duration
                    </p>
                    <p class="text-sm font-black text-(--color-text)">
                      {{ stayNights }} Night{{ stayNights > 1 ? "s" : "" }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    class="text-[10px] font-bold tracking-wider uppercase text-(--color-muted)"
                  >
                    Base rate
                  </p>
                  <p class="text-sm font-black text-(--color-text)">
                    ${{ room?.price || 0 }}
                    <span class="text-[10px] font-normal text-(--color-muted)"
                      >/ night</span
                    >
                  </p>
                </div>
              </div>

              <div class="space-y-2 pt-1">
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) border-b border-(--color-border)/40 pb-1.5"
                >
                  Price Details
                </p>

                <div class="flex justify-between text-sm">
                  <span class="text-(--color-muted) font-medium"
                    >Room rate ({{ stayNights }} nights)</span
                  >
                  <span class="font-bold text-(--color-text)"
                    >${{ roomCost }}</span
                  >
                </div>

                <div
                  class="flex justify-between items-baseline pt-2.5 border-t border-(--color-border) mt-2.5"
                >
                  <span
                    class="font-black text-base text-(--color-text) tracking-tight"
                    >Total Amount</span
                  >
                  <span
                    class="text-2xl font-black tracking-tight bg-gradient-to-r from-(--color-primary) to-sky-500 bg-clip-text text-transparent"
                  >
                    ${{ calculatedTotal }}
                  </span>
                </div>
              </div>

              <div
                class="flex items-start gap-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-3 transition-colors duration-200"
              >
                <CheckCircleIcon class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div class="text-xs">
                  <p class="font-bold text-emerald-600 dark:text-emerald-400">
                    Flexible Cancellation Protect
                  </p>
                  <p class="text-(--color-muted) mt-0.5 leading-normal">
                    Get a complete reimbursement guarantee up to 48 hours prior
                    to checking in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
