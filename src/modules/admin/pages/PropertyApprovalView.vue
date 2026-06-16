<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import { usePropertyApproval } from '../composables/usePropertyApproval';
import DashboardHero from '../components/DashboardHero.vue';
import ApprovalFilter from '../components/ApprovalFilter.vue';
import ApprovalTable from '../components/ApprovalTable.vue';
import AppModal from '@/shared/components/AppModal.vue';
import ApprovalSearch from '../components/ApprovalSearch.vue';
import { ExclamationTriangleIcon, InboxIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { useSidebar } from '@/shared/composables/useSidebar';
import { useToastStore } from '@/shared/store/toastStore';

const router = useRouter();
const toastStore = useToastStore();
const { properties, loading, processing, error, fetchProperties, handleApprove, handleReject, handleSetPending } = usePropertyApproval();
const { isSidebarOpen } = useSidebar();

const currentFilterStatus = ref('');
const searchKeyword = ref('');

const filteredProperties = computed(() => {
    let list = properties.value || [];

    if (searchKeyword.value.trim() !== '') {
        const query = searchKeyword.value.toLowerCase().trim();
        list = list.filter(item => {
            return (
                item.property_name?.toLowerCase().includes(query) ||
                item.owner_name?.toLowerCase().includes(query) ||
                item.owner_email?.toLowerCase().includes(query) ||
                item.address?.toLowerCase().includes(query) ||
                item.city?.toLowerCase().includes(query)
            );
        });
    }

    if (currentFilterStatus.value !== '') {
        list = list.filter(item => item.status_id === currentFilterStatus.value);
    }

    return list;
});

const emptyStateContent = computed(() => {
    if (searchKeyword.value !== '') {
        return { title: 'No Matching Results', desc: `We couldn't find any records matching "${searchKeyword.value}". Try checking your spelling.` };
    }

    switch (currentFilterStatus.value) {
        case 1:
            return { title: 'No Pending Requests', desc: 'Excellent! There are no outstanding property listings awaiting moderation.' };
        case 2:
            return { title: 'No Approved Properties', desc: 'No property submissions have been approved in this cycle yet.' };
        case 3:
            return { title: 'No Rejected Properties', desc: 'Clean record! No property listing requests have been sent to the rejection archive.' };
        default:
            return { title: 'Queue Completely Empty', desc: 'The management matrix is clear. There are no property listing records found.' };
    }
});

const approveModalOpen = ref(false);
const currentApproveId = ref(null);

const rejectModalOpen = ref(false);
const currentRejectId = ref(null);
const rejectReason = ref('');
const rejectReasonError = ref(false);

const pendingModalOpen = ref(false);
const currentPendingId = ref(null);

onMounted(async () => {
    await loadAllData();
});

const loadAllData = async () => {
    await fetchProperties();
};

const handleFilterUpdate = (newStatus) => {
    currentFilterStatus.value = newStatus;
};


const goToDetail = (id) => {
    router.push({ name: 'admin.properties.review', params: { id: id } });
};

const handleDropdownStatusSelection = ({ id, status }) => {
    if (status === 'approve') {
        currentApproveId.value = id;
        approveModalOpen.value = true;
    } else if (status === 'reject') {
        currentRejectId.value = id;
        rejectReason.value = '';
        rejectReasonError.value = false;
        rejectModalOpen.value = true;
    } else if (status === 'pending') {
        currentPendingId.value = id;
        pendingModalOpen.value = true;
    }
};

const openApproveModal = (id) => {
    currentApproveId.value = id;
    approveModalOpen.value = true;
};

const submitApprove = async () => {
    if (!currentApproveId.value) return;

    const idToApprove = currentApproveId.value;

    // ១. បាញ់បង្ហាញ Toast មុនពេល ឬអំឡុងពេលបិទ Modal ដើម្បីកុំឱ្យបាត់បង់ Context
    // toastStore.show({
    //     title: 'Processing Approval',
    //     message: 'Updating property listing status...',
    //     variant: 'info',
    //     timeout: 2000
    // });

    const success = await handleApprove(idToApprove);

    if (success) {
        approveModalOpen.value = false;
        currentApproveId.value = null;

        // ២. 🌟 កែប្រែទិន្នន័យលើ Client-side ភ្លាមៗ (Realtime Update)   
        if (properties.value) {
            properties.value = properties.value.map(p => {
                const itemId = p.id || p.property_id;
                if (itemId === idToApprove) {
                    return { ...p, status_id: 2, status_name: 'Approved' };
                }
                return p;
            });
        }

        // ៣. លោត Toast ដំណឹងជោគជ័យ
        toastStore.success('The property listing has been approved successfully.', {
            title: 'Approval Successful',
            timeout: 4000
        });

        // ៤. ទាញយកទិន្នន័យពិតពី Server មកផ្ទៀងផ្ទាត់ឡើងវិញតាមក្រោយ (Background Sync)
        await loadAllData();
    } else {
        toastStore.danger('An error occurred while approving the property.', {
            title: 'Approval Failed',
            timeout: 4000
        });
    }
};

const openRejectModal = (id) => {
    currentRejectId.value = id;
    rejectReason.value = '';
    rejectReasonError.value = false;
    rejectModalOpen.value = true;
};

const submitReject = async () => {
    if (!rejectReason.value.trim()) {
        rejectReasonError.value = true;
        return;
    }
    rejectReasonError.value = false;

    const idToReject = currentRejectId.value;

    // toastStore.show({
    //     title: 'Processing Rejection',
    //     message: 'Submitting rejection feedback...',
    //     variant: 'info',
    //     timeout: 2000
    // });

    const success = await handleReject(idToReject, rejectReason.value);

    if (success) {
        rejectModalOpen.value = false;
        currentRejectId.value = null;

        // 🌟 កែប្រែទិន្នន័យលើ Client-side ភ្លាមៗ (Realtime Update)
        if (properties.value) {
            properties.value = properties.value.map(p => {
                const itemId = p.id || p.property_id;
                if (itemId === idToReject) {
                    return { ...p, status_id: 3, status_name: 'Rejected' };
                }
                return p;
            });
        }

        toastStore.success('The submission listing request has been rejected.', {
            title: 'Property Rejected',
            timeout: 4000
        });

        await loadAllData();
    } else {
        toastStore.danger('An error occurred while rejecting the property.', {
            title: 'Rejection Failed',
            timeout: 4000
        });
    }
};

const submitSetPending = async () => {
    if (!currentPendingId.value) return;
    const idToPending = currentPendingId.value;

    // សម្គាល់៖ ប្រសិនបើ handleApprove/handleReject របស់អ្នកមិនគាំទ្រលេខ status_id = 1 ទេ 
    // អ្នកអាចហៅប្រើប្រាស់ approvalService.updatePropertyStatus(idToPending, 1) ផ្ទាល់តែម្តង
    const success = await handleSetPending(idToPending);

    if (success) {
        pendingModalOpen.value = false;
        currentPendingId.value = null;

        if (properties.value) {
            properties.value = properties.value.map(p => {
                const itemId = p.id || p.property_id;
                if (itemId === idToPending) {
                    return { ...p, status_id: 1, status_name: 'Pending' };
                }
                return p;
            });
        }

        toastStore.success('Property status has been reset to Pending successfully.', {
            title: 'Status Updated',
            timeout: 4000
        });
        await loadAllData();
    } else {
        toastStore.danger('Failed to reset property status. Please try again.', {
            title: 'Update Error',
            timeout: 4000
        });
    }
};
</script>

<template>
    <div class="approval-container my-25 mx-auto" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <div class="page-header">
            <div>
                <DashboardHero />
            </div>
            <!-- <div v-if="properties.length > 0" class="counter-badge">
                {{ properties.length }} Requests Pending
            </div> -->
        </div>
        <!-- filter -->
        <div class="table-actions-bar">
            <ApprovalSearch v-model="searchKeyword" />
            <ApprovalFilter :model-value="currentFilterStatus" :all-properties="properties"
                @update:model-value="handleFilterUpdate" />
        </div>

        <div v-if="error" class="state-card error-card">
            <ExclamationTriangleIcon class="state-icon text-danger" />
            <div class="state-content">
                <h3 class="state-title">Data Fetching Interrupted</h3>
                <p class="state-desc">{{ error }}</p>
                <button @click="fetchProperties" class="btn-retry">Try Reconnecting</button>
            </div>
        </div>

        <div v-else-if="loading" class="state-card loading-card">
            <div class="spinner"></div>
            <p class="loading-text">Synchronizing property database...</p>
        </div>

        <template v-else>
            <ApprovalTable v-if="filteredProperties.length > 0" :items="filteredProperties" :is-processing="processing"
                @approve="openApproveModal" @reject="openRejectModal" @row-click="goToDetail"
                @change-status-click="handleDropdownStatusSelection" />

            <div v-else class="state-card empty-card">
                <InboxIcon class="state-icon text-muted" />
                <h3 class="state-title">{{ emptyStateContent.title }}</h3>
                <p class="state-desc">{{ emptyStateContent.desc }}</p>
            </div>
        </template>

        <AppModal :open="approveModalOpen" @close="approveModalOpen = false">
            <div class="modal-surface-content text-center">
                <div class="icon-wrapper confirmation-success">
                    <CheckCircleIcon class="modal-status-icon text-success" />
                </div>
                <div>
                    <h3 class="modal-title">Confirm Listing Approval</h3>
                    <p class="modal-desc mt-2">Are you sure you want to approve and publish this property request to the
                        platform live listings?</p>
                </div>
                <div class="modal-footer-actions justify-center mt-4">
                    <button @click="approveModalOpen = false" class="btn-cancel">Cancel</button>
                    <button @click="submitApprove" :disabled="processing" class="btn-confirm-approve">
                        {{ processing ? 'Publishing...' : 'Yes, Approve' }}
                    </button>
                </div>
            </div>
        </AppModal>

        <AppModal :open="rejectModalOpen" @close="rejectModalOpen = false">
            <div class="modal-surface-content">
                <div class="flex items-center gap-2">
                    <XCircleIcon class="modal-status-icon text-danger small-icon" />
                    <h3 class="modal-title">Specify Rejection Reason</h3>
                </div>
                <p class="modal-desc">Provide clear feedback to help the host operator adjust the submission criteria.
                </p>

                <div class="input-container mt-3">
                    <textarea v-model="rejectReason" rows="4" class="modal-textarea"
                        :class="{ 'input-error': rejectReasonError }" placeholder="Specify reasons..."></textarea>
                    <span v-if="rejectReasonError" class="validation-msg">Validation Warning: Rejection justification
                        text field
                        is required.</span>
                </div>

                <div class="modal-footer-actions mt-4">
                    <button @click="rejectModalOpen = false" class="btn-cancel">Cancel</button>
                    <button @click="submitReject" :disabled="processing" class="btn-confirm-reject">
                        {{ processing ? 'Rejecting...' : 'Confirm Rejection' }}
                    </button>
                </div>
            </div>
        </AppModal>

        <AppModal :open="pendingModalOpen" @close="pendingModalOpen = false">
            <div class="modal-surface-content text-center">
                <div class="icon-wrapper" style="background-color: #fef3c7;">
                    <QuestionMarkCircleIcon class="modal-status-icon" style="color: #d97706;" />
                </div>
                <div>
                    <h3 class="modal-title">Reset to Pending Queue?</h3>
                    <p class="modal-desc mt-2">Are you sure you want to move this property listing back to the pending
                        moderation queue?</p>
                </div>
                <div class="modal-footer-actions justify-center mt-4">
                    <button @click="pendingModalOpen = false" class="btn-cancel">Cancel</button>
                    <button @click="submitSetPending" :disabled="processing" class="btn-confirm-approve"
                        style="background-color: #d97706;">
                        {{ processing ? 'Processing...' : 'Yes, Set to Pending' }}
                    </button>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped>
/* --- Layout & Structure Styles --- */
.approval-container {
    padding: 0 var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--space-md);
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
}

