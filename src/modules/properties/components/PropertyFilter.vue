<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
  cityOptions: {
    type: Array,
    required: true,
  },
  typeOptions: {
    type: Array,
    required: true,
  },
  minimumRatings: {
    type: Array,
    required: true,
  },
  whyBrowseItems: {
    type: Array,
    required: true,
  },
  propertyCountByCity: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "reset"]);

// Update a single filter field
const updateFilter = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const formatPrice = (value) => `$${value}`;
</script>

<template>
  <div class="properties-panel rounded-[30px] border p-6 backdrop-blur-xl">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-primary)"
        >
          {{ t("propertiesPage.filters.title") }}
        </p>
        <h2 class="mt-2 text-2xl font-black text-(--color-text)">
          {{ t("propertiesPage.filters.refineTrip") }}
        </h2>
      </div>
      <span
        class="rounded-full bg-(--color-primary-soft) px-3 py-1 text-sm font-semibold text-(--color-primary)"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Price Range -->
    <div class="mt-6">
      <label
        class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
      >
        {{ t("propertiesPage.filters.maxPricePerNight") }}
      </label>
      <div
        class="mt-3 flex items-center justify-between text-sm font-semibold text-(--color-text)"
      >
        <span>{{ formatPrice(0) }}</span>
        <span>{{ formatPrice(modelValue.maxPrice) }}</span>
      </div>
      <input
        :value="modelValue.maxPrice"
        @input="updateFilter('maxPrice', Number($event.target.value))"
        type="range"
        min="30"
        max="220"
        step="5"
        class="property-range mt-3 w-full"
        style="accent-color: var(--color-primary)"
      />
    </div>

    <!-- City Filter -->
    <div class="mt-8">
      <p
        class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
      >
        {{ t("home.search.city") }}
      </p>
      <div class="mt-3 space-y-2">
        <button
          v-for="city in cityOptions.slice(1)"
          :key="city.value"
          type="button"
          class="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
          :class="
            modelValue.city === city.value
              ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
              : 'border-(--color-border) bg-(--color-surface) text-(--color-text) hover:border-(--color-primary)/20 hover:bg-(--color-surface-soft)'
          "
          @click="
            updateFilter(
              'city',
              modelValue.city === city.value ? 'all' : city.value,
            )
          "
        >
          <span>{{ city.label }}</span>
          <span class="text-xs text-(--color-muted)">
            {{ propertyCountByCity(city.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Type Filter -->
    <div class="mt-8">
      <p
        class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
      >
        {{ t("home.search.type") }}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="type in typeOptions.slice(1)"
          :key="type.value"
          type="button"
          class="rounded-full border px-3.5 py-2 text-sm font-semibold transition"
          :class="
            modelValue.type === type.value
              ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
              : 'border-(--color-border) bg-(--color-surface) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)'
          "
          @click="
            updateFilter(
              'type',
              modelValue.type === type.value ? 'all' : type.value,
            )
          "
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Rating Filter -->
    <div class="mt-8">
      <p
        class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
      >
        {{ t("propertiesPage.filters.minimumRating") }}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="rating in minimumRatings"
          :key="rating"
          type="button"
          class="rounded-full border px-3.5 py-2 text-sm font-semibold transition"
          :class="
            modelValue.minRating === rating
              ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
              : 'border-(--color-border) bg-(--color-surface) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)'
          "
          @click="updateFilter('minRating', rating)"
        >
          {{ rating === 0 ? t("propertiesPage.filters.all") : `${rating}+` }}
        </button>
      </div>
    </div>

    <!-- Why Browse -->
    <div
      class="mt-8 rounded-[24px] bg-[linear-gradient(145deg,#082b58,#0f67b3)] p-5 text-white shadow-[0_18px_40px_rgba(7,42,103,0.22)]"
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.22em] text-white/62"
      >
        {{ t("propertiesPage.whyBrowse.title") }}
      </p>
      <ul class="mt-4 space-y-3 text-sm leading-6 text-white/82">
        <li v-for="item in whyBrowseItems" :key="item">{{ item }}</li>
      </ul>
    </div>

    <!-- Reset Button -->
    <button
      type="button"
      @click="$emit('reset')"
      class="mt-6 w-full rounded-2xl border border-(--color-border) py-3 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary)/30 hover:bg-(--color-primary-soft) hover:text-(--color-primary)"
    >
      {{ t("propertiesPage.actions.resetFilters") }}
    </button>
  </div>
</template>

<style scoped>
.properties-panel {
  background: var(--color-surface);
  border-color: var(--color-border);
  box-shadow: var(--shadow-panel);
}

.property-range {
  height: 8px;
  cursor: pointer;
}

.property-range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.property-range::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.property-range::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.property-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: var(--shadow-card);
}
</style>
