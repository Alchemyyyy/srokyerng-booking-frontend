<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { formatPrice } from "@/shared/utils/currency";
import {
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WifiIcon,
  TvIcon,
  TruckIcon,
  SunIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CakeIcon,
  BriefcaseIcon,
  BoltIcon,
  KeyIcon,
  HomeModernIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

import PropertyGallery from "../components/PropertyGallery.vue";
import AvailabilityCalendar from "@/modules/calendar/components/AvailabilityCalendar.vue";
import { usePropertyStore } from "../store/propertyStore";
import { propertyApi } from "../api/property.api";
import { useWishlistStore } from "@/modules/wishlists/store/wishlistStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { chatService } from "@/modules/chats/services/chat.service";
import { ChatBubbleOvalLeftIcon } from "@heroicons/vue/24/outline";
import http from "@/app/api/http";

const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const router = useRouter();
const propertyStore = usePropertyStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const rooms = ref([]);
const amenities = ref([]);

const getAmenityIcon = (name) => {
  const n = String(name).toLowerCase();
  if (n.includes('wifi') || n.includes('internet') || n.includes('wi-fi')) return WifiIcon;
  if (n.includes('tv') || n.includes('cable') || n.includes('television') || n.includes('netflix')) return TvIcon;
  if (n.includes('park') || n.includes('garage') || n.includes('car') || n.includes('shuttle') || n.includes('airport')) return TruckIcon;
  if (n.includes('air condition') || n.includes('ac') || n.includes('heat') || n.includes('climate') || n.includes('beach') || n.includes('sun')) return SunIcon;
  if (n.includes('security') || n.includes('guard') || n.includes('alarm') || n.includes('smoke') || n.includes('safe')) return ShieldCheckIcon;
  if (n.includes('wash') || n.includes('laundry') || n.includes('dryer') || n.includes('clean') || n.includes('bedding') || n.includes('linens') || n.includes('spa') || n.includes('yoga')) return SparklesIcon;
  if (n.includes('kitchen') || n.includes('cook') || n.includes('food') || n.includes('dining') || n.includes('breakfast') || n.includes('restaurant')) return CakeIcon;
  if (n.includes('pool') || n.includes('swim') || n.includes('gym') || n.includes('fitness') || n.includes('family') || n.includes('group') || n.includes('tennis')) return UserGroupIcon;
  if (n.includes('work') || n.includes('desk') || n.includes('office') || n.includes('business')) return BriefcaseIcon;
  if (n.includes('key') || n.includes('lock') || n.includes('check-in')) return KeyIcon;
  if (n.includes('electric') || n.includes('power') || n.includes('charge')) return BoltIcon;
  if (n.includes('villa') || n.includes('space') || n.includes('lounge') || n.includes('balcony') || n.includes('view') || n.includes('garden')) return HomeModernIcon;
  if (n.includes('location') || n.includes('city') || n.includes('center')) return MapPinIcon;
  if (n.includes('date') || n.includes('flexible')) return CalendarDaysIcon;
  if (n.includes('premium') || n.includes('star')) return StarIcon;
  if (n.includes('pet')) return HeartIcon;
  return CheckCircleIcon;
};

const fallbackRoom = {
  name: "Standard Room",
  capacity: 2,
  price: 0,
  spec: "Available room",
};

const selectedRoom = ref(fallbackRoom);
const minDate = new Date().toISOString().split('T')[0];
const checkInDate = ref("");
const checkOutDate = ref("");
const guestCount = ref(2);
const serviceFee = 7;

const availableGuestOptions = computed(() =>
  Array.from(
    { length: selectedRoom.value.capacity || 2 },
    (_, index) => index + 1,
  ),
);

const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const startDate = new Date(checkInDate.value);
  const endDate = new Date(checkOutDate.value);
  const diffInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  return Number.isFinite(diffInDays) && diffInDays > 0 ? diffInDays : 1;
});

const roomSubtotal = computed(
  () => selectedRoom.value.price * stayNights.value,
);
const totalPrice = computed(() => roomSubtotal.value + serviceFee);

const property = computed(() => propertyStore.property);
const isSaved = computed(() => wishlistStore.isPropertySaved(property.value?.id));

const hostName = computed(() => {
  const p = property.value;
  if (!p) return "Srok-Yerng Premium";
  return p.raw?.full_name || p.raw?.owner_name || p.raw?.owner?.name || "Srok-Yerng Premium";
});

