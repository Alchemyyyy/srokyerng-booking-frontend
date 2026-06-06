<script setup>
import { ref, computed, onMounted } from "vue";
import { reservationApi } from "../api/reservation.api";

const loading = ref(true);
const error = ref("");
const bookings = ref([]);
const activeFilter = ref("all");

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
  totalSpent: bookings.value.reduce(
    (sum, b) => sum + Number(b.totalPrice || 0),
    0,
  ),
  activeCount: bookings.value.filter((b) =>
    ["confirmed", "pending"].includes(String(b.status).toLowerCase()),
  ).length,
}));

const normalizeBooking = (item, index) => {
  const checkIn = item.check_in || item.checkIn || item.start_date || "-";
  const checkOut = item.check_out || item.checkOut || item.end_date || "-";
  const nights =
    checkIn !== "-" && checkOut !== "-"
      ? Math.ceil(
          (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
        )
      : 0;

  return {
    id: item.id || index + 1,
    roomName: item.room?.name || item.roomName || item.room_name || "Room",
    roomImage:
      item.room?.image ||
      item.roomImage ||
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    location:
      item.property?.name || item.propertyName || item.location || "Unknown",
    checkIn,
    checkOut,
    nights,
    totalPrice: Number(item.total_price || item.totalPrice || item.amount || 0),
    status: item.status || "pending",
  };
};

const fetchBookings = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await reservationApi.getMyReservations();
    const items = Array.isArray(response) ? response : response?.data || [];
    bookings.value = items.map(normalizeBooking);
  } catch (err) {
    error.value = err?.message || "Failed to load reservations.";
    console.error("Booking fetch error:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBookings);
</script>

<template>
  <div
    class="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased pb-24 font-sans selection:bg-[#1062b3]/10 selection:text-[#1062b3]"
  >
    <!-- Header -->
    <header
      class="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-40"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs font-semibold"
      >
        <div class="flex items-center gap-2.5 text-slate-400">
          <a href="#" class="hover:text-[#1062b3] transition duration-300"
            >Dashboard</a
          >
          <span class="text-slate-300 text-[10px] font-light">/</span>
          <span class="text-[#0f2942] font-bold tracking-tight"
            >Booking History</span
          >
        </div>
        <button
          class="text-slate-500 hover:text-[#0f2942] text-xs font-bold transition"
        >
          Export Stay Data (CSV)
        </button>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 mt-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <!-- Total Bookings -->
        <div
          class="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-[#1062b3] group-hover:scale-110 transition-transform duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-16 h-16"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </div>
          <p
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
          >
            Total Bookings
          </p>
          <p class="text-3xl font-black text-[#0f2942] mt-2">
            {{ stats.totalReservations }}
          </p>
          <p class="text-[11px] text-slate-400 font-semibold mt-1">
            Across all global properties
          </p>
        </div>

        <!-- Total Nights -->
        <div
          class="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-indigo-600 group-hover:scale-110 transition-transform duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-16 h-16"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          </div>
          <p
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
          >
            Total Nights
          </p>
          <p class="text-3xl font-black text-indigo-600 mt-2">
            {{ stats.totalNights }}
          </p>
          <p class="text-[11px] text-slate-400 font-semibold mt-1">
            Loyalty Tier:
            <span class="text-indigo-600 font-bold">Elite Gold</span>
          </p>
        </div>

        <!-- Capital Invested -->
        <div
          class="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xl shadow-slate-100/40 relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-emerald-600 group-hover:scale-110 transition-transform duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-16 h-16"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33"
              />
            </svg>
          </div>
          <p
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest"
          >
            Capital Invested
          </p>
          <p class="text-3xl font-black text-emerald-600 mt-2">
            ${{ stats.totalSpent }}
          </p>
          <p class="text-[11px] text-slate-400 font-semibold mt-1">
            Inclusive of premium upgrades
          </p>
        </div>

        <!-- Active Itinerary -->
        <div
          class="bg-gradient-to-br from-[#0f2942] to-[#1d4166] rounded-[24px] p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden text-white"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"
          />
          <p
            class="text-[10px] font-black uppercase text-slate-300 tracking-widest"
          >
            Active Itinerary
          </p>
          <p class="text-3xl font-black mt-2">{{ stats.activeCount }} Live</p>
          <p
            class="text-[11px] text-blue-300 font-medium mt-1 flex items-center gap-1"
          >
            <span
              class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
            />
            Check-in active right now
          </p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/60 pb-4"
      >
        <div>
          <h2 class="text-xl font-black text-[#0f2942] tracking-tight">
            Your Reservation Timeline
          </h2>
          <p class="text-xs text-slate-400 font-medium mt-0.5">
            Manage, track, or modify your ongoing accommodations.
          </p>
        </div>

        <div
          class="inline-flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/40 text-xs font-bold"
        >
          <button
            :class="
              activeFilter === 'all'
                ? 'bg-white text-[#0f2942] shadow-sm'
                : 'text-slate-500 hover:text-[#0f2942]'
            "
            class="px-4 py-1.5 rounded-lg transition duration-200"
            @click="activeFilter = 'all'"
          >
            All Stays
          </button>
          <button
            :class="
              activeFilter === 'upcoming'
                ? 'bg-white text-[#0f2942] shadow-sm'
                : 'text-slate-500 hover:text-[#0f2942]'
            "
            class="px-4 py-1.5 rounded-lg transition duration-200"
            @click="activeFilter = 'upcoming'"
          >
            Upcoming
          </button>
          <button
            :class="
              activeFilter === 'completed'
                ? 'bg-white text-[#0f2942] shadow-sm'
                : 'text-slate-500 hover:text-[#0f2942]'
            "
            class="px-4 py-1.5 rounded-lg transition duration-200"
            @click="activeFilter = 'completed'"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- Booking List -->
      <div>
        <!-- Loading -->
        <div
          v-if="loading"
          class="text-center py-16 text-slate-400 text-sm font-semibold"
        >
          Loading your reservations...
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="text-center py-16 text-rose-500 text-sm font-semibold"
        >
          {{ error }}
        </div>

        <!-- Empty -->
        <div
          v-else-if="filteredBookings.length === 0"
          class="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl text-sm font-semibold"
        >
          No reservations found.
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
          <div
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/30 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <!-- Left: Image + Info -->
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto"
            >
              <div
                class="w-full sm:w-28 h-28 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 group"
              >
                <img
                  :src="booking.roomImage"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="text-xs font-black text-[#0f2942] tracking-tight hover:text-[#1062b3] transition cursor-pointer"
                  >
                    {{ booking.roomName }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium"
                    >· ID: #RES-{{ booking.id }}</span
                  >
                </div>

                <p
                  class="text-xs text-slate-500 font-bold flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  {{ booking.location }}
                </p>

                <div
                  class="text-xs font-bold text-slate-400 flex items-center flex-wrap gap-x-3 gap-y-1 pt-0.5"
                >
                  <span
                    class="bg-slate-50 border border-slate-100 text-[#0f2942] px-2.5 py-1 rounded-lg"
                  >
                    <span
                      class="text-[9px] uppercase tracking-wider text-slate-400 block font-black"
                      >In</span
                    >
                    {{ booking.checkIn }}
                  </span>
                  <span
                    class="text-[10px] text-slate-300 font-light hidden sm:inline"
                    >➔</span
                  >
                  <span
                    class="bg-slate-50 border border-slate-100 text-[#0f2942] px-2.5 py-1 rounded-lg"
                  >
                    <span
                      class="text-[9px] uppercase tracking-wider text-slate-400 block font-black"
                      >Out</span
                    >
                    {{ booking.checkOut }}
                  </span>
                  <span
                    class="text-[#1062b3] bg-blue-50/70 border border-blue-100/60 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                  >
                    {{ booking.nights }} Nights
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Price + Status + Actions -->
            <div
              class="flex sm:items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0"
            >
              <div class="lg:text-right">
                <span
                  class="text-[9px] uppercase font-black text-slate-400 tracking-widest block"
                  >Settled Amount</span
                >
                <span class="text-xl font-black text-[#0f2942] tracking-tight"
                  >${{ booking.totalPrice }}</span
                >
                <span class="text-slate-400 text-[10px] font-medium block"
                  >Paid via Card ending *4921</span
                >
              </div>

              <div
                class="flex flex-col sm:flex-row items-end sm:items-center gap-3"
              >
                <!-- Status Badge -->
                <div
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm',
                    String(booking.status).toLowerCase() === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100/80'
                      : '',
                    String(booking.status).toLowerCase() === 'completed'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : '',
                    String(booking.status).toLowerCase() === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-100/80'
                      : '',
                    String(booking.status).toLowerCase() === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-100/80'
                      : '',
                  ]"
                >
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full',
                      String(booking.status).toLowerCase() === 'confirmed'
                        ? 'bg-emerald-500 animate-pulse'
                        : '',
                      String(booking.status).toLowerCase() === 'completed'
                        ? 'bg-slate-400'
                        : '',
                      String(booking.status).toLowerCase() === 'cancelled'
                        ? 'bg-rose-500'
                        : '',
                      String(booking.status).toLowerCase() === 'pending'
                        ? 'bg-amber-500 animate-pulse'
                        : '',
                    ]"
                  />
                  {{ booking.status }}
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1.5">
                  <button
                    class="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Receipt
                  </button>
                  <button
                    v-if="
                      ['confirmed', 'pending'].includes(
                        String(booking.status).toLowerCase(),
                      )
                    "
                    class="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Cancel Stay
                  </button>
                  <button
                    v-else
                    class="bg-[#1062b3] hover:bg-[#0b427b] text-white font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition duration-200 cursor-pointer"
                  >
                    Book Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
