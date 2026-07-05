<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    allAccounts: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

const tabs = computed(() => [
    { label: t('components.paymentAccountFilter.tabs.all'), value: 'all' },
    { label: t('components.paymentAccountFilter.tabs.active'), value: 'active', accentClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { label: t('components.paymentAccountFilter.tabs.deactivated'), value: 'deactive', accentClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
]);

const getCount = (value) => {
    if (value === 'all') return props.allAccounts.length;
    if (value === 'active') return props.allAccounts.filter(acc => acc.is_active).length;
    if (value === 'deactive') return props.allAccounts.filter(acc => !acc.is_active).length;
    return 0;
};

const selectTab = (value) => {
    emit('update:modelValue', value);
};
</script>

<template>
    <nav class="flex flex-wrap gap-3 py-2">
        <div class="flex gap-4 overflow-x-auto scrollbar-none">
            <button v-for="tab in tabs" :key="tab.value" type="button" @click="selectTab(tab.value)"
                class="px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer select-none"
                :class="modelValue === tab.value
                    ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary)'
                    : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)'
                    ">
                <span>{{ tab.label }}</span>

                <span class="rounded-full px-2 py-0.5 text-xs font-black transition-all" :class="[
                    modelValue === tab.value
                        ? tab.accentClass || 'bg-(--color-primary) text-white'
                        : 'bg-(--color-input) text-(--color-muted)'
                ]">
                    {{ getCount(tab.value) }}
                </span>
            </button>
        </div>
    </nav>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}

.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>