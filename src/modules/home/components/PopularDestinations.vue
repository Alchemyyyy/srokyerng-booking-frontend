<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed, onMounted } from "vue";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";

const propertyStore = usePropertyStore();

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

onMounted(() => {
  propertyStore.fetchApprovedProperties().catch(() => {});
});

const getPropertyCountByCity = (cityName) =>
  propertyStore.approvedProperties.filter((p) => {
    const loc = typeof p.location === "string"
      ? p.location
      : p.location?.name || p.location?.city_name || String(p.location || "");
    return loc.toLowerCase() === cityName.toLowerCase();
  }).length;

const destinations = computed(() => [
  {
    key: "siemReap",
    name: t("home.destinations.cities.siemReap"),
    properties: getPropertyCountByCity("Siem Reap"),
    image: "https://rootsabroadtravel.com/wp-content/uploads/2024/03/Wonderful-Things-to-Do-in-Siem-Reap-Cambodia-Beyond-Angkor-Wat-1170x600.jpg",
    tagline: "Explore Ancient Temples & Culture"
  },
  {
    key: "phnomPenh",
    name: t("home.destinations.cities.phnomPenh"),
    properties: getPropertyCountByCity("Phnom Penh"),
    image: "https://blog.bangkokair.com/wp-content/uploads/2025/01/Cover_phnom-penh-travel-guide.jpg",
    tagline: "Experience Urban Pulse & Historical Rivers"
  },
  {
    key: "kampot",
    name: t("home.destinations.cities.kampot"),
    properties: getPropertyCountByCity("Kampot"),
    image: "https://d34vm3j4h7f97z.cloudfront.net/original/4X/8/1/e/81e31f6817402c4a711d09891d53515e0ada2571.jpeg",
    tagline: "Riverside Serenity"
  },
  {
    key: "sihanoukville",
    name: t("home.destinations.cities.sihanoukville"),
    properties: getPropertyCountByCity("Sihanoukville"),
    image: "https://images.trvl-media.com/place/6197589/abd88488-ab47-4926-8fbd-b8561fff1dbf.jpg",
    tagline: "Sun-Kissed Beaches"
  },
  {
    key: "battambang",
    name: t("home.destinations.cities.battambang"),
    properties: getPropertyCountByCity("Battambang"),
    image: "https://www.remotelands.com/storage/media/4115/conversions/b160729017-banner-size.jpg",
    tagline: "Colonial Charm & Scenic Bamboo Railway"
  },
]);

const goToCity = (city) => {
  router.push({ name: "public.properties", query: { city: city.name } });
};
</script>

<template>
  <section
    class="bg-(--color-surface) py-20 px-4"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
      >
        <div class="max-w-2xl">
          <div class="flex items-center gap-1.5 mb-2">
            <span
              class="text-[9px] font-black text-(--color-primary) border-2 border-(--color-primary)/30 px-1.5 py-0.5 rounded-md"
              >KH</span
            >
            <p
              class="text-(--color-primary) font-black tracking-widest text-xs uppercase"
            >
              {{ t("home.destinations.eyebrow") }}
            </p>
          </div>
          <h2
            class="text-3xl md:text-5xl font-black text-(--color-text) mb-4 tracking-tight"
          >
            {{ t("home.destinations.title") }}
          </h2>
          <p class="text-(--color-muted) text-base leading-relaxed font-medium">
            {{ t("home.destinations.subtitle") }}
          </p>
        </div>

        <RouterLink
          :to="{ name: 'public.properties' }"
          class="text-(--color-primary) font-bold text-sm flex items-center gap-2 hover:underline group shrink-0"
        >
          <span>{{ t("home.destinations.viewAll") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </RouterLink>
      </div>

      <!-- Airbnb-Style Horizontal Scroll Slider Layout -->
      <div
        class="flex items-center justify-start gap-6 overflow-x-auto scrollbar-none pb-6 px-1"
      >
        <div
          v-for="dest in destinations"
          :key="dest.key"
          class="relative group overflow-hidden rounded-[24px] cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 border border-(--color-border)/35 flex flex-col justify-end w-[280px] h-[360px] shrink-0"
          @click="goToCity(dest)"
        >
          <img
            :src="dest.image"
            :alt="dest.name"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent z-10"
          ></div>
          
          <!-- Top Right floating properties badge -->
          <div class="absolute top-4 right-4 z-20">
            <span class="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {{ dest.properties }} {{ t("home.destinations.properties") }}
            </span>
          </div>

          <!-- Description and Title on card bottom -->
          <div class="relative z-20 p-6 text-white space-y-1">
            <h3 class="font-black text-2xl tracking-tight leading-none group-hover:text-sky-300 transition-colors">
              {{ dest.name }}
            </h3>
            <p class="text-xs text-white/80 font-semibold tracking-wide">
              {{ dest.tagline }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom hide scrollbar rule */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
