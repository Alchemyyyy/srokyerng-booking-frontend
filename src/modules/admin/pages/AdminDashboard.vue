<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useAdminDashboardStore } from "@/modules/admin/store/AdminDashboardStore";
import { useSidebar } from "@/shared/composables/useSidebar";

import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";

const dashboardStore = useAdminDashboardStore();

const { loading, error, dashboardData, summaryCards, quickLinks } = storeToRefs(dashboardStore);

const {
    loadDashboard,
    formatNumber,
    formatMoney,
    formatDate,
    statusBadgeClass,
} = dashboardStore;

const { isSidebarOpen } = useSidebar();

onMounted(loadDashboard);
</script>

<template>
    <main class="admin-dashboard my-25 transition-all duration-300" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <header class="dashboard-hero">
            <div>
                <p class="dashboard-eyebrow">Admin command center</p>
                <h1>Platform monitoring dashboard</h1>
                <p class="dashboard-subtitle">
                    Track platform activity, review pending approvals, verify payments, and manage users from one place.
                </p>
            </div>

            <button type="button" class="refresh-button" :disabled="loading" @click="loadDashboard">
                {{ loading ? "Refreshing..." : "Refresh data" }}
            </button>
        </header>

        <section v-if="loading" class="dashboard-state">
            <LoadingSpinner label="Loading admin overview..." />
        </section>

        <section v-else-if="error" class="dashboard-state">
            <p class="error-text">{{ error }}</p>
            <button type="button" class="refresh-button" @click="loadDashboard">Try again</button>
        </section>

        <template v-else>
            <section class="metrics-grid" aria-label="Platform summary">
                <article v-for="card in summaryCards" :key="card.title" class="metric-card">
                    <p class="metric-title">{{ card.title }}</p>
                    <p class="metric-value">{{ formatNumber(card.value) }}</p>
                    <p class="metric-hint">{{ card.hint }}</p>
                </article>
            </section>

            <section class="pending-grid" aria-label="Pending admin tasks">
                <article class="pending-card">
                    <p class="pending-title">Pending property approvals</p>
                    <p class="pending-value">{{ formatNumber(dashboardData.pending.propertyApprovals) }}</p>
                    <p class="pending-note">Properties waiting for admin review.</p>
                </article>
                <article class="pending-card">
                    <p class="pending-title">Pending payment verifications</p>
                    <p class="pending-value">{{ formatNumber(dashboardData.pending.paymentVerifications) }}</p>
                    <p class="pending-note">Payments waiting for confirmation.</p>
                </article>
            </section>

            <section class="data-grid" aria-label="Recent platform activity">
                <article class="table-card">
                    <header>
                        <h2>Recent reservations</h2>
                    </header>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Guest</th>
                                    <th>Property</th>
                                    <th>Check-in</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="reservation in dashboardData.recentReservations" :key="reservation.id">
                                    <td>{{ reservation.id }}</td>
                                    <td>{{ reservation.guestName }}</td>
                                    <td>{{ reservation.propertyName }}</td>
                                    <td>{{ formatDate(reservation.checkInDate) }}</td>
                                    <td>{{ formatMoney(reservation.totalAmount) }}</td>
                                    <td>
                                        <span :class="statusBadgeClass(reservation.status)">{{ reservation.status
                                            }}</span>
                                    </td>
                                </tr>
                                <tr v-if="!dashboardData.recentReservations.length">
                                    <td colspan="6" class="empty-row">No recent reservations.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>

                <article class="table-card">
                    <header>
                        <h2>Recent payments</h2>
                    </header>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Reservation</th>
                                    <th>Payer</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="payment in dashboardData.recentPayments" :key="payment.id">
                                    <td>{{ payment.id }}</td>
                                    <td>{{ payment.reservationId }}</td>
                                    <td>{{ payment.payerName }}</td>
                                    <td>{{ payment.method }}</td>
                                    <td>{{ formatMoney(payment.amount) }}</td>
                                    <td>{{ formatDate(payment.submittedAt) }}</td>
                                    <td>
                                        <span :class="statusBadgeClass(payment.status)">{{ payment.status }}</span>
                                    </td>
                                </tr>
                                <tr v-if="!dashboardData.recentPayments.length">
                                    <td colspan="7" class="empty-row">No recent payments.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            <section class="quick-links" aria-label="Quick admin workflows">
                <header>
                    <h2>Quick actions</h2>
                    <p>Open key admin workflows in one click.</p>
                </header>

                <div class="quick-links-grid">
                    <RouterLink v-for="link in quickLinks" :key="link.title" :to="link.to" class="quick-link-card">
                        <div>
                            <h3>{{ link.title }}</h3>
                            <p>{{ link.description }}</p>
                        </div>
                        <span class="quick-link-count">{{ formatNumber(link.count) }}</span>
                    </RouterLink>
                </div>
            </section>
        </template>
    </main>
