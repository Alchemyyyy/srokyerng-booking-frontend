<template>
  <header class="dashboard-hero">
    <div>
      <p class="dashboard-eyebrow">Approval management center</p>
      <h1 class="text-3xl font-semibold text-(--color-text)">Property Approvals</h1>
      <p class="dashboard-subtitle">
        Review and manage platform host listings requests.
      </p>
    </div>
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
  max-width: 56ch;
}

@media (max-width: 900px) {
  .dashboard-hero {
    flex-direction: column;
  }
}
</style>