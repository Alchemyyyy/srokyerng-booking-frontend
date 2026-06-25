<script setup>
import AppButton from "@/shared/components/AppButton.vue";
import { useI18n } from "vue-i18n";
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: { type: Object, required: true },
  activeFilterCount: { type: Number, default: 0 },
  cityOptions: { type: Array, required: true },
  minimumRatings: { type: Array, required: true },
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
    class="properties-panel rounded-sm border border-(--color-border) bg-(--color-surface) p-5 shadow-xs transition-all duration-300 text-xs"
    style="border-radius: var(--radius-sm);"
  >
    <!-- ── Balanced Modern Header ── -->
    <div class="flex items-center justify-between border-b border-(--color-border)/60 pb-3.5 mb-5">
      <div class="flex items-center gap-2">
        <AdjustmentsHorizontalIcon class="h-5 w-5 text-(--color-primary)" />
        <h2 class="text-base font-bold text-(--color-text) tracking-tight">
          {{ t("propertiesPage.filters.title", "Filters") }}
        </h2>
        <span
          v-if="activeFilterCount > 0"
          class="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-(--color-primary-soft) text-[11px] font-black text-(--color-primary) border border-(--color-primary)/20"
          style="border-radius: var(--radius-sm);"
        >
          {{ activeFilterCount }}
        </span>
      </div>
      <button
        v-if="activeFilterCount > 0"
        type="button"
        class="text-xs font-bold text-(--color-primary) hover:underline transition active:scale-95"
        @click="$emit('reset')"
      >
        {{ t("common.clearAll", "Clear all") }}
      </button>
    </div>

    <!-- ── Balanced Dates & Guests Section ── -->
    <div class="space-y-3.5 border-b border-(--color-border)/60 pb-5 mb-5">
      <div class="grid grid-cols-2 gap-2.5">
        <label class="block rounded-sm border border-(--color-border)/60 bg-(--color-surface-soft) px-2.5 py-1.5 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-border)" style="border-radius: var(--radius-sm);">
          <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)">
            <CalendarDaysIcon class="h-3.5 w-3.5 text-(--color-primary)" />
            Check in
          </span>
          <input
            :value="modelValue.checkIn"
            @input="updateFilter('checkIn', $event.target.value)"
            type="date"
            class="mt-1 w-full border-none bg-transparent p-0 text-xs font-bold text-(--color-text) outline-none focus:ring-0 cursor-pointer"
          />
        </label>
        <label class="block rounded-sm border border-(--color-border)/60 bg-(--color-surface-soft) px-2.5 py-1.5 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-border)" style="border-radius: var(--radius-sm);">
          <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)">
            <CalendarDaysIcon class="h-3.5 w-3.5 text-(--color-primary)" />
            Check out
          </span>
          <input
            :value="modelValue.checkOut"
            @input="updateFilter('checkOut', $event.target.value)"
            type="date"
            class="mt-1 w-full border-none bg-transparent p-0 text-xs font-bold text-(--color-text) outline-none focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      <label class="block rounded-sm border border-(--color-border)/60 bg-(--color-surface-soft) px-2.5 py-1.5 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-border)" style="border-radius: var(--radius-sm);">
        <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)">
          <UserGroupIcon class="h-3.5 w-3.5 text-(--color-primary)" />
          Guests
        </span>
        <input
          :value="modelValue.guests"
          @input="updateFilter('guests', Number($event.target.value))"
          type="number"
          min="1"
          max="20"
          class="mt-1 w-full border-none bg-transparent p-0 text-xs font-bold text-(--color-text) outline-none focus:ring-0"
        />
      </label>
    </div>

    <!-- ── Balanced Destination City Chips ── -->
    <div class="border-b border-(--color-border)/60 pb-5 mb-5">
      <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-2.5">
        <MapPinIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        {{ t("home.search.city", "Destination City") }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="city in cityOptions.slice(1)"
          :key="city.value"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
          style="border-radius: var(--radius-sm);"
          :class="
            modelValue.city === city.value
              ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary) font-bold shadow-xs ring-1 ring-(--color-primary)/20'
              : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-border) hover:bg-(--color-surface)'
          "
          @click="
            updateFilter(
              'city',
              modelValue.city === city.value ? 'all' : city.value,
            )
          "
        >
          <span>{{ city.label }}</span>
          <span
            class="flex items-center justify-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold border"
            style="border-radius: var(--radius-sm);"
            :class="
              modelValue.city === city.value
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'bg-(--color-surface) text-(--color-muted) border-(--color-border)/60'
            "
          >
            {{ propertyCountByCity(city.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Balanced Price Range Filter ── -->
    <div class="border-b border-(--color-border)/60 pb-5 mb-5">
      <div class="flex items-center justify-between mb-2.5">
        <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted)">
          <CurrencyDollarIcon class="h-3.5 w-3.5 text-(--color-primary)" />
          {{ t("propertiesPage.filters.maxPricePerNight", "Max Price / Night") }}
        </label>
        <span class="text-(--color-primary) font-black text-xs">{{ formatPrice(modelValue.maxPrice) }}</span>
      </div>
      <input
        :value="modelValue.maxPrice"
        @input="updateFilter('maxPrice', Number($event.target.value))"
        type="range"
        min="30"
        max="220"
        step="5"
        class="property-range w-full"
      />
      <div class="flex items-center justify-between text-[10px] font-bold text-(--color-muted) mt-1.5">
        <span>{{ formatPrice(30) }}</span>
        <span>{{ formatPrice(220) }}</span>
      </div>
    </div>

    <!-- ── Balanced Minimum Rating Filter ── -->
    <div>
      <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-2.5">
        <StarIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        {{ t("propertiesPage.filters.minimumRating", "Minimum Rating") }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="rating in minimumRatings"
          :key="rating"
          type="button"
          class="rounded-sm border px-2.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-[0.97]"
          style="border-radius: var(--radius-sm);"
          :class="
            modelValue.minRating === rating
              ? 'border-(--color-primary) bg-(--color-primary) text-white shadow-xs ring-1 ring-(--color-primary)/30'
              : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-border) hover:text-(--color-text) hover:bg-(--color-surface)'
          "
          @click="updateFilter('minRating', rating)"
        >
          {{ rating === 0 ? t("propertiesPage.filters.all", "All") : `${rating}+ ⭐` }}
        </button>
      </div>
    </div>

    <!-- ── Balanced Reset Button ── -->
    <AppButton
      variant="secondary"
      class="mt-6 w-full py-2 text-xs font-bold !rounded-sm transition-all duration-200 active:scale-[0.98]"
      @click="$emit('reset')"
    >
      {{ t("propertiesPage.actions.resetFilters", "Reset All Filters") }}
    </AppButton>
  </div>
</template>

<style scoped>
.property-range {
  -webkit-appearance: none;
  height: 6px;
  background: var(--color-surface-soft);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.property-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: 1px solid var(--color-surface);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.property-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
</style>
