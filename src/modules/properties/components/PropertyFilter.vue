<script setup>
import { computed } from "vue";
import AppButton from "@/shared/components/AppButton.vue";
import { useI18n } from "vue-i18n";
import { currentCurrency } from "@/shared/utils/currency";
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  HomeIcon,
  BuildingOfficeIcon,
  SunIcon,
  SparklesIcon,
  WifiIcon,
  TruckIcon,
  XMarkIcon
} from "@heroicons/vue/24/outline";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: { type: Object, required: true },
  activeFilterCount: { type: Number, default: 0 },
  cityOptions: { type: Array, required: true },
  propertyTypes: { type: Array, default: () => [] },
  minimumRatings: { type: Array, required: true },
  propertyCountByCity: { type: Function, required: true },
});

const emit = defineEmits(["update:modelValue", "reset", "close"]);

const updateFilter = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const currencySymbol = computed(() => (currentCurrency.value === "KHR" ? "៛" : "$"));

// --- Dual Price Slider Logic ---
const minLimit = 10;
const maxLimit = 500;

const minPercent = computed(() => {
  return ((props.modelValue.minPrice - minLimit) / (maxLimit - minLimit)) * 100;
});

const maxPercent = computed(() => {
  return ((props.modelValue.maxPrice - minLimit) / (maxLimit - minLimit)) * 100;
});

const onMinInput = (e) => {
  const val = Number(e.target.value);
  if (val <= props.modelValue.maxPrice - 10) {
    updateFilter("minPrice", val);
  }
};

const onMaxInput = (e) => {
  const val = Number(e.target.value);
  if (val >= props.modelValue.minPrice + 10) {
    updateFilter("maxPrice", val);
  }
};

// --- Amenities & Types ---
// Icons are cosmetic-only and keyed by category name; any category from the
// database without a specific icon here just falls back to HomeIcon.
const typeIcons = {
  all: HomeIcon,
  hotel: BuildingOfficeIcon,
  villa: SunIcon,
  resort: SparklesIcon,
  apartment: BuildingOfficeIcon,
  guesthouse: HomeIcon,
  homestay: HomeIcon,
  hostel: HomeIcon,
};

const propertyTypes = computed(() =>
  props.propertyTypes.map((type) => ({
    ...type,
    icon: typeIcons[type.value] || HomeIcon,
  })),
);

const amenitiesList = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "pool", label: "Pool" },
  { value: "parking", label: "Parking" },
  { value: "kitchen", label: "Kitchen" },
  { value: "ac", label: "A/C" },
];

const toggleAmenity = (amenity) => {
  const current = props.modelValue.amenities || [];
  const newAmenities = current.includes(amenity)
    ? current.filter(a => a !== amenity)
    : [...current, amenity];
  updateFilter("amenities", newAmenities);
};

// --- Date Validation ---
const minCheckIn = computed(() => {
  const today = new Date();
  // Adjust for local timezone offset
  const offset = today.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];
  return localISOTime;
});

