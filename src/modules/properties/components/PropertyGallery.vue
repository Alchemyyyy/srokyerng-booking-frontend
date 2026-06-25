<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PhotoIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/vue/24/solid";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  isSaved: {
    type: Boolean,
    default: false,
  },
  property: {
    type: Object,
    required: true,
  },
  selectedRoom: {
    type: Object,
    required: true,
  },
  propertyRating: {
    type: Number,
    required: true,
  },
  reviewCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["save", "share"]);

// ── Lightbox Modal State ──
const showModal = ref(false);
const activeImageIndex = ref(0);
const isZoomed = ref(false);

const allImages = computed(() => {
  if (props.property?.images?.length) {
    return props.property.images;
  }
  if (props.property?.image) {
    return [props.property.image];
  }
  return [];
});

const defaultCaptions = [
  "Main Spectacular View",
  "Living Room & Modern Lounge Area",
  "Spacious Master Bedroom",
  "Fully Equipped Luxury Kitchen & Dining",
  "Modern Clean Bathroom & Amenities",
  "Outdoor View & Patio Space",
  "Surrounding Scenery & Garden"
];

const currentCaption = computed(() => {
  return defaultCaptions[activeImageIndex.value % defaultCaptions.length] || "Spectacular Property View";
});

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value;
};

const openModal = (index = 0) => {
  if (!allImages.value.length) return;
  activeImageIndex.value = index;
  isZoomed.value = false;
  showModal.value = true;
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  showModal.value = false;
  isZoomed.value = false;
  document.body.style.overflow = "";
};

const nextImage = () => {
  if (!allImages.value.length) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % allImages.value.length;
  isZoomed.value = false;
};

const prevImage = () => {
  if (!allImages.value.length) return;
  activeImageIndex.value =
    (activeImageIndex.value - 1 + allImages.value.length) % allImages.value.length;
  isZoomed.value = false;
};

const selectThumbnail = (index) => {
  activeImageIndex.value = index;
  isZoomed.value = false;
};

