<script setup>
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
      <p class="eyebrow">SrokYerng Booking</p>
      <h1>{{ title }}</h1>
      <p class="muted">This area is prepared for module implementation.</p>
    </section>
  </main>
</template>
