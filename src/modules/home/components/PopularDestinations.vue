<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";
import { onMounted } from "vue";

const propertyStore = usePropertyStore();

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

onMounted(() => {
  propertyStore.fetchApprovedProperties().catch(() => {});
});

const getPropertyCountByCity = (cityName) =>
  propertyStore.approvedProperties.filter(
    (p) => p.location?.toLowerCase() === cityName.toLowerCase(),
  ).length;

const destinations = computed(() => [
  {
    key: "phnomPenh",
    name: t("home.destinations.cities.phnomPenh"),
    properties: getPropertyCountByCity("Phnom Penh"),
    image:
      "https://blog.bangkokair.com/wp-content/uploads/2025/01/Cover_phnom-penh-travel-guide.jpg",
  },
  {
    key: "siemReap",
    name: t("home.destinations.cities.siemReap"),
    properties: getPropertyCountByCity("Siem Reap"),
    image:
      "https://rootsabroadtravel.com/wp-content/uploads/2024/03/Wonderful-Things-to-Do-in-Siem-Reap-Cambodia-Beyond-Angkor-Wat-1170x600.jpg",
  },
  {
    key: "sihanoukville",
    name: t("home.destinations.cities.sihanoukville"),
    properties: getPropertyCountByCity("Sihanoukville"),
    image:
      "https://images.trvl-media.com/place/6197589/abd88488-ab47-4926-8fbd-b8561fff1dbf.jpg",
  },
  {
    key: "kampot",
    name: t("home.destinations.cities.kampot"),
    properties: getPropertyCountByCity("Kampot"),
    image:
      "https://d34vm3j4h7f97z.cloudfront.net/original/4X/8/1/e/81e31f6817402c4a711d09891d53515e0ada2571.jpeg",
  },
  {
    key: "battambang",
    name: t("home.destinations.cities.battambang"),
    properties: getPropertyCountByCity("Battambang"),
    image:
      "https://www.remotelands.com/storage/media/4115/conversions/b160729017-banner-size.jpg",
  },
]);
const goToCity = (city) => {
  router.push({ name: "public.properties", query: { city: city.name } });
};
</script>

<template>
  <section
    class="bg-(--color-surface) py-16 px-4"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
      >
        <div class="max-w-2xl">
          <div class="flex items-center gap-1 mb-2">
            <span
              class="text-[10px] font-bold text-(--color-primary) border border-(--color-primary) px-1 rounded"
              >KH</span
            >
            <p
              class="text-(--color-primary) font-bold tracking-widest text-[11px] uppercase"
            >
              {{ t("home.destinations.eyebrow") }}
            </p>
          </div>
          <h2
            class="text-3xl md:text-4xl font-extrabold text-(--color-text) mb-3"
          >
            {{ t("home.destinations.title") }}
          </h2>
          <p class="text-(--color-muted) text-sm leading-relaxed">
            {{ t("home.destinations.subtitle") }}
          </p>
        </div>

        <RouterLink
          :to="{ name: 'public.properties' }"
          class="text-(--color-primary) font-semibold text-sm flex items-center gap-2 hover:underline group"
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
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </RouterLink>
      </div>

      <!-- Cities Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <div
          v-for="dest in destinations"
          :key="dest.key"
          class="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
          @click="goToCity(dest)"
        >
          <img
            :src="dest.image"
            :alt="dest.name"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          ></div>
          <div class="absolute bottom-5 left-5 text-white">
            <h3 class="font-bold text-lg">{{ dest.name }}</h3>
            <p class="text-xs opacity-90">
              {{ dest.properties }} {{ t("home.destinations.properties") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
