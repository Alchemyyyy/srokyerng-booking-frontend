<script setup>
import { ref } from "vue";

import { getStoredTheme, setTheme } from "@/shared/services/themeStorage";

const currentTheme = ref(getStoredTheme());

const options = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const updateTheme = (theme) => {
  currentTheme.value = theme;
  setTheme(theme);
};
</script>

<template>
  <div
    class="inline-flex rounded-lg border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-card)"
    aria-label="Theme switcher"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[
        'rounded-md px-3 py-1.5 text-sm font-semibold transition',
        currentTheme === option.value
          ? 'bg-(--color-primary) text-white'
          : 'text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)',
      ]"
      @click="updateTheme(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