</template>

<style scoped>
.admin-dashboard {
    display: grid;
    gap: 1.25rem;
    color: var(--color-text);
}

.dashboard-hero {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: linear-gradient(125deg, var(--color-surface), var(--color-primary-soft));
    box-shadow: var(--shadow-card);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    padding: clamp(1rem, 1.4vw, 1.5rem);
}

.dashboard-eyebrow {
    color: var(--color-primary);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    margin: 0 0 0.35rem;
    text-transform: uppercase;
}

.dashboard-hero h1 {
    font-size: clamp(1.35rem, 2.4vw, 1.9rem);
    margin: 0;
}

.dashboard-subtitle {
    color: var(--color-muted);
    margin: 0.45rem 0 0;
    max-width: 65ch;
}

.refresh-button {
    align-self: flex-start;
    background: var(--color-primary);
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--color-white);
    cursor: pointer;
    font-weight: 600;
    padding: 0.65rem 1rem;
}

.refresh-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.dashboard-state {
    align-items: center;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    justify-content: center;
    min-height: 180px;
    padding: 1.25rem;
}

.error-text {
    color: var(--color-danger);
    margin: 0;
}

.metrics-grid,
.pending-grid,
.data-grid,
.quick-links-grid {
    display: grid;
    gap: 1rem;
}

.metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.pending-grid {
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.data-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.metric-card,
.pending-card,
.table-card,
.quick-links {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
}

.metric-card,
.pending-card {
    padding: 1rem;
}

.metric-title,
.pending-title {
    color: var(--color-muted);
    margin: 0;
}

.metric-value,
.pending-value {
    font-size: 1.85rem;
    font-weight: 700;
    margin: 0.35rem 0;
}

.metric-hint,
.pending-note {
    color: var(--color-muted);
    margin: 0;
}

.table-card {
    padding: 1rem;
}

.table-card h2,
.quick-links h2 {
    margin: 0;
}

.table-wrap {
    overflow-x: auto;
}

table {
    border-collapse: collapse;
    margin-top: 0.75rem;
    width: 100%;
}

th,
td {
    border-bottom: 1px solid var(--color-border);
    padding: 0.55rem;
    text-align: left;
    white-space: nowrap;
}

th {
    color: var(--color-muted);
    font-size: 0.79rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.empty-row {
    color: var(--color-muted);
    text-align: center;
}

.status-badge {
    border-radius: 999px;
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.18rem 0.55rem;
    text-transform: capitalize;
}

.status-pending {
    background: var(--color-warning-soft);
    color: var(--color-warning);
}

.status-approved {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.status-rejected {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}

.quick-links {
    padding: 1rem;
}

.quick-links header p {
    color: var(--color-muted);
    margin: 0.25rem 0 0.9rem;
}

.quick-links-grid {
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.quick-link-card {
    align-items: flex-start;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: inherit;
    display: flex;
    gap: 0.8rem;
    justify-content: space-between;
    padding: 0.9rem;
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.quick-link-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
}

.quick-link-card h3 {
    font-size: 1rem;
    margin: 0;
}

.quick-link-card p {
    color: var(--color-muted);
    margin: 0.3rem 0 0;
}

.quick-link-count {
    background: var(--color-primary-soft);
    border-radius: 999px;
    color: var(--color-primary);
    font-weight: 700;
    padding: 0.2rem 0.6rem;
}

@media (max-width: 768px) {
    .dashboard-hero {
        align-items: flex-start;
        flex-direction: column;
    }

    .refresh-button {
        width: 100%;
    }
}
</style>
