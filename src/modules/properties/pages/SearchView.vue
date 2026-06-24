<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { propertyApi } from "@/modules/properties/api/property.api";

import { usePropertyStore } from "../store/propertyStore";
import PropertyFilter from "@/modules/properties/components/PropertyFilter.vue";
import SearchBar from "@/modules/properties/components/SearchBar.vue";
import PropertySortBar from "../components/PropertySortBar.vue";
import PropertyPagination from "../components/PropertyPagination.vue";
import HeroImg from "@/assets/images/home/hero/hero_banner.png";
import placeholderImage from "@/assets/images/properties/placeholder.png";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/vue/24/outline";

const { t, te } = useI18n({ useScope: "global" });
const router = useRouter();
const route = useRoute();
const propertyStore = usePropertyStore();

// ── UI state ──────────────────────────────────────────────────────────────────
const sortBy = ref("newest");
const viewMode = ref("grid");
const currentPage = ref(1);
const itemsPerPage = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const normalizeCityValue = (value) => normalize(value).replace(/\s+/g, "-");

// ── Filters ───────────────────────────────────────────────────────────────────
const initialCityQuery = route.query.city
  ? normalizeCityValue(route.query.city)
  : "all";

const filters = ref({
  query: route.query.search || "",
  city: initialCityQuery,
  type: route.query.type || "all",
  province: "all",
  maxPrice: 220,
  minRating: 0,
  checkIn: route.query.checkIn || "",
  checkOut: route.query.checkOut || "",
  guests: route.query.guests || 1,
});



// ── Filter options ────────────────────────────────────────────────────────────
const dynamicCities = ref([]);

const cityOptions = computed(() => {
  const options = [
    { value: "all", label: safeT("home.search.allCities", "All Cities") },
  ];
  
  if (dynamicCities.value.length > 0) {
    dynamicCities.value.forEach(city => {
      options.push({ value: normalizeCityValue(city), label: city });
    });
  } else {
    options.push(
      { value: "phnom-penh", label: safeT("home.cities.phnomPenh", "Phnom Penh") },
      { value: "siem-reap", label: safeT("home.cities.siemReap", "Siem Reap") },
      { value: "sihanoukville", label: safeT("home.cities.sihanoukville", "Sihanoukville") },
      { value: "battambang", label: safeT("home.cities.battambang", "Battambang") },
      { value: "kampot", label: safeT("home.cities.kampot", "Kampot") }
    );
  }
  return options;
});

const typeOptions = computed(() => [
  {
    value: "all",
    label: safeT("propertiesPage.filters.allStays", "All Stays"),
  },
  { value: "hotel", label: safeT("home.categories.hotel", "Hotel") },
  {
    value: "guesthouse",
    label: safeT("home.categories.guesthouse", "Guesthouse"),
  },
  { value: "homestay", label: safeT("home.categories.homestay", "Homestay") },
  {
    value: "apartment",
    label: safeT("home.categories.apartment", "Apartment"),
  },
  { value: "villa", label: safeT("home.categories.villa", "Villa") },
  { value: "resort", label: safeT("home.categories.resort", "Resort") },
]);

const minimumRatings = [0, 4, 4.5, 4.8];

// ── Computed stats ────────────────────────────────────────────────────────────
const totalCities = computed(
  () => new Set(propertyStore.approvedProperties.map((p) => p.city)).size,
);

const averageRating = computed(() => {
  if (!propertyStore.approvedProperties.length) return "0.0";
  const total = propertyStore.approvedProperties.reduce(
    (sum, p) => sum + p.rating,
    0,
  );
  return (total / propertyStore.approvedProperties.length).toFixed(1);
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.query.trim()) count++;
  if (filters.value.city !== "all") count++;
  if (filters.value.type !== "all") count++;
  if (filters.value.maxPrice < 220) count++;
  if (filters.value.minRating > 0) count++;
  return count;
});

const whyBrowseItems = computed(() => [
  safeT("propertiesPage.whyBrowse.items.verified", "Verified Accommodations"),
  safeT("propertiesPage.whyBrowse.items.localFirst", "Local-First Pricing"),
  safeT(
    "propertiesPage.whyBrowse.items.realFilters",
    "Instant Booking Confirmation",
  ),
]);

const propertyCountByCity = (city) =>
  propertyStore.approvedProperties.filter((p) => p.city === city).length;

