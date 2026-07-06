<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BookingStatusBadge from "./BookingStatusBadge.vue";
import placeholer from "@/assets/images/properties/placeholder.png";
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
  EllipsisVerticalIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cancel", "view", "pay", "receipt"]);
const router = useRouter();
const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  // Use local-time formatting (not toISOString, which is UTC) — the backend
  // sends check-in/check-out as UTC timestamps derived from a plain DATE
  // column, so converting back via UTC rolls the date back a day for any
  // server timezone ahead of UTC. en-CA locale conveniently yields YYYY-MM-DD.
  return new Date(dateStr).toLocaleDateString("en-CA");
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
  if (status.value === "cancelled" || status.value === "completed") {
    return "bg-gray-500/5 border-gray-500/10 text-(--color-muted)";
  }
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

const menuOpen = ref(false);
const menuRef  = ref(null);

const toggleMenu = () => { menuOpen.value = !menuOpen.value; };
const closeMenu  = () => { menuOpen.value = false; };

// close when clicking outside the dropdown
const handleOutsideClick = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    closeMenu();
  }
};

onMounted(()        => document.addEventListener("click", handleOutsideClick));
onBeforeUnmount(()  => document.removeEventListener("click", handleOutsideClick));
</script>

<template>
  <div
    class="bg-(--color-surface) border border-(--color-border) rounded-3xl shadow-xs hover:shadow-md hover:border-(--color-primary)/30 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative group"
  >
    <!-- Accent Gradient Left Border — clipped by its own rounded wrapper -->
    <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl overflow-hidden pointer-events-none">
      <div class="w-full h-full bg-gradient-to-b from-(--color-primary) to-sky-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
    </div>

    <!-- inner padding wrapper so overflow-hidden only applies to content, not dropdown -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full p-5 md:p-6">

    <!-- Left Compartment: Visual Asset Image + Meta Content Descriptor -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto"
    >
      <!-- Interactive Zoom Image Viewport -->
      <div
        class="w-full sm:w-28 h-24 rounded-2xl overflow-hidden bg-(--color-surface-soft) flex-shrink-0 relative shadow-inner"
      >
        <img
          :src="booking.roomImage || placeholer"
          class="w-full h-full object-cover scale-[1.01] group-hover:scale-105 transition-transform duration-500"
          :alt="booking.roomName"
          @error="(e) => (e.target.src = placeholer)"
        />
      </div>

      <!-- Core Textual Data Frame -->
      <div class="space-y-2 w-full sm:w-auto">
        <div class="flex flex-wrap items-center gap-2">
          <h4 class="text-base font-black text-(--color-text) tracking-tight">
          {{ booking.room_name || booking.roomName || t("components.bookingCard.roomFallback") }}
          </h4>
          <span
            class="inline-flex items-center gap-0.5 text-[10px] text-(--color-muted) font-mono font-bold bg-(--color-surface-soft) px-1.5 py-0.5 rounded-md border border-(--color-border)/60"
          >
            <HashtagIcon class="w-2.5 h-2.5" />
            {{ t("components.bookingCard.reservationPrefix") }}-{{ booking.id }}
          </span>
          <span class="w-1.5 h-1.5 bg-(--color-border) rounded-full shrink-0"></span>
          <BookingStatusBadge :status="status" />
        </div>

        <!-- Property / Geo Anchor Node -->
        <p
          class="text-xs text-(--color-muted) font-semibold flex items-center gap-1"
        >
          <MapPinIcon class="w-3.5 h-3.5 text-(--color-primary) shrink-0" />
          <span>{{
            booking.property_name || booking.location || t("components.bookingCard.propertyFallback")
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
              >{{ t("components.bookingCard.checkInLabel") }}</span
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
              >{{ t("components.bookingCard.checkOutLabel") }}</span
            >
            {{ checkOut }}
          </div>

          <div
            class="inline-flex items-center gap-1 bg-gradient-to-r from-(--color-primary-soft)/40 to-sky-500/5 border border-(--color-primary-soft)/60 px-2 py-1 rounded-xl text-[10px] font-black text-(--color-primary) uppercase tracking-wide ml-0 sm:ml-1"
          >
            <MoonIcon class="w-3 h-3" />
            {{ t("components.bookingCard.nights", { count: nights }) }}
          </div>
        </div>

        <!-- Inline Dynamic Payment Micro Status Badge -->
        <div v-if="paymentStatus" class="pt-1">
          <span
            :class="paymentStatusColor"
            class="border text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
          >
            {{ t("components.bookingCard.paymentLabel", { status: statusLabel(paymentStatus) }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right Compartment -->
    <div
      class="flex sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between lg:justify-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-(--color-border)/60 pt-4 lg:pt-0 lg:min-w-[160px]"
    >
      <!-- Price block -->
      <div class="lg:text-right">
        <span class="text-[9px] uppercase font-black text-(--color-muted) tracking-widest block">
          {{ t("components.bookingCard.totalAmount") }}
        </span>
        <span class="text-2xl font-black text-(--color-text) tracking-tight block mt-0.5">
          ${{ Number(booking.total_amount || booking.totalPrice || 0) }}
        </span>
      </div>

      <!-- Primary CTA: Pay Now / Book Again (only when applicable) -->
      <button
        v-if="showPayButton"
        @click="emit('pay', booking.paymentId)"
        class="w-full bg-(--color-primary) hover:opacity-90 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <component :is="paymentStatus === 'failed' ? ArrowPathIcon : CreditCardIcon" class="w-4 h-4" />
        <span>{{ paymentStatus === "failed" ? t("components.bookingCard.reupload") : t("components.bookingCard.payNow") }}</span>
      </button>

      <button
        v-else-if="!canCancel"
        @click="router.push({ name: 'public.room-detail', params: { id: booking.roomId ?? booking.room_id } })"
        class="w-full border border-(--color-border) bg-(--color-surface-soft) hover:bg-(--color-surface-soft)/80 text-(--color-text) font-bold text-sm px-4 py-2.5 rounded-xl shadow-xs transition duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <ArrowPathIcon class="w-4 h-4 text-(--color-muted)" />
        <span>{{ t("components.bookingCard.bookAgain") }}</span>
      </button>

      <!-- Secondary row: View Details + ⋮ menu -->
      <div class="flex items-center gap-2 w-full relative">
        <!-- Details button -->
        <button
          @click="emit('view', booking.id)"
          class="flex-1 border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) text-(--color-text) font-bold text-sm px-3 py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
        >
          <ArrowRightIcon class="w-4 h-4" />
          <span>{{ showPayButton ? t("components.bookingCard.details") : t("components.bookingCard.viewDetails") }}</span>
        </button>

        <!-- ⋮ dropdown trigger -->
        <div class="relative" ref="menuRef">
          <button
            @click="toggleMenu"
            class="border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) text-(--color-text) p-2.5 rounded-xl transition duration-200 flex items-center justify-center"
          >
            <EllipsisVerticalIcon class="w-4 h-4" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-1.5 w-44 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-lg z-50 py-1 overflow-hidden"
          >
            <!-- Receipt -->
            <button
              @click="booking.paymentId ? (emit('receipt', booking.paymentId), closeMenu()) : null"
              :disabled="!booking.paymentId"
              :class="booking.paymentId ? 'hover:bg-(--color-surface-soft) text-(--color-text) cursor-pointer' : 'text-(--color-muted)/40 cursor-not-allowed'"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition duration-150"
            >
              <DocumentTextIcon class="w-4 h-4 shrink-0" />
              <span>{{ t("components.bookingCard.receipt") }}</span>
            </button>

            <!-- Cancel -->
            <button
              v-if="canCancel"
              @click="emit('cancel', booking.id); closeMenu()"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition duration-150 cursor-pointer"
            >
              <XCircleIcon class="w-4 h-4 shrink-0" />
              <span>{{ t("components.bookingCard.cancelBooking") }}</span>
            </button>

            <!-- Book Again (in menu when pay button is shown) -->
            <button
              v-if="showPayButton"
              @click="router.push({ name: 'public.room-detail', params: { id: booking.roomId ?? booking.room_id } }); closeMenu()"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-(--color-text) hover:bg-(--color-surface-soft) transition duration-150 cursor-pointer"
            >
              <ArrowPathIcon class="w-4 h-4 shrink-0" />
              <span>{{ t("components.bookingCard.bookAgain") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div><!-- end inner padding wrapper -->
  </div>
</template>
