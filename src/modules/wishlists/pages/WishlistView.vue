<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useWishlistStore } from "../store/wishlistStore";
import WishlistCard from "../components/WishlistCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { HeartIcon, MapIcon, ListBulletIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";
import placeholer from "@/assets/images/properties/placeholder.png";

const router = useRouter();
const wishlistStore = useWishlistStore();
const { items, loading, error } = storeToRefs(wishlistStore);
const { t } = useI18n({ useScope: "global" });

onMounted(() => {
  wishlistStore.fetchWishlists();
});

const showMap = ref(false);
const hoveredPropertyId = ref(null);
let mapInstance = null;
let markersGroup = null;
let markersMap = {};

const initWishlistMap = () => {
  const container = document.getElementById("wishlist-map");
  if (!container || !window.L || !items.value.length) return;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  markersMap = {};

  const validItems = items.value.filter(item => item.latitude && item.longitude);
  const centerLat = validItems.length ? Number(validItems[0].latitude) : 11.5564;
  const centerLng = validItems.length ? Number(validItems[0].longitude) : 104.9282;

  mapInstance = window.L.map("wishlist-map", {
    zoomControl: false
  }).setView([centerLat, centerLng], 12);

  const isDarkMode = document.documentElement.classList.contains("dark");
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  window.L.tileLayer(tileUrl, {
    maxZoom: 19
  }).addTo(mapInstance);

  window.L.control.zoom({
    position: 'topright'
  }).addTo(mapInstance);

  markersGroup = window.L.featureGroup().addTo(mapInstance);

  const coordinatesRegistry = {};
  
  validItems.forEach((item) => {
    let lat = Number(item.latitude);
    let lng = Number(item.longitude);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

    const roundTo5 = (num) => Math.round(num * 100000) / 100000;
    const coordKey = `${roundTo5(lat)}_${roundTo5(lng)}`;
    
    if (coordinatesRegistry[coordKey] === undefined) {
      coordinatesRegistry[coordKey] = 0;
    } else {
      coordinatesRegistry[coordKey]++;
      const count = coordinatesRegistry[coordKey];
      const angle = count * 1.25; // Radial distribution
      const radius = 0.003 * Math.ceil(count / 5); // Increased radius to clearly separate pins
      lat += Math.sin(angle) * radius;
      lng += Math.cos(angle) * radius;
    }

    const priceText = item.price_per_night ? `$${item.price_per_night}` : "N/A";
    const normalIcon = window.L.divIcon({
      className: "custom-price-pin",
      html: `<div class="bg-(--color-surface) text-(--color-text) border border-(--color-border) text-[11px] font-black px-2.5 py-1 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center whitespace-nowrap">${priceText}</div>`,
      iconSize: [44, 24],
      iconAnchor: [22, 12]
    });

    const marker = window.L.marker([lat, lng], { icon: normalIcon })
      .addTo(markersGroup)
      .on("mouseover", () => {
        hoveredPropertyId.value = item.property_id;
      })
      .on("mouseout", () => {
        hoveredPropertyId.value = null;
      });

    const popupHtml = `
      <div class="p-2 text-left font-sans min-w-[160px]">
        <h4 class="font-black text-sm text-(--color-text) truncate">${item.property_name || t('wishlists.propertyFallback')}</h4>
        <p class="text-xs text-(--color-muted) mt-0.5">${item.city || t('wishlists.cambodiaFallback')}</p>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="font-black text-sm text-(--color-text)">$${item.price_per_night ?? 0}</span>
          <span class="text-[10px] text-(--color-muted)">${t('wishlists.perNight')}</span>
        </div>
        <a href="/properties/${item.property_id}" class="mt-3 block text-center bg-(--color-primary) text-white font-bold text-xs py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity">${t('wishlists.viewDetails')}</a>
      </div>
    `;
    marker.bindPopup(popupHtml, {
      className: "wishlist-popup-panel"
    });

    markersMap[item.property_id] = {
      marker,
      lat,
      lng,
      priceText
    };
  });

  if (validItems.length > 1) {
    try {
      mapInstance.fitBounds(markersGroup.getBounds(), { padding: [40, 40] });
    } catch (e) {
      console.error(e);
    }
  }
};

const toggleMap = async () => {
  showMap.value = !showMap.value;
  if (showMap.value) {
    await nextTick();
    initWishlistMap();
  } else {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      markersMap = {};
    }
  }
};

