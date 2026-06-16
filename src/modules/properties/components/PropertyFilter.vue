<script setup>
import AppButton from "@/shared/components/AppButton.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: { type: Object, required: true },
  activeFilterCount: { type: Number, default: 0 },
  cityOptions: { type: Array, required: true },
  typeOptions: { type: Array, required: true },
  minimumRatings: { type: Array, required: true },
  whyBrowseItems: { type: Array, required: true },
  propertyCountByCity: { type: Function, required: true },
});

const emit = defineEmits(["update:modelValue", "reset"]);

const updateFilter = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const formatPrice = (value) => `$${value}`;
</script>

<template>
  <div
    class="properties-panel rounded-[28px] border border-(--color-border)/60 p-6 bg-(--color-surface)"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.24em] text-(--color-primary)"
        >
          {{ t("propertiesPage.filters.title") }}
        </p>
        <h2 class="mt-1.5 text-xl font-black text-(--color-text)">
          {{ t("propertiesPage.filters.refineTrip") }}
        </h2>
      </div>
      <span
        class="flex items-center justify-center w-8 h-8 rounded-full bg-(--color-primary-soft) text-xs font-bold text-(--color-primary)"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Price Range -->
    <div class="mt-8">
      <label
        class="text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted)"
      >
        {{ t("propertiesPage.filters.maxPricePerNight") }}
      </label>
      <div
        class="mt-4 flex items-center justify-between text-sm font-bold text-(--color-text)"
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
      />
    </div>

    <!-- City Filter -->
    <div class="mt-8">
      <p
        class="text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted) mb-4"
      >
        {{ t("home.search.city") }}
      </p>
      <div class="space-y-2">
        <button
          v-for="city in cityOptions.slice(1)"
          :key="city.value"
          type="button"
          class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200"
          :class="
            modelValue.city === city.value
              ? 'border-(--color-primary)/50 bg-(--color-primary-soft)/30 text-(--color-primary)'
              : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-primary)/30'
          "
          @click="
            updateFilter(
              'city',
              modelValue.city === city.value ? 'all' : city.value,
            )
          "
        >
          <span>{{ city.label }}</span>
          <span class="text-[10px] font-medium opacity-60">
            {{ propertyCountByCity(city.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Type & Rating Filters (Grid Layout) -->
    <div class="mt-8 grid grid-cols-1 gap-8">
      <!-- Type Filter -->
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted) mb-4"
        >
          {{ t("home.search.type") }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in typeOptions.slice(1)"
            :key="type.value"
            type="button"
            class="rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200"
            :class="
              modelValue.type === type.value
                ? 'border-(--color-primary)/50 bg-(--color-primary-soft)/30 text-(--color-primary)'
                : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary)/30 hover:text-(--color-text)'
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
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted) mb-4"
        >
          {{ t("propertiesPage.filters.minimumRating") }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="rating in minimumRatings"
            :key="rating"
            type="button"
            class="rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200"
            :class="
              modelValue.minRating === rating
                ? 'border-(--color-primary)/50 bg-(--color-primary-soft)/30 text-(--color-primary)'
                : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary)/30 hover:text-(--color-text)'
            "
            @click="updateFilter('minRating', rating)"
          >
            {{ rating === 0 ? t("propertiesPage.filters.all") : `${rating}+` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Why Browse -->
    <div
      class="mt-8 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-5 text-white shadow-xl"
    >
      <p
        class="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200"
      >
        {{ t("propertiesPage.whyBrowse.title") }}
      </p>
      <ul class="mt-4 space-y-2.5 text-xs leading-relaxed text-blue-50">
        <li
          v-for="item in whyBrowseItems"
          :key="item"
          class="flex items-start gap-2"
        >
          <span class="opacity-50">•</span> {{ item }}
        </li>
      </ul>
    </div>

    <!-- Reset Button -->
    <AppButton
      variant="secondary"
      class="mt-8 w-full py-3 text-sm font-bold"
      @click="$emit('reset')"
    >
      {{ t("propertiesPage.actions.resetFilters") }}
    </AppButton>
  </div>
</template>

<style scoped>
.property-range {
  -webkit-appearance: none;
  height: 6px;
  background: var(--color-surface-soft);
  border-radius: 999px;
  cursor: pointer;
}

.property-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 4px solid var(--color-surface);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>
