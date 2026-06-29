<script setup>
import { computed, ref } from "vue";
import { getStoredTheme, setTheme } from "@/shared/services/themeStorage";

const themeState = ref(getStoredTheme());

const isDark = computed(() => {
  if (themeState.value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return themeState.value === "dark";
});

const toggleTheme = () => {
  const nextTheme = isDark.value ? "light" : "dark";
  themeState.value = nextTheme;
  setTheme(nextTheme);
  
  // Dispatch custom event to let components update instantly
  window.dispatchEvent(new Event("theme-changed"));
};
</script>

<template>
  <button
    type="button"
    @click="toggleTheme"
    class="h-10 w-10 rounded-full flex items-center justify-center border border-(--color-border) bg-(--color-surface) text-(--color-text) hover:bg-(--color-surface-soft) transition shadow-xs cursor-pointer active:scale-95 shrink-0"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Moon Icon (shown in dark mode, indicating current state is dark) -->
    <svg v-if="isDark" class="h-5 w-5 text-indigo-400 fill-current" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <!-- Sun Icon (shown in light mode, indicating current state is light) -->
    <svg v-else class="h-5 w-5 text-amber-500 fill-current" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  </button>
</template>