watch(hoveredPropertyId, (newId, oldId) => {
  if (!mapInstance) return;

  if (oldId && markersMap[oldId]) {
    const { marker, priceText } = markersMap[oldId];
    const normalIcon = window.L.divIcon({
      className: "custom-price-pin",
      html: `<div class="bg-(--color-surface) text-(--color-text) border border-(--color-border) text-[11px] font-black px-2.5 py-1 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center whitespace-nowrap">${priceText}</div>`,
      iconSize: [44, 24],
      iconAnchor: [22, 12]
    });
    marker.setIcon(normalIcon);
    marker.setZIndexOffset(0);
  }

  if (newId && markersMap[newId]) {
    const { marker, lat, lng, priceText } = markersMap[newId];
    const activeIcon = window.L.divIcon({
      className: "custom-price-pin-active",
      html: `<div class="bg-(--color-wishlist) text-white border border-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg scale-115 transition-all duration-150 flex items-center justify-center whitespace-nowrap">${priceText}</div>`,
      iconSize: [50, 28],
      iconAnchor: [25, 14]
    });
    marker.setIcon(activeIcon);
    marker.setZIndexOffset(1000);
    mapInstance.panTo([lat, lng], { animate: true, duration: 0.5 });
  }
});

watch([items, showMap], async () => {
  if (showMap.value) {
    await nextTick();
    initWishlistMap();
  }
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markersMap = {};
  }
});

const goToProperty = (propertyId) => {
  router.push({ name: "public.property-detail", params: { id: propertyId } });
};

const handleRemove = async (propertyId) => {
  await wishlistStore.toggleWishlist(propertyId);
};

const goToSearch = () => {
  router.push({ name: "public.properties" });
};
</script>

