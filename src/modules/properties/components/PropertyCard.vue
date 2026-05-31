<script setup>
import { computed } from "vue";
const emit = defineEmits(["edit", "delete"]);

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
});

// Precise color badge matching for your status states
const statusBadgeClass = computed(() => {
  const status = props.property.status?.toUpperCase();
  if (status === "APPROVED") return "bg-(--color-success-soft) text-(--color-success)";
  if (status === "PENDING") return "bg-(--color-warning-soft) text-(--color-warning)";
  return "bg-(--color-surface-soft) text-(--color-muted)";
});
</script>
<template>
  <div
    class="bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow duration-200"
  >
    <div class="relative aspect-[4/3] w-full bg-(--color-surface-soft) overflow-hidden">
      <img
        :src="property.image"
        :alt="property.name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
      />
      <span
        class="absolute top-3 left-3 text-[9px] tracking-wider font-bold px-2 py-0.5 rounded-md uppercase"
        :class="statusBadgeClass"
      >
        {{ property.status }}
      </span>
    </div>

    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="text-[15px] font-bold text-(--color-text) tracking-tight line-clamp-1">
          {{ property.name }}
        </h3>

        <p class="text-xs text-(--color-primary) font-medium mt-1 flex items-center gap-1">
          <span class="text-(--color-muted) text-[10px]">📍</span>
          <span class="text-(--color-muted) font-normal">{{ property.type }} ·</span>
          {{ property.location }}
        </p>

        <div class="grid grid-cols-3 gap-1 mt-4">
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)">{{ property.rooms }}</span>
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5">Rooms</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)">{{ property.bookings }}</span>
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5">Bookings</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)">${{ property.revenue?.toLocaleString() }}</span>
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5">Revenue</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-1.5 mt-5 pt-3 border-t border-(--color-border)">
        <div class="flex items-center gap-1.5 flex-1">
          <button class="flex items-center justify-center gap-1 bg-(--color-primary-soft) hover:bg-(--color-primary)/20 text-(--color-primary) font-semibold text-[11px] px-2.5 py-2 rounded-lg transition flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Rooms
          </button>

          <button
            @click="emit('edit', property)"
            class="flex items-center justify-center gap-1 bg-(--color-surface-soft) hover:bg-(--color-border) text-(--color-muted) font-semibold text-[11px] px-2.5 py-2 rounded-lg transition flex-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Edit
          </button>

          <button class="flex items-center justify-center gap-1 bg-(--color-surface-soft) hover:bg-(--color-border) text-(--color-muted) font-semibold text-[11px] px-2.5 py-2 rounded-lg transition flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            View
          </button>
        </div>

        <button
          @click="emit('delete', props.property.id)"
          class="text-(--color-danger) hover:bg-(--color-danger-soft) p-2 rounded-lg transition-colors ml-0.5"
          title="Delete Property"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>