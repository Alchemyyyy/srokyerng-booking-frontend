<script setup>
import { computed } from 'vue';

const props = defineProps({
    // ទទួលយកតម្លៃ status_id ដែលកំពុងជ្រើសរើស (e.g., '', 1, 2, 3)
    modelValue: {
        type: [String, Number],
        required: true,
    },
    // ទទួលយកទិន្នន័យ Properties ទាំងអស់ដើម្បីរាប់ចំនួនតាមប្រភេទនីមួយៗលើ Tab
    allProperties: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

// បង្កើតបញ្ជីរាយនាម Status Tabs ឱ្យត្រូវនឹង Backend Status IDs
const tabs = [
    { label: 'All Requests', value: '' },
    { label: 'Pending', value: 1, accentClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { label: 'Approved', value: 2, accentClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { label: 'Rejected', value: 3, accentClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
];

// មុខងារគណនា count ស្វ័យប្រវត្តិនៃ Properties ដែលមាននៅក្នុង Client-side State
const getCount = (value) => {
    if (value === '') return props.allProperties.length;
    return props.allProperties.filter(p => p.status_id === value).length;
};

const selectTab = (value) => {
    emit('update:modelValue', value);
};
</script>

<template>
    <div class="w-full border-b border-(--color-border) bg-(--color-surface) px-2">
        <div class="flex gap-6 overflow-x-auto scrollbar-none">
            <button v-for="tab in tabs" :key="tab.value" type="button" @click="selectTab(tab.value)"
                class="relative flex items-center gap-2 pb-4 pt-2 text-sm font-bold tracking-wide transition-all outline-none cursor-pointer"
                :class="modelValue === tab.value
                        ? 'text-(--color-primary)'
                        : 'text-(--color-muted) hover:text-(--color-text)'
                    ">
                <span>{{ tab.label }}</span>

                <span class="rounded-full px-2 py-0.5 text-xs font-black transition-all" :class="[
                    modelValue === tab.value
                        ? tab.accentClass || 'bg-(--color-primary-soft) text-(--color-primary)'
                        : 'bg-(--color-surface-soft) text-(--color-muted)'
                ]">
                    {{ getCount(tab.value) }}
                </span>

                <div v-if="modelValue === tab.value"
                    class="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-(--color-primary)" />
            </button>
        </div>
    </div>
</template>

<style scoped>
/* ជំនួយសម្រាប់ការលាក់ Scrollbar ករណីអេក្រង់ទូរស័ព្ទតូច */
.scrollbar-none::-webkit-scrollbar {
    display: none;
}

.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>