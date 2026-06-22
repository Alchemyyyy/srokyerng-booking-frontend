<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
});

const displayTitle = computed(() => props.title || t("components.emptyTitle"));
const displayMessage = computed(
  () => props.message || t("components.emptyMessage"),
);
</script>

<template>
  <section
    class="rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-card)"
  >
    <div
      class="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-(--color-primary-soft) text-(--color-primary)"
    >
      <slot name="icon">∅</slot>
    </div>
    <h2 class="m-0 text-xl font-semibold text-(--color-text)">
      {{ displayTitle }}
    </h2>
    <p class="mx-auto mt-2 max-w-md text-(--color-muted)">
      {{ displayMessage }}
    </p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action"></slot>
    </div>
  </section>
</template>
