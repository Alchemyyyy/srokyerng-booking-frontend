<script setup>
import { ref, computed, onMounted } from "vue";
import { reservationApi } from "../api/reservation.api";
import { useRouter } from "vue-router";
import BookingCard from "../components/BookingCard.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";

const router = useRouter();
const loading = ref(true);
const error = ref("");
const bookings = ref([]);
const activeFilter = ref("all");
const authStore = useAuthStore();

const handleCancel = async (id) => {
  if (!confirm("Are you sure you want to cancel this reservation?")) return;
  try {
    await authStore.refreshSession();
    await reservationApi.cancelReservation(id);
    await fetchBookings();
  } catch (err) {
    console.error("Cancel failed:", err);
  }
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
  totalSpent: bookings.value.reduce(
    (sum, b) => sum + Number(b.totalPrice || 0),
    0,
  ),
  activeCount: bookings.value.filter((b) =>
    ["confirmed", "pending"].includes(String(b.status).toLowerCase()),
  ).length,
}));

const normalizeBooking = (item, index) => {
  const checkIn = item.check_in_date || item.check_in || "-";
  const checkOut = item.check_out_date || item.check_out || "-";
  const nights =
    checkIn !== "-" && checkOut !== "-"
      ? Math.ceil(
          (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24),
        )
      : 0;

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return {
    id: item.id || index + 1,
    roomName: item.room_name || item.room?.name || "Room",
    roomImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    location: item.property_name || item.property?.name || "Unknown",
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut),
    nights,
    totalPrice: Number(item.total_amount || item.total_price || 0),
    status: item.reservation_status || item.status || "pending",
  };
};
const fetchBookings = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await reservationApi.getMyReservations();
    const items = Array.isArray(response) ? response : response?.data || [];
    console.log("Raw booking data:", JSON.stringify(items[0])); // ← add this
    bookings.value = items.map(normalizeBooking);
  } catch (err) {
    error.value = err?.message || "Failed to load reservations.";
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
          <BookingCard
            v-for="booking in filteredBookings"
            :key="booking.id"
            :booking="booking"
            @view="
              router.push({
                name: 'customer.booking-detail',
                params: { id: $event },
              })
            "
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>
