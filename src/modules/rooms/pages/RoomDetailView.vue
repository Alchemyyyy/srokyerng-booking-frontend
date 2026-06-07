<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  UsersIcon,
  TableCellsIcon,
  Squares2X2Icon,
  PhotoIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import http from "@/app/api/http";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const room = ref(null);
const loading = ref(true);
const checkInDate = ref("");
const checkOutDate = ref("");
const guestCount = ref(1);

const BASE_URL = "https://api-srokyerng.devspace.linkpc.net";

const getFullImageUrl = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};

const fetchRoom = async () => {
  try {
    const res = await http.get(`/rooms/${route.params.id}`);
    const r = res.data?.data || res.data;

    // fetch room images
    const imgRes = await http.get(`/rooms/${route.params.id}/images`);
    const images = imgRes.data?.data || [];
    const coverImg = images.find((i) => i.is_cover === 1) || images[0];

    room.value = {
      id: r.id,
      type: r.room_name,
      propertyName: r.property_name || "",
      guests: r.max_guests || 2,
      bedType: r.bed_type || "-",
      size: r.room_size || "-",
      description: r.description || "",
      basePrice: Number(r.price_per_night) || 0,
      image: getFullImageUrl(coverImg?.image_url),
      amenities: r.amenities || [],
      images: images.map((i) => getFullImageUrl(i.image_url)),
      propertyId: r.property_id,
    };
  } catch (err) {
    console.error("Failed to load room:", err);
    room.value = null;
  } finally {
    loading.value = false;
  }
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
            <a
              href="#"
              class="hover:text-(--color-primary) transition duration-300"
              >{{ t("roomDetail.breadcrumb.home") }}</a
            >
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <a
              href="#"
              class="hover:text-(--color-primary) transition duration-300"
              >{{ t("roomDetail.breadcrumb.properties") }}</a
            >
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <a
              href="#"
              class="hover:text-(--color-primary) transition duration-300"
              >{{ t("roomDetail.breadcrumb.rooms") }}</a
            >
            <span class="text-(--color-border) text-[10px] font-light">/</span>
            <span class="text-(--color-text) font-bold tracking-tight">{{
              room.type
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100/80 shadow-sm"
          >
            <span
              class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"
            ></span>
            <span class="w-2 h-2 bg-emerald-500 rounded-full absolute"></span>
            {{ t("roomDetail.liveAvailability") }}
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 mt-8 pt-16">
        <!-- Photo Mosaic Grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-12 rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/10 relative group"
        >
          <!-- Hero Image -->
          <div
            class="md:col-span-7 h-[380px] md:h-[520px] overflow-hidden relative"
          >
            <img
              :src="room.image"
              alt="Room Master View"
              class="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-1000 ease-out"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"
            ></div>
            <div
              class="absolute bottom-6 left-6 z-10 bg-(--color-surface)/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-(--color-border) shadow-lg"
            >
              <p
                class="text-[10px] font-black uppercase tracking-widest text-(--color-primary)"
              >
                {{ t("roomDetail.featuredSpace") }}
              </p>
              <p class="text-xs font-bold text-(--color-text) mt-0.5">
                {{ t("roomDetail.featuredSpaceLabel") }}
              </p>
            </div>
          </div>

          <!-- Right Image Grid -->
          <div
            class="hidden md:grid grid-cols-2 md:col-span-5 gap-3.5 h-[520px]"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="overflow-hidden h-[253px] bg-slate-800 relative group/item"
            >
              <img
                :src="room.image"
                class="w-full h-full object-cover opacity-95 group-hover/item:scale-105 transition-all duration-700"
              />
              <div
                class="absolute inset-0 bg-slate-950/10 group-hover/item:bg-transparent transition-all"
              ></div>
            </div>
            <!-- Explore Gallery -->
            <div
              class="overflow-hidden h-[253px] bg-slate-800 relative group/item"
            >
              <img
                :src="room.image"
                class="w-full h-full object-cover opacity-95 group-hover/item:scale-105 transition-all duration-700"
              />
              <div
                class="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px] flex flex-col items-center justify-center cursor-pointer transition duration-300 group-hover/item:bg-slate-950/60"
              >
                <PhotoIcon
                  class="w-6 h-6 text-white mb-1.5 transform group-hover/item:translate-y-[-2px] transition-transform"
                />
                <span
                  class="text-white text-[11px] font-black tracking-widest uppercase bg-white/10 px-3.5 py-2 rounded-xl border border-white/20"
                >
                  {{ t("roomDetail.exploreGallery") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Twin Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <!-- Left Column -->
          <div class="lg:col-span-7 space-y-12">
            <!-- Heading -->
            <div class="space-y-3">
              <div
                class="inline-flex items-center gap-1.5 bg-(--color-primary-soft) border border-(--color-primary)/20 text-(--color-primary) px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1 h-1 bg-(--color-primary) rounded-full"></span>
                {{ t("roomDetail.signatureRoom") }}
              </div>
              <h1
                class="text-3xl md:text-5xl font-black tracking-tight text-(--color-text) leading-[1.15]"
              >
                {{ room.type }}
              </h1>
              <div
                class="flex items-center gap-3 text-xs text-(--color-muted) font-semibold pt-1"
              >
                <span class="flex items-center gap-1 text-(--color-text)">
                  <span class="text-amber-400 font-bold text-sm">★</span> 4.9
                </span>
                <span class="w-1 h-1 bg-(--color-border) rounded-full"></span>
                <span>{{ room.propertyName }}</span>
                <span class="w-1 h-1 bg-(--color-border) rounded-full"></span>
                <span class="text-(--color-primary) underline cursor-pointer">{{
                  t("roomDetail.showMap")
                }}</span>
              </div>
            </div>

            <!-- Spec Cards -->
            <div class="grid grid-cols-3 gap-4">
              <!-- Capacity -->
              <div
                class="bg-(--color-surface) border border-(--color-border) rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-(--color-border)/40 hover:border-(--color-border) transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-(--color-surface-soft) flex items-center justify-center border border-(--color-border) mb-4"
                >
                  <UsersIcon class="w-4 h-4 text-(--color-primary)" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-(--color-muted) tracking-wider"
                  >
                    {{ t("roomDetail.maxAllowed") }}
                  </p>
                  <p class="text-sm font-black text-(--color-text) mt-0.5">
                    {{ room.guests }} {{ t("roomDetail.guests") }}
                  </p>
                </div>
              </div>
              <!-- Bed Type -->
              <div
                class="bg-(--color-surface) border border-(--color-border) rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-(--color-border)/40 hover:border-(--color-border) transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-(--color-surface-soft) flex items-center justify-center border border-(--color-border) mb-4"
                >
                  <TableCellsIcon class="w-4 h-4 text-(--color-primary)" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-(--color-muted) tracking-wider"
                  >
                    {{ t("roomDetail.beddingConfig") }}
                  </p>
                  <p class="text-sm font-black text-(--color-text) mt-0.5">
                    {{ room.bedType }}
                  </p>
                </div>
              </div>
              <!-- Floor Size -->
              <div
                class="bg-(--color-surface) border border-(--color-border) rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-(--color-border)/40 hover:border-(--color-border) transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-(--color-surface-soft) flex items-center justify-center border border-(--color-border) mb-4"
                >
                  <Squares2X2Icon class="w-4 h-4 text-(--color-primary)" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-(--color-muted) tracking-wider"
                  >
                    {{ t("roomDetail.floorDimension") }}
                  </p>
                  <p class="text-sm font-black text-(--color-text) mt-0.5">
                    {{ room.size }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-3.5">
              <h2
                class="text-xs font-black text-(--color-text) uppercase tracking-widest border-l-2 border-(--color-primary) pl-3"
              >
                {{ t("roomDetail.architectureStory") }}
              </h2>
              <p
                class="text-xs text-(--color-muted) font-medium leading-[1.75] tracking-wide text-justify"
              >
                {{ room.description }}
              </p>
            </div>

            <!-- Amenities -->
            <div class="space-y-4">
              <h2
                class="text-xs font-black text-(--color-text) uppercase tracking-widest border-l-2 border-(--color-primary) pl-3"
              >
                {{ t("roomDetail.includedLuxuries") }}
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="amenity in room.amenities"
                  :key="amenity"
                  class="flex items-center gap-3.5 p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm hover:border-(--color-primary)/30 hover:shadow-md transition-all duration-300"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-100/60"
                  >
                    ✓
                  </div>
                  <span
                    class="text-xs font-bold text-(--color-text) tracking-wide"
                    >{{ amenity }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Booking Panel -->
          <div class="lg:col-span-5 sticky top-24">
            <div
              class="bg-(--color-surface) rounded-[32px] border border-(--color-border) shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <!-- Top color bar -->
              <div
                class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-(--color-primary) to-blue-500"
              ></div>

              <!-- Price -->
              <div
                class="flex items-baseline justify-between border-b border-(--color-border) pb-5"
              >
                <div>
                  <span
                    class="text-[9px] uppercase font-black text-(--color-muted) tracking-widest block mb-0.5"
                  >
                    {{ t("roomDetail.ratesFrom") }}
                  </span>
                  <span
                    class="text-4xl font-black text-(--color-primary) tracking-tight"
                    >${{ room.basePrice }}</span
                  >
                  <span class="text-(--color-muted) text-xs font-bold">
                    {{ t("roomDetail.perNight") }}</span
                  >
                </div>
                <div class="text-right">
                  <span
                    class="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md block"
                  >
                    {{ t("roomDetail.bestRate") }}
                  </span>
                </div>
              </div>

              <!-- Form -->
              <!-- Form -->
              <form @submit.prevent class="space-y-4">
                <!-- Dates -->
                <div
                  class="grid grid-cols-2 gap-3 bg-(--color-surface-soft) border border-(--color-border) p-3 rounded-2xl"
                >
                  <div class="space-y-1">
                    <label
                      class="block text-[9px] font-black text-(--color-muted) uppercase tracking-widest"
                    >
                      {{ t("roomDetail.arrivalDate") }}
                    </label>
                    <!-- ✅ Add v-model here -->
                    <input
                      type="date"
                      v-model="checkInDate"
                      class="w-full bg-transparent text-xs text-(--color-text) outline-none font-bold cursor-pointer"
                    />
                  </div>
                  <div class="space-y-1 border-l border-(--color-border) pl-3">
                    <label
                      class="block text-[9px] font-black text-(--color-muted) uppercase tracking-widest"
                    >
                      {{ t("roomDetail.departureDate") }}
                    </label>
                    <!-- ✅ Add v-model here -->
                    <input
                      type="date"
                      v-model="checkOutDate"
                      class="w-full bg-transparent text-xs text-(--color-text) outline-none font-bold cursor-pointer"
                    />
                  </div>
                </div>

                <!-- Guests -->
                <div class="space-y-1.5">
                  <label
                    class="block text-[9px] font-black text-(--color-muted) uppercase tracking-widest"
                  >
                    {{ t("roomDetail.accompaniedGuests") }}
                  </label>
                  <div
                    class="relative bg-(--color-surface) border border-(--color-border) focus-within:border-(--color-primary) rounded-xl px-4 py-3 shadow-sm transition"
                  >
                    <!-- ✅ Add select with v-model here -->
                    <select
                      v-model.number="guestCount"
                      class="w-full text-xs text-(--color-text) bg-transparent outline-none appearance-none font-bold cursor-pointer"
                    >
                      <option v-for="n in room.guests || 2" :key="n" :value="n">
                        {{ n }} {{ n === 1 ? "Adult" : "Adults" }}
                      </option>
                    </select>
                    <span
                      class="absolute right-4 top-4 text-(--color-muted) pointer-events-none text-[8px]"
                      >▼</span
                    >
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div
                  class="bg-(--color-surface-soft) rounded-2xl p-4 space-y-2 text-xs font-semibold text-(--color-muted) border border-(--color-border)"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-medium"
                      >{{ t("roomDetail.baseStayRate") }} (${{
                        room.basePrice
                      }}
                      × 1 {{ t("roomDetail.breadcrumb.rooms") }})</span
                    >
                    <span class="font-black text-(--color-text)"
                      >${{ room.basePrice.toFixed(2) }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center text-[11px] text-(--color-muted) border-b border-(--color-border) pb-2.5"
                  >
                    <span>{{ t("roomDetail.resortSurcharges") }}</span>
                    <span
                      class="text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded"
                    >
                      {{ t("roomDetail.included") }}
                    </span>
                  </div>
                  <div
                    class="flex justify-between items-center pt-2 text-(--color-text) font-black"
                  >
                    <span
                      class="text-xs text-(--color-text) uppercase tracking-wider"
                      >{{ t("roomDetail.aggregateTotal") }}</span
                    >
                    <span
                      class="text-xl text-(--color-primary) font-black tracking-tight"
                      >${{ room.basePrice.toFixed(2) }}</span
                    >
                  </div>
                </div>

                <!-- ✅ Remove the duplicate date inputs below - delete these -->
                <!-- CTA Button -->
                <button
                  type="button"
                  @click="goToBooking"
                  class="w-full mt-2 bg-(--color-primary) hover:bg-(--color-primary-strong) text-white font-black text-xs py-4 rounded-xl shadow-xl transition-all duration-300 tracking-widest uppercase cursor-pointer"
                >
                  {{ t("roomDetail.confirmReservation") }}
                </button>
              </form>

              <!-- No Deposit -->
              <div
                class="flex items-center justify-center gap-1.5 text-[10px] text-(--color-muted) font-semibold"
              >
                <ShieldCheckIcon class="w-3.5 h-3.5 text-emerald-500" />
                <span>{{ t("roomDetail.noDeposit") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
