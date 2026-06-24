<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="crm-backdrop" @click.self="$emit('close')">
        <div class="crm-modal" role="dialog" aria-modal="true">

          <!-- Header -->
          <div class="crm-header">
            <div class="crm-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="crm-header-text">
              <h3 class="crm-title">{{ t('reservationDetail.notice.title') }}</h3>
              <p class="crm-subtitle">{{ t('reservationDetail.notice.irreversible') }}</p>
            </div>
            <button class="crm-close" @click="$emit('close')" :disabled="loading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Notice bullets -->
          <div class="crm-notices">
            <div class="crm-notice-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ t('reservationDetail.notice.refundTime') }}</span>
            </div>
            <div class="crm-notice-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>
          </div>

          <!-- Footer -->
          <div class="crm-footer">
            <button class="crm-btn-keep" @click="$emit('close')" :disabled="loading">
              {{ t('reservationDetail.actions.keep') }}
            </button>
            <button class="crm-btn-danger" @click="handleConfirm" :disabled="loading">
              <div v-if="loading" class="crm-spinner"></div>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {{ loading
                ? t('reservationDetail.actions.cancelling')
                : t('reservationDetail.actions.confirm') }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
.crm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.crm-modal {
  background: var(--color-surface, #ffffff);
  border-radius: 24px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}

/* Header */
.crm-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #f1f5f9);
}

.crm-header-icon {
  width: 38px;
  height: 38px;
  background: #fef2f2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  flex-shrink: 0;
}

.crm-header-text { flex: 1; }

.crm-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text, #0f2942);
  margin: 0 0 3px;
}

.crm-subtitle {
  font-size: 0.78rem;
  color: var(--color-muted, #64748b);
  margin: 0;
  line-height: 1.4;
}

.crm-close {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--color-surface-soft, #f8fafc);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.crm-close:hover:not(:disabled) { background: var(--color-border, #f1f5f9); }
.crm-close:disabled { opacity: 0.4; cursor: not-allowed; }

/* Notices */
.crm-notices {
  padding: 12px 24px;
  background: #fffbeb;
  border-bottom: 1px solid #fef3c7;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.crm-notice-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 0.78rem;
  color: #92400e;
  line-height: 1.4;
}
.crm-notice-row svg { flex-shrink: 0; margin-top: 1px; }

/* Body */
.crm-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.crm-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--color-text, #0f2942);
  display: flex;
  align-items: center;
  gap: 6px;
}

.crm-optional {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-muted, #94a3b8);
  font-style: italic;
}

.crm-textarea {
  width: 100%;
  border: 1.5px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.88rem;
  color: var(--color-text, #0f2942);
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
  line-height: 1.5;
  background: var(--color-surface, #fff);
}
.crm-textarea:focus { border-color: var(--color-primary, #1062b3); }
.crm-textarea:disabled { opacity: 0.6; background: var(--color-surface-soft, #f8fafc); }
.crm-textarea::placeholder { color: var(--color-muted, #94a3b8); }

.crm-char {
  font-size: 0.72rem;
  color: var(--color-muted, #94a3b8);
  text-align: right;
}

.crm-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 4px;
}
.crm-error svg { flex-shrink: 0; }

/* Footer */
.crm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border, #f1f5f9);
  background: var(--color-surface-soft, #fafafa);
}

.crm-btn-keep {
  padding: 10px 20px;
  border: 1.5px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  background: var(--color-surface, white);
  color: var(--color-text, #374151);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.crm-btn-keep:hover:not(:disabled) { background: var(--color-surface-soft, #f8fafc); }
.crm-btn-keep:disabled { opacity: 0.5; cursor: not-allowed; }

.crm-btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}
.crm-btn-danger:hover:not(:disabled) { background: #b91c1c; }
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

/* Modal transition */
.modal-enter-active,
.modal-leave-active { transition: opacity 250ms cubic-bezier(0.4,0,0.2,1); }
.modal-enter-from,
.modal-leave-to    { opacity: 0; }
</style>