<script setup>
import AppButton from "@/shared/components/AppButton.vue";
import { useI18n } from "vue-i18n";
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  SparklesIcon,
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
    class="properties-panel rounded-[20px] border border-(--color-border)/80 bg-(--color-surface)/95 p-4 backdrop-blur-2xl transition-all duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 border-b border-(--color-border)/40 pb-4">
      <div>
        <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-(--color-primary)">
          <SparklesIcon class="h-3.5 w-3.5 animate-pulse text-(--color-accent)" />
          {{ t("propertiesPage.filters.title") }}
        </p>
        <h2 class="mt-1 text-lg font-black text-(--color-text)">
          {{ t("propertiesPage.filters.refineTrip") }}
        </h2>
      </div>
      <span
        class="flex items-center justify-center w-8 h-8 rounded-full bg-(--color-primary-soft) text-xs font-bold text-(--color-primary) shadow-sm ring-1 ring-(--color-primary)/20"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Dates & Guests Section (New Upgrade) -->
    <div class="mt-4 space-y-3 border-b border-(--color-border)/40 pb-4">
      <div class="grid grid-cols-2 gap-3">
        <label class="block rounded-[var(--radius-lg)] border border-(--color-border)/60 bg-(--color-surface-soft) p-3 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-primary)/40">
          <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-primary)">
            <CalendarDaysIcon class="h-3.5 w-3.5" />
            Check in
          </span>
          <input
            :value="modelValue.checkIn"
            @input="updateFilter('checkIn', $event.target.value)"
            type="date"
            class="mt-1.5 w-full border-none bg-transparent p-0 text-xs font-bold text-(--color-text) outline-none focus:ring-0"
          />
        </label>
        <label class="block rounded-[var(--radius-lg)] border border-(--color-border)/60 bg-(--color-surface-soft) p-3 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-primary)/40">
          <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-primary)">
            <CalendarDaysIcon class="h-3.5 w-3.5" />
            Check out
          </span>
          <input
            :value="modelValue.checkOut"
            @input="updateFilter('checkOut', $event.target.value)"
            type="date"
            class="mt-1.5 w-full border-none bg-transparent p-0 text-xs font-bold text-(--color-text) outline-none focus:ring-0"
          />
        </label>
      </div>

      <label class="block rounded-[var(--radius-lg)] border border-(--color-border)/60 bg-(--color-surface-soft) p-3 transition-all duration-200 focus-within:border-(--color-primary) focus-within:ring-1 focus-within:ring-(--color-primary)/20 hover:border-(--color-primary)/40">
        <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-primary)">
          <UserGroupIcon class="h-3.5 w-3.5" />
          Guests
        </span>
        <input
          :value="modelValue.guests"
          @input="updateFilter('guests', Number($event.target.value))"
          type="number"
          min="1"
          max="20"
          class="mt-1.5 w-full border-none bg-transparent p-0 text-sm font-bold text-(--color-text) outline-none focus:ring-0"
        />
      </label>
    </div>

    <!-- City Filter (Scrollable Upgrade) -->
    <div class="mt-4 border-b border-(--color-border)/40 pb-4">
      <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted) mb-3">
        <MapPinIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        {{ t("home.search.city") }}
      </p>
      <div class="custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-2">
        <button
          v-for="city in cityOptions.slice(1)"
          :key="city.value"
          type="button"
          class="flex w-full items-center justify-between rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
          :class="
            modelValue.city === city.value
              ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary) shadow-sm ring-1 ring-(--color-primary)/20'
              : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-primary)/40 hover:shadow-xs'
          "
          @click="
            updateFilter(
              'city',
              modelValue.city === city.value ? 'all' : city.value,
            )
          "
        >
          <span class="truncate pr-2">{{ city.label }}</span>
          <span
            class="flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold"
            :class="
              modelValue.city === city.value
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-border)/30 text-(--color-muted)'
            "
          >
            {{ propertyCountByCity(city.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Price Range -->
    <div class="mt-4 border-b border-(--color-border)/40 pb-4">
      <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted)">
        <CurrencyDollarIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        {{ t("propertiesPage.filters.maxPricePerNight") }}
      </label>
      <div class="mt-3 flex items-center justify-between rounded-[var(--radius-md)] border border-(--color-border)/50 bg-(--color-surface-soft) px-3 py-2 text-sm font-bold text-(--color-text)">
        <span class="text-(--color-muted)">{{ formatPrice(0) }}</span>
        <span class="text-(--color-primary) font-black text-base">{{ formatPrice(modelValue.maxPrice) }}</span>
      </div>
      <input
        :value="modelValue.maxPrice"
        @input="updateFilter('maxPrice', Number($event.target.value))"
        type="range"
        min="30"
        max="220"
        step="5"
        class="property-range mt-4 w-full"
      />
    </div>

    <!-- Rating Filter -->
    <div class="mt-4">
      <!-- Rating Filter -->
      <div>
        <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-(--color-muted) mb-3">
          <StarIcon class="h-3.5 w-3.5 text-(--color-primary)" />
          {{ t("propertiesPage.filters.minimumRating") }}
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="rating in minimumRatings"
            :key="rating"
            type="button"
            class="rounded-full border px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.97]"
            :class="
              modelValue.minRating === rating
                ? 'border-(--color-primary) bg-(--color-primary) text-white shadow-md shadow-(--color-primary)/20 ring-2 ring-(--color-primary)/30'
                : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary)/40 hover:text-(--color-text) hover:bg-(--color-surface)'
            "
            @click="updateFilter('minRating', rating)"
          >
            {{ rating === 0 ? t("propertiesPage.filters.all") : `${rating}+ ⭐` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Button -->
    <AppButton
      variant="secondary"
      class="mt-5 w-full py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]"
      @click="$emit('reset')"
    >
      {{ t("propertiesPage.actions.resetFilters") }}
    </AppButton>
  </div>
</template>

<style scoped>
.property-range {
  -webkit-appearance: none;
  height: 8px;
  background: var(--color-surface-soft);
  border-radius: 999px;
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.property-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 4px solid var(--color-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}

.property-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

/* Custom Scrollbar for City List */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-surface-soft);
  border-radius: 999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 999px;
  border: 2px solid var(--color-surface-soft);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
