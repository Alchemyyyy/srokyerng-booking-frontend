<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import AppTable from "../components/OwnerVerfivationTable.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import PaymentFilterBar from "@/modules/payments/components/PaymentFilterBar.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppPagination from "../components/TablePagination.vue";

import { useOwnerPaymentStore } from "../store/ownerPayment.store";
import { ShieldCheckIcon, CheckIcon, XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import { useSidebar } from "@/shared/composables/useSidebar";

const router = useRouter();
const { isSidebarOpen } = useSidebar();

// Connect Pinia Store Setup Engine
const paymentStore = useOwnerPaymentStore();
const {
    loading,
    actionLoading,
    error,
    activeModule,
    refundRequests,
    currentTab,
    currentPage,
    stats,
    tabCounts,
    filteredItems,
    paginatedItems,
    totalPages
} = storeToRefs(paymentStore);

// Keep Modal & View Specific Local Context Here
const isRejectModalOpen = ref(false);
const isApproveModalOpen = ref(false);
const selectedItem = ref(null);
const rejectNoteText = ref("");

const reservationColumns = [
    { key: "guestName", label: "Guest Info" },
    { key: "propertyName", label: "Property & Room" },
    { key: "amount", label: "Amount" },
    { key: "checkIn", label: "Stay Period" },
    { key: "status", label: "Payment Status" },
    { key: "reservation_status", label: "Reservation Status" },
    { key: "action", label: "Actions" },
];

const refundColumns = [
    { key: "id", label: "Refund ID" },
    { key: "customer_name", label: "Guest Info" },
    { key: "property_name", label: "Property & Room" },
    { key: "amount", label: "Refund Amount" },
    { key: "reason", label: "Reason" },
    { key: "refund_status", label: "Status" },
    { key: "action", label: "Actions" },
];

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const openReview = (row) => {
    if (activeModule.value === 'payments') {
        router.push({ path: "reservations/" + (row.customerPaymentId || row.id) });
    } else {
        router.push({ path: "reservations/" + row.payment_id });
    }
};

/* --- APPROVAL FLOWS --- */
const triggerApproveModal = (row) => {
    selectedItem.value = row;
    isApproveModalOpen.value = true;
};

const closeApproveModal = () => {
    isApproveModalOpen.value = false;
    selectedItem.value = null;
};

const handleConfirmApprove = async () => {
    if (!selectedItem.value) return;
    let success = false;
    if (activeModule.value === 'payments') {
        success = await paymentStore.verifyPayment(selectedItem.value.customerPaymentId);
    } else {
        success = await paymentStore.approveRefund(selectedItem.value.id);
    }
    if (success) closeApproveModal();
};

/* --- REJECTION FLOWS --- */
const triggerRejectModal = (row) => {
    selectedItem.value = row;
    rejectNoteText.value = "";
    isRejectModalOpen.value = true;
};

const closeRejectModal = () => {
    isRejectModalOpen.value = false;
    selectedItem.value = null;
    rejectNoteText.value = "";
};

const handleConfirmReject = async () => {
    if (!rejectNoteText.value || !rejectNoteText.value.trim()) {
        actionLoading.value = true;
        setTimeout(() => { actionLoading.value = false; }, 2000);
        return;
    }
    let success = false;
    if (activeModule.value === 'payments') {
        success = await paymentStore.rejectPayment(selectedItem.value.customerPaymentId, rejectNoteText.value.trim());
    } else {
        success = await paymentStore.rejectRefund(selectedItem.value.id, rejectNoteText.value.trim());
    }
    if (success) closeRejectModal();
};

onMounted(paymentStore.loadData);
</script>

<template>
    <main class="owner-payments space-y-6 my-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-(--color-text)">Financial Ledger</h1>
                <p class="mt-1 text-sm text-(--color-muted)">Audit customer incoming payments and handle client refund
                    requests.</p>
            </div>

            <button type="button"
                class="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-(--color-text) transition hover:bg-(--color-input)/50 shadow-sm cursor-pointer"
                :disabled="loading" @click="paymentStore.loadData">
                <LoadingSpinner v-if="loading" class="h-4 w-4" />
                <span>Refresh Data</span>
            </button>
        </header>

        <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Confirmed
                    Earnings</span>
                <h3 class="mt-1 text-2xl font-bold text-(--color-text)">${{ formatCurrency(stats.totalEarnings) }}</h3>
            </div>
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Total Records</span>
                <h3 class="mt-1 text-2xl font-bold text-(--color-text)">{{ stats.totalBookings }}</h3>
            </div>
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Awaiting
                    Verification</span>
                <h3 class="mt-1 text-2xl font-bold text-amber-500">{{ stats.pendingCount }}</h3>
            </div>
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Pending Refunds</span>
                <h3 class="mt-1 text-2xl font-bold text-rose-500">{{ stats.pendingRefunds }}</h3>
            </div>
        </section>

        <div class="flex items-center border-b border-(--color-border) gap-6 mb-2">
            <button @click="paymentStore.switchModule('payments')"
                :class="['pb-3 text-sm font-bold border-b-2 transition cursor-pointer', activeModule === 'payments' ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-muted)']">
                Incoming Verification Receipts
            </button>
            <button @click="paymentStore.switchModule('refunds')"
                :class="['pb-3 text-sm font-bold border-b-2 transition cursor-pointer', activeModule === 'refunds' ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-muted)']">
                Refund Requests ({{ refundRequests.length }})
            </button>
        </div>

        <section class="mb-6">
            <PaymentFilterBar :modelValue="currentTab" @update:modelValue="(val) => currentTab = val"
                :counts="tabCounts" />
        </section>

        <section class="space-y-4 bg-(--color-surface) rounded-2xl border border-(--color-border) p-4 shadow-sm">
            <div v-if="error"
                class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{{ error }}
            </div>
            <div v-if="loading" class="rounded-xl px-5 py-10 text-center text-(--color-muted)">Loading comprehensive
                data records...</div>
            <div v-else-if="filteredItems.length === 0" class="rounded-xl px-5 py-10 text-center text-(--color-muted)">
                No entries match the current selection filters.
            </div>

            <template v-else>
                <AppTable :columns="activeModule === 'payments' ? reservationColumns : refundColumns"
                    :rows="paginatedItems" :is-processing="actionLoading" :active-module="activeModule"
                    @approve="triggerApproveModal" @reject="triggerRejectModal" @row-click="openReview">

                    <template #cell-guestName="{ row }">
                        <div class="flex flex-col text-sm">
                            <span class="font-bold text-(--color-text)">{{ row.guestName }}</span>
                            <span class="text-xs text-(--color-muted)">{{ row.guestPhone }}</span>
                        </div>
                    </template>

                    <template #cell-customer_name="{ row }">
                        <div class="flex flex-col text-sm">
                            <span class="font-bold text-(--color-text)">{{ row.customer_name }}</span>
                            <span class="text-xs text-(--color-muted)">Payment reference: #{{ row.payment_id }}</span>
                        </div>
                    </template>

                    <template #cell-propertyName="{ row }">
                        <div class="flex flex-col text-sm">
                            <span class="font-semibold text-(--color-text)">{{ row.propertyName }}</span>
                            <span class="text-xs text-(--color-muted)">Room: {{ row.roomName }}</span>
                        </div>
                    </template>
                    <template #cell-property_name="{ row }">
                        <div class="flex flex-col text-sm">
                            <span class="font-semibold text-(--color-text)">{{ row.property_name }}</span>
                            <span class="text-xs text-(--color-muted)">Room: {{ row.room_name }}</span>
                        </div>
                    </template>

                    <template #cell-amount="{ value }">
                        <span class="font-bold"
                            :class="activeModule === 'refunds' ? 'text-rose-600' : 'text-(--color-text)'">
                            ${{ formatCurrency(value) }}
                        </span>
                    </template>

                    <template #cell-reason="{ value }">
                        <span class="text-sm text-(--color-text)">{{ value || 'No reason specified' }}</span>
                    </template>

                    <template #cell-status="{ value }">
                        <span
                            class="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border text-center"
                            :class="[
                                ['confirmed', 'paid', 'completed'].includes(value) ? 'border-(--color-success) bg-(--color-success) text-white' : '',
                                ['cancelled', 'failed'].includes(value) ? 'border-(--color-danger) bg-(--color-danger) text-white' : '',
                                value === 'submitted' ? 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)' : '',
                                value === 'refunded' ? 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)' : '',
                                value === 'pending' ? 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)' : ''
                            ]">
                            {{ value }}
                        </span>
                    </template>

                    <template #cell-reservation_status="{ value }">
                        <span
                            class="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border text-center"
                            :class="[
                                ['confirmed', 'active'].includes(value) ? 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)' : '',
                                ['cancelled', 'rejected'].includes(value) ? 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)' : '',
                                ['pending', 'hold'].includes(value) ? 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)' : '',
                                value === 'completed' ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : ''
                            ]">
                            {{ value }}
                        </span>
                    </template>

                    <template #cell-refund_status="{ value }">
                        <span
                            class="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border"
                            :class="[
                                value === 'approved' ? 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)' : '',
                                value === 'rejected' ? 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)' : '',
                                ['pending', 'requested'].includes(value) ? 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)' : '',
                            ]">
                            {{ value }}
                        </span>
                    </template>

                    <template #cell-checkIn="{ row }">
                        <div class="flex flex-col text-sm">
                            <span class="text-(--color-text)">{{ formatDate(row.checkIn) }}</span>
                            <span v-if="row.checkOut" class="text-[11px] text-(--color-muted)">to {{
                                formatDate(row.checkOut) }}</span>
                        </div>
                    </template>

                    <template #cell-action="{ row }">
                        <template v-if="activeModule === 'payments'">
                            <span v-if="!['submitted', 'pending'].includes(row.status)"
                                class="text-xs text-(--color-muted) italic px-2">Processed</span>
                        </template>
                        <template v-else-if="activeModule === 'refunds'">
                            <span v-if="!['pending', 'requested'].includes(row.refund_status)"
                                class="text-xs text-(--color-muted) italic px-2">Decision Logged</span>
                        </template>
                    </template>
                </AppTable>

                <AppPagination v-model="currentPage" :totalPages="totalPages"
                    class="mt-12 border-t border-(--color-border)/40 pt-8" />
            </template>
        </section>

        <AppModal :title="activeModule === 'payments' ? 'Confirm Payment' : 'Approve Refund'" :open="isApproveModalOpen"
            @close="closeApproveModal">
            <div class="modal-surface-content text-center pt-2">
                <div class="icon-wrapper confirmation-success">
                    <CheckCircleIcon class="modal-status-icon text-(--color-success)" />
                </div>
                <div>
                    <h3 class="modal-title">{{ activeModule === 'payments' ? 'Confirm' : 'Approve' }} {{ activeModule
                        ===
                        'payments' ? 'PaymentReceipt' : 'Listing Refund' }}</h3>
                    <p class="modal-desc mt-2">Are you sure you want to {{ activeModule === 'payments' ? 'confirm' :
                        'approve'
                        }} and publish this financial audit request to the platform live transaction records?</p>
                </div>
                <div class="modal-footer-actions justify-center mt-4">
                    <button type="button" @click="closeApproveModal" :disabled="actionLoading"
                        class="btn-cancel">Cancel</button>
                    <button type="button" @click="handleConfirmApprove" :disabled="actionLoading"
                        class="btn-confirm-approve min-w-120px flex items-center justify-center">
                        <LoadingSpinner v-if="actionLoading" class="h-4 w-4 text-white" />
                        <span v-else>Yes, {{ activeModule === 'payments' ? 'Confirm' : 'Approve' }}</span>
                    </button>
                </div>
            </div>
        </AppModal>

        <AppModal :title="activeModule === 'payments' ? 'Reject Payment' : 'Reject Refund'" :open="isRejectModalOpen"
            @close="closeRejectModal">
            <div class="modal-surface-content">
                <div class="flex items-center gap-2">
                    <XCircleIcon class="modal-status-icon text-danger small-icon" />
                    <h3 class="modal-title">Specify Rejection Reason</h3>
                </div>
                <p class="modal-desc">Provide clear feedback to help the user understand the cancellation or rejection
                    criteria.
                </p>

                <div class="input-container mt-3">
                    <textarea v-model="rejectNoteText" rows="4" class="modal-textarea"
                        :class="{ 'input-error': !rejectNoteText.trim() && actionLoading }"
                        placeholder="Specify reasons..."></textarea>
                    <span v-if="!rejectNoteText.trim() && actionLoading" class="validation-msg">Validation Warning:
                        Rejection
                        justification text field is required.</span>
                </div>

                <div class="modal-footer-actions mt-4">
                    <button type="button" @click="closeRejectModal" :disabled="actionLoading"
                        class="btn-cancel">Cancel</button>
                    <button type="button" @click="handleConfirmReject" :disabled="actionLoading"
                        class="btn-confirm-reject min-w-150px flex items-center justify-center">
                        <LoadingSpinner v-if="actionLoading" class="h-4 w-4 text-white" />
                        <span v-else>Confirm Rejection</span>
                    </button>
                </div>
            </div>
        </AppModal>
    </main>
</template>

<style scoped>
/* Styles remain untouched */
.owner-payments {
    font-family: var(--font-main);
    background-color: var(--color-page);
    color: var(--color-text);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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

.min-w-120px {
    min-width: 120px;
}

.min-w-150px {
    min-width: 150px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>