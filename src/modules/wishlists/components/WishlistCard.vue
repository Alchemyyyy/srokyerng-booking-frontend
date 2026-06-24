<script setup>
import { computed } from "vue";
import placeholer from "@/assets/images/properties/placeholder.png";
import { TrashIcon, MapPinIcon } from "@heroicons/vue/24/outline";
import { StarIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits(["remove", "click"]);

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

const displayImage = computed(() => {
  const img = props.item.cover_image;
  if (!img) return placeholer;
  return img.startsWith("http") ? img : `${BASE_URL}${img}`;
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
    class="bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow duration-200 cursor-pointer"
    @click="emit('click', item.property_id)"
  >
    <div class="relative aspect-[4/3] w-full bg-(--color-surface-soft) overflow-hidden">
      <img
        :src="displayImage"
        :alt="item.property_name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        @error="$event.target.src = placeholer"
      />
      
      <!-- Remove from Wishlist Button -->
      <button
        @click.stop="emit('remove', item.property_id)"
        class="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-(--color-danger) rounded-full shadow-sm hover:shadow-md transition-all duration-200 z-10"
        title="Remove from wishlist"
      >
        <TrashIcon class="w-4 h-4" />
      </button>
    </div>

    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start gap-2">
          <h3 class="text-[15px] font-bold text-(--color-text) tracking-tight line-clamp-1 flex-1">
            {{ item.property_name }}
          </h3>
          <div class="flex items-center gap-1 shrink-0 mt-0.5">
            <StarIcon class="w-3.5 h-3.5 text-yellow-400" />
            <span class="text-xs font-bold text-(--color-text)">
              {{ item.average_rating ? Number(item.average_rating).toFixed(1) : "New" }}
            </span>
          </div>
        </div>

        <p class="text-xs text-(--color-muted) font-medium mt-1 flex items-center gap-1">
          <MapPinIcon class="w-3.5 h-3.5" />
          <span class="truncate">{{ location }}</span>
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-(--color-border) flex items-center justify-between">
        <div>
          <span class="text-sm font-black text-(--color-primary)">
            ${{ item.price_per_night ?? 0 }}
          </span>
          <span class="text-[11px] font-medium text-(--color-muted)">/night</span>
        </div>
        
        <span class="text-xs font-semibold text-(--color-primary) underline underline-offset-2">
          View Details
        </span>
      </div>
    </div>
  </div>
</template>
