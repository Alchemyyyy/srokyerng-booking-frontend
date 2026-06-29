<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/app/i18n";

const { locale } = useI18n();
const currentLocale = computed(() => locale.value);

const toggle = () => {
  setLocale(currentLocale.value === "en" ? "km" : "en");
};
</script>

<template>
  <button
    type="button"
    @click="toggle"
    :title="currentLocale === 'en' ? 'Switch to ខ្មែរ' : 'Switch to English'"
    class="h-10 w-10 rounded-full flex items-center justify-center border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) transition shadow-xs cursor-pointer active:scale-95 shrink-0 overflow-hidden"
  >
    <!-- Show US flag in English mode (indicating current state is English) -->
    <img
      v-if="currentLocale === 'en'"
      src="https://flagcdn.com/w80/us.png"
      alt="English (US)"
      class="h-6 w-6 rounded-full object-cover shadow-xs border border-(--color-border)/40"
    />
    <!-- Show KH flag in Khmer mode (indicating current state is Khmer) -->
    <img
      v-else
      src="https://flagcdn.com/w80/kh.png"
      alt="Khmer"
      class="h-6 w-6 rounded-full object-cover shadow-xs border border-(--color-border)/40"
    />
  </button>
</template>