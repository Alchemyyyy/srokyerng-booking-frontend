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

const allImages = computed(() => {
  if (props.property?.images?.length) {
    return props.property.images;
  }
  if (props.property?.image) {
    return [props.property.image];
  }
  return [];
});

const openModal = (index = 0) => {
  if (!allImages.value.length) return;
  activeImageIndex.value = index;
  showModal.value = true;
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  showModal.value = false;
  document.body.style.overflow = "";
};

const nextImage = () => {
  if (!allImages.value.length) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % allImages.value.length;
};

const prevImage = () => {
  if (!allImages.value.length) return;
  activeImageIndex.value =
    (activeImageIndex.value - 1 + allImages.value.length) % allImages.value.length;
};

const selectThumbnail = (index) => {
  activeImageIndex.value = index;
};

const handleKeydown = (e) => {
  if (!showModal.value) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
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
  <section class="mx-auto max-w-7xl px-4 pt-[112px] sm:px-6 md:pt-[124px] lg:px-8 lg:pt-[132px]">
    <!-- Breadcrumb -->
    <div class="flex flex-wrap items-center gap-2 text-sm font-semibold">
      <RouterLink
        :to="{ name: 'public.home' }"
        class="transition hover:opacity-80"
        style="color: var(--color-primary);"
      >
        {{ t("propertyDetail.home") }}
      </RouterLink>
      <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
      <RouterLink
        :to="{ name: 'public.properties' }"
        class="transition hover:opacity-80"
        style="color: var(--color-primary);"
      >
        {{ t("propertyDetail.search") }}
      </RouterLink>
      <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
      <span class="text-(--color-text)">{{ property.name }}</span>
    </div>

    <!-- Spectacular Bento Hero Grid -->
    <div class="mt-6 relative">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,0.85fr)_minmax(0,0.85fr)] xl:grid-rows-[220px_220px]">
        <!-- Main Image -->
        <div
          class="group relative overflow-hidden border cursor-pointer bg-(--color-surface-soft) md:col-span-2 xl:col-span-1 xl:row-span-2"
          style="border-color: var(--color-border); border-radius: var(--radius-panel);"
          @click="openModal(0)"
        >
          <img
            :src="allImages[0] || property.image"
            class="h-[260px] w-full object-cover transition-all duration-700 group-hover:scale-[1.03] sm:h-[320px] md:h-[400px] xl:h-full"
            alt="Main view"
          />
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div class="absolute bottom-6 left-6 pointer-events-none text-white opacity-90">
            <span class="text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              Featured View
            </span>
          </div>
        </div>

        <!-- Side Image 1 -->
        <div
          class="group relative overflow-hidden border cursor-pointer bg-(--color-surface-soft)"
          style="border-color: var(--color-border); border-radius: var(--radius-panel);"
          @click="openModal(1)"
        >
          <img
            :src="allImages[1] || property.image"
            class="h-[180px] w-full object-cover transition-all duration-700 group-hover:scale-[1.03] sm:h-[220px] md:h-[240px] xl:h-full"
            alt="Interior view"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Side Image 2 -->
        <div
          class="group relative overflow-hidden border cursor-pointer bg-(--color-surface-soft)"
          style="border-color: var(--color-border); border-radius: var(--radius-panel);"
          @click="openModal(2)"
        >
          <img
            :src="allImages[2] || property.image"
            class="h-[180px] w-full object-cover transition-all duration-700 group-hover:scale-[1.03] sm:h-[220px] md:h-[240px] xl:h-full"
            alt="Property surroundings"
          />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-300"></div>
        </div>

        <!-- Guest Loved Card -->
        <div
          class="border bg-(--color-surface-soft) p-6 md:col-span-2 xl:col-span-1 flex flex-col justify-between"
          style="border-color: var(--color-accent); border-radius: var(--radius-panel); box-shadow: var(--shadow-card);"
        >
          <div>
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-extrabold uppercase tracking-[0.2em]" style="color: var(--color-accent);">
                Guest-Loved Stay
              </p>
              <span class="flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full" style="background-color: var(--color-accent-soft); color: var(--color-accent-strong);">
                <StarIcon class="h-3.5 w-3.5 fill-current" />
                Top 5%
              </span>
            </div>
            <p class="mt-4 text-lg font-black leading-snug text-(--color-text)">
              Calm pool views, stylish rooms, and a central base for city nights.
            </p>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full bg-(--color-surface) px-3.5 py-1.5 text-xs font-bold text-(--color-muted) border border-(--color-border)">
              {{ selectedRoom.name }}
            </span>
            <span class="rounded-full px-3.5 py-1.5 text-xs font-bold" style="background-color: var(--color-primary-soft); color: var(--color-primary);">
              Up to {{ selectedRoom.capacity }} guests
            </span>
          </div>
        </div>
      </div>

      <!-- Glassmorphic Floating "View all photos" Button -->
      <div class="absolute bottom-6 right-6 md:right-8 xl:right-[calc(50%+1rem)] z-10">
        <button
          type="button"
          class="flex items-center gap-2.5 rounded-full bg-black/60 backdrop-blur-md px-6 py-3 text-sm font-bold text-white border border-white/20 shadow-xl transition-all duration-200 hover:bg-black/80 hover:scale-105 active:scale-95"
          @click="openModal(0)"
        >
          <PhotoIcon class="h-5 w-5" />
          <span>View all photos ({{ allImages.length }})</span>
        </button>
      </div>
    </div>

    <!-- Property Info & Actions Header -->
    <div class="mt-8 flex flex-col gap-6 border-b pb-8 pt-2 lg:flex-row lg:items-end lg:justify-between" style="border-color: var(--color-border);">
      <div>
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="rounded-full px-3.5 py-1 text-xs font-extrabold text-white shadow-sm" style="background-color: var(--color-primary);">
            {{ property.category || 'Hotel' }}
          </span>
          <span v-if="property.badge" class="rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm">
            {{ property.badge }}
          </span>
          <span class="rounded-full px-3.5 py-1 text-xs font-bold" style="background-color: var(--color-accent-soft); color: var(--color-accent-strong);">
            Verified Quality
          </span>
        </div>

        <h1 class="mt-4 text-3xl font-black tracking-tight text-(--color-text) sm:text-4xl md:text-5xl">
          {{ property.name }}
        </h1>

        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-(--color-muted)">
          <span class="inline-flex items-center gap-2">
            <MapPinIcon class="h-4 w-4" style="color: var(--color-primary);" />
            {{ property.location }}
          </span>
          <span class="inline-flex items-center gap-1.5 font-bold text-amber-500">
            <StarIcon class="h-4 w-4 fill-current" />
            {{ propertyRating }}
          </span>
          <span class="font-bold" style="color: var(--color-primary);">
            ({{ reviewCount }} {{ t("propertyDetail.reviews") }})
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-4">
        <button
          class="flex h-12 w-12 items-center justify-center rounded-2xl border bg-(--color-surface) transition-all duration-200 hover:scale-105 active:scale-95"
          :class="isSaved ? 'text-rose-500 border-rose-500 bg-rose-50' : 'text-(--color-muted) border-(--color-border)'"
          style="box-shadow: var(--shadow-card);"
          type="button"
          @click="emit('save')"
          title="Save to Wishlist"
        >
          <HeartIconSolid v-if="isSaved" class="h-5 w-5" />
          <HeartIcon v-else class="h-5 w-5" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition-all duration-200 hover:scale-105 active:scale-95 hover:text-(--color-primary)"
          style="box-shadow: var(--shadow-card);"
          type="button"
          @click="emit('share')"
          title="Share"
        >
          <ShareIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Interactive Lightbox Modal Overlay -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl transition-all duration-300"
    >
      <!-- Top Bar -->
      <div class="flex items-center justify-between p-6 text-white z-10">
        <span class="text-sm font-bold tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          {{ activeImageIndex + 1 }} / {{ allImages.length }}
        </span>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-105 active:scale-95"
          @click="closeModal"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Main Image View -->
      <div class="relative flex flex-1 items-center justify-center px-4 overflow-hidden">
        <button
          v-if="allImages.length > 1"
          type="button"
          class="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-110 active:scale-90 hidden sm:flex"
          @click="prevImage"
        >
          <ChevronLeftIcon class="h-7 w-7" />
        </button>

        <div class="h-full w-full max-h-[75vh] max-w-5xl flex items-center justify-center">
          <img
            :src="allImages[activeImageIndex]"
            class="max-h-full max-w-full object-contain rounded-2xl shadow-2xl select-none animate-fadeIn"
            alt="Gallery preview"
          />
        </div>

        <button
          v-if="allImages.length > 1"
          type="button"
          class="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 transition hover:bg-white/20 hover:scale-110 active:scale-90 hidden sm:flex"
          @click="nextImage"
        >
          <ChevronRightIcon class="h-7 w-7" />
        </button>
      </div>

      <!-- Thumbnail Strip -->
      <div class="flex items-center justify-center gap-3 p-6 overflow-x-auto bg-black/40 border-t border-white/10 z-10">
        <button
          v-for="(img, index) in allImages"
          :key="index"
          type="button"
          class="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200"
          :class="index === activeImageIndex ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-80'"
          @click="selectThumbnail(index)"
        >
          <img :src="img" class="h-full w-full object-cover" alt="Thumbnail" />
        </button>
      </div>
    </div>
  </section>
</template>
