<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    // Expected shape:
    // {
    //   priceRange: Number,
    //   selectedCapacity: String,
    //   selectedFacilities: Array,
    //   sortBy: String,
    // }
  },
});

const emit = defineEmits(["update:modelValue", "reset"]);

const updateFilter = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const toggleFacility = (facility) => {
  const current = props.modelValue.selectedFacilities;
  const updated = current.includes(facility)
    ? current.filter((f) => f !== facility)
    : [...current, facility];
  updateFilter("selectedFacilities", updated);
};

const capacityOptions = ["1 Guest", "2 Guests", "3 Guests", "4+ Guests"];

const facilityOptions = [
  "Free WiFi",
  "Air Conditioning",
  "Breakfast Included",
  "Smart TV",
  "Balcony",
  "Private Bathroom",
];
</script>

<template>
  <aside
    style="
      background-color: var(--color-surface);
      border-color: var(--color-border);
      box-shadow: var(--shadow-card);
      border-radius: var(--radius-md);
    "
    class="border p-5 space-y-6 sticky top-28 transition-colors duration-300"
  >
    <!-- Header -->
    <div
      style="border-color: var(--color-surface-soft)"
      class="flex items-center justify-between pb-3 border-b"
    >
      <h2
        style="color: var(--color-text)"
        class="text-xs font-bold uppercase tracking-wider"
      >
        Filters
      </h2>
      <button
        style="color: var(--color-muted)"
        class="text-[11px] hover:opacity-80 font-medium transition cursor-pointer"
        @click="$emit('reset')"
      >
        Reset All
      </button>
    </div>

    <!-- Price Range -->
    <div class="space-y-2">
      <label
        style="color: var(--color-muted)"
        class="block text-[11px] font-bold uppercase tracking-wider"
      >
        Max Nightly Budget
      </label>
      <div
        style="
          background-color: var(--color-surface-soft);
          border-color: var(--color-border);
        "
        class="rounded-xl p-3 border"
      >
        <div class="flex justify-between items-baseline mb-1">
          <span
            style="color: var(--color-muted)"
            class="text-[10px] font-medium"
            >$20</span
          >
          <span style="color: var(--color-primary)" class="text-base font-bold">
            ${{ modelValue.priceRange }}
          </span>
        </div>
        <input
          :value="modelValue.priceRange"
          @input="updateFilter('priceRange', Number($event.target.value))"
          type="range"
          min="20"
          max="250"
          style="accent-color: var(--color-primary-strong)"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none room-range"
        />
      </div>
    </div>

    <!-- Capacity -->
    <div class="space-y-2">
      <label
        style="color: var(--color-muted)"
        class="block text-[11px] font-bold uppercase tracking-wider"
      >
        Room Capacity
      </label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="cap in capacityOptions"
          :key="cap"
          type="button"
          :style="
            modelValue.selectedCapacity === cap
              ? {
                  backgroundColor: 'var(--color-primary-strong)',
                  color: 'var(--color-text-inverse)',
                  borderColor: 'transparent',
                }
              : {
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }
          "
          class="border rounded-lg py-2 text-center text-[11px] font-medium transition cursor-pointer"
          @click="updateFilter('selectedCapacity', cap)"
        >
          {{ cap }}
        </button>
      </div>
    </div>

    <!-- Facilities -->
    <div class="space-y-2">
      <label
        style="color: var(--color-muted)"
        class="block text-[11px] font-bold uppercase tracking-wider"
      >
        Facilities & Amenities
      </label>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="fac in facilityOptions"
          :key="fac"
          type="button"
          :style="
            modelValue.selectedFacilities.includes(fac)
              ? {
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                }
              : {
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-muted)',
                }
          "
          class="border rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition cursor-pointer"
          @click="toggleFacility(fac)"
        >
          {{ fac }}
        </button>
      </div>
    </div>
  </aside>
</template>
<style scoped>
.room-range {
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  outline: none;
  appearance: none;
}

.room-range::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.room-range::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -6px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.room-range::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.room-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
</style>
