<template>
  <PropertyGallery
    :property="propertyData"
    :selectedRoom="selectedRoom"
    :propertyRating="propertyRating"
    :reviewCount="reviewCount"
    @save="handleSave"
    @share="handleShare"
  />

  <div class="min-h-screen transition-colors duration-300">
    <main class="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
      <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div
            class="rounded-2xl border border-(--color-secondary)/50 bg-(--color-surface) p-6 shadow-sm"
          >
            <h2 class="mb-3 text-md font-bold text-(--color-text)">
              {{ t("propertyDetail.aboutProperty") }}
            </h2>
            <p class="text-sm leading-relaxed text-(--color-muted)">
              {{ t("propertyDetail.description") }}
            </p>

            <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div
                v-for="spec in specs"
                :key="spec.labelTop"
                class="rounded-xl bg-(--color-surface-soft) p-3 text-center"
              >
                <component
                  :is="spec.icon"
                  class="mx-auto h-6 w-6 text-(--color-primary)"
                />
                <p
                  class="mt-1 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)"
                >
                  {{ t(`propertyDetail.${spec.labelTop}`) }}
                </p>
                <p class="mt-0.5 text-xs font-bold text-(--color-primary)">
                  {{ spec.value }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="rounded-2xl border border-(--color-secondary)/50 bg-(--color-surface) p-6 shadow-sm"
          >
            <h2 class="mb-4 text-md font-bold text-(--color-text)">
              {{ t("propertyDetail.amenities") }}
            </h2>

            <div class="space-y-5">
              <div
                v-for="(items, category) in categorizedAmenities"
                :key="category"
              >
                <p
                  class="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--color-muted)"
                >
                  {{ t(`propertyDetail.${category}`) }}
                </p>

                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="item in items"
                    :key="item.name"
                    :class="[
                      item.colorClasses,
                      'flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-all sm:w-auto',
                    ]"
                  >
                    <component :is="item.icon" class="h-4 w-4 shrink-0" />
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-2xl border border-(--color-border) border-(--color-secondary)/50 bg-(--color-surface) p-6 shadow-sm"
          >
            <h2 class="mb-4 text-md font-bold text-(--color-text)">
              {{ t("propertyDetail.roomTypes") }}
            </h2>
            <div class="space-y-3">
              <div
                v-for="room in rooms"
                :key="room.name"
                @click="selectRoom(room)"
                :class="
                  selectedRoom.name === room.name
                    ? 'border-(--color-primary) ring-2 ring-(--color-primary)/10 bg-(--color-primary-soft)'
                    : 'border-(--color-border)'
                "
                class="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-gray-50/50 hover:bg-(--color-surface-soft)"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="radio"
                    :checked="selectedRoom.name === room.name"
                    class="text-(--color-primary) focus:ring-blue-500"
                  />
                  <div>
                    <p class="text-sm font-bold text-(--color-text)">
                      {{ room.name }}
                    </p>
                    <p class="text-[10px] text-(--color-muted)">
                      {{ room.spec }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-(--color-primary)">
                    ${{ room.price }}
                  </p>
                  <p class="text-[10px] text-(--color-muted)">
                    /{{ t("propertyDetail.night") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-2xl border border-(--color-secondary)/50 bg-(--color-surface) p-6 shadow-sm"
          >
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-md font-bold text-(--color-text)">
                {{ t("propertyDetail.guestReviews") }}
              </h2>
              <div class="flex items-center gap-2">
                <StarIcon class="h-4 w-4 fill-amber-400 text-amber-400" />
                <span class="font-bold text-(--color-text)">4.8</span>
                <span class="text-sm text-(--color-muted)">
                  - 245 {{ t("propertyDetail.reviews") }}
                </span>
              </div>
            </div>

            <div class="space-y-6">
              <div
                v-for="review in reviews"
                :key="review.name"
                class="border-b border-(--color-border) pb-6 last:border-0 last:pb-0"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white"
                    >
                      {{ review.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-(--color-text)">
                        {{ review.name }}
                      </p>
                      <p class="text-xs text-(--color-muted)">
                        {{ review.location }} - {{ review.date }}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-0.5 text-amber-400">
                    <StarIcon
                      v-for="i in 5"
                      :key="i"
                      class="h-4 w-4 fill-current"
                    />
                  </div>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-(--color-muted)">
                  "{{ review.quote }}"
                </p>
              </div>
            </div>

            <button
              class="mt-6 text-sm font-semibold text-(--color-primary) hover:underline"
            >
              {{ t("propertyDetail.viewAllReviews") }} ->
            </button>
          </div>
        </div>

        <div class="h-fit lg:sticky lg:top-6">
          <div
            class="relative mx-auto max-w-[344px] overflow-hidden rounded-[24px] border border-(--color-border) p-4 shadow-[0_18px_40px_rgba(6,41,105,0.12)] transition-colors duration-300"
            style="
              background: linear-gradient(
                160deg,
                var(--color-surface) 0%,
                var(--color-surface-soft) 100%
              );
            "
          >
            <div
              class="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-(--color-primary)/14 via-(--color-primary-soft) to-transparent"
            ></div>
            <div
              class="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-(--color-primary)/8 blur-3xl"
            ></div>

            <div class="relative space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-end gap-1.5">
                    <span
                      class="text-[2rem] font-black leading-none text-(--color-primary)"
                      >${{ selectedRoom.price }}</span
                    >
                    <span
                      class="pb-0.5 text-sm font-medium text-(--color-muted)"
                    >
                      /{{ t("propertyDetail.night") }}
                    </span>
                  </div>

                  <p class="mt-1 text-xs font-semibold text-(--color-muted)">
                    {{ selectedRoom.name }}
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-1 text-amber-500">
                  <StarIcon class="h-4 w-4 fill-current" />
                  <span class="text-sm font-bold leading-none">{{
                    propertyRating
                  }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <label
                  class="group rounded-[18px] border border-(--color-border) bg-(--color-surface)/80 px-3.5 py-2.5 transition focus-within:border-(--color-primary) focus-within:ring-4 focus-within:ring-(--color-focus-ring)"
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
                    style="color-scheme: light dark"
                    class="mt-2 w-full bg-transparent text-sm font-semibold text-(--color-text) outline-none"
                  />
                </label>

                <label
                  class="group rounded-[18px] border border-(--color-border) bg-(--color-surface)/80 px-3.5 py-2.5 transition focus-within:border-(--color-primary) focus-within:ring-4 focus-within:ring-(--color-focus-ring)"
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
                    style="color-scheme: light dark"
                    class="mt-2 w-full bg-transparent text-sm font-semibold text-(--color-text) outline-none"
                  />
                </label>
              </div>

              <div>
                <label
                  class="mb-1.5 block px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)"
                >
                  {{ t("home.search.guests") }}
                </label>
                <div
                  class="flex items-center gap-2.5 rounded-[18px] border border-(--color-border) bg-(--color-surface)/80 px-3.5 py-2.5 transition focus-within:border-(--color-primary) focus-within:ring-4 focus-within:ring-(--color-focus-ring)"
                >
                  <UserGroupIcon
                    class="h-4 w-4 shrink-0 text-(--color-primary)"
                  />
                  <select
                    v-model.number="guestCount"
                    class="w-full appearance-none bg-transparent text-sm font-semibold text-(--color-text) outline-none"
                  >
                    <option
                      v-for="count in availableGuestOptions"
                      :key="count"
                      :value="count"
                      class="text-slate-900"
                    >
                      {{ count }} {{ t("home.search.guests") }}
                    </option>
                  </select>
                  <ChevronDownIcon
                    class="h-4 w-4 shrink-0 text-(--color-muted)"
                  />
                </div>
              </div>

              <div
                class="rounded-[20px] border border-(--color-border) bg-(--color-surface)/80 p-3.5 backdrop-blur-sm"
              >
                <div class="mb-3 flex items-center justify-between gap-3">
                  <p class="text-xs font-semibold text-(--color-muted)">
                    {{ stayNights }} x {{ t("propertyDetail.night") }}
                  </p>
                  <p class="text-xs font-semibold text-(--color-muted)">
                    {{ selectedRoom.capacity }} max
                  </p>
                </div>

                <div class="space-y-2 text-sm text-(--color-muted)">
                  <div class="flex items-center justify-between gap-3">
                    <span
                      >${{ selectedRoom.price }} x {{ stayNights }}
                      {{ t("propertyDetail.night") }}</span
                    >
                    <span class="font-semibold text-(--color-text)">
                      ${{ roomSubtotal }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>{{ t("propertyDetail.serviceFee") }}</span>
                    <span class="font-semibold text-(--color-text)">
                      ${{ serviceFee }}
                    </span>
                  </div>
                  <div
                    class="flex items-center justify-between gap-3 border-t border-(--color-border) pt-2.5 text-[15px] font-bold text-(--color-text)"
                  >
                    <span>{{ t("propertyDetail.total") }}</span>
                    <span class="text-(--color-primary)"
                      >${{ totalPrice }}</span
                    >
                  </div>
                </div>
              </div>

              <button
                class="w-full rounded-[18px] bg-gradient-to-r from-(--color-primary) to-(--color-primary-strong) px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_28px_rgba(18,104,180,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(18,104,180,0.28)] active:translate-y-0 active:shadow-[0_14px_24px_rgba(18,104,180,0.2)]"
              >
                {{ t("propertyDetail.reserveNow") }}
              </button>

              <div
                class="text-center text-[11px] font-medium text-(--color-muted)"
              >
                {{ reviewCount }} {{ t("propertyDetail.reviews") }} -
                {{ selectedRoom.size }} sqm
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  SunIcon,
  FireIcon,
  MapPinIcon,
  CakeIcon,
  WifiIcon,
} from "@heroicons/vue/24/outline";

import { useI18n } from "vue-i18n";
import PropertyGallery from "../components/PropertyGallery.vue";

const { t } = useI18n({ useScope: "global" });

const handleSave = () => console.log("saved");
const handleShare = () => console.log("shared");
const propertyData = {
  name: "Angkor Mekong View Hotel",
  category: "Boutique Hotel",
  badge: "Top Rated",
  location: "Pub Street Area, Siem Reap",
  images: [
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1460672985063-6764ac8b9c74?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1505993597083-3bd19f75e575?auto=format&fit=crop&w=400&q=80",
  ],
};

const reviews = [
  {
    initials: "SL",
    name: "Sophie Laurent",
    location: "FR France",
    date: "March 2025",
    quote:
      "Absolutely stunning hotel! The staff were incredibly welcoming and the room was spotless. The pool area is beautiful. Will definitely return on my next visit to Cambodia.",
  },
  {
    initials: "JW",
    name: "James Whitfield",
    location: "GB UK",
    date: "February 2025",
    quote:
      "The most beautiful resort I have ever stayed at. Waking up to the sound of the ocean every morning was pure bliss. The staff went above and beyond.",
  },
];

const specs = [
  { icon: UserGroupIcon, value: "6 guests", labelTop: "upTo" },
  { icon: BuildingOfficeIcon, value: "3 types", labelTop: "rooms" },
  { icon: StarIcon, value: "4.9 / 5.0", labelTop: "rating" },
  { icon: ChatBubbleLeftIcon, value: "312+", labelTop: "reviews" },
];

const categorizedAmenities = {
  connectivity: [
    {
      name: "Free WiFi",
      icon: WifiIcon,
      colorClasses:
        "bg-(--color-primary-soft) border-(--color-primary)/20 text-(--color-primary)",
    },
  ],
  recreation: [
    {
      name: "Swimming Pool",
      icon: FireIcon,
      colorClasses: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      name: "Spa & Wellness",
      icon: SunIcon,
      colorClasses: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      name: "Fitness Center",
      icon: MapPinIcon,
      colorClasses: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
  ],
  dining: [
    {
      name: "Restaurant",
      icon: CakeIcon,
      colorClasses: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    },
  ],
  transport: [
    {
      name: "Airport Shuttle",
      icon: MapPinIcon,
      colorClasses:
        "bg-(--color-primary-soft) border-(--color-primary)/20 text-(--color-primary)",
    },
    {
      name: "Free Parking",
      icon: MapPinIcon,
      colorClasses:
        "bg-(--color-primary-soft) border-(--color-primary)/20 text-(--color-primary)",
    },
  ],
  services: [
    {
      name: "24h Front Desk",
      icon: UserGroupIcon,
      colorClasses: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    },
  ],
};

const rooms = [
  {
    name: "Beachfront Villa",
    spec: "Up to 2 guests - 45 sqm",
    capacity: 2,
    size: 45,
    price: 145,
  },
  {
    name: "Ocean Suite",
    spec: "Up to 4 guests - 65 sqm",
    capacity: 4,
    size: 65,
    price: 210,
  },
  {
    name: "Family Pavilion",
    spec: "Up to 6 guests - 90 sqm",
    capacity: 6,
    size: 90,
    price: 320,
  },
];

const selectedRoom = ref(rooms[0]);
const propertyRating = 4.6;
const reviewCount = 183;
const serviceFee = 7;
const checkInDate = ref("");
const checkOutDate = ref("");
const guestCount = ref(2);

const selectRoom = (room) => {
  selectedRoom.value = room;

  if (guestCount.value > room.capacity) {
    guestCount.value = room.capacity;
  }
};

const availableGuestOptions = computed(() =>
  Array.from({ length: selectedRoom.value.capacity }, (_, index) => index + 1),
);

const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) {
    return 1;
  }

  const startDate = new Date(checkInDate.value);
  const endDate = new Date(checkOutDate.value);
  const diffInMilliseconds = endDate - startDate;
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

  return Number.isFinite(diffInDays) && diffInDays > 0 ? diffInDays : 1;
});

const roomSubtotal = computed(
  () => selectedRoom.value.price * stayNights.value,
);
const totalPrice = computed(() => roomSubtotal.value + serviceFee);
</script>