const hostInitials = computed(() => {
  const name = hostName.value;
  if (!name) return "SY";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const contactHost = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: "public.loginCustomer" });
    return;
  }

  const p = property.value;
  if (!p) return;

  try {
    const convoData = {
      property_id: p.id,
      initial_message: `Hi ${hostName.value}! I am interested in booking "${p.property_name}".`,
    };
    
    const response = await chatService.createConversation(convoData);
    const newConvo = response.data || response;
    
    router.push({ name: "customer.chat-detail", params: { conversationId: newConvo.id } });
  } catch (err) {
    if (err.status === 409 || err.message?.includes("exists")) {
      try {
        const response = await chatService.getConversations();
        const convos = response.data || response || [];
        const existing = convos.find(
          (c) => c.property_id === Number(p.id)
        );
        if (existing) {
          router.push({ name: "customer.chat-detail", params: { conversationId: existing.id } });
          return;
        }
      } catch (innerErr) {
        console.error("Failed to fallback search convo", innerErr);
      }
    }
    toastStore.danger(err.message || "Failed to start conversation");
  }
};

const roomFeatures = computed(() => {
  const r = selectedRoom.value;
  const spec = r?.spec || "";
  const matchBed = spec.match(/(\d+)\s*bed/i);
  const matchBath = spec.match(/(\d+)\s*bath/i);
  const matchBedroom = spec.match(/(\d+)\s*bedroom/i);
  
  const beds = matchBed ? Number(matchBed[1]) : (r?.capacity > 2 ? 2 : 1);
  const bedrooms = matchBedroom ? Number(matchBedroom[1]) : (r?.capacity > 4 ? 2 : 1);
  const baths = matchBath ? Number(matchBath[1]) : 1;

  return {
    bedrooms: `${bedrooms} ${bedrooms > 1 ? 'bedrooms' : 'bedroom'}`,
    beds: `${beds} ${beds > 1 ? 'beds' : 'bed'}`,
    baths: `${baths} ${baths > 1 ? 'baths' : 'private bath'}`
  };
});

const currentRooms = computed(() => {
  return rooms.value.length ? rooms.value : [fallbackRoom];
});

const selectRoom = (room) => {
  selectedRoom.value = room;
  if (guestCount.value > room.capacity) {
    guestCount.value = room.capacity;
  }
};

const fetchProperty = async () => {
  await propertyStore.fetchPropertyById(route.params.id).catch(() => {});
  
  if (route.params.id) {
    wishlistStore.checkStatus(route.params.id);
  }

  console.log("property.images:", propertyStore.property?.images);
  console.log("property.image:", propertyStore.property?.image);

  try {
    const res = await propertyApi.getPropertyRooms(route.params.id);
    const rawRooms = res.data?.data || res.data || [];
    rooms.value = rawRooms.map((r) => ({
      id: r.id,
      name: r.room_name || r.name,
      capacity: r.max_guests || 2,
      price: Number(r.price_per_night) || 0,
      spec:
        r.description && r.description !== "-"
          ? r.description
          : "Available room",
    }));
  } catch {
    rooms.value = [];
  }

  try {
    const resAmenity = await propertyApi.getPropertyAmenities(route.params.id);
    const rawAmenities = resAmenity.data?.data || resAmenity.data || [];
    amenities.value = rawAmenities.length ? rawAmenities : [
      { id: 1, amenity_name: "High-speed WiFi" },
      { id: 2, amenity_name: "Top city center location" },
      { id: 3, amenity_name: "Dedicated family space" },
      { id: 4, amenity_name: "Luggage dropoff allowed" },
      { id: 5, amenity_name: "Flexible stay dates" },
      { id: 6, amenity_name: "Premium verified bedding" },
    ];
  } catch {
    amenities.value = [
      { id: 1, amenity_name: "High-speed WiFi" },
      { id: 2, amenity_name: "Top city center location" },
      { id: 3, amenity_name: "Dedicated family space" },
      { id: 4, amenity_name: "Luggage dropoff allowed" },
      { id: 5, amenity_name: "Flexible stay dates" },
      { id: 6, amenity_name: "Premium verified bedding" },
    ];
  }

  const firstRoom = rooms.value[0] || fallbackRoom;
  selectedRoom.value = firstRoom;
};
watch(
  () => route.params.id,
  () => {
    fetchProperty();
  },
  { immediate: true },
);

const handleSave = async () => {
  if (property.value?.id) {
    await wishlistStore.toggleWishlist(property.value.id);
  }
};
const handleShare = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    toastStore.success(t("propertyDetail.shareSuccess", "Property link copied to clipboard!"));
  }
};

// ── Smooth Scroll Navigation ──
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// ── Availability Calendar ──
// When customer picks a range on the calendar, auto-fill the booking card inputs
const handleRangeSelected = ({ start, end }) => {
  checkInDate.value = start;
  checkOutDate.value = end;
};

const goToBooking = () => {
  if (!selectedRoom.value?.id) {
    toastStore.warning(t("propertyDetail.selectRoomPrompt", "Please select a room type first."));
    return;
  }
  if (!checkInDate.value || !checkOutDate.value) {
    toastStore.warning(t("propertyDetail.selectDatesPrompt", "Please select your check-in and check-out dates."));
    return;
  }
  if (checkInDate.value < minDate) {
    toastStore.warning(t("propertyDetail.pastDatePrompt", "Check-in date cannot be in the past."));
    return;
  }
  if (checkInDate.value >= checkOutDate.value) {
    toastStore.warning(t("propertyDetail.invalidDatesPrompt", "Check-out date must be after check-in date."));
    return;
  }
  router.push({
    name: "customer.room-book",
    params: { id: selectedRoom.value?.id },
    query: {
      propertyId: property.value?.id,
      checkIn: checkInDate.value || undefined,
      checkOut: checkOutDate.value || undefined,
      guests: guestCount.value,
    },
  });
};

