<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import aboutHero from "@/assets/images/about/hero/hero_section.png";
import AppButton from "@/shared/components/AppButton.vue";
import { getStoredTheme } from "@/shared/services/themeStorage";

const { t, locale } = useI18n({ useScope: "global" });
const route = useRoute();
const currentTheme = ref(getStoredTheme());
const systemTheme = ref("light");
let systemThemeQuery;
let themeObserver;

const propertyDefinitions = [
  {
    id: 1,
    name: "Sokha Phnom Penh Riverside Residence",
    city: "phnom-penh",
    type: "hotel",
    price: 89,
    rating: 4.8,
    reviews: 245,
    badgeKey: "mostPopular",
    badgeTone: "blue",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "sokha",
    highlightKeys: ["freeWifi", "pool", "restaurant", "airportPickup"],
    featuredRank: 97,
  },
  {
    id: 2,
    name: "Angkor Winding View Hotel",
    city: "siem-reap",
    type: "hotel",
    price: 65,
    rating: 4.6,
    reviews: 183,
    badgeKey: "topRated",
    badgeTone: "emerald",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "angkor",
    highlightKeys: ["freeWifi", "pool", "breakfast", "quietCourtyard"],
    featuredRank: 91,
  },
  {
    id: 3,
    name: "Pearl Island Beach Resort",
    city: "sihanoukville",
    type: "resort",
    price: 145,
    rating: 4.9,
    reviews: 312,
    badgeKey: "luxuryEscape",
    badgeTone: "amber",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "pearlIsland",
    highlightKeys: ["beachfront", "infinityPool", "spa", "seafoodGrill"],
    featuredRank: 99,
  },
  {
    id: 4,
    name: "Mango Riverside Lodge",
    city: "kampot",
    type: "homestay",
    price: 42,
    rating: 4.7,
    reviews: 96,
    badgeKey: "bestValue",
    badgeTone: "sky",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "mango",
    highlightKeys: ["breakfast", "riverView", "garden", "bicycleRental"],
    featuredRank: 89,
  },
  {
    id: 5,
    name: "Battambang Heritage Inn",
    city: "battambang",
    type: "guesthouse",
    price: 38,
    rating: 4.5,
    reviews: 74,
    badgeKey: "localFavorite",
    badgeTone: "slate",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "heritageInn",
    highlightKeys: ["freeWifi", "terrace", "tourBooking", "lateCheckIn"],
    featuredRank: 82,
  },
  {
    id: 6,
    name: "Le Phnom Sky Penthouse",
    city: "phnom-penh",
    type: "apartment",
    price: 195,
    rating: 4.8,
    reviews: 58,
    badgeKey: "cityView",
    badgeTone: "rose",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "skyPenthouse",
    highlightKeys: ["rooftopPool", "gym", "workspace", "fastCheckIn"],
    featuredRank: 88,
  },
  {
    id: 7,
    name: "Temple Garden Villa",
    city: "siem-reap",
    type: "villa",
    price: 118,
    rating: 4.9,
    reviews: 141,
    badgeKey: "privateRetreat",
    badgeTone: "indigo",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "templeGarden",
    highlightKeys: ["privatePatio", "familyRooms", "pool", "airportPickup"],
    featuredRank: 95,
  },
  {
    id: 8,
    name: "Salt Breeze Cliff Resort",
    city: "kampot",
    type: "resort",
    price: 129,
    rating: 4.7,
    reviews: 128,
    badgeKey: "sunsetPick",
    badgeTone: "orange",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    descriptionKey: "saltBreeze",
    highlightKeys: ["sunsetDeck", "spa", "kayaks", "breakfast"],
    featuredRank: 90,
  },
];

const filters = ref({
  query: "",
  city: "all",
  type: "all",
  maxPrice: 220,
  minRating: 0,
  sortBy: "recommended",
});

const viewMode = ref("grid");

