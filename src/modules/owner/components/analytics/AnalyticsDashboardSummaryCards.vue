<script setup>
defineProps({
    summaryCards: {
        type: Array,
        default: () => [],
    },
});
</script>

<template>
    <section class="metrics" aria-label="Summary metrics">
        <article v-for="card in summaryCards" :key="card.label" class="metric">
            <div class="metric__icon" :class="`metric__icon--${card.tone}`">
                <component :is="card.icon" class="h-6 w-6" />
            </div>
            <div>
                <p class="metric__label">{{ card.label }}</p>
                <p class="metric__value">{{ card.value }}</p>
                <p class="metric__delta">{{ card.delta }}</p>
            </div>
        </article>
    </section>
</template>

<style scoped>
.metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.metric {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
}

.metric__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.metric__icon--blue {
    background: var(--color-primary-soft);
}

.metric__icon--teal {
    background: var(--color-success-soft);
}

.metric__icon--amber {
    background: var(--color-warning-soft);
}

.metric__icon--coral {
    background: var(--color-danger-soft);
}

.metric__label {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.85rem;
}

.metric__value {
    margin: 0.15rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.metric__delta {
    margin: 0.15rem 0 0;
    color: #1d9e75;
    font-size: 0.85rem;
}

@media (max-width: 1100px) {
    .metrics {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 760px) {
    .metrics {
        grid-template-columns: 1fr;
    }
}
</style>