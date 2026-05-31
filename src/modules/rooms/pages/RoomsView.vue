<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  UsersIcon,
  TableCellsIcon,
  Squares2X2Icon,
  PhotoIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const room = ref(null);
const loading = ref(true);

const fetchRoom = async () => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    room.value = data.rooms.find((r) => r.id === "room-101") || null;
  } catch (err) {
    console.error("Failed to load room:", err);
    room.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoom);
</script>

<template>
  <div
    class="min-h-screen bg-[#f8fafc] text-[#0f2942] antialiased pb-24 font-sans selection:bg-[#1062b3]/10 selection:text-[#1062b3]"
  >
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <p class="text-xs text-slate-400 font-medium">
        {{ t("common.loading") }}...
      </p>
    </div>

    <!-- Room Not Found -->
    <div
      v-else-if="!room"
      class="flex items-center justify-center min-h-screen"
    >
      <p class="text-xs text-slate-400 font-medium">Room not found.</p>
    </div>

    <!-- ✅ ALL content inside v-else — including header -->
    <template v-else>
      <!-- Breadcrumb Header -->
      <header
        class="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-40 transition-all"
      >
        <div
          class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs font-semibold"
        >
          <div class="flex items-center gap-2.5 text-slate-400">
            <a href="#" class="hover:text-[#1062b3] transition duration-300">{{
              t("roomDetail.breadcrumb.home")
            }}</a>
            <span class="text-slate-300 text-[10px] font-light">/</span>
            <a href="#" class="hover:text-[#1062b3] transition duration-300">{{
              t("roomDetail.breadcrumb.properties")
            }}</a>
            <span class="text-slate-300 text-[10px] font-light">/</span>
            <a href="#" class="hover:text-[#1062b3] transition duration-300">{{
              t("roomDetail.breadcrumb.rooms")
            }}</a>
            <span class="text-slate-300 text-[10px] font-light">/</span>
            <span class="text-[#0f2942] font-bold tracking-tight">{{
              room.type
            }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100/80 shadow-sm shadow-emerald-700/5"
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
      <div class="max-w-7xl mx-auto px-6 mt-8">
        <!-- Photo Mosaic Grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-12 rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-900/10 relative group"
        >
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
              class="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg"
            >
              <p
                class="text-[10px] font-black uppercase tracking-widest text-[#1062b3]"
              >
                {{ t("roomDetail.featuredSpace") }}
              </p>
              <p class="text-xs font-bold text-[#0f2942] mt-0.5">
                {{ t("roomDetail.featuredSpaceLabel") }}
              </p>
            </div>
          </div>
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
            <div class="space-y-3">
              <div
                class="inline-flex items-center gap-1.5 bg-[#1062b3]/5 border border-[#1062b3]/20 text-[#1062b3] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                <span class="w-1 h-1 bg-[#1062b3] rounded-full"></span>
                {{ t("roomDetail.signatureRoom") }}
              </div>
              <h1
                class="text-3xl md:text-5xl font-black tracking-tight text-[#0f2942] leading-[1.15]"
              >
                {{ room.type }}
              </h1>
              <div
                class="flex items-center gap-3 text-xs text-slate-400 font-semibold pt-1"
              >
                <span class="flex items-center gap-1 text-[#0f2942]">
                  <span class="text-amber-400 font-bold text-sm">★</span> 4.9
                </span>
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{{ room.propertyName }}</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span class="text-[#1062b3] underline cursor-pointer">{{
                  t("roomDetail.showMap")
                }}</span>
              </div>
            </div>

            <!-- Spec Cards -->
            <div class="grid grid-cols-3 gap-4">
              <div
                class="bg-white border border-slate-200/60 rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-slate-100/40 hover:border-slate-300/80 transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-4"
                >
                  <UsersIcon class="w-4 h-4 text-[#1062b3]" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-slate-400 tracking-wider"
                  >
                    {{ t("roomDetail.maxAllowed") }}
                  </p>
                  <p class="text-sm font-black text-[#0f2942] mt-0.5">
                    {{ room.guests }} {{ t("roomDetail.guests") }}
                  </p>
                </div>
              </div>
              <div
                class="bg-white border border-slate-200/60 rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-slate-100/40 hover:border-slate-300/80 transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-4"
                >
                  <TableCellsIcon class="w-4 h-4 text-[#1062b3]" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-slate-400 tracking-wider"
                  >
                    {{ t("roomDetail.beddingConfig") }}
                  </p>
                  <p class="text-sm font-black text-[#0f2942] mt-0.5">
                    {{ room.bedType }}
                  </p>
                </div>
              </div>
              <div
                class="bg-white border border-slate-200/60 rounded-[24px] p-5 flex flex-col justify-between shadow-xl shadow-slate-100/40 hover:border-slate-300/80 transition-all duration-300"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-4"
                >
                  <Squares2X2Icon class="w-4 h-4 text-[#1062b3]" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black uppercase text-slate-400 tracking-wider"
                  >
                    {{ t("roomDetail.floorDimension") }}
                  </p>
                  <p class="text-sm font-black text-[#0f2942] mt-0.5">
                    {{ room.size }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-3.5">
              <h2
                class="text-xs font-black text-[#0f2942] uppercase tracking-widest border-l-2 border-[#1062b3] pl-3"
              >
                {{ t("roomDetail.architectureStory") }}
              </h2>
              <p
                class="text-xs text-slate-500 font-medium leading-[1.75] tracking-wide text-justify"
              >
                {{ room.description }}
              </p>
            </div>

            <!-- Amenities -->
            <div class="space-y-4">
              <h2
                class="text-xs font-black text-[#0f2942] uppercase tracking-widest border-l-2 border-[#1062b3] pl-3"
              >
                {{ t("roomDetail.includedLuxuries") }}
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="amenity in room.amenities"
                  :key="amenity"
                  class="flex items-center gap-3.5 p-4 bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300"
                >
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-100/60"
                  >
                    ✓
                  </div>
                  <span
                    class="text-xs font-bold text-slate-600 tracking-wide"
                    >{{ amenity }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Booking Panel -->
          <div class="lg:col-span-5 sticky top-24">
            <div
              class="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/60 p-6 md:p-8 space-y-6 relative overflow-hidden"
            >
              <div
                class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1062b3] to-blue-500"
              ></div>
              <div
                class="flex items-baseline justify-between border-b border-slate-100 pb-5"
              >
                <div>
                  <span
                    class="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-0.5"
                    >{{ t("roomDetail.ratesFrom") }}</span
                  >
                  <span
                    class="text-4xl font-black text-[#1062b3] tracking-tight"
                    >${{ room.basePrice }}</span
                  >
                  <span class="text-slate-400 text-xs font-bold">
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
              <form @submit.prevent class="space-y-4">
                <div
                  class="grid grid-cols-2 gap-3 bg-slate-50/50 border border-slate-200/60 p-3 rounded-2xl"
                >
                  <div class="space-y-1">
                    <label
                      class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                      >{{ t("roomDetail.arrivalDate") }}</label
                    >
                    <input
                      type="date"
                      class="w-full bg-transparent text-xs text-slate-700 outline-none font-bold cursor-pointer"
                    />
                  </div>
                  <div class="space-y-1 border-l border-slate-200/80 pl-3">
                    <label
                      class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                      >{{ t("roomDetail.departureDate") }}</label
                    >
                    <input
                      type="date"
                      class="w-full bg-transparent text-xs text-slate-700 outline-none font-bold cursor-pointer"
                    />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label
                    class="block text-[9px] font-black text-slate-400 uppercase tracking-widest"
                    >{{ t("roomDetail.accompaniedGuests") }}</label
                  >
                  <div
                    class="relative bg-white border border-slate-200 focus-within:border-[#1062b3] rounded-xl px-4 py-3 shadow-sm transition"
                  >
                    <select
                      class="w-full text-xs text-slate-700 bg-transparent outline-none appearance-none font-bold cursor-pointer"
                    >
                      <option>{{ t("roomDetail.adult1") }}</option>
                      <option>{{ t("roomDetail.adult2") }}</option>
                      <option>{{ t("roomDetail.adult3") }}</option>
                      <option>{{ t("roomDetail.adult4") }}</option>
                    </select>
                    <span
                      class="absolute right-4 top-4 text-slate-400 pointer-events-none text-[8px]"
                      >▼</span
                    >
                  </div>
                </div>
                <div
                  class="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs font-semibold text-slate-500 border border-slate-100"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-medium"
                      >{{ t("roomDetail.baseStayRate") }} (${{
                        room.basePrice
                      }}
                      × 1 {{ t("roomDetail.breadcrumb.rooms") }})</span
                    >
                    <span class="font-black text-[#0f2942]"
                      >${{ room.basePrice.toFixed(2) }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-200/50 pb-2.5"
                  >
                    <span>{{ t("roomDetail.resortSurcharges") }}</span>
                    <span
                      class="text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded"
                      >{{ t("roomDetail.included") }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center pt-2 text-slate-700 font-black"
                  >
                    <span
                      class="text-xs text-[#0f2942] uppercase tracking-wider"
                      >{{ t("roomDetail.aggregateTotal") }}</span
                    >
                    <span
                      class="text-xl text-[#1062b3] font-black tracking-tight"
                      >${{ room.basePrice.toFixed(2) }}</span
                    >
                  </div>
                </div>
                <button
                  type="submit"
                  class="w-full mt-2 bg-gradient-to-r from-[#0b427b] to-[#1062b3] hover:from-[#1062b3] hover:to-blue-500 text-white font-black text-xs py-4 rounded-xl shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-600/20 transition-all duration-300 tracking-widest uppercase cursor-pointer"
                >
                  {{ t("roomDetail.confirmReservation") }}
                </button>
              </form>
              <div
                class="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold"
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
