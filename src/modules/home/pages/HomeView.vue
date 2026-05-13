<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

// Search form
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

// Featured properties (placeholder until API is connected)
const featuredProperties = ref([
  {
    id: 1,
    name: "Riverside Retreat",
    location: "Phnom Penh",
    price: 45,
    rating: 4.8,
    reviews: 124,
    category: "Guesthouse",
    image: null,
  },
  {
    id: 2,
    name: "Angkor Heritage Villa",
    location: "Siem Reap",
    price: 78,
    rating: 4.9,
    reviews: 89,
    category: "Villa",
    image: null,
  },
  {
    id: 3,
    name: "Seaside Bungalow",
    location: "Sihanoukville",
    price: 35,
    rating: 4.7,
    reviews: 56,
    category: "Bungalow",
    image: null,
  },
]);

// Popular categories
const categories = computed(() => [
  { label: t("home.categories.guesthouse"), icon: "🏡", count: 120 },
  { label: t("home.categories.villa"), icon: "🏰", count: 45 },
  { label: t("home.categories.bungalow"), icon: "🌴", count: 67 },
  { label: t("home.categories.apartment"), icon: "🏢", count: 89 },
  { label: t("home.categories.resort"), icon: "🌊", count: 23 },
  { label: t("home.categories.hostel"), icon: "🛏️", count: 34 },
]);

// Why choose us
const features = computed(() => [
  {
    icon: "🇰🇭",
    title: t("home.features.local.title"),
    desc: t("home.features.local.desc"),
  },
  {
    icon: "✅",
    title: t("home.features.verified.title"),
    desc: t("home.features.verified.desc"),
  },
  {
    icon: "💰",
    title: t("home.features.price.title"),
    desc: t("home.features.price.desc"),
  },
  {
    icon: "🤝",
    title: t("home.features.support.title"),
    desc: t("home.features.support.desc"),
  },
]);

const cities = computed(() => [
  t("home.cities.phnomPenh"),
  t("home.cities.siemReap"),
  t("home.cities.sihanoukville"),
  t("home.cities.battambang"),
  t("home.cities.kampot"),
]);
</script>
<template>
  <section
    class="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-44 pb-20"
  >
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop"
        alt="Cambodian Resort"
        class="h-full w-auto min-w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-6xl text-center">
      <div class="mb-8 flex justify-center animate-fade-in">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md ring-1 ring-white/30"
          :class="{ 'font-kantumruy': locale === 'km' }"
        >
          <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          {{ t("home.hero.eyebrow") }}
        </span>
      </div>

      <h1
        class="mx-auto mb-6 max-w-4xl text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl lg:leading-[1.1] drop-shadow-lg"
        :class="
          locale === 'km' ? 'font-kantumruy leading-[1.3]' : 'tracking-tight'
        "
      >
        {{ t("home.hero.title") }}
        <span class="text-blue-400">
          {{ t("home.hero.titleHighlight") }}
        </span>
      </h1>

      <p
        class="mx-auto mb-12 max-w-2xl text-lg text-white/90 drop-shadow-md"
        :class="
          locale === 'km'
            ? 'font-kantumruy leading-relaxed'
            : 'leading-8 font-medium'
        "
      >
        {{ t("home.hero.subtitle") }}
      </p>

      <div
        class="mx-auto max-w-5xl rounded-3xl bg-white p-2 shadow-2xl lg:rounded-full"
      >
        <div class="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          <div
            class="flex flex-col items-start px-6 py-3 transition-colors hover:bg-gray-50 rounded-full cursor-pointer"
          >
            <label
              class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              <svg
                class="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ t("home.search.city") }}
            </label>
            <select
              v-model="searchForm.city"
              class="w-full border-none bg-transparent p-0 text-[15px] font-semibold text-gray-800 outline-none focus:ring-0"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              <option value="">{{ t("home.search.allCities") }}</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>

          <div
            class="flex flex-col items-start px-6 py-3 transition-colors hover:bg-gray-50 rounded-full cursor-pointer border-l border-gray-100 lg:block hidden"
          >
            <label
              class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              {{ t("home.search.type") }}
            </label>
            <select
              class="w-full border-none bg-transparent p-0 text-[15px] font-semibold text-gray-800 outline-none focus:ring-0"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              <option>Hotel</option>
              <option>Resort</option>
              <option>Homestay</option>
            </select>
          </div>

          <div
            class="flex flex-col items-start px-6 py-3 transition-colors hover:bg-gray-50 rounded-full cursor-pointer border-l border-gray-100"
          >
            <label
              class="text-[10px] font-bold uppercase tracking-widest text-blue-600"
              :class="{ 'font-kantumruy': locale === 'km' }"
            >
              Check-in / Out
            </label>
            <input
              type="date"
              class="w-full border-none bg-transparent p-0 text-sm font-semibold text-gray-800 outline-none focus:ring-0"
            />
          </div>

          <div class="flex items-center p-1">
            <button
              @click="handleSearch"
              class="flex h-full w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                class="h-5 w-5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" stroke-linecap="round" />
              </svg>
              <span>{{ t("home.search.submit") }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button
          v-for="tag in ['Siem Reap', 'Phnom Penh', 'Kampot']"
          :key="tag"
          class="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
        >
          📍 {{ tag }}
        </button>
      </div>

      <div
        class="mt-16 grid grid-cols-3 divide-x divide-white/20 border-t border-white/20 pt-8 max-w-3xl mx-auto"
      >
        <div>
          <p class="text-3xl font-bold text-white">411+</p>
          <p class="text-xs uppercase tracking-widest text-white/60 mt-1">
            Properties
          </p>
        </div>
        <div>
          <p class="text-3xl font-bold text-white">28k+</p>
          <p class="text-xs uppercase tracking-widest text-white/60 mt-1">
            Happy Guests
          </p>
        </div>
        <div>
          <p class="text-3xl font-bold text-white">25+</p>
          <p class="text-xs uppercase tracking-widest text-white/60 mt-1">
            Cities
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
