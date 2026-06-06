<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import PropertyFilter from "@/modules/properties/components/PropertyFilter.vue";
import { usePropertyStore } from "../store/propertyStore";

const { t } = useI18n({ useScope: "global" });
const router = useRouter();
const propertyStore = usePropertyStore();

const filters = ref({
  query: "",
  city: "all",
  type: "all",
  maxPrice: 220,
  minRating: 0,
});

const cityOptions = computed(() => [
  { value: "all", label: t("home.search.allCities") },
  { value: "phnom-penh", label: t("home.cities.phnomPenh") },
  { value: "siem-reap", label: t("home.cities.siemReap") },
  { value: "sihanoukville", label: t("home.cities.sihanoukville") },
  { value: "battambang", label: t("home.cities.battambang") },
  { value: "kampot", label: t("home.cities.kampot") },
]);

const typeOptions = computed(() => [
  { value: "all", label: t("propertiesPage.filters.allStays") },
  { value: "hotel", label: t("home.categories.hotel") },
  { value: "guesthouse", label: t("home.categories.guesthouse") },
  { value: "homestay", label: t("home.categories.homestay") },
  { value: "apartment", label: t("home.categories.apartment") },
  { value: "villa", label: t("home.categories.villa") },
  { value: "resort", label: t("home.categories.resort") },
]);

const minimumRatings = [0, 4, 4.5, 4.8];

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const formatPrice = (value) => `$${Number(value || 0)}`;

const filteredProperties = computed(() => {
  const query = normalize(filters.value.query);

  return propertyStore.approvedProperties.filter((property) => {
    const matchesQuery =
      !query ||
      normalize(property.name).includes(query) ||
      normalize(property.description).includes(query) ||
      normalize(property.city).includes(query);
    const matchesCity =
      filters.value.city === "all" || property.city === filters.value.city;
    const matchesType =
      filters.value.type === "all" || property.type === filters.value.type;
    const matchesPrice = property.price <= filters.value.maxPrice;
    const matchesRating = property.rating >= filters.value.minRating;

    return (
      matchesQuery &&
      matchesCity &&
      matchesType &&
      matchesPrice &&
      matchesRating
    );
  });
});

const totalCities = computed(
  () =>
    new Set(propertyStore.approvedProperties.map((property) => property.city))
      .size,
);

const averageRating = computed(() => {
  if (!propertyStore.approvedProperties.length) return "0.0";
  const total = propertyStore.approvedProperties.reduce(
    (sum, property) => sum + property.rating,
    0,
  );
  return (total / propertyStore.approvedProperties.length).toFixed(1);
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.query.trim()) count += 1;
  if (filters.value.city !== "all") count += 1;
  if (filters.value.type !== "all") count += 1;
  if (filters.value.maxPrice < 220) count += 1;
  if (filters.value.minRating > 0) count += 1;
  return count;
});

const whyBrowseItems = computed(() => [
  t("propertiesPage.whyBrowse.items.verified"),
  t("propertiesPage.whyBrowse.items.localFirst"),
  t("propertiesPage.whyBrowse.items.realFilters"),
]);

const propertyCountByCity = (city) =>
  propertyStore.approvedProperties.filter((property) => property.city === city)
    .length;

const resetFilters = () => {
  filters.value = {
    query: "",
    city: "all",
    type: "all",
    maxPrice: 220,
    minRating: 0,
  };
};

const openProperty = (propertyId) => {
  router.push({ name: "public.property-detail", params: { id: propertyId } });
};

onMounted(() => {
  propertyStore.fetchApprovedProperties().catch(() => {});
});
</script>

