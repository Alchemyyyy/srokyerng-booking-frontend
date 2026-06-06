<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

defineProps({
    yearOptions: {
        type: Array,
        default: () => [],
    },
    selectedYear: {
        type: [Number, String],
        default: '',
    },
});

const emit = defineEmits(['update:selectedYear']);
const { t } = useI18n();

const eyebrowText = computed(() => t('owner.analytics.dashboardEyebrow'));
const titleText = computed(() => t('owner.analytics.dashboardTitle'));
const subtitleText = computed(() => t('owner.analytics.dashboardSubtitle'));
const yearText = computed(() => t('owner.analytics.year'));
</script>

<template>
    <header class="topbar">
        <div>
            <p class="eyebrow">{{ eyebrowText }}</p>
            <h1 class="text-3xl font-semibold text-(--color-text)">{{ titleText }}</h1>
            <p class="topbar-subtitle">{{ subtitleText }}</p>
        </div>

        <div class="topbar-actions">
            <label class="year-picker" v-if="yearOptions.length > 0">
                <p class="year-picker__label">{{ yearText }}</p>
                <div class="year-picker__wrapper">
                    <select class="year-picker__select" :value="selectedYear"
                        @change="emit('update:selectedYear', Number($event.target.value))">
                        <option v-for="year in yearOptions" :key="year" :value="year">
                            {{ year }}
                        </option>
                    </select>

                    <ChevronDownIcon class="year-picker__icon" />
                </div>
            </label>
        </div>
    </header>
</template>

<style scoped>
.topbar {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
}

.eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
}

.topbar-subtitle {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
  max-width: 56ch;
}

.topbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: center;
}

.year-picker {
    display: inline-flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 8.5rem;
}

.year-picker__label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-muted);
}

.year-picker__wrapper {
    position: relative;
    width: 100%;
}

.year-picker__select {
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

.year-picker__select:focus {
    border-color: var(--color-primary);
    box-shadow:
        0 0 0 3px color-mix(in srgb,
            var(--color-primary) 18%,
            transparent),
        var(--shadow-card);
}

.year-picker__icon {
    position: absolute;
    right: 0.9rem;
    top: 50%;

    width: 16px;
    height: 16px;

    transform: translateY(-50%);

    color: var(--color-muted);

    pointer-events: none;
}

@media (max-width: 1100px) {
    .topbar {
        flex-direction: column;
    }

    .topbar-actions {
        justify-content: flex-start;
    }
}

@media (max-width: 760px) {
    .topbar-actions {
        align-items: flex-start;
    }
}
</style>