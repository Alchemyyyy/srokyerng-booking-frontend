<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/shared/components/AppButton.vue";
import placeholer from "@/assets/images/properties/placeholder.png";
import {
  BuildingOffice2Icon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/vue/24/outline";

const emit = defineEmits(["edit", "delete"]);

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const statusBadgeClass = computed(() => {
  const status = props.property.status?.toUpperCase();
  if (status === "APPROVED")
    return "bg-(--color-success-soft) text-(--color-success)";
  if (status === "PENDING")
    return "bg-(--color-warning-soft) text-(--color-warning)";
  return "bg-(--color-surface-soft) text-(--color-muted)";
});

// Editing an approved property is allowed — the backend automatically
// reverts it to "pending" on save, so this is just used for the
// tooltip hint, not to disable the button.
const isApproved = computed(
  () => props.property.status?.toUpperCase() === "APPROVED",
);

// ⚠️ Route name guessed to match what PropertyCard already used for the
// old "Detail" button — confirm it's right if the card doesn't navigate.
const goToDetail = () => {
  router.push({
    name: "owner.property-detail",
    params: { id: props.property.id },
  });
};
</script>
<template>
  <div
    class="bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-(--color-primary)/40 transition-all duration-200 cursor-pointer"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <div
      class="relative aspect-[4/3] w-full bg-(--color-surface-soft) overflow-hidden"
    >
      <img
        :src="property.image || placeholer"
        :alt="property.name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        @error="onImageError"
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
        <h3
          class="text-[15px] font-bold text-(--color-text) tracking-tight line-clamp-1"
        >
          {{ property.name }}
        </h3>

        <p
          class="text-xs text-(--color-primary) font-medium mt-1 flex items-center gap-1"
        >
          <MapPinIcon class="w-3 h-3 text-(--color-muted)" />

          <span class="text-(--color-muted) font-normal"
            >{{ property.type }} ·</span
          >
          {{ property.location }}
        </p>

        <div class="grid grid-cols-3 gap-1 mt-4">
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)">{{
              property.rooms
            }}</span>
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5"
              >Rooms</span
            >
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)">{{
              property.bookings
            }}</span>
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5"
              >Bookings</span
            >
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-(--color-text)"
              >${{ property.revenue?.toLocaleString() }}</span
            >
            <span class="text-[11px] text-(--color-muted) font-normal mt-0.5"
              >Revenue</span
            >
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-1.5 mt-5 pt-3 border-t border-(--color-border)"
      >
        <div class="flex items-center gap-1.5 flex-1">
          <RouterLink
            :to="`/owner/rooms?propertyId=${property.id}`"
            class="flex items-center justify-center gap-1 bg-(--color-primary-soft) hover:bg-(--color-primary)/20 text-(--color-primary) font-semibold text-[11px] px-2.5 py-2 rounded-lg transition flex-1"
            @click.stop
          >
            <BuildingOffice2Icon class="w-3.5 h-3.5" />

            Rooms
          </RouterLink>

          <AppButton
            variant="ghost"
            size="sm"
            :title="
              isApproved
                ? 'Editing this approved property will require admin re-approval'
                : 'Edit property'
            "
            @click.stop="emit('edit', property)"
          >
            <PencilSquareIcon class="w-3.5 h-3.5" />
            Edit
          </AppButton>
        </div>

        <button
          @click.stop="emit('delete', props.property.id)"
          class="text-(--color-danger) hover:bg-(--color-danger-soft) p-2 rounded-lg transition-colors ml-0.5"
          title="Delete Property"
        >
          <TrashIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
