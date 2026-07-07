<script setup>
import {
  ArrowsPointingOutIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoomStore } from "../store/roomStore";
import { useRouter } from "vue-router";
import { formatPrice } from "@/shared/utils/currency";

const roomStore = useRoomStore();
const router = useRouter();
const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
  status: {
    type: Object,
    required: true,
  },
});

defineEmits(["edit", "delete"]);
const goToDetail = () => {
  router.push({ name: "owner.room-detail", params: { id: props.room.id } });
};

// Get cover image from store (with full URL)
const coverImage = computed(() => {
  return roomStore.getCoverImage(props.room.id);
});

// Fallback image
const displayImage = computed(() => {
  return (
    coverImage.value ||
    props.room.image ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f0f2f5'/%3E%3Crect x='300' y='160' width='600' height='440' rx='32' ry='32' fill='none' stroke='%23c8cdd6' stroke-width='18'/%3E%3Ccircle cx='460' cy='310' r='60' fill='%23c8cdd6'/%3E%3Cpolygon points='300,600 560,340 720,500 840,380 900,600' fill='%23c8cdd6'/%3E%3C/svg%3E"
  );
});

// Track whether the image fetch for this room is still in flight,
// so the spinner only shows during loading — not forever when there
// simply are no images to find.
const imagesLoading = ref(true);

onMounted(async () => {
  if (props.room?.id) {
    try {
      await roomStore.fetchRoomImages(props.room.id);
    } finally {
      imagesLoading.value = false;
    }
  } else {
    imagesLoading.value = false;
  }
});
</script>
<template>
  <div
    @click="goToDetail"
    class="rounded-xl border border-(--color-border) bg-(--color-surface) flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
  >
    <div
      class="w-full sm:w-[200px] h-48 sm:h-auto overflow-hidden relative flex-shrink-0 bg-(--color-surface-soft)"
    >
      <!-- Main Image -->
      <img
        :src="displayImage"
        :alt="room.type"
        class="w-full h-full object-cover transition-all duration-300"
      />

      <!-- Image count badge -->
      <span
        v-if="roomStore.roomImages[room.id]?.length > 1"
        class="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-lg font-medium"
      >
        +{{ roomStore.roomImages[room.id].length - 1 }}
      </span>

      <!-- Room ID Badge -->
      <span
        style="
          background-color: var(--color-primary-strong);
          color: var(--color-text-inverse);
        "
        class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase opacity-90"
      >
        {{ t("components.roomCard.idBadge", { id: room.id }) }}
      </span>

      <!-- Loading indicator -->
      <div
        v-if="imagesLoading"
        class="absolute inset-0 flex items-center justify-center bg-black/30"
      >
        <div
          class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <div class="p-5 space-y-3.5">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold tracking-tight text-(--color-text)">
              {{ room.type }}
            </h3>
            <span
              v-if="room.roomTypeName"
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-(--color-primary-soft) text-(--color-primary)"
            >
              {{ room.roomTypeName }}
            </span>
          </div>
          <p class="text-xs text-(--color-muted) mt-0.5">
            {{ room.propertyName }}
          </p>
        </div>

        <!-- Single info row: guests, size, floor -->
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-(--color-muted)"
        >
          <span class="flex items-center gap-1.5">
            <UserGroupIcon class="h-4 w-4 opacity-70" aria-hidden="true" />
            {{ t("components.roomCard.guests", { count: status.guests }) }}
          </span>
          <span
            v-if="status.size && status.size !== '-'"
            class="flex items-center gap-1.5"
          >
            <ArrowsPointingOutIcon
              class="h-4 w-4 opacity-70"
              aria-hidden="true"
            />
            {{ status.size }}
          </span>
          <span v-if="room.floor_number" class="flex items-center gap-1.5">
            <BuildingOffice2Icon
              class="h-4 w-4 opacity-70"
              aria-hidden="true"
            />
            {{ t("components.roomCard.floor", { number: room.floor_number }) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs text-(--color-muted)">
          <BanknotesIcon class="h-4 w-4 opacity-70" aria-hidden="true" />
          <span class="font-medium">{{ t("components.roomCard.baseRate") }}</span>
          <strong class="text-(--color-text) font-bold text-sm">
            {{ formatPrice(room.basePrice) }}
            <span class="text-xs font-medium text-(--color-muted)"
              >{{ t("components.roomCard.perNight") }}</span
            >
          </strong>
        </div>

        <p
          class="text-xs text-(--color-muted) line-clamp-2 pt-0.5 font-normal leading-relaxed"
        >
          {{ status.description }}
        </p>
      </div>

      <div
        class="px-5 py-3 border-t border-(--color-border) bg-(--color-surface-soft) flex items-center justify-between"
      >
        <button
          type="button"
          @click.stop="$emit('edit', room)"
          class="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-primary) hover:bg-(--color-surface-soft) transition-all gap-1.5 cursor-pointer"
        >
          <PencilSquareIcon class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="text-xs font-semibold">{{ t("components.roomCard.editRoom") }}</span>
        </button>

        <button
          type="button"
          @click.stop="$emit('delete', room)"
          class="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
          :title="t('components.roomCard.deleteRoom')"
        >
          <TrashIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
