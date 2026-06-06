<script setup>
import { computed } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    summaryCards: {
        type: Array,
        default: () => [],
    },
    animationSeed: {
        type: Number,
        default: 0,
    },
});

const displayedValues = ref([]);
const activeRafIds = [];
const integerFormatter = new Intl.NumberFormat('en-US');
const { t } = useI18n();

const summaryMetricsLabel = computed(() => t('owner.analytics.summaryMetrics'));

const stopAnimations = () => {
    activeRafIds.forEach((rafId) => {
        if (typeof rafId === 'number') {
            cancelAnimationFrame(rafId);
        }
    });
    activeRafIds.length = 0;
};

const parseTargetValue = (card) => {
    const kind = String(card?.kind || '').toLowerCase();
    const raw = String(card?.value || '');

    if (kind === 'currency') {
        return Number(raw.replace(/[^\d.-]/g, '')) || 0;
    }

    if (kind === 'rating') {
        return Number(raw.replace(/[^\d.-]/g, '')) || 0;
    }

    return Number(raw.replace(/[^\d.-]/g, '')) || 0;
};

const formatAnimatedValue = (card, value) => {
    const kind = String(card?.kind || '').toLowerCase();

    if (kind === 'currency') {
        return `$${integerFormatter.format(Math.round(value))}`;
    }

    if (kind === 'rating') {
        return `${value.toFixed(1)}★`;
    }

    return integerFormatter.format(Math.round(value));
};

const animateCard = (card, index) => {
    const target = parseTargetValue(card);

    if (!Number.isFinite(target)) {
        displayedValues.value[index] = card?.value || '0';
        return;
    }

    const duration = 850 + index * 80;
    const startedAt = performance.now();

    const step = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        const current = target * easedProgress;

        displayedValues.value[index] = formatAnimatedValue(card, current);

        if (progress < 1) {
            activeRafIds[index] = requestAnimationFrame(step);
        }
    };

    activeRafIds[index] = requestAnimationFrame(step);
};

const runCountAnimation = () => {
    stopAnimations();
    displayedValues.value = props.summaryCards.map((card) => card?.value || '0');
    props.summaryCards.forEach((card, index) => animateCard(card, index));
};

watch(
    () => [props.summaryCards, props.animationSeed],
    () => {
        runCountAnimation();
    },
    { immediate: true, deep: true }
);

onBeforeUnmount(() => {
    stopAnimations();
});
</script>

<template>
    <section class="metrics" :aria-label="summaryMetricsLabel">
        <article v-for="(card, index) in summaryCards" :key="card.label" class="metric">
            <div class="metric__icon" :class="`metric__icon--${card.tone}`">
                <component :is="card.icon" class="h-6 w-6" />
            </div>
            <div>
                <p class="metric__label">{{ card.label }}</p>
                <p class="metric__value">{{ displayedValues[index] || card.value }}</p>
                <p class="metric__delta">{{ card.delta }}</p>
            </div>
        </article>
    </section>
</template>

<style scoped>
.metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.metric {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
}

.metric__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.metric__icon--blue {
    background: var(--color-primary-soft);
    color: var(--color-primary);
}

.metric__icon--teal {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.metric__icon--amber {
    background: var(--color-info-soft);
    color: var(--color-info);
}

.metric__icon--coral {
    background: var(--color-warning-soft);   
    color: var(--color-warning);
}

.metric__label {
    margin: 0;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric__value {
    margin: 0.15rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.metric__delta {
    margin: 0.15rem 0 0;
    color: #1d9e75;
    font-size: 0.85rem;
}

@media (max-width: 1100px) {
    .metrics {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 760px) {
    .metrics {
        grid-template-columns: 1fr;
    }
}
</style>