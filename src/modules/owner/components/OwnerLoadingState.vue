<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
});

const displayLabel = computed(() => props.label || t("common.loading"));
</script>

<template>
  <section
    class="flex flex-col items-center gap-3 py-20 rounded-2xl border border-(--color-border) bg-(--color-surface)"
    role="status"
  >
    <span
      class="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin"
      aria-hidden="true"
    ></span>
    <p class="text-sm text-(--color-muted)">{{ displayLabel }}</p>
  </section>
</template>
