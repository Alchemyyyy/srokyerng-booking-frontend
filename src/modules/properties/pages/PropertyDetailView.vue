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
} from "@heroicons/vue/24/outline";

import PropertyGallery from "../components/PropertyGallery.vue";
// import AvailabilityCalendar from "@/modules/components/AvailabilityCalendar.vue";\
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

  console.log("property.images:", propertyStore.property?.images); // 👈 add this
  console.log("property.image:", propertyStore.property?.image); // 👈 and this

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

// ── Availability Calendar ──
// When customer picks a range on the calendar, auto-fill the booking card inputs
const handleRangeSelected = ({ start, end }) => {
  checkInDate.value = start;
  checkOutDate.value = end;
};

const goToBooking = () => {
  router.push({
    name: "customer.room-book", // ✅ fix this
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
// Writing a review always needs a specific completed reservation
// (ReviewCreateView route: /customer/reservations/:reservationId/review).
// The property page doesn't know which reservation that is, so send the
// user to their "My Reviews" dashboard where completed stays are listed
// and they can pick one to review.
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
      <PropertyGallery
        :property="property"
        :selected-room="selectedRoom"
        :property-rating="reviewSummary.average"
        :review-count="reviewSummary.total"
        :is-saved="isSaved"
        @save="handleSave"
        @share="handleShare"
      />

      <main class="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <div
              class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
            >
              <h2 class="mb-3 text-md font-bold text-(--color-text)">
                {{ t("propertyDetail.aboutProperty") }}
              </h2>
              <p class="text-sm leading-relaxed text-(--color-muted)">
                {{ property.description || t("propertyDetail.description") }}
              </p>
            </div>

            <div
              class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
            >
              <h2 class="mb-4 text-md font-bold text-(--color-text)">
                {{ t("propertyDetail.roomTypes") }}
              </h2>
              <div class="space-y-3">
                <button
                  v-for="room in currentRooms"
                  :key="room.name"
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:bg-(--color-surface-soft)"
                  :class="
                    selectedRoom.name === room.name
                      ? 'border-(--color-primary) bg-(--color-primary-soft)'
                      : 'border-(--color-border)'
                  "
                  @click="selectRoom(room)"
                >
                  <div>
                    <p class="text-sm font-bold">{{ room.name }}</p>
                    <p class="text-[10px] text-(--color-muted)">
                      {{ room.spec }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-(--color-primary)">
                      {{ room.price > 0 ? "$" + room.price : "See Detail" }}
                    </p>

                    <p class="text-[10px] text-(--color-muted)">
                      /{{ t("propertyDetail.night") }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Availability Calendar -->
            <div
              class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
            >
              <h2 class="mb-1 text-md font-bold text-(--color-text)">
                Availability
              </h2>
              <p class="mb-4 text-xs text-(--color-muted)">
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
              class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
            >
              <div class="flex items-center justify-between flex-wrap gap-3">
                <h2
                  class="flex items-center gap-2 text-md font-bold text-(--color-text)"
                >
                  {{ t("propertyDetail.guestReviews") }}
                  <span class="flex items-center gap-1 text-amber-500">
                    <StarIcon class="h-4 w-4 fill-current" />
                    <span class="text-sm font-bold">{{
                      reviewSummary.average
                    }}</span>
                  </span>
                  <span class="text-xs font-normal text-(--color-muted)">
                    ({{ reviewSummary.total }}
                    {{ t("propertyDetail.reviews") }})
                  </span>
                </h2>
                <RouterLink
                  :to="writeReviewLink"
                  class="rounded-xl border border-(--color-border) px-4 py-2 text-xs font-bold text-(--color-text) transition hover:bg-(--color-surface-soft)"
                >
                  {{ t("propertyDetail.writeReview") }}
                </RouterLink>
              </div>

              <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
                <!-- Rating summary -->
                <div
                  class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4"
                >
                  <p class="text-sm font-bold text-(--color-text)">
                    {{ ratingWordLabel(reviewSummary.average) }}
                  </p>
                  <p class="mt-1 text-3xl font-black text-(--color-text)">
                    {{ reviewSummary.average }}
                    <span class="text-base font-semibold text-(--color-muted)"
                      >/ 5</span
                    >
                  </p>
                  <div class="mt-1 flex items-center gap-1 text-amber-500">
                    <StarIcon
                      v-for="n in 5"
                      :key="n"
                      class="h-4 w-4"
                      :class="
                        n <= Math.round(reviewSummary.average)
                          ? 'fill-current'
                          : 'fill-none'
                      "
                    />
                  </div>
                  <p class="mt-2 text-xs text-(--color-muted)">
                    {{
                      t("propertyDetail.basedOnReviews", {
                        count: reviewSummary.total,
                      })
                    }}
                  </p>

                  <div class="mt-4 space-y-2">
                    <div
                      v-for="row in reviewSummary.breakdown"
                      :key="row.stars"
                      class="flex items-center gap-2 text-xs text-(--color-muted)"
                    >
                      <span class="w-16 shrink-0 whitespace-nowrap"
                        >{{ row.stars }} {{ t("propertyDetail.stars") }}</span
                      >
                      <div
                        class="h-1.5 flex-1 rounded-full bg-(--color-border)"
                      >
                        <div
                          class="h-1.5 rounded-full bg-amber-400"
                          :style="{ width: row.pct + '%' }"
                        ></div>
                      </div>
                      <span class="w-8 shrink-0 text-right"
                        >{{ row.pct }}%</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Reviewer card carousel -->
                <div
                  v-if="guestReviews.length"
                  class="relative rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-sm font-bold text-(--color-primary)"
                    >
                      {{ reviewerInitials(activeReview.author) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div
                        class="flex flex-wrap items-center justify-between gap-2"
                      >
                        <p class="text-sm font-bold text-(--color-text)">
                          {{ activeReview.author }}
                        </p>
                        <p class="text-xs text-(--color-muted)">
                          {{ activeReview.date }}
                        </p>
                      </div>

                      <div class="mt-1 flex items-center gap-1 text-amber-500">
                        <StarIcon
                          v-for="n in 5"
                          :key="n"
                          class="h-4 w-4"
                          :class="
                            n <= activeReview.rating
                              ? 'fill-current'
                              : 'fill-none'
                          "
                        />
                      </div>

                      <p
                        v-if="activeReview.title"
                        class="mt-2 text-sm font-bold text-(--color-text)"
                      >
                        {{ activeReview.title }}
                      </p>
                      <p
                        class="mt-1 text-xs leading-relaxed text-(--color-muted)"
                      >
                        {{ activeReview.comment }}
                      </p>
                      <p
                        v-if="activeReview.roomName"
                        class="mt-2 text-[11px] text-(--color-muted)"
                      >
                        {{
                          t("propertyDetail.stayedIn", {
                            room: activeReview.roomName,
                          })
                        }}
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="guestReviews.length > 1"
                    class="mt-3 flex items-center justify-end gap-2"
                  >
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:bg-(--color-surface-soft)"
                      @click="prevReview"
                    >
                      <ChevronRightIcon class="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:bg-(--color-surface-soft)"
                      @click="nextReview"
                    >
                      <ChevronRightIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="flex items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4 text-sm text-(--color-muted)"
                >
                  {{ t("propertyDetail.noReviewsYet") }}
                </div>
              </div>
            </div>
          </div>

          <div class="h-fit lg:sticky lg:top-6">
            <div
              class="rounded-[24px] border border-(--color-border) bg-(--color-surface) p-4 shadow-[0_18px_40px_rgba(6,41,105,0.12)]"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-end gap-1.5">
                    <span
                      class="text-[2rem] font-black leading-none text-(--color-primary)"
                      >${{ selectedRoom.price }}</span
                    >
                    <span class="pb-0.5 text-sm text-(--color-muted)"
                      >/{{ t("propertyDetail.night") }}</span
                    >
                  </div>
                  <p class="mt-1 text-xs font-semibold text-(--color-muted)">
                    {{ selectedRoom.name }}
                  </p>
                </div>
                <div class="flex items-center gap-1 text-amber-500">
                  <StarIcon class="h-4 w-4 fill-current" />
                  <span class="text-sm font-bold">{{
                    reviewSummary.average
                  }}</span>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2.5">
                <label
                  class="rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5"
                >
                  <span
                    class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)"
                  >
                    <CalendarDaysIcon
                      class="h-3.5 w-3.5 text-(--color-primary)"
                    />
                    {{ t("propertyDetail.checkIn") }}
                  </span>
                  <input
                    v-model="checkInDate"
                    type="date"
                    class="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </label>
                <label
                  class="rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5"
                >
                  <span
                    class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)"
                  >
                    <CalendarDaysIcon
                      class="h-3.5 w-3.5 text-(--color-primary)"
                    />
                    {{ t("propertyDetail.checkOut") }}
                  </span>
                  <input
                    v-model="checkOutDate"
                    type="date"
                    class="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </label>
              </div>

              <div class="mt-3">
                <label
                  class="mb-1.5 block px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)"
                >
                  {{ t("home.search.guests") }}
                </label>
                <div
                  class="flex items-center gap-2.5 rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5"
                >
                  <UserGroupIcon
                    class="h-4 w-4 shrink-0 text-(--color-primary)"
                  />
                  <select
                    v-model.number="guestCount"
                    class="w-full bg-transparent text-sm font-semibold outline-none"
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
                class="mt-4 rounded-[20px] border border-(--color-border) bg-(--color-surface-soft) p-3.5"
              >
                <div class="space-y-2 text-sm text-(--color-muted)">
                  <div class="flex items-center justify-between">
                    <span
                      >${{ selectedRoom.price }} x {{ stayNights }}
                      {{ t("propertyDetail.night") }}</span
                    >
                    <span class="font-semibold text-(--color-text)"
                      >${{ roomSubtotal }}</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span>{{ t("propertyDetail.serviceFee") }}</span>
                    <span class="font-semibold text-(--color-text)"
                      >${{ serviceFee }}</span
                    >
                  </div>
                  <div
                    class="flex items-center justify-between border-t border-(--color-border) pt-2.5 text-[15px] font-bold text-(--color-text)"
                  >
                    <span>{{ t("propertyDetail.total") }}</span>
                    <span class="text-(--color-primary)"
                      >${{ totalPrice }}</span
                    >
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 w-full rounded-[18px] bg-(--color-primary) px-5 py-3.5 text-sm font-bold text-white transition hover:bg-(--color-primary-strong)"
                @click="goToBooking"
              >
                {{ t("propertyDetail.reserveNow") }}
              </button>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm text-center"
          >
            <p class="text-sm text-(--color-muted) mb-3">
              Looking for more options? Browse all available rooms for this
              property.
            </p>
            <RouterLink
              :to="{
                name: 'public.property-rooms',
                params: { propertyId: route.params.id },
              }"
              class="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition shadow-md"
              style="background-color: var(--color-primary); color: white"
            >
              <BuildingOfficeIcon class="h-4 w-4" />
              View All Available Rooms
              <ArrowRightIcon class="h-4 w-4" />
            </RouterLink>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
