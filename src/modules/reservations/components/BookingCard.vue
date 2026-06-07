<script setup>
import { computed } from "vue";
import BookingStatusBadge from "./BookingStatusBadge.vue";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cancel", "view"]);

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  return new Date(dateStr).toISOString().split("T")[0];
};

const checkIn = computed(() =>
  formatDate(props.booking.checkIn || props.booking.check_in_date),
);
const checkOut = computed(() =>
  formatDate(props.booking.checkOut || props.booking.check_out_date),
);

const nights = computed(() => {
  if (checkIn.value === "-" || checkOut.value === "-") return 0;
  return Math.ceil(
    (new Date(checkOut.value) - new Date(checkIn.value)) /
      (1000 * 60 * 60 * 24),
  );
});

const status = computed(() =>
  String(
    props.booking.reservation_status || props.booking.status || "pending",
  ).toLowerCase(),
);

const canCancel = computed(() =>
  ["pending", "confirmed"].includes(status.value),
);
</script>

<template>
  <div
    class="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/30 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
  >
    <!-- Left: Image + Info -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto"
    >
      <!-- Room Image -->
      <div
        class="w-full sm:w-28 h-28 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 group"
      >
        <img
          :src="
            booking.roomImage ||
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80'
          "
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          :alt="booking.roomName"
        />
      </div>

      <!-- Info -->
      <div class="space-y-1.5">
        <!-- Room name + ID -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-black text-[#0f2942] tracking-tight">
            {{ booking.room_name || booking.roomName || "Room" }}
          </span>
          <span class="text-[10px] text-slate-400 font-medium">
            · ID: #RES-{{ booking.id }}
          </span>
        </div>

        <!-- Location -->
        <p class="text-xs text-slate-500 font-bold flex items-center gap-1.5">
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
          {{ booking.property_name || booking.location || "Unknown" }}
        </p>

        <!-- Dates + Nights -->
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
            {{ checkIn }}
          </span>
          <span class="text-[10px] text-slate-300 font-light hidden sm:inline"
            >➔</span
          >
          <span
            class="bg-slate-50 border border-slate-100 text-[#0f2942] px-2.5 py-1 rounded-lg"
          >
            <span
              class="text-[9px] uppercase tracking-wider text-slate-400 block font-black"
              >Out</span
            >
            {{ checkOut }}
          </span>
          <span
            class="text-[#1062b3] bg-blue-50/70 border border-blue-100/60 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
          >
            {{ nights }} Nights
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Price + Status + Actions -->
    <div
      class="flex sm:items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0"
    >
      <!-- Price -->
      <div class="lg:text-right">
        <span
          class="text-[9px] uppercase font-black text-slate-400 tracking-widest block"
        >
          Settled Amount
        </span>
        <span class="text-xl font-black text-[#0f2942] tracking-tight">
          ${{ Number(booking.total_amount || booking.totalPrice || 0) }}
        </span>
        <span class="text-slate-400 text-[10px] font-medium block">
          Paid via Card ending *4921
        </span>
      </div>

      <!-- Status + Actions -->
      <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
        <BookingStatusBadge :status="status" />

        <div class="flex items-center gap-1.5">
          <!-- View Detail -->
          <button
            @click="emit('view', booking.id)"
            class="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
          >
            Receipt
          </button>

          <!-- Cancel -->
          <button
            v-if="canCancel"
            @click="emit('cancel', booking.id)"
            class="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-extrabold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
          >
            Cancel Stay
          </button>

          <!-- Book Again -->
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
</template>
