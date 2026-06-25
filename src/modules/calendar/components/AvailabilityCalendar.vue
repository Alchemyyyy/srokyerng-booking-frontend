<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Calendar } from "v-calendar";
import "v-calendar/style.css";
import http from "@/app/api/http";

const props = defineProps({
  roomId: { type: [Number, String], default: null },
  propertyId: { type: [Number, String], default: null },
  mode: { type: String, default: "customer" },
});

const emit = defineEmits(["date-selected", "range-selected"]);

const loading = ref(false);
const error = ref(null);
const availableDates = ref([]);
const unavailableDates = ref([]);
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
const apiUrl = computed(() => {
  if (props.roomId) return `/rooms/${props.roomId}/availability-calendar`;
  if (props.propertyId)
    return `/properties/${props.propertyId}/availability-calendar`;
  return null;
});
const fetchCalendar = async () => {
  if (!apiUrl.value) return;

  loading.value = true;
  error.value = null;
  endpointNotReady.value = false;

  try {
    const res = await http.get(apiUrl.value, {
      params: { start_date: startDate.value, end_date: endDate.value },
    });

    const data = res?.data?.data ?? res?.data ?? res;

    if (Array.isArray(data)) {
      const unavailable = [];
      data.forEach((reservation) => {
        const checkIn = reservation.check_in_date ?? reservation.checkIn;
        const checkOut = reservation.check_out_date ?? reservation.checkOut;
        if (!checkIn || !checkOut) return;

        const cursor = new Date(checkIn);
        const end = new Date(checkOut);
        while (cursor < end) {
          unavailable.push(formatLocalDate(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
      });

      unavailableDates.value = [...new Set(unavailable)];

      const allDates = [];
      const cursor = new Date(startDate.value);
      const rangeEnd = new Date(endDate.value);
      while (cursor <= rangeEnd) {
        allDates.push(formatLocalDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      availableDates.value = allDates.filter(
        (d) => !unavailableDates.value.includes(d),
      );
    } else {
      availableDates.value = data?.available_dates ?? [];
      unavailableDates.value = data?.unavailable_dates ?? [];
    }
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 500) {
      endpointNotReady.value = true;
    } else {
      error.value =
        err?.response?.data?.message ?? "Failed to load availability.";
    }
    console.error("[AvailabilityCalendar] fetch error:", err);
  } finally {
    loading.value = false;
  }
};

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

  // Booked days — solid red highlight on the day itself.
  if (unavailableDates.value.length) {
    attrs.push({
      key: "unavailable",
      highlight: { color: "red", fillMode: "solid" },
      dates: unavailableDates.value.map((d) => new Date(d)),
      popover: { label: "Booked" },
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

const disabledDates = computed(() =>
  unavailableDates.value.map((d) => new Date(d)),
);

const handleDayClick = (day) => {
  if (unavailableDates.value.includes(day.id)) return;

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
      error.value =
        "Your selected range includes unavailable dates. Please choose different dates.";
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
        >Loading availability...</span
      >
    </div>

    <div
      v-else-if="endpointNotReady"
      class="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-6 text-center mb-4"
    >
      <p class="text-sm font-bold text-amber-600 mb-1">
        Availability calendar coming soon
      </p>
      <p class="text-xs text-amber-500/80">
        The availability endpoint is not ready yet. The calendar will show here
        once the backend is connected.
      </p>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl bg-rose-500/5 border border-rose-500/20 px-4 py-3 text-sm font-medium text-rose-600 mb-4"
    >
      {{ error }}
    </div>

    <div v-if="!loading && !endpointNotReady">
      <!-- Stat strip -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div class="rounded-xl bg-(--color-surface-soft) px-4 py-3">
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            Available nights
          </p>
          <p class="text-2xl font-bold text-(--color-text)">
            {{ monthStats.available }}
          </p>
        </div>
        <div class="rounded-xl bg-(--color-surface-soft) px-4 py-3">
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            Booked nights
          </p>
          <p class="text-2xl font-bold text-(--color-text)">
            {{ monthStats.booked }}
          </p>
        </div>
        <div
          class="rounded-xl bg-(--color-surface-soft) px-4 py-3 col-span-2 sm:col-span-1"
        >
          <p class="text-xs font-semibold text-(--color-muted) mb-1">
            Occupancy
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
            :columns="1"
            :rows="1"
            expanded
            borderless
            @dayclick="handleDayClick"
            @update:pages="handlePagesUpdate"
          />

          <div
            v-if="selectedRange.start"
            class="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm"
          >
            <p class="font-bold text-(--color-text) mb-1">Selected Dates</p>
            <div class="flex items-center gap-3 text-(--color-muted)">
              <span>
                Check-in:
                <strong class="text-(--color-text)">
                  {{ selectedRange.start ? formatLocalDate(selectedRange.start) : "—" }}
                </strong>
              </span>
              <span class="text-(--color-border)">→</span>
              <span>
                Check-out:
                <strong class="text-(--color-text)">
                  {{
                    selectedRange.end ? formatLocalDate(selectedRange.end) : "Select end date"
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
              Available
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Booked
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Selected
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
              Today
            </div>
          </div>
        </div>

        <!-- Upcoming stays panel -->
        <div class="rounded-xl border border-(--color-border) p-4">
          <p
            class="text-xs font-bold uppercase tracking-wide text-(--color-muted) mb-3"
          >
            Upcoming stays
          </p>
          <div
            v-if="upcomingStays.length === 0"
            class="text-sm text-(--color-muted)"
          >
            No bookings coming up this period.
          </div>
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="(stay, index) in upcomingStays"
              :key="index"
              class="border-l-2 border-rose-500 pl-3"
            >
              <p class="text-sm font-semibold text-(--color-text)">
                {{ stay.label }}
              </p>
              <p class="text-xs text-(--color-muted)">
                {{ stay.nights }} night{{ stay.nights > 1 ? "s" : "" }} booked
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
</style>
