<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
    iconMap: {
        type: Object,
        required: true,
    },
    quickLinks: {
        type: Array,
        default: () => [],
    },
    statuses: {
        type: Array,
        default: () => [],
    },
    propertyCount: {
        type: Number,
        default: 0,
    },
});

const { t } = useI18n();
const router = useRouter();

const hasQuickLinks = computed(() => props.quickLinks.length > 0);

const toneConfig = {
    success: {
        bg: 'var(--color-success-soft)',
        text: 'var(--color-success)',
        icon: 'var(--color-success)',
        border: 'var(--color-success)',
    },
    warning: {
        bg: 'var(--color-warning-soft)',
        text: 'var(--color-warning)',
        icon: 'var(--color-warning)',
        border: 'var(--color-warning)',
    },
    danger: {
        bg: 'var(--color-danger-soft)',
        text: 'var(--color-danger)',
        icon: 'var(--color-danger)',
        border: 'var(--color-danger)',
    },
    blue: {
        bg: 'var(--color-primary-soft)',
        text: 'var(--color-primary)',
        icon: 'var(--color-primary)',
        border: 'var(--color-primary)',
    },
    teal: {
        bg: 'var(--color-info-soft)',
        text: 'var(--color-info)',
        icon: 'var(--color-info)',
        border: 'var(--color-info)',
    },
};

// Map each quick link to a tone for icon color
const toneOrder = ['blue', 'teal', 'success', 'warning'];

const enrichedLinks = computed(() =>
    props.quickLinks.map((link, i) => ({
        ...link,
        tone: toneOrder[i % toneOrder.length],
    }))
);

function getConfig(tone) {
    return toneConfig[tone] || toneConfig.blue;
}

function navigate(href) {
    router.push(href);
}
</script>

<template>
    <section class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">

        <!-- Header -->
        <div class="mb-5">
            <h3 class="text-lg font-bold text-(--color-text)">
                {{ t('owner.analytics.quickActions', 'Quick Actions') }}
            </h3>
            <p class="mt-1 text-xs text-(--color-muted)">
                {{ t('owner.analytics.quickActionsSubtitle', 'Navigate to key sections instantly') }}
            </p>
        </div>

        <!-- Action Cards Grid -->
        <div v-if="hasQuickLinks" class="grid grid-cols-2 gap-3">
            <button v-for="(link, i) in enrichedLinks" :key="link.label" @click="navigate(link.href)"
                class="group flex flex-col items-center justify-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-200 cursor-pointer"
                :style="{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-surface-soft)',
                }" @mouseenter="e => {
                    e.currentTarget.style.borderColor = getConfig(link.tone).border;
                    e.currentTarget.style.background = getConfig(link.tone).bg;
                }" @mouseleave="e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-surface-soft)';
                }">
                <!-- Icon bubble -->
                <span class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                    :style="{ background: getConfig(link.tone).bg }">
                    <component :is="iconMap[link.icon]" class="h-5 w-5 transition-all duration-200"
                        :style="{ color: getConfig(link.tone).icon }" />
                </span>

                <!-- Label -->
                <span class="text-xs font-semibold leading-tight transition-colors duration-200 text-(--color-text)">
                    {{ link.label }}
                </span>
            </button>
        </div>

        <!-- Empty State -->
        <p v-else
            class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm text-(--color-muted)">
            {{ t('owner.analytics.noQuickLinks', 'No quick actions available.') }}
        </p>

        <!-- Divider + Property Count hint -->
        <div v-if="propertyCount > 0"
            class="mt-5 flex items-center justify-between rounded-xl bg-(--color-surface-soft) px-4 py-3">
            <span class="text-xs text-(--color-muted)">
                {{ t('owner.analytics.totalProperties', 'Total Properties') }}
            </span>
            <span class="text-sm font-bold text-(--color-primary)">{{ propertyCount }}</span>
        </div>

    </section>
</template>