<template>
  <div class="min-h-screen bg-(--color-page) flex flex-col">
    <PublicNavbar />
    
    <main
      :class="showMap && items.length > 0 ? 'max-w-none px-0 pt-24 pb-0 flex flex-col lg:flex-row h-[calc(100vh-4px)]' : 'max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-12 flex-1'"
      class="w-full flex flex-col"
    >
      <!-- Header -->
      <div 
        v-if="!showMap || items.length === 0"
        class="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl sm:text-4xl font-black text-(--color-text) tracking-tight">{{ t("wishlists.title") }}</h1>
          <p class="text-(--color-muted) text-sm mt-1.5 font-medium">{{ t("wishlists.subtitle") }}</p>
        </div>
        <div v-if="!loading && !error && items.length > 0" class="text-sm font-bold text-(--color-text) bg-(--color-surface-soft) border border-(--color-border) px-4 py-2 rounded-full shadow-xs w-fit">
          {{ items.length }} {{ items.length === 1 ? t('wishlists.savedStay') : t('wishlists.savedStays') }}
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" :class="showMap ? 'px-6 pt-6' : ''" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-pulse flex-1">
        <div v-for="i in 4" :key="i" class="flex flex-col gap-3">
          <div class="bg-(--color-surface-soft) aspect-[20/19] rounded-2xl"></div>
          <div class="bg-(--color-surface-soft) h-4 w-2/3 rounded-md mt-1"></div>
          <div class="bg-(--color-surface-soft) h-3 w-1/2 rounded-md"></div>
          <div class="bg-(--color-surface-soft) h-4 w-1/3 rounded-md mt-1"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-center font-semibold flex-1 flex items-center justify-center">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="flex-1 py-8 flex flex-col items-center justify-start pt-12 text-center max-w-md mx-auto">
        <div class="h-20 w-20 bg-(--color-surface-soft) rounded-full flex items-center justify-center border border-(--color-border) mb-6">
          <HeartIcon class="w-10 h-10 text-blue-600 dark:text-blue-500" />
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-(--color-text) tracking-tight">{{ t("wishlists.emptyTitle") }}</h2>
        <p class="text-(--color-muted) mt-3 text-base leading-relaxed">
          {{ t("wishlists.emptyDesc") }}
        </p>
        <button
          type="button"
          @click="goToSearch"
          class="mt-8 px-8 py-3.5 bg-(--color-primary) hover:opacity-90 text-white text-base font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {{ t("wishlists.exploreProperties") }}
        </button>
      </div>

      <!-- Normal List / Grid View or Map Split View -->
      <!-- Full List View (Standard 4 cols grid) -->
      <template v-else>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-20">
          <WishlistCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :class="hoveredPropertyId === item.property_id ? 'ring-2 ring-(--color-primary) rounded-3xl scale-[1.01] shadow-lg bg-(--color-surface-soft)' : ''"
            class="transition-all duration-300 p-2"
            @mouseenter="hoveredPropertyId = item.property_id"
            @mouseleave="hoveredPropertyId = null"
            @click="goToProperty"
            @remove="handleRemove"
          />
        </div>
      </template>
    </main>

    <!-- Floating Toggle Map Button -->
    <div
      v-if="!loading && !error && items.length > 0"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto"
    >
      <button
        type="button"
        @click="toggleMap"
        class="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 font-bold text-sm border border-white/20 dark:border-black/20"
      >
        <span v-if="showMap">{{ t("wishlists.showList") }}</span>
        <span v-else>{{ t("wishlists.showMap") }}</span>
        <ListBulletIcon v-if="showMap" class="h-5 w-5" />
        <MapIcon v-else class="h-5 w-5" />
      </button>
    </div>

    <!-- ── Fullscreen Interactive Map Modal ── -->
    <div v-if="showMap" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300" @click.self="toggleMap">
      <div class="flex max-h-[90vh] h-full w-full max-w-7xl overflow-hidden rounded-sm bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp flex-col lg:flex-row" style="border-radius: var(--radius-sm);">
        <!-- Left Property Side Panel -->
        <div class="w-full lg:w-96 h-1/3 lg:h-full overflow-y-auto p-4 border-b lg:border-b-0 lg:border-r border-(--color-border) flex flex-col gap-4 bg-(--color-surface)">
          <div class="flex items-center justify-between border-b pb-3 border-(--color-border)">
            <h3 class="text-lg font-black text-(--color-text)">{{ t("wishlists.propertiesOnMap") }}</h3>
            <button type="button" class="p-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition active:scale-95" style="border-radius: var(--radius-sm);" @click="toggleMap">
              <XMarkIcon class="h-6 w-6 text-(--color-text)" />
            </button>
          </div>
          <div class="space-y-3 overflow-y-auto pr-1 pb-16">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex gap-3 p-2.5 rounded-sm border border-(--color-border) bg-(--color-page) hover:shadow-md transition cursor-pointer"
              style="border-radius: var(--radius-sm);"
              :class="hoveredPropertyId === item.property_id ? 'border-(--color-primary) ring-1 ring-(--color-primary)' : ''"
              @mouseenter="hoveredPropertyId = item.property_id"
              @mouseleave="hoveredPropertyId = null"
              @click="goToProperty(item.property_id)"
            >
              <img :src="item.cover_image ? resolveAssetUrl(item.cover_image) : placeholer" class="h-20 w-20 object-cover rounded-sm shrink-0" style="border-radius: var(--radius-sm);" :alt="item.property_name || t('wishlists.propertyFallback')" @error="(e) => (e.target.src = placeholer)" />
              <div class="flex flex-col justify-between min-w-0 flex-1">
                <div>
                  <h4 class="text-xs font-bold text-(--color-text) truncate">{{ item.property_name || t("wishlists.propertyFallback") }}</h4>
                  <p class="text-[11px] font-medium text-(--color-muted) truncate">{{ item.city || item.province || t("wishlists.cambodiaFallback") }}</p>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs font-bold text-(--color-text)">${{ item.price_per_night ?? 0 }}{{ t("wishlists.perNight") }}</span>
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-(--color-primary) px-1.5 py-0.5 rounded-sm" style="border-radius: var(--radius-sm);">
                    <StarIconSolid class="h-2.5 w-2.5" /> {{ t("wishlists.newBadge") }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Embedded Live Map View -->
        <div class="flex-1 h-2/3 lg:h-full relative bg-sky-50 dark:bg-neutral-900">
          <div id="wishlist-map" class="absolute inset-0 h-full w-full"></div>
        </div>
      </div>
    </div>

    <PublicFooter v-if="!showMap || items.length === 0" />
  </div>
</template>

<style>
/* Leaflet injects popup markup outside Vue's render tree (scoped styles can't
   reach it), and its default popup chrome is hardcoded white — invisible
   against the light-on-dark text colors this app uses in dark mode. */
.wishlist-popup-panel .leaflet-popup-content-wrapper,
.wishlist-popup-panel .leaflet-popup-tip {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-panel);
}
</style>
