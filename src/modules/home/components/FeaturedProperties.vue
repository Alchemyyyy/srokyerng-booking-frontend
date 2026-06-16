<script setup>
import { computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";

const { t } = useI18n({ useScope: "global" });
const router = useRouter();
const propertyStore = usePropertyStore();

const featuredProperties = computed(() =>
  propertyStore.approvedProperties.slice(0, 3).map((property) => ({
    id: property.id,
    name: property.name,
    location:
      property.city || property.description || t("home.featured.subtitle"),
    price: property.price,
    rating: property.rating,
    reviews: property.reviews,
    category: property.type,
    badge:
      property.rating >= 4.8
        ? t("home.featured.badges.topRated")
        : t("home.featured.badges.mostPopular"),
    amenities: property.raw?.amenities?.length
      ? property.raw.amenities
          .slice(0, 2)
          .map((amenity) => amenity.amenity_name || amenity.name || amenity)
      : [
          t("home.featured.amenities.freeWifi"),
          t("home.featured.amenities.swimmingPool"),
        ],
    image: property.image,
  })),
);

const goToProperty = (propertyId) => {
  router.push({
    name: "public.property-detail",
    params: { id: propertyId },
  });
};

onMounted(() => {
  if (!propertyStore.approvedProperties.length) {
    propertyStore.fetchApprovedProperties().catch(() => {});
  }
});
</script>

<template>
  <section class="bg-(--color-surface) py-16 px-4 font-sans">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <span class="text-orange-400">✨</span>
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-(--color-primary)"
            >
              {{ t("home.featured.eyebrow") }}
            </p>
          </div>
          <h2 class="text-3xl font-extrabold text-(--color-text)">
            {{ t("home.featured.title") }}
          </h2>
          <p class="mt-2 text-sm text-(--color-muted)">
            {{ t("home.featured.subtitle") }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="mt-4 flex items-center gap-1 text-sm font-semibold text-(--color-primary) hover:underline md:mt-0"
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

      <div
        v-if="propertyStore.loading"
        class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) px-6 py-12 text-center text-(--color-muted)"
      >
        Loading featured properties...
      </div>

      <div
        v-else-if="propertyStore.error"
        class="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-12 text-center text-rose-600"
      >
        {{ propertyStore.error }}
      </div>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="property in featuredProperties"
          :key="property.id"
          class="group cursor-pointer overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm transition-all duration-300 hover:shadow-xl"
          @click="goToProperty(property.id)"
        >
          <div class="relative h-60 overflow-hidden">
            <img
              :src="property.image"
              :alt="property.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute left-3 top-3">
              <span
                class="rounded-full bg-(--color-primary) px-3 py-1 text-[10px] font-bold text-white shadow-lg"
              >
                {{ property.badge }}
              </span>
            </div>
            <div
              class="absolute bottom-3 left-3 rounded-md bg-(--color-primary)/80 px-3 py-1 text-[10px] text-white backdrop-blur-sm"
            >
              {{ property.category }}
            </div>
          </div>

          <div class="p-4">
            <h3
              class="mb-1 text-base font-bold leading-tight text-(--color-text)"
            >
              {{ property.name }}
            </h3>
            <p
              class="mb-3 flex items-center gap-1 text-xs text-(--color-muted)"
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
            </p>

            <div class="mb-3 flex flex-wrap gap-1.5">
              <span
                v-for="amenity in property.amenities"
                :key="amenity"
                class="rounded border border-blue-100 bg-(--color-primary-soft) px-2 py-0.5 text-[10px] text-(--color-primary)"
              >
                {{ amenity }}
              </span>
            </div>

            <div
              class="flex items-center justify-between border-t border-(--color-border) pt-3"
            >
              <div class="flex items-center gap-1">
                <span class="text-sm text-orange-400">★</span>
                <span class="text-sm font-bold text-(--color-text)">{{
                  property.rating
                }}</span>
                <span class="text-xs text-(--color-muted)"
                  >({{ property.reviews }})</span
                >
              </div>
              <div class="text-right">
                <span class="text-base font-extrabold text-(--color-text)"
                  >${{ property.price }}</span
                >
                <span class="text-xs font-medium text-(--color-muted)">
                  {{ t("home.featured.perNight") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
