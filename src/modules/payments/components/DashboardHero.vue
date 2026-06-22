<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <header class="dashboard-hero">
    <div>
      <p v-if="eyebrow" class="dashboard-eyebrow">{{ eyebrow }}</p>
      <h1 class="text-3xl font-semibold text-(--color-text)">{{ title }}</h1>
      <p v-if="subtitle" class="dashboard-subtitle">{{ subtitle }}</p>
    </div>
    <slot name="action"></slot>
  </header>
</template>

<style scoped>
.dashboard-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.dashboard-eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
}

.dashboard-subtitle {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
  width: 100%;
}

@media (max-width: 900px) {
  .dashboard-hero {
    flex-direction: column;
  }
}
</style>