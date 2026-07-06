<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  Squares2X2Icon,
  XMarkIcon,
  HeartIcon,
} from "@heroicons/vue/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/vue/24/solid";
import http from "@/app/api/http";
import { propertyApi } from "@/modules/properties/api/property.api";
import { useWishlistStore } from "@/modules/wishlists/store/wishlistStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AvailabilityCalendar from "@/modules/calendar/components/AvailabilityCalendar.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const authStore = useAuthStore();

const room = ref(null);
const loading = ref(true);
const checkInDate = ref("");
const checkOutDate = ref("");
const guestCount = ref(1);
const isDescriptionExpanded = ref(false);
const showPhotosModal = ref(false);
const reviewSummary = ref({ average: 0, total: 0 });

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

const getFullImageUrl = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};

const showMapModal = ref(false);
let detailMapInstance = null;

const fetchRoom = async () => {
  try {
    const res = await http.get(`/rooms/${route.params.id}`);
    const r = res.data?.data || res.data;

    let images = [];
    try {
      const imgRes = await http.get(`/rooms/${route.params.id}/images`);
      images = imgRes.data?.data || imgRes.data || [];
    } catch (imgErr) {
      console.warn("Could not load room images:", imgErr);
    }

    const coverImg = images.find((i) => i.is_cover === 1) || images[0];

    // Fetch parent property coordinates for the dynamic map
    let latitude = 11.5564;
    let longitude = 104.9282;
    try {
      const propRes = await http.get(`/properties/${r.property_id}`);
      const prop = propRes.data?.data || propRes.data;
      if (prop) {
        const cityCenters = {
          "phnom-penh": { lat: 11.5564, lng: 104.9282 },
          "siem-reap": { lat: 13.3633, lng: 103.8564 },
          "sihanoukville": { lat: 10.6096, lng: 103.5292 },
          "koh-rong": { lat: 10.6865, lng: 103.2662 },
          "battambang": { lat: 13.0957, lng: 103.2022 },
          "kampot": { lat: 10.6111, lng: 104.1794 },
          "kep": { lat: 10.4829, lng: 104.3167 },
        };
        const propertyCityRaw = typeof prop.city === "string"
          ? prop.city
          : prop.city?.city_name || prop.city?.name || prop.city_name || prop.address || "";
        const propertyCity = String(propertyCityRaw)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
          
        let latVal = prop.latitude !== null && prop.latitude !== undefined && !isNaN(Number(prop.latitude)) && Number(prop.latitude) !== 0
          ? Number(prop.latitude)
          : null;
        let lngVal = prop.longitude !== null && prop.longitude !== undefined && !isNaN(Number(prop.longitude)) && Number(prop.longitude) !== 0
          ? Number(prop.longitude)
          : null;

        if (latVal === null || lngVal === null) {
          let center = cityCenters[propertyCity];
          if (!center) {
            const foundCityKey = Object.keys(cityCenters).find(key => propertyCity.includes(key));
            center = foundCityKey ? cityCenters[foundCityKey] : { lat: 11.5564, lng: 104.9282 };
          }
          const seed = Number(prop.id ?? 1);
          const offsetLat = (Math.sin(seed * 43758.5453) * 0.012);
          const offsetLng = (Math.cos(seed * 12.9898) * 0.012);
          latVal = center.lat + offsetLat;
          lngVal = center.lng + offsetLng;
        }
        latitude = latVal;
        longitude = lngVal;
      }
    } catch (propErr) {
      console.warn("Could not load property details for coordinates:", propErr);
    }

    room.value = {
      id: r.id,
      type: r.room_name,
      propertyName: r.property_name || "",
      guests: r.max_guests || 2,
      description: r.description || "",
      basePrice: Number(r.price_per_night) || 0,
      image: getFullImageUrl(coverImg?.image_url),
      amenities: r.amenities || [],
      images: images.map((i) => getFullImageUrl(i.image_url)),
      propertyId: r.property_id,
      floorNumber: r.floor_number ?? null,
      latitude,
      longitude,
    };
  } catch (err) {
    console.error("Failed to load room:", err);
    room.value = null;
  } finally {
    loading.value = false;
  }

  if (room.value?.propertyId) {
    wishlistStore.checkStatus(room.value.propertyId);

    try {
      const reviewsRes = await propertyApi.getPropertyReviews(room.value.propertyId);
      const reviews = reviewsRes?.data?.data || reviewsRes?.data || [];
      const total = reviews.length;
      const average = total
        ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total
        : 0;
      reviewSummary.value = { average: Number(average.toFixed(2)), total };
    } catch (reviewErr) {
      console.warn("Could not load reviews:", reviewErr);
    }
  }
};

