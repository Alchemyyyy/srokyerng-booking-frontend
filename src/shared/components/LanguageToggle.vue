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
    class="relative inline-flex items-center w-20 h-10 rounded-full cursor-pointer transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner"
  >
    <!-- Faded background flag (inactive) -->
    <img
      :src="currentLocale === 'en' ? 'https://flagcdn.com/w80/kh.png' : 'https://flagcdn.com/w80/us.png'"
      alt="inactive"
      class="absolute w-7 h-7 rounded-full object-cover opacity-30 transition-all duration-300"
      :class="currentLocale === 'en' ? 'right-1.5' : 'left-1.5'"
    />

    <!-- Active sliding flag -->
    <span
      class="absolute w-9 h-9 rounded-full overflow-hidden shadow-lg border-2 border-white transition-all duration-300 ring-2 ring-white/40"
      :class="currentLocale === 'en' ? 'left-0.5' : 'left-10'"
    >
      <img
        :src="currentLocale === 'en' ? 'https://flagcdn.com/w80/us.png' : 'https://flagcdn.com/w80/kh.png'"
        :alt="currentLocale"
        class="w-full h-full object-cover"
      />
    </span>
  </button>
</template>