<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { usePropertyStore } from "../store/propertyStore";
import PropertyFilter from "@/modules/properties/components/PropertyFilter.vue";
import SearchBar from "@/modules/properties/components/SearchBar.vue";
import PropertySortBar from "../components/PropertySortBar.vue";
import PropertyPagination from "../components/PropertyPagination.vue";

const { t, te } = useI18n({ useScope: "global" });
const router = useRouter();
const propertyStore = usePropertyStore();

// ── UI state ──────────────────────────────────────────────────────────────────
const sortBy = ref("newest");
const viewMode = ref("grid");
const currentPage = ref(1);
const itemsPerPage = 6;

// ── Filters ───────────────────────────────────────────────────────────────────
const filters = ref({
  query: "",
  city: "all",
  type: "all",
  province: "all",
  maxPrice: 220,
  minRating: 0,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

// ── Filter options ────────────────────────────────────────────────────────────
const cityOptions = computed(() => [
  { value: "all", label: safeT("home.search.allCities", "All Cities") },
  { value: "phnom-penh", label: safeT("home.cities.phnomPenh", "Phnom Penh") },
  { value: "siem-reap", label: safeT("home.cities.siemReap", "Siem Reap") },
  {
    value: "sihanoukville",
    label: safeT("home.cities.sihanoukville", "Sihanoukville"),
  },
  { value: "battambang", label: safeT("home.cities.battambang", "Battambang") },
  { value: "kampot", label: safeT("home.cities.kampot", "Kampot") },
]);

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
    maxPrice: 220,
    minRating: 0,
  };
};

const openProperty = (propertyId) => {
  router.push({ name: "public.property-detail", params: { id: propertyId } });
};

onMounted(async () => {
  try {
    await propertyStore.fetchApprovedProperties({
      search: filters.value.query,
      city: filters.value.city,
      category: filters.value.type,
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
      class="relative bg-(--color-primary-strong) overflow-hidden min-h-[400px] sm:min-h-[440px] flex items-center"
    >
      <div
        class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
      ></div>

      <div class="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
        <div
          class="absolute inset-0 bg-gradient-to-r from-(--color-primary-strong) via-(--color-primary-strong)/40 to-transparent z-10"
        ></div>
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
          alt="Premium Resort Space Background"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <div
        class="relative z-20 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8"
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
              {{ safeT("nav.properties", "Properties Explore") }}
            </p>
          </div>
          <h1
            class="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl tracking-tight"
          >
            {{ safeT("propertiesPage.hero.title", "Find Your Perfect Stay") }}
          </h1>
          <p
            class="mt-4 text-sm sm:text-base leading-relaxed text-sky-100/70 max-w-lg"
          >
            {{
              safeT(
                "propertiesPage.hero.subtitle",
                "Discover hand-picked premium spaces across Cambodia's finest locations.",
              )
            }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Search Bar ─────────────────────────────────────────────────────────── -->
    <section class="relative z-40 -mt-10 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <SearchBar
          v-model="filters"
          :cityOptions="cityOptions"
          :typeOptions="typeOptions"
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
            class="rounded-[24px] border border-(--color-border)/60 bg-(--color-surface) p-2"
          >
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
          </div>
        </aside>

        <!-- Right: Sort + Grid + Pagination -->
        <section class="min-w-0">
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
              class="cursor-pointer rounded-[24px] border border-(--color-border)/60 bg-(--color-surface) overflow-hidden hover:shadow-lg transition-all duration-300"
              @click="openProperty(property.id)"
            >
              <!-- Property Image -->
              <div class="relative h-48 overflow-hidden">
                <img
                  :src="property.image"
                  :alt="property.name"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <!-- Property Info -->
              <div class="p-4 space-y-2">
                <h3
                  class="text-sm font-black text-(--color-text) tracking-tight truncate"
                >
                  {{ property.name }}
                </h3>
                <p class="text-xs text-(--color-muted) font-medium">
                  {{ property.location }}
                </p>
                <div class="flex items-center justify-between pt-1">
                  <span class="text-sm font-black text-(--color-primary)">
                    ${{ property.price
                    }}<span class="text-xs font-medium text-(--color-muted)"
                      >/night</span
                    >
                  </span>
                  <span class="text-xs font-bold text-(--color-muted)">
                    ⭐ {{ property.rating }}
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
