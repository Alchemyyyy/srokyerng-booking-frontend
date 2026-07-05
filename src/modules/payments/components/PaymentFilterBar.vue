<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

defineProps({
    modelValue: { type: String, required: true },
    counts: {
        type: Object,
        default: () => ({ all: 0, pending: 0, submitted: 0, confirmed: 0, cancelled: 0, refunded: 0 })
    }
});
const emit = defineEmits(['update:modelValue']);

const tabs = computed(() => [
    { label: t('components.paymentFilterBar.tabs.all'), value: 'all' },
    { label: t('components.paymentFilterBar.tabs.pending'), value: 'pending', accent: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { label: t('components.paymentFilterBar.tabs.submitted'), value: 'submitted', accent: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { label: t('components.paymentFilterBar.tabs.confirmed'), value: 'confirmed', accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { label: t('components.paymentFilterBar.tabs.cancelled'), value: 'cancelled', accent: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    { label: t('components.paymentFilterBar.tabs.refunded'), value: 'refunded', accent: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
]);
</script>

<template>
    <nav class="flex gap-4 overflow-x-auto pb-2 scrollbar-none select-none">
        <button v-for="tab in tabs" :key="tab.value" type="button" @click="emit('update:modelValue', tab.value)"
            class="px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
            :class="modelValue === tab.value
                ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary)'
                : 'bg-(--color-surface) border border-(--color-border) text-(--color-muted) hover:text-(--color-text)'">
            <span>{{ tab.label }}</span>
            <span class="rounded-lg px-2 py-0.5 text-xs font-black transition-colors"
                :class="modelValue === tab.value ? tab.accent || 'bg-(--color-primary) text-white' : 'bg-(--color-input) text-(--color-muted)'">
                {{ counts[tab.value] || 0 }}
            </span>
        </button>
    </nav>
</template>