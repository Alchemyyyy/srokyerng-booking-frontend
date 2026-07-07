<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/shared/utils/currency";

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

const capacityOptions = computed(() => [
  { value: "1", label: t("components.roomFilter.capacity.oneGuest") },
  { value: "2", label: t("components.roomFilter.capacity.twoGuests") },
  { value: "3", label: t("components.roomFilter.capacity.threeGuests") },
  { value: "4+", label: t("components.roomFilter.capacity.fourPlusGuests") },
]);

const facilityOptions = computed(() => [
  { value: "wifi", label: t("components.roomFilter.facilities.wifi") },
  { value: "ac", label: t("components.roomFilter.facilities.ac") },
  { value: "breakfast", label: t("components.roomFilter.facilities.breakfast") },
  { value: "smartTv", label: t("components.roomFilter.facilities.smartTv") },
  { value: "balcony", label: t("components.roomFilter.facilities.balcony") },
  { value: "privateBathroom", label: t("components.roomFilter.facilities.privateBathroom") },
]);
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
        {{ t("components.roomFilter.filters") }}
      </h2>
      <button
        style="color: var(--color-muted)"
        class="text-[11px] hover:opacity-80 font-medium transition cursor-pointer"
        @click="$emit('reset')"
      >
        {{ t("components.roomFilter.resetAll") }}
      </button>
    </div>

    <!-- Price Range -->
    <div class="space-y-2">
      <label
        style="color: var(--color-muted)"
        class="block text-[11px] font-bold uppercase tracking-wider"
      >
        {{ t("components.roomFilter.maxNightlyBudget") }}
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
            >{{ formatPrice(0) }}</span
          >
          <span style="color: var(--color-primary)" class="text-base font-bold">
            {{ formatPrice(modelValue.priceRange) }}
          </span>
        </div>
        <input
          :value="modelValue.priceRange"
          @input="updateFilter('priceRange', Number($event.target.value))"
          type="range"
          min="0"
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
        {{ t("components.roomFilter.roomCapacity") }}
      </label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="cap in capacityOptions"
          :key="cap.value"
          type="button"
          :style="
            modelValue.selectedCapacity === cap.value
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
          @click="updateFilter('selectedCapacity', cap.value)"
        >
          {{ cap.label }}
        </button>
      </div>
    </div>

    <!-- Facilities -->
    <div class="space-y-2">
      <label
        style="color: var(--color-muted)"
        class="block text-[11px] font-bold uppercase tracking-wider"
      >
        {{ t("components.roomFilter.facilitiesAmenities") }}
      </label>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="fac in facilityOptions"
          :key="fac.value"
          type="button"
          :style="
            modelValue.selectedFacilities.includes(fac.value)
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
          @click="toggleFacility(fac.value)"
        >
          {{ fac.label }}
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
