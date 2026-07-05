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
    { label: t("common.status.suspended"), value: 4, accentClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
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
    <nav class="flex flex-wrap gap-2 py-1">
        <div class="flex gap-2 overflow-x-auto scrollbar-none">
            <button v-for="tab in tabs" :key="tab.value" type="button" @click="selectTab(tab.value)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                :class="modelValue === tab.value
                    ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
                    : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)'
                    ">
                <span>{{ tab.label }}</span>

                <span class="rounded-full px-1.5 py-0.5 text-[10px] font-black transition-all" :class="[
                    modelValue === tab.value
                        ? tab.accentClass || 'bg-(--color-primary-soft) text-(--color-primary)'
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