<template>
  <main class="bg-(--color-page) text-(--color-text) min-h-screen">
    <!-- 🌟 HERO BANNER: Clean, split structural alignment -->
    <section
      class="relative bg-(--color-primary-strong) overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-center"
    >
      <!-- Background Graphic Grid Mask -->
      <div
        class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
      ></div>

      <!-- Right Side Visual Image Anchor Frame -->
      <div class="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
        <div
          class="absolute inset-0 bg-gradient-to-r from-(--color-primary-strong) via-(--color-primary-strong)/30 to-transparent z-10"
        ></div>
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
          alt="Premium Resort Space Background"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <!-- Hero Typography Layout Content Layer -->
      <div
        class="relative z-20 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8"
      >
        <div class="max-w-xl lg:max-w-2xl">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse"
            ></span>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-100"
            >
              {{ t("nav.properties") }}
            </p>
          </div>

          <h1
            class="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl tracking-tight"
          >
            {{ t("propertiesPage.hero.title") }}
          </h1>
          <p
            class="mt-4 text-sm sm:text-base leading-relaxed text-sky-100/80 max-w-lg"
          >
            {{ t("propertiesPage.hero.subtitle") }}
          </p>
        </div>
      </div>
    </section>

    <!-- 📊 STATS BANNER SECTION: Isolated from grid column pipelines to avoid text collision seen in image_a53da2.png -->
    <section class="relative z-30 -mt-10 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div
          class="rounded-[24px] border border-(--color-border) bg-(--color-surface) p-5 shadow-xl"
        >
          <div class="grid gap-4 grid-cols-3">
            <!-- Properties Counter -->
            <div
              class="rounded-xl bg-(--color-surface-soft) p-4 border border-(--color-border)/30"
            >
              <p
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) truncate"
              >
                Properties
              </p>
              <p class="mt-1 text-2xl font-black text-(--color-text)">
                {{ propertyStore.approvedProperties.length }}
              </p>
            </div>

            <!-- Cities Counter -->
            <div
              class="rounded-xl bg-(--color-surface-soft) p-4 border border-(--color-border)/30"
            >
              <p
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) truncate"
              >
                Cities
              </p>
              <p class="mt-1 text-2xl font-black text-(--color-text)">
                {{ totalCities }}
              </p>
            </div>

            <!-- Rating Breakdown -->
            <div
              class="rounded-xl bg-(--color-surface-soft) p-4 border border-(--color-border)/30"
            >
              <p
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) truncate"
              >
                Average Rating
              </p>
              <p class="mt-1 text-2xl font-black text-(--color-text)">
                ★ {{ averageRating }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div
        class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <aside class="lg:sticky lg:top-6 lg:self-start">
          <PropertyFilter
            v-model="filters"
            :activeFilterCount="activeFilterCount"
            :cityOptions="cityOptions"
            :typeOptions="typeOptions"
            :minimumRatings="minimumRatings"
            :whyBrowseItems="whyBrowseItems"
            :propertyCountByCity="propertyCountByCity"
            @reset="resetFilters"
          />
        </aside>

        <section class="min-w-0">
          <div
            v-if="propertyStore.loading"
            class="rounded-[30px] border border-(--color-border) bg-(--color-surface) px-6 py-14 text-center text-(--color-muted)"
          >
            Loading approved properties...
          </div>

          <!-- Error Pipeline feedback window -->
          <div
            v-else-if="propertyStore.error"
            class="rounded-[30px] border border-rose-500/20 bg-rose-500/10 px-6 py-14 text-center text-rose-400"
          >
            {{ propertyStore.error }}
          </div>

          <!-- Empty fallback array layout -->
          <div
            v-else-if="filteredProperties.length === 0"
            class="rounded-[30px] border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-14 text-center text-(--color-muted)"
          >
            No approved properties found matching active filter parameters.
          </div>

          <div
            v-else
            class="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
          >
            <article
              v-for="property in filteredProperties"
              :key="property.id"
              class="overflow-hidden rounded-[24px] border border-(--color-border) bg-(--color-surface) shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <button
                type="button"
                class="block w-full text-left cursor-pointer"
                @click="openProperty(property.id)"
              >
                <div
                  class="h-48 w-full overflow-hidden bg-(--color-surface-soft)"
                >
                  <img
                    :src="property.image"
                    :alt="property.name"
                    class="h-full w-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>

                <div class="p-5 space-y-2">
                  <p
                    class="text-[10px] font-bold uppercase tracking-wider text-(--color-primary)"
                  >
                    Approved Asset
                  </p>
                  <h2
                    class="text-lg font-bold text-(--color-text) line-clamp-1 tracking-tight"
                  >
                    {{ property.name }}
                  </h2>
                  <p
                    class="text-xs text-(--color-muted) line-clamp-2 leading-relaxed"
                  >
                    {{ property.description }}
                  </p>

                  <div
                    class="mt-4 flex items-center justify-between gap-4 pt-2 border-t border-(--color-border)/50"
                  >
                    <div>
                      <p class="text-xs font-medium text-(--color-muted)">
                        {{ property.city || "Unknown city" }}
                      </p>
                      <p class="mt-0.5 text-xs font-bold text-amber-500">
                        ★ {{ property.rating }}
                        <span class="font-normal text-(--color-muted)"
                          >({{ property.reviews }})</span
                        >
                      </p>
                    </div>
                    <div class="text-right">
                      <p
                        class="text-xl font-black text-(--color-primary-strong)"
                      >
                        {{ formatPrice(property.price) }}
                      </p>
                      <p class="text-[10px] text-(--color-muted)">/ night</p>
                    </div>
                  </div>
                </div>
              </button>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
