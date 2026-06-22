<script setup>
defineProps({
  /**
   * Array of steps:
   * { label: string, date?: string, state: 'done' | 'active' | 'pending' | 'danger' }
   */
  steps: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="rst">
    <p class="rst__heading">Reservation History</p>
    <div class="rst__track">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="rst__step"
        :class="{
          'rst__step--done':    step.state === 'done',
          'rst__step--active':  step.state === 'active',
          'rst__step--pending': step.state === 'pending',
          'rst__step--danger':  step.state === 'danger',
        }"
      >
        <!-- Vertical connector -->
        <div
          v-if="i < steps.length - 1"
          class="rst__line"
          :class="step.state === 'done' ? 'rst__line--done' : ''"
        ></div>

        <!-- Node -->
        <div class="rst__node">
          <svg
            v-if="step.state === 'done'"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.8"
          >
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <svg
            v-else-if="step.state === 'danger'"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.8"
          >
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          <div v-else-if="step.state === 'active'" class="rst__pulse"></div>
          <div v-else class="rst__empty"></div>
        </div>

        <!-- Label -->
        <div class="rst__info">
          <span class="rst__label">{{ step.label }}</span>
          <span v-if="step.date" class="rst__date">{{ step.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rst {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rst__heading {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.rst__track {
  display: flex;
  flex-direction: column;
}

.rst__step {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  position: relative;
}

.rst__line {
  position: absolute;
  left: 13px;
  top: 28px;
  width: 2px;
  height: calc(100% - 4px);
  background: var(--color-border);
  z-index: 0;
}

.rst__line--done {
  background: #1d9e75;
}

.rst__node {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
}

.rst__step--done   .rst__node { background: #1d9e75; border-color: #1d9e75; color: white; }
.rst__step--active .rst__node { border-color: var(--color-primary); background: rgba(55,138,221,0.08); }
.rst__step--danger .rst__node { background: #dc3545; border-color: #dc3545; color: white; }

.rst__pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.5; }
}

.rst__empty {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
}

.rst__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.3rem;
  padding-bottom: 1rem;
}

.rst__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.rst__step--pending .rst__label { color: var(--color-muted); }

.rst__date {
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>