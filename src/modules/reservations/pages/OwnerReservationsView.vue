<script setup>
import { ref, computed, onMounted } from "vue";
import AppTable from "@/shared/components/AppTable.vue";
import "@/assets/styles/variables.css";
import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";

const loading = ref(true);
const error = ref(null);
const recentReservations = ref([]);

const stats = computed(() => {
  const total = recentReservations.value.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );
  const pending = recentReservations.value.filter(
    (r) => r.status === "pending",
  ).length;
  return {
    totalEarnings: total,
    totalBookings: recentReservations.value.length,
    pendingCount: pending,
  };
});

const reservationColumns = ref([
  { key: "id", label: "Booking ID" },
  { key: "guestName", label: "Guest" },
  { key: "propertyName", label: "Property" },
  { key: "amount", label: "Amount" },
  { key: "checkIn", label: "Date" },
  { key: "status", label: "Status" },
]);

const fetchReservations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch("/data.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    recentReservations.value = data.recentReservations || [];
  } catch (err) {
    error.value = "Failed to load reservations data.";
    console.error("Reservations Fetch Error:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReservations);
</script>

<template>
  <main class="owner-reservations mt-25 ml-64">
    <header
      class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-(--color-text)">
          Reservations Summary
        </h1>
        <p class="mt-1 text-sm text-(--color-muted)">
          Overview and detailed status analytics of your rental properties
          assets.
        </p>
      </div>

      <button
        @click="fetchReservations"
        style="
          border-color: var(--color-border);
          background-color: var(--color-surface);
        "
        class="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-(--color-surface-soft) transition duration-200 cursor-pointer flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-3.5 h-3.5"
          :class="{ 'animate-spin': loading }"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        Refresh Stream
      </button>
    </header>
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      <div
        style="
          background-color: var(--color-surface);
          border-color: var(--color-border);
          box-shadow: var(--shadow-card);
        "
        class="border p-5 rounded-xl flex items-center justify-between"
      >
        <div class="space-y-1">
          <span
            class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
            >Total Earnings</span
          >
          <h3 class="text-2xl font-bold tracking-tight text-(--color-text)">
            ${{ stats.totalEarnings }}
          </h3>
        </div>
        <div
          style="
            background-color: var(--color-success-soft);
            color: var(--color-success);
          "
          class="w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <BanknotesIcon class="w-5 h-5" />
        </div>
      </div>

      <div
        style="
          background-color: var(--color-surface);
          border-color: var(--color-border);
          box-shadow: var(--shadow-card);
        "
        class="border p-5 rounded-xl flex items-center justify-between"
      >
        <div class="space-y-1">
          <span
            class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
            >Total Bookings</span
          >
          <h3 class="text-2xl font-bold tracking-tight text-(--color-text)">
            {{ stats.totalBookings }}
          </h3>
        </div>
        <div
          style="
            background-color: var(--color-primary-soft);
            color: var(--color-primary);
          "
          class="w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <ClipboardDocumentListIcon class="w-5 h-5" />
        </div>
      </div>

      <div
        style="
          background-color: var(--color-surface);
          border-color: var(--color-border);
          box-shadow: var(--shadow-card);
        "
        class="border p-5 rounded-xl flex items-center justify-between"
      >
        <div class="space-y-1">
          <span
            class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
            >Pending Action</span
          >
          <h3 class="text-2xl font-bold tracking-tight text-(--color-text)">
            {{ stats.pendingCount }}
          </h3>
        </div>
        <div
          :style="
            stats.pendingCount > 0
              ? {
                  backgroundColor: 'var(--color-warning-soft)',
                  color: 'var(--color-warning)',
                }
              : {
                  backgroundColor: 'var(--color-surface-soft)',
                  color: 'var(--color-muted)',
                }
          "
          class="w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <ClockIcon class="w-5 h-5" />
        </div>
      </div>
    </section>

    <section class="reservations-list">
      <div v-if="recentReservations.length === 0" class="empty-state">
        No recent reservations found.
      </div>

      <AppTable
        v-else
        class="data-table"
        :columns="reservationColumns"
        :rows="recentReservations"
      >
        <template #cell-guestName="{ value }">
          <span class="font-bold">{{ value }}</span>
        </template>

        <!-- Customizing the 'Amount' cell -->
        <template #cell-amount="{ value }">
          <span class="font-bold">${{ value }}</span>
        </template>

        <!-- Customizing the 'Status' cell using design tokens -->
        <template #cell-status="{ value }">
          <span :class="['status-badge', `status-${value}`]">
            {{ value }}
          </span>
        </template>

        <!-- Customizing the 'Date' cell -->
        <template #cell-checkIn="{ row }">
          <div class="flex flex-col">
            <span>{{ row.checkIn }}</span>
            <span class="text-xs text-(--color-muted)"
              >to {{ row.checkOut }}</span
            >
          </div>
        </template>
      </AppTable>
    </section>
  </main>
</template>

<style scoped>
/* .owner-reservations {
  min-height: 100vh;
  background-color: var(--color-page);
  color: var(--color-text);
} */

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
</style>
