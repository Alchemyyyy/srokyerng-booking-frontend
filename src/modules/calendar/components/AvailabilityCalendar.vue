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
const currentMonth = ref(new Date());
const selectedRange = ref({ start: null, end: null });

// Not yet implemented on backend — show friendly message instead of crashing
const endpointNotReady = ref(false);

const startDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const endDate = computed(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
});

const apiUrl = computed(() => {
  if (props.mode === "owner") {
    if (props.roomId)
      return `/owner/rooms/${props.roomId}/availability-calendar`;
    if (props.propertyId)
      return `/owner/properties/${props.propertyId}/availability-calendar`;
  }
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
    availableDates.value = data?.available_dates ?? [];
    unavailableDates.value = data?.unavailable_dates ?? [];
  } catch (err) {
    const status = err?.response?.status;
    // ✅ Treat any error as endpoint not ready
    if (status === 404 || status === 500 || status === 403 || !status) {
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

const calendarAttributes = computed(() => {
  const attrs = [];

  if (unavailableDates.value.length) {
    attrs.push({
      key: "unavailable",
      highlight: { color: "red", fillMode: "light" },
      dates: unavailableDates.value.map((d) => new Date(d)),
      popover: { label: "Unavailable" },
    });
  }

  if (availableDates.value.length) {
    attrs.push({
      key: "available",
      highlight: { color: "green", fillMode: "light" },
      dates: availableDates.value.map((d) => new Date(d)),
      popover: { label: "Available" },
    });
  }

  if (selectedRange.value.start && selectedRange.value.end) {
    attrs.push({
      key: "selected",
      highlight: { color: "blue", fillMode: "solid" },
      dates: { start: selectedRange.value.start, end: selectedRange.value.end },
    });
  }

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
      start: selectedRange.value.start.toISOString().split("T")[0],
      end: selectedRange.value.end.toISOString().split("T")[0],
    });
  }
};

watch(currentMonth, fetchCalendar);
onMounted(fetchCalendar);
</script>

<template>
  <div class="availability-calendar">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div
        class="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"
      />
      <span class="ml-3 text-sm text-(--color-muted) font-medium"
        >Loading availability...</span
      >
    </div>

    <!-- Backend endpoint not ready yet -->
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

    <!-- Other error -->
    <div
      v-else-if="error"
      class="rounded-xl bg-rose-500/5 border border-rose-500/20 px-4 py-3 text-sm font-medium text-rose-600 mb-4"
    >
      {{ error }}
    </div>

    <!-- Calendar — show even if no data -->
    <div v-if="!loading && !endpointNotReady" class="calendar-wrapper">
      <Calendar
        v-model="currentMonth"
        :attributes="calendarAttributes"
        :disabled-dates="disabledDates"
        :min-date="new Date()"
        :columns="1"
        :rows="1"
        expanded
        borderless
        @dayclick="handleDayClick"
      />

      <!-- Selected range feedback -->
      <div
        v-if="selectedRange.start"
        class="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm"
      >
        <p class="font-bold text-(--color-text) mb-1">Selected Dates</p>
        <div class="flex items-center gap-3 text-(--color-muted)">
          <span>
            Check-in:
            <strong class="text-(--color-text)">
              {{ selectedRange.start?.toISOString().split("T")[0] ?? "—" }}
            </strong>
          </span>
          <span class="text-(--color-border)">→</span>
          <span>
            Check-out:
            <strong class="text-(--color-text)">
              {{
                selectedRange.end?.toISOString().split("T")[0] ??
                "Select end date"
              }}
            </strong>
          </span>
        </div>
      </div>

      <!-- Legend -->
      <div
        class="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-(--color-muted)"
      >
        <div class="flex items-center gap-1.5">
          <span
            class="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50"
          />
          Available
        </div>
        <div class="flex items-center gap-1.5">
          <span
            class="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"
          />
          Unavailable
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-blue-500/80" />
          Selected
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
</style>
