<script setup>
import { ref, onMounted } from 'vue';

import OwnerSidebar from '../components/layouts/OwnerSidebar.vue';
import OwnerHeader from '../components/layouts/OwnerHeader.vue';
import AppButton from '@/shared/components/AppButton.vue';
import OwnerPropertiesView from '@/modules/properties/pages/OwnerPropertiesView.vue';
import OwnerReservationsView from '@/modules/reservations/pages/OwnerReservationsView.vue';

import '@/assets/styles/variables.css'; // Importing design tokens


// State management
const loading = ref(true);
const error = ref(null);
const activeTab = ref('Properties');



// Data references
const properties = ref([]);
const recentReservations = ref([]);
const setupReminders = ref([]);
const summaryStats = ref([
  { label: 'Total Properties', value: '0', trend: '', type: 'primary', icon: 'HomeIcon' },
  { label: 'Total Bookings', value: '0', trend: '', type: 'info', icon: 'CalendarIcon' },
  { label: 'Total Revenue', value: '$0', trend: '', type: 'success', icon: 'DollarIcon' },
  { label: 'Avg Rating', value: '0.0', trend: '', type: 'warning', icon: 'StarIcon' }
]);

const reservationColumns = ref([
  { key: 'id', label: 'Booking ID' },
  { key: 'guestName', label: 'Guest' },
  { key: 'propertyName', label: 'Property' },
  { key: 'checkIn', label: 'Date' },
  { key: 'status', label: 'Status' }
])

/**
 * Fetches dashboard data from the local data.json file
 */
const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetching from the local data.json file
    // Note: Ensure data.json is in your /public folder or the same directory 
    // as the component depending on your dev server setup.
    const response = await fetch('/data.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 1. Map Summary Stats (Matching Screenshot 2026-05-13 160636.png)
    summaryStats.value[0].value = data.summary.totalProperties;
    summaryStats.value[0].trend = data.summary.trends.properties;

    summaryStats.value[1].value = data.summary.totalBookings;
    summaryStats.value[1].trend = data.summary.trends.bookings;

    summaryStats.value[2].value = `$${data.summary.totalRevenue.toLocaleString()}`;
    summaryStats.value[2].trend = data.summary.trends.revenue;

    summaryStats.value[3].value = `${data.summary.avgRating}★`;
    summaryStats.value[3].trend = data.summary.trends.rating;

    // 2. Map Properties List
    properties.value = data.properties;

    // 3. Map Recent Reservations
    recentReservations.value = data.recentReservations;

    // 4. Handle Setup Reminders for missing payment accounts
    if (!data.paymentStatus.isComplete) {
      setupReminders.value = [{
        id: 'payment-setup',
        title: 'Missing Payment Account',
        message: 'You haven’t finished setting up your payment account. Complete this to receive your earnings.',
        link: '/owner/payment-accounts'
      }];
    }

  } catch (err) {
    error.value = "Failed to load dashboard data. Ensure data.json is present.";
    console.error("Dashboard Fetch Error:", err);
  } finally {
    // Artificial delay to show off the smooth loading state
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

onMounted(fetchDashboardData);
</script>


<template>

  <OwnerHeader />
  <OwnerSidebar />
  <div class="owner-dashboard ml-64">
    <!-- Header & Quick Actions -->
    <header class="dashboard-header mt-25">
      <div>
        <h1>Owner Dashboard</h1>
        <p class="text-muted">Welcome back! Here's what's happening with your properties.</p>
      </div>
      <AppButton to="/owner/properties/new" variant="primary" size="md">
        <span class="icon">+</span> Add New Property
      </AppButton>
    </header>

    <!-- Alerts / Setup Reminders -->
    <section v-if="setupReminders.length > 0" class="reminders-section">
      <div v-for="reminder in setupReminders" :key="reminder.id" class="alert-card warning">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div>
            <p class="alert-title">{{ reminder.title }}</p>
            <p class="alert-desc">{{ reminder.message }}</p>
          </div>
        </div>
        <router-link :to="reminder.link" class="btn-link">Complete Setup</router-link>
      </div>
    </section>

    <!-- Summary Statistics Grid -->
    <section class="stats-grid">
      <div class="stat-card" v-for="stat in summaryStats" :key="stat.label">
        <div class="stat-icon-wrapper" :class="stat.type">
          <component :is="stat.icon" />
        </div>
        <div class="stat-info">
          <h2 class="stat-value">{{ stat.value }}</h2>
          <p class="stat-label">{{ stat.label }}</p>
          <span class="stat-trend" :class="stat.trendUp ? 'trend-up' : ''">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <nav class="dashboard-tabs">
      <button v-for="tab in ['Properties', 'Reservations', 'Revenue']" :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]" @click="activeTab = tab">
        {{ tab }}
      </button>
    </nav>

    <!-- Main Content Area -->
    <main class="content-area">
      <div v-if="loading" class="state-container">
        <div class="loader"></div>
        <p>Fetching your data...</p>
      </div>

      <div v-else-if="error" class="state-container error">
        <p>{{ error }}</p>
        <button @click="fetchDashboardData" class="btn-retry">Retry</button>
      </div>

      <div v-else>
        <!-- Properties List -->
        <div v-if="activeTab === 'Properties'" class="property-list">
          <OwnerPropertiesView />
        </div>

        <!-- Reservations Summary -->
        <OwnerReservationsView />
        <!-- <div v-if="activeTab === 'Reservations'" class="reservations-list">
          <div v-if="recentReservations.length === 0" class="empty-state">
            No recent reservations found.
          </div>

          <AppTable v-else class="data-table" :columns="reservationColumns" :rows="recentReservations">

            <template #cell-guestName="{ value }">
              <span class="font-bold">{{ value }}</span>
            </template>

<template #cell-status="{ value }">
              <span :class="['status-badge', `status-${value}`]">
                {{ value }}
              </span>
            </template>

<template #cell-checkIn="{ row }">
              <div class="flex flex-col">
                <span>{{ row.checkIn }}</span>
                <span class="text-xs text-(--color-muted)">to {{ row.checkOut }}</span>
              </div>
            </template>
</AppTable>
</div> -->
      </div>
    </main>
  </div>
</template>


<style scoped>
.owner-dashboard {
  padding: 2rem;
  background-color: var(--color-page);
  color: var(--color-text);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.stat-label {
  color: var(--color-muted);
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

/* Property Item (Matching Screenshot) */
.property-item-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--color-border);
  transition: transform 0.2s;
}

.property-thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.property-details {
  flex-grow: 1;
}

.property-metrics {
  display: flex;
  justify-content: start;
  gap: 24rem;
  margin-top: 0.75rem;
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.65rem;
  color: var(--color-muted);
  letter-spacing: 0.05em;
}

.metric-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.property-actions {
  display: flex;
  /* justify-content: space-between; */
  /* flex-direction: column; */
  align-items: flex-end;
  gap: 1rem;
}

/* Tabs */
.dashboard-tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--color-surface-soft);
  padding: 0.4rem;
  border-radius: 10px;
  width: fit-content;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  font-weight: 600;
}

.tab-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

/* Alerts */
.alert-card.warning {
  background: var(--color-warning-soft);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

/* Status Badges from design tokens */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
</style>