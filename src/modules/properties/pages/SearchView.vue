<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { propertyApi } from "@/modules/properties/api/property.api";
import { formatPrice } from "@/shared/utils/currency";

import { usePropertyStore } from "../store/propertyStore";
import { useWishlistStore } from "@/modules/wishlists/store/wishlistStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import PropertyFilter from "@/modules/properties/components/PropertyFilter.vue";
import SearchBar from "@/modules/properties/components/SearchBar.vue";
import PropertySortBar from "../components/PropertySortBar.vue";
import PropertyPagination from "../components/PropertyPagination.vue";
import placeholderImage from "@/assets/images/properties/placeholder.png";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  MapIcon,
} from "@heroicons/vue/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

const { t, te } = useI18n({ useScope: "global" });
const router = useRouter();
const route = useRoute();
const propertyStore = usePropertyStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

// ── UI state ──────────────────────────────────────────────────────────────────
const sortBy = ref("newest");
const viewMode = ref("grid");
const currentPage = ref(1);
const itemsPerPage = 9;
const showMapModal = ref(false);
const hoveredPropertyId = ref(null);

// ── Hero Slideshow State ──────────────────────────────────────────────────────
const currentSlide = ref(0);
let slideInterval = null;

const heroSlides = [
  {
    title: "Mystical Siem Reap",
    subtitle: "Explore ancient wonders, temple majestic sunrises, and world-class luxury stays right beside Angkor Wat.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop",
    badge: "Historic Heritage",
    location: "Siem Reap, Cambodia"
  },
  {
    title: "Pristine Koh Rong",
    subtitle: "Discover crystal-clear waters, white sand beaches, and state-of-the-art island villas offering ultimate privacy.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1400&auto=format&fit=crop",
    badge: "Island Paradise",
    location: "Koh Rong, Sihanoukville"
  },
  {
    title: "Vibrant Phnom Penh",
    subtitle: "Experience the bustling energy of the capital, breathtaking skyline views, and sophisticated urban high-rises.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop",
    badge: "Capital City",
    location: "Phnom Penh, Cambodia"
  },
  {
    title: "Serene Kampot & Kep",
    subtitle: "Unwind in tranquil riverside boutique retreats, pepper farms, and lush mountain backdrops.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1400&auto=format&fit=crop",
    badge: "Nature Escape",
    location: "Kampot Province"
  }
];

const startSlideTimer = () => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroSlides.length;
  }, 5500);
};

const goToSlide = (index) => {
  currentSlide.value = index;
  clearInterval(slideInterval);
  startSlideTimer();
};

const toggleSave = async (id, e) => {
  e.stopPropagation();
  if (!authStore.isAuthenticated) {
    toastStore.showToast(safeT("wishlist.loginRequired", "Please login to save properties to your wishlist"), "error");
    return;
  }
  const success = await wishlistStore.toggleWishlist(id);
  if (success) {
    const isNowSaved = wishlistStore.isPropertySaved(id);
    toastStore.showToast(
      isNowSaved ? safeT("wishlist.added", "Added to wishlist!") : safeT("wishlist.removed", "Removed from wishlist!"),
      "success"
    );
  } else {
    toastStore.showToast(safeT("wishlist.failed", "Failed to update wishlist"), "error");
  }
};

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

const minimumRatings = [0, 4, 4.5, 4.8];

// ── Computed stats ────────────────────────────────────────────────────────────
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.query.trim()) count++;
  if (filters.value.city !== "all") count++;
  if (filters.value.type !== "all") count++;
  if (filters.value.maxPrice < 220) count++;
  if (filters.value.minRating > 0) count++;
  return count;
});

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

const getMapPinPosition = (index) => {
  const positions = [
    { top: "42%", left: "48%" },
    { top: "35%", left: "53%" },
    { top: "48%", left: "45%" },
    { top: "52%", left: "55%" },
    { top: "30%", left: "42%" },
    { top: "58%", left: "50%" },
  ];
  return positions[index % positions.length];
};

onMounted(async () => {
  startSlideTimer();

  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlists();
  }

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

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval);
});
</script>

