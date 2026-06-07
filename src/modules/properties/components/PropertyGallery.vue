<script setup>
import {
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
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
</script>

<template>
  <section
    class="mx-auto max-w-7xl px-4 pt-[112px] sm:px-6 md:pt-[124px] lg:px-8 lg:pt-[132px]"
  >
    <!-- Breadcrumb -->
    <div class="flex flex-wrap items-center gap-2 text-sm">
      <RouterLink
        :to="{ name: 'public.home' }"
        class="text-(--color-primary) hover:opacity-80 transition"
      >
        {{ t("propertyDetail.home") }}
      </RouterLink>
      <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
      <RouterLink
        :to="{ name: 'public.properties' }"
        class="text-(--color-primary) hover:opacity-80 transition"
      >
        {{ t("propertyDetail.search") }}
      </RouterLink>
      <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
      <span class="text-(--color-text)">{{ property.name }}</span>
    </div>

    <!-- Image Grid -->
    <div class="mt-5">
      <div
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] xl:grid-rows-[212px_212px]"
      >
        <!-- Main Image -->
        <div
          class="group relative overflow-hidden rounded-[26px] border border-white/6 bg-(--color-surface-soft) md:col-span-2 xl:col-span-1 xl:row-span-2"
        >
          <img
            :src="property.images?.[0] || property.image"
            class="h-[240px] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:h-[300px] md:h-[360px] xl:h-full"
            alt="Main view"
          />
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/28 to-transparent"
          ></div>
        </div>

        <!-- Side Image 1 -->
        <div
          class="group relative overflow-hidden rounded-[26px] border border-white/6 bg-(--color-surface-soft)"
        >
          <img
            :src="property.images?.[1] || property.image"
            class="h-[180px] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:h-[220px] md:h-[240px] xl:h-full"
            alt="Interior"
          />
        </div>

        <!-- Side Image 2 -->
        <div
          class="group relative overflow-hidden rounded-[26px] border border-white/6 bg-(--color-surface-soft)"
        >
          <img
            :src="property.images?.[2] || property.image"
            class="h-[180px] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:h-[220px] md:h-[240px] xl:h-full"
            alt="Property surroundings"
          />
        </div>

        <!-- Guest Loved Card -->
        <div
          class="rounded-[26px] border border-(--color-border) bg-(--color-surface-soft) p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:col-span-2 xl:col-span-1"
        >
          <p
            class="text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-primary)"
          >
            Guest-Loved Stay
          </p>
          <p class="mt-3 text-lg font-bold leading-snug text-(--color-text)">
            Calm pool views, stylish rooms, and a central base for city nights.
          </p>
          <div class="mt-5 flex flex-wrap gap-2">
            <span
              class="rounded-full bg-(--color-surface) px-3 py-1.5 text-xs font-semibold text-(--color-muted)"
            >
              {{ selectedRoom.name }}
            </span>
            <span
              class="rounded-full bg-(--color-primary-soft) px-3 py-1.5 text-xs font-semibold text-(--color-primary)"
            >
              {{ selectedRoom.capacity }} guests
            </span>
          </div>
        </div>
      </div>

      <!-- Property Info -->
      <div
        class="mt-6 flex flex-col gap-5 border-b border-(--color-border)/50 pb-8 pt-2 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full bg-(--color-primary) px-3 py-1 text-[11px] font-bold text-white"
            >
              {{ property.category }}
            </span>
            <span
              class="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white"
            >
              {{ property.badge }}
            </span>
          </div>

          <h1
            class="mt-3 text-3xl font-black tracking-tight text-(--color-text) sm:text-[2.35rem]"
          >
            {{ property.name }}
          </h1>

          <div
            class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-(--color-muted)"
          >
            <span class="inline-flex items-center gap-1.5">
              <MapPinIcon class="h-4 w-4" />
              {{ property.location }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 font-semibold text-amber-500"
            >
              <StarIcon class="h-4 w-4 fill-current" />
              {{ propertyRating }}
            </span>
            <span class="font-semibold text-(--color-primary)">
              ({{ reviewCount }} {{ t("propertyDetail.reviews") }})
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            @click="emit('save')"
          >
            <HeartIcon class="h-5 w-5" />
          </button>
          <button
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            @click="emit('share')"
          >
            <ShareIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
