<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
} from "@heroicons/vue/24/outline";

import PropertyGallery from "../components/PropertyGallery.vue";
import AvailabilityCalendar from "@/modules/calendar/components/AvailabilityCalendar.vue";
import { usePropertyStore } from "../store/propertyStore";
import { propertyApi } from "../api/property.api";
import { useWishlistStore } from "@/modules/wishlists/store/wishlistStore";
import http from "@/app/api/http";

const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const router = useRouter();
const propertyStore = usePropertyStore();
const wishlistStore = useWishlistStore();
const rooms = ref([]);

const fallbackRoom = {
  name: "Standard Room",
  capacity: 2,
  price: 0,
  spec: "Available room",
};

const selectedRoom = ref(fallbackRoom);
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
const handleShare = () => {};

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
    : property.value?.rating || 0;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = list.filter((r) => Math.round(r.rating) === stars).length;
    const pct = total ? Math.round((count / total) * 100) : 0;
    return { stars, count, pct };
  });

  return {
    average: Number(average).toFixed(1),
    total: total || property.value?.reviews || 0,
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
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text)">
    <div
      v-if="propertyStore.loading"
      class="mx-auto max-w-7xl px-4 py-32 text-center text-(--color-muted) sm:px-6 lg:px-8"
    >
      Loading property details...
    </div>

    <div
      v-else-if="propertyStore.error"
      class="mx-auto max-w-7xl px-4 py-32 text-center text-rose-600 sm:px-6 lg:px-8"
    >
      {{ propertyStore.error }}
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

      <!-- Sticky Quick Navigation Bar -->
      <div class="sticky top-0 z-30 border-b bg-(--color-surface)/90 backdrop-blur-md py-4 shadow-sm" style="border-color: var(--color-border);">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-8 overflow-x-auto text-sm font-bold">
          <button type="button" class="transition hover:text-(--color-primary)" @click="scrollToSection('about')">
            {{ t("propertyDetail.aboutProperty") }}
          </button>
          <button type="button" class="transition hover:text-(--color-primary)" @click="scrollToSection('rooms')">
            {{ t("propertyDetail.roomTypes") }}
          </button>
          <button type="button" class="transition hover:text-(--color-primary)" @click="scrollToSection('availability')">
            Availability
          </button>
          <button type="button" class="transition hover:text-(--color-primary)" @click="scrollToSection('reviews')">
            {{ t("propertyDetail.guestReviews") }}
          </button>
        </div>
      </div>

      <main class="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="space-y-8 lg:col-span-2">
            <!-- Rich Highlights Bar -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="border bg-(--color-surface-soft) p-5 flex flex-col items-center text-center transition-all duration-200 hover:scale-105" style="border-color: var(--color-border); border-radius: var(--radius-lg);">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl mb-3" style="background-color: var(--color-primary-soft); color: var(--color-primary);">
                  <MapPinIcon class="h-6 w-6" />
                </div>
                <p class="text-sm font-bold text-(--color-text)">Top Location</p>
                <p class="text-xs text-(--color-muted) mt-1">9.5/10 rating</p>
              </div>
              <div class="border bg-(--color-surface-soft) p-5 flex flex-col items-center text-center transition-all duration-200 hover:scale-105" style="border-color: var(--color-border); border-radius: var(--radius-lg);">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl mb-3" style="background-color: var(--color-primary-soft); color: var(--color-primary);">
                  <StarIcon class="h-6 w-6" />
                </div>
                <p class="text-sm font-bold text-(--color-text)">Verified Clean</p>
                <p class="text-xs text-(--color-muted) mt-1">Sparkling stay</p>
              </div>
              <div class="border bg-(--color-surface-soft) p-5 flex flex-col items-center text-center transition-all duration-200 hover:scale-105" style="border-color: var(--color-border); border-radius: var(--radius-lg);">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl mb-3" style="background-color: var(--color-primary-soft); color: var(--color-primary);">
                  <CalendarDaysIcon class="h-6 w-6" />
                </div>
                <p class="text-sm font-bold text-(--color-text)">Flexible Stay</p>
                <p class="text-xs text-(--color-muted) mt-1">Easy booking</p>
              </div>
              <div class="border bg-(--color-surface-soft) p-5 flex flex-col items-center text-center transition-all duration-200 hover:scale-105" style="border-color: var(--color-border); border-radius: var(--radius-lg);">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl mb-3" style="background-color: var(--color-primary-soft); color: var(--color-primary);">
                  <BuildingOfficeIcon class="h-6 w-6" />
                </div>
                <p class="text-sm font-bold text-(--color-text)">Fast WiFi</p>
                <p class="text-xs text-(--color-muted) mt-1">High-speed</p>
              </div>
            </div>

            <!-- About Property -->
            <div
              id="about"
              class="rounded-2xl border bg-(--color-surface) p-6 md:p-8 scroll-mt-28"
              style="border-color: var(--color-border); box-shadow: var(--shadow-card); border-radius: var(--radius-panel);"
            >
              <h2
                class="mb-4 text-xl font-bold text-(--color-text) border-l-4 pl-3.5 py-0.5"
                style="border-color: var(--color-accent);"
              >
                {{ t("propertyDetail.aboutProperty") }}
              </h2>
              <p class="text-base leading-relaxed text-(--color-muted)">
                {{ property.description || t("propertyDetail.description") }}
              </p>
            </div>

            <!-- Room Types Bento Cards -->
            <div
              id="rooms"
              class="rounded-2xl border bg-(--color-surface) p-6 md:p-8 scroll-mt-28"
              style="border-color: var(--color-border); box-shadow: var(--shadow-card); border-radius: var(--radius-panel);"
            >
              <h2
                class="mb-6 text-xl font-bold text-(--color-text) border-l-4 pl-3.5 py-0.5"
                style="border-color: var(--color-accent);"
              >
                {{ t("propertyDetail.roomTypes") }}
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  v-for="room in currentRooms"
                  :key="room.name"
                  type="button"
                  class="flex flex-col justify-between border p-6 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  :style="
                    selectedRoom.name === room.name
                      ? 'border-color: var(--color-primary); background-color: var(--color-primary-soft); border-radius: var(--radius-lg); box-shadow: var(--shadow-card);'
                      : 'border-color: var(--color-border); background-color: var(--color-surface); border-radius: var(--radius-lg);'
                  "
                  @click="selectRoom(room)"
                >
                  <div class="absolute top-4 right-4" v-if="selectedRoom.name === room.name">
                    <CheckCircleIcon class="h-6 w-6" style="color: var(--color-primary);" />
                  </div>
                  <div>
                    <div
                      class="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
                      :style="
                        selectedRoom.name === room.name
                          ? 'background-color: var(--color-primary); color: var(--color-text-inverse);'
                          : 'background-color: var(--color-surface-soft); color: var(--color-muted);'
                      "
                    >
                      <UserGroupIcon class="h-6 w-6" />
                    </div>
                    <p class="text-lg font-black text-(--color-text)">{{ room.name }}</p>
                    <p class="mt-2 text-xs leading-relaxed text-(--color-muted) line-clamp-2">
                      {{ room.spec }}
                    </p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <span class="inline-block rounded-full bg-(--color-surface) px-3 py-1 text-xs font-semibold text-(--color-muted) border border-(--color-border)">
                        Up to {{ room.capacity }} guests
                      </span>
                    </div>
                  </div>
                  <div class="mt-6 pt-4 border-t border-(--color-border)/50 flex items-baseline justify-between w-full">
                    <span class="text-xs font-bold text-(--color-muted)">Price</span>
                    <div class="text-right">
                      <span class="text-2xl font-black" style="color: var(--color-primary);">
                        {{ room.price > 0 ? '$' + room.price : 'See Detail' }}
                      </span>
                      <span class="text-xs font-medium text-(--color-muted)">
                        /{{ t("propertyDetail.night") }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Availability Calendar -->
            <div
              id="availability"
              class="rounded-2xl border bg-(--color-surface) p-6 md:p-8 scroll-mt-28"
              style="border-color: var(--color-border); box-shadow: var(--shadow-card); border-radius: var(--radius-panel);"
            >
              <h2
                class="mb-2 text-xl font-bold text-(--color-text) border-l-4 pl-3.5 py-0.5"
                style="border-color: var(--color-accent);"
              >
                Availability
              </h2>
              <p class="mb-6 text-sm text-(--color-muted)">
                Select your check-in and check-out dates below. Unavailable
                dates are highlighted in red.
              </p>
              <AvailabilityCalendar
                :property-id="property.id"
                mode="customer"
                @range-selected="handleRangeSelected"
              />
            </div>

            <!-- Guest Reviews -->
            <div
              id="reviews"
              class="rounded-2xl border bg-(--color-surface) p-6 md:p-8 scroll-mt-28"
              style="border-color: var(--color-border); box-shadow: var(--shadow-card); border-radius: var(--radius-panel);"
            >
              <div
                class="flex items-center justify-between flex-wrap gap-4 border-b pb-6"
                style="border-color: var(--color-border);"
              >
                <h2
                  class="flex items-center gap-3 text-xl font-bold text-(--color-text) border-l-4 pl-3.5 py-0.5"
                  style="border-color: var(--color-accent);"
                >
                  {{ t("propertyDetail.guestReviews") }}
                  <span
                    class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
                    style="background-color: var(--color-accent-soft); color: var(--color-accent-strong);"
                  >
                    <StarIcon class="h-4 w-4 fill-current" />
                    {{ reviewSummary.average }}
                  </span>
                  <span class="text-sm font-medium text-(--color-muted)">
                    ({{ reviewSummary.total }} {{ t("propertyDetail.reviews") }})
                  </span>
                </h2>
                <RouterLink
                  :to="writeReviewLink"
                  class="rounded-xl border px-5 py-2.5 text-sm font-bold text-(--color-text) transition-all duration-200 hover:scale-105 active:scale-95"
                  style="border-color: var(--color-border); background-color: var(--color-surface-soft);"
                >
                  {{ t("propertyDetail.writeReview") }}
                </RouterLink>
              </div>

              <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                <!-- Rating summary -->
                <div
                  class="rounded-2xl border bg-(--color-surface-soft) p-6"
                  style="border-color: var(--color-border); border-radius: var(--radius-lg);"
                >
                  <p class="text-base font-bold text-(--color-text)">
                    {{ ratingWordLabel(reviewSummary.average) }}
                  </p>
                  <p class="mt-2 text-4xl font-black text-(--color-text)">
                    {{ reviewSummary.average }}
                    <span class="text-lg font-semibold text-(--color-muted)">/ 5</span>
                  </p>
                  <div class="mt-2 flex items-center gap-1" style="color: var(--color-accent);">
                    <StarIcon
                      v-for="n in 5"
                      :key="n"
                      class="h-5 w-5"
                      :class="n <= Math.round(reviewSummary.average) ? 'fill-current' : 'fill-none'"
                    />
                  </div>
                  <p class="mt-3 text-xs text-(--color-muted)">
                    {{ t("propertyDetail.basedOnReviews", { count: reviewSummary.total }) }}
                  </p>

                  <div class="mt-6 space-y-3">
                    <div
                      v-for="row in reviewSummary.breakdown"
                      :key="row.stars"
                      class="flex items-center gap-3 text-xs font-semibold text-(--color-muted)"
                    >
                      <span class="w-16 shrink-0 whitespace-nowrap">{{ row.stars }} {{ t("propertyDetail.stars") }}</span>
                      <div class="h-2 flex-1 rounded-full bg-(--color-border) overflow-hidden">
                        <div
                          class="h-2 rounded-full"
                          style="background-color: var(--color-accent);"
                          :style="{ width: row.pct + '%' }"
                        ></div>
                      </div>
                      <span class="w-10 shrink-0 text-right font-bold text-(--color-text)">{{ row.pct }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Reviewer card carousel -->
                <div
                  v-if="guestReviews.length"
                  class="relative rounded-2xl border bg-(--color-surface-soft) p-6 flex flex-col justify-between"
                  style="border-color: var(--color-border); border-radius: var(--radius-lg);"
                >
                  <div class="flex items-start gap-4">
                    <div
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-extrabold"
                      style="background-color: var(--color-primary-soft); color: var(--color-primary);"
                    >
                      {{ reviewerInitials(activeReview.author) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <p class="text-base font-bold text-(--color-text)">
                          {{ activeReview.author }}
                        </p>
                        <p class="text-xs font-medium text-(--color-muted)">
                          {{ activeReview.date }}
                        </p>
                      </div>

                      <div class="mt-1.5 flex items-center gap-1" style="color: var(--color-accent);">
                        <StarIcon
                          v-for="n in 5"
                          :key="n"
                          class="h-4 w-4"
                          :class="n <= activeReview.rating ? 'fill-current' : 'fill-none'"
                        />
                      </div>

                      <p
                        v-if="activeReview.title"
                        class="mt-3 text-base font-bold text-(--color-text)"
                      >
                        {{ activeReview.title }}
                      </p>
                      <p class="mt-2 text-sm leading-relaxed text-(--color-muted) italic">
                        "{{ activeReview.comment }}"
                      </p>
                      <p
                        v-if="activeReview.roomName"
                        class="mt-4 inline-block rounded-full bg-(--color-surface) px-3 py-1 text-xs font-semibold text-(--color-muted) border border-(--color-border)"
                      >
                        {{ t("propertyDetail.stayedIn", { room: activeReview.roomName }) }}
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="guestReviews.length > 1"
                    class="mt-6 flex items-center justify-end gap-3 border-t pt-4"
                    style="border-color: var(--color-border);"
                  >
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-full border bg-(--color-surface) text-(--color-muted) transition-all duration-200 hover:scale-105 active:scale-95"
                      style="border-color: var(--color-border); box-shadow: var(--shadow-card);"
                      @click="prevReview"
                    >
                      <ChevronRightIcon class="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-full border bg-(--color-surface) text-(--color-muted) transition-all duration-200 hover:scale-105 active:scale-95"
                      style="border-color: var(--color-border); box-shadow: var(--shadow-card);"
                      @click="nextReview"
                    >
                      <ChevronRightIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="flex items-center justify-center rounded-2xl border bg-(--color-surface-soft) p-8 text-base font-medium text-(--color-muted)"
                  style="border-color: var(--color-border); border-radius: var(--radius-lg);"
                >
                  {{ t("propertyDetail.noReviewsYet") }}
                </div>
              </div>
            </div>
          </div>

          <div class="h-fit lg:sticky lg:top-24">
            <div
              class="border bg-(--color-surface) p-6 md:p-8"
              style="border-color: var(--color-border); box-shadow: var(--shadow-panel); border-radius: var(--radius-panel);"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-baseline gap-1.5">
                    <span
                      class="text-4xl font-black tracking-tight"
                      style="color: var(--color-primary);"
                      >${{ selectedRoom.price }}</span
                    >
                    <span class="text-base font-medium text-(--color-muted)"
                      >/{{ t("propertyDetail.night") }}</span
                    >
                  </div>
                  <p class="mt-1.5 text-sm font-bold text-(--color-muted)">
                    {{ selectedRoom.name }}
                  </p>
                </div>
                <div
                  class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
                  style="background-color: var(--color-accent-soft); color: var(--color-accent-strong);"
                >
                  <StarIcon class="h-4 w-4 fill-current" />
                  <span>{{ reviewSummary.average }}</span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <label
                  class="block border bg-(--color-surface-soft) px-4 py-3 transition-colors focus-within:ring-2"
                  style="border-color: var(--color-border); border-radius: var(--radius-sm); --tw-ring-color: var(--color-primary);"
                >
                  <span
                    class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)"
                  >
                    <CalendarDaysIcon
                      class="h-4 w-4"
                      style="color: var(--color-primary);"
                    />
                    {{ t("propertyDetail.checkIn") }}
                  </span>
                  <input
                    v-model="checkInDate"
                    type="date"
                    class="mt-2 w-full bg-transparent text-base font-bold text-(--color-text) outline-none"
                  />
                </label>
                <label
                  class="block border bg-(--color-surface-soft) px-4 py-3 transition-colors focus-within:ring-2"
                  style="border-color: var(--color-border); border-radius: var(--radius-sm); --tw-ring-color: var(--color-primary);"
                >
                  <span
                    class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)"
                  >
                    <CalendarDaysIcon
                      class="h-4 w-4"
                      style="color: var(--color-primary);"
                    />
                    {{ t("propertyDetail.checkOut") }}
                  </span>
                  <input
                    v-model="checkOutDate"
                    type="date"
                    class="mt-2 w-full bg-transparent text-base font-bold text-(--color-text) outline-none"
                  />
                </label>
              </div>

              <div class="mt-4">
                <label
                  class="mb-2 block px-1 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)"
                >
                  {{ t("home.search.guests") }}
                </label>
                <div
                  class="flex items-center gap-3 border bg-(--color-surface-soft) px-4 py-3 focus-within:ring-2"
                  style="border-color: var(--color-border); border-radius: var(--radius-sm); --tw-ring-color: var(--color-primary);"
                >
                  <UserGroupIcon
                    class="h-5 w-5 shrink-0"
                    style="color: var(--color-primary);"
                  />
                  <select
                    v-model.number="guestCount"
                    class="w-full bg-transparent text-base font-bold text-(--color-text) outline-none"
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

              <div
                class="mt-6 border bg-(--color-surface-soft) p-5"
                style="border-color: var(--color-border); border-radius: var(--radius-md);"
              >
                <div class="space-y-3 text-base text-(--color-muted)">
                  <div class="flex items-center justify-between">
                    <span
                      >${{ selectedRoom.price }} x {{ stayNights }}
                      {{ t("propertyDetail.night") }}</span
                    >
                    <span class="font-bold text-(--color-text)"
                      >${{ roomSubtotal }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span>{{ t("propertyDetail.serviceFee") }}</span>
                    <span class="font-bold text-(--color-text)"
                      >${{ serviceFee }}</span
                    >
                  </div>
                  <div
                    class="flex items-center justify-between border-t border-dashed pt-4 text-lg font-black text-(--color-text)"
                    style="border-color: var(--color-border);"
                  >
                    <span>{{ t("propertyDetail.total") }}</span>
                    <span style="color: var(--color-primary);"
                      >${{ totalPrice }}</span
                    >
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-6 w-full py-4 text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style="background-color: var(--color-primary); color: var(--color-text-inverse); border-radius: var(--radius-md); box-shadow: var(--shadow-card);"
                @click="goToBooking"
              >
                {{ t("propertyDetail.reserveNow") }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <div
            class="p-8 md:p-12 text-center relative overflow-hidden"
            style="background-color: var(--color-surface-strong); color: var(--color-text-inverse); border-radius: var(--radius-panel); box-shadow: var(--shadow-panel);"
          >
            <div class="absolute inset-0 opacity-10 bg-radial from-white to-transparent pointer-events-none"></div>
            <h3 class="text-2xl md:text-3xl font-black mb-3">
              Explore All Accommodation Options
            </h3>
            <p class="text-base opacity-90 max-w-xl mx-auto mb-8">
              Looking for more options? Browse all available rooms for this property to find your perfect match.
            </p>
            <RouterLink
              :to="{
                name: 'public.property-rooms',
                params: { propertyId: route.params.id },
              }"
              class="inline-flex items-center gap-3 px-8 py-4 text-base font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl"
              style="background-color: var(--color-accent); color: var(--color-surface-strong); border-radius: var(--radius-md);"
            >
              <BuildingOfficeIcon class="h-5 w-5" />
              View All Available Rooms
              <ArrowRightIcon class="h-5 w-5" />
            </RouterLink>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