.page-subtitle {
    font-size: 0.875rem;
    color: var(--color-muted);
    margin-top: var(--space-xs);
}

.counter-badge {
    background-color: var(--color-success-soft);
    color: var(--color-success);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
}

/* --- States Cards --- */
.state-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: var(--shadow-card);
}

.state-icon {
    width: 3.5rem;
    height: 3.5rem;
    margin-bottom: var(--space-md);
}

.text-danger {
    color: #ef4444;
}

.text-success {
    color: #10b981;
}

.text-muted {
    color: var(--color-muted);
}

.state-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
}

.state-desc {
    font-size: 0.875rem;
    color: var(--color-muted);
    margin-top: var(--space-xs);
    max-width: 26rem;
    line-height: 1.5;
}

.btn-retry {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
}

.spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 4px solid var(--color-primary-soft);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--space-sm);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* --- AppModal Content UI Styles --- */
.modal-surface-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-xs);
}

.text-center {
    text-align: center;
}

.justify-center {
    justify-content: center;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.gap-2 {
    gap: 0.5rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-3 {
    margin-top: 0.75rem;
}

.mt-4 {
    margin-top: 1rem;
}

.icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    margin: 0 auto var(--space-md) auto;
}

.confirmation-success {
    background-color: #ecfdf5;
}

.modal-status-icon {
    width: 3.5rem;
    height: 3.5rem;
}

.modal-status-icon.small-icon {
    width: 1.5rem;
    height: 1.5rem;
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
}

.modal-desc {
    font-size: 0.875rem;
    color: var(--color-muted);
    line-height: 1.5;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
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
    transition: border-color 0.2s;
}

.modal-textarea:focus {
    border-color: var(--color-primary);
}

.input-error {
    border-color: #ef4444;
}

.validation-msg {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
    text-align: left;
}

/* --- Buttons in Modals --- */
.modal-footer-actions {
    display: flex;
    gap: var(--space-sm);
}

.btn-cancel {
    background-color: transparent;
    color: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    padding: var(--space-sm) var(--space-lg);
    font-weight: 600;
}

.btn-cancel:hover {
    background-color: var(--color-surface-soft);
}

.btn-confirm-approve {
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-lg);
    font-weight: 600;
    cursor: pointer;
}

.btn-confirm-approve:hover {
    background-color: #059669;
}

.btn-confirm-reject {
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-lg);
    font-weight: 600;
    cursor: pointer;
}

.btn-confirm-reject:hover {
    background-color: #dc2626;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.table-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: 100%;
}
@media (max-width: 768px) {
    .table-actions-bar {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
