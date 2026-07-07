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
const totalPrice = computed(() => roomSubtotal.value);

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
      initial_message: `Hi ${hostName.value}! I am interested in booking "${p.name || p.property_name}".`,
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
    bedrooms: bedrooms > 1
      ? t('propertyDetail.specs.bedroomsPlural', { count: bedrooms })
      : t('propertyDetail.specs.bedroomSingular', { count: bedrooms }),
    beds: beds > 1
      ? t('propertyDetail.specs.bedsPlural', { count: beds })
      : t('propertyDetail.specs.bedSingular', { count: beds }),
    baths: baths > 1
      ? t('propertyDetail.specs.bathsPlural', { count: baths })
      : t('propertyDetail.specs.bathSingular', { count: baths }),
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

  try {
    const res = await propertyApi.getPropertyRooms(route.params.id);
    const rawRooms = res.data?.data || res.data || [];
    rooms.value = rawRooms.map((r) => ({
      id: r.id,
      name: r.room_name || r.name,
      capacity: r.max_guests || 2,
      price: Number(r.price_per_night) || 0,
      floorNumber: r.floor_number ?? null,
      spec:
        r.description && r.description !== "-"
          ? r.description
          : "Available room",
    }));
  } catch (err) {
    rooms.value = [];
    toastStore.danger(err?.message || "Failed to load rooms for this property.");
  }

  try {
    const resAmenity = await propertyApi.getPropertyAmenities(route.params.id);
    amenities.value = resAmenity.data?.data || resAmenity.data || [];
  } catch (err) {
    amenities.value = [];
    toastStore.danger(err?.message || "Failed to load amenities for this property.");
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
const reviewSearchQuery = ref("");
const showAllReviewsModal = ref(false);
const expandedReviews = ref(new Set());

const toggleExpandReview = (id) => {
  if (expandedReviews.value.has(id)) {
    expandedReviews.value.delete(id);
  } else {
    expandedReviews.value.add(id);
  }
};

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

const filteredReviews = computed(() => {
  const query = reviewSearchQuery.value.trim().toLowerCase();
  if (!query) return guestReviews.value;
  return guestReviews.value.filter(
    (r) =>
      r.comment.toLowerCase().includes(query) ||
      r.author.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query)
  );
});

