<script setup>
import { ref, onMounted } from 'vue';
import AppTable from '@/shared/components/AppTable.vue';

import '@/assets/styles/variables.css';

const loading = ref(true);
const error = ref(null);
const recentReservations = ref([]);
const reservationColumns = ref([
  { key: 'id', label: 'Booking ID' },
  { key: 'guestName', label: 'Guest' },
  { key: 'propertyName', label: 'Property' },
  { key: 'checkIn', label: 'Date' },
  { key: 'status', label: 'Status' },
]);

const fetchReservations = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    recentReservations.value = data.recentReservations || [];
  } catch (err) {
    error.value = 'Failed to load reservations data. Ensure data.json is present.';
    console.error('Reservations Fetch Error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReservations);
</script>

<template>
  <main class="owner-reservations">
    <header class="mb-8">
      <h1 class="text-3xl font-semibold text-(--color-text)">Reservations Summary</h1>
      <p class="mt-2 text-(--color-muted)">Recent reservations for your properties.</p>
    </header>

    <div v-if="loading" class="state-container">
      <div class="loader"></div>
      <p>Fetching reservation data...</p>
    </div>

    <div v-else-if="error" class="state-container error">
      <p>{{ error }}</p>
      <button @click="fetchReservations" class="btn-retry">Retry</button>
    </div>

    <section v-else class="reservations-list">
      <div v-if="recentReservations.length === 0" class="empty-state">
        No recent reservations found.
      </div>

      <AppTable v-else class="data-table" :columns="reservationColumns" :rows="recentReservations">
        <template #cell-guestName="{ value }">
          <span class="font-bold">{{ value }}</span>
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
            <span class="text-xs text-(--color-muted)">to {{ row.checkOut }}</span>
          </div>
        </template>
      </AppTable>
    </section>
  </main>
</template>

<style scoped>
.owner-reservations {
  /* min-height: 100vh; */
  background-color: var(--color-page);
  color: var(--color-text);
}

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
