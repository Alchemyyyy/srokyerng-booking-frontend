<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  noText: {
    type: Boolean,
    default: false,
  },
  sizeClass: {
    type: String,
    default: "size-5",
  },
  colorClass: {
    type: String,
    default: "border-(--color-primary)",
  },
});

const displayLabel = computed(() => props.label || t("common.loading"));
</script>

<template>
  <div class="inline-flex items-center gap-3 text-(--color-muted)" role="status">
    <span
      :class="[sizeClass, colorClass, 'animate-spin rounded-full border-2 border-t-transparent']"
      aria-hidden="true"
    ></span>
    <span v-if="!noText && displayLabel">{{ displayLabel }}</span>
  </div>
</template>
