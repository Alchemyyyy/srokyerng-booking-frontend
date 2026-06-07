<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { reservationApi } from "../api/reservation.api";
import { useToastStore } from "@/shared/store/toastStore";
import http from "@/app/api/http";
import AppButton from "@/shared/components/AppButton.vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
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
  )
    errors.checkOut = "Check-out must be after check-in.";
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
    const r = roomRes.data?.data || roomRes.data;
    room.value = {
      id: r.id,
      name: r.room_name,
      price: Number(r.price_per_night) || 0,
      capacity: r.max_guests,
    };

    const propRes = await http.get(`/properties/${propertyId}`);
    const p = propRes.data?.data || propRes.data;
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

const toggleAddon = (addon) => {
  const index = form.value.selectedAddons.indexOf(addon.id);
  if (index === -1) form.value.selectedAddons.push(addon.id);
  else form.value.selectedAddons.splice(index, 1);
};

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
    await reservationApi.createReservation({
      room_id: Number(roomId),
      check_in_date: checkInDate.value,
      check_out_date: checkOutDate.value,
      total_guests: Number(guestCount.value),
      special_request: formData?.special_request || "",
    });
    toastStore.success("Booking created successfully!");
    router.push({ name: "customer.booking-history" });
  } catch (err) {
    toastStore.danger(err?.message || "Failed to create booking.");
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text) font-sans">
    <div class="max-w-6xl mx-auto px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      <!-- Add this before Page Header -->
      <AppButton
        variant="secondary"
        size="sm"
        @click="router.back()"
        class="mb-6"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        Back
      </AppButton>
      <!-- Page Header -->
      <div class="mb-10">
        <p
          class="text-xs font-bold uppercase tracking-widest text-(--color-primary) mb-2"
        >
          Secure Checkout
        </p>
        <h1 class="text-3xl font-black text-(--color-text) tracking-tight">
          Complete Your Booking
        </h1>
        <p class="text-sm text-(--color-muted) mt-1">
          You're just a few steps away from your stay.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left: Form Steps -->
        <div class="lg:col-span-7">
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

        <!-- Right: Booking Summary -->
        <div class="lg:col-span-5 lg:sticky lg:top-24">
          <div
            class="bg-(--color-surface) border border-(--color-border) rounded-3xl overflow-hidden shadow-sm"
          >
            <!-- Top accent bar -->
            <div
              class="h-1.5 w-full"
              style="
                background: linear-gradient(
                  to right,
                  var(--color-primary),
                  #60a5fa
                );
              "
            ></div>

            <div class="p-6 space-y-5">
              <!-- Room Info -->
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-1"
                >
                  Your Reservation
                </p>
                <h3 class="text-xl font-black text-(--color-text)">
                  {{ room?.name || "Loading..." }}
                </h3>
                <p class="text-sm text-(--color-muted) mt-0.5">
                  {{ property?.name || "" }}
                </p>
              </div>

              <!-- Dates -->
              <div
                class="grid grid-cols-2 gap-3 py-4 border-y border-(--color-border)"
              >
                <div class="bg-(--color-surface-soft) rounded-xl p-3">
                  <p
                    class="text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-1"
                  >
                    Check-In
                  </p>
                  <input
                    v-model="checkInDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none"
                  />
                </div>
                <div class="bg-(--color-surface-soft) rounded-xl p-3">
                  <p
                    class="text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-1"
                  >
                    Check-Out
                  </p>
                  <input
                    v-model="checkOutDate"
                    type="date"
                    class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none"
                  />
                </div>
              </div>

              <!-- Stay info -->
              <div class="flex items-center gap-3 text-sm">
                <div
                  class="w-8 h-8 rounded-lg bg-(--color-primary-soft) flex items-center justify-center text-base"
                >
                  🌙
                </div>
                <span class="text-(--color-muted) font-medium"
                  >{{ stayNights }} night{{ stayNights > 1 ? "s" : "" }}</span
                >
                <span class="ml-auto font-bold text-(--color-text)"
                  >${{ room?.price || 0 }}/night</span
                >
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2.5 pt-1">
                <div class="flex justify-between text-sm">
                  <span class="text-(--color-muted)"
                    >Room × {{ stayNights }} nights</span
                  >
                  <span class="font-bold text-(--color-text)"
                    >${{ roomCost }}</span
                  >
                </div>

                <div
                  v-for="addonId in form.selectedAddons"
                  :key="addonId"
                  class="flex justify-between text-sm"
                >
                  <span class="text-(--color-muted)">{{
                    getAddonName(addonId)
                  }}</span>
                  <span class="font-bold text-(--color-text)"
                    >+${{ getAddonPrice(addonId) }}</span
                  >
                </div>

                <div
                  class="flex justify-between pt-3 border-t border-(--color-border)"
                >
                  <span class="font-black text-(--color-text)">Total</span>
                  <span
                    class="text-2xl font-black"
                    style="color: var(--color-primary)"
                    >${{ calculatedTotal }}</span
                  >
                </div>
              </div>

              <!-- Trust badge -->
              <div
                class="flex items-center gap-2.5 bg-(--color-surface-soft) rounded-xl p-3 text-xs text-(--color-muted)"
              >
                <span class="text-emerald-500 text-base">✓</span>
                <span>Free cancellation up to 48 hours before check-in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PublicFooter />
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
