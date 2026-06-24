<script setup>
import { onMounted, ref } from "vue";
// import { useReservationStore } from "../store/reservation.store";
import { useReservationStore } from "../store/Reservation.store";
import { formatMoney, formatDate, statusBadgeClass } from "../utils/formatters";

const store = useReservationStore();

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed"];

// Track which row currently has its status dropdown open
const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => {
  openMenuId.value = null;
};

const handleStatusChange = async (reservation, newStatus) => {
  closeMenu();
  if (newStatus === reservation.reservation_status) return;
  await store.updateStatus(reservation.id, newStatus);
};

const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

onMounted(() => {
  store.fetchReservations();
});
</script>

<template>
  <div class="ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Reservations</h1>
      <p class="text-sm text-(--color-muted) mt-1">
        Monitor and manage all reservations across the platform.
      </p>
    </header>

    <!-- Error -->
    <div
      v-if="store.error"
      class="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500"
    >
      {{ store.error }}
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
    >
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.key"
          @click="store.setStatusFilter(tab.key)"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2',
            store.statusFilter === tab.key
              ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
              : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
          ]"
        >
          {{ tab.label }}
          <span
            :class="[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              store.statusFilter === tab.key
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface-soft) text-(--color-muted)',
            ]"
          >
            {{ store.statusCounts[tab.key] ?? 0 }}
          </span>
        </button>
      </nav>

      <input
        type="text"
        placeholder="Search guest, property, room..."
        :value="store.searchQuery"
        @input="store.setSearchQuery($event.target.value)"
        class="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-(--color-border) bg-(--color-surface) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="py-24 text-center text-(--color-muted) text-sm"
    >
      Loading reservations...
    </div>

    <!-- Empty -->
    <div
      v-else-if="store.filteredReservations.length === 0"
      class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-16 text-center"
    >
      <p class="text-sm text-(--color-muted)">
        No reservations match this filter.
      </p>
    </div>

    <!-- Table -->
    <div
      v-else
      class="rounded-2xl border border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-(--color-border) bg-(--color-surface-soft)"
            >
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                ID
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Guest
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Property / Room
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Owner
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Dates
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Amount
              </th>
              <th
                class="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Status
              </th>
              <th
                class="text-right px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-(--color-muted)"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="reservation in store.filteredReservations"
              :key="reservation.id"
              class="border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-soft)/60 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs text-(--color-muted)">
                #{{ reservation.id }}
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold">
                  {{ reservation.customer_name || "-" }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.customer_email || "-" }}
                </p>
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold">
                  {{ reservation.property_name || "-" }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.room_name || "-" }}
                </p>
              </td>
              <td class="px-4 py-3 text-(--color-muted)">
                {{ reservation.owner_name || "-" }}
              </td>
              <td class="px-4 py-3">
                <p>
                  {{ formatDateOnly(reservation.check_in_date) }} →
                  {{ formatDateOnly(reservation.check_out_date) }}
                </p>
                <p class="text-xs text-(--color-muted)">
                  {{ reservation.total_nights }} night{{
                    reservation.total_nights !== 1 ? "s" : ""
                  }}
                </p>
              </td>
              <td class="px-4 py-3 font-semibold">
                {{ formatMoney(reservation.total_amount) }}
              </td>
              <td class="px-4 py-3">
                <span :class="statusBadgeClass(reservation.reservation_status)">
                  {{ reservation.reservation_status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right relative">
                <button
                  @click="toggleMenu(reservation.id)"
                  :disabled="store.processing"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--color-border) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text) transition disabled:opacity-50"
                >
                  Change status
                </button>

                <div
                  v-if="openMenuId === reservation.id"
                  class="absolute right-4 top-full mt-1 z-10 w-40 rounded-xl border border-(--color-border) bg-(--color-surface) shadow-lg overflow-hidden"
                >
                  <button
                    v-for="status in STATUS_OPTIONS"
                    :key="status"
                    @click="handleStatusChange(reservation, status)"
                    :class="[
                      'w-full text-left px-3 py-2 text-xs font-medium capitalize transition',
                      status === reservation.reservation_status
                        ? 'bg-(--color-primary-soft) text-(--color-primary-strong)'
                        : 'text-(--color-text) hover:bg-(--color-surface-soft)',
                    ]"
                  >
                    {{ status }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