const syncThemeState = () => {
  currentTheme.value = getStoredTheme();
  systemTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const handleSystemThemeChange = (event) => {
  systemTheme.value = event.matches ? "dark" : "light";
};

onMounted(() => {
  syncThemeState();

  systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);

  themeObserver = new MutationObserver(syncThemeState);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  systemThemeQuery?.removeEventListener("change", handleSystemThemeChange);
  themeObserver?.disconnect();
});

const resolvedTheme = computed(() =>
  currentTheme.value === "system" ? systemTheme.value : currentTheme.value,
);

const properties = computed(() =>
  propertyDefinitions.map((property) => ({
    ...property,
    badge: t(`propertiesPage.badges.${property.badgeKey}`),
    description: t(`propertiesPage.descriptions.${property.descriptionKey}`),
    highlights: property.highlightKeys.map((highlight) =>
      t(`propertiesPage.highlights.${highlight}`),
    ),
  })),
);

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

const sortOptions = computed(() => [
  { value: "recommended", label: t("propertiesPage.sort.recommended") },
  { value: "price-low", label: t("propertiesPage.sort.priceLow") },
  { value: "price-high", label: t("propertiesPage.sort.priceHigh") },
  { value: "rating", label: t("propertiesPage.sort.guestRating") },
]);

