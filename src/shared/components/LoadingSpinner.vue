<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
});

const displayLabel = computed(() => props.label || t("common.loading"));
</script>

<template>
  <div class="inline-flex items-center gap-3 text-(--color-muted)" role="status">
    <span
      class="size-5 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent"
      aria-hidden="true"
    ></span>
    <span>{{ displayLabel }}</span>
  </div>
</template>
