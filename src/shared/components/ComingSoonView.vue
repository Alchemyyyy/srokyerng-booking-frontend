<script setup>
import BrandLogo from "@/shared/components/BrandLogo.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <main class="page-shell">
    <section class="panel">
      <BrandLogo class="mb-4" />
      <h1>{{ title }}</h1>
      <p class="muted">This area is prepared for module implementation.</p>
    </section>
  </main>
</template>
