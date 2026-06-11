<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePropertyApproval } from '../composables/usePropertyApproval';
import PropertyGallery from '@/modules/properties/components/PropertyGallery.vue';
import AppModal from '@/shared/components/AppModal.vue';
import { ChevronLeftIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const { currentProperty, loading, processing, error, fetchPropertyDetail, handleApprove, handleReject, handleSuspend } = usePropertyApproval();

const rejectModalOpen = ref(false);
const rejectReason = ref('');
const rejectReasonError = ref(false);

onMounted(() => {
    fetchPropertyDetail(route.params.id);
});

const executeApprove = async () => {
    const success = await handleApprove(currentProperty.value.id);
    if (success) router.push({ name: 'admin.properties.index' });
};

const executeReject = async () => {
    if (!rejectReason.value.trim()) {
        rejectReasonError.value = true;
        return;
    }
    rejectReasonError.value = false;
    const success = await handleReject(currentProperty.value.id, rejectReason.value);
    if (success) {
        rejectModalOpen.value = false;
        router.push({ name: 'admin.properties.index' });
    }
};

const executeSuspend = async () => {
    const reason = prompt("Enter standard suspension note:");
    if (reason === null) return;
    const success = await handleSuspend(currentProperty.value.id, reason);
    if (success) fetchPropertyDetail(currentProperty.value.id);
};

const handleSaveAction = (data) => {
    console.log('Save action: ', data);
};

const handleShareAction = (data) => {
    console.log('Share action: ', data);
};
</script>

<template>
    <div class="review-detail-container my-25">
        <div class="nav-bar">
            <button @click="router.back()" class="back-link">
                <ChevronLeftIcon class="back-icon" /> Back to approvals
            </button>
        </div>

        <div v-if="error" class="error-panel">{{ error }}</div>
        <div v-if="loading" class="loading-skeleton">Loading setup analysis...</div>

        <div v-else-if="currentProperty" class="dashboard-grid">

            <div class="content-panel">
                <div class="card-main">
                    <!-- <div class="header-badge-group">
                        <span class="category-badge">{{ currentProperty.category }}</span>
                        <h1 class="property-title">{{ currentProperty.name }}</h1>
                        <p class="property-location">{{ currentProperty.location }}</p>
                    </div> -->

                    <PropertyGallery :property="currentProperty"
                        :selectedRoom="currentProperty.selected_room || { name: 'Standard Room', capacity: 2 }"
                        :propertyRating="currentProperty.rating || 5.0" :reviewCount="currentProperty.review_count || 0"
                        @save="handleSaveAction" @share="handleShareAction" />

                    <!-- <div class="info-section">
                        <h3 class="section-title">Description</h3>
                        <p class="section-text">{{ currentProperty.description }}</p>
                    </div> -->

                    <!-- <div class="info-section">
                        <h3 class="section-title">Amenities Included</h3>
                        <div class="amenities-flex">
                            <span v-for="amenity in currentProperty.amenities" :key="amenity" class="amenity-pill">
                                {{ amenity }}
                            </span>
                        </div>
                    </div> -->
                </div>
            </div>

            <div class="sidebar-panel">
                <div class="card-action">
                    <h3 class="sidebar-title">Application Management</h3>
                    <div class="status-summary-box">
                        <div class="label">Current Listing Status</div>
                        <div class="value">{{ currentProperty.status_name || currentProperty.status || 'Pending' }}
                        </div>
                    </div>

                    <div class="host-section">
                        <h4 class="host-title-meta">Submitted By</h4>
                        <div class="host-profile">
                            <div class="host-name">{{ currentProperty.full_name || currentProperty.owner?.name }}</div>
                            <div class="host-email">{{ currentProperty.owner_email || currentProperty.owner?.email }}
                            </div>
                            <div class="host-meta">Registered: {{ currentProperty.owner?.joinedDate || 'N/A' }}</div>
                        </div>
                    </div>

                    <div class="actions-group">
                        <template
                            v-if="currentProperty.status_id === 1 || currentProperty.status_name?.toLowerCase() === 'pending'">
                            <button @click="executeApprove" :disabled="processing" class="btn-approve">
                                <CheckIcon class="action-icon" /> Approve & Publish
                            </button>
                            <button @click="rejectModalOpen = true" :disabled="processing" class="btn-reject-trigger">
                                <XMarkIcon class="action-icon" /> Reject Listing Request
                            </button>
                        </template>
                        <template
                            v-else-if="currentProperty.status_id === 2 || currentProperty.status_name?.toLowerCase() === 'approved'">
                            <button @click="executeSuspend" :disabled="processing" class="btn-suspend">
                                <ExclamationTriangleIcon class="action-icon" /> Suspend Operations
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <AppModal :open="rejectModalOpen" @close="rejectModalOpen = false">
            <div class="modal-surface-content">
                <div>
                    <h3 class="modal-title">Specify Rejection Reason</h3>
                    <p class="modal-desc">Provide clear feedback to help the host operator adjust the submission
                        criteria.</p>
                </div>
                <div class="input-container">
                    <textarea v-model="rejectReason" rows="4" class="modal-textarea"
                        :class="{ 'input-error': rejectReasonError }" placeholder="Specify reasons..."></textarea>
                    <span v-if="rejectReasonError" class="validation-msg">Validation Warning: Rejection justification
                        text field
                        is required.</span>
                </div>
                <div class="modal-footer-actions">
                    <button @click="rejectModalOpen = false" class="btn-cancel">Cancel</button>
                    <button @click="executeReject" :disabled="processing" class="btn-confirm-reject">Confirm
                        Rejection</button>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped>
/* រក្សាទុក Style ចាស់ទាំងអស់ ដកតែ .modal-backdrop ចេញ */
.review-detail-container {
    padding: var(--space-lg);
    max-width: 72rem;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 0.875rem;
    color: var(--color-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
}

.back-link:hover {
    color: var(--color-text);
}

.back-icon {
    width: 1rem;
    height: 1rem;
}

.error-panel {
    padding: var(--space-md);
    background-color: var(--color-danger-soft);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-sm);
    color: var(--color-danger);
    font-size: 0.875rem;
}

.loading-skeleton {
    text-align: center;
    padding: var(--space-xl) 0;
    color: var(--color-muted);
    font-size: 0.875rem;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dashboard-grid {
    display: grid;
    gap: var(--space-lg);
}

@media (min-width: 1024px) {
    .dashboard-grid {
        grid-template-columns: repeat(3, minmax(0, 1xl));
    }

    .content-panel {
        grid-column: span 2 / span 2;
    }
}

.card-main,
.card-action {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--space-lg);
}

.card-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.card-action {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    position: sticky;
    top: var(--space-lg);
}

.sidebar-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text);
}