<template>
  <main class="bg-(--color-page) text-(--color-text) min-h-screen antialiased pt-[80px] sm:pt-[88px] md:pt-[96px] pb-24">
    <!-- ── Spectacular Hero Slideshow & Search Section ── -->
    <section class="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10 pt-4">
      <!-- Outer Hero Showcase Box -->
      <div
        class="relative w-full h-[360px] sm:h-[420px] md:h-[480px] bg-(--color-surface) border border-(--color-border) shadow-xl overflow-hidden flex flex-col justify-between p-6 sm:p-10 transition-all duration-500"
        style="border-radius: var(--radius-sm);"
      >
        <!-- Background Slides Carousel -->
        <div
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out z-0"
          :class="currentSlide === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
        >
          <img
            :src="slide.image"
            :alt="slide.title"
            class="w-full h-full object-cover transition-transform duration-[6000ms] ease-out"
            :class="currentSlide === index ? 'scale-105' : 'scale-100'"
          />
          <!-- Rich Multi-Stop Gradients for Phenomenal Text Contrast & Depth -->
          <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10"></div>
        </div>

        <!-- Top Content Overlay (Titles & Slide Navigation) -->
        <div class="relative z-20 flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full max-w-5xl">
          <!-- Text Details -->
          <div class="space-y-3 max-w-2xl">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span
                class="inline-flex items-center gap-1.5 bg-(--color-primary) text-white font-black text-xs px-3 py-1 uppercase tracking-widest shadow-md"
                style="border-radius: var(--radius-sm);"
              >
                <SparklesIcon class="h-3.5 w-3.5 text-white animate-pulse" />
                {{ heroSlides[currentSlide].badge }}
              </span>
              <span class="text-xs font-bold text-gray-300 inline-flex items-center gap-1 backdrop-blur-md bg-white/10 px-3 py-1 border border-white/20" style="border-radius: var(--radius-sm);">
                <MapPinIcon class="h-3.5 w-3.5 text-(--color-primary)" />
                {{ heroSlides[currentSlide].location }}
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {{ heroSlides[currentSlide].title }}
            </h1>
            <p class="text-xs sm:text-sm md:text-base font-medium text-gray-200 leading-relaxed drop-shadow-sm max-w-xl">
              {{ heroSlides[currentSlide].subtitle }}
            </p>
          </div>

          <!-- Slide Nav Indicators -->
          <div class="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center bg-black/40 backdrop-blur-md p-2 border border-white/20 shadow-lg" style="border-radius: var(--radius-sm);">
            <button
              v-for="(slide, index) in heroSlides"
              :key="index"
              type="button"
              class="w-10 h-1.5 sm:w-12 sm:h-2 transition-all duration-300 cursor-pointer"
              style="border-radius: var(--radius-sm);"
              :class="currentSlide === index ? 'bg-(--color-primary) shadow-lg shadow-(--color-primary)/50 scale-105' : 'bg-white/40 hover:bg-white/70'"
              @click="goToSlide(index)"
              :aria-label="`Go to slide ${index + 1}`"
            ></button>
          </div>
        </div>

        <!-- Bottom Integrated SearchBar (Embedded in Hero with Glassmorphism) -->
        <div class="relative z-20 w-full max-w-3xl mt-auto pt-6">
          <SearchBar
            v-model="filters"
            :cityOptions="cityOptions"
            :activeFilterCount="activeFilterCount"
            @reset="resetFilters"
          />
        </div>
      </div>
    </section>

    <!-- ── Main Content Layout (Sidebar + Grid) ── -->
    <section class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
        <!-- Left Sidebar: Compact Filters -->
        <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <PropertyFilter
            v-model="filters"
            :activeFilterCount="activeFilterCount"
            :cityOptions="cityOptions"
            :minimumRatings="minimumRatings"
            :propertyCountByCity="propertyCountByCity"
            @reset="resetFilters"
          />
        </aside>

        <!-- Right: Sort Bar + Properties Grid -->
        <section class="min-w-0 space-y-6">
          <!-- Sort Bar Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-(--color-surface) py-3.5 px-5 rounded-sm border border-(--color-border) shadow-xs transition-colors duration-300" style="border-radius: var(--radius-sm);">
            <p class="text-sm font-bold text-(--color-text)">
              {{ filteredProperties.length }} {{ safeT("propertiesPage.resultsFound", "properties found") }}
            </p>

            <PropertySortBar
              v-model="sortBy"
              v-model:viewMode="viewMode"
            />
          </div>

          <!-- Loading State -->
          <div
            v-if="propertyStore.loading"
            class="rounded-sm border border-(--color-border) bg-(--color-surface) px-6 py-20 text-center text-sm font-medium text-(--color-muted) animate-pulse"
            style="border-radius: var(--radius-sm);"
          >
            {{ safeT("propertiesPage.loading", "Searching available properties...") }}
          </div>

          <!-- Error State -->
          <div
            v-else-if="propertyStore.error"
            class="rounded-sm border border-rose-500/10 bg-rose-500/5 px-6 py-14 text-center text-sm font-semibold text-rose-500"
            style="border-radius: var(--radius-sm);"
          >
            {{ propertyStore.error }}
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredProperties.length === 0"
            class="rounded-sm border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-20 text-center text-sm text-(--color-muted) space-y-3"
            style="border-radius: var(--radius-sm);"
          >
            <p class="font-bold text-(--color-text) text-lg">{{ safeT("propertiesPage.noResults", "No properties match your filter criteria") }}</p>
            <p class="text-xs max-w-xs mx-auto">{{ safeT("propertiesPage.noResultsDesc", "Try loosening your filter metrics, adjusting price thresholds, or resetting your query parameters.") }}</p>
            <button @click="resetFilters" class="mt-4 px-6 py-2.5 rounded-sm bg-(--color-primary) text-white text-xs font-bold shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer" style="border-radius: var(--radius-sm);">
              {{ safeT("propertiesPage.filters.reset", "Clear All Filters") }}
            </button>
          </div>

          <!-- Properties List/Grid -->
          <div
            v-else
            :class="viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10'"
          >
            <article
              v-for="property in paginatedProperties"
              :key="property.id"
              class="group cursor-pointer overflow-hidden bg-transparent transition-all duration-300 flex flex-col"
              :class="viewMode === 'list' ? 'flex-col sm:flex-row gap-6 p-4 border border-(--color-border) rounded-2xl bg-(--color-surface) shadow-xs hover:shadow-xl hover:-translate-y-1' : 'w-full'"
              @click="openProperty(property.id)"
            >
              <!-- Property Image Section -->
              <div
                class="relative overflow-hidden bg-(--color-surface-soft) shrink-0"
                :class="viewMode === 'list' ? 'h-48 sm:h-48 sm:w-72 rounded-2xl border border-(--color-border)' : 'w-full aspect-[20/19] rounded-2xl mb-3 border border-(--color-border)/10 shadow-xs group-hover:shadow-md transition-shadow'"
              >
                <img
                  :src="property.image || placeholderImage"
                  :alt="property.name"
                  class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <!-- Heart Save Button (Airbnb Signature transparent heart with dark backdrop) -->
                <button
                  type="button"
                  class="absolute top-3 right-3 h-8 w-8 bg-black/30 backdrop-blur-xs hover:bg-black/45 rounded-full flex items-center justify-center border-none active:scale-90 z-20 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                  @click="(e) => toggleSave(property.id, e)"
                >
                  <HeartIconSolid v-if="wishlistStore.isPropertySaved(property.id)" class="h-4.5 w-4.5 text-rose-500 animate-scaleUp" />
                  <HeartIcon v-else class="h-4.5 w-4.5 text-white stroke-[2.5] hover:scale-105 transition" />
                </button>

                <!-- Top Left Badges -->
                <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span
                    v-if="property.rating >= 4.8"
                    class="inline-flex items-center gap-1 rounded-full bg-white/95 text-gray-900 font-extrabold px-3 py-1 text-[9px] shadow-md tracking-wider uppercase"
                  >
                    <SparklesIcon class="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>Guest favorite</span>
                  </span>
                  <span
                    v-else-if="!property.rating || property.rating === 0"
                    class="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white font-extrabold px-3 py-1 text-[9px] shadow-md tracking-wider uppercase"
                  >
                    <span>New Listing</span>
                  </span>
                </div>
              </div>

              <!-- Property Details Section -->
              <div class="flex flex-col justify-between flex-1 min-w-0" :class="viewMode === 'list' ? 'py-1 pr-2' : 'p-0.5'">
                <div>
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="text-sm font-extrabold text-(--color-text) group-hover:text-(--color-primary) transition-colors duration-200 truncate">
                      {{ property.name }}
                    </h3>
                    <div v-if="property.rating > 0" class="flex items-center gap-1 text-sm font-bold text-(--color-text) shrink-0">
                      <StarIconSolid class="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{{ Number(property.rating).toFixed(1) }}</span>
                    </div>
                    <div v-else class="text-xs font-bold text-(--color-muted) shrink-0">
                      {{ safeT("propertiesPage.new", "New") }}
                    </div>
                  </div>

                  <!-- Location & Distance -->
                  <p class="text-xs font-semibold text-(--color-muted) mt-1 truncate">
                    {{ property.location || property.city || 'Cambodia' }}
                  </p>

                  <!-- Specifications -->
                  <p class="text-xs font-semibold text-(--color-muted) mt-0.5 capitalize truncate">
                    {{ property.type || 'Stay' }} • Free cancellation
                  </p>
                </div>

                <!-- Price -->
                <div class="mt-2 flex items-baseline gap-1">
                  <span class="text-sm font-black text-(--color-text)">{{ formatPrice(property.price) }}</span>
                  <span class="text-xs font-normal text-(--color-muted)">/ night</span>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <PropertyPagination
            v-if="totalPages > 1"
            v-model:currentPage="currentPage"
            :totalPages="totalPages"
            class="mt-12 border-t border-(--color-border)/40 pt-8"
          />
        </section>
      </div>
    </section>

    <!-- ── Floating "Show Map" Action Button (Fixed Bottom Center) ── -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <button
        type="button"
        class="flex items-center gap-2 px-6 py-3 rounded-sm bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 font-bold text-sm border border-white/20 dark:border-black/20"
        style="border-radius: var(--radius-sm);"
        @click="showMapModal = true"
      >
        <span>{{ safeT("propertiesPage.showMap", "Show Map") }}</span>
        <MapIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- ── Fullscreen Interactive Map Modal ── -->
    <div v-if="showMapModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300" @click.self="showMapModal = false">
      <div class="flex max-h-[90vh] h-full w-full max-w-7xl overflow-hidden rounded-sm bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp flex-col lg:flex-row" style="border-radius: var(--radius-sm);">
        <!-- Left Property Side Panel -->
        <div class="w-full lg:w-96 h-1/3 lg:h-full overflow-y-auto p-4 border-b lg:border-b-0 lg:border-r border-(--color-border) flex flex-col gap-4 bg-(--color-surface)">
          <div class="flex items-center justify-between border-b pb-3 border-(--color-border)">
            <h3 class="text-lg font-black text-(--color-text)">{{ safeT("propertiesPage.mapProperties", "Properties on Map") }}</h3>
            <button type="button" class="p-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition active:scale-95" style="border-radius: var(--radius-sm);" @click="showMapModal = false">
              <XMarkIcon class="h-6 w-6 text-(--color-text)" />
            </button>
          </div>
          <div class="space-y-3 overflow-y-auto pr-1">
            <div
              v-for="property in paginatedProperties"
              :key="property.id"
              class="flex gap-3 p-2.5 rounded-sm border border-(--color-border) bg-(--color-page) hover:shadow-md transition cursor-pointer"
              style="border-radius: var(--radius-sm);"
              :class="hoveredPropertyId === property.id ? 'border-(--color-primary) ring-1 ring-(--color-primary)' : ''"
              @mouseenter="hoveredPropertyId = property.id"
              @mouseleave="hoveredPropertyId = null"
              @click="openProperty(property.id)"
            >
              <img :src="property.image || placeholderImage" class="h-20 w-20 object-cover rounded-sm shrink-0" style="border-radius: var(--radius-sm);" alt="thumb" />
              <div class="flex flex-col justify-between min-w-0 flex-1">
                <div>
                  <h4 class="text-xs font-bold text-(--color-text) truncate">{{ property.name }}</h4>
                  <p class="text-[11px] font-medium text-(--color-muted) truncate">{{ property.location || property.city }}</p>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs font-bold text-(--color-text)">{{ formatPrice(property.price) }}/{{ safeT("propertiesPage.night", "night") }}</span>
                  <span class="inline-flex items-center gap-1 text-xs font-bold text-white bg-(--color-primary) px-1.5 py-0.5 rounded-sm" style="border-radius: var(--radius-sm);">
                    ★ {{ property.rating > 0 ? Number(property.rating).toFixed(1) : safeT("propertiesPage.new", "New") }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Embedded Live Map View -->
        <div class="flex-1 h-2/3 lg:h-full relative bg-sky-50 dark:bg-neutral-900">
          <iframe
            title="Interactive Live Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=104.85,11.5,105.0,11.65&layer=mapnik"
            class="absolute inset-0 h-full w-full border-none filter contrast-105 select-none"
            style="pointer-events: auto;"
          ></iframe>

          <!-- Map Pin Overlays -->
          <div class="absolute inset-0 pointer-events-none p-8">
            <div
              v-for="(property, index) in paginatedProperties"
              :key="property.id"
              class="absolute pointer-events-auto transition-all duration-300"
              :style="getMapPinPosition(index)"
            >
              <button
                type="button"
                class="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-black shadow-xl transition-all duration-200 border"
                style="border-radius: var(--radius-sm);"
                :class="hoveredPropertyId === property.id ? 'bg-(--color-primary) text-white border-white scale-125 z-30 shadow-2xl' : 'bg-white text-gray-900 border-black/10 hover:scale-110 z-10'"
                @mouseenter="hoveredPropertyId = property.id"
                @mouseleave="hoveredPropertyId = null"
                @click="openProperty(property.id)"
              >
                <span>{{ formatPrice(property.price) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
