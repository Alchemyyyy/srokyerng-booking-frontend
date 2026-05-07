<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary", "danger", "ghost"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const variantClasses = {
  primary:
    "bg-(--color-primary) text-white hover:bg-(--color-primary-strong) border-transparent",
  secondary:
    "bg-(--color-surface) text-(--color-primary) border-(--color-border) hover:bg-(--color-primary-soft)",
  danger:
    "bg-(--color-danger) text-white hover:brightness-95 border-transparent",
  ghost:
    "bg-transparent text-(--color-text) border-transparent hover:bg-(--color-surface-soft)",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-sm border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
      sizeClasses[size],
      variantClasses[variant],
    ]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    ></span>
    <slot>{{ loading ? t("common.loading") : t("common.submit") }}</slot>
  </button>
</template>
