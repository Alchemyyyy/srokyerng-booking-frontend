<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
    modelValue: {
        type: [String, Number],
        required: true,
    },
    allProperties: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

const tabs = computed(() => [
    { label: t("components.approvalFilter.allRequests"), value: '' },
    { label: t("common.status.pending"), value: 1, accentClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { label: t("common.status.approved"), value: 2, accentClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { label: t("common.status.rejected"), value: 3, accentClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
]);

const getCount = (value) => {
    if (value === '') return props.allProperties.length;

    return props.allProperties.filter(
        p => Number(p.status?.status_id) === Number(value)
    ).length;
};

const selectTab = (value) => {
    emit('update:modelValue', value);
};
</script>

<template>
    <nav class="flex flex-wrap gap-3 py-2">
        <div class="flex gap-6 overflow-x-auto scrollbar-none">
            <button v-for="tab in tabs" :key="tab.value" type="button" @click="selectTab(tab.value)"
                class="px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
                :class="modelValue === tab.value
                    ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
                    : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)'
                    ">
                <span>{{ tab.label }}</span>

                <span class="rounded-full px-2 py-0.5 text-xs font-black transition-all" :class="[
                    modelValue === tab.value
                        ? tab.accentClass || 'bg-(--co  lor-primary-soft) text-(--color-primary)'
                        : 'bg-(--color-surface-soft) text-(--color-muted)'
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