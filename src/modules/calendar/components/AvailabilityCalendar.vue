<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Calendar } from "v-calendar";
import "v-calendar/style.css";
import { XMarkIcon } from "@heroicons/vue/24/outline";
// ⚠️ ADJUST PATH if Calendar.api.js doesn't actually live at ../api/Calendar.api
// relative to this component — match wherever you placed the file you shared.
import { calendarApi } from "../api/Calendar.api";
import { useToastStore } from "@/shared/store/toastStore";
import { useTheme } from "@/shared/composables/useTheme";
import { useI18n } from "vue-i18n";

const props = defineProps({
  roomId: { type: [Number, String], default: null },
  propertyId: { type: [Number, String], default: null },
  mode: { type: String, default: "customer" },
});

const emit = defineEmits(["date-selected", "range-selected"]);
const toast = useToastStore();
const { t } = useI18n({ useScope: "global" });
const { resolvedTheme } = useTheme();
const isDarkTheme = computed(() => resolvedTheme.value === "dark");

const blockedDates = ref([]);
const blockActionLoading = ref(false);

const loading = ref(false);
const error = ref(null);
const availableDates = ref([]);
const unavailableDates = ref([]);
// Full reservation objects, kept around (not just flattened date strings) so
// owner mode can show guest name / check-in / check-out on click.
const reservations = ref([]);
const today = new Date();
const visibleYear = ref(today.getFullYear());
const visibleMonth = ref(today.getMonth());
const selectedRange = ref({ start: null, end: null });

const formatLocalDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// The date string (YYYY-MM-DD) of a booked day the owner clicked, so we can
// show who's staying. Customer mode never touches this — see handleDayClick.
const selectedBookingDate = ref(null);

const handlePagesUpdate = (pages) => {
  const page = Array.isArray(pages) ? pages[0] : pages;
  if (!page) return;
  visibleYear.value = page.year;
  visibleMonth.value = page.month - 1;
};

// Not yet implemented on backend — show friendly message instead of crashing
const endpointNotReady = ref(false);

const startDate = computed(() => {
  return formatLocalDate(new Date());
});

const endDate = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return formatLocalDate(d);
});

const fetchCalendar = async () => {
  if (!props.roomId && !props.propertyId) return;

  loading.value = true;
  error.value = null;
  endpointNotReady.value = false;

  try {
    // ⚠️ FIX: previously this always hit the public/customer endpoint
    // (/properties/:id/availability-calendar) even when mode="owner".
    // Now it actually uses the owner-authenticated endpoints from
    // Calendar.api.js, which is what should return real guest/reservation
    // detail rather than a privacy-stripped public view.
    let res;
    if (props.mode === "owner") {
      res = props.roomId
        ? await calendarApi.getOwnerRoomCalendar(
            props.roomId,
            startDate.value,
            endDate.value,
          )
        : await calendarApi.getOwnerPropertyCalendar(
            props.propertyId,
            startDate.value,
            endDate.value,
          );
    } else {
      res = props.roomId
        ? await calendarApi.getRoomCalendar(
            props.roomId,
            startDate.value,
            endDate.value,
          )
        : await calendarApi.getPropertyCalendar(
            props.propertyId,
            startDate.value,
            endDate.value,
          );
    }

    const data = res?.data?.data ?? res?.data ?? res;

    // Both room-level and property-level responses now share the same
    // inventory-aware shape: { available_dates, unavailable_dates, blocked_dates }.
    // A date is only unavailable once bookings reach the room's total_rooms
    // (room-level) or every room in the property is booked out (property-level) —
    // NOT just because any single reservation exists that day.
    blockedDates.value = data?.blocked_dates ?? [];
    unavailableDates.value = data?.unavailable_dates ?? [];
    availableDates.value = data?.available_dates ?? [];

    // Property-level responses additionally include the raw reservation rows,
    // used only by owner mode's "click a day to see who booked it" panel.
    reservations.value = Array.isArray(data?.reservations) ? data.reservations : [];
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 500) {
      endpointNotReady.value = true;
    } else {
      error.value =
        err?.response?.data?.message ?? t("components.availabilityCalendar.loadFailed");
    }
    console.error("[AvailabilityCalendar] fetch error:", err);
  } finally {
    loading.value = false;
  }
};

