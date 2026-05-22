<script setup>
defineProps({
    tabs: {
        type: Array,
        default: () => [],
    },
    activeTab: {
        type: String,
        default: 'overview',
    },
});

const emit = defineEmits(['update:activeTab']);
</script>

<template>
    <header class="topbar">
        <div>
            <p class="eyebrow">May 2026 · Live data</p>
            <h1 class="text-3xl font-semibold text-(--color-text)">Analytics Dashboard</h1>
            <p class="topbar-subtitle">Track revenue, booking traffic, and property performance from one place.</p>
        </div>

        <div class="topbar-actions">
            <nav class="tabs" aria-label="Dashboard sections">
                <button v-for="tab in tabs" :key="tab.key" type="button" class="tab"
                    :class="{ active: activeTab === tab.key }" @click="emit('update:activeTab', tab.key)">
                    {{ tab.label }}
                </button>
            </nav>
        </div>
    </header>
</template>

<style scoped>
.topbar {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.eyebrow {
    margin: 0 0 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    color: var(--color-muted);
}

.topbar-subtitle {
    margin: 0.4rem 0 0;
    color: var(--color-muted);
    max-width: 56ch;
}

.topbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    align-items: center;
}

.tabs {
    display: flex;
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-soft);
}

.tab {
    border: 0;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
    font-weight: 600;
}

.tab.active {
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-card);
}

@media (max-width: 1100px) {
    .topbar {
        flex-direction: column;
    }

    .topbar-actions {
        justify-content: flex-start;
    }
}

@media (max-width: 760px) {
    .topbar-actions {
        align-items: flex-start;
    }

    .tabs {
        flex-wrap: wrap;
    }
}
</style>