const badgeToneClasses = {
  blue: "bg-[#0f67b3] text-white",
  emerald: "bg-emerald-500 text-white",
  amber: "bg-[#e0b65a] text-[#1e2d4b]",
  sky: "bg-sky-500 text-white",
  slate: "bg-slate-600 text-white",
  rose: "bg-rose-500 text-white",
  indigo: "bg-indigo-500 text-white",
  orange: "bg-orange-500 text-white",
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const cityLabelMap = computed(() =>
  Object.fromEntries(
    cityOptions.value.map((option) => [option.value, option.label]),
  ),
);

const typeLabelMap = computed(() =>
  Object.fromEntries(
    typeOptions.value.map((option) => [option.value, option.label]),
  ),
);

const syncFiltersFromRoute = () => {
  const cityFromRoute =
    typeof route.query.city === "string" ? route.query.city : "";
  const matchedCity = cityOptions.value.find(
    (option) =>
      option.value !== "all" &&
      (normalize(option.label) === normalize(cityFromRoute) ||
        option.value === normalize(cityFromRoute).replace(/ /g, "-")),
  );

  filters.value.city = matchedCity?.value ?? "all";

  if (typeof route.query.search === "string") {
    filters.value.query = route.query.search;
  }
};

watch(
  [() => route.query.city, () => route.query.search, cityOptions],
  () => {
    syncFiltersFromRoute();
  },
  { immediate: true },
);

const tripDetails = computed(() => {
  const details = [];

  if (typeof route.query.checkIn === "string" && route.query.checkIn) {
    details.push({
      label: t("home.search.checkIn"),
      value: route.query.checkIn,
    });
  }

  if (typeof route.query.checkOut === "string" && route.query.checkOut) {
    details.push({
      label: t("home.search.checkOut"),
      value: route.query.checkOut,
    });
  }

  if (typeof route.query.guests === "string" && route.query.guests) {
    details.push({ label: t("home.search.guests"), value: route.query.guests });
  }

  return details;
});

const filteredProperties = computed(() => {
  const query = normalize(filters.value.query);

  return properties.value.filter((property) => {
    const matchesQuery =
      !query ||
      normalize(property.name).includes(query) ||
      normalize(property.description).includes(query) ||
      normalize(cityLabelMap.value[property.city]).includes(query);

    const matchesCity =
      filters.value.city === "all" || property.city === filters.value.city;
    const matchesType =
      filters.value.type === "all" || property.type === filters.value.type;
    const matchesBudget = property.price <= filters.value.maxPrice;
    const matchesRating = property.rating >= filters.value.minRating;

    return (
      matchesQuery &&
      matchesCity &&
      matchesType &&
      matchesBudget &&
      matchesRating
    );
  });
});

const sortedProperties = computed(() => {
  const collection = [...filteredProperties.value];

  switch (filters.value.sortBy) {
    case "price-low":
      return collection.sort((a, b) => a.price - b.price);
    case "price-high":
      return collection.sort((a, b) => b.price - a.price);
    case "rating":
      return collection.sort(
        (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      );
    default:
      return collection.sort((a, b) => b.featuredRank - a.featuredRank);
  }
});

const resultCount = computed(() => sortedProperties.value.length);

const activeFilterCount = computed(() => {
  let count = 0;

  if (filters.value.query.trim()) count += 1;
  if (filters.value.city !== "all") count += 1;
  if (filters.value.type !== "all") count += 1;
  if (filters.value.maxPrice < 220) count += 1;
  if (filters.value.minRating > 0) count += 1;

  return count;
});

const totalCities = computed(
  () => new Set(properties.value.map((property) => property.city)).size,
);

const averageRating = computed(() => {
  const total = properties.value.reduce(
    (sum, property) => sum + property.rating,
    0,
  );
  return (total / properties.value.length).toFixed(1);
});

const heroStats = computed(() => [
  {
    label: t("home.search.properties"),
    value: `${properties.value.length}+`,
    note: t("propertiesPage.stats.curatedStays"),
  },
  {
    label: t("home.search.cities"),
    value: `${totalCities.value}`,
    note: t("propertiesPage.stats.acrossCambodia"),
  },
  {
    label: t("propertiesPage.stats.averageRating"),
    value: averageRating.value,
    note: t("propertiesPage.stats.guestLovedListings"),
  },
]);

const minimumRatings = [0, 4, 4.5, 4.8];

const propertyCountByCity = (city) =>
  properties.value.filter((property) => property.city === city).length;

const whyBrowseItems = computed(() => [
  t("propertiesPage.whyBrowse.items.verified"),
  t("propertiesPage.whyBrowse.items.localFirst"),
  t("propertiesPage.whyBrowse.items.realFilters"),
]);

const formatPrice = (value) => `$${value}`;

const resetFilters = () => {
  filters.value = {
    query: "",
    city: "all",
    type: "all",
    maxPrice: 220,
    minRating: 0,
    sortBy: "recommended",
  };
};

const scrollToResults = () => {
  document.getElementById("property-results")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const resultsSummary = computed(() => {
  if (filters.value.city !== "all") {
    return cityLabelMap.value[filters.value.city];
  }

  return t("propertiesPage.results.allCambodia");
});
</script>

<template>
  <main :class="['properties-page overflow-hidden']">
    <section
      class="relative overflow-hidden bg-(--color-primary-strong) pt-36 pb-18 text-white"
    >
      <div class="absolute inset-0">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(95,177,255,0.35),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(145deg,rgba(4,27,67,0.96),rgba(8,51,113,0.86),rgba(10,99,170,0.72))]"
        ></div>
        <div
          class="absolute -top-20 right-[8%] h-64 w-64 rounded-full bg-white/8 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 left-[12%] h-40 w-40 rounded-full bg-sky-300/20 blur-3xl"
        ></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p
              class="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-sky-100/80"
            >
              {{ t("nav.properties") }}
            </p>
            <h1
              class="max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-[3.8rem]"
              :class="locale === 'km' ? 'font-kantumruy leading-[1.2]' : ''"
            >
              {{ t("propertiesPage.hero.title") }}
            </h1>
            <p
              class="mt-5 max-w-2xl text-base leading-8 text-sky-50/82 sm:text-lg"
              :class="locale === 'km' ? 'font-kantumruy leading-8' : ''"
            >
              {{ t("propertiesPage.hero.subtitle") }}
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <button
                v-for="city in cityOptions.slice(1)"
                :key="city.value"
                type="button"
                class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                :class="
                  filters.city === city.value
                    ? 'border-white/30 bg-white text-(--color-primary)'
                    : 'border-white/14 bg-white/8 text-white/88 backdrop-blur-xl hover:bg-white/14'
                "
                @click="filters.city = city.value"
              >
                {{ city.label }}
              </button>
            </div>

            <div class="mt-8 grid gap-4 sm:grid-cols-3">
              <article
                v-for="stat in heroStats"
                :key="stat.label"
                class="rounded-[24px] border border-white/12 bg-white/8 px-5 py-4 backdrop-blur-xl"
              >
                <p class="text-xs uppercase tracking-[0.22em] text-sky-100/60">
                  {{ stat.label }}
                </p>
                <p class="mt-3 text-3xl font-black text-white">
                  {{ stat.value }}
                </p>
                <p class="mt-2 text-sm text-sky-50/72">
                  {{ stat.note }}
                </p>
              </article>
            </div>
          </div>

          <section
            class="overflow-hidden rounded-[32px] border border-white/12 bg-white/10 shadow-[0_32px_80px_rgba(2,15,38,0.26)] backdrop-blur-2xl"
          >
            <div class="relative min-h-[250px]">
              <img
                :src="aboutHero"
                :alt="t('propertiesPage.hero.title')"
                class="absolute inset-0 h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,41,0.16),rgba(3,18,41,0.52)_64%,rgba(3,18,41,0.74))]"
              ></div>
              <div class="absolute inset-0 p-5 sm:p-6">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p
                      class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-100/75"
                    >
                      {{ t("propertiesPage.hero.smartBrowse") }}
                    </p>
                    <h2 class="mt-2 max-w-xs text-2xl font-black leading-tight text-white">
                      {{ t("propertiesPage.hero.shapeYourStay") }}
                    </h2>
                  </div>
                  <button
                    type="button"
                    class="rounded-full border border-white/18 bg-white/12 px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/18"
                    @click="resetFilters"
                  >
                    {{ t("propertiesPage.actions.reset") }}
                  </button>
                </div>

                <div class="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
                  <div class="rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/65">
                      {{ t("home.search.properties") }}
                    </p>
                    <p class="mt-2 text-2xl font-black text-white">
                      {{ heroStats[0].value }}
                    </p>
                    <p class="mt-1 text-sm text-sky-50/74">
                      {{ heroStats[0].note }}
                    </p>
                  </div>
                  <div class="rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/65">
                      {{ t("propertiesPage.stats.averageRating") }}
                    </p>
                    <p class="mt-2 text-2xl font-black text-white">
                      {{ heroStats[2].value }}
                    </p>
                    <p class="mt-1 text-sm text-sky-50/74">
                      {{ heroStats[2].note }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-5 sm:p-6">
              <label
                class="block text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70"
              >
                {{ t("propertiesPage.hero.searchLabel") }}
              </label>
              <div
                class="mt-2 flex items-center gap-3 rounded-[22px] border border-white/14 bg-(--color-surface-strong)/40 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <svg
                  class="h-5 w-5 shrink-0 text-white/52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="m20 20-3.5-3.5" stroke-linecap="round"></path>
                </svg>
                <input
                  v-model="filters.query"
                  type="text"
                  :placeholder="t('propertiesPage.hero.searchPlaceholder')"
                  class="w-full bg-transparent text-white placeholder:text-white/45 focus:outline-none"
                />
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-3">
                <label
                  class="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3"
                >
                  <span
                    class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/65"
                  >
                    {{ t("home.search.city") }}
                  </span>
                  <select
                    v-model="filters.city"
                    class="mt-2 w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                  >
                    <option
                      v-for="city in cityOptions"
                      :key="city.value"
                      :value="city.value"
                      class="text-(--color-text)"
                    >
                      {{ city.label }}
                    </option>
                  </select>
                </label>

                <label
                  class="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3"
                >
                  <span
                    class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/65"
                  >
                    {{ t("home.search.type") }}
                  </span>
                  <select
                    v-model="filters.type"
                    class="mt-2 w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                  >
                    <option
                      v-for="type in typeOptions"
                      :key="type.value"
                      :value="type.value"
                      class="text-(--color-text)"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                </label>

                <label
                  class="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3"
                >
                  <span
                    class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/65"
                  >
                    {{ t("propertiesPage.sort.label") }}
                  </span>
                  <select
                    v-model="filters.sortBy"
                    class="mt-2 w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                  >
                    <option
                      v-for="option in sortOptions"
                      :key="option.value"
                      :value="option.value"
                      class="text-(--color-text)"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>
              </div>

              <div
                class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/12 bg-(--color-surface-strong)/36 px-4 py-4"
              >
                <div class="text-sm text-sky-50/82">
                  <p class="font-semibold text-white">
                    {{
                      t("propertiesPage.hero.staysReadyToBrowse", {
                        count: resultCount,
                      })
                    }}
                  </p>
                  <p class="mt-1">
                    {{
                      t("propertiesPage.hero.activeFiltersSummary", {
                        count: activeFilterCount,
                        location: resultsSummary,
                      })
                    }}
                  </p>
                </div>

                <AppButton
                  variant="primary"
                  size="sm"
                  class="!rounded-full !bg-white !text-(--color-primary) hover:!bg-[#ecf7ff]"
                  @click="scrollToResults"
                >
                  {{ t("propertiesPage.actions.browseStays") }}
                </AppButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>

    <section class="relative -mt-8 pb-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="lg:sticky lg:top-32 lg:self-start">
            <div
              class="properties-panel rounded-[30px] border p-6 backdrop-blur-xl"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-primary)"
                  >
                    {{ t("propertiesPage.filters.title") }}
                  </p>
                  <h2 class="mt-2 text-2xl font-black text-(--color-text)">
                    {{ t("propertiesPage.filters.refineTrip") }}
                  </h2>
                </div>
                <span
                  class="rounded-full bg-(--color-primary-soft) px-3 py-1 text-sm font-semibold text-(--color-primary)"
                >
                  {{ activeFilterCount }}
                </span>
              </div>

              <div class="mt-6">
                <label
                  class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
                >
                  {{ t("propertiesPage.filters.maxPricePerNight") }}
                </label>
                <div
                  class="mt-3 flex items-center justify-between text-sm font-semibold text-(--color-text)"
                >
                  <span>{{ formatPrice(0) }}</span>
                  <span>{{ formatPrice(filters.maxPrice) }}</span>
                </div>
                <input
                  v-model="filters.maxPrice"
                  type="range"
                  min="30"
                  max="220"
                  step="5"
                  class="property-range mt-3 w-full"
                  style="accent-color: var(--color-primary)"
                />
              </div>

              <div class="mt-8">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
                >
                  {{ t("home.search.city") }}
                </p>
                <div class="mt-3 space-y-2">
                  <button
                    v-for="city in cityOptions.slice(1)"
                    :key="city.value"
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
                    :class="
                      filters.city === city.value
                        ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-text) hover:border-(--color-primary)/20 hover:bg-(--color-surface-soft)'
                    "
                    @click="
                      filters.city =
                        filters.city === city.value ? 'all' : city.value
                    "
                  >
                    <span>{{ city.label }}</span>
                    <span class="text-xs text-(--color-muted)">
                      {{ propertyCountByCity(city.value) }}
                    </span>
                  </button>
                </div>
              </div>

              <div class="mt-8">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
                >
                  {{ t("home.search.type") }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="type in typeOptions.slice(1)"
                    :key="type.value"
                    type="button"
                    class="rounded-full border px-3.5 py-2 text-sm font-semibold transition"
                    :class="
                      filters.type === type.value
                        ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)'
                    "
                    @click="
                      filters.type =
                        filters.type === type.value ? 'all' : type.value
                    "
                  >
                    {{ type.label }}
                  </button>
                </div>
              </div>

              <div class="mt-8">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-muted)"
                >
                  {{ t("propertiesPage.filters.minimumRating") }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="rating in minimumRatings"
                    :key="rating"
                    type="button"
                    class="rounded-full border px-3.5 py-2 text-sm font-semibold transition"
                    :class="
                      filters.minRating === rating
                        ? 'border-(--color-primary)/30 bg-(--color-primary-soft) text-(--color-primary)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)'
                    "
                    @click="filters.minRating = rating"
                  >
                    {{
                      rating === 0
                        ? t("propertiesPage.filters.all")
                        : `${rating}+`
                    }}
                  </button>
                </div>
              </div>

              <div
                class="mt-8 rounded-[24px] bg-[linear-gradient(145deg,#082b58,#0f67b3)] p-5 text-white shadow-[0_18px_40px_rgba(7,42,103,0.22)]"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-[0.22em] text-white/62"
                >
                  {{ t("propertiesPage.whyBrowse.title") }}
                </p>
                <ul class="mt-4 space-y-3 text-sm leading-6 text-white/82">
                  <li v-for="item in whyBrowseItems" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </aside>

          <section id="property-results" class="min-w-0">
            <div
              class="properties-panel rounded-[30px] border px-5 py-5 backdrop-blur-xl sm:px-6"
            >
              <div
                class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-primary)"
                  >
                    {{ t("propertiesPage.results.eyebrow") }}
                  </p>
                  <h2 class="mt-2 text-2xl font-black text-(--color-text)">
                    {{
                      t("propertiesPage.results.title", {
                        count: resultCount,
                        location: resultsSummary,
                      })
                    }}
                  </h2>
                  <div
                    v-if="tripDetails.length"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <span
                      v-for="detail in tripDetails"
                      :key="detail.label"
                      class="rounded-full bg-(--color-primary-soft) px-3 py-1.5 text-xs font-semibold text-(--color-primary)"
                    >
                      {{ detail.label }}: {{ detail.value }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <label
                    class="flex items-center gap-3 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-text)"
                  >
                    <svg
                      class="h-4 w-4 text-(--color-muted)"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        d="M8 7h10M8 12h6M8 17h3M4 7h.01M4 12h.01M4 17h.01"
                        stroke-linecap="round"
                      ></path>
                    </svg>
                    <select
                      v-model="filters.sortBy"
                      class="bg-transparent focus:outline-none"
                    >
                      <option
                        v-for="option in sortOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <div
                    class="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) p-1"
                  >
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 text-sm font-semibold transition"
                      :class="
                        viewMode === 'grid'
                          ? 'bg-(--color-primary) text-white'
                          : 'text-(--color-muted) hover:text-(--color-text)'
                      "
                      @click="viewMode = 'grid'"
                    >
                      {{ t("propertiesPage.actions.grid") }}
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 text-sm font-semibold transition"
                      :class="
                        viewMode === 'list'
                          ? 'bg-(--color-primary) text-white'
                          : 'text-(--color-muted) hover:text-(--color-text)'
                      "
                      @click="viewMode = 'list'"
                    >
                      {{ t("propertiesPage.actions.list") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="sortedProperties.length"
              class="mt-6"
              :class="
                viewMode === 'grid'
                  ? 'grid gap-7 md:grid-cols-2 2xl:grid-cols-3'
                  : 'space-y-5'
              "
            >
              <article
                v-for="property in sortedProperties"
                :key="property.id"
                class="properties-card group overflow-hidden rounded-[26px] border transition duration-300 hover:-translate-y-1.5"
                :class="
                  viewMode === 'list'
                    ? 'grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]'
                    : ''
                "
              >
                <div
                  class="relative overflow-hidden"
                  :class="
                    viewMode === 'list'
                      ? 'h-full min-h-[260px]'
                      : 'aspect-[5/3]'
                  "
                >
                  <img
                    :src="property.image"
                    :alt="property.name"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,42,103,0.08),transparent_45%,rgba(6,19,41,0.58))]"
                  ></div>
                  <div
                    class="absolute inset-x-0 top-0 flex items-start justify-between p-4"
                  >
                    <span
                      class="rounded-full px-3 py-1 text-[11px] font-bold shadow-lg"
                      :class="badgeToneClasses[property.badgeTone]"
                    >
                      {{ property.badge }}
                    </span>
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-(--color-primary) shadow-md transition hover:bg-white"
                      :aria-label="t('propertiesPage.cards.saveProperty')"
                    >
                      <svg
                        class="h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >
                        <path
                          d="m12 20-1.45-1.32C5.4 14.05 2 10.97 2 7.2 2 4.12 4.42 2 7.3 2c1.74 0 3.41.81 4.7 2.09A6.45 6.45 0 0 1 16.7 2C19.58 2 22 4.12 22 7.2c0 3.77-3.4 6.85-8.55 11.49L12 20Z"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div class="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p
                      class="mt-2 inline-flex rounded-full bg-white/14 px-3 py-1 text-xs font-semibold backdrop-blur-md"
                    >
                      {{ typeLabelMap[property.type] }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col p-4">
                  <div>
                    <h3
                      class="min-h-[3.4rem] text-[1.1rem] font-black leading-snug text-(--color-text)"
                    >
                      {{ property.name }}
                    </h3>

                    <div
                      class="mt-2 flex items-center gap-1.5 text-sm text-(--color-muted)"
                    >
                      <svg
                        class="h-3.5 w-3.5 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >
                        <path
                          d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <circle cx="12" cy="10" r="2.5"></circle>
                      </svg>
                      <span>{{ cityLabelMap[property.city] }}</span>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        v-for="highlight in property.highlights.slice(0, 3)"
                        :key="highlight"
                        class="rounded-full bg-(--color-surface-soft) px-2.5 py-1 text-[11px] font-semibold text-(--color-primary)"
                      >
                        {{ highlight }}
                      </span>
                      <span
                        v-if="property.highlights.length > 3"
                        class="rounded-full bg-(--color-surface-soft) px-2.5 py-1 text-[11px] font-semibold text-(--color-muted)"
                      >
                        +{{ property.highlights.length - 3 }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="mt-4 flex items-center justify-between gap-4 border-t border-(--color-border) pt-3.5"
                  >
                    <div class="flex items-center gap-1.5 text-sm">
                      <span
                        class="inline-flex items-center gap-1 text-amber-600"
                      >
                        <svg
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="m12 2.8 2.66 5.4 5.96.87-4.31 4.2 1.02 5.93L12 16.4l-5.33 2.8 1.02-5.93-4.31-4.2 5.96-.87L12 2.8Z"
                          ></path>
                        </svg>
                        <span class="font-bold text-amber-700">
                          {{ property.rating }}
                        </span>
                      </span>
                      <span class="text-(--color-muted)">
                        ({{ property.reviews }})
                      </span>
                    </div>

                    <div class="text-right">
                      <p
                        class="text-[1.65rem] font-black leading-none text-(--color-primary-strong)"
                      >
                        {{ formatPrice(property.price) }}
                      </p>
                      <p class="mt-1 text-xs font-medium text-(--color-muted)">
                        {{ t("propertiesPage.cards.night") }}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <section
              v-else
              class="properties-panel mt-6 rounded-[32px] border border-dashed border-(--color-border) px-6 py-14 text-center"
            >
              <p
                class="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-primary)"
              >
                {{ t("propertiesPage.empty.eyebrow") }}
              </p>
              <h3 class="mt-3 text-3xl font-black text-(--color-text)">
                {{ t("propertiesPage.empty.title") }}
              </h3>
              <p class="mx-auto mt-4 max-w-xl text-(--color-muted)">
                {{ t("propertiesPage.empty.message") }}
              </p>
              <div class="mt-8 flex justify-center">
                <AppButton
                  variant="primary"
                  size="md"
                  class="!rounded-full"
                  @click="resetFilters"
                >
                  {{ t("propertiesPage.actions.resetFilters") }}
                </AppButton>
              </div>
            </section>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>
<style scoped>
.properties-page {
  background: var(--color-page);
}

.properties-panel {
  background: var(--color-surface);
  border-color: var(--color-border);
  box-shadow: var(--shadow-panel);
}

.properties-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  box-shadow: var(--shadow-card);
}

.properties-card:hover {
  box-shadow: var(--shadow-panel);
}

/* Range slider */
.property-range {
  height: 8px;
  cursor: pointer;
}

.property-range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.property-range::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.property-range::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-soft);
}

.property-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 3px solid var(--color-surface);
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: var(--shadow-card);
}
</style>
