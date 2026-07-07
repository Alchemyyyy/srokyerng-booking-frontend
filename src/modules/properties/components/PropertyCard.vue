<script setup>
import { computed, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import placeholer from "@/assets/images/properties/placeholder.png";
import {
  MapPinIcon,
  ClockIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
} from "@heroicons/vue/24/outline";
import { formatPrice } from "@/shared/utils/currency";

const emit = defineEmits(["edit", "toggle-status"]);

const props = defineProps({
  property: { type: Object, required: true },
});

const router = useRouter();
const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) =>
  safeT(`common.status.${String(value || "").toLowerCase()}`, value);

// ── Edit-request state ────────────────────────────────────────────────────────
const hasPendingEdit = computed(
  () =>
    props.property.pendingEdit === true ||
    props.property.has_pending_edit === true,
);
const hasRejectedEdit = computed(
  () =>
    props.property.rejectedEdit === true ||
    props.property.has_rejected_edit === true,
);
const rejectionReason = computed(
  () => props.property.rejectionReason || props.property.rejection_reason || "",
);

// ── Status helpers ────────────────────────────────────────────────────────────
const isApproved = computed(
  () => props.property.status?.toUpperCase() === "APPROVED",
);
const isSuspended = computed(
  () => props.property.status?.toUpperCase() === "SUSPENDED",
);
const isPending = computed(
  () => props.property.status?.toUpperCase() === "PENDING",
);
const isRejected = computed(
  () => props.property.status?.toUpperCase() === "REJECTED",
);

// ── Badge config ──────────────────────────────────────────────────────────────
const badgeConfig = computed(() => {
  if (hasPendingEdit.value)
    return {
      label: t("components.propertyCard.badgePendingChanges"),
      bg: "bg-orange-500/10 border-orange-500/20",
      text: "text-orange-700",
    };
  if (hasRejectedEdit.value)
    return {
      label: statusLabel("rejected"),
      bg: "bg-rose-500/10 border-rose-500/20",
      text: "text-rose-700",
    };

  const s = props.property.status?.toUpperCase();
  if (s === "APPROVED")
    return {
      label: statusLabel("approved"),
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-700",
    };
  if (s === "PENDING")
    return {
      label: statusLabel("pending"),
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-700",
    };
  if (s === "REJECTED")
    return {
      label: statusLabel("rejected"),
      bg: "bg-rose-500/10 border-rose-500/20",
      text: "text-rose-700",
    };
  if (s === "SUSPENDED")
    return {
      label: statusLabel("suspended"),
      bg: "bg-(--color-surface-soft)0/10 border-gray-500/20",
      text: "text-(--color-muted)",
    };

  return {
    label: s ? statusLabel(s) : t("components.propertyCard.statusUnknown"),
    bg: "bg-(--color-surface-soft)0/10 border-gray-500/20",
    text: "text-(--color-text)",
  };
});

// ── Navigation ────────────────────────────────────────────────────────────────
const goToDetail = () =>
  router.push({
    name: "owner.property-detail",
    params: { id: props.property.id },
  });

const onImageError = (e) => {
  e.target.src = placeholer;
};

// ── "..." dropdown menu ───────────────────────────────────────────────────────
const showMenu = ref(false);

const openMenu = (e) => {
  e.stopPropagation();
  showMenu.value = !showMenu.value;
  if (showMenu.value) {
    // Close on next outside click
    setTimeout(() => {
      document.addEventListener("click", closeMenu, { once: true });
    }, 0);
  }
};

const closeMenu = () => {
  showMenu.value = false;
};

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenu);
});

// ── Actions ───────────────────────────────────────────────────────────────────
const handleDeactivate = (e) => {
  e.stopPropagation();
  closeMenu();
  emit("toggle-status", { id: props.property.id, action: "deactivate" });
};

const handleActivate = (e) => {
  e.stopPropagation();
  closeMenu();
  emit("toggle-status", { id: props.property.id, action: "activate" });
};
</script>

