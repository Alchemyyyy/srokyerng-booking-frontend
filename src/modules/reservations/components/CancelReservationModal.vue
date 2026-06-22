<template>
  <AppModal :open="open" title="Cancel Reservation" @close="$emit('close')">
    <!-- Eligibility blocked -->
    <div v-if="!eligible" class="crm__blocked">
      <div class="crm__blocked-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </div>
      <h3 class="crm__blocked-title">Cancellation Not Available</h3>
      <p class="crm__blocked-text">
        {{ blockedReason || 'This reservation cannot be cancelled at this time.' }}
      </p>
    </div>

    <!-- Eligible form -->
    <div v-else class="crm__body">
      <!-- Policy reminder -->
      <CancellationPolicyBox
        v-if="policy"
        :tone="policy.tone"
        :description="policy.description"
        :deadline="policy.deadline"
        :refund-breakdown="policy.refundBreakdown || []"
      />

      <!-- Refund preview -->
      <div v-if="refundAmount !== null" class="crm__refund-preview">
        <span class="crm__refund-label">Estimated Refund</span>
        <span class="crm__refund-amount" :class="refundAmount > 0 ? 'crm__refund-amount--positive' : 'crm__refund-amount--zero'">
          ${{ Number(refundAmount).toFixed(2) }}
        </span>
      </div>

      <!-- Reason input -->
      <div class="crm__field">
        <label class="crm__label" for="cancel-reason">
          Reason for cancellation <span class="crm__required">*</span>
        </label>
        <textarea
          id="cancel-reason"
          v-model="reason"
          class="crm__textarea"
          rows="3"
          maxlength="500"
          placeholder="e.g. Change of travel plans, personal reasons…"
          :disabled="loading"
        />
        <p class="crm__char-count">{{ reason.length }}/500</p>
        <p v-if="reasonError" class="crm__field-error">{{ reasonError }}</p>
      </div>

      <!-- Warning -->
      <div class="crm__warning">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>This action cannot be undone. Your reservation will be permanently cancelled.</span>
      </div>

      <!-- API error -->
      <p v-if="error" class="crm__error" role="alert">{{ error }}</p>
    </div>

    <!-- Footer -->
    <template #footer>
      <button class="crm__btn crm__btn--secondary" :disabled="loading" @click="$emit('close')">
        Keep Reservation
      </button>
      <button
        v-if="eligible"
        class="crm__btn crm__btn--danger"
        :disabled="loading || !reason.trim()"
        @click="handleConfirm"
      >
        <span v-if="loading" class="crm__spinner"/>
        <span>{{ loading ? 'Cancelling…' : 'Confirm Cancellation' }}</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppModal from '@/shared/components/AppModal.vue'
import CancellationPolicyBox from './CancellationPolicyBox.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  eligible: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  policy: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm'])

const reason = ref('')
const reasonError = ref('')

// Computed refund amount (fallback if policy doesn't provide it)
const refundAmount = computed(() => {
  if (!props.policy) return null
  return props.policy.refundAmount ?? props.policy.refund_amount ?? 0
})

const blockedReason = computed(() => {
  if (props.policy?.cancellation_eligibility?.reasons?.[0]) {
    return props.policy.cancellation_eligibility.reasons[0]
  }
  return null
})

watch(() => props.open, (val) => {
  if (!val) {
    reason.value = ''
    reasonError.value = ''
  }
})

function handleConfirm() {
  if (!reason.value.trim()) {
    reasonError.value = 'Please provide a reason.'
    return
  }
  reasonError.value = ''
  emit('confirm', reason.value.trim())
}
</script>

<style scoped>
/* Your existing styles (unchanged) */
.crm__body { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 0.5rem; }

.crm__blocked {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
}

.crm__blocked-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(220,53,69,0.1);
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crm__blocked-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.crm__blocked-text  { margin: 0; color: var(--color-muted); font-size: 0.9rem; max-width: 36ch; }

.crm__refund-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft, rgba(0,0,0,0.03));
}

.crm__refund-label { font-size: 0.85rem; font-weight: 600; color: var(--color-muted); }
.crm__refund-amount { font-size: 1.1rem; font-weight: 800; }
.crm__refund-amount--positive { color: #1d9e75; }
.crm__refund-amount--zero     { color: var(--color-muted); }

.crm__field { display: flex; flex-direction: column; gap: 0.4rem; }

.crm__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
}

.crm__required { color: #dc3545; margin-left: 2px; }

.crm__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.crm__textarea:focus { border-color: var(--color-primary); }
.crm__textarea:disabled { opacity: 0.6; }

.crm__char-count { margin: 0; font-size: 0.72rem; color: var(--color-muted); text-align: right; }
.crm__field-error { margin: 0; font-size: 0.8rem; color: #dc3545; font-weight: 600; }

.crm__warning {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  background: rgba(239,159,39,0.08);
  border: 1px solid rgba(239,159,39,0.25);
  border-radius: 10px;
  font-size: 0.82rem;
  color: #c97c0a;
  line-height: 1.5;
}

.crm__error {
  margin: 0;
  padding: 0.7rem 0.9rem;
  background: rgba(220,53,69,0.07);
  border: 1px solid rgba(220,53,69,0.2);
  border-radius: 10px;
  color: #dc3545;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Footer buttons */
.crm__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.crm__btn:disabled { opacity: 0.55; cursor: not-allowed; }

.crm__btn--secondary {
  background: var(--color-surface-soft, #f3f4f6);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.crm__btn--danger {
  background: #dc3545;
  color: white;
}

.crm__btn--danger:not(:disabled):hover { background: #b02a37; }

.crm__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>