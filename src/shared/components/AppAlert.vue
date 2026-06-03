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
    class: "border-(--color-success) bg-(--color-success-soft) text-(--color-success)",
  },
  danger: {
    icon: XCircleIcon,
    class: "border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    class: "border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)",
  },
  info: {
    icon: InformationCircleIcon,
    class: "border-(--color-info) bg-(--color-info-soft) text-(--color-info)",
  },
};

const activeConfig = computed(() => variantConfig[props.variant] || variantConfig.info);
const AlertIcon = computed(() => activeConfig.value.icon);
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium"
    :class="activeConfig.class"
    role="status"
  >
    <component :is="AlertIcon" class="mt-0.5 h-5 w-5 shrink-0" />
    <div class="min-w-0">
      <p v-if="title" class="font-bold">{{ title }}</p>
      <div :class="title ? 'mt-1' : ''">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="-mr-1 ml-auto rounded-sm p-1 transition hover:bg-black/5"
      aria-label="Dismiss alert"
      @click="$emit('close')"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>