const minCheckOut = computed(() => {
  if (props.modelValue.checkIn) {
    const checkInDate = new Date(props.modelValue.checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    const offset = checkInDate.getTimezoneOffset() * 60000;
    return (new Date(checkInDate - offset)).toISOString().split('T')[0];
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const offset = tomorrow.getTimezoneOffset() * 60000;
  return (new Date(tomorrow - offset)).toISOString().split('T')[0];
});

const handleCheckInChange = (e) => {
  const val = e.target.value;
  updateFilter('checkIn', val);
  
  if (props.modelValue.checkOut && val >= props.modelValue.checkOut) {
    const newCheckOut = new Date(val);
    newCheckOut.setDate(newCheckOut.getDate() + 1);
    const offset = newCheckOut.getTimezoneOffset() * 60000;
    updateFilter('checkOut', (new Date(newCheckOut - offset)).toISOString().split('T')[0]);
  }
};
</script>

<template>
  <div
    class="properties-panel rounded-sm lg:border border-(--color-border) bg-(--color-surface) p-5 lg:shadow-xs transition-all duration-300 text-xs w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible"
    style="border-radius: var(--radius-sm);"
  >
    <!-- ── Balanced Modern Header ── -->
    <div class="flex items-center justify-between border-b border-(--color-border)/60 pb-3.5 mb-5 sticky top-0 bg-(--color-surface) z-10">
      <div class="flex items-center gap-2">
        <button class="lg:hidden p-1 -ml-1 mr-1 active:scale-95" @click="$emit('close')">
          <XMarkIcon class="w-5 h-5 text-(--color-text)" />
        </button>
        <AdjustmentsHorizontalIcon class="h-5 w-5 text-(--color-primary) hidden lg:block" />
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

    <!-- ── Property Category ── -->
    <div class="border-b border-(--color-border)/60 pb-5 mb-5">
      <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-3">
        <HomeIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        Property Type
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="type in propertyTypes"
          :key="type.value"
          type="button"
          class="flex flex-col items-center justify-center gap-1.5 rounded-sm border p-2.5 transition-all duration-200 active:scale-[0.98]"
          style="border-radius: var(--radius-sm);"
          :class="
            modelValue.type === type.value
              ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary) font-bold ring-1 ring-(--color-primary)/20'
              : 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-border) hover:text-(--color-text) hover:bg-(--color-surface)'
          "
          @click="updateFilter('type', type.value)"
        >
          <component :is="type.icon" class="w-5 h-5" />
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ type.label }}</span>
        </button>
      </div>
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
            @input="handleCheckInChange"
            :min="minCheckIn"
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
            :min="minCheckOut"
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

    <!-- ── Dual-Thumb Price Range Filter ── -->
    <div class="border-b border-(--color-border)/60 pb-5 mb-5">
      <div class="flex items-center justify-between mb-4">
        <label class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted)">
          <CurrencyDollarIcon class="h-3.5 w-3.5 text-(--color-primary)" />
          Price Range / Night
        </label>
      </div>
      
      <!-- Dual Input Boxes -->
      <div class="flex items-center gap-3 mb-5">
        <div class="flex-1 rounded-sm border border-(--color-border)/60 bg-(--color-surface-soft) px-2.5 py-1.5" style="border-radius: var(--radius-sm);">
          <span class="text-[9px] font-black uppercase text-(--color-muted)">Min</span>
          <div class="flex items-center text-xs font-bold text-(--color-text)">
            <span class="mr-0.5">{{ currencySymbol }}</span>
            <input type="number" :value="modelValue.minPrice" @change="onMinInput" class="w-full bg-transparent border-none p-0 outline-none focus:ring-0" />
          </div>
        </div>
        <div class="h-px w-4 bg-(--color-border)"></div>
        <div class="flex-1 rounded-sm border border-(--color-border)/60 bg-(--color-surface-soft) px-2.5 py-1.5" style="border-radius: var(--radius-sm);">
          <span class="text-[9px] font-black uppercase text-(--color-muted)">Max</span>
          <div class="flex items-center text-xs font-bold text-(--color-text)">
            <span class="mr-0.5">{{ currencySymbol }}</span>
            <input type="number" :value="modelValue.maxPrice" @change="onMaxInput" class="w-full bg-transparent border-none p-0 outline-none focus:ring-0" />
          </div>
        </div>
      </div>

      <!-- Dual Slider Track -->
      <div class="relative h-1.5 w-full bg-(--color-border)/40 rounded-full mt-2 mb-2">
        <div class="absolute h-full bg-(--color-primary) rounded-full" :style="{ left: minPercent + '%', right: (100 - maxPercent) + '%' }"></div>
        
        <input
          :value="modelValue.minPrice"
          @input="onMinInput"
          type="range"
          :min="minLimit"
          :max="maxLimit"
          step="5"
          class="dual-range-slider absolute w-full -top-1.5 h-1.5 appearance-none bg-transparent pointer-events-none z-10"
        />
        
        <input
          :value="modelValue.maxPrice"
          @input="onMaxInput"
          type="range"
          :min="minLimit"
          :max="maxLimit"
          step="5"
          class="dual-range-slider absolute w-full -top-1.5 h-1.5 appearance-none bg-transparent pointer-events-none z-20"
        />
      </div>
    </div>

    <!-- ── Amenities Filter ── -->
    <div class="border-b border-(--color-border)/60 pb-5 mb-5">
      <p class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-3">
        <SparklesIcon class="h-3.5 w-3.5 text-(--color-primary)" />
        Popular Amenities
      </p>
      <div class="grid grid-cols-2 gap-2">
        <label
          v-for="amenity in amenitiesList"
          :key="amenity.value"
          class="flex items-center gap-2 cursor-pointer group"
        >
          <div class="relative flex items-center justify-center w-4 h-4 rounded-sm border transition-all duration-200"
               :class="(modelValue.amenities || []).includes(amenity.value) ? 'bg-(--color-primary) border-(--color-primary)' : 'bg-(--color-surface-soft) border-(--color-border)/80 group-hover:border-(--color-primary)/50'">
            <input type="checkbox" :checked="(modelValue.amenities || []).includes(amenity.value)" @change="toggleAmenity(amenity.value)" class="absolute opacity-0 w-0 h-0" />
            <svg v-if="(modelValue.amenities || []).includes(amenity.value)" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-[11px] font-medium text-(--color-text) group-hover:text-(--color-primary) transition-colors">{{ amenity.label }}</span>
        </label>
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
      class="mt-6 w-full py-3 lg:py-2 text-xs font-bold !rounded-sm transition-all duration-200 active:scale-[0.98]"
      @click="$emit('reset')"
    >
      {{ t("propertiesPage.actions.resetFilters", "Reset All Filters") }}
    </AppButton>
  </div>
</template>

<style scoped>
/* Dual Slider Styles */
.dual-range-slider::-webkit-slider-thumb {
  pointer-events: auto;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease;
  cursor: grab;
}

.dual-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.dual-range-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}
</style>
