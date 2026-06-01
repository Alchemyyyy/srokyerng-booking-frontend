<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['retry']);
const { t } = useI18n();

const loadingMessage = computed(() => t('owner.analytics.loadingDashboard'));
const retryLabel = computed(() => t('owner.analytics.retry'));
</script>

<template>
    <div v-if="loading" class="dashboard-state">
        <div class="loader"></div>
        <p>{{ loadingMessage }}</p>
    </div>

    <div v-else class="dashboard-state dashboard-state--error">
        <p>{{ error }}</p>
        <button type="button" class="retry-button" @click="emit('retry')">{{ retryLabel }}</button>
    </div>
</template>

<style scoped>
.dashboard-state {
    min-height: 48vh;
    display: grid;
    place-items: center;
    gap: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-surface);
}

.dashboard-state--error {
    color: var(--color-danger, #c53030);
    padding: 2rem;
}

.retry-button {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.25rem;
    font-weight: 700;
    cursor: pointer;
    background: var(--color-primary);
    color: white;
}

.loader {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 3px solid rgba(55, 138, 221, 0.15);
    border-top-color: var(--color-primary);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>