<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import BookingStatusBadge from "./BookingStatusBadge.vue";
import {
  CalendarIcon,
  MapPinIcon,
  HashtagIcon,
  MoonIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cancel", "view", "pay", "receipt"]);
const router = useRouter();

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

// ── Payment helpers ──────────────────────────────────────────────────────────
const paymentStatus = computed(() => props.booking.paymentStatus ?? null);

const paymentStatusColor = computed(() => {
  switch (paymentStatus.value) {
    case "paid":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    case "submitted":
      return "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400";
    case "failed":
      return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
    case "pending":
      return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
    default:
      return "bg-gray-500/10 border-gray-500/20 text-(--color-muted)";
  }
});

const showPayButton = computed(() =>
  ["pending", "failed"].includes(paymentStatus.value),
);

const canCancel = computed(() => {
  if (typeof props.booking.canCancel === "boolean") {
    return props.booking.canCancel;
  }
  return (
    ["pending", "confirmed"].includes(status.value) &&
    !["submitted", "paid", "verified"].includes(paymentStatus.value)
  );
});
</script>

<template>
  <div
    class="bg-(--color-surface) border border-(--color-border) rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md hover:border-(--color-primary)/30 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden group"
  >
    <!-- Accent Gradient Left Border Reveal on Hover -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-(--color-primary) to-sky-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
    ></div>

    <!-- Left Compartment: Visual Asset Image + Meta Content Descriptor -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto"
    >
      <!-- Interactive Zoom Image Viewport -->
      <div
        class="w-full sm:w-28 h-24 rounded-2xl overflow-hidden bg-(--color-surface-soft) flex-shrink-0 relative shadow-inner"
      >
        <img
          :src="
            booking.roomImage ||
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80'
          "
          class="w-full h-full object-cover scale-[1.01] group-hover:scale-105 transition-transform duration-500"
          :alt="booking.roomName"
        />
      </div>

      <!-- Core Textual Data Frame -->
      <div class="space-y-2 w-full sm:w-auto">
        <div class="flex flex-wrap items-center gap-2">
          <h4 class="text-base font-black text-(--color-text) tracking-tight">
            {{ booking.room_name || booking.roomName || "Luxury Suite" }}
          </h4>
          <span
            class="inline-flex items-center gap-0.5 text-[10px] text-(--color-muted) font-mono font-bold bg-(--color-surface-soft) px-1.5 py-0.5 rounded-md border border-(--color-border)/60"
          >
            <HashtagIcon class="w-2.5 h-2.5" />
            RES-{{ booking.id }}
          </span>
        </div>

        <!-- Property / Geo Anchor Node -->
        <p
          class="text-xs text-(--color-muted) font-semibold flex items-center gap-1"
        >
          <MapPinIcon class="w-3.5 h-3.5 text-(--color-primary) shrink-0" />
          <span>{{
            booking.property_name || booking.location || "Premium Sanctuary"
          }}</span>
        </p>

        <!-- Segmented Double-Badged Timeline Array -->
        <div class="flex items-center flex-wrap gap-2 pt-1">
          <div
            class="inline-flex items-center gap-1.5 bg-(--color-surface-soft) border border-(--color-border)/80 px-2.5 py-1 rounded-xl text-[11px] font-bold text-(--color-text)"
          >
            <CalendarIcon class="w-3 h-3 text-(--color-primary)" />
            <span
              class="text-[9px] uppercase text-(--color-muted) font-black mr-0.5"
              >In</span
            >
            {{ checkIn }}
          </div>

          <ArrowRightIcon
            class="w-3 h-3 text-(--color-muted)/40 hidden sm:inline"
          />

          <div
            class="inline-flex items-center gap-1.5 bg-(--color-surface-soft) border border-(--color-border)/80 px-2.5 py-1 rounded-xl text-[11px] font-bold text-(--color-text)"
          >
            <CalendarIcon class="w-3 h-3 text-sky-400" />
            <span
              class="text-[9px] uppercase text-(--color-muted) font-black mr-0.5"
              >Out</span
            >
            {{ checkOut }}
          </div>

          <div
            class="inline-flex items-center gap-1 bg-gradient-to-r from-(--color-primary-soft)/40 to-sky-500/5 border border-(--color-primary-soft)/60 px-2 py-1 rounded-xl text-[10px] font-black text-(--color-primary) uppercase tracking-wide ml-0 sm:ml-1"
          >
            <MoonIcon class="w-3 h-3" />
            {{ nights }} Night{{ nights > 1 ? "s" : "" }}
          </div>
        </div>

        <!-- Inline Dynamic Payment Micro Status Badge -->
        <div v-if="paymentStatus" class="pt-1">
          <span
            :class="paymentStatusColor"
            class="border text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
          >
            Payment: {{ paymentStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right Compartment: Absolute Financial Totals + Control Button Bar -->
    <div
      class="flex sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between lg:justify-center gap-6 w-full lg:w-auto border-t lg:border-t-0 border-(--color-border)/60 pt-4 lg:pt-0"
    >
      <!-- Pricing Ledger Grid block -->
      <div class="lg:text-right">
        <span
          class="text-[9px] uppercase font-black text-(--color-muted) tracking-widest block"
          >Settled Volume</span
        >
        <span
          class="text-2xl font-black text-(--color-text) tracking-tight block mt-0.5"
        >
          ${{ Number(booking.total_amount || booking.totalPrice || 0) }}
        </span>
        <span
          class="text-(--color-muted) text-[10px] font-semibold block capitalize mt-0.5"
        >
          {{
            paymentStatus ? `Status: ${paymentStatus}` : "No payload generated"
          }}
        </span>
      </div>

      <!-- Action Framework Button Stack -->
      <div class="flex items-center gap-2">
        <BookingStatusBadge :status="status" />

        <div class="flex items-center gap-1.5">
          <!-- Document Receipt Accessor Trigger -->
          <button
            @click="
              booking.paymentId ? emit('receipt', booking.paymentId) : null
            "
            :disabled="!booking.paymentId"
            :class="
              booking.paymentId
                ? 'bg-(--color-surface-soft) border-(--color-border) hover:bg-(--color-border)/30 text-(--color-text) cursor-pointer'
                : 'bg-(--color-surface-soft)/40 border-(--color-border)/40 text-(--color-muted)/40 cursor-not-allowed'
            "
            class="border text-xs font-bold px-3 py-2 rounded-xl transition duration-200 flex items-center gap-1"
            title="View Statement Receipt"
          >
            <DocumentTextIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Receipt</span>
          </button>

          <!-- View Detail Page -->
          <button
            @click="emit('view', booking.id)"
            class="bg-(--color-surface-soft) border border-(--color-border) hover:border-(--color-primary)/40 hover:text-(--color-primary) text-(--color-text) font-bold text-xs px-3 py-2 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1"
            title="View Reservation Details"
          >
            <ArrowRightIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Details</span>
          </button>

          <!-- Transaction Execution Trigger (Pay / Re-upload) -->
          <button
            v-if="showPayButton"
            @click="emit('pay', booking.paymentId)"
            class="bg-(--color-primary) hover:bg-(--color-primary-soft)/80 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <component
              :is="paymentStatus === 'failed' ? ArrowPathIcon : CreditCardIcon"
              class="w-4 h-4"
            />
            <span>{{
              paymentStatus === "failed" ? "Re-upload" : "Pay Now"
            }}</span>
          </button>

          <!-- Safe Removal Control Vector (Cancel Stay) -->
          <button
            v-if="canCancel"
            @click="emit('cancel', booking.id)"
            class="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs px-4 py-2 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <XCircleIcon class="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <!-- Re-allocation Hook (Book Again Router Trigger) -->
          <button
            v-else-if="!showPayButton"
            @click="
              router.push({
                name: 'public.room-detail',
                params: { id: booking.roomId ?? booking.room_id },
              })
            "
            class="bg-(--color-primary) hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowPathIcon class="w-4 h-4" />
            <span>Book Again</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>