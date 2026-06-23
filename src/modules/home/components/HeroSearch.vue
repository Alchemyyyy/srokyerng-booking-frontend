<script setup>
import { ref, computed } from "vue";
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

const cities = computed(() => [
  t("home.cities.phnomPenh"),
  t("home.cities.siemReap"),
  t("home.cities.sihanoukville"),
  t("home.cities.battambang"),
  t("home.cities.kampot"),
]);

const quickTags = computed(() => [
  t("home.cities.siemReap"),
  t("home.cities.phnomPenh"),
  t("home.cities.kampot"),
]);
</script>
<template>
  <section
    class="relative flex min-h-screen w-full items-center overflow-hidden px-4 pb-16 pt-36 sm:px-6 lg:px-8"
  >
    <div class="absolute inset-0 z-0">
      <img
        :src="HeroImg"
        alt="Cambodian Resort"
        class="h-full w-full object-cover"
      />
      <div
        class="absolute inset-0"
        style="
          background: linear-gradient(
            110deg,
            rgba(5, 23, 45, 0.92) 0%,
            rgba(5, 31, 66, 0.86) 42%,
            rgba(20, 117, 174, 0.48) 74%,
            rgba(4, 20, 38, 0.55) 100%
          );
        "
      ></div>
    </div>

    <div class="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_420px]">
      <div class="max-w-3xl text-left">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white ring-1 ring-white/20 backdrop-blur-md"
          :class="{ 'font-kantumruy': locale === 'km' }"
        >
          <SparklesIcon class="h-4 w-4 text-(--color-primary)" />
          {{ t("home.hero.eyebrow") }}
        </span>

        <h1
          class="mt-7 max-w-4xl text-5xl font-extrabold text-white drop-shadow-lg sm:text-6xl lg:text-7xl lg:leading-[1.05]"
          :class="
            locale === 'km' ? 'font-kantumruy leading-[1.28]' : 'tracking-tight'
          "
        >
          {{ t("home.hero.title") }}
          <span class="text-(--color-primary)">
            {{ t("home.hero.titleHighlight") }}
          </span>
        </h1>

        <p
          class="mt-6 max-w-2xl text-lg text-white/85 drop-shadow-md sm:text-xl"
          :class="
            locale === 'km'
              ? 'font-kantumruy leading-relaxed'
              : 'leading-8 font-medium'
          "
        >
          {{ t("home.hero.subtitle") }}
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <button
            v-for="tag in quickTags"
            :key="tag"
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/18"
            @click="searchForm.city = tag"
          >
            <MapPinIcon class="h-4 w-4 text-(--color-primary)" />
            {{ tag }}
          </button>
        </div>

        <div class="mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/15 rounded-[var(--radius-panel)] border border-white/15 bg-white/10 px-4 py-5 backdrop-blur-md">
          <div class="px-3 first:pl-0">
            <p class="text-3xl font-bold text-white">411+</p>
            <p class="mt-1 text-xs uppercase tracking-widest text-white/65">
              {{ t("home.search.properties") }}
            </p>
          </div>
          <div class="px-3">
            <p class="text-3xl font-bold text-white">28k+</p>
            <p class="mt-1 text-xs uppercase tracking-widest text-white/65">
              {{ t("home.search.happyGuests") }}
            </p>
          </div>
          <div class="px-3 pr-0">
            <p class="text-3xl font-bold text-white">25+</p>
            <p class="mt-1 text-xs uppercase tracking-widest text-white/65">
              {{ t("home.search.cities") }}
            </p>
          </div>
        </div>
      </div>

      <div class="hero-search-panel rounded-[var(--radius-panel)] border border-(--color-border) bg-(--color-surface) p-5 shadow-2xl backdrop-blur-xl">
        <div class="mb-5">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-(--color-primary)">
            {{ t("home.search.submit") }}
          </p>
          <h2 class="mt-1 text-2xl font-bold text-(--color-text)">
            {{ t("home.search.city") }} & {{ t("home.search.checkInOut") }}
          </h2>
        </div>

        <div class="space-y-3">
          <label class="block rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 transition focus-within:border-(--color-primary)">
            <span class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-primary)">
              <MapPinIcon class="h-4 w-4" />
              {{ t("home.search.city") }}
            </span>
            <select
              v-model="searchForm.city"
              class="hero-search-field mt-2 w-full border-none bg-transparent p-0 text-base font-semibold text-(--color-text) outline-none focus:ring-0"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              <option value="">{{ t("home.search.allCities") }}</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </label>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 transition focus-within:border-(--color-primary)">
              <span class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-primary)">
                <CalendarDaysIcon class="h-4 w-4" />
                Check in
              </span>
              <input
                v-model="searchForm.checkIn"
                type="date"
                class="hero-search-field mt-2 w-full border-none bg-transparent p-0 text-sm font-semibold text-(--color-text) outline-none focus:ring-0"
              />
            </label>

            <label class="block rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 transition focus-within:border-(--color-primary)">
              <span class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-primary)">
                <CalendarDaysIcon class="h-4 w-4" />
                Check out
              </span>
              <input
                v-model="searchForm.checkOut"
                type="date"
                class="hero-search-field mt-2 w-full border-none bg-transparent p-0 text-sm font-semibold text-(--color-text) outline-none focus:ring-0"
              />
            </label>
          </div>

          <label class="block rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 transition focus-within:border-(--color-primary)">
            <span class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-primary)">
              <UserGroupIcon class="h-4 w-4" />
              Guests
            </span>
            <input
              v-model.number="searchForm.guests"
              type="number"
              min="1"
              class="hero-search-field mt-2 w-full border-none bg-transparent p-0 text-base font-semibold text-(--color-text) outline-none focus:ring-0"
            />
          </label>

          <AppButton
            variant="primary"
            size="lg"
            class="mt-2 w-full !rounded-[var(--radius-lg)]"
            @click="handleSearch"
          >
            <MagnifyingGlassIcon class="h-5 w-5" />
            {{ t("home.search.submit") }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-search-panel {
  color-scheme: light;
}

:global(.dark) .hero-search-panel {
  color-scheme: dark;
}

.hero-search-field,
.hero-search-field option {
  color: var(--color-text);
  background-color: var(--color-surface-soft);
}

.hero-search-field::-webkit-calendar-picker-indicator {
  opacity: 0.75;
}

:global(.dark) .hero-search-field::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
