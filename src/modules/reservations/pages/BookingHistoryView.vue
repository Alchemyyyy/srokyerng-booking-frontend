<template>
  <div
    class="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased pb-24 font-sans selection:bg-[#1062b3]/10 selection:text-[#1062b3]"
  >
    <!-- 1. Premium Sticky Navigation Header -->
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

        <div class="flex items-center gap-4">
          <button
            class="text-slate-500 hover:text-[#0f2942] text-xs font-bold transition"
          >
            Export Stay Data (CSV)
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 mt-8">
      <!-- 2. Competition-Grade Bento Grid Analytics Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <!-- Total Trips Metric -->
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

        <!-- Nights Stayed Metric -->
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
            Loyalty Tier Level Tier:
            <span class="text-indigo-600 font-bold">Elite Gold</span>
          </p>
        </div>

        <!-- capital invested / spent metric -->
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
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 .75v.75m0 1.5v1.5m0 1.5v1.5m0 1.5V15m0 1.5V18m0 .75A3.375 3.375 0 0 0 7.125 21h7.5a3.375 3.375 0 0 0 3.375-3.375V1.5a1.125 1.125 0 0 0-1.125-1.125H11.25M3.75 8.25h1.5m10.5 0h1.5M2.25 12h1.5m13.5 0h1.5m-16.5 5.25h1.5m13.5 0h1.5M12 18.75v-15"
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

        <!-- active track metric -->
        <div
          class="bg-gradient-to-br from-[#0f2942] to-[#1d4166] rounded-[24px] p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden text-white group"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"
          ></div>
          <p
            class="text-[10px] font-black uppercase text-slate-300 tracking-widest"
          >
            Active Itinerary
          </p>
          <p class="text-3xl font-black mt-2">1 Live</p>
          <p
            class="text-[11px] text-blue-300 font-medium mt-1 flex items-center gap-1"
          >
            <span
              class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
            ></span>
            Check-in active right now
          </p>
        </div>
      </div>

      <!-- 3. Filter & Workspace Navigation Bar Module Container -->
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

        <!-- Luxury Interactive Segment Tabs Filter row -->
        <div
          class="inline-flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/40 text-xs font-bold"
        >
          <button
            class="bg-white text-[#0f2942] px-4 py-1.5 rounded-lg shadow-sm"
          >
            All Stays
          </button>
          <button
            class="text-slate-500 hover:text-[#0f2942] px-4 py-1.5 rounded-lg transition duration-200"
          >
            Upcoming
          </button>
          <button
            class="text-slate-500 hover:text-[#0f2942] px-4 py-1.5 rounded-lg transition duration-200"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- 4. Chronological Booking History Feed Stack Cards Matrix -->
      <div class="space-y-4">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/30 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <!-- Left side layout branch item: Media and descriptive blocks -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto"
          >
            <!-- Asset Media Frame Container -->
            <div
              class="w-full sm:w-28 h-28 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative group"
            >
              <img
                :src="booking.roomImage"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <!-- Booking breakdown dynamic specifications text description block -->
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

              <!-- Check-In / Check-Out Node Calendar Interval String Track -->
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

          <!-- Right side block layout elements line node: Dynamic statuses & explicit operational CTA buttons -->
          <div
            class="flex sm:items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0"
          >
            <!-- Rates configuration tracking aggregate price node segment -->
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

            <!-- Operational Dynamic Status Tags Matrix Wrapper Block element selection framework -->
            <div
              class="flex flex-col sm:flex-row items-end sm:items-center gap-3"
            >
              <!-- Status Capsule Renderer Logic Frame code block track -->
              <div
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm',
                  booking.status === 'Confirmed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/80'
                    : '',
                  booking.status === 'Completed'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : '',
                  booking.status === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-100/80'
                    : '',
                ]"
              >
                <span
                  :class="[
                    'w-1.5 h-1.5 rounded-full',
                    booking.status === 'Confirmed'
                      ? 'bg-emerald-500 animate-pulse'
                      : '',
                    booking.status === 'Completed' ? 'bg-slate-400' : '',
                    booking.status === 'Cancelled' ? 'bg-rose-500' : '',
                  ]"
                ></span>
                {{ booking.status }}
              </div>

              <!-- Functional Explicit Action Row Node Triggers -->
              <div class="flex items-center gap-1.5">
                <button
                  class="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                >
                  Receipt
                </button>
                <button
                  v-if="booking.status === 'Confirmed'"
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
</template>

<script setup>
import { ref } from "vue";

// Competition Dashboard Global Stats Configuration Ref object array matrix
const stats = ref({
  totalReservations: 4,
  totalNights: 14,
  totalSpent: 780,
});

// Chronological Array Dataset Mapping Core Bookings Configurations Mock Layer arrays data track
const bookings = ref([
  {
    id: "94021",
    roomName: "Deluxe Premium Suite",
    roomImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    location: "Angkor Palace Luxury Hotel Resort, Siem Reap",
    checkIn: "Jun 12, 2026",
    checkOut: "Jun 15, 2026",
    nights: 3,
    totalPrice: 120,
    status: "Confirmed",
  },
  {
    id: "83910",
    roomName: "Panoramic Horizon Executive Suite",
    roomImage:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80",
    location: "Vattanac Capital Luxury Suites, Phnom Penh",
    checkIn: "May 02, 2026",
    checkOut: "May 07, 2026",
    nights: 5,
    totalPrice: 350,
    status: "Completed",
  },
  {
    id: "76110",
    roomName: "Oceanfront Sanctuary Villa",
    roomImage:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
    location: "Royal Sands Resort, Koh Rong Island",
    checkIn: "Apr 10, 2026",
    checkOut: "Apr 16, 2026",
    nights: 6,
    totalPrice: 310,
    status: "Completed",
  },
  {
    id: "62104",
    roomName: "Classic Heritage King Room",
    roomImage:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
    location: "Bokor Mountain Historic Palace, Kampot",
    checkIn: "Mar 01, 2026",
    checkOut: "Mar 02, 2026",
    nights: 1,
    totalPrice: 40,
    status: "Cancelled",
  },
]);
</script>
