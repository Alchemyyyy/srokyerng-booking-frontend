<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowsUpDownIcon,
  Squares2X2Icon,
  MapIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: { type: String, default: "newest" },
  viewMode: { type: String, default: "grid" },
});

const emit = defineEmits(["update:modelValue", "update:viewMode"]);

// Use a computed property for the select dropdown to maintain one-way data flow
const currentSort = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const sortOptions = [
  { value: "newest", label: "Newest Added" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "rating-desc", label: "Highest Rated" },
];
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-(--color-border)/60 mb-8"
  >
    <!-- Sort Dropdown -->
    <div class="flex items-center gap-2">
      <ArrowsUpDownIcon class="w-4 h-4 text-(--color-primary)" />
      <div class="relative">
        <select
          v-model="currentSort"
          class="bg-transparent text-xs font-black uppercase tracking-[0.2em] text-(--color-text) cursor-pointer focus:outline-hidden appearance-none pr-8 hover:text-(--color-primary) transition-colors"
        >
          <option
            v-for="opt in sortOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
        <span
          class="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-(--color-muted) pointer-events-none"
          >▼</span
        >
      </div>
    </div>

    <!-- View Mode Toggle -->
    <div
      class="flex items-center bg-(--color-surface-soft) p-1 rounded-[14px] border border-(--color-border)/60"
    >
      <button
        v-for="mode in ['grid', 'map']"
        :key="mode"
        @click="$emit('update:viewMode', mode)"
        class="flex items-center justify-center w-9 h-9 rounded-[10px] transition-all duration-200"
        :class="
          viewMode === mode
            ? 'bg-(--color-surface) shadow-sm text-(--color-primary)'
            : 'text-(--color-muted) hover:text-(--color-text)'
        "
      >
        <component
          :is="mode === 'grid' ? Squares2X2Icon : MapIcon"
          class="w-5 h-5"
        />
      </button>
    </div>
  </div>
</template>