// ── Reservations grouped by date, for the owner-mode detail panel ─────────

const reservationsByDate = computed(() => {
  const map = {};
  reservations.value.forEach((reservation) => {
    const checkIn = reservation.check_in_date ?? reservation.checkIn;
    const checkOut = reservation.check_out_date ?? reservation.checkOut;
    if (!checkIn || !checkOut) return;

    const cursor = new Date(checkIn);
    const end = new Date(checkOut);
    while (cursor < end) {
      // Local-time key (not toISOString/UTC) so it matches v-calendar's
      // day.id, which is a local-time YYYY-MM-DD string — using UTC here
      // rolled every booking back a day for any server timezone ahead of UTC.
      const key = cursor.toLocaleDateString("en-CA");
      if (!map[key]) map[key] = [];
      map[key].push(reservation);
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return map;
});

const selectedBookings = computed(() => {
  if (!selectedBookingDate.value) return [];
  return reservationsByDate.value[selectedBookingDate.value] ?? [];
});

// ── Stats for the current visible month ────────────────────────────────────

const visibleMonthDates = computed(() => {
  const year = visibleYear.value;
  const month = visibleMonth.value;
  const lastDay = new Date(year, month + 1, 0).getDate();

  const dates = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const d = new Date(year, month, day);
    dates.push(formatLocalDate(d));
  }
  return dates;
});

const monthStats = computed(() => {
  const visible = visibleMonthDates.value;
  const bookedCount = visible.filter((d) =>
    unavailableDates.value.includes(d),
  ).length;
  const availableCount = visible.filter((d) =>
    availableDates.value.includes(d),
  ).length;
  const total = bookedCount + availableCount;
  const occupancy = total > 0 ? Math.round((bookedCount / total) * 100) : 0;

  return {
    available: availableCount,
    booked: bookedCount,
    occupancy,
  };
});

// ── Group consecutive unavailable dates into stay ranges ───────────────────

const upcomingStays = computed(() => {
  const sorted = [...unavailableDates.value].sort();
  const ranges = [];
  let rangeStart = null;
  let prev = null;

  sorted.forEach((dateStr) => {
    const date = new Date(dateStr);
    if (rangeStart === null) {
      rangeStart = date;
    } else if (prev && (date - prev) / 86400000 > 1) {
      ranges.push({ start: rangeStart, end: prev });
      rangeStart = date;
    }
    prev = date;
  });

  if (rangeStart && prev) {
    ranges.push({ start: rangeStart, end: prev });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return ranges
    .filter((range) => range.end >= today)
    .slice(0, 5)
    .map((range) => {
      const nights = Math.round((range.end - range.start) / 86400000) + 1;
      return {
        label: `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`,
        nights,
      };
    });
});

const formatShortDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const calendarAttributes = computed(() => {
  const attrs = [];

  // Available days — hollow grey dot, matches the legend's "Available" marker.
  // Pushed first so booked/selected/today (added after) render on top of it.
  if (availableDates.value.length) {
    attrs.push({
      key: "available",
      dot: {
        style: { backgroundColor: "transparent" },
        class: "vc-dot-available",
      },
      dates: availableDates.value.map((d) => new Date(d)),
    });
  }

  // Booked days — solid red highlight on the day itself (exclude manual blocks).
  const realBookings = unavailableDates.value.filter(d => !blockedDates.value.includes(d));
  if (realBookings.length) {
    attrs.push({
      key: "unavailable",
      highlight: { color: "red", fillMode: "solid" },
      dates: realBookings.map((d) => new Date(d)),
      popover: {
        label: props.mode === "owner" ? t("components.availabilityCalendar.bookedClickForDetails") : t("components.availabilityCalendar.booked"),
      },
    });
  }

  // Manually blocked days — solid orange highlight.
  if (blockedDates.value.length) {
    attrs.push({
      key: "blocked",
      highlight: { color: "orange", fillMode: "solid" },
      dates: blockedDates.value.map((d) => new Date(d)),
      popover: {
        label: props.mode === "owner" ? t("components.availabilityCalendar.blockedByOwner") : t("components.availabilityCalendar.unavailable"),
      },
    });
  }

  // The range the user is actively building.
  if (selectedRange.value.start && selectedRange.value.end) {
    attrs.push({
      key: "selected",
      highlight: { color: "blue", fillMode: "solid" },
      dates: { start: selectedRange.value.start, end: selectedRange.value.end },
    });
  } else if (selectedRange.value.start) {
    // Single day picked, waiting for the end of the range — still show it as selected.
    attrs.push({
      key: "selected-start",
      highlight: { color: "blue", fillMode: "solid" },
      dates: selectedRange.value.start,
    });
  }

  // "Today" marker — visually distinct from the blue "Selected" highlight so
  // they're never confused for one another (outline instead of solid fill).
  attrs.push({
    key: "today",
    highlight: {
      color: "gray",
      fillMode: "outline",
    },
    dates: new Date(),
  });

  return attrs;
});

// ⚠️ FIX: previously this disabled booked dates for every mode, which makes
// v-calendar suppress dayclick on them entirely — owners could never click a
// booked day to see who's staying. Customers still can't select/interact with
// booked days (correct — they shouldn't be able to book over an existing
// reservation), but owners need clicks to go through.
const disabledDates = computed(() =>
  props.mode === "owner" ? [] : unavailableDates.value.map((d) => new Date(d)),
);

const toggleBlockDate = async () => {
  if (!selectedBookingDate.value || !props.roomId) return;
  const dateStr = selectedBookingDate.value;
  blockActionLoading.value = true;
  try {
    if (blockedDates.value.includes(dateStr)) {
      await calendarApi.deleteRoomBlock(props.roomId, dateStr);
      toast.success(t("components.availabilityCalendar.dateUnblocked"));
    } else {
      await calendarApi.createRoomBlock(props.roomId, dateStr);
      toast.success(t("components.availabilityCalendar.dateBlocked"));
    }
    await fetchCalendar();
  } catch (err) {
    toast.danger(
      err?.response?.data?.message || t("components.availabilityCalendar.updateBlockFailed"),
    );
  } finally {
    blockActionLoading.value = false;
  }
};

const handleDayClick = (day) => {
  if (props.mode === "owner") {
    selectedBookingDate.value = day.id;
    emit("date-selected", {
      date: day.id,
      bookings: reservationsByDate.value[day.id] ?? [],
    });
    return;
  }

  const isBooked = unavailableDates.value.includes(day.id);

  if (isBooked) {
    // Booked days are never a valid start/end for a new range, in any mode.
    return;
  }

  selectedBookingDate.value = null;

  if (
    !selectedRange.value.start ||
    (selectedRange.value.start && selectedRange.value.end)
  ) {
    selectedRange.value = { start: day.date, end: null };
  } else {
    const start = selectedRange.value.start;
    const end = day.date;

    if (end < start) {
      selectedRange.value = { start: end, end: start };
    } else {
      selectedRange.value = { start, end };
    }

    const hasUnavailable = unavailableDates.value.some((d) => {
      const date = new Date(d);
      return (
        date >= selectedRange.value.start && date <= selectedRange.value.end
      );
    });

    if (hasUnavailable) {
      error.value = t("components.availabilityCalendar.rangeIncludesUnavailable");
      selectedRange.value = { start: null, end: null };
      return;
    }

    error.value = null;
    emit("range-selected", {
      start: formatLocalDate(selectedRange.value.start),
      end: formatLocalDate(selectedRange.value.end),
    });
  }
};

watch([visibleYear, visibleMonth], fetchCalendar);
onMounted(fetchCalendar);
</script>

<template>
  <div class="availability-calendar">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div
        class="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"
      />
      <span class="ml-3 text-sm text-(--color-muted) font-medium"
        >{{ t("components.availabilityCalendar.loading") }}</span
      >
    </div>

    <div
      v-else-if="endpointNotReady"
      class="rounded-xl bg-(--color-warning-soft) border border-(--color-warning) px-4 py-6 text-center mb-4"
    >
      <p class="text-sm font-bold text-(--color-warning) mb-1">
        {{ t("components.availabilityCalendar.comingSoonTitle") }}
      </p>
      <p class="text-xs text-(--color-warning)">
        {{ t("components.availabilityCalendar.comingSoonDesc") }}
      </p>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl bg-(--color-danger-soft) border border-(--color-danger) px-4 py-3 text-sm font-medium text-(--color-danger) mb-4"
    >
      {{ error }}
    </div>

    <div v-if="!loading && !endpointNotReady">
      <!-- Stat strip -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div class="rounded-xl bg-(--color-surface-soft) px-4 py-3">
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            {{ t("components.availabilityCalendar.availableNights") }}
          </p>
          <p class="text-2xl font-bold text-(--color-text)">
            {{ monthStats.available }}
          </p>
        </div>
        <div class="rounded-xl bg-(--color-surface-soft) px-4 py-3">
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            {{ t("components.availabilityCalendar.bookedNights") }}
          </p>
          <p class="text-2xl font-bold text-(--color-text)">
            {{ monthStats.booked }}
          </p>
        </div>
        <div
          class="rounded-xl bg-(--color-surface-soft) px-4 py-3 col-span-2 sm:col-span-1"
        >
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            {{ t("components.availabilityCalendar.occupancy") }}
          </p>
          <p class="text-2xl font-bold text-(--color-text)">
            {{ monthStats.occupancy }}%
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <!-- Calendar -->
        <div
          class="calendar-wrapper rounded-xl border border-(--color-border) p-4"
        >
          <Calendar
            :initial-page="{ month: visibleMonth + 1, year: visibleYear }"
            :attributes="calendarAttributes"
            :disabled-dates="disabledDates"
            :min-date="new Date()"
            :is-dark="isDarkTheme"
            :columns="1"
            :rows="1"
            expanded
            borderless
            @dayclick="handleDayClick"
            @update:pages="handlePagesUpdate"
          />

          <!-- Owner-only: details for a booked day that was clicked -->
          <div
            v-if="mode === 'owner' && selectedBookingDate"
            class="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="font-bold text-(--color-text)">
                <span v-if="selectedBookings.length">{{ selectedBookings.length > 1 ? t("components.availabilityCalendar.bookingsPrefix") : t("components.availabilityCalendar.bookingPrefix") }}</span>
                <span v-else-if="blockedDates.includes(selectedBookingDate)">{{ t("components.availabilityCalendar.blockedDatePrefix") }}</span>
                <span v-else>{{ t("components.availabilityCalendar.availableDatePrefix") }}</span>
                {{ selectedBookingDate }}
              </p>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-semibold text-(--color-muted) hover:text-(--color-text)"
                @click="selectedBookingDate = null"
              >
                {{ t("components.availabilityCalendar.close") }} <XMarkIcon class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- Case 1: Guest Bookings -->
            <div v-if="selectedBookings.length">
              <div
                v-for="(booking, idx) in selectedBookings"
                :key="booking.id ?? booking.reservation_id ?? idx"
                :class="{ 'mt-3 pt-3 border-t border-(--color-border)': idx > 0 }"
              >
                <p class="font-semibold text-(--color-text)">
                  {{
                    booking.guest_name ??
                    booking.customer_name ??
                    booking.guestName ??
                    t("components.availabilityCalendar.guestFallback")
                  }}
                </p>
                <div
                  class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-(--color-muted)"
                >
                  <span>
                    {{ t("components.availabilityCalendar.checkInLabel") }}
                    <strong class="text-(--color-text)">
                      {{ booking.check_in_date ?? booking.checkIn ?? "—" }}
                    </strong>
                  </span>
                  <span>
                    {{ t("components.availabilityCalendar.checkOutLabel") }}
                    <strong class="text-(--color-text)">
                      {{ booking.check_out_date ?? booking.checkOut ?? "—" }}
                    </strong>
                  </span>
                  <span v-if="booking.status ?? booking.reservation_status">
                    {{ t("components.availabilityCalendar.statusLabel") }}
                    <strong class="text-(--color-text) capitalize">
                      {{ booking.status ?? booking.reservation_status }}
                    </strong>
                  </span>
                </div>
                <RouterLink
                  v-if="booking.id ?? booking.reservation_id"
                  :to="{
                    name: 'owner.reservation-detail',
                    params: { id: booking.id ?? booking.reservation_id },
                  }"
                  class="inline-block mt-2 text-xs font-bold text-(--color-primary) hover:underline"
                >
                  {{ t("components.availabilityCalendar.viewFullReservation") }}
                </RouterLink>
              </div>
            </div>

            <!-- Case 2: Blocked Date -->
            <div v-else-if="blockedDates.includes(selectedBookingDate)" class="py-2 flex items-center justify-between">
              <p class="text-xs text-(--color-warning) font-semibold">{{ t("components.availabilityCalendar.blockedForMaintenance") }}</p>
              <button
                v-if="roomId"
                @click="toggleBlockDate"
                :disabled="blockActionLoading"
                class="px-3 py-1.5 rounded-xl bg-(--color-warning) text-white font-bold text-xs hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ blockActionLoading ? "…" : t("components.availabilityCalendar.unblockDate") }}
              </button>
            </div>

            <!-- Case 3: Available Date -->
            <div v-else class="py-2 flex items-center justify-between">
              <p class="text-xs text-(--color-success) font-semibold">{{ t("components.availabilityCalendar.dateAvailableForBookings") }}</p>
              <button
                v-if="roomId"
                @click="toggleBlockDate"
                :disabled="blockActionLoading"
                class="px-3 py-1.5 rounded-xl bg-(--color-danger) text-white font-bold text-xs hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ blockActionLoading ? "…" : t("components.availabilityCalendar.blockDate") }}
              </button>
              <p v-else class="text-xs text-(--color-muted) italic">
                {{ t("components.availabilityCalendar.openRoomCalendarHint") }}
              </p>
            </div>
          </div>

          <div
            v-if="mode !== 'owner' && selectedRange.start"
            class="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm"
          >
            <p class="font-bold text-(--color-text) mb-1">{{ t("components.availabilityCalendar.selectedDates") }}</p>
            <div class="flex items-center gap-3 text-(--color-muted)">
              <span>
                {{ t("components.availabilityCalendar.checkInLabel") }}
                <strong class="text-(--color-text)">
                  {{ selectedRange.start ? formatLocalDate(selectedRange.start) : "—" }}
                </strong>
              </span>
              <span class="text-(--color-border)">→</span>
              <span>
                {{ t("components.availabilityCalendar.checkOutLabel") }}
                <strong class="text-(--color-text)">
                  {{
                    selectedRange.end ? formatLocalDate(selectedRange.end) : t("components.availabilityCalendar.selectEndDate")
                  }}
                </strong>
              </span>
            </div>
          </div>

          <div
            class="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-(--color-muted)"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full border-2 border-(--color-border-secondary)"
              />
              {{ t("components.availabilityCalendar.legendAvailable") }}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-(--color-danger)" />
              {{ t("components.availabilityCalendar.legendBooked") }}
            </div>
            <div v-if="mode === 'owner'" class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-(--color-warning)" />
              {{ t("components.availabilityCalendar.legendBlocked") }}
            </div>
            <div v-if="mode !== 'owner'" class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-(--color-primary)" />
              {{ t("components.availabilityCalendar.legendSelected") }}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-(--color-muted)" />
              {{ t("components.availabilityCalendar.legendToday") }}
            </div>
          </div>
        </div>

        <!-- Upcoming stays panel -->
        <div class="rounded-xl border border-(--color-border) p-4">
          <p
            class="text-xs font-bold uppercase tracking-wide text-(--color-muted) mb-3"
          >
            {{ t("components.availabilityCalendar.upcomingStays") }}
          </p>
          <div
            v-if="upcomingStays.length === 0"
            class="text-sm text-(--color-muted)"
          >
            {{ t("components.availabilityCalendar.noUpcomingBookings") }}
          </div>
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="(stay, index) in upcomingStays"
              :key="index"
              class="border-l-2 border-(--color-danger) pl-3"
            >
              <p class="text-sm font-semibold text-(--color-text)">
                {{ stay.label }}
              </p>
              <p class="text-xs text-(--color-muted)">
                {{ t("components.availabilityCalendar.nightsBooked", { count: stay.nights }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-wrapper :deep(.vc-container) {
  --vc-font-family: inherit;
  --vc-rounded-full: 10px;
  background: transparent;
  border: none;
  width: 100%;
}
.calendar-wrapper :deep(.vc-header) {
  padding: 0 0 12px;
}
.calendar-wrapper :deep(.vc-title) {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--color-text);
}
.calendar-wrapper :deep(.vc-arrow) {
  color: var(--color-muted);
  border-radius: 8px;
}
.calendar-wrapper :deep(.vc-arrow:hover) {
  background: var(--color-surface-soft);
  color: var(--color-primary);
}
.calendar-wrapper :deep(.vc-weekday) {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.calendar-wrapper :deep(.vc-day-content) {
  font-size: 0.8rem;
  font-weight: 600;
}
.calendar-wrapper :deep(.vc-day-content:hover) {
  background: var(--color-surface-soft);
}

/* Available-day dot: hollow outline circle instead of v-calendar's default
   solid dot, so it visually matches the legend's "Available" marker and
   doesn't compete visually with the booked/selected/today indicators. */
.calendar-wrapper :deep(.vc-dot-available) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border-secondary, #9ca3af);
  background-color: transparent !important;
}

/* v-calendar's day highlights are driven by its own preset color palette
   (red/orange/blue/gray), which is unrelated to this app's design tokens
   and doesn't adapt to the dark/light theme. Remap the shades each preset
   actually renders with so the calendar's colors always match the rest
   of the UI (--color-danger for booked, --color-warning for blocked,
   --color-primary for selected, --color-muted for today). */
.calendar-wrapper :deep(.vc-red) {
  --vc-accent-500: var(--color-danger);
  --vc-accent-600: var(--color-danger);
  --vc-accent-700: var(--color-danger);
  --vc-accent-900: var(--color-danger);
}
.calendar-wrapper :deep(.vc-orange) {
  --vc-accent-500: var(--color-warning);
  --vc-accent-600: var(--color-warning);
  --vc-accent-700: var(--color-warning);
  --vc-accent-900: var(--color-warning);
}
.calendar-wrapper :deep(.vc-blue) {
  --vc-accent-500: var(--color-primary);
  --vc-accent-600: var(--color-primary);
  --vc-accent-700: var(--color-primary);
  --vc-accent-900: var(--color-primary);
}
.calendar-wrapper :deep(.vc-gray) {
  --vc-accent-300: var(--color-muted);
  --vc-accent-500: var(--color-muted);
  --vc-accent-600: var(--color-muted);
  --vc-accent-700: var(--color-muted);
}
</style>