const handleKeydown = (e) => {
  if (!showModal.value) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "z" || e.key === "Z") toggleZoom();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 pt-[96px] sm:px-6 md:pt-[104px] lg:px-8 lg:pt-[112px]">
    <!-- Airbnb Modern Top Title & Subtitle Row -->
    <div class="space-y-3">
      <h1 class="text-3xl sm:text-4xl font-black text-(--color-text) tracking-tight">
        {{ property.name || property.property_name }}
      </h1>
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--color-border)/30 pb-4 md:border-b-0 md:pb-0">
        <!-- Airbnb Style Rating, Reviews & Location Subtitle -->
        <div class="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-bold text-(--color-text)">
          <div class="flex items-center gap-1.5">
            <StarIcon class="h-4 w-4 fill-current text-amber-500" />
            <span>{{ reviewCount > 0 ? propertyRating : t("propertyDetail.new", "New") }}</span>
          </div>
          <span class="text-(--color-muted) select-none">·</span>
          <a href="#reviews" class="text-sky-500 hover:underline transition-colors">
            {{ reviewCount }} {{ t("propertyDetail.reviews", "Reviews") }}
          </a>
          <span class="text-(--color-muted) select-none">·</span>
          <div class="flex items-center gap-1.5 text-(--color-muted)">
            <MapPinIcon class="h-4 w-4 text-(--color-primary)" />
            <span class="underline decoration-(--color-border) hover:decoration-(--color-primary) transition-colors">{{ property.city?.city_name || property.province?.province_name || "Phnom Penh" }}, {{ property.country?.country_name || "Cambodia" }}</span>
          </div>
        </div>

        <!-- Right Action Buttons (Classic Airbnb Clean Underline Style) -->
        <div class="flex items-center gap-2 text-xs sm:text-sm font-bold shrink-0">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent hover:bg-(--color-surface-soft) active:scale-95 transition-all duration-200 cursor-pointer text-(--color-text) group"
            type="button"
            @click="emit('share')"
          >
            <ShareIcon class="h-4 w-4 stroke-[2.5] text-(--color-text) group-hover:scale-105 transition-transform" />
            <span class="underline underline-offset-4 decoration-(--color-text)/40 group-hover:decoration-(--color-text) transition-colors">{{ t("propertyDetail.share", "Share") }}</span>
          </button>
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent hover:bg-(--color-surface-soft) active:scale-95 transition-all duration-200 cursor-pointer group"
            :class="isSaved ? 'text-rose-600' : 'text-(--color-text)'"
            type="button"
            @click="emit('save')"
          >
            <HeartIconSolid v-if="isSaved" class="h-4 w-4 text-rose-600 animate-scaleUp" />
            <HeartIcon v-else class="h-4 w-4 stroke-[2.5] text-(--color-text) group-hover:scale-105 transition-transform" />
            <span class="underline underline-offset-4 transition-colors" :class="isSaved ? 'decoration-rose-600' : 'decoration-(--color-text)/40 group-hover:decoration-(--color-text)'">{{ isSaved ? t("propertyDetail.saved", "Saved") : t("propertyDetail.save", "Save") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Spectacular Airbnb 5-Image Bento Hero Grid -->
    <div class="mt-6 relative">
      <div class="grid gap-2 grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[350px] sm:h-[420px] md:h-[540px] rounded-3xl overflow-hidden shadow-lg border border-(--color-border)">
        <!-- Main Image (Left 50% / 2 cols, 2 rows) -->
        <div
          class="group relative overflow-hidden bg-(--color-surface-soft) md:col-span-2 md:row-span-2 cursor-pointer"
          @click="openModal(0)"
        >
          <img
            :src="allImages[0] || property.image"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            alt="Main view"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Side Image 1 -->
        <div
          class="group relative overflow-hidden bg-(--color-surface-soft) hidden md:block cursor-pointer"
          @click="openModal(1)"
        >
          <img
            :src="allImages[1] || allImages[0] || property.image"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            alt="View 2"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Side Image 2 -->
        <div
          class="group relative overflow-hidden bg-(--color-surface-soft) hidden md:block cursor-pointer"
          @click="openModal(2)"
        >
          <img
            :src="allImages[2] || allImages[0] || property.image"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            alt="View 3"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Side Image 3 -->
        <div
          class="group relative overflow-hidden bg-(--color-surface-soft) hidden md:block cursor-pointer"
          @click="openModal(3)"
        >
          <img
            :src="allImages[3] || allImages[1] || allImages[0] || property.image"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            alt="View 4"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Side Image 4 -->
        <div
          class="group relative overflow-hidden bg-(--color-surface-soft) hidden md:block cursor-pointer"
          @click="openModal(4)"
        >
          <img
            :src="allImages[4] || allImages[2] || allImages[0] || property.image"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            alt="View 5"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>
      </div>

      <!-- Classic Airbnb "Show all photos" Button -->
      <div class="absolute bottom-6 right-6 z-10">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a202c] px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white border border-gray-900 dark:border-white/20 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95 cursor-pointer"
          @click="openModal(0)"
        >
          <PhotoIcon class="h-4 w-4 text-gray-900 dark:text-white stroke-[2]" />
          <span>Show all photos</span>
        </button>
      </div>
    </div>

    <!-- Interactive Rich Lightbox Modal Overlay -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl transition-all duration-300"
    >
      <!-- Premium Glassmorphic Top Bar -->
      <div class="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 text-white z-20 shadow-lg">
        <div class="flex items-center gap-4">
          <span class="text-xs font-black tracking-widest bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white shadow-sm">
            {{ activeImageIndex + 1 }} / {{ allImages.length }}
          </span>
          <h3 class="text-base font-bold text-white tracking-tight hidden sm:block truncate max-w-md">
            {{ property.name || property.property_name }}
          </h3>
        </div>

        <!-- Toolbar Actions -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold transition hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            @click="toggleZoom"
            :title="isZoomed ? 'Zoom Out (Key: Z)' : 'Zoom In (Key: Z)'"
          >
            <MagnifyingGlassMinusIcon v-if="isZoomed" class="h-4 w-4" />
            <MagnifyingGlassPlusIcon v-else class="h-4 w-4" />
            <span class="hidden md:inline">{{ isZoomed ? 'Zoom Out' : 'Zoom In' }}</span>
          </button>
          <a
            :href="allImages[activeImageIndex]"
            target="_blank"
            download
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold transition hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            title="Download / Open Original"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
            <span class="hidden md:inline">Original</span>
          </a>
          <div class="h-6 w-px bg-white/20 mx-1"></div>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            @click="closeModal"
            title="Close (Key: Esc)"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Main Interactive Image View -->
      <div class="relative flex flex-1 items-center justify-center px-4 overflow-hidden select-none">
        <!-- Navigation Left -->
        <button
          v-if="allImages.length > 1"
          type="button"
          class="absolute left-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-110 active:scale-90 shadow-xl hidden sm:flex group cursor-pointer"
          @click="prevImage"
        >
          <ChevronLeftIcon class="h-7 w-7 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <!-- Image Container with Zoom support -->
        <div 
          class="h-full w-full max-h-[72vh] max-w-6xl flex flex-col items-center justify-center transition-all duration-300"
          @click="toggleZoom"
        >
          <img
            :src="allImages[activeImageIndex]"
            class="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-500 cursor-pointer"
            :class="isZoomed ? 'scale-[1.35] md:scale-[1.5] cursor-zoom-out' : 'scale-100 cursor-zoom-in'"
            alt="Gallery preview"
          />
          <!-- Rich Metadata Caption Tag -->
          <div class="absolute bottom-6 bg-black/60 backdrop-blur-md border border-white/15 px-6 py-2.5 rounded-full text-white text-sm font-semibold tracking-wide shadow-xl pointer-events-none transition-all duration-300" :class="isZoomed ? 'opacity-0' : 'opacity-100'">
            {{ currentCaption }}
          </div>
        </div>

        <!-- Navigation Right -->
        <button
          v-if="allImages.length > 1"
          type="button"
          class="absolute right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-110 active:scale-90 shadow-xl hidden sm:flex group cursor-pointer"
          @click="nextImage"
        >
          <ChevronRightIcon class="h-7 w-7 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <!-- Glassmorphic Thumbnail Strip -->
      <div class="flex items-center justify-center gap-3 py-4 px-6 overflow-x-auto bg-black/40 backdrop-blur-2xl border-t border-white/10 z-20 shadow-xl">
        <button
          v-for="(img, index) in allImages"
          :key="index"
          type="button"
          class="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 group focus:outline-none cursor-pointer"
          :class="index === activeImageIndex ? 'border-white scale-105 shadow-2xl ring-2 ring-white/30' : 'border-transparent opacity-50 hover:opacity-90 hover:scale-[1.02]'"
          @click="selectThumbnail(index)"
        >
          <img :src="img" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Thumbnail" />
          <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-200" v-if="index !== activeImageIndex"></div>
        </button>
      </div>
    </div>
  </section>
</template>
