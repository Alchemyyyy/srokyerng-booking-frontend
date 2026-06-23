<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// ⚡ ផ្លាស់ប្តូរមកប្រើ Store ថ្មីជំនួស Composable ចាស់
import { useApprovalStore } from '../store/approval.store';
import DashboardHero from '../components/DashboardHero.vue';
import ApprovalFilter from '../components/ApprovalFilter.vue';
import ApprovalTable from '../components/ApprovalTable.vue';
import AppModal from '@/shared/components/AppModal.vue';
import AppLoading from '@/shared/components/LoadingSpinner.vue';
import ApprovalSearch from '../components/ApprovalSearch.vue';
import { ExclamationTriangleIcon, InboxIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { useSidebar } from '@/shared/composables/useSidebar';
import { useToastStore } from '@/shared/store/toastStore';

const router = useRouter();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

// ⚡ ហៅប្រើប្រាស់ Pinia Store 
const approvalStore = useApprovalStore();

const currentFilterStatus = ref(1); // បង្ហាញ Pending (status_id: 1) មុនគេពេលដំបូង
const searchKeyword = ref('');

const filteredProperties = computed(() => {
    let list = approvalStore.properties || [];

    // 1. Filter ស្វែងរកតាមពាក្យគន្លឹះ (Search)
    if (searchKeyword.value && searchKeyword.value.trim() !== '') {
        const query = searchKeyword.value.toLowerCase().trim();
        list = list.filter(item => {
            return (
                item.property_name?.toLowerCase().includes(query) ||
                item.owner?.owner_name?.toLowerCase().includes(query) ||   // ✅ ចូលទៅយក owner_name
                item.owner?.owner_email?.toLowerCase().includes(query) ||  // ✅ ចូលទៅយក owner_email
                item.address?.toLowerCase().includes(query) ||
                item.status?.status_name?.toLowerCase().includes(query)    // ✅ ចូលទៅយក status_name ("approved"/"pending")
            );
        });
    }

    // 2. Filter តាមផ្ទាំង Status (Tabs)
    if (currentFilterStatus.value !== undefined && currentFilterStatus.value !== null && currentFilterStatus.value !== '') {
        list = list.filter(item => {
            // ✅ ផ្ទៀងផ្ទាត់លេខ status_id នៅក្នុង Object status
            return Number(item.status?.status_id) === Number(currentFilterStatus.value);
        });
    }

    return list;
});

const emptyStateContent = computed(() => {
    if (searchKeyword.value !== '') {
        return { title: 'No Matching Results', desc: `We couldn't find any records matching "${searchKeyword.value}". Try checking your spelling.` };
    }

    switch (Number(currentFilterStatus.value)) {
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
    await approvalStore.fetchProperties();
});

const handleFilterUpdate = (newStatus) => {
    currentFilterStatus.value = newStatus;
};

const goToDetail = (id) => {
    router.push(`/admin/property-approvals/${id}`);
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

    const success = await approvalStore.handleApprove(currentApproveId.value);
    if (success) {
        approveModalOpen.value = false;
        currentApproveId.value = null;
        toastStore.success('The property listing has been approved successfully.', {
            title: 'Approval Successful',
            timeout: 4000
        });
        await approvalStore.fetchProperties(); // Refresh ទិន្នន័យថ្មីពី Server ចូល Store
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

    const success = await approvalStore.handleReject(currentRejectId.value, rejectReason.value);
    if (success) {
        rejectModalOpen.value = false;
        currentRejectId.value = null;
        toastStore.success('The submission listing request has been rejected.', {
            title: 'Property Rejected',
            timeout: 4000
        });
        await approvalStore.fetchProperties(); // Refresh ទិន្នន័យថ្មីពី Server ចូល Store
    } else {
        toastStore.danger('An error occurred while rejecting the property.', {
            title: 'Rejection Failed',
            timeout: 4000
        });
    }
};

const submitSetPending = async () => {
    if (!currentPendingId.value) return;

    const success = await approvalStore.handleSetPending(currentPendingId.value);
    if (success) {
        pendingModalOpen.value = false;
        currentPendingId.value = null;
        toastStore.success('Property status has been reset to Pending successfully.', {
            title: 'Status Updated',
            timeout: 4000
        });
        await approvalStore.fetchProperties(); // Refresh ទិន្នន័យថ្មីពី Server ចូល Store
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
        </div>

        <div class="table-actions-bar">
            <ApprovalFilter :model-value="currentFilterStatus" :all-properties="approvalStore.properties"
                @update:model-value="handleFilterUpdate" />
            <ApprovalSearch v-model="searchKeyword" />
        </div>

        <div v-if="approvalStore.error" class="state-card error-card">
            <ExclamationTriangleIcon class="state-icon text-danger" />
            <div class="state-content">
                <h3 class="state-title">Data Fetching Interrupted</h3>
                <p class="state-desc">{{ approvalStore.error }}</p>
                <button @click="approvalStore.fetchProperties" class="btn-retry">Try Reconnecting</button>
            </div>
        </div>

        <div v-else-if="approvalStore.loading" class="state-card loading-card py-24">
            <AppLoading label="Synchronizing property database..." />
        </div>

        <template v-else>
            <ApprovalTable v-if="filteredProperties.length > 0" :items="filteredProperties"
                :is-processing="approvalStore.processing" @approve="openApproveModal" @reject="openRejectModal"
                @row-click="goToDetail" @change-status-click="handleDropdownStatusSelection" />

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
                    <button @click="submitApprove" :disabled="approvalStore.processing"
                        class="btn-confirm-approve min-w-120px flex items-center justify-center">
                        <AppLoading v-if="approvalStore.processing" label="Publishing..." class="text-white" />
                        <span v-else>Yes, Approve</span>
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
                    <button @click="submitReject" :disabled="approvalStore.processing"
                        class="btn-confirm-reject min-w-150px flex items-center justify-center">
                        <AppLoading v-if="approvalStore.processing" label="Rejecting..." class="text-white" />
                        <span v-else>Confirm Rejection</span>
                    </button>
                </div>
            </div>
        </AppModal>

        <AppModal :open="pendingModalOpen" @close="pendingModalOpen = false">
            <div class="modal-surface-content text-center">
                <div class="icon-wrapper" style="background-color: var(--color-warning-soft);">
                    <QuestionMarkCircleIcon class="modal-status-icon" style="color: var(--color-warning);" />
                </div>
                <div>
                    <h3 class="modal-title">Reset to Pending Queue?</h3>
                    <p class="modal-desc mt-2">Are you sure you want to move this property listing back to the pending
                        moderation queue?</p>
                </div>
                <div class="modal-footer-actions justify-center mt-4">
                    <button @click="pendingModalOpen = false" class="btn-cancel">Cancel</button>
                    <button @click="submitSetPending" :disabled="approvalStore.processing"
                        class="btn-confirm-approve min-w-160px flex items-center justify-center"
                        style="background-color: var(--color-warning);">
                        <AppLoading v-if="approvalStore.processing" label="Processing..." class="text-white" />
                        <span v-else>Yes, Set to Pending</span>
                    </button>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped>
/* រក្សាទុក CSS ចាស់ទាំងអស់ដដែល... */
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
    color: var(--color-danger);
}

.text-success {
    color: var(--color-success);
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
    background-color: var(--color-success-soft);
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
    border-color: var(--color-danger);
}

.validation-msg {
    font-size: 0.75rem;
    color: var(--color-danger);
    font-weight: 500;
    text-align: left;
}

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
    background-color: var(--color-success);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-lg);
    font-weight: 600;
    cursor: pointer;
}

.btn-confirm-approve:hover {
    opacity: 0.9;
}

.btn-confirm-reject {
    background-color: var(--color-danger);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-lg);
    font-weight: 600;
    cursor: pointer;
}

.btn-confirm-reject:hover {
    opacity: 0.9;
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
