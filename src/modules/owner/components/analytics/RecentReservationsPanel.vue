<script setup>
import AppTable from '@/shared/components/AppTable.vue';

import '@/assets/styles/variables.css';

defineProps({
    reservations: {
        type: Array,
        default: () => [],
    },
    formatDate: {
        type: Function,
        required: true,
    },
    formatMoney: {
        type: Function,
        required: true,
    },
});

const columns = [
    { key: 'guestName', label: 'Guest' },
    { key: 'propertyName', label: 'Property / Room' },
    { key: 'dates', label: 'Check In - Out' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
];
</script>

<template>
    <section class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <div class="mb-4 flex items-center justify-between">
            <div>
                <h3 class="text-lg font-bold text-(--color-text)">Recent Reservations</h3>
                <p class="text-xs text-(--color-muted)">Latest bookings across your properties.</p>
            </div>

            <span
                class="rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--color-primary)">
                {{ reservations.length }} items
            </span>
        </div>

        <AppTable :columns="columns" :rows="reservations">
            <template #cell-guestName="{ value }">
                <span class="font-semibold text-(--color-text)">{{ value }}</span>
            </template>

            <template #cell-propertyName="{ row }">
                <div class="flex flex-col">
                    <span class="font-medium text-(--color-text)">{{ row.propertyName }}</span>
                    <span class="text-xs text-(--color-muted)">{{ row.roomName || 'No Room Assigned' }}</span>
                </div>
            </template>

            <template #cell-dates="{ row }">
                <div class="flex flex-col">
                    <span class="text-(--color-text)">{{ formatDate(row.checkIn) }}</span>
                    <span class="text-xs text-(--color-muted)">to {{ formatDate(row.checkOut) }}</span>
                </div>
            </template>

            <template #cell-amount="{ value }">
                <span class="font-semibold text-(--color-text)">{{ formatMoney(value || 0) }}</span>
            </template>

            <template #cell-status="{ row }">
                <span
                    :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', `status-${row.statusTone}`]">
                    {{ row.status }}
                </span>
            </template>
        </AppTable>
    </section>
</template>

<style scoped>
.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;
}

.status-success {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.status-warning {
    background: var(--color-warning-soft);
    color: var(--color-warning);
}

.status-danger {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}
</style>