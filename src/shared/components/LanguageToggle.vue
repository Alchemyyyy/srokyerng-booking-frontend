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
    class="relative inline-flex items-center w-[68px] h-9 rounded-full cursor-pointer transition-all duration-300 bg-(--color-surface-soft) border border-(--color-border) shadow-inner"
  >
    <!-- Faded background flag (inactive) -->
    <img
      :src="currentLocale === 'en' ? 'https://flagcdn.com/w80/kh.png' : 'https://flagcdn.com/w80/us.png'"
      alt="inactive"
      class="absolute w-7 h-7 rounded-full object-cover opacity-40 transition-all duration-300 pointer-events-none"
      :class="currentLocale === 'en' ? 'right-1.5' : 'left-1.5'"
    />

    <!-- Active sliding flag -->
    <span
      class="absolute w-8 h-8 rounded-full overflow-hidden shadow-md border-2 border-(--color-surface) transition-all duration-300 flex items-center justify-center bg-(--color-surface)"
      :class="currentLocale === 'en' ? 'left-0.5' : 'left-[34px]'"
    >
      <img
        :src="currentLocale === 'en' ? 'https://flagcdn.com/w80/us.png' : 'https://flagcdn.com/w80/kh.png'"
        :alt="currentLocale"
        class="w-full h-full object-cover rounded-full"
      />
    </span>
  </button>
</template>