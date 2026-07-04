<template>
  <AppModal :open="open" :title="t('reservationDetail.notice.title')" panel-class="max-w-md" @close="$emit('close')">
    <div class="crm-subtitle">{{ t('reservationDetail.notice.irreversible') }}</div>

    <!-- Notice bullets -->
    <div class="crm-notices">
      <div class="crm-notice-row">
        <ExclamationCircleIcon class="h-3.5 w-3.5 shrink-0" />
        <span>{{ t('reservationDetail.notice.refundTime') }}</span>
      </div>
      <div class="crm-notice-row">
        <CheckCircleIcon class="h-3.5 w-3.5 shrink-0" />
        <span>{{ t('reservationDetail.notice.notification') }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="crm-body">
      <label class="crm-label">
        {{ t('reservationDetail.form.reasonLabel') }}
        <span class="crm-optional">({{ t('common.cancel').toLowerCase() === 'cancel' ? 'optional' : '' }})</span>
      </label>
      <textarea
        v-model="reason"
        class="crm-textarea"
        :placeholder="t('reservationDetail.form.reasonPlaceholder')"
        rows="4"
        maxlength="500"
        :disabled="loading"
      ></textarea>
      <span class="crm-char">{{ reason.length }}/500</span>

      <!-- Error -->
      <div v-if="error" class="crm-error">
        <ExclamationCircleIcon class="h-3.5 w-3.5 shrink-0" />
        {{ error }}
      </div>
    </div>

    <template #footer>
      <button class="crm-btn-keep" @click="$emit('close')" :disabled="loading">
        {{ t('reservationDetail.actions.keep') }}
      </button>
      <button class="crm-btn-danger" @click="handleConfirm" :disabled="loading">
        <div v-if="loading" class="crm-spinner"></div>
        <XMarkIcon v-else class="h-3.5 w-3.5" />
        {{ loading
          ? t('reservationDetail.actions.cancelling')
          : t('reservationDetail.actions.confirm') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExclamationCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import AppModal from '@/shared/components/AppModal.vue'

const { t } = useI18n()

const props = defineProps({
  open:     { type: Boolean, default: false },
  eligible: { type: Boolean, default: true  },
  loading:  { type: Boolean, default: false },
  error:    { type: String,  default: ''    },
})

const emit = defineEmits(['close', 'confirm'])

const reason = ref('')

// Reset reason each time modal opens
watch(() => props.open, (val) => {
  if (val) reason.value = ''
})

const handleConfirm = () => {
  emit('confirm', reason.value.trim())
}
</script>

<style scoped>
.crm-subtitle {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin: -8px 0 12px;
  line-height: 1.4;
}

/* Notices */
.crm-notices {
  padding: 10px 12px;
  background: var(--color-warning-soft);
  border: 1px solid var(--color-warning);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.crm-notice-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 0.78rem;
  color: var(--color-warning);
  line-height: 1.4;
}

/* Body */
.crm-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.crm-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.crm-optional {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-muted);
  font-style: italic;
}

.crm-textarea {
  width: 100%;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.88rem;
  color: var(--color-text);
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
  line-height: 1.5;
  background: var(--color-surface);
}
.crm-textarea:focus { border-color: var(--color-primary); }
.crm-textarea:disabled { opacity: 0.6; background: var(--color-surface-soft); }
.crm-textarea::placeholder { color: var(--color-muted); }

.crm-char {
  font-size: 0.72rem;
  color: var(--color-muted);
  text-align: right;
}

.crm-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--color-danger);
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 4px;
}

/* Footer */
.crm-btn-keep {
  padding: 10px 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.crm-btn-keep:hover:not(:disabled) { background: var(--color-surface-soft); }
.crm-btn-keep:disabled { opacity: 0.5; cursor: not-allowed; }

.crm-btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}
.crm-btn-danger:hover:not(:disabled) { background: var(--color-danger); filter: brightness(0.9); }
.crm-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.crm-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: crm-spin 0.7s linear infinite;
}
@keyframes crm-spin { to { transform: rotate(360deg); } }
</style>