<template>
  <div
    class="bg-(--color-surface) rounded-[24px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <!-- ── Image block ──────────────────────────────────────────────────── -->
    <div class="relative w-full p-3 pb-0" style="height: 240px">
      <div
        class="relative w-full h-full rounded-[18px] overflow-hidden bg-(--color-border)"
      >
        <img
          :src="property.image || placeholer"
          :alt="property.name"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          @error="onImageError"
        />

        <!-- Gradient overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10 pointer-events-none"
        />

        <!-- Status badge -->
        <span
          class="absolute top-3 left-3 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md bg-(--color-surface)/80 border border-(--color-border)"
          :class="[badgeConfig.bg, badgeConfig.text]"
        >
          {{ badgeConfig.label }}
        </span>

        <!-- Pending Changes banner -->
        <div
          v-if="hasPendingEdit"
          class="absolute bottom-3 left-3 right-3 bg-(--color-surface)/85 backdrop-blur-xl rounded-2xl p-3 flex items-start gap-3 border border-(--color-border) shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
        >
          <div class="bg-orange-100/80 p-1.5 rounded-full shrink-0 mt-0.5">
            <ClockIcon class="w-4 h-4 text-orange-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-(--color-text) leading-tight">
              {{ t("components.propertyCard.waitingApproval") }}
            </p>
            <p
              v-if="property.submittedAt"
              class="text-[11px] text-(--color-muted) mt-1 font-medium"
            >
              {{ t("components.propertyCard.submittedOn", { date: property.submittedAt }) }}
            </p>
          </div>
        </div>

        <!-- Rejected banner (either a rejected edit-request, or the original submission itself) -->
        <div
          v-else-if="hasRejectedEdit || isRejected"
          class="absolute bottom-3 left-3 right-3 bg-(--color-surface)/85 backdrop-blur-xl rounded-2xl p-3 flex items-start gap-3 border border-(--color-border) shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
        >
          <div class="bg-rose-100/80 p-1.5 rounded-full shrink-0 mt-0.5">
            <XCircleIcon class="w-4 h-4 text-rose-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-(--color-text) leading-tight">
              {{ t("components.propertyCard.rejectedByAdmin") }}
            </p>
            <p
              v-if="rejectionReason"
              class="text-[11px] text-(--color-muted) mt-1 truncate font-medium"
            >
              {{ t("components.propertyCard.reason", { reason: rejectionReason }) }}
            </p>
          </div>
          <InformationCircleIcon
            class="w-5 h-5 text-(--color-muted) mt-0.5 shrink-0"
          />
        </div>

        <!-- Pending (new property) banner -->
        <div
          v-else-if="isPending"
          class="absolute bottom-3 left-3 right-3 bg-(--color-surface)/85 backdrop-blur-xl rounded-2xl p-3 flex items-start gap-3 border border-(--color-border) shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
        >
          <div class="bg-blue-100/80 p-1.5 rounded-full shrink-0 mt-0.5">
            <ClockIcon class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-(--color-text) leading-tight">
              {{ t("components.propertyCard.underReview") }}
            </p>
            <p
              v-if="property.submittedAt"
              class="text-[11px] text-(--color-muted) mt-1 font-medium"
            >
              {{ t("components.propertyCard.submittedOn", { date: property.submittedAt }) }}
            </p>
          </div>
        </div>

        <!-- Suspended banner -->
        <div
          v-else-if="isSuspended"
          class="absolute bottom-3 left-3 right-3 bg-(--color-surface)/85 backdrop-blur-xl rounded-2xl p-3 flex items-start gap-3 border border-(--color-border) shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
        >
          <div class="bg-gray-100/80 p-1.5 rounded-full shrink-0 mt-0.5">
            <PauseCircleIcon class="w-4 h-4 text-(--color-muted)" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-(--color-text) leading-tight">
              {{ t("components.propertyCard.deactivatedHidden") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Card body ────────────────────────────────────────────────────── -->
    <div class="flex flex-col flex-1 px-5 pt-5 pb-5 gap-5">
      <!-- Header -->
      <div class="flex justify-between items-start gap-4">
        <div>
          <h3
            class="text-[17px] font-extrabold text-(--color-text) tracking-tight leading-snug line-clamp-1"
          >
            {{ property.name }}
          </h3>
          <p
            class="flex items-center gap-1 mt-1.5 text-[13px] font-medium text-(--color-muted)"
          >
            <MapPinIcon class="w-4 h-4 shrink-0 text-(--color-muted)" />
            {{ property.location }}, {{ t("components.propertyCard.country") }}
          </p>
        </div>

        <div class="text-right shrink-0">
          <p
            class="text-[11px] font-semibold text-(--color-muted) uppercase tracking-wide"
          >
            {{ t("components.propertyCard.revenue") }}
          </p>
          <p class="text-[16px] font-black text-(--color-text) mt-0.5">
            {{ formatPrice(property.revenue || 0) }}
          </p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="flex items-center gap-4 py-3 border-y border-(--color-border)">
        <div class="flex items-center gap-2">
          <div class="bg-(--color-surface-soft) p-1.5 rounded-lg text-(--color-muted)">
            <BuildingOffice2Icon class="w-4 h-4" />
          </div>
          <div>
            <span
              class="block text-[13px] font-bold text-(--color-text) leading-none"
              >{{ property.rooms || 0 }}</span
            >
            <span
              class="block text-[11px] font-medium text-(--color-muted) mt-1 leading-none"
              >{{ t("components.propertyCard.rooms") }}</span
            >
          </div>
        </div>

        <div class="w-[1px] h-6 bg-(--color-border)"></div>

        <div class="flex items-center gap-2">
          <div class="bg-(--color-surface-soft) p-1.5 rounded-lg text-(--color-muted)">
            <CalendarDaysIcon class="w-4 h-4" />
          </div>
          <div>
            <span
              class="block text-[13px] font-bold text-(--color-text) leading-none"
              >{{ property.bookings || 0 }}</span
            >
            <span
              class="block text-[11px] font-medium text-(--color-muted) mt-1 leading-none"
              >{{ t("components.propertyCard.bookings") }}</span
            >
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <!-- Rooms -->
        <RouterLink
          :to="`/owner/rooms?propertyId=${property.id}`"
          class="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-(--color-surface-soft) hover:bg-(--color-border) text-(--color-text) text-[13px] font-bold transition-colors"
          @click.stop
        >
          <BuildingOffice2Icon class="w-4 h-4" />
          {{ t("components.propertyCard.rooms") }}
        </RouterLink>

        <!-- Edit -->
        <button
          class="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-(--color-surface-soft) hover:bg-(--color-border) text-(--color-text) text-[13px] font-bold transition-colors"
          :class="hasPendingEdit ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="hasPendingEdit"
          @click.stop="emit('edit', property)"
        >
          <PencilSquareIcon class="w-4 h-4" />
          {{ t("components.propertyCard.edit") }}
        </button>

        <!-- ── "..." More Menu ──────────────────────────────────────────── -->
        <div class="relative shrink-0" @click.stop>
          <button
            class="flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
            :class="
              showMenu
                ? 'bg-(--color-primary)/10 text-(--color-primary)'
                : 'bg-(--color-surface-soft) hover:bg-(--color-border) text-(--color-muted)'
            "
            @click="openMenu"
            :title="t('components.propertyCard.moreOptions')"
          >
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="showMenu"
              class="absolute bottom-full right-0 mb-2 w-48 bg-(--color-surface) rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-(--color-border) overflow-hidden z-50"
              @click.stop
            >
              <!-- Deactivate — only if approved (active) -->
              <button
                v-if="isApproved"
                @click="handleDeactivate"
                class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors text-left"
              >
                <PauseCircleIcon class="w-4 h-4 text-amber-500 shrink-0" />
                {{ t("components.propertyCard.deactivate") }}
              </button>

              <!-- Activate — only if suspended -->
              <button
                v-if="isSuspended"
                @click="handleActivate"
                class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
              >
                <PlayCircleIcon class="w-4 h-4 text-emerald-500 shrink-0" />
                {{ t("components.propertyCard.activate") }}
              </button>
            </div>
          </Transition>
        </div>
        <!-- End More Menu -->
      </div>
    </div>
  </div>
</template>
