<!-- modules/analytics/components/QuickActions.vue -->
<script setup>
const props = defineProps({
  links: { type: Array, required: true },
  formatter: { type: Function, required: true }
})
const formattedCount = (val) => props.formatter(val)
</script>

<template>
  <section class="quick-links" aria-label="Quick admin workflows">
    <header>
      <h2>Quick actions</h2>
      <p>Open key admin workflows in one click.</p>
    </header>

    <div class="quick-links-grid">
      <RouterLink v-for="link in links" :key="link.title" :to="link.to" class="quick-link-card">
        <div>
          <h3>{{ link.title }}</h3>
          <p>{{ link.description }}</p>
        </div>
        <span class="quick-link-count">{{ formattedCount(link.count) }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.quick-links header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.quick-links header p {
  font-size: 13px;
  color: var(--color-muted);
  margin-bottom: var(--space-md);
}

.quick-links-grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .quick-links-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .quick-links-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.quick-link-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.quick-link-card:hover {
  border-color: var(--color-primary);
}

.quick-link-card h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.quick-link-card p {
  font-size: 11px;
  color: var(--color-muted);
}

.quick-link-count {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}
</style>