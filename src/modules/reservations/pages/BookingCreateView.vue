<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { reservationApi } from "../api/reservation.api";
import { useToastStore } from "@/shared/store/toastStore";
import http from "@/app/api/http";
import AppButton from "@/shared/components/AppButton.vue";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import BookingForm from "../components/BookingForm.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";

const authStore = useAuthStore();
const formErrors = ref({});
const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const roomId = route.params.id;
const propertyId = route.query.propertyId;
const checkInDate = ref(route.query.checkIn || "");
const checkOutDate = ref(route.query.checkOut || "");
const guestCount = ref(Number(route.query.guests) || 2);

const currentStep = ref(1);
const room = ref(null);
const property = ref(null);
const isSubmitting = ref(false);

const validateStep1 = () => {
  const errors = {};
  if (!form.value.firstName.trim())
    errors.firstName = "First name is required.";
  if (!form.value.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.value.email.trim()) errors.email = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.value.email))
    errors.email = "Invalid email format.";
  if (!checkInDate.value) errors.checkIn = "Check-in date is required.";
  if (!checkOutDate.value) errors.checkOut = "Check-out date is required.";
  if (
    checkInDate.value &&
    checkOutDate.value &&
    checkInDate.value >= checkOutDate.value
  ) {
    errors.checkOut = "Check-out must be after check-in.";
  }
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const goToStep2 = () => {
  if (validateStep1()) currentStep.value = 2;
};

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  notes: "",
  selectedAddons: [],
});

const availableAddons = ref([
  {
    id: "airport",
    icon: "✈️",
    name: "Airport Transfer",
    description: "Private pickup via luxury vehicle",
    price: 45,
  },
  {
    id: "lounge",
    icon: "🥂",
    name: "VIP Lounge Access",
    description: "All-day dining & open bar privileges",
    price: 60,
  },
  {
    id: "spa",
    icon: "💆",
    name: "Khmer Spa Massage",
    description: "90-min aromatherapy session",
    price: 35,
  },
]);

const steps = [
  { id: 1, label: "Guest Info" },
  { id: 2, label: "Upgrades" },
  { id: 3, label: "Payment" },
];

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
});

const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const start = new Date(checkInDate.value);
  const end = new Date(checkOutDate.value);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
});

const getAddonPrice = (id) =>
  availableAddons.value.find((a) => a.id === id)?.price || 0;
const getAddonName = (id) =>
  availableAddons.value.find((a) => a.id === id)?.name || "";

const roomCost = computed(() => (room.value?.price || 0) * stayNights.value);
const addonsCost = computed(() =>
  form.value.selectedAddons.reduce((acc, id) => acc + getAddonPrice(id), 0),
);
const calculatedTotal = computed(() => roomCost.value + addonsCost.value);