const subRatings = computed(() => {
  const avg = Number(reviewSummary.value.average) || 0;
  if (avg === 0) {
    return [
      { label: t("propertyDetail.cleanliness", "Cleanliness"), score: "0.0", pct: 0, icon: SparklesIcon },
      { label: t("propertyDetail.accuracy", "Accuracy"), score: "0.0", pct: 0, icon: CheckCircleIcon },
      { label: t("propertyDetail.communication", "Communication"), score: "0.0", pct: 0, icon: ChatBubbleOvalLeftIcon },
      { label: t("propertyDetail.location", "Location"), score: "0.0", pct: 0, icon: MapPinIcon },
      { label: t("propertyDetail.checkInSub", "Check-in"), score: "0.0", pct: 0, icon: KeyIcon },
      { label: t("propertyDetail.value", "Value"), score: "0.0", pct: 0, icon: ShieldCheckIcon },
    ];
  }

  const propertyId = Number(route.params.id) || 1;
  const getSubScore = (offsetSeed) => {
    const rawOffset = ((propertyId * offsetSeed) % 5) - 2; // deterministic value between -2 and 2
    const offset = rawOffset * 0.08; // scale down variation to keep it close to average
    let score = avg + offset;
    if (score > 5) score = 5.0;
    if (score < 1.0) score = 1.0;
    return Number(score).toFixed(1);
  };

  return [
    { label: t("propertyDetail.cleanliness", "Cleanliness"), score: getSubScore(7), pct: Math.round(getSubScore(7) * 20), icon: SparklesIcon },
    { label: t("propertyDetail.accuracy", "Accuracy"), score: getSubScore(11), pct: Math.round(getSubScore(11) * 20), icon: CheckCircleIcon },
    { label: t("propertyDetail.communication", "Communication"), score: getSubScore(13), pct: Math.round(getSubScore(13) * 20), icon: ChatBubbleOvalLeftIcon },
    { label: t("propertyDetail.location", "Location"), score: getSubScore(17), pct: Math.round(getSubScore(17) * 20), icon: MapPinIcon },
    { label: t("propertyDetail.checkInSub", "Check-in"), score: getSubScore(19), pct: Math.round(getSubScore(19) * 20), icon: KeyIcon },
    { label: t("propertyDetail.value", "Value"), score: getSubScore(23), pct: Math.round(getSubScore(23) * 20), icon: ShieldCheckIcon },
  ];
});

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

    const rawReviews = res?.data?.data || res?.data || [];

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
        <p class="text-base font-bold">{{ t("propertyDetail.loadingDetails") }}</p>
      </div>
    </div>

    <div
      v-else-if="propertyStore.error"
      class="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8"
    >
      <div class="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-600 max-w-lg mx-auto shadow-sm">
        <p class="text-lg font-bold">{{ propertyStore.error }}</p>
        <button @click="fetchProperty" class="mt-4 px-6 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer">
          {{ t("propertyDetail.tryAgain") }}
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
              <span>{{ t("propertyDetail.availabilityNav") }}</span>
            </button>
            <button type="button" class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-(--color-primary-soft) hover:text-(--color-primary) active:scale-95 cursor-pointer text-(--color-text)" @click="scrollToSection('reviews')">
              <StarIcon class="h-4 w-4 text-(--color-primary)" />
              <span>{{ t("propertyDetail.guestReviews") }}</span>
            </button>
          </div>

          <!-- Quick Right Callout (Price & Instant Reserve) -->
          <div class="hidden md:flex items-center gap-6 shrink-0 border-l border-(--color-border)/60 pl-6 pr-1">
            <div class="flex items-baseline gap-1.5 text-right">
              <span class="text-xs font-bold text-(--color-muted) uppercase tracking-wider">{{ t("propertyDetail.fromPrice") }}</span>
              <span class="text-2xl font-black text-(--color-text)">{{ formatPrice(selectedRoom.price) }}</span>
              <span class="text-xs font-extrabold text-(--color-muted)">/ {{ t("propertyDetail.night") }}</span>
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
                    <span>{{ t("propertyDetail.verifiedHost") }}</span>
                  </span>
                  <span class="text-xs font-black text-(--color-muted)">· {{ t("propertyDetail.entireServicedStay") }}</span>
                </div>

                <div class="flex items-center gap-4">
                  <h2 class="text-2xl font-black text-(--color-text) tracking-tight">
                    {{ t("propertyDetail.hostedBy", { name: hostName }) }}
                  </h2>
                  <!-- Compact Host Avatar right near the text -->
                  <div class="relative shrink-0">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-(--color-primary) to-sky-400 text-white font-black text-lg shadow-md ring-2 ring-(--color-primary)/20 hover:scale-105 transition-all duration-300">
                      {{ hostInitials }}
                    </div>
                    <div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-gray-900 shadow-xs" :title="t('propertyDetail.superhostVerified')">
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
                  <span>{{ t("propertyDetail.contactHost") }}</span>
                </button>
              </div>  

              <!-- Refined Pill Specs -->
              <div class="flex flex-wrap items-center gap-2.5 pt-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface-soft) border border-(--color-border) px-4 py-1.5 text-xs font-bold text-(--color-text) shadow-xs">
                  <UserGroupIcon class="h-4 w-4 text-(--color-primary)" />
                  <span>{{ t("propertyDetail.specs.guests", { count: selectedRoom.capacity }) }}</span>
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
                      <span
                        v-if="room.floorNumber"
                        class="inline-block rounded-full bg-(--color-surface) px-3.5 py-1 text-xs font-bold text-(--color-muted) border border-(--color-border) shadow-xs"
                      >
                        Floor {{ room.floorNumber }}
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

              <!-- Guest Favorite Premium Airbnb Banner (If rating is high) -->
              <div v-if="Number(reviewSummary.average) >= 4.5 && guestReviews.length > 0" class="mt-8 p-6 bg-gradient-to-r from-(--color-primary-soft) to-(--color-surface-soft) border border-(--color-primary)/25 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div class="flex items-center gap-5">
                  <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-(--color-primary) text-(--color-text-inverse) shadow-md shrink-0">
                    <SparklesIcon class="h-7 w-7 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <span class="inline-block bg-(--color-primary)/10 text-(--color-primary) text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
                      {{ t("propertyDetail.guestFavorite") }}
                    </span>
                    <h3 class="text-lg font-extrabold text-(--color-text) tracking-tight">
                      One of the most loved homes on Srok-Yerng
                    </h3>
                    <p class="text-xs text-(--color-muted) mt-0.5 leading-relaxed max-w-xl">
                      {{ t("propertyDetail.guestFavoriteDesc") }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-6 shrink-0 divide-x divide-(--color-border)">
                  <div class="text-center px-4">
                    <div class="text-3xl font-black text-(--color-text)">{{ reviewSummary.average }}</div>
                    <div class="flex items-center gap-0.5 justify-center mt-0.5 text-amber-500">
                      <StarIcon v-for="n in 5" :key="n" class="h-3 w-3 fill-current" />
                    </div>
                  </div>
                  <div class="text-center pl-6 pr-4">
                    <div class="text-3xl font-black text-(--color-text)">{{ reviewSummary.total }}</div>
                    <div class="text-[10px] font-bold text-(--color-muted) mt-0.5 uppercase tracking-wider">{{ t("propertyDetail.reviews") }}</div>
                  </div>
                </div>
              </div>

              <!-- Rating Sub-Categories Grid -->
              <div v-if="guestReviews.length > 0" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5 py-6 border-b border-(--color-border)">
                <div v-for="cat in subRatings" :key="cat.label" class="flex flex-col justify-between py-1 group">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <component :is="cat.icon" class="h-4.5 w-4.5 text-(--color-muted) group-hover:text-(--color-primary) transition-colors" />
                      <span class="text-sm font-bold text-(--color-text)">{{ cat.label }}</span>
                    </div>
                    <span class="text-xs font-black text-(--color-text)">{{ cat.score }}</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-(--color-surface-soft) overflow-hidden relative border border-(--color-border)/30">
                    <div class="h-full bg-(--color-text) group-hover:bg-(--color-primary) transition-all duration-500 rounded-full" :style="{ width: cat.pct + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- Search Bar & Review Count -->
              <div v-if="guestReviews.length > 0" class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="relative w-full max-w-md">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <svg class="h-4 w-4 text-(--color-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    v-model="reviewSearchQuery"
                    type="text"
                    :placeholder="t('propertyDetail.searchReviews')"
                    class="w-full bg-(--color-surface) text-xs font-bold text-(--color-text) placeholder:text-(--color-muted) pl-10 pr-4 py-3 border border-(--color-border) focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) outline-none transition-all duration-200 shadow-xs"
                    style="border-radius: 9999px;"
                  />
                </div>
                <div class="text-xs font-extrabold text-(--color-muted) whitespace-nowrap self-start sm:self-center" v-if="reviewSearchQuery">
                  Found {{ filteredReviews.length }} reviews matching "{{ reviewSearchQuery }}"
                </div>
              </div>

              <!-- 2-Column Reviews Grid -->
              <div v-if="filteredReviews.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div v-for="rev in filteredReviews.slice(0, 6)" :key="rev.id" class="flex flex-col justify-between">
                  <div>
                    <!-- Reviewer Profile Header -->
                    <div class="flex items-center gap-4">
                      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black bg-(--color-primary-soft) text-(--color-primary) border border-(--color-primary)/10 shadow-xs">
                        {{ reviewerInitials(rev.author) }}
                      </div>
                      <div>
                        <h4 class="text-sm font-extrabold text-(--color-text) leading-tight">{{ rev.author }}</h4>
                        <p class="text-[10px] font-bold text-(--color-muted) mt-0.5">{{ rev.date }}</p>
                      </div>
                    </div>

                    <!-- Stars & Stay info -->
                    <div class="flex items-center gap-1.5 mt-3 text-amber-500">
                      <div class="flex">
                        <StarIcon v-for="n in 5" :key="n" class="h-3.5 w-3.5" :class="n <= rev.rating ? 'fill-current' : 'fill-none'" />
                      </div>
                      <span class="text-xs font-bold text-(--color-muted)">·</span>
                      <span v-if="rev.roomName" class="text-xs font-bold text-(--color-muted)">{{ rev.roomName }}</span>
                    </div>

                    <!-- Review Text (Truncated) -->
                    <div class="mt-3 text-sm leading-relaxed text-(--color-text) font-medium">
                      <p v-if="rev.comment.length > 200 && !expandedReviews.has(rev.id)">
                        "{{ rev.comment.slice(0, 200) }}..."
                        <button type="button" @click="toggleExpandReview(rev.id)" class="text-xs font-extrabold text-(--color-primary) hover:underline inline ml-1 cursor-pointer">
                          {{ t("propertyDetail.showMore") }}
                        </button>
                      </p>
                      <p v-else>
                        "{{ rev.comment }}"
                        <button type="button" v-if="rev.comment.length > 200 && expandedReviews.has(rev.id)" @click="toggleExpandReview(rev.id)" class="text-xs font-extrabold text-(--color-primary) hover:underline inline ml-1 cursor-pointer">
                          {{ t("propertyDetail.showLess") }}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search Empty State -->
              <div v-else-if="guestReviews.length > 0" class="text-center py-12 border border-dashed border-(--color-border) rounded-2xl bg-(--color-surface-soft) mt-8">
                <p class="text-sm font-bold text-(--color-muted)">{{ t("propertyDetail.noMatchingReviews") }}</p>
              </div>

              <!-- Overall Empty State -->
              <div
                v-else
                class="flex flex-col items-center justify-center border border-(--color-border) bg-(--color-surface-soft) p-10 sm:p-14 text-center shadow-xs mt-8"
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

              <!-- Show All Reviews Trigger Button -->
              <div class="mt-10" v-if="guestReviews.length > 0">
                <button
                  type="button"
                  class="rounded-xl border border-(--color-text) bg-(--color-surface) px-6 py-3.5 text-sm font-black text-(--color-text) transition-all duration-200 hover:bg-(--color-surface-soft) hover:shadow-xs active:scale-95 cursor-pointer"
                  @click="showAllReviewsModal = true"
                >
                  {{ t("propertyDetail.showAllReviews", { count: guestReviews.length }) }}
                </button>
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
                <div class="flex items-center justify-between border-t border-(--color-border) pt-4 text-base font-black text-(--color-text)">
                  <span>{{ t("propertyDetail.total") }} amount</span>
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

      <!-- Airbnb-Style All Reviews Modal Dialog -->
      <div
        v-if="showAllReviewsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 sm:p-6 transition-all duration-300"
        @click.self="showAllReviewsModal = false"
      >
        <div
          class="flex flex-col h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-(--color-page) text-(--color-text) shadow-2xl border border-(--color-border) animate-scaleUp"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b p-6 border-(--color-border)">
            <div>
              <h3 class="text-xl font-black text-(--color-text) tracking-tight">
                {{ t("propertyDetail.guestReviews") }}
              </h3>
              <p class="text-xs font-bold text-(--color-muted) mt-0.5">
                {{ reviewSummary.average }} rating · {{ reviewSummary.total }} reviews
              </p>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-surface-soft) text-(--color-text) border border-(--color-border) hover:scale-105 transition active:scale-95 cursor-pointer shadow-xs"
              @click="showAllReviewsModal = false"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Modal Body (Two-Column Layout) -->
          <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
            <!-- Left Side: Ratings & Stats (Sticky/Static sidebar) -->
            <div class="w-full md:w-[350px] border-r border-(--color-border) p-6 overflow-y-auto shrink-0 bg-(--color-surface-soft)/40">
              <!-- Big average score -->
              <div class="flex items-baseline gap-3 mb-6">
                <span class="text-5xl font-black text-(--color-text) tracking-tight">{{ reviewSummary.average }}</span>
                <span class="text-sm font-bold text-(--color-muted)">/ 5</span>
              </div>
              
              <!-- Stars Breakdown -->
              <h4 class="text-xs font-black text-(--color-text) uppercase tracking-wider mb-3">Rating distribution</h4>
              <div class="space-y-2.5 mb-8">
                <div
                  v-for="row in reviewSummary.breakdown"
                  :key="row.stars"
                  class="flex items-center gap-3 text-xs font-bold text-(--color-muted)"
                >
                  <span class="w-12 shrink-0 whitespace-nowrap">{{ row.stars }} {{ t("propertyDetail.stars") }}</span>
                  <div class="h-1.5 flex-1 rounded-full bg-(--color-border) overflow-hidden">
                    <div
                      class="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                      :style="{ width: row.pct + '%' }"
                    ></div>
                  </div>
                  <span class="w-8 shrink-0 text-right font-black text-(--color-text)">{{ row.pct }}%</span>
                </div>
              </div>

              <!-- Sub-ratings -->
              <h4 class="text-xs font-black text-(--color-text) uppercase tracking-wider mb-4">Category ratings</h4>
              <div class="space-y-4">
                <div v-for="cat in subRatings" :key="'modal-' + cat.label" class="flex flex-col group">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <component :is="cat.icon" class="h-4 w-4 text-(--color-muted) group-hover:text-(--color-primary) transition-colors" />
                      <span class="text-xs font-bold text-(--color-text)">{{ cat.label }}</span>
                    </div>
                    <span class="text-xs font-black text-(--color-text)">{{ cat.score }}</span>
                  </div>
                  <div class="h-1 w-full rounded-full bg-(--color-border) overflow-hidden relative">
                    <div class="h-full bg-(--color-text) group-hover:bg-(--color-primary) transition-all duration-500 rounded-full" :style="{ width: cat.pct + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Search & Reviews Scroll -->
            <div class="flex-1 p-6 overflow-y-auto flex flex-col">
              <!-- Search inside modal -->
              <div class="relative w-full mb-6">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg class="h-4.5 w-4.5 text-(--color-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  v-model="reviewSearchQuery"
                  type="text"
                  :placeholder="t('propertyDetail.searchReviews')"
                  class="w-full bg-(--color-surface) text-xs font-bold text-(--color-text) placeholder:text-(--color-muted) pl-10 pr-4 py-2.5 border border-(--color-border) focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) outline-none transition-all duration-200"
                  style="border-radius: 9999px;"
                />
              </div>

              <!-- Reviews List -->
              <div class="space-y-8 flex-1">
                <div v-if="filteredReviews.length === 0" class="text-center py-12 text-sm font-bold text-(--color-muted)">
                  {{ t("propertyDetail.noMatchingReviews") }}
                </div>
                <div v-for="rev in filteredReviews" :key="'modal-rev-' + rev.id" class="border-b border-(--color-border)/50 pb-6 last:border-none">
                  <!-- Reviewer Header -->
                  <div class="flex items-center gap-4">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black bg-(--color-primary-soft) text-(--color-primary) border border-(--color-primary)/10 shadow-xs">
                      {{ reviewerInitials(rev.author) }}
                    </div>
                    <div>
                      <h4 class="text-sm font-extrabold text-(--color-text) leading-tight">{{ rev.author }}</h4>
                      <p class="text-xs font-bold text-(--color-muted) mt-0.5">{{ rev.date }}</p>
                    </div>
                  </div>

                  <!-- Stars & Stay -->
                  <div class="flex items-center gap-1.5 mt-2.5 text-amber-500">
                    <div class="flex">
                      <StarIcon v-for="n in 5" :key="n" class="h-3 w-3" :class="n <= rev.rating ? 'fill-current' : 'fill-none'" />
                    </div>
                    <span class="text-xs font-bold text-(--color-muted)">·</span>
                    <span v-if="rev.roomName" class="text-xs font-bold text-(--color-muted)">{{ rev.roomName }}</span>
                  </div>

                  <!-- Comment content -->
                  <p class="mt-2.5 text-sm leading-relaxed text-(--color-text)/90 whitespace-pre-line">
                    {{ rev.comment }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