// ── Guest Reviews ──
const guestReviews = ref([]);
const activeReviewIndex = ref(0);

const reviewSummary = computed(() => {
  const list = guestReviews.value;
  const total = list.length;
  const average = total
    ? list.reduce((sum, r) => sum + (r.rating || 0), 0) / total
    : 0;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = list.filter((r) => Math.round(r.rating) === stars).length;
    const pct = total ? Math.round((count / total) * 100) : 0;
    return { stars, count, pct };
  });

  return {
    average: total ? Number(average).toFixed(1) : "0.0",
    total: total,
    breakdown,
  };
});

const activeReview = computed(
  () => guestReviews.value[activeReviewIndex.value] || {},
);

const nextReview = () => {
  if (!guestReviews.value.length) return;
  activeReviewIndex.value =
    (activeReviewIndex.value + 1) % guestReviews.value.length;
};

const prevReview = () => {
  if (!guestReviews.value.length) return;
  activeReviewIndex.value =
    (activeReviewIndex.value - 1 + guestReviews.value.length) %
    guestReviews.value.length;
};

const reviewerInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const ratingWordLabel = (rating) => {
  const value = Number(rating);
  if (value === 0) return t("propertyDetail.noReviewsYet", "No reviews yet");
  if (value >= 4.5) return t("reviewCreate.ratingLabel.excellent");
  if (value >= 4) return t("reviewCreate.ratingLabel.veryGood");
  if (value >= 3) return t("reviewCreate.ratingLabel.good");
  if (value >= 2) return t("reviewCreate.ratingLabel.fair");
  return t("reviewCreate.ratingLabel.poor");
};

const fetchPropertyReviews = async () => {
  try {
    const propertyId = route.params.id;
    const res = propertyApi.getPropertyReviews
      ? await propertyApi.getPropertyReviews(propertyId)
      : await http.get(`/properties/${propertyId}/reviews`);

    console.log("[reviews] propertyId:", propertyId);
    console.log("[reviews] raw response:", res);

    const rawReviews = res?.data?.data || res?.data || [];
    console.log("[reviews] parsed list:", rawReviews);

    guestReviews.value = rawReviews.map((r) => ({
      id: r.id,
      author: r.full_name || r.customer_name || r.author || "Guest",
      date: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "",
      rating: Number(r.rating) || 0,
      title: r.title || "",
      comment: r.comment || "",
      roomName: r.room_name || "",
    }));
    activeReviewIndex.value = 0;
  } catch (err) {
    console.error("[reviews] fetch failed:", err?.response || err);
    guestReviews.value = [];
  }
};

watch(
  () => route.params.id,
  () => {
    fetchPropertyReviews();
  },
  { immediate: true },
);

// ── Write review target ──
const writeReviewLink = { path: "/customer/reviews" };

