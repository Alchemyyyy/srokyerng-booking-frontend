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
} from "@heroicons/vue/24/outline";

import PropertyGallery from "../components/PropertyGallery.vue";
import { usePropertyStore } from "../store/propertyStore";

const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const router = useRouter();
const propertyStore = usePropertyStore();

const fallbackRoom = {
  name: "Standard Room",
  capacity: 2,
  size: 24,
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
  const diffInDays = Math.ceil(
    (endDate - startDate) / (1000 * 60 * 60 * 24),
  );
  return Number.isFinite(diffInDays) && diffInDays > 0 ? diffInDays : 1;
});

const roomSubtotal = computed(() => selectedRoom.value.price * stayNights.value);
const totalPrice = computed(() => roomSubtotal.value + serviceFee);

const property = computed(() => propertyStore.property);

const currentRooms = computed(() => {
  if (!property.value) return [fallbackRoom];

  return property.value.rooms?.length
    ? property.value.rooms
    : [fallbackRoom];
});

const selectRoom = (room) => {
  selectedRoom.value = room;
  if (guestCount.value > room.capacity) {
    guestCount.value = room.capacity;
  }
};

const fetchProperty = async () => {
  await propertyStore.fetchPropertyById(route.params.id).catch(() => {});
  const firstRoom = currentRooms.value[0] || fallbackRoom;
  selectedRoom.value = firstRoom;
};

watch(
  () => route.params.id,
  () => {
    fetchProperty();
  },
  { immediate: true },
);

const handleSave = () => {};
const handleShare = () => {};

const goToBooking = () => {
  router.push({
    name: "booking-create",
    query: {
      roomId: property.value?.id,
      checkIn: checkInDate.value || undefined,
      checkOut: checkOutDate.value || undefined,
      guests: guestCount.value,
    },
  });
};
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text)">
    <div v-if="propertyStore.loading" class="mx-auto max-w-7xl px-4 py-32 text-center text-(--color-muted) sm:px-6 lg:px-8">
      Loading property details...
    </div>

    <div v-else-if="propertyStore.error" class="mx-auto max-w-7xl px-4 py-32 text-center text-rose-600 sm:px-6 lg:px-8">
      {{ propertyStore.error }}
    </div>

    <div v-else-if="property">
      <PropertyGallery
        :property="property"
        :selected-room="selectedRoom"
        :property-rating="property.rating"
        :review-count="property.reviews"
        @save="handleSave"
        @share="handleShare"
      />

      <main class="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
              <h2 class="mb-3 text-md font-bold text-(--color-text)">{{ t("propertyDetail.aboutProperty") }}</h2>
              <p class="text-sm leading-relaxed text-(--color-muted)">
                {{ property.description || t("propertyDetail.description") }}
              </p>
            </div>

            <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
              <h2 class="mb-4 text-md font-bold text-(--color-text)">{{ t("propertyDetail.roomTypes") }}</h2>
              <div class="space-y-3">
                <button
                  v-for="room in currentRooms"
                  :key="room.name"
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:bg-(--color-surface-soft)"
                  :class="selectedRoom.name === room.name ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'"
                  @click="selectRoom(room)"
                >
                  <div>
                    <p class="text-sm font-bold">{{ room.name }}</p>
                    <p class="text-[10px] text-(--color-muted)">{{ room.spec }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-(--color-primary)">${{ room.price }}</p>
                    <p class="text-[10px] text-(--color-muted)">/{{ t("propertyDetail.night") }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="h-fit lg:sticky lg:top-6">
            <div class="rounded-[24px] border border-(--color-border) bg-(--color-surface) p-4 shadow-[0_18px_40px_rgba(6,41,105,0.12)]">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-end gap-1.5">
                    <span class="text-[2rem] font-black leading-none text-(--color-primary)">${{ selectedRoom.price }}</span>
                    <span class="pb-0.5 text-sm text-(--color-muted)">/{{ t("propertyDetail.night") }}</span>
                  </div>
                  <p class="mt-1 text-xs font-semibold text-(--color-muted)">{{ selectedRoom.name }}</p>
                </div>
                <div class="flex items-center gap-1 text-amber-500">
                  <StarIcon class="h-4 w-4 fill-current" />
                  <span class="text-sm font-bold">{{ property.rating }}</span>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2.5">
                <label class="rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5">
                  <span class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)">
                    <CalendarDaysIcon class="h-3.5 w-3.5 text-(--color-primary)" />
                    {{ t("propertyDetail.checkIn") }}
                  </span>
                  <input v-model="checkInDate" type="date" class="mt-2 w-full bg-transparent text-sm font-semibold outline-none" />
                </label>
                <label class="rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5">
                  <span class="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)">
                    <CalendarDaysIcon class="h-3.5 w-3.5 text-(--color-primary)" />
                    {{ t("propertyDetail.checkOut") }}
                  </span>
                  <input v-model="checkOutDate" type="date" class="mt-2 w-full bg-transparent text-sm font-semibold outline-none" />
                </label>
              </div>

              <div class="mt-3">
                <label class="mb-1.5 block px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-muted)">
                  {{ t("home.search.guests") }}
                </label>
                <div class="flex items-center gap-2.5 rounded-[18px] border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5">
                  <UserGroupIcon class="h-4 w-4 shrink-0 text-(--color-primary)" />
                  <select v-model.number="guestCount" class="w-full bg-transparent text-sm font-semibold outline-none">
                    <option v-for="count in availableGuestOptions" :key="count" :value="count">
                      {{ count }} {{ t("home.search.guests") }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mt-4 rounded-[20px] border border-(--color-border) bg-(--color-surface-soft) p-3.5">
                <div class="space-y-2 text-sm text-(--color-muted)">
                  <div class="flex items-center justify-between">
                    <span>${{ selectedRoom.price }} x {{ stayNights }} {{ t("propertyDetail.night") }}</span>
                    <span class="font-semibold text-(--color-text)">${{ roomSubtotal }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>{{ t("propertyDetail.serviceFee") }}</span>
                    <span class="font-semibold text-(--color-text)">${{ serviceFee }}</span>
                  </div>
                  <div class="flex items-center justify-between border-t border-(--color-border) pt-2.5 text-[15px] font-bold text-(--color-text)">
                    <span>{{ t("propertyDetail.total") }}</span>
                    <span class="text-(--color-primary)">${{ totalPrice }}</span>
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
      </main>
    </div>
  </div>
</template>
