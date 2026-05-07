<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { setLocale } from "@/app/i18n";

const { locale } = useI18n();

const options = [
  { value: "en", label: "EN" },
  { value: "km", label: "ខ្មែរ" },
];

const currentLocale = computed(() => locale.value);
</script>

<template>
  <div
    class="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-card)"
    aria-label="Language switcher"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[
        'rounded-full px-3 py-1.5 text-sm font-semibold transition',
        currentLocale === option.value
          ? 'bg-(--color-primary) text-white'
          : 'text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)',
      ]"
      @click="setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
