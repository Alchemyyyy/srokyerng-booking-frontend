<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApprovalStore } from '../store/approval.store';
import AppModal from '@/shared/components/AppModal.vue';
import AppLoading from '@/shared/components/LoadingSpinner.vue';
import PropertyLocationMap from '@/shared/components/PropertyLocationMap.vue';
import { useSidebar } from '@/shared/composables/useSidebar';
import { useToastStore } from '@/shared/store/toastStore';
import { formatDate } from '../utils/formatters';
import {
  ChevronLeftIcon, CheckIcon, XMarkIcon,
  CheckCircleIcon, XCircleIcon,
  QuestionMarkCircleIcon, ChevronDownIcon
} from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();
const { t, te } = useI18n({ useScope: 'global' });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || '').toLowerCase()}`, value);

const approvalStore = useApprovalStore();

const previewImageUrl = ref(null);

const approveModalOpen = ref(false);
const rejectModalOpen = ref(false);
const pendingModalOpen = ref(false);

const rejectReason = ref('');
const rejectReasonError = ref(false);
const isActionDropdownOpen = ref(false);

onMounted(async () => {
  const propertyId = route.params.id;
  await approvalStore.fetchPropertyDetail(propertyId);
  await approvalStore.fetchPropertyImages(propertyId);
  window.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdown);
});

const closeDropdown = () => { isActionDropdownOpen.value = false; };
const toggleActionDropdown = (event) => {
  event.stopPropagation();
  isActionDropdownOpen.value = !isActionDropdownOpen.value;
};

const openImagePreview = (url) => {
  previewImageUrl.value = url;
  document.body.style.overflow = 'hidden';
};

const closeImagePreview = () => {
  previewImageUrl.value = null;
  document.body.style.overflow = '';
};

const executeApprove = async () => {
  const success = await approvalStore.handleApprove(approvalStore.currentProperty.id);
  if (success) {
    approveModalOpen.value = false;
    toastStore.success(t('admin.propertyReviewDetailPage.toasts.approveSuccessMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.approveSuccessTitle'),
      timeout: 4000
    });
    await approvalStore.fetchPropertyDetail(route.params.id);
  } else {
    toastStore.danger(t('admin.propertyReviewDetailPage.toasts.approveFailMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.approveFailTitle'),
      timeout: 4000
    });
  }
};

const executeReject = async () => {
  if (!rejectReason.value.trim()) {
    rejectReasonError.value = true;
    return;
  }
  rejectReasonError.value = false;

  const success = await approvalStore.handleReject(approvalStore.currentProperty.id, rejectReason.value);
  if (success) {
    rejectModalOpen.value = false;
    toastStore.success(t('admin.propertyReviewDetailPage.toasts.rejectSuccessMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.rejectSuccessTitle'),
      timeout: 4000
    });
    await approvalStore.fetchPropertyDetail(route.params.id);
  } else {
    toastStore.danger(t('admin.propertyReviewDetailPage.toasts.rejectFailMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.rejectFailTitle'),
      timeout: 4000
    });
  }
};

const executeSetPending = async () => {
  const success = await approvalStore.handleSetPending(approvalStore.currentProperty.id);
  if (success) {
    pendingModalOpen.value = false;
    toastStore.success(t('admin.propertyReviewDetailPage.toasts.pendingSuccessMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.pendingSuccessTitle'),
      timeout: 4000
    });
    await approvalStore.fetchPropertyDetail(route.params.id);
  } else {
    toastStore.danger(t('admin.propertyReviewDetailPage.toasts.pendingFailMessage'), {
      title: t('admin.propertyReviewDetailPage.toasts.pendingFailTitle'),
      timeout: 4000
    });
  }
};
</script>

<template>
  <div class="detail-wrapper transition-all duration-300 my-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">

    <div v-if="approvalStore.currentProperty" class="flex justify-between items-start mb-6">
      <div>
        <button @click="router.back()" class="back-btn mb-2">
          <ChevronLeftIcon class="w-4 h-4" /> {{ t('admin.propertyReviewDetailPage.nav.backToList') }}
        </button>
        <h1 class="page-main-title">{{ approvalStore.currentProperty.property_name }}</h1>
        <p class="page-subtitle">
          {{ approvalStore.currentProperty.address ? approvalStore.currentProperty.address + ', ' : '' }}{{
            approvalStore.currentProperty.city }}, {{ approvalStore.currentProperty.province }}
        </p>
      </div>
      <div>
        <span :class="[
          'status-badge-lg',
          {
            'status-pending': approvalStore.currentProperty.status_id === 1 || approvalStore.currentProperty.status_name?.toLowerCase() === 'pending',
            'status-approved': approvalStore.currentProperty.status_id === 2 || approvalStore.currentProperty.status_name?.toLowerCase() === 'approved',
            'status-rejected': approvalStore.currentProperty.status_id === 3 || approvalStore.currentProperty.status_name?.toLowerCase() === 'rejected'
          }
        ]">
          ● {{ statusLabel(approvalStore.currentProperty.status_name || 'pending') }}
        </span>
      </div>
    </div>

    <div v-if="approvalStore.error" class="status-error-card p-6 rounded-xl mb-6">{{ approvalStore.error }}</div>

    <div v-if="approvalStore.loading" class="flex justify-center items-center py-24">
      <AppLoading :label="t('admin.propertyReviewDetailPage.loading.syncing')" />
    </div>

    <div v-else-if="approvalStore.currentProperty" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <div class="lg:col-span-2 flex flex-col gap-6">

        <div class="custom-card">
          <h3 class="section-title">{{ t('admin.propertyReviewDetailPage.media.title') }}</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="(img, idx) in approvalStore.propertyImages" :key="img.id || idx"
              class="img-container aspect-video rounded-xl overflow-hidden relative group cursor-pointer"
              @click="openImagePreview(img.url)">
              <img :src="img.url"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span v-if="img.is_cover"
                class="absolute top-2 left-2 bg-(--color-primary) text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{{ t('admin.propertyReviewDetailPage.media.coverBadge') }}</span>
            </div>
            <div v-if="!approvalStore.propertyImages || approvalStore.propertyImages.length === 0"
              class="aspect-video rounded-xl flex items-center justify-center border-2 border-dashed border-muted/20 text-muted text-sm">
              {{ t('admin.propertyReviewDetailPage.media.noMedia') }}
            </div>
          </div>
        </div>

        <div class="custom-card grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="sm:col-span-2">
            <h3 class="section-title mb-0">{{ t('admin.propertyReviewDetailPage.specs.title') }}</h3>
          </div>

          <div class="info-field">
            <label>{{ t('admin.propertyReviewDetailPage.specs.propertyName') }}</label>
            <div class="val font-bold">{{ approvalStore.currentProperty.property_name }}</div>
          </div>
          <div class="info-field">
            <label>{{ t('admin.propertyReviewDetailPage.specs.categoryGroup') }}</label>
            <div class="val">{{ approvalStore.currentProperty.category_name || t('admin.propertyReviewDetailPage.specs.categoryFallback') }}</div>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.specs.cityLocation') }}</label>
            <div class="val">{{ approvalStore.currentProperty.city }}</div>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.specs.provinceRegion') }}</label>
            <div class="val">{{ approvalStore.currentProperty.province || t('admin.propertyReviewDetailPage.specs.provinceFallback') }}</div>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.specs.countryIdentity') }}</label>
            <div class="val">{{ approvalStore.currentProperty.country || t('admin.propertyReviewDetailPage.specs.countryFallback') }}</div>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.specs.geographicAddress') }}</label>
            <div class="val">{{ approvalStore.currentProperty.address || t('admin.propertyReviewDetailPage.specs.addressFallback') }}</div>
          </div>

          <div class="info-field sm:col-span-2">
            <label>{{ t('admin.propertyReviewDetailPage.specs.description') }}</label>
            <div class="val italic opacity-90 leading-relaxed">
              {{ approvalStore.currentProperty.description || t('admin.propertyReviewDetailPage.specs.descriptionFallback') }}
            </div>
          </div>

          <div class="info-field sm:col-span-2">
            <label>{{ t('admin.propertyReviewDetailPage.specs.locationOnMap') }}</label>
            <PropertyLocationMap
              :latitude="approvalStore.currentProperty.latitude"
              :longitude="approvalStore.currentProperty.longitude"
              :label="approvalStore.currentProperty.property_name"
            />
          </div>
        </div>

        <div class="custom-card grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="sm:col-span-2">
            <h3 class="section-title mb-0">{{ t('admin.propertyReviewDetailPage.contact.title') }}</h3>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.contact.phone') }}</label>
            <div class="val">{{ approvalStore.currentProperty.contact_phone || t('admin.propertyReviewDetailPage.contact.fallback') }}</div>
          </div>
          <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.contact.email') }}</label>
            <div class="val">{{ approvalStore.currentProperty.contact_email || t('admin.propertyReviewDetailPage.contact.fallback') }}</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6">

        <div class="custom-card">
          <h3 class="section-title">{{ t('admin.propertyReviewDetailPage.host.title') }}</h3>
          <div class="flex flex-col gap-4">
            <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.host.ownerName') }}</label>
              <div class="val font-semibold text-base">{{ approvalStore.currentProperty.owner_name || t('admin.propertyReviewDetailPage.host.ownerNameFallback') }}
              </div>
            </div>
            <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.host.contactLine') }}</label>
              <div class="val">{{ approvalStore.currentProperty.owner_phone || t('admin.propertyReviewDetailPage.host.fallback') }}</div>
            </div>
            <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.host.emailAccount') }}</label>
              <div class="val lowercase">{{ approvalStore.currentProperty.owner_email || t('admin.propertyReviewDetailPage.host.fallback') }}</div>
            </div>
          </div>
        </div>

        <div class="custom-card">
          <h3 class="section-title">{{ t('admin.propertyReviewDetailPage.logs.title') }}</h3>
          <div class="flex flex-col gap-4">
            <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.logs.created') }}</label>
              <div class="val">{{ formatDate(approvalStore.currentProperty.created_at) }}</div>
            </div>
            <div class="info-field"><label>{{ t('admin.propertyReviewDetailPage.logs.updated') }}</label>
              <div class="val">{{ formatDate(approvalStore.currentProperty.updated_at) }}</div>
            </div>
          </div>
        </div>

        <div class="custom-card border border-dashed border-(--color-primary)">
          <h3 class="section-title text-(--color-primary)">{{ t('admin.propertyReviewDetailPage.moderation.title') }}</h3>
          <div class="flex flex-col gap-3 relative">

            <template
              v-if="approvalStore.currentProperty.status_id === 1 || approvalStore.currentProperty.status_name?.toLowerCase() === 'pending'">
              <button @click="approveModalOpen = true" :disabled="approvalStore.processing" class="btn-action-primary">
                <CheckIcon class="w-4 h-4 stroke-3" /> {{ t('admin.propertyReviewDetailPage.moderation.approvePublish') }}
              </button>
              <button @click="rejectReason = ''; rejectReasonError = false; rejectModalOpen = true;"
                :disabled="approvalStore.processing" class="btn-action-danger-outline">
                <XMarkIcon class="w-4 h-4 stroke-3" /> {{ t('admin.propertyReviewDetailPage.moderation.rejectSubmission') }}
              </button>
            </template>

            <template v-else>
              <div class="relative w-full">
                <button @click="toggleActionDropdown" :disabled="approvalStore.processing" class="btn-action-dropdown">
                  {{ t('admin.propertyReviewDetailPage.moderation.editStatus') }}
                  <ChevronDownIcon class="w-4 h-4 ml-auto" />
                </button>
                <div v-if="isActionDropdownOpen" class="popover-panel">
                  <button v-if="approvalStore.currentProperty.status_id !== 1" @click="pendingModalOpen = true"
                    class="popover-item item-warning">{{ t('admin.propertyReviewDetailPage.moderation.setPending') }}</button>
                  <button v-if="approvalStore.currentProperty.status_id !== 2" @click="approveModalOpen = true"
                    class="popover-item item-success">{{ t('admin.propertyReviewDetailPage.moderation.approveListing') }}</button>
                  <button v-if="approvalStore.currentProperty.status_id !== 3"
                    @click="rejectReason = ''; rejectReasonError = false; rejectModalOpen = true;"
                    class="popover-item item-danger">{{ t('admin.propertyReviewDetailPage.moderation.rejectListing') }}</button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <AppModal :open="approveModalOpen" @close="approveModalOpen = false">
      <div class="p-2 text-center">
        <div class="modal-icon-container bg-(--color-success-soft)">
          <CheckCircleIcon class="w-14 h-14 text-(--color-success)" />
        </div>
        <h3 class="modal-main-title">{{ t('admin.propertyReviewDetailPage.modal.approve.title') }}</h3>
        <p class="modal-description">{{ t('admin.propertyReviewDetailPage.modal.approve.description') }}</p>
        <div class="flex gap-3 justify-center mt-6">
          <button @click="approveModalOpen = false" class="btn-modal-cancel">{{ t('admin.propertyReviewDetailPage.modal.cancel') }}</button>
          <button @click="executeApprove" :disabled="approvalStore.processing" class="btn-modal-success-confirm">
            <AppLoading v-if="approvalStore.processing" :label="t('admin.propertyReviewDetailPage.modal.approve.publishing')" class="text-(--color-text-inverse)" />
            <span v-else>{{ t('admin.propertyReviewDetailPage.modal.approve.confirm') }}</span>
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal :open="rejectModalOpen" @close="rejectModalOpen = false">
      <div class="p-2">
        <div class="flex items-center gap-3 mb-2">
          <XCircleIcon class="w-6 h-6 text-(--color-danger)" />
          <h3 class="modal-main-title mb-0 text-left">{{ t('admin.propertyReviewDetailPage.modal.reject.title') }}</h3>
        </div>
        <p class="modal-description text-left">{{ t('admin.propertyReviewDetailPage.modal.reject.description') }}</p>

        <div class="flex flex-col gap-2 mt-4">
          <textarea v-model="rejectReason" rows="4" class="modal-form-textarea"
            :class="{ 'textarea-err': rejectReasonError }"
            :placeholder="t('admin.propertyReviewDetailPage.modal.reject.placeholder')"></textarea>
          <span v-if="rejectReasonError" class="validation-error-msg">{{ t('admin.propertyReviewDetailPage.modal.reject.validationError') }}</span>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <button @click="rejectModalOpen = false" class="btn-modal-cancel">{{ t('admin.propertyReviewDetailPage.modal.cancel') }}</button>
          <button @click="executeReject" :disabled="approvalStore.processing" class="btn-modal-danger-confirm">
            <AppLoading v-if="approvalStore.processing" :label="t('admin.propertyReviewDetailPage.modal.reject.rejecting')" class="text-(--color-text-inverse)" />
            <span v-else>{{ t('admin.propertyReviewDetailPage.modal.reject.confirm') }}</span>
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal :open="pendingModalOpen" @close="pendingModalOpen = false">
      <div class="p-2 text-center">
        <div class="modal-icon-container bg-(--color-warning-soft)">
          <QuestionMarkCircleIcon class="w-14 h-14 text-(--color-warning)" />
        </div>
        <h3 class="modal-main-title">{{ t('admin.propertyReviewDetailPage.modal.pending.title') }}</h3>
        <p class="modal-description">{{ t('admin.propertyReviewDetailPage.modal.pending.description') }}</p>
        <div class="flex gap-3 justify-center mt-6">
          <button @click="pendingModalOpen = false" class="btn-modal-cancel">{{ t('admin.propertyReviewDetailPage.modal.cancel') }}</button>
          <button @click="executeSetPending" :disabled="approvalStore.processing" class="btn-modal-warning-confirm">
            <AppLoading v-if="approvalStore.processing" :label="t('admin.propertyReviewDetailPage.modal.pending.processing')" class="text-(--color-text-inverse)" />
            <span v-else>{{ t('admin.propertyReviewDetailPage.modal.pending.confirm') }}</span>
          </button>
        </div>
      </div>
    </AppModal>

    <div v-if="previewImageUrl" class="lightbox-layer" @click="closeImagePreview">
      <button class="close-lightbox-btn"><XMarkIcon class="w-5 h-5" /></button>
      
      <img :src="previewImageUrl" class="lightbox-img" @click.stop />
    </div>
  </div>
</template>

<style scoped>
/* --- Layout Frame System --- */
.detail-wrapper {
  padding: 0 var(--space-lg);
  font-family: var(--font-main);
  background-color: var(--color-page);
  color: var(--color-text);
}

.page-main-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-top: var(--space-xs);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--color-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  color: var(--color-primary);
}

/* --- Badges & Custom Grid Components --- */
.status-badge-lg {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.custom-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0;
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-sm);
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.info-field .val {
  font-size: 0.95rem;
  color: var(--color-text);
}

/* .cover-tag {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: 0.65rem;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  border-radius: 4px;
  text-transform: uppercase;
} */

/* --- Operation Button Frameworks --- */
.btn-action-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px var(--space-md);
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--color-success);
  color: var(--color-text-inverse);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

[data-theme="dark"] {
  .btn-action-primary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: 12px var(--space-md);
    font-size: 0.875rem;
    font-weight: 600;
    background-color: #2da154;
    color: var(--color-text);
    border: 1px solid var(--color-success);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }
}

.btn-action-primary:hover {
  background-color: var(--color-success-soft);
}

.btn-action-danger-outline {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px var(--space-md);
  font-size: 0.875rem;
  font-weight: 600;
  background-color: transparent;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-danger-outline:hover {
  background-color: var(--color-danger-soft);
}

.btn-action-dropdown {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px var(--space-md);
  font-size: 0.875rem;
  font-weight: 600;
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-dropdown:hover {
  background-color: var(--color-primary-soft);
}

/* --- Inline Dropdown Popover System --- */
.popover-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 115%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-panel);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: var(--space-xs) 0;
}

.popover-item {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
}

.popover-item:hover {
  background-color: var(--color-surface-soft);
}

.item-warning {
  color: var(--color-warning);
}

.item-success {
  color: var(--color-success);
}

.item-danger {
  color: var(--color-danger);
}

/* --- Popover Form Overlays & Modals Structure --- */
.modal-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  margin-bottom: var(--space-md);
}

.modal-main-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.modal-description {
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.modal-form-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  background-color: var(--color-input);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  font-size: 0.875rem;
  outline: none;
  resize: none;
}

.modal-form-textarea:focus {
  border-color: var(--color-primary);
}

.textarea-err {
  border-color: var(--color-danger);
}

.validation-error-msg {
  font-size: 0.75rem;
  color: var(--color-danger);
  font-weight: 500;
  text-align: left;
}

/* --- Modal Action Control Footers --- */
.btn-modal-cancel {
  background-color: transparent;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  cursor: pointer;
}

.btn-modal-cancel:hover {
  background-color: var(--color-surface-soft);
}

.btn-modal-success-confirm {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
}

.btn-modal-danger-confirm {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
}

.btn-modal-warning-confirm {
  background-color: var(--color-warning);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Lightbox Overlay Styling Container --- */
.lightbox-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* background-color: var(--color-page); */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(12px);
}

.lightbox-img {
  max-width: 90%;
  max-height: 80vh;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
  object-fit: contain;
}

.close-lightbox-btn {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-xl);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-size: 1.75rem;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-lightbox-btn:hover {
  background-color: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.status-error-card {
  background-color: var(--color-danger-soft);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}
</style>