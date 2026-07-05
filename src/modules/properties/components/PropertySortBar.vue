<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
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

const sortOptions = computed(() => [
  { value: "newest", label: t("propertiesPage.sort.options.newest") },
  { value: "price-asc", label: t("propertiesPage.sort.options.priceAsc") },
  { value: "price-desc", label: t("propertiesPage.sort.options.priceDesc") },
  { value: "rating-desc", label: t("propertiesPage.sort.options.ratingDesc") },
]);
</script>

<template>
  <div class="flex items-center gap-4 sm:gap-6">
    <!-- ── Premium Sort Dropdown ── -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-(--color-muted) hidden sm:inline-flex items-center gap-1.5 shrink-0">
        <ArrowsUpDownIcon class="w-3.5 h-3.5 text-(--color-primary)" />
        {{ t("propertiesPage.sort.label", "Sort by:") }}
      </span>
      <div class="relative w-44 sm:w-48">
        <select
          v-model="currentSort"
          class="w-full bg-(--color-surface-soft) text-xs font-semibold text-(--color-text) cursor-pointer focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)/20 appearance-none pl-3.5 pr-8 py-2 rounded-sm border border-(--color-border)/80 hover:border-(--color-border) transition-all shadow-xs"
          style="border-radius: var(--radius-sm);"
        >
          <option
            v-for="opt in sortOptions"
            :key="opt.value"
            :value="opt.value"
            class="bg-(--color-surface) text-(--color-text) font-semibold text-xs py-1"
          >
            {{ opt.label }}
          </option>
        </select>
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-(--color-muted) pointer-events-none"
        >
          ▼
        </span>
      </div>
    </div>

    <!-- ── Refined View Mode Toggle ── -->
    <div
      class="flex items-center bg-(--color-surface-soft) p-1 rounded-sm border border-(--color-border)/80 shadow-xs"
      style="border-radius: var(--radius-sm);"
    >
      <button
        v-for="mode in ['grid', 'list']"
        :key="mode"
        type="button"
        @click="$emit('update:viewMode', mode)"
        class="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-sm transition-all duration-200 cursor-pointer"
        style="border-radius: var(--radius-sm);"
        :class="
          viewMode === mode
            ? 'bg-(--color-surface) shadow-sm text-(--color-primary) border border-(--color-border)'
            : 'text-(--color-muted) hover:text-(--color-text)'
        "
        :aria-label="mode === 'grid' ? t('propertiesPage.sort.switchToGrid') : t('propertiesPage.sort.switchToList')"
      >
        <component
          :is="mode === 'grid' ? Squares2X2Icon : ListBulletIcon"
          class="w-4 h-4 sm:w-4.5 sm:h-4.5"
        />
      </button>
    </div>
  </div>
</template>