const initDetailMap = () => {
  const container = document.getElementById("detail-map");
  if (!container || !room.value || !window.L) return;

  const lat = Number(room.value.latitude || 11.5564);
  const lng = Number(room.value.longitude || 104.9282);

  detailMapInstance = window.L.map("detail-map", {
    zoomControl: false
  }).setView([lat, lng], 15);

  const isDarkMode = document.documentElement.classList.contains("dark");
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  window.L.tileLayer(tileUrl, {
    attribution,
    maxZoom: 19
  }).addTo(detailMapInstance);

  window.L.control.zoom({
    position: 'topright'
  }).addTo(detailMapInstance);

  const icon = window.L.divIcon({
    className: "custom-detail-pin",
    html: `<div class="flex items-center gap-1.5 rounded-sm bg-(--color-wishlist) text-white font-black text-xs px-3 py-1.5 shadow-2xl border border-white" style="border-radius: var(--radius-sm); white-space: nowrap;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-3 h-3 shrink-0"><path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/></svg> ${room.value.propertyName}</div>`,
    iconSize: [140, 30],
    iconAnchor: [70, 15]
  });

  window.L.marker([lat, lng], { icon }).addTo(detailMapInstance);
};

watch(showMapModal, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    initDetailMap();
  } else {
    if (detailMapInstance) {
      detailMapInstance.remove();
      detailMapInstance = null;
    }
  }
});

// ── Nights & total price (mirrors BookingCreateView's stayNights logic) ──────
const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const start = new Date(checkInDate.value);
  const end = new Date(checkOutDate.value);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
});

const totalPrice = computed(
  () => (room.value?.basePrice || 0) * stayNights.value,
);

// ── Auto-fill booking form when customer picks a date range ──────────────────
const handleRangeSelected = ({ start, end }) => {
  checkInDate.value = start;
  checkOutDate.value = end;
};

const goToBooking = () => {
  router.push({
    name: "customer.room-book",
    params: { id: route.params.id },
    query: {
      propertyId: room.value?.propertyId,
      checkIn: checkInDate.value || undefined,
      checkOut: checkOutDate.value || undefined,
      guests: guestCount.value,
    },
  });
};

const isSaved = computed(() => wishlistStore.isPropertySaved(room.value?.propertyId));

const handleSave = async () => {
  if (!authStore.isAuthenticated) {
    toastStore.warning(t("roomDetail.loginToSave", "Please log in to save listings."));
    return;
  }
  if (room.value?.propertyId) {
    await wishlistStore.toggleWishlist(room.value.propertyId);
  }
};

const handleShare = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    toastStore.success(t("propertyDetail.shareSuccess", "Property link copied to clipboard!"));
  }
};

onMounted(fetchRoom);
</script>

