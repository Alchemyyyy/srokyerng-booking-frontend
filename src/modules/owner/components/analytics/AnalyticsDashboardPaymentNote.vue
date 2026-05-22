<script setup>
import { RouterLink } from 'vue-router';

defineProps({
    paymentStatus: {
        type: Object,
        default: null,
    },
});
</script>

<template>
    <div v-if="paymentStatus && !paymentStatus.isComplete" class="payment-note">
        <div>
            <p class="payment-note__title">Payment account setup is incomplete</p>
            <p class="payment-note__text">Finish the missing fields to receive earnings from confirmed bookings.</p>
        </div>
        <RouterLink class="payment-note__link" to="/owner/payment-accounts">Complete setup</RouterLink>
    </div>
</template>

<style scoped>
.payment-note {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    background: var(--color-warning-soft);
    border: 1px solid var(--color-warning);
}

.payment-note__title {
    margin: 0;
    font-weight: 700;
}

.payment-note__text {
    margin: 0.25rem 0 0;
    color: var(--color-muted);
}

.payment-note__link {
    flex-shrink: 0;
    padding: 0.7rem 1rem;
    border-radius: 999px;
    text-decoration: none;
    background: var(--color-primary);
    color: var(--color-surface);
    font-weight: 700;
}

@media (max-width: 760px) {
    .payment-note {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>