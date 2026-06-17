<script setup>
import { computed } from "vue";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  variant: {
    type: String,
    default: "info",
    validator: (value) => ["success", "danger", "warning", "info"].includes(value),
  },
  title: {
    type: String,
    default: "",
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const variantConfig = {
  success: {
    icon: CheckCircleIcon,
    rootClass: "border-(--color-success)/35 bg-(--color-surface) text-(--color-text)",
    iconClass: "text-(--color-success)",
  },
  danger: {
    icon: XCircleIcon,
    rootClass: "border-(--color-danger)/35 bg-(--color-surface) text-(--color-text)",
    iconClass: "text-(--color-danger)",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    rootClass: "border-(--color-warning)/40 bg-(--color-surface) text-(--color-text)",
    iconClass: "text-(--color-warning)",
  },
  info: {
    icon: InformationCircleIcon,
    rootClass: "border-(--color-border) bg-(--color-surface) text-(--color-text)",
    iconClass: "text-(--color-primary)",
  },
};

const activeConfig = computed(() => variantConfig[props.variant] || variantConfig.info);
const AlertIcon = computed(() => activeConfig.value.icon);
</script>

<template>
  <div
    class="relative flex items-start gap-3 rounded-lg border p-4 text-sm shadow-sm"
    :class="activeConfig.rootClass"
    role="status"
  >
    <component
      :is="AlertIcon"
      class="mt-0.5 h-5 w-5 shrink-0"
      :class="activeConfig.iconClass"
    />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="text-sm font-semibold leading-none tracking-normal text-(--color-text)">
        {{ title }}
      </p>
      <div
        class="text-sm leading-6 text-(--color-muted)"
        :class="title ? 'mt-2' : ''"
      >
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="-mr-1 -mt-1 rounded-sm p-1 text-(--color-muted) opacity-80 transition hover:bg-(--color-surface-soft) hover:text-(--color-text) hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
      aria-label="Dismiss alert"
      @click="$emit('close')"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>
