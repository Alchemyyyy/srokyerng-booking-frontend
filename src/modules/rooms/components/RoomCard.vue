<script setup>
import {
  ArrowsPointingOutIcon,
  BanknotesIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import { computed, onMounted } from "vue";
import { useRoomStore } from "../store/roomStore"; // ← Adjust path if needed

const roomStore = useRoomStore();

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

// Get cover image from store (with full URL)
const coverImage = computed(() => {
  return roomStore.getCoverImage(props.room.id);
});

// Fallback image
const displayImage = computed(() => {
  return (
    coverImage.value ||
    props.room.image ||
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80"
  );
});

onMounted(() => {
  // Ensure images are fetched for this room
  if (props.room?.id) {
    roomStore.fetchRoomImages(props.room.id);
  }
});
</script>

<template>
  <div
    class="rounded-xl border border-(--color-border) bg-(--color-surface) flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
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
        ID: {{ room.id }}
      </span>

      <!-- Loading indicator -->
      <div
        v-if="!coverImage && !room.image"
        class="absolute inset-0 flex items-center justify-center bg-black/30"
      >
        <div
          class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between">
      <div class="p-5 space-y-3.5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-base font-bold tracking-tight text-(--color-text)">
              {{ room.type }}
            </h3>
            <p class="text-xs text-(--color-muted) mt-0.5">
              {{ room.propertyName }}
            </p>
          </div>

          <span
            :class="[
              'px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1',
              status.status === 'Available'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : '',
              status.status === 'Occupied'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : '',
              status.status === 'Maintenance'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : '',
            ]"
          >
            <span class="w-1.5 h-1.5 bg-current rounded-full"></span>
            {{ status.status }}
          </span>
        </div>

        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-(--color-muted)"
        >
          <span class="flex items-center gap-1.5">
            <UserGroupIcon class="h-4 w-4 opacity-70" aria-hidden="true" />
            {{ status.guests }} guests
          </span>
          <span class="flex items-center gap-1.5">
            <ArrowsPointingOutIcon
              class="h-4 w-4 opacity-70"
              aria-hidden="true"
            />
            {{ status.size }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 text-xs text-(--color-muted)">
          <BanknotesIcon class="h-4 w-4 opacity-70" aria-hidden="true" />
          <span class="font-medium">Base Rate:</span>
          <strong class="text-(--color-text) font-bold text-sm">
            ${{ room.basePrice }}
            <span class="text-xs font-medium text-(--color-muted)"
              >/ night</span
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
          @click="$emit('edit', room)"
          class="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-primary) hover:bg-(--color-surface-soft) transition-all gap-1.5 cursor-pointer"
        >
          <PencilSquareIcon class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="text-xs font-semibold">Edit Room</span>
        </button>

        <button
          type="button"
          @click="$emit('delete', room)"
          class="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
          title="Delete room"
        >
          <TrashIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