.status-summary-box {
    background-color: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    padding: var(--space-md);
    border-radius: var(--radius-sm);
}

.status-summary-box .label {
    font-size: 0.75rem;
    color: var(--color-muted);
}

.status-summary-box .value {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text);
    margin-top: var(--space-xs);
}

.host-section {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-md);
}

.host-title-meta {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-muted);
}

.host-profile {
    font-size: 0.875rem;
    margin-top: var(--space-xs);
}

.host-name {
    font-weight: 600;
    color: var(--color-text);
}

.host-email,
.host-meta {
    font-size: 0.75rem;
    color: var(--color-muted);
}

.actions-group {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.btn-approve,
.btn-reject-trigger,
.btn-suspend,
.btn-confirm-reject,
.btn-cancel {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: opacity 0.2s;
    border: none;
}

.btn-approve {
    background-color: var(--color-success);
    color: var(--color-text-inverse);
}

.btn-reject-trigger {
    background-color: transparent;
    border: 1px solid var(--color-danger);
    color: var(--color-danger);
}

.btn-reject-trigger:hover {
    background-color: var(--color-danger-soft);
}

.btn-suspend {
    background-color: var(--color-warning);
    color: var(--color-text-inverse);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-icon {
    width: 1rem;
    height: 1rem;
}

/* STYLE INSIDE APPMODAL */
.modal-surface-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.modal-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
}

.modal-desc {
    font-size: 0.75rem;
    color: var(--color-muted);
    margin-top: var(--space-xs);
}

.modal-textarea {
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

.modal-textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.input-error {
    border-color: var(--color-danger);
}

.validation-msg {
    font-size: 0.75rem;
    color: var(--color-danger);
    font-weight: 500;
}

.modal-footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-xs);
}

.btn-cancel {
    background-color: transparent;
    color: var(--color-muted);
    width: auto;
}

.btn-cancel:hover {
    background-color: var(--color-surface-soft);
}

.btn-confirm-reject {
    background-color: var(--color-danger);
    color: var(--color-text-inverse);
    width: auto;
}

@keyframes pulse {
    50% {
        opacity: .5;
    }
}
</style>