// ── Filtered + sorted properties ──────────────────────────────────────────────
const filteredProperties = computed(() => {
  const query = normalize(filters.value.query);

  const result = propertyStore.approvedProperties.filter((property) => {
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

  return result.sort((a, b) => {
    if (sortBy.value === "price-asc") return a.price - b.price;
    if (sortBy.value === "price-desc") return b.price - a.price;
    if (sortBy.value === "rating-desc") return b.rating - a.rating;
    return 0; // newest — keep API order
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────
const totalPages = computed(() =>
  Math.ceil(filteredProperties.value.length / itemsPerPage),
);

const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProperties.value.slice(start, start + itemsPerPage);
});

// Reset to page 1 whenever filters or sort change
watch([filteredProperties], () => {
  currentPage.value = 1;
});

// ── Actions ───────────────────────────────────────────────────────────────────
const resetFilters = () => {
  filters.value = {
    query: "",
    city: "all",
    type: "all",
    province: "all",
    maxPrice: 220,
    minRating: 0,
    checkIn: "",
    checkOut: "",
    guests: 1,
  };
};

const openProperty = (propertyId) => {
  router.push({ name: "public.property-detail", params: { id: propertyId } });
};

onMounted(async () => {
  try {
    const res = await propertyApi.getCities();
    const fetchedCities = Array.isArray(res) ? res : (res?.data ?? []);
    if (fetchedCities.length > 0) {
      dynamicCities.value = fetchedCities.map(c => c.name || c.city_name || c);
    }
  } catch (error) {
    console.error("Failed to load cities in SearchView", error);
  }

  try {
    await propertyStore.fetchApprovedProperties({
      search: filters.value.query,
      city: filters.value.city === "all" ? "" : filters.value.city,
      category: filters.value.type === "all" ? "" : filters.value.type,
      page: currentPage.value,
    });
  } catch (err) {
    console.error("Failed to fetch properties:", err);
  }
});
</script>

<template>
  <main
    class="bg-(--color-page) text-(--color-text) min-h-screen antialiased selection:bg-(--color-primary-soft)"
  >
    <!-- ── Hero ──────────────────────────────────────────────────────────────── -->
    <section
      class="relative flex min-h-[460px] items-center overflow-hidden bg-(--color-primary-strong)"
    >
      <img
        :src="HeroImg"
        alt="Cambodian accommodation"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        class="absolute inset-0"
        style="
          background: linear-gradient(
            110deg,
            rgba(5, 23, 45, 0.94) 0%,
            rgba(5, 31, 66, 0.88) 44%,
            rgba(20, 117, 174, 0.4) 76%,
            rgba(4, 20, 38, 0.58) 100%
          );
        "
      ></div>

      <div
        class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:36px_36px]"
      ></div>

      <div
        class="relative z-20 mx-auto grid w-full max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8"
      >
        <div class="max-w-3xl">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md"
          >
            <SparklesIcon class="h-4 w-4 text-(--color-primary)" />
            {{ safeT("nav.properties", "Explore stays") }}
          </div>

          <h1
            class="mt-6 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl"
          >
            {{ safeT("propertiesPage.hero.title", "Find Your Perfect Stay") }}
          </h1>
          <p
            class="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg"
          >
            {{
              safeT(
                "propertiesPage.hero.subtitle",
                "Discover hand-picked premium spaces across Cambodia's finest locations.",
              )
            }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <span
              v-for="item in whyBrowseItems"
              :key="item"
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-md"
            >
              <ShieldCheckIcon class="h-4 w-4 text-(--color-primary)" />
              {{ item }}
            </span>
          </div>
        </div>

        <div
          class="rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md lg:self-end"
        >
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
            Search summary
          </p>
          <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p class="text-3xl font-black">{{ propertyStore.approvedProperties.length }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
                Stays
              </p>
            </div>
            <div>
              <p class="text-3xl font-black">{{ totalCities }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
                Cities
              </p>
            </div>
            <div>
              <p class="text-3xl font-black">{{ averageRating }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
                Rating
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Search Bar ─────────────────────────────────────────────────────────── -->
    <section class="relative z-40 -mt-10 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SearchBar
          v-model="filters"
          :cityOptions="cityOptions"
          :activeFilterCount="activeFilterCount"
          @reset="resetFilters"
        />
      </div>
    </section>

    <!-- ── Main Content ───────────────────────────────────────────────────────── -->
    <section class="mt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div
        class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <!-- Left: Filters sidebar -->
        <aside class="lg:sticky lg:top-8 lg:self-start">
          <div
            class="rounded-[22px] border border-(--color-border)/60 bg-(--color-surface) p-1.5"
          >
            <PropertyFilter
              v-model="filters"
              :activeFilterCount="activeFilterCount"
              :cityOptions="cityOptions"
              :minimumRatings="minimumRatings"
              :propertyCountByCity="propertyCountByCity"
              @reset="resetFilters"
            />
          </div>
        </aside>

        <!-- Right: Sort + Grid + Pagination -->
        <section class="min-w-0">
          <!-- Property type chips -->
          <div class="mb-5 rounded-[22px] border border-(--color-border)/70 bg-(--color-surface) p-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-(--color-primary)">
                  <BuildingOffice2Icon class="h-4 w-4" />
                  {{ safeT("home.search.type", "Property type") }}
                </p>
                <p class="mt-1 text-sm text-(--color-muted)">
                  Choose the kind of stay you want to browse.
                </p>
              </div>

              <button
                v-if="filters.type !== 'all'"
                type="button"
                class="text-xs font-bold text-(--color-primary) hover:underline"
                @click="filters.type = 'all'"
              >
                Clear type
              </button>
            </div>

            <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="type in typeOptions"
                :key="type.value"
                type="button"
                class="shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition active:scale-[0.98]"
                :class="
                  filters.type === type.value
                    ? 'border-(--color-primary) bg-(--color-primary) text-white shadow-sm'
                    : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary)/50 hover:text-(--color-text)'
                "
                @click="filters.type = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Sort bar -->
          <PropertySortBar
            v-model="sortBy"
            v-model:viewMode="viewMode"
            class="mb-6"
          />

          <!-- Loading -->
          <div
            v-if="propertyStore.loading"
            class="rounded-[24px] border border-(--color-border)/60 bg-(--color-surface) px-6 py-20 text-center text-sm font-medium text-(--color-muted) animate-pulse"
          >
            Loading accommodations...
          </div>

          <!-- Error -->
          <div
            v-else-if="propertyStore.error"
            class="rounded-[24px] border border-rose-500/10 bg-rose-500/5 px-6 py-14 text-center text-sm font-semibold text-rose-500"
          >
            {{ propertyStore.error }}
          </div>

          <!-- Empty -->
          <div
            v-else-if="filteredProperties.length === 0"
            class="rounded-[24px] border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-20 text-center text-sm text-(--color-muted) space-y-3"
          >
            <p class="font-bold text-(--color-text)">
              No results match your criteria
            </p>
            <p class="text-xs max-w-xs mx-auto">
              Try loosening your filter metrics or change your query location
              parameters.
            </p>
            <button
              @click="resetFilters"
              class="mt-2 text-xs font-bold text-(--color-primary) underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>

          <!-- Property Grid -->
          <div
            v-else
            class="grid gap-6"
            :class="
              viewMode === 'grid'
                ? 'sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
                : 'grid-cols-1'
            "
          >
            <article
              v-for="property in paginatedProperties"
              :key="property.id"
              class="group cursor-pointer overflow-hidden rounded-[24px] border border-(--color-border)/70 bg-(--color-surface) transition-all duration-300 hover:-translate-y-1 hover:border-(--color-primary)/40 hover:shadow-[var(--shadow-panel)]"
              @click="openProperty(property.id)"
            >
              <!-- Property Image -->
              <div class="relative h-52 overflow-hidden bg-(--color-surface-soft)">
                <img
                  :src="property.image || placeholderImage"
                  :alt="property.name"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent"></div>
                <div class="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold capitalize text-slate-800 shadow-sm backdrop-blur-md">
                    <BuildingOffice2Icon class="h-3.5 w-3.5 text-(--color-primary)" />
                    {{ property.type }}
                  </span>
                </div>
                <span class="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <StarIcon class="h-3.5 w-3.5 text-amber-300" />
                  {{ property.rating }}
                </span>
              </div>

              <!-- Property Info -->
              <div class="space-y-4 p-4">
                <h3
                  class="line-clamp-1 text-base font-black tracking-tight text-(--color-text)"
                >
                  {{ property.name }}
                </h3>
                <p class="flex items-center gap-1.5 text-xs font-semibold text-(--color-muted)">
                  <MapPinIcon class="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <span class="truncate">{{ property.location }}</span>
                </p>
                <p class="line-clamp-2 min-h-[40px] text-sm leading-5 text-(--color-muted)">
                  {{ property.description }}
                </p>

                <div class="flex items-end justify-between gap-3 border-t border-(--color-border)/60 pt-4">
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-(--color-muted)">
                      From
                    </p>
                    <span class="text-lg font-black text-(--color-primary)">
                    ${{ property.price
                    }}<span class="text-xs font-medium text-(--color-muted)"
                      >/night</span
                    >
                    </span>
                  </div>
                  <span class="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-(--color-primary-soft) px-3 py-2 text-xs font-bold text-(--color-primary) transition group-hover:bg-(--color-primary) group-hover:text-white">
                    View
                    <ArrowRightIcon class="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <PropertyPagination
            v-if="totalPages > 1"
            v-model:currentPage="currentPage"
            :totalPages="totalPages"
            class="mt-8"
          />
        </section>
      </div>
    </section>
  </main>
</template>
