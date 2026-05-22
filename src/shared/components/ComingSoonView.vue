<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <main class="grid min-h-screen place-items-center px-4 py-8">
    <section
      class="w-full max-w-md rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-8 shadow-(--shadow-panel)"
    >
      <p class="eyebrow">{{ t("app.name") }}</p>
      <h1 class="text-(--color-text)">{{ title }}</h1>
      <p class="muted">{{ t("components.comingSoonMessage") }}</p>
    </section>
  </main>
</template>
