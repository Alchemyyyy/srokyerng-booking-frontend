<script setup>
const props = defineProps({
    property: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="property-item-card rounded-md border">
        <img :src="property.image" :alt="property.name" class="property-thumb rounded-sm" />

        <div class="property-details">
            <h3 class="metric-value">{{ property.name }}</h3>
            <p class="location">{{ property.type }} · {{ property.location }}</p>

            <div class="property-metrics">
                <div class="metric">
                    <span class="metric-label">ROOMS</span>
                    <span class="metric-value">{{ property.rooms }}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">BOOKINGS</span>
                    <span class="metric-value">{{ property.bookings }}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">REVENUE</span>
                    <span class="metric-value">${{ property.revenue.toLocaleString() }}</span>
                </div>
            </div>
        </div>

        <div class="property-actions">
            <span class="item-status mb-11" :class="['status-badge', `status-${property.status.toLowerCase()}`]">
                {{ property.status }}
            </span>
            <div class="action-buttons grid gap-2">
                <button class="icon-btn p-2 rounded-sm bg-(--color-primary-soft) text-(--color-primary)" title="View">
                    <svg class="eye-icon size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>
                <button class="icon-btn p-2 rounded-sm bg-(--color-primary-soft) text-(--color-muted)" title="Edit">
                    <svg class="edit-icon size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    align-items: flex-end;
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
