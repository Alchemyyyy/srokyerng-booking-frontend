<script setup>
// import AppButton from '@/shared/components/AppButton.vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

defineProps({
  // loading: { type: Boolean, default: false },
  historyOptions: { type: Array, default: () => [] },
  selectedHistory: { type: String, default: '24m' }
})

const emit = defineEmits(['refresh', 'change-history'])
</script>

<template>
  <header class="dashboard-hero">
    <div>
      <p class="dashboard-eyebrow">{{ t('admin.analyticsPage.hero.eyebrow') }}</p>
      <h1 class="text-3xl font-semibold text-(--color-text)">{{ t('admin.analyticsPage.hero.title') }}</h1>
      <p class="dashboard-subtitle">
        {{ t('admin.analyticsPage.hero.subtitle') }}
      </p>
    </div>

    <div class="hero-actions">
      <label class="history-picker" v-if="historyOptions.length > 0">
        <p class="history-picker__label">{{ t('admin.analyticsPage.hero.historyLabel') }}</p>
        <div class="history-picker__wrapper">
          <select class="history-picker__select" :value="selectedHistory"
            @change="emit('change-history', $event.target.value)">
            <option v-for="option in historyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <ChevronDownIcon class="history-picker__icon" />
        </div>
      </label>

      <!-- <AppButton type="button" class="refresh-button" size="sm" :loading="loading" @click="emit('refresh')">
        {{ loading ? "Refreshing..." : "Refresh data" }}
      </AppButton> -->
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

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: center;
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

.history-picker {
  display: inline-flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 8.5rem;
}

.history-picker__label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-muted);
}

.history-picker__wrapper {
  position: relative;
  width: 100%;
}

.history-picker__select {
  width: 100%;
  appearance: none;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  padding: 0.5rem 2rem 0.5rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: var(--shadow-card);
  outline: none;
  cursor: pointer;
}

.history-picker__select:focus {
  border-color: var(--color-primary);
}

.history-picker__icon {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translateY(-50%);
  color: var(--color-muted);
  pointer-events: none;
}

.refresh-button {
  min-width: 9rem;
}

@media (max-width: 900px) {
  .dashboard-hero {
    flex-direction: column;
  }

  .hero-actions {
    justify-content: flex-start;
  }
}
</style>