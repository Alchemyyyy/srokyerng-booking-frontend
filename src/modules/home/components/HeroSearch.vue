<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import AppButton from "@/shared/components/AppButton.vue";
import HeroImg from "@/assets/images/home/hero/hero_banner.png";
import { propertyApi } from "@/modules/properties/api/property.api";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

const searchForm = ref({
  city: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
});

const handleSearch = () => {
  router.push({
    name: "public.properties",
    query: {
      city: searchForm.value.city,
      checkIn: searchForm.value.checkIn,
      checkOut: searchForm.value.checkOut,
      guests: searchForm.value.guests,
    },
  });
};

const today = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const minCheckOutDate = computed(() => {
  return searchForm.value.checkIn ? searchForm.value.checkIn : today.value;
});

const cities = ref([]);

onMounted(async () => {
  try {
    const res = await propertyApi.getCities();
    const fetchedCities = Array.isArray(res) ? res : (res?.data ?? []);
    if (fetchedCities.length > 0) {
      cities.value = fetchedCities.map(c => c.name || c.city_name || c);
    } else {
      cities.value = [
        t("home.cities.phnomPenh"),
        t("home.cities.siemReap"),
        t("home.cities.sihanoukville"),
        t("home.cities.battambang"),
        t("home.cities.kampot"),
      ];
    }
  } catch (error) {
    console.error("Failed to load cities", error);
    cities.value = [
      t("home.cities.phnomPenh"),
      t("home.cities.siemReap"),
      t("home.cities.sihanoukville"),
      t("home.cities.battambang"),
      t("home.cities.kampot"),
    ];
  }
});
</script>

<template>
  <section
    class="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 pb-24 pt-36 sm:px-6 lg:px-8"
  >
    <!-- Background image and overlay -->
    <div class="absolute inset-0 z-0">
      <img
        :src="HeroImg"
        alt="Cambodian Resort"
        class="h-full w-full object-cover scale-105"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70"
      ></div>
    </div>

    <!-- Centered content wrapper -->
    <div class="relative z-10 mx-auto w-full max-w-5xl flex flex-col items-center text-center space-y-12 animate-fadeIn">
      
      <!-- Eyebrow text -->
      <div class="space-y-6">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20 backdrop-blur-md"
          :class="{ 'font-kantumruy': locale === 'km' }"
        >
          <SparklesIcon class="h-4.5 w-4.5 text-(--color-primary)" />
          {{ t("home.hero.eyebrow") }}
        </span>

        <!-- Centered title -->
        <h1
          class="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-xl tracking-tight leading-[1.1]"
          :class="{ 'font-kantumruy leading-[1.3]': locale === 'km' }"
        >
          {{ t("home.hero.title") }}
          <span class="text-(--color-primary)">
            {{ t("home.hero.titleHighlight") }}
          </span>
        </h1>

        <!-- Centered subtitle -->
        <p
          class="mx-auto max-w-2xl text-base sm:text-lg text-white/90 drop-shadow-md leading-relaxed"
          :class="locale === 'km' ? 'font-kantumruy' : 'font-semibold'"
        >
          {{ t("home.hero.subtitle") }}
        </p>

        <!-- "I'm flexible" CTA button -->
        <button
          type="button"
          @click="handleSearch"
          class="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-black cursor-pointer text-(--color-primary) border-none"
        >
          <span class="bg-gradient-to-r from-(--color-primary) to-(--color-primary-strong) bg-clip-text text-transparent">
            I'm flexible
          </span>
        </button>
      </div>

      <!-- Airbnb-style Pill Search Bar Dock -->
      <div class="w-full max-w-[850px] bg-(--color-surface) rounded-[32px] md:rounded-full border border-(--color-border) p-2 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-(--color-border)/60 transition-all duration-300 hover:border-(--color-primary)/45 hover:shadow-2xl">
        
        <!-- Segment 1: Where -->
        <div class="flex-1 text-left px-5 py-3 md:py-2.5 rounded-3xl md:rounded-full hover:bg-(--color-primary-soft) transition-colors cursor-pointer group flex items-center gap-3">
          <MapPinIcon class="h-5 w-5 text-(--color-primary) shrink-0 transition-colors" />
          <div class="flex-1 min-w-0">
            <span class="block text-[9px] uppercase tracking-wider font-extrabold text-(--color-primary) mb-0.5">Where</span>
            <select
              v-model="searchForm.city"
              class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              <option value="">All destinations</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>
        </div>

        <!-- Segment 2: Check-in -->
        <div class="flex-1 text-left px-5 py-3 md:py-2.5 rounded-3xl md:rounded-full hover:bg-(--color-primary-soft) transition-colors cursor-pointer group flex items-center gap-3">
          <CalendarDaysIcon class="h-5 w-5 text-(--color-primary) shrink-0 transition-colors" />
          <div class="flex-1 min-w-0">
            <span class="block text-[9px] uppercase tracking-wider font-extrabold text-(--color-primary) mb-0.5">Check in</span>
            <input
              v-model="searchForm.checkIn"
              type="date"
              :min="today"
              class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>

        <!-- Segment 3: Check-out -->
        <div class="flex-1 text-left px-5 py-3 md:py-2.5 rounded-3xl md:rounded-full hover:bg-(--color-primary-soft) transition-colors cursor-pointer group flex items-center gap-3">
          <CalendarDaysIcon class="h-5 w-5 text-(--color-primary) shrink-0 transition-colors" />
          <div class="flex-1 min-w-0">
            <span class="block text-[9px] uppercase tracking-wider font-extrabold text-(--color-primary) mb-0.5">Check out</span>
            <input
              v-model="searchForm.checkOut"
              type="date"
              :min="minCheckOutDate"
              class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>

        <!-- Segment 4: Who -->
        <div class="flex-1 text-left px-5 py-3 md:py-2.5 rounded-3xl md:rounded-full hover:bg-(--color-primary-soft) transition-colors cursor-pointer group flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <UserGroupIcon class="h-5 w-5 text-(--color-primary) shrink-0 transition-colors" />
            <div class="flex-1 min-w-0">
              <span class="block text-[9px] uppercase tracking-wider font-extrabold text-(--color-primary) mb-0.5">Who</span>
              <input
                v-model.number="searchForm.guests"
                type="number"
                min="1"
                placeholder="Add guests"
                class="w-full bg-transparent border-none outline-hidden text-sm font-bold text-(--color-text) p-0 focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <!-- Circular Signature search icon button -->
          <button
            type="button"
            @click="handleSearch"
            class="h-12 w-12 rounded-full bg-(--color-primary) hover:opacity-95 text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer border-none"
            title="Search stays"
          >
            <MagnifyingGlassIcon class="h-5.5 w-5.5 text-white stroke-2" />
          </button>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
/* Normalise inputs and dropdown appearances */
input, select {
  box-shadow: none !important;
  border-radius: 0 !important;
  appearance: none;
  -webkit-appearance: none;
}
input::-webkit-calendar-picker-indicator {
  filter: var(--calendar-filter-invert, none);
  cursor: pointer;
}
select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}
</style>
