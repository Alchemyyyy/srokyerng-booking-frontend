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
    class="w-full bg-(--color-surface)/95 backdrop-blur-xl border border-(--color-border) rounded-sm shadow-xl p-2.5 sm:p-3 relative z-40 transition-all duration-300"
    style="border-radius: var(--radius-sm);"
  >
    <div
      class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2.5 w-full"
    >
      <!-- 🔍 Destination Input Segment -->
      <div class="flex-1 min-w-0 group">
        <label
          class="block text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1 px-1"
        >
          {{ safeT("home.search.where", "Where to stay") }}
        </label>
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) group-focus-within:text-(--color-primary) transition-colors"
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
            class="w-full h-10 pl-9 pr-3 bg-(--color-surface-soft) border border-(--color-border)/50 rounded-sm text-xs font-medium text-(--color-text) placeholder-(--color-muted)/50 focus:outline-hidden focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)/10 transition-all"
            style="border-radius: var(--radius-sm);"
          />
        </div>
      </div>

      <!-- Desktop Visual Divider Line -->
      <div
        class="hidden lg:block w-px h-8 bg-(--color-border)/60 self-end mb-1"
      ></div>

      <!-- 📍 City Select Dropdown Segment -->
      <div class="w-full lg:w-52 shrink-0">
        <label
          class="block text-[9px] font-black uppercase tracking-wider text-(--color-muted) mb-1 px-1"
        >
          {{ safeT("home.search.city", "City / Province") }}
        </label>
        <div class="relative">
          <MapPinIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none"
          />
          <select
            v-model="localFilters.city"
            class="w-full h-10 pl-9 pr-8 bg-(--color-surface-soft) border border-(--color-border)/50 rounded-sm text-xs font-medium text-(--color-text) appearance-none focus:outline-hidden focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary-soft)/10 transition-all cursor-pointer"
            style="border-radius: var(--radius-sm);"
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
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-muted) text-[9px]"
          >
            ▼
          </div>
        </div>
      </div>

      <!-- ⚡ Action Trigger Area -->
      <div class="shrink-0 self-end flex items-center h-10 pt-0.5">
        <button
          v-if="activeFilterCount > 0"
          type="button"
          @click="emit('reset')"
          class="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-sm border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full lg:w-auto"
          style="border-radius: var(--radius-sm);"
        >
          <XMarkIcon class="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
        <button
          v-else
          type="button"
          disabled
          class="w-full lg:w-10 h-10 inline-flex items-center justify-center text-white bg-(--color-primary-strong) hover:bg-(--color-primary) rounded-sm transition-all duration-200 shadow-xs"
          style="border-radius: var(--radius-sm);"
        >
          <MagnifyingGlassIcon class="w-4.5 h-4.5 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