<template>
  <div
    class="min-h-screen bg-(--color-surface-soft) text-(--color-text) antialiased pb-24 font-sans transition-colors duration-300"
  >
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <p class="text-xs text-(--color-muted) font-medium">
        {{ t("common.loading") }}...
      </p>
    </div>

    <!-- Room Not Found -->
    <div
      v-else-if="!room"
      class="flex items-center justify-center min-h-screen"
    >
      <p class="text-xs text-(--color-muted) font-medium">Room not found.</p>
    </div>

    <!-- All Content -->
    <template v-else>
      <!-- Breadcrumb Header -->
      <header
        class="border-b border-(--color-border) bg-(--color-surface)/70 backdrop-blur-xl sticky top-0 z-40 transition-all"
      >
        <div
          class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs font-semibold"
        >
          <div class="flex items-center gap-2.5 text-(--color-muted)">
            <RouterLink
              :to="{ name: 'public.home' }"
              class="hover:text-(--color-primary) transition duration-300"
            >
              {{ t("roomDetail.breadcrumb.home") }}
            </RouterLink>
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <RouterLink
              :to="{ name: 'public.properties' }"
              class="hover:text-(--color-primary) transition duration-300"
            >
              {{ t("roomDetail.breadcrumb.properties") }}
            </RouterLink>
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <RouterLink
              :to="{ name: 'public.property-rooms', params: { propertyId: room.propertyId } }"
              class="hover:text-(--color-primary) transition duration-300"
            >
              {{ t("roomDetail.breadcrumb.rooms") }}
            </RouterLink>
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <span class="text-(--color-text) font-bold tracking-tight">{{
              room.type
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2 bg-(--color-success-soft) text-(--color-success) px-3 py-1.5 rounded-full text-[11px] font-bold border border-(--color-success)/20 shadow-sm"
          >
            <span
              class="w-2 h-2 bg-(--color-success) rounded-full animate-ping"
            ></span>
            <span class="w-2 h-2 bg-(--color-success) rounded-full absolute"></span>
            {{ t("roomDetail.liveAvailability") }}
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        <!-- Airbnb Style Header (Title Above Gallery) -->
        <div class="mb-6">
          <h1 class="text-2xl md:text-3xl font-semibold text-(--color-text) tracking-tight mb-2">
            {{ room.type }}
          </h1>
          <div class="flex items-center justify-between text-sm font-medium text-(--color-muted)">
            <div class="flex items-center gap-2">
              <span
                v-if="reviewSummary.total > 0"
                class="flex items-center gap-1 text-(--color-text) font-semibold"
              >
                ★ {{ reviewSummary.average.toFixed(2) }} · {{ reviewSummary.total }} {{ reviewSummary.total === 1 ? "review" : "reviews" }}
              </span>
              <span v-else class="text-(--color-muted)">{{ t("roomDetail.noReviewsYet", "No reviews yet") }}</span>
              <span>·</span>
              <span class="underline cursor-pointer font-medium" @click="showMapModal = true">{{ room.propertyName }}</span>
            </div>
            <div class="flex items-center gap-4 text-(--color-text)">
              <button
                type="button"
                class="flex items-center gap-2 hover:bg-(--color-surface-soft) px-2 py-1 rounded-md transition underline font-semibold cursor-pointer"
                @click="handleShare"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                Share
              </button>
              <button
                type="button"
                class="flex items-center gap-2 hover:bg-(--color-surface-soft) px-2 py-1 rounded-md transition underline font-semibold cursor-pointer"
                @click="handleSave"
              >
                <HeartIconSolid v-if="isSaved" class="w-4 h-4 text-(--color-wishlist)" />
                <HeartIcon v-else class="w-4 h-4" />
                {{ isSaved ? "Saved" : "Save" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Photo Gallery -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[400px] lg:h-[450px] rounded-[16px] overflow-hidden relative mb-10">
          <div class="md:col-span-2 h-full cursor-pointer group relative" @click="showPhotosModal = true">
            <img :src="room.image" class="w-full h-full object-cover group-hover:brightness-90 transition duration-300" />
            <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="hidden md:grid grid-rows-2 gap-2 h-full">
            <div class="w-full h-full cursor-pointer group relative" @click="showPhotosModal = true">
              <img :src="room.images[1] || room.images[0]" class="w-full h-full object-cover group-hover:brightness-90 transition duration-300" />
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div class="w-full h-full cursor-pointer group relative" @click="showPhotosModal = true">
              <img :src="room.images[2] || room.images[0]" class="w-full h-full object-cover group-hover:brightness-90 transition duration-300" />
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div class="hidden md:grid grid-rows-2 gap-2 h-full">
            <div class="w-full h-full cursor-pointer group relative" @click="showPhotosModal = true">
              <img :src="room.images[3] || room.images[0]" class="w-full h-full object-cover group-hover:brightness-90 transition duration-300" />
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div class="w-full h-full cursor-pointer group relative" @click="showPhotosModal = true">
              <img :src="room.images[4] || room.images[0]" class="w-full h-full object-cover group-hover:brightness-90 transition duration-300" />
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <button
                v-if="room.images.length > 1"
                type="button"
                class="absolute bottom-4 right-4 bg-(--color-surface) border border-(--color-text) text-(--color-text) px-4 py-1.5 rounded-lg text-sm font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-(--color-surface-soft) flex items-center gap-2 transition cursor-pointer"
                @click="showPhotosModal = true"
              >
                <Squares2X2Icon class="w-4 h-4" />
                Show all photos
              </button>
            </div>
          </div>
        </div>

        <!-- Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-12">
          <!-- Left Column -->
          <div class="lg:col-span-7 space-y-8">
            <!-- Host / Basic Specs -->
            <div class="flex justify-between items-start border-b border-(--color-border) pb-6">
              <div>
                <h2 class="text-xl font-semibold text-(--color-text)">Hosted by {{ room.propertyName }}</h2>
                <p class="text-base text-(--color-muted) font-normal mt-1 flex items-center gap-1.5">
                  {{ room.guests }} guests &middot; {{ room.floorNumber ? `Floor ${room.floorNumber}` : '1 bedroom' }} &middot; 1 bed &middot; 1 private bath
                </p>
              </div>
              <div class="w-12 h-12 rounded-full bg-(--color-surface-soft) overflow-hidden flex items-center justify-center border border-(--color-border) shrink-0">
                <span class="text-lg font-bold text-(--color-muted)">{{ room.propertyName ? room.propertyName.charAt(0) : 'H' }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="border-b border-(--color-border) pb-6">
              <p
                class="text-base text-(--color-text) font-normal leading-relaxed text-left"
                :class="{ 'line-clamp-4': !isDescriptionExpanded }"
              >
                {{ room.description }}
              </p>
              <button
                v-if="room.description && room.description.length > 220"
                type="button"
                class="text-base font-semibold underline mt-4 flex items-center gap-1 hover:text-(--color-muted) cursor-pointer"
                @click="isDescriptionExpanded = !isDescriptionExpanded"
              >
                {{ isDescriptionExpanded ? "Show less" : "Show more" }} <span aria-hidden="true">{{ isDescriptionExpanded ? "^" : ">" }}</span>
              </button>
            </div>

            <!-- Amenities -->
            <div class="border-b border-(--color-border) pb-8">
              <h2 class="text-xl font-semibold text-(--color-text) mb-6">What this place offers</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div v-for="amenity in room.amenities" :key="amenity" class="flex items-center gap-4">
                  <div class="w-6 h-6 flex items-center justify-center text-(--color-text)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"/></svg>
                  </div>
                  <span class="text-base font-normal text-(--color-text)">{{ amenity }}</span>
                </div>
              </div>
            </div>

            <!-- Availability Calendar -->
            <div class="pb-8">
              <h2 class="text-xl font-semibold text-(--color-text) mb-1">Select check-in date</h2>
              <p class="text-sm text-(--color-muted) mb-5">Add your travel dates for exact pricing</p>
              <div class="w-full">
                <AvailabilityCalendar
                  :room-id="room.id"
                  mode="customer"
                  @range-selected="handleRangeSelected"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Booking Panel -->
          <div class="lg:col-span-5 relative">
            <div class="sticky top-24">
              <div class="bg-(--color-surface) border border-(--color-border) rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-6 mb-6 text-(--color-text)">
                <!-- Price -->
                <div class="flex items-baseline gap-1 mb-5">
                  <span class="text-2xl font-semibold">${{ room.basePrice }}</span>
                  <span class="text-(--color-muted) text-base font-normal"> night</span>
                </div>

                <!-- Form -->
                <form @submit.prevent class="space-y-4">
                  <!-- Dates & Guests Box -->
                  <div class="border border-(--color-border) rounded-lg overflow-hidden">
                    <div class="grid grid-cols-2 border-b border-(--color-border)">
                      <div class="p-2.5 border-r border-(--color-border) focus-within:bg-(--color-surface-soft) relative group">
                        <label class="block text-[10px] font-bold text-(--color-text) uppercase pl-1 cursor-pointer group-hover:text-(--color-text)">
                          Check-in
                        </label>
                        <input
                          type="date"
                          v-model="checkInDate"
                          class="w-full bg-transparent text-sm text-(--color-text) outline-none cursor-pointer pl-1"
                        />
                      </div>
                      <div class="p-2.5 focus-within:bg-(--color-surface-soft) relative group">
                        <label class="block text-[10px] font-bold text-(--color-text) uppercase pl-1 cursor-pointer group-hover:text-(--color-text)">
                          Checkout
                        </label>
                        <input
                          type="date"
                          v-model="checkOutDate"
                          class="w-full bg-transparent text-sm text-(--color-text) outline-none cursor-pointer pl-1"
                        />
                      </div>
                    </div>
                    <div class="p-2.5 focus-within:bg-(--color-surface-soft) relative group">
                      <label class="block text-[10px] font-bold text-(--color-text) uppercase pl-1 cursor-pointer group-hover:text-(--color-text)">
                        Guests
                      </label>
                      <select
                        v-model.number="guestCount"
                        class="w-full text-sm text-(--color-text) bg-transparent outline-none appearance-none cursor-pointer pl-1"
                      >
                        <option v-for="n in room.guests || 2" :key="n" :value="n">
                          {{ n }} {{ n === 1 ? "guest" : "guests" }}
                        </option>
                      </select>
                      <span class="absolute right-3 top-1/2 text-(--color-muted) pointer-events-none text-xs">▼</span>
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <button
                    type="button"
                    @click="goToBooking"
                    class="w-full bg-(--color-primary) hover:bg-(--color-primary-strong) text-white font-semibold text-base py-3.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Reserve
                  </button>
                  <p class="text-sm text-(--color-muted) text-center mt-2">You won't be charged yet</p>
                </form>

                <!-- Price Breakdown -->
                <div v-if="checkInDate && checkOutDate" class="mt-5 space-y-3 text-base text-(--color-muted)">
                  <div class="flex justify-between">
                    <span class="underline">${{ room.basePrice }} × {{ stayNights }} nights</span>
                    <span>${{ totalPrice.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="underline">Cleaning fee</span>
                    <span>$0.00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="underline">Srok-Yerng service fee</span>
                    <span>$0.00</span>
                  </div>
                  <div class="border-t border-(--color-border) my-4"></div>
                  <div class="flex justify-between text-base font-semibold text-(--color-text) pb-1">
                    <span>Total before taxes</span>
                    <span>${{ totalPrice.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Photos Modal ── -->
    <div v-if="showPhotosModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300" @click.self="showPhotosModal = false">
      <div class="flex max-h-[85vh] h-full w-full max-w-4xl overflow-hidden rounded-sm bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp flex-col" style="border-radius: var(--radius-sm);">
        <div class="flex items-center justify-between p-4 border-b border-(--color-border) bg-(--color-surface)">
          <h3 class="text-lg font-black text-(--color-text)">{{ room?.type }} — {{ room?.images?.length || 0 }} photos</h3>
          <button type="button" class="p-1.5 rounded-sm hover:bg-(--color-surface-soft) dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer" style="border-radius: var(--radius-sm);" @click="showPhotosModal = false">
            <XMarkIcon class="h-6 w-6 text-(--color-text)" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <img
            v-for="(img, idx) in room?.images"
            :key="idx"
            :src="img"
            class="w-full h-64 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>

    <!-- ── Map Modal ── -->
    <div v-if="showMapModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300" @click.self="showMapModal = false">
      <div class="flex max-h-[80vh] h-full w-full max-w-4xl overflow-hidden rounded-sm bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp flex-col" style="border-radius: var(--radius-sm);">
        <div class="flex items-center justify-between p-4 border-b border-(--color-border) bg-(--color-surface)">
          <h3 class="text-lg font-black text-(--color-text)">{{ room?.propertyName || t("roomDetail.showMap") }}</h3>
          <button type="button" class="p-1.5 rounded-sm hover:bg-(--color-surface-soft) dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer" style="border-radius: var(--radius-sm);" @click="showMapModal = false">
            <XMarkIcon class="h-6 w-6 text-(--color-text)" />
          </button>
        </div>
        <div class="flex-1 relative bg-sky-50 dark:bg-neutral-900">
          <div id="detail-map" class="absolute inset-0 h-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>
