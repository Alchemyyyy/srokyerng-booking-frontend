<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { reservationApi } from "../api/reservation.api";
import { useAuthStore } from "@/modules/auth/store/authStore";
import BookingStatusBadge from "../components/BookingStatusBadge.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref("");
const booking = ref(null);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toISOString().split("T")[0];
};

const nights = computed(() => {
  if (!booking.value) return 0;
  const checkIn = new Date(booking.value.check_in_date);
  const checkOut = new Date(booking.value.check_out_date);
  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
});

const totalAmount = computed(() => Number(booking.value?.total_amount || 0));

const pricePerNight = computed(() =>
  Number(booking.value?.price_per_night || 0),
);

const basePrice = computed(() => pricePerNight.value * nights.value);

const status = computed(() =>
  String(booking.value?.reservation_status || "pending").toLowerCase(),
);

const canCancel = computed(() =>
  ["pending", "confirmed"].includes(status.value),
);

const qrUrl = computed(
  () =>
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RES-${booking.value?.id}_${booking.value?.customer_name}`,
);

const fetchBooking = async () => {
  loading.value = true;
  error.value = "";
  try {
    await authStore.refreshSession();
    const res = await reservationApi.getReservationById(route.params.id);
    console.log("Raw detail response:", JSON.stringify(res)); // ← add this
    const data = Array.isArray(res) ? res[0] : res?.data || res;
    booking.value = data;
  } catch (err) {
    error.value = "Failed to load reservation details.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleCancel = async () => {
  if (!confirm("Are you sure you want to cancel this reservation?")) return;
  try {
    await authStore.refreshSession();
    await reservationApi.cancelReservation(route.params.id);
    await fetchBooking();
  } catch (err) {
    console.error("Cancel failed:", err);
  }
};

onMounted(fetchBooking);
</script>

<template>
  <div
    class="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased pb-24 font-sans"
  >
    <!-- Header -->
    <header
      class="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-40"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs font-semibold"
      >
        <div class="flex items-center gap-2.5 text-slate-400">
          <button
            @click="router.push({ name: 'customer.booking-history' })"
            class="hover:text-[#1062b3] transition duration-300"
          >
            History
          </button>
          <span class="text-slate-300 text-[10px] font-light">/</span>
          <span class="text-[#0f2942] font-bold tracking-tight">
            RES-{{ route.params.id }}
          </span>
        </div>
        <button
          v-if="canCancel"
          @click="handleCancel"
          class="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl shadow-sm transition text-xs"
        >
          Cancel Reservation
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-24 text-slate-400 text-sm font-semibold"
    >
      Loading reservation...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="text-center py-24 text-rose-500 text-sm font-semibold"
    >
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="booking" class="max-w-7xl mx-auto px-6 mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- LEFT -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Status + Title -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <BookingStatusBadge :status="status" size="md" />
              <span class="text-xs text-slate-400 font-bold">
                Booked on {{ formatDate(booking.created_at) }}
              </span>
            </div>
            <h1
              class="text-3xl md:text-4xl font-black tracking-tight text-[#0f2942]"
            >
              Your Stay at {{ booking.property_name }}
            </h1>
          </div>

          <!-- Check-in / Check-out -->
          <div
            class="grid grid-cols-2 gap-4 bg-white border border-slate-200/60 p-5 rounded-[24px] shadow-xl shadow-slate-100/50"
          >
            <div class="space-y-1">
              <span
                class="text-[9px] font-black uppercase text-slate-400 tracking-widest block"
              >
                📅 Scheduled Arrival
              </span>
              <p class="text-sm font-black text-[#0f2942]">
                {{ formatDate(booking.check_in_date) }}
              </p>
              <p class="text-[11px] text-slate-400 font-medium">
                Standard Check-In from 2:00 PM
              </p>
            </div>
            <div class="space-y-1 border-l border-slate-100 pl-5">
              <span
                class="text-[9px] font-black uppercase text-slate-400 tracking-widest block"
              >
                📅 Scheduled Departure
              </span>
              <p class="text-sm font-black text-[#0f2942]">
                {{ formatDate(booking.check_out_date) }}
              </p>
              <p class="text-[11px] text-slate-400 font-medium">
                Standard Check-Out by 11:00 AM
              </p>
            </div>
          </div>

          <!-- Room Info -->
          <div
            class="bg-white border border-slate-200/60 rounded-[28px] overflow-hidden shadow-xl shadow-slate-100/50 flex flex-col sm:flex-row"
          >
            <div
              class="w-full sm:w-44 h-44 sm:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0"
            >
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=80"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6 flex flex-col justify-between space-y-4">
              <div class="space-y-1">
                <span
                  class="text-[9px] font-black uppercase text-[#1062b3] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md tracking-wider"
                >
                  Assigned Space
                </span>
                <h3 class="text-base font-black text-[#0f2942] pt-1">
                  {{ booking.room_name }}
                </h3>
                <p class="text-xs text-slate-400 font-semibold">
                  {{ nights }} Nights Total Stay
                </p>
              </div>
              <div
                class="flex items-center gap-4 text-[11px] text-slate-500 font-bold border-t border-slate-50 pt-3"
              >
                <span>👥 {{ booking.total_guests }} Guests</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>📍 {{ booking.property_name }}</span>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="space-y-3.5">
            <h2
              class="text-xs font-black text-[#0f2942] uppercase tracking-widest border-l-2 border-[#1062b3] pl-3"
            >
              Itemized Financial Summary
            </h2>
            <div
              class="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-100/50 space-y-3.5 text-xs font-semibold text-slate-500"
            >
              <div class="flex justify-between items-center">
                <span
                  >Room Base Rate (${{ pricePerNight }} ×
                  {{ nights }} nights)</span
                >
                <span class="text-[#0f2942] font-black">${{ basePrice }}</span>
              </div>
              <div
                class="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-700 font-black text-sm"
              >
                <span class="text-[#0f2942] uppercase tracking-wider"
                  >Total</span
                >
                <span class="text-2xl text-[#1062b3] font-black"
                  >${{ totalAmount }}</span
                >
              </div>

              <!-- Special Request -->
              <div
                v-if="booking.special_request"
                class="pt-2 border-t border-slate-100"
              >
                <p
                  class="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1"
                >
                  Special Request
                </p>
                <p class="text-xs text-slate-600">
                  {{ booking.special_request }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Boarding Pass -->
        <div class="lg:col-span-5 lg:sticky lg:top-24">
          <div
            class="bg-gradient-to-b from-[#0f2942] to-[#1a3857] text-white rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden relative border border-slate-800"
          >
            <div class="p-6 md:p-8 space-y-6 relative z-10">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-[9px] font-black uppercase text-slate-300 tracking-widest"
                  >
                    Digital Boarding Voucher
                  </p>
                  <p class="text-lg font-black tracking-tight mt-0.5">
                    {{ booking.property_name }}
                  </p>
                </div>
                <BookingStatusBadge :status="status" size="sm" />
              </div>

              <div
                class="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-white/10 text-xs font-bold"
              >
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Guest Name</span
                  >
                  <span class="text-sm font-black tracking-wide">{{
                    booking.customer_name
                  }}</span>
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Confirmation Ref</span
                  >
                  <span
                    class="text-sm font-black tracking-wide text-[#1062b3] bg-white px-2 py-0.5 rounded-lg inline-block shadow-sm"
                  >
                    #{{ booking.id }}
                  </span>
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Room</span
                  >
                  <span
                    class="text-sm font-black tracking-wide text-slate-200"
                    >{{ booking.room_name }}</span
                  >
                </div>
                <div>
                  <span
                    class="block text-[9px] text-slate-400 uppercase tracking-widest font-black"
                    >Guests</span
                  >
                  <span class="text-sm font-black tracking-wide text-slate-200"
                    >{{ booking.total_guests }} Guests</span
                  >
                </div>
              </div>
            </div>

            <!-- Ticket divider -->
            <div
              class="relative h-4 flex items-center justify-between px-0 overflow-hidden select-none pointer-events-none"
            >
              <div
                class="w-4 h-8 bg-[#f8fafc] rounded-full transform translate-x-[-8px]"
              ></div>
              <div
                class="w-full border-b-2 border-dashed border-white/10 px-4"
              ></div>
              <div
                class="w-4 h-8 bg-[#f8fafc] rounded-full transform translate-x-[8px]"
              ></div>
            </div>

            <!-- QR Code -->
            <div
              class="p-6 md:p-8 bg-white text-slate-800 text-center space-y-4 flex flex-col items-center justify-center"
            >
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                Present QR Code at Reception
              </p>
              <div
                class="w-36 h-36 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl shadow-inner"
              >
                <img
                  :src="qrUrl"
                  alt="QR Code"
                  class="w-full h-full object-contain"
                />
              </div>
              <button
                @click="router.push({ name: 'customer.booking-history' })"
                class="w-full bg-[#0f2942] hover:bg-[#1a3857] text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition-all uppercase tracking-widest cursor-pointer"
              >
                Back to History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
