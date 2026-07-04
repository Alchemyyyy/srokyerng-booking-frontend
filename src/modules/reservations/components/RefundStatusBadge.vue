<template>
  <span class="rsb" :class="[`rsb--${config.tone}`, `rsb--${size}`]" :aria-label="`Refund status: ${config.label}`">
    <span v-if="config.dot" class="rsb__dot" aria-hidden="true"/>
    <component :is="config.icon" v-else-if="config.icon" class="rsb__icon" aria-hidden="true"/>
    {{ config.label }}
  </span>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'

const CheckIcon = defineComponent({ render: () => h('svg', { width:12, height:12, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2.5' }, [h('path', { d:'M20 6 9 17l-5-5' })]) })
const CloseIcon = defineComponent({ render: () => h('svg', { width:12, height:12, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2.5' }, [h('path', { d:'M18 6 6 18M6 6l12 12' })]) })

const STATUS_MAP = {
  not_requested: { label: 'No Refund',      tone: 'neutral', dot: false, icon: null },
  pending:       { label: 'Refund Pending',  tone: 'warning', dot: true,  icon: null },
  processing:    { label: 'Processing',      tone: 'info',    dot: true,  icon: null },
  approved:      { label: 'Refund Approved', tone: 'success', dot: false, icon: CheckIcon },
  paid:          { label: 'Refunded',        tone: 'success', dot: false, icon: CheckIcon },
  rejected:      { label: 'Refund Rejected', tone: 'danger',  dot: false, icon: CloseIcon },
  cancelled:     { label: 'Cancelled',       tone: 'neutral', dot: false, icon: null },
}

const props = defineProps({
  status: { type: String, required: true },
  size:   { type: String, default: 'md', validator: v => ['sm','md'].includes(v) },
})

const config = computed(() => STATUS_MAP[props.status] ?? { label: props.status, tone: 'neutral', dot: false, icon: null })
</script>

<style scoped>
.rsb {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border: 1px solid transparent;
}

.rsb--sm { font-size: 0.7rem;  padding: 0.2rem 0.6rem; }
.rsb--md { font-size: 0.75rem; padding: 0.3rem 0.8rem; }

.rsb__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.rsb__icon { flex-shrink: 0; }

.rsb--neutral  { background: var(--color-surface-soft); color: var(--color-muted); border-color: var(--color-border); }
.rsb--warning  { background: var(--color-warning-soft); color: var(--color-warning); border-color: var(--color-warning); }
.rsb--info     { background: var(--color-info-soft); color: var(--color-info); border-color: var(--color-info); }
.rsb--success  { background: var(--color-success-soft); color: var(--color-success); border-color: var(--color-success); }
.rsb--danger   { background: var(--color-danger-soft); color: var(--color-danger); border-color: var(--color-danger); }
</style>