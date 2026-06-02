<script setup>
import { computed } from "vue";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useToastStore } from "@/shared/store/toastStore";

const toastStore = useToastStore();

const variantConfig = {
  success: {
    icon: CheckCircleIcon,
    accentClass: "bg-(--color-success)",
    iconClass: "bg-(--color-success-soft) text-(--color-success)",
  },
  danger: {
    icon: XCircleIcon,
    accentClass: "bg-(--color-danger)",
    iconClass: "bg-(--color-danger-soft) text-(--color-danger)",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    accentClass: "bg-(--color-warning)",
    iconClass: "bg-(--color-warning-soft) text-(--color-warning)",
  },
  info: {
    icon: InformationCircleIcon,
    accentClass: "bg-(--color-info)",
    iconClass: "bg-(--color-info-soft) text-(--color-info)",
  },
};

const getToastConfig = (variant) => variantConfig[variant] || variantConfig.info;
const displayedToasts = computed(() => toastStore.toasts.slice(-4));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="toastStore.hasToasts"
      class="fixed inset-x-4 top-20 z-[70] grid gap-3 sm:inset-x-auto sm:right-6 sm:top-24 sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="grid gap-3"
      >
        <div
          v-for="toast in displayedToasts"
          :key="toast.id"
          class="relative overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-text) shadow-(--shadow-panel) ring-1 ring-black/5"
        >
          <div
            class="absolute inset-y-0 left-0 w-1"
            :class="getToastConfig(toast.variant).accentClass"
          />
          <div
            class="flex gap-3 py-3 pl-4 pr-3"
            :class="toast.message ? 'items-start' : 'items-center'"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              :class="[getToastConfig(toast.variant).iconClass, toast.message ? 'mt-0.5' : '']"
            >
              <component
                :is="getToastConfig(toast.variant).icon"
                class="h-5 w-5"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p v-if="toast.title" class="text-sm font-bold leading-5">{{ toast.title }}</p>
              <p
                class="text-sm leading-5 text-(--color-muted)"
                :class="toast.title ? 'mt-0.5' : ''"
              >
                {{ toast.message }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-sm p-1 text-(--color-muted) transition hover:bg-(--color-surface-soft) hover:text-(--color-text)"
              aria-label="Dismiss notification"
              @click="toastStore.remove(toast.id)"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
          <div
            v-if="toast.timeout > 0"
            class="toast-progress absolute bottom-0 left-0 h-0.5"
            :class="getToastConfig(toast.variant).accentClass"
            :style="{ animationDuration: `${toast.timeout}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 360ms ease,
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}

.toast-move {
  transition: transform 280ms ease;
}

.toast-progress {
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  transform-origin: left;
  width: 100%;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}
</style>