// ── Amenity Modal State ──
const showAmenityModal = ref(false);
const displayedAmenities = computed(() => amenities.value.slice(0, 6));
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text)">
    <div
      v-if="propertyStore.loading"
      class="mx-auto max-w-7xl px-4 py-32 text-center text-(--color-muted) sm:px-6 lg:px-8"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-(--color-primary) border-t-transparent"></div>
        <p class="text-base font-bold">Loading spectacular property details...</p>
      </div>
    </div>

    <div
      v-else-if="propertyStore.error"
      class="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8"
    >
      <div class="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-600 max-w-lg mx-auto shadow-sm">
        <p class="text-lg font-bold">{{ propertyStore.error }}</p>
        <button @click="fetchProperty" class="mt-4 px-6 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer">
          Try Again
        </button>
      </div>
    </div>

    <div v-else-if="property">
      <!-- Property Gallery -->
      <PropertyGallery
        :property="property"
        :selected-room="selectedRoom"
        :property-rating="reviewSummary.average"
        :review-count="reviewSummary.total"
        :is-saved="isSaved"
        @save="handleSave"
        @share="handleShare"
      />

      <!-- Glassmorphic Quick Navigation Bar -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-8 transition-all duration-300">
        <div class="flex items-center justify-between rounded-full border border-(--color-border)/80 bg-(--color-surface)/80 backdrop-blur-2xl p-2 pl-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 transition-all">
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs sm:text-sm font-bold text-(--color-text) py-1 scrollbar-none">
            <button type="button" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-(--color-primary-soft) hover:text-(--color-primary) active:scale-95 cursor-pointer text-(--color-text)" @click="scrollToSection('about')">
              <SparklesIcon class="h-4 w-4 text-(--color-primary)" />
              <span>{{ t("propertyDetail.aboutProperty") }}</span>
            </button>
            <button type="button" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-(--color-primary-soft) hover:text-(--color-primary) active:scale-95 cursor-pointer text-(--color-text)" @click="scrollToSection('rooms')">
              <BuildingOfficeIcon class="h-4 w-4 text-(--color-primary)" />
              <span>{{ t("propertyDetail.roomTypes") }}</span>
            </button>
            <button type="button" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-(--color-primary-soft) hover:text-(--color-primary) active:scale-95 cursor-pointer text-(--color-text)" @click="scrollToSection('availability')">
              <CalendarDaysIcon class="h-4 w-4 text-(--color-primary)" />
              <span>Availability</span>
            </button>
            <button type="button" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-(--color-primary-soft) hover:text-(--color-primary) active:scale-95 cursor-pointer text-(--color-text)" @click="scrollToSection('reviews')">
              <StarIcon class="h-4 w-4 text-(--color-primary)" />
              <span>{{ t("propertyDetail.guestReviews") }}</span>
            </button>
          </div>

          <!-- Quick Right Callout (Price & Instant Reserve) -->
          <div class="hidden md:flex items-center gap-6 shrink-0 border-l border-(--color-border)/60 pl-6 pr-1">
            <div class="flex items-baseline gap-1.5 text-right">
              <span class="text-xs font-bold text-(--color-muted) uppercase tracking-wider">From</span>
              <span class="text-2xl font-black text-(--color-text)">{{ formatPrice(selectedRoom.price) }}</span>
              <span class="text-xs font-extrabold text-(--color-muted)">/ night</span>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-full bg-(--color-primary) px-7 py-3 text-sm font-black text-white shadow-lg shadow-(--color-primary)/30 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
              @click="scrollToSection('availability')"
            >
              <BoltIcon class="h-4 w-4 fill-white text-white animate-bounce" />
              <span>{{ t("propertyDetail.reserveNow", "Reserve Now") }}</span>
              <ArrowRightIcon class="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <main class="mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <!-- Left Content Column (Modern Airbnb Flow) -->
          <div class="space-y-12 lg:col-span-2">
            <!-- Host / Property Overview Block -->
            <div class="border-b border-(--color-border) pb-10 space-y-6">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center gap-1 bg-(--color-success-soft) text-(--color-success) px-2.5 py-1 text-xs font-black uppercase tracking-wider" style="border-radius: var(--radius-sm);">
                    <ShieldCheckIcon class="h-4 w-4 text-(--color-success)" />
                    <span>Verified Host</span>
                  </span>
                  <span class="text-xs font-black text-(--color-muted)">· Entire Serviced Stay</span>
                </div>

                <div class="flex items-center gap-4">
                  <h2 class="text-2xl font-black text-(--color-text) tracking-tight">
                    Hosted by {{ hostName }}
                  </h2>
                  <!-- Compact Host Avatar right near the text -->
                  <div class="relative shrink-0">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-(--color-primary) to-sky-400 text-white font-black text-lg shadow-md ring-2 ring-(--color-primary)/20 hover:scale-105 transition-all duration-300">
                      {{ hostInitials }}
                    </div>
                    <div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-gray-900 shadow-xs" title="Superhost Verified">
                      <ShieldCheckIcon class="h-3 w-3" />
                    </div>
                  </div>
                </div>

                <!-- Contact Host Button -->
                <button
                  v-if="!authStore.isAuthenticated || authStore.user?.role === 'customer'"
                  type="button"
                  @click="contactHost"
                  class="mt-4 px-5 py-2.5 rounded-full border border-(--color-border) hover:border-(--color-text) hover:bg-(--color-surface-soft) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 w-fit"
                >
                  <ChatBubbleOvalLeftIcon class="h-4.5 w-4.5 text-(--color-primary)" />
                  <span>Contact Host</span>
                </button>
              </div>  

              <!-- Refined Pill Specs -->
              <div class="flex flex-wrap items-center gap-2.5 pt-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface-soft) border border-(--color-border) px-4 py-1.5 text-xs font-bold text-(--color-text) shadow-xs">
                  <UserGroupIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ selectedRoom.capacity }} guests</span>
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface-soft) border border-(--color-border) px-4 py-1.5 text-xs font-bold text-(--color-text) shadow-xs">
                  <BuildingOfficeIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ roomFeatures.bedrooms }}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface-soft) border border-(--color-border) px-4 py-1.5 text-xs font-bold text-(--color-text) shadow-xs">
                  <SparklesIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ roomFeatures.beds }}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface-soft) border border-(--color-border) px-4 py-1.5 text-xs font-bold text-(--color-text) shadow-xs">
                  <HomeModernIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ roomFeatures.baths }}</span>
                </span>
              </div>
            </div>

            <!-- Modern Bento Highlight Cards -->
            <div class="border-b border-(--color-border) pb-10">
              <h3 class="text-xl font-bold text-(--color-text) mb-6">Why guests love this stay</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-start gap-4 p-5 rounded-2xl bg-(--color-surface) border border-(--color-border) shadow-xs hover:shadow-md transition-shadow duration-200">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shrink-0 shadow-xs">
                    <MapPinIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-base font-bold text-(--color-text)">Spectacular Location</p>
                    <p class="text-xs text-(--color-muted) mt-1 leading-relaxed">100% of recent guests gave this property's location a flawless 5-star rating.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4 p-5 rounded-2xl bg-(--color-surface) border border-(--color-border) shadow-xs hover:shadow-md transition-shadow duration-200">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shrink-0 shadow-xs">
                    <CheckCircleIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-base font-bold text-(--color-text)">Seamless Self Check-In</p>
                    <p class="text-xs text-(--color-muted) mt-1 leading-relaxed">Checking in is totally effortless with our smart digital lockpad system.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4 p-5 rounded-2xl bg-(--color-surface) border border-(--color-border) shadow-xs hover:shadow-md transition-shadow duration-200">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shrink-0 shadow-xs">
                    <CalendarDaysIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-base font-bold text-(--color-text)">Flexible Cancellation</p>
                    <p class="text-xs text-(--color-muted) mt-1 leading-relaxed">Take the stress out of planning with full flexibility on your upcoming travel dates.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4 p-5 rounded-2xl bg-(--color-surface) border border-(--color-border) shadow-xs hover:shadow-md transition-shadow duration-200">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shrink-0 shadow-xs">
                    <WifiIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-base font-bold text-(--color-text)">Dedicated High-Speed WiFi</p>
                    <p class="text-xs text-(--color-muted) mt-1 leading-relaxed">Experience ultra-fast, stable internet tailored for remote working or streaming.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- About Property -->
            <div id="about" class="border-b border-(--color-border) pb-10 scroll-mt-28">
              <h2 class="mb-4 text-2xl font-extrabold text-(--color-text) tracking-tight">
                {{ t("propertyDetail.aboutProperty") }}
              </h2>
              <p class="text-base leading-relaxed text-(--color-muted) whitespace-pre-line">
                {{ property.description || t("propertyDetail.description") }}
              </p>
            </div>

            <!-- Room Types Bento Cards -->
            <div id="rooms" class="border-b border-(--color-border) pb-10 scroll-mt-28">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-extrabold text-(--color-text) tracking-tight">
                  {{ t("propertyDetail.roomTypes") }}
                </h2>
                <span class="text-xs font-extrabold text-(--color-primary) bg-(--color-primary-soft) px-3 py-1 rounded-full uppercase tracking-wider">
                  {{ currentRooms.length }} Available Options
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  v-for="room in currentRooms"
                  :key="room.name"
                  type="button"
                  class="flex flex-col justify-between border-2 p-6.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group cursor-pointer"
                  :style="
                    selectedRoom.name === room.name
                      ? 'border-color: var(--color-primary); background-color: var(--color-primary-soft); border-radius: var(--radius-lg); box-shadow: var(--shadow-panel);'
                      : 'border-color: var(--color-border); background-color: var(--color-surface); border-radius: var(--radius-lg);'
                  "
                  @click="selectRoom(room)"
                >
                  <div class="absolute top-4 right-4" v-if="selectedRoom.name === room.name">
                    <CheckCircleIcon class="h-7 w-7 text-(--color-primary) animate-scaleUp" />
                  </div>
                  <div>
                    <div
                      class="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-transform group-hover:scale-110"
                      :style="
                        selectedRoom.name === room.name
                          ? 'background-color: var(--color-primary); color: var(--color-text-inverse);'
                          : 'background-color: var(--color-surface-soft); color: var(--color-muted);'
                      "
                    >
                      <UserGroupIcon class="h-7 w-7" />
                    </div>
                    <p class="text-xl font-black text-(--color-text) group-hover:text-(--color-primary) transition-colors">{{ room.name }}</p>
                    <p class="mt-2 text-xs leading-relaxed text-(--color-muted) line-clamp-2">
                      {{ room.spec }}
                    </p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <span class="inline-block rounded-full bg-(--color-surface) px-3.5 py-1 text-xs font-bold text-(--color-muted) border border-(--color-border) shadow-xs">
                        Up to {{ room.capacity }} guests
                      </span>
                    </div>
                  </div>
                  <div class="mt-8 pt-4 border-t border-(--color-border)/50 flex items-baseline justify-between w-full">
                    <span class="text-xs font-bold text-(--color-muted)">Price per night</span>
                    <div class="text-right">
                      <span class="text-3xl font-black" style="color: var(--color-primary);">
                        {{ room.price > 0 ? formatPrice(room.price) : 'See Detail' }}
                      </span>
                      <span class="text-xs font-semibold text-(--color-muted)">
                        /{{ t("propertyDetail.night") }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- What This Place Offers (Amenities Grid) -->
            <div class="border-b border-(--color-border) pb-10">
              <h2 class="text-2xl font-extrabold text-(--color-text) tracking-tight mb-8">
                What this place offers
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-base font-bold text-(--color-text)">
                <div v-for="amenity in displayedAmenities" :key="amenity.id" class="flex items-center gap-4 group">
                  <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-surface-soft) border border-(--color-border) text-(--color-primary) group-hover:scale-110 group-hover:bg-(--color-primary-soft) transition-all duration-200 shadow-xs shrink-0">
                    <component :is="getAmenityIcon(amenity.amenity_name)" class="h-5 w-5 text-(--color-primary)" />
                  </div>
                  <span class="group-hover:text-(--color-primary) transition-colors">{{ amenity.amenity_name }}</span>
                </div>
              </div>
              <button
                v-if="amenities.length > 0"
                type="button"
                class="mt-10 rounded-2xl border border-(--color-border) bg-(--color-surface) px-8 py-4 text-base font-extrabold text-(--color-text) transition-all duration-200 hover:bg-(--color-surface-soft) hover:shadow-md active:scale-95 shadow-sm cursor-pointer"
                @click="showAmenityModal = true"
              >
                Show all {{ amenities.length }} amenities
              </button>
            </div>

            <!-- Availability Calendar -->
            <div id="availability" class="border-b border-(--color-border) pb-10 scroll-mt-28">
              <h2 class="mb-2 text-2xl font-extrabold text-(--color-text) tracking-tight">
                Select check-in date
              </h2>
              <p class="mb-6 text-sm text-(--color-muted)">
                Add your travel dates for exact pricing. Unavailable dates are highlighted in red.
              </p>
              <div class="border border-(--color-border) bg-(--color-surface) p-6 sm:p-8 shadow-sm" style="border-radius: var(--radius-sm);">
                <AvailabilityCalendar
                  :property-id="property.id"
                  mode="customer"
                  @range-selected="handleRangeSelected"
                />
              </div>
            </div>

            <!-- Guest Reviews -->
            <div id="reviews" class="scroll-mt-28">
              <div class="flex items-center justify-between flex-wrap gap-4 border-b border-(--color-border) pb-6">
                <h2 class="flex items-center gap-2.5 text-2xl sm:text-3xl font-black text-(--color-text) tracking-tight">
                  <StarIcon class="h-7 w-7 fill-current text-amber-500" />
                  <span>{{ reviewSummary.average }}</span>
                  <span class="text-(--color-muted) select-none">·</span>
                  <span>{{ reviewSummary.total }} {{ t("propertyDetail.reviews") }}</span>
                </h2>
                <RouterLink
                  :to="writeReviewLink"
                  class="flex items-center gap-2 px-5 py-2.5 bg-(--color-surface) border border-(--color-border) hover:border-(--color-primary)/60 text-xs sm:text-sm font-bold text-(--color-text) shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
                  style="border-radius: var(--radius-sm);"
                >
                  <SparklesIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ t("propertyDetail.writeReview") }}</span>
                </RouterLink>
              </div>

              <div class="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
                <!-- Rating summary (Clean unboxed layout) -->
                <div class="py-2">
                  <div class="flex items-baseline gap-3">
                    <span class="text-5xl font-black text-(--color-text) tracking-tight">{{ reviewSummary.average }}</span>
                    <span class="text-lg font-bold text-(--color-muted)">/ 5</span>
                  </div>
                  <p class="mt-2 text-base font-black text-(--color-text)">
                    {{ ratingWordLabel(reviewSummary.average) }}
                  </p>
                  <div class="mt-3 flex items-center gap-1 text-amber-500">
                    <StarIcon
                      v-for="n in 5"
                      :key="n"
                      class="h-5 w-5"
                      :class="n <= Math.round(reviewSummary.average) ? 'fill-current' : 'fill-none'"
                    />
                  </div>
                  <p class="mt-3 text-xs font-bold text-(--color-muted)">
                    {{ t("propertyDetail.basedOnReviews", { count: reviewSummary.total }) }}
                  </p>

                  <div class="mt-8 space-y-3">
                    <div
                      v-for="row in reviewSummary.breakdown"
                      :key="row.stars"
                      class="flex items-center gap-3 text-xs font-bold text-(--color-muted)"
                    >
                      <span class="w-14 shrink-0 whitespace-nowrap">{{ row.stars }} {{ t("propertyDetail.stars") }}</span>
                      <div class="h-1.5 flex-1 rounded-full bg-(--color-border)/80 overflow-hidden">
                        <div
                          class="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                          :style="{ width: row.pct + '%' }"
                        ></div>
                      </div>
                      <span class="w-10 shrink-0 text-right font-black text-(--color-text)">{{ row.pct }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Reviewer card carousel -->
                <div
                  v-if="guestReviews.length"
                  class="relative border border-(--color-border) bg-(--color-surface-soft) p-8 flex flex-col justify-between shadow-xs"
                  style="border-radius: var(--radius-sm);"
                >
                  <div class="flex items-start gap-5">
                    <div
                      class="flex h-14 w-14 shrink-0 items-center justify-center text-xl font-black shadow-sm bg-(--color-primary-soft) text-(--color-primary)"
                      style="border-radius: var(--radius-sm);"
                    >
                      {{ reviewerInitials(activeReview.author) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <p class="text-xl font-black text-(--color-text)">
                          {{ activeReview.author }}
                        </p>
                        <p class="text-sm font-medium text-(--color-muted)">
                          {{ activeReview.date }}
                        </p>
                      </div>

                      <div class="mt-2.5 flex items-center gap-1 text-amber-500">
                        <StarIcon
                          v-for="n in 5"
                          :key="n"
                          class="h-4.5 w-4.5"
                          :class="n <= activeReview.rating ? 'fill-current' : 'fill-none'"
                        />
                      </div>

                      <p
                        v-if="activeReview.title"
                        class="mt-4 text-lg font-black text-(--color-text)"
                      >
                        {{ activeReview.title }}
                      </p>
                      <p class="mt-3 text-base leading-relaxed text-(--color-text)">
                        "{{ activeReview.comment }}"
                      </p>
                      <p
                        v-if="activeReview.roomName"
                        class="mt-6 inline-block bg-(--color-surface) px-4 py-1.5 text-xs font-bold text-(--color-muted) border border-(--color-border) shadow-xs"
                        style="border-radius: var(--radius-sm);"
                      >
                        {{ t("propertyDetail.stayedIn", { room: activeReview.roomName }) }}
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="guestReviews.length > 1"
                    class="mt-8 flex items-center justify-end gap-3 border-t border-(--color-border)/60 pt-6"
                  >
                    <button
                      type="button"
                      class="flex h-11 w-11 items-center justify-center border border-(--color-border) bg-(--color-surface) text-(--color-text) transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                      style="border-radius: var(--radius-sm);"
                      @click="prevReview"
                    >
                      <ChevronRightIcon class="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      class="flex h-11 w-11 items-center justify-center border border-(--color-border) bg-(--color-surface) text-(--color-text) transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                      style="border-radius: var(--radius-sm);"
                      @click="nextReview"
                    >
                      <ChevronRightIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="flex flex-col items-center justify-center border border-(--color-border) bg-(--color-surface-soft) p-10 sm:p-14 text-center shadow-xs"
                  style="border-radius: var(--radius-sm);"
                >
                  <div class="flex h-20 w-20 items-center justify-center bg-amber-500/10 text-amber-500 mb-6 shadow-inner" style="border-radius: var(--radius-sm);">
                    <StarIcon class="h-10 w-10 fill-current text-amber-500" />
                  </div>
                  <h3 class="text-2xl font-black text-(--color-text) tracking-tight">
                    No reviews (yet)
                  </h3>
                  <p class="text-sm font-medium text-(--color-muted) max-w-sm mt-3 leading-relaxed">
                    This property is waiting for its very first guest review. Book a stay and be the first to share your wonderful experience!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: The Famous Sticky Airbnb Booking Widget -->
          <div class="h-fit lg:sticky lg:top-24">
            <div class="border border-(--color-border) bg-(--color-surface) p-6 md:p-7 relative overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40" style="border-radius: var(--radius-sm);">
              <!-- Top Banner Perk -->
              <div class="absolute top-0 left-0 right-0 bg-(--color-primary-soft) border-b border-(--color-border) py-2 px-6 flex items-center justify-center gap-1.5 text-xs font-black text-(--color-primary) tracking-wider uppercase">
                <BoltIcon class="h-3.5 w-3.5 text-(--color-primary)" />
                <span>Instant Booking Confirmed</span>
              </div>

              <div class="flex items-baseline justify-between gap-4 pt-6">
                <div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-black tracking-tight text-(--color-text)">
                      {{ formatPrice(selectedRoom.price) }}
                    </span>
                    <span class="text-sm font-bold text-(--color-muted)">
                      / {{ t("propertyDetail.night") }}
                    </span>
                  </div>
                  <p class="mt-1 text-xs font-bold text-(--color-primary) flex items-center gap-1">
                    <span>{{ selectedRoom.name }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-1 text-xs font-bold text-(--color-text) bg-(--color-surface-soft) border border-(--color-border) px-2.5 py-1 shadow-xs" style="border-radius: var(--radius-sm);">
                  <StarIcon class="h-3.5 w-3.5 fill-current text-amber-500" />
                  <span>{{ reviewSummary.total > 0 ? reviewSummary.average : t("propertyDetail.new", "New") }}</span>
                  <span class="text-(--color-muted)">·</span>
                  <span class="text-(--color-muted) underline">{{ reviewSummary.total }} {{ t("propertyDetail.reviews") }}</span>
                </div>
              </div>

              <!-- Airbnb Date & Guest Picker Box -->
              <div class="mt-6 border border-(--color-border) overflow-hidden bg-(--color-surface) shadow-xs" style="border-radius: var(--radius-sm);">
                <div class="grid grid-cols-2 border-b border-(--color-border)">
                  <label class="block p-3 border-r border-(--color-border) focus-within:bg-(--color-surface-soft) transition cursor-pointer">
                    <span class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)">
                      {{ t("propertyDetail.checkIn") }}
                    </span>
                    <input
                      v-model="checkInDate"
                      type="date"
                      :min="minDate"
                      class="mt-1 w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer"
                    />
                  </label>
                  <label class="block p-3 focus-within:bg-(--color-surface-soft) transition cursor-pointer">
                    <span class="text-[10px] font-black uppercase tracking-widest text-(--color-muted)">
                      {{ t("propertyDetail.checkOut") }}
                    </span>
                    <input
                      v-model="checkOutDate"
                      type="date"
                      :min="checkInDate || minDate"
                      class="mt-1 w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer"
                    />
                  </label>
                </div>

                <div class="p-3 focus-within:bg-(--color-surface-soft) transition">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-1">
                    {{ t("home.search.guests") }}
                  </label>
                  <div class="flex items-center gap-2">
                    <UserGroupIcon class="h-4 w-4 text-(--color-primary)" />
                    <select
                      v-model.number="guestCount"
                      class="w-full bg-transparent text-sm font-bold text-(--color-text) outline-none cursor-pointer"
                    >
                      <option
                        v-for="count in availableGuestOptions"
                        :key="count"
                        :value="count"
                      >
                        {{ count }} {{ t("home.search.guests") }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-6 w-full py-3 text-base font-black transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-md shadow-(--color-primary)/20"
                style="background-color: var(--color-primary); color: var(--color-text-inverse); border-radius: var(--radius-sm);"
                @click="goToBooking"
              >
                {{ t("propertyDetail.reserveNow") }}
              </button>

              <p class="mt-4 text-center text-xs font-bold text-(--color-muted)">
                You won't be charged yet
              </p>

              <div class="mt-6 space-y-3.5 text-sm text-(--color-muted)">
                <div class="flex items-center justify-between font-medium">
                  <span class="hover:underline cursor-pointer">{{ formatPrice(selectedRoom.price) }} x {{ stayNights }} {{ t("propertyDetail.night") }}</span>
                  <span class="font-bold text-(--color-text)">{{ formatPrice(roomSubtotal) }}</span>
                </div>
                <div class="flex items-center justify-between font-medium">
                  <span class="hover:underline cursor-pointer">{{ t("propertyDetail.serviceFee") }}</span>
                  <span class="font-bold text-(--color-text)">{{ formatPrice(serviceFee) }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-(--color-border) pt-4 text-base font-black text-(--color-text)">
                  <span>{{ t("propertyDetail.total") }} before taxes</span>
                  <span class="text-(--color-primary)">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Minimalist Bottom CTA Section -->
        <div class="mt-12 border-t border-(--color-border) pt-10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="max-w-xl">
            <h3 class="text-2xl sm:text-3xl font-black text-(--color-text) tracking-tight">
              Explore all accommodation options
            </h3>
            <p class="mt-2 text-base text-(--color-muted) leading-relaxed">
              Looking for more options? Browse all available rooms for this property to find your perfect match.
            </p>
          </div>
          <RouterLink
            :to="{
              name: 'public.property-rooms',
              params: { propertyId: route.params.id },
            }"
            class="shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
            style="background-color: var(--color-accent); color: var(--color-surface-strong); border-radius: var(--radius-sm);"
          >
            <span>View all available rooms</span>
            <ArrowRightIcon class="h-4 w-4" />
          </RouterLink>
        </div>
      </main>

      <!-- Airbnb-Style Amenity Modal Dialog -->
      <div
        v-if="showAmenityModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 sm:p-6 transition-all duration-300"
        @click.self="showAmenityModal = false"
      >
        <div
          class="flex flex-col max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b p-7 border-(--color-border)">
            <h3 class="text-2xl font-black text-(--color-text) tracking-tight">
              What this place offers
            </h3>
            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-surface-soft) text-(--color-text) border border-(--color-border) hover:scale-105 transition active:scale-95 cursor-pointer shadow-xs"
              @click="showAmenityModal = false"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Modal Body (Scrollable List) -->
          <div class="overflow-y-auto p-8 space-y-7">
            <div
              v-for="amenity in amenities"
              :key="amenity.id"
              class="flex items-center gap-6 py-2 border-b border-(--color-border)/40 last:border-none"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shrink-0 shadow-xs">
                <component :is="getAmenityIcon(amenity.amenity_name)" class="h-7 w-7 text-(--color-primary)" />
              </div>
              <span class="text-xl font-bold text-(--color-text)">{{ amenity.amenity_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
