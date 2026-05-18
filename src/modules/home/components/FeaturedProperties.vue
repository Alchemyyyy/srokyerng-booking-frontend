<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import AppButton from "@/shared/components/AppButton.vue";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

const featuredProperties = computed(() => [
  {
    id: 1,
    name: "Sokha Phnom Penh Hotel",
    location: "Phnom Penh",
    price: 89,
    rating: 4.8,
    reviews: 245,
    category: "Hotel",
    badge: t("home.featured.badges.mostPopular"),
    amenities: [
      t("home.featured.amenities.freeWifi"),
      t("home.featured.amenities.swimmingPool"),
    ],
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Angkor Heritage Villa",
    location: "Siem Reap",
    price: 78,
    rating: 4.9,
    reviews: 189,
    category: "Villa",
    badge: t("home.featured.badges.topRated"),
    amenities: [
      t("home.featured.amenities.freeWifi"),
      t("home.featured.amenities.garden"),
    ],
    image:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Seaside Bungalow",
    location: "Sihanoukville",
    price: 35,
    rating: 4.7,
    reviews: 56,
    category: "Bungalow",
    badge: t("home.featured.badges.bestValue"),
    amenities: [
      t("home.featured.amenities.freeWifi"),
      t("home.featured.amenities.beachAccess"),
    ],
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
  },
]);
</script>

<template>
  <section class="bg-(--color-surface) py-16 px-4 font-sans">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-orange-400">✨</span>
            <p
              class="text-(--color-primary) font-bold tracking-widest text-[10px] uppercase"
            >
              {{ t("home.featured.eyebrow") }}
            </p>
          </div>
          <h2 class="text-3xl font-extrabold text-(--color-text)">
            {{ t("home.featured.title") }}
          </h2>
          <p class="text-(--color-muted) text-sm mt-2">
            {{ t("home.featured.subtitle") }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="text-(--color-primary) font-semibold text-sm flex items-center gap-1 hover:underline mt-4 md:mt-0"
        >
          <span>{{ t("home.featured.viewAll") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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

      <!-- Properties Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="property in featuredProperties"
          :key="property.id"
          class="group bg-(--color-surface) rounded-2xl overflow-hidden border border-(--color-border) shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          @click="
            router.push({
              name: 'public.property-detail',
              params: { id: property.id },
            })
          "
        >
          <!-- Image -->
          <div class="relative h-60 overflow-hidden">
            <img
              :src="property.image"
              :alt="property.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <!-- Badge -->
            <div class="absolute top-3 left-3">
              <span
                class="bg-(--color-primary) text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg"
              >
                {{ property.badge }}
              </span>
            </div>
            <!-- Wishlist -->
            <button
              class="absolute top-3 right-3 w-8 h-8 bg-(--color-surface)/80 backdrop-blur-sm rounded-full flex items-center justify-center text-(--color-muted) hover:text-red-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <!-- Category -->
            <div
              class="absolute bottom-3 left-3 bg-(--color-primary)/80 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-md"
            >
              {{ property.category }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3
              class="font-bold text-(--color-text) text-lg mb-1 leading-tight"
            >
              {{ property.name }}
            </h3>
            <div
              class="flex items-center gap-1 text-(--color-muted) text-xs mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {{ property.location }}
            </div>

            <!-- Amenities -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="amenity in property.amenities"
                :key="amenity"
                class="bg-(--color-primary-soft) text-(--color-primary) text-[10px] px-2 py-1 rounded border border-blue-100"
              >
                {{ amenity }}
              </span>
            </div>

            <!-- Price & Rating -->
            <div
              class="flex items-center justify-between pt-4 border-t border-(--color-border)"
            >
              <div class="flex items-center gap-1">
                <span class="text-orange-400 text-sm">★</span>
                <span class="font-bold text-(--color-text) text-sm">{{
                  property.rating
                }}</span>
                <span class="text-(--color-muted) text-xs"
                  >({{ property.reviews }})</span
                >
              </div>
              <div class="text-right">
                <span class="text-(--color-text) font-extrabold text-lg"
                  >${{ property.price }}</span
                >
                <span class="text-(--color-muted) text-xs font-medium">{{
                  t("home.featured.perNight")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Button -->
      <div class="mt-12 text-center">
        <RouterLink :to="{ name: 'public.properties' }">
          <AppButton variant="primary" size="lg" class="!rounded-xl gap-2">
            {{ t("home.featured.exploreAll") }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </AppButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
