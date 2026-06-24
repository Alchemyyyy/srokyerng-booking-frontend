<template>
  <div class="policy-box" :class="`policy-box--${tone}`">
    <!-- Header -->
    <div class="policy-box__header">
      <div class="policy-box__icon-wrap" :class="`policy-box__icon-wrap--${tone}`">
        <svg v-if="tone === 'free'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        <svg v-else-if="tone === 'partial'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </div>
      <div>
        <p class="policy-box__eyebrow">{{ $t('reservationDetail.policy.label') }}</p>
        <h3 class="policy-box__title">{{ policyLabel }}</h3>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="policy-box__loading">
      <div class="policy-box__spinner"/>
      <span>{{ $t('reservationDetail.loading') }}</span>
    </div>

    <!-- Content -->
    <template v-else>
      <p v-if="description" class="policy-box__description">{{ description }}</p>

      <!-- Deadline row -->
      <div v-if="deadline" class="policy-box__deadline">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span>{{ $t('reservationDetail.policy.cancelBy', { deadline }) }}</span>
      </div>

      <!-- Refund breakdown -->
      <div v-if="refundBreakdown.length" class="policy-box__breakdown">
        <div v-for="row in refundBreakdown" :key="row.label" class="policy-box__breakdown-row">
          <span class="policy-box__breakdown-label">{{ row.label }}</span>
          <span class="policy-box__breakdown-value" :class="`policy-box__breakdown-value--${row.type}`">
            {{ row.value }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  /** 'free' | 'partial' | 'strict' */
  tone: { type: String, default: 'partial' },
  description: { type: String, default: '' },
  deadline: { type: String, default: '' },
  refundBreakdown: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const policyLabel = computed(() => {
  if (props.tone === 'free') return t('reservationDetail.policy.free')
  if (props.tone === 'strict') return t('reservationDetail.policy.strict')
  return t('reservationDetail.policy.partial')
})
</script>

<style scoped>
.policy-box {
  border-radius: 18px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.policy-box--free  { border-color: rgba(29,158,117,0.3); background: rgba(29,158,117,0.04); }
.policy-box--partial { border-color: rgba(239,159,39,0.3); background: rgba(239,159,39,0.04); }
.policy-box--strict { border-color: rgba(220,53,69,0.3); background: rgba(220,53,69,0.04); }

.policy-box__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.policy-box__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.policy-box__icon-wrap--free    { background: rgba(29,158,117,0.12); color: #1d9e75; }
.policy-box__icon-wrap--partial { background: rgba(239,159,39,0.12); color: #c97c0a; }
.policy-box__icon-wrap--strict  { background: rgba(220,53,69,0.12); color: #dc3545; }

.policy-box__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.policy-box__title {
  margin: 0.15rem 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.policy-box__description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.6;
}

.policy-box__deadline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: var(--color-surface-soft, rgba(0,0,0,0.04));
  border: 1px solid var(--color-border);
}

.policy-box__breakdown {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.policy-box__breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.policy-box__breakdown-row:last-child { border-bottom: none; }

.policy-box__breakdown-label { color: var(--color-muted); }

.policy-box__breakdown-value { font-weight: 700; }
.policy-box__breakdown-value--full    { color: #1d9e75; }
.policy-box__breakdown-value--partial { color: #c97c0a; }
.policy-box__breakdown-value--none    { color: #dc3545; }

.policy-box__loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.policy-box__spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>