<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const { t, te } = useI18n({ useScope: "global" });

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  cityOptions: {
    type: Array,
    required: true,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue", "reset"]);

const localFilters = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
</script>

<template>
  <div
    class="w-full bg-(--color-surface) border border-(--color-border)/80 rounded-[32px] shadow-xl p-4 lg:p-5 relative z-40"
  >
    <div
      class="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-2 w-full"
    >
      <!-- 🔍 Destination Input Segment -->
      <div class="flex-1 min-w-0 group">
        <label
          class="block text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-1 px-1"
        >
          {{ safeT("home.search.where", "Where to stay") }}
        </label>
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-muted) group-focus-within:text-(--color-primary) transition-colors"
          />
          <input
            v-model="localFilters.query"
            type="text"
            :placeholder="
              safeT(
                'home.search.placeholder',
                'Search properties, locations...',
              )
            "
            class="w-full h-12 pl-12 pr-4 bg-(--color-surface-soft) border border-(--color-border)/50 rounded-2xl text-sm font-medium text-(--color-text) placeholder-(--color-muted)/50 focus:outline-hidden focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)/10 transition-all"
          />
        </div>
      </div>

      <!-- Desktop Visual Divider Line -->
      <div
        class="hidden lg:block w-px h-10 bg-(--color-border)/60 self-end mb-1"
      ></div>

      <!-- 📍 City Select Dropdown Segment -->
      <div class="w-full lg:w-60 shrink-0">
        <label
          class="block text-[10px] font-black uppercase tracking-wider text-(--color-muted) mb-1 px-1"
        >
          {{ safeT("home.search.city", "City / Province") }}
        </label>
        <div class="relative">
          <MapPinIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-muted) pointer-events-none"
          />
          <select
            v-model="localFilters.city"
            class="w-full h-12 pl-12 pr-10 bg-(--color-surface-soft) border border-(--color-border)/50 rounded-2xl text-sm font-medium text-(--color-text) appearance-none focus:outline-hidden focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)/10 transition-all cursor-pointer"
          >
            <option
              v-for="opt in cityOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-muted) text-[10px]"
          >
            ▼
          </div>
        </div>
      </div>

      <!-- ⚡ Action Trigger Area -->
      <div class="shrink-0 self-end flex items-center h-12 pt-1">
        <button
          v-if="activeFilterCount > 0"
          type="button"
          @click="emit('reset')"
          class="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full lg:w-auto"
        >
          <XMarkIcon class="w-4 h-4" />
          <span>Clear</span>
        </button>
        <button
          v-else
          type="button"
          disabled
          class="w-full lg:w-12 h-12 inline-flex items-center justify-center text-white bg-(--color-primary-strong) hover:bg-(--color-primary) rounded-2xl transition-all duration-200 shadow-xs"
        >
          <MagnifyingGlassIcon class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