const handleSubmit = async (formData) => {
  isSubmitting.value = true;
  try {
    await authStore.refreshSession();

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
    const payment = await http.post("/payments", {
      reservation_id: reservationId,
      payment_method_id: 2, // ← adjust as needed
      transaction_reference: `TXN-${Date.now()}`,
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
      class="max-w-6xl mx-auto px-4 pt-28 pb-24 sm:px-6 lg:px-8 relative z-10"
    >
      <div class="flex items-center justify-between mb-8">
        <AppButton
          variant="secondary"
          size="sm"
          @click="router.back()"
          class="group shadow-xs hover:shadow-md transition-all duration-200"
        >
          <ArrowLeftIcon
            class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span class="font-semibold text-xs tracking-wide"
            >Back to Explorer</span
          >
        </AppButton>

        <nav
          class="hidden sm:flex items-center gap-2 bg-(--color-surface-soft) border border-(--color-border)/60 p-1 rounded-full backdrop-blur-md"
        >
          <div
            v-for="(step, idx) in steps"
            :key="step.id"
            class="flex items-center"
          >
            <span
              class="px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 tracking-wide"
              :class="
                currentStep === step.id
                  ? 'bg-(--color-primary) text-white shadow-sm'
                  : 'text-(--color-muted)'
              "
            >
              {{ step.label }}
            </span>
            <span
              v-if="idx < steps.length - 1"
              class="text-xs text-(--color-muted)/40 px-1"
              >/</span
            >
          </div>
        </nav>
      </div>

      <header class="mb-12">
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) mb-3"
        >
          <ShieldCheckIcon class="w-3.5 h-3.5" />
          <span class="text-[10px] font-black uppercase tracking-[0.15em]"
            >Bank-Grade Secure Checkout</span
          >
        </div>
        <h1
          class="text-4xl font-black text-(--color-text) tracking-tight sm:text-5xl"
        >
          Complete Your Booking
        </h1>
        <p
          class="text-sm sm:text-base text-(--color-muted) mt-2 max-w-xl leading-relaxed"
        >
          Review your itinerary data, personalize premium local upgrades, and
          lock down your upcoming retreat experience.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        <main class="lg:col-span-7 space-y-6">
          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition duration-300"
          >
            <BookingForm
              :room="room"
              :check-in-date="checkInDate"
              :check-out-date="checkOutDate"
              :guest-count="guestCount"
              :is-submitting="isSubmitting"
              :calculated-total="calculatedTotal"
              @update:checkInDate="checkInDate = $event"
              @update:checkOutDate="checkOutDate = $event"
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

            <div class="p-6 sm:p-8 space-y-6">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-primary) mb-1.5"
                >
                  Selected Sanctuary
                </p>
                <h3
                  class="text-2xl font-black text-(--color-text) tracking-tight leading-tight"
                >
                  {{ room?.name || "Gathering Information..." }}
                </h3>
                <p
                  class="text-sm font-semibold text-(--color-muted) mt-1 flex items-center gap-1"
                >
                  <span
                    class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                  ></span>
                  {{ property?.name || "Loading context..." }}
                </p>
              </div>

              <div
                class="grid grid-cols-2 gap-3 p-1 bg-(--color-surface-soft) rounded-2xl border border-(--color-border)/40"
              >
                <div
                  class="p-3 bg-(--color-surface) rounded-[14px] shadow-xs group/date"
                >
                  <label
                    class="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1.5"
                  >
                    <CalendarIcon class="w-3 h-3 text-(--color-primary)" />
                    Check-In
                  </label>
                  <input
                    v-model="checkInDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer focus:text-(--color-primary) transition-colors"
                  />
                </div>

                <div
                  class="p-3 bg-(--color-surface) rounded-[14px] shadow-xs group/date"
                >
                  <label
                    class="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1.5"
                  >
                    <CalendarIcon class="w-3 h-3 text-sky-400" />
                    Check-Out
                  </label>
                  <input
                    v-model="checkOutDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer focus:text-(--color-primary) transition-colors"
                  />
                </div>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gradient-to-r from-(--color-primary-soft)/30 to-sky-500/5 rounded-2xl border border-(--color-primary-soft)/40"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl bg-(--color-surface) shadow-xs flex items-center justify-center text-sm"
                  >
                    🌙
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

              <div class="space-y-3 pt-2">
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) border-b border-(--color-border)/40 pb-2"
                >
                  Cost Statement
                </p>

                <div class="flex justify-between text-sm">
                  <span class="text-(--color-muted) font-medium"
                    >Room Base Stay ({{ stayNights }} nights)</span
                  >
                  <span class="font-bold text-(--color-text)"
                    >${{ roomCost }}</span
                  >
                </div>

                <div
                  v-for="addonId in form.selectedAddons"
                  :key="addonId"
                  class="flex justify-between text-sm animate-fadeIn"
                >
                  <span
                    class="text-(--color-muted) flex items-center gap-1.5 font-medium"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    {{ getAddonName(addonId) }}
                  </span>
                  <span class="font-bold text-sky-500"
                    >+${{ getAddonPrice(addonId) }}</span
                  >
                </div>

                <div
                  class="flex justify-between items-baseline pt-4 border-t border-(--color-border) mt-4"
                >
                  <div>
                    <span
                      class="font-black text-base text-(--color-text) tracking-tight"
                      >Total Amount</span
                    >
                    <p
                      class="text-[10px] text-(--color-muted) font-medium mt-0.5"
                    >
                      Includes local service levies
                    </p>
                  </div>
                  <span
                    class="text-3xl font-black tracking-tight bg-gradient-to-r from-(--color-primary) to-sky-500 bg-clip-text text-transparent"
                  >
                    ${{ calculatedTotal }}
                  </span>
                </div>
              </div>

              <div
                class="flex items-start gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-3.5 transition-colors duration-200"
              >
                <span class="text-emerald-500 text-sm mt-0.5">✓</span>
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

<style scoped>
/* High performance opacity and transform pipelines for dynamic additions */
.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
