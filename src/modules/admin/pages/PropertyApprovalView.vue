<script setup>
import { onMounted, ref } from 'vue';
import { usePropertyApproval } from '../composables/usePropertyApproval';
import ApprovalTable from '../components/ApprovalTable.vue';
import { ExclamationTriangleIcon, InboxIcon } from '@heroicons/vue/24/outline';

const { properties, loading, error, fetchProperties } = usePropertyApproval();
import { useSidebar } from '@/shared/composables/useSidebar';

const { isSidebarOpen } = useSidebar();

onMounted(() => {
    fetchProperties();
});

</script>

<template>
    <div class="approval-container mt-25 mx-auto" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <div class="page-header">
            <div>
                <h1 class="page-title">Property Approvals</h1>
                <p class="page-subtitle">Review and manage platform host listings requests.</p>
            </div>
            <div v-if="properties.length > 0" class="counter-badge">
                {{ properties.length }} Requests Pending
            </div>
        </div>

        <div v-if="error" class="state-card error-card">
            <ExclamationTriangleIcon class="state-icon text-danger" />
            <div class="state-content">
                <h3 class="state-title">Data Fetching Interrupted</h3>
                <p class="state-desc">{{ error }}</p>
                <button @click="fetchProperties" class="btn-retry">Try Reconnecting</button>
            </div>
        </div>

        <div v-else-if="loading" class="state-card loading-card">
            <div class="spinner"></div>
            <p class="loading-text">Synchronizing property database...</p>
        </div>

        <template v-else>
            <ApprovalTable v-if="properties.length > 0" :items="properties" />

            <div v-else class="state-card empty-card">
                <InboxIcon class="state-icon text-muted" />
                <h3 class="state-title">All Clear!</h3>
                <p class="state-desc">There are no pending property approvals in the moderation queue right now.</p>
            </div>
        </template>
    </div>
</template>

<style scoped>
.approval-container {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-md);
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
}

.page-subtitle {
    font-size: 0.875rem;
    color: var(--color-muted);
    font-family: var(--font-secondary);
    margin-top: var(--space-xs);
}

.counter-badge {
    background-color: var(--color-warning-soft);
    color: var(--color-warning);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
}

/* STATE CARDS UI */
.state-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: var(--shadow-card);
}

.state-icon {
    width: 3.5rem;
    height: 3.5rem;
    margin-bottom: var(--space-md);
}

.text-danger {
    color: var(--color-danger);
}

.text-muted {
    color: var(--color-muted);
}

.state-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
}

.state-desc {
    font-size: 0.875rem;
    color: var(--color-muted);
    margin-top: var(--space-xs);
    max-width: 26rem;
    line-height: 1.5;
}

.btn-retry {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
}

.spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 4px solid var(--color-primary-soft);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--space-sm);
}

.loading-text {
    font-size: 0.875rem;
    color: var(--color-muted);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>