<script setup>
import { computed } from "vue";
import placeholer from "@/assets/images/properties/placeholder.png";
import { HeartIcon as HeartSolidIcon, StarIcon } from "@heroicons/vue/24/solid";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

const emit = defineEmits(["remove", "click"]);

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const displayImage = computed(() => {
  const img = props.item.cover_image;
  if (!img) return placeholer;
  return resolveAssetUrl(img);
});

const location = computed(() => {
  const city = props.item.city;
  const province = props.item.province;
  if (city && province && city !== province) return `${city}, ${province}`;
  return city || province || "Cambodia";
});
</script>

<template>
  <div
    class="group cursor-pointer flex flex-col gap-3"
    @click="emit('click', item.property_id)"
  >
    <!-- Card Image Container -->
    <div class="relative aspect-[20/19] w-full rounded-2xl overflow-hidden bg-(--color-surface-soft) shadow-sm group-hover:shadow-md transition-all duration-300">
      <img
        :src="displayImage"
        :alt="item.property_name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="$event.target.src = placeholer"
      />
      
      <!-- Airbnb Solid Pink Heart Button -->
      <button
        type="button"
        @click.stop="emit('remove', item.property_id)"
        class="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-(--color-surface) border border-(--color-border) hover:opacity-90 text-(--color-wishlist) rounded-full shadow-md transition-all duration-200 active:scale-90 hover:scale-105 z-10"
        title="Remove from wishlist"
      >
        <HeartSolidIcon class="w-5 h-5 text-(--color-wishlist)" />
      </button>
    </div>

    <!-- Airbnb Clean Bottom Text Section -->
    <div class="flex flex-col gap-0.5 px-0.5">
      <div class="flex justify-between items-start gap-2">
        <h3 class="text-[15px] font-bold text-(--color-text) tracking-tight truncate flex-1">
          {{ location }}
        </h3>
        <div class="flex items-center gap-1 shrink-0 mt-0.5">
          <StarIcon class="w-3.5 h-3.5 text-yellow-400" />
          <span class="text-xs font-bold text-(--color-text)">
            {{ item.average_rating ? Number(item.average_rating).toFixed(1) : "New" }}
          </span>
        </div>
      </div>

      <p class="text-sm text-(--color-muted) truncate">
        {{ item.property_name }}
      </p>

      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-[15px] font-bold text-(--color-text)">
          ${{ item.price_per_night ?? 0 }}
        </span>
        <span class="text-sm font-normal text-(--color-muted)">night</span>
      </div>
    </div>
  </div>
</template>
