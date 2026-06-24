//ApprovalStatusPanel.vue
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    statuses: {
        type: Array,
        default: () => [],
    },
    quickLinks: {
        type: Array,
        default: () => [],
    },
    propertyCount: {
        type: Number,
        default: 1,
    },
    iconMap: {
        type: Object,
        required: true,
    },
    quickLinksTitle: {
        type: String,
        default: '',
    },
    emptyStatusesText: {
        type: String,
        default: '',
    },
    emptyLinksText: {
        type: String,
        default: '',
    },
});

const { t } = useI18n();

const hasStatuses = computed(() => props.statuses.length > 0);
const hasQuickLinks = computed(() => props.quickLinks.length > 0);

const displayTitle = computed(() => props.title || t('owner.analytics.approvalTitle'));
const displayQuickLinksTitle = computed(() => props.quickLinksTitle || t('owner.analytics.quickNavigation'));
const displayEmptyStatusesText = computed(() => props.emptyStatusesText || t('owner.analytics.noApprovalStatuses'));
const displayEmptyLinksText = computed(() => props.emptyLinksText || t('owner.analytics.noQuickLinks'));

const toneTokens = {
    success: {
        dot: 'status-dot--success',
        dotStyle: { background: 'var(--color-success)' },
        track: 'var(--color-success)',
    },
    warning: {
        dot: 'status-dot--warning',
        dotStyle: { background: 'var(--color-warning)' },
        track: 'var(--color-warning)',
    },
    danger: {
        dot: 'status-dot--danger',
        dotStyle: { background: 'var(--color-danger)' },
        track: 'var(--color-danger)',
    },
};

function toneToken(tone) {
    return toneTokens[tone] || toneTokens.warning;
}

function approvalWidth(count) {
    return Math.max(4, Math.round((count / props.propertyCount) * 100));
}
</script>

<template>
    <section class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <div class="mb-4">
            <h3 class="text-lg font-bold text-(--color-text)">{{ displayTitle }}</h3>
            <p v-if="subtitle" class="mt-1 text-xs text-(--color-muted)">{{ subtitle }}</p>
        </div>

        <div v-if="hasStatuses" class="space-y-4">
            <div v-for="status in statuses" :key="status.label" class="space-y-1">
                <div class="flex justify-between text-sm">
                    <span class="flex items-center gap-2 font-medium text-(--color-muted)">
                        <span :class="['h-2.5 w-2.5 rounded-full', toneToken(status.tone).dot]"
                            :style="toneToken(status.tone).dotStyle"></span>
                        {{ status.label }}
                    </span>
                    <span class="font-bold text-(--color-text)">{{ status.count }}</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-soft)">
                    <div class="h-full rounded-full" :style="{
                        width: `${approvalWidth(status.count)}%`,
                        background: toneToken(status.tone).track,
                    }"></div>
                </div>
            </div>
        </div>

        <p v-else
            class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm text-(--color-muted)">
            {{ displayEmptyStatusesText }}
        </p>

        <hr class="my-5 border-(--color-border)" />

        <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-(--color-muted)">{{ displayQuickLinksTitle }}
        </h4>
        <div v-if="hasQuickLinks" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a v-for="link in quickLinks" :key="link.label" :href="link.href"
                class="flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-2.5 text-xs font-medium text-(--color-text) transition hover:border-(--color-primary) hover:bg-(--color-primary-soft) hover:text-(--color-primary)">
                <component :is="iconMap[link.icon]" class="h-4 w-4" />
                {{ link.label }}
            </a>
        </div>

        <p v-else
            class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-sm text-(--color-muted)">
            {{ displayEmptyLinksText }}
        </p>
    </section>
</template>

<style scoped>
.status-dot--success {
    box-shadow: 0 0 0 4px var(--color-success-soft);
}

.status-dot--warning {
    box-shadow: 0 0 0 4px var(--color-warning-soft);
}

.status-dot--danger {
    box-shadow: 0 0 0 4px var(--color-danger-soft);
}
</style>
