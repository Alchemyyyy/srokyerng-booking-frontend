<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ownerPaymentApi } from "@/modules/payments/api/ownerPayment.api.js";
import { useToastStore } from "@/shared/store/toastStore";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import defaultReceipt from "@/assets/images/default/default_receipt.png";
import { useSidebar } from "@/shared/composables/useSidebar";
import {
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon,
    ShieldCheckIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

const loading = ref(true);
const actionLoading = ref(false);
const error = ref("");
const reservation = ref(null);

// បំបែកការបង្ហាញ Input និងការចាប់ Reason ឱ្យដាច់ពីគ្នារវាង Payment និង Refund
const showRejectPaymentInput = ref(false);
const showRejectRefundInput = ref(false);

const paymentRejectReason = ref("");
const refundRejectReason = ref("");
const isImageViewerOpen = ref(false);

const refundId = ref(null);
const paymentId = ref(null);

// មុខងារកែច្នៃទិន្នន័យ (Data Normalization) ឱ្យត្រូវនឹង Key របស់ API
const normalizeReservationItem = (refundData, paymentData) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const backendDomain = apiBaseUrl.replace(/\/api$/, "");

    const getFullImageUrl = (urlPath) => {
        if (!urlPath) return null;
        if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) return urlPath;
        return `${backendDomain}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
    };

    let calculatedNights = paymentData.total_nights || 0;
    if (!calculatedNights && paymentData.check_in_date) {
        const checkIn = new Date(paymentData.check_in_date);
        const checkOut = new Date(paymentData.check_out_date);
        calculatedNights = Math.ceil(
            Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24),
        );
    }

    return {
        id: paymentData.reservation_id || "-",
        refundId: refundData?.id || null,
        customerPaymentId: paymentData.id,

        guestName: paymentData.customer_name || "Unknown guest",
        guestEmail: paymentData.customer_email || "N/A",
        guestPhone: paymentData.customer_phone || "N/A",

        propertyName: paymentData.property_name || "Unknown property",
        roomName: paymentData.room_name || "N/A",
        totalNights: calculatedNights,

        amount: Number(paymentData.amount || 0),
        currency: paymentData.currency || "USD",
        paymentMethod: paymentData.payment_method || "N/A",
        paymentStatus: String(paymentData.payment_status || "").toLowerCase(),

        // បន្ថែមការចាប់យក Status របស់ Reservation រួមជាមួយ Cancellation Reason ពី API
        reservationStatus: paymentData.reservation_status ? String(paymentData.reservation_status).toLowerCase() : null,
        cancellationReason: paymentData.cancellation_reason || paymentData.cancellation_note || null,

        checkIn: paymentData.check_in_date || "-",
        checkOut: paymentData.check_out_date || "-",
        txRef: paymentData.transaction_reference || "N/A",
        payment_proof_url: getFullImageUrl(paymentData.receipt_image_url),

        // Payment rejected by owner
        rejectionReason: paymentData.rejection_reason || null,

        // Refund fields
        refundStatus: refundData?.refund_status ? String(refundData.refund_status).toLowerCase() : null,
        refundAmount: Number(refundData?.refund_amount ?? refundData?.amount ?? paymentData?.amount ?? 0),
        refundReason: refundData?.reason || refundData?.refund_reason || null,
        decisionNote: refundData?.decision_note || null,
        createdAt: refundData?.requested_at || paymentData.created_at || null,
    };
};

const fetchPaymentDetails = async () => {
    loading.value = true;
    error.value = "";
    try {
        const paymentResponse = await ownerPaymentApi.getPaymentDetails(route.params.id);
        const paymentData = paymentResponse?.data?.data || paymentResponse?.data || paymentResponse;

        if (!paymentData) {
            error.value = "Payment record not found.";
            toastStore.danger("Payment record not found.");
            return;
        }

        paymentId.value = paymentData.id;

        let refundData = null;
        try {
            const refundListResponse = await ownerPaymentApi.listRefundRequests();
            const rawList = refundListResponse?.data?.data || refundListResponse?.data || [];

            const matched = rawList.find(
                (r) => Number(r.payment_id) === Number(paymentData.id),
            );

            if (matched) {
                const refundDetailRes = await ownerPaymentApi.getRefundRequestDetails(matched.id);
                refundData = refundDetailRes?.data?.data || refundDetailRes?.data || null;
                refundId.value = refundData?.id || null;
            }
        } catch (refundErr) {
            console.error("❌ Refund fetch error:", refundErr);
        }

        reservation.value = normalizeReservationItem(refundData || {}, paymentData);
    } catch (err) {
        error.value = err.response?.data?.message || err.message || "Failed to load details.";
        toastStore.danger(error.value);
    } finally {
        loading.value = false;
    }
};

const handleApprovePayment = async () => {
    if (!paymentId.value) return;
    actionLoading.value = true;
    try {
        await ownerPaymentApi.verifyPayment(paymentId.value);
        toastStore.success("Payment verified successfully!", { title: "Approved" });
        await fetchPaymentDetails();
    } catch (err) {
        toastStore.danger(err.response?.data?.message || "Failed to verify payment");
    } finally {
        actionLoading.value = false;
    }
};

const handleRejectPayment = async () => {
    if (!paymentRejectReason.value.trim()) {
        toastStore.warning("Please enter a rejection reason.", { title: "Validation Error" });
        return;
    }
    if (!paymentId.value) return;
    actionLoading.value = true;
    try {
        await ownerPaymentApi.rejectPayment(paymentId.value, {
            rejection_reason: paymentRejectReason.value.trim()
        });
        toastStore.warning("Payment has been rejected.", { title: "Rejected" });
        showRejectPaymentInput.value = false;
        await fetchPaymentDetails();
    } catch (err) {
        toastStore.danger(err.response?.data?.message || "Failed to reject payment");
    } finally {
        actionLoading.value = false;
    }
};

const handleApproveRefund = async () => {
    if (!refundId.value) return;
    actionLoading.value = true;
    try {
        await ownerPaymentApi.approveRefund(refundId.value);
        toastStore.success("Refund request approved successfully!", { title: "Approved" });
        router.back();
    } catch (err) {
        console.error("Approve error:", err);
        toastStore.danger(err.response?.data?.message || "Failed to approve refund");
    } finally {
        actionLoading.value = false;
    }
};

const handleRejectRefund = async () => {
    if (!refundRejectReason.value.trim()) {
        toastStore.warning("Please enter a reason for rejecting this refund request.", { title: "Validation Error" });
        return;
    }
    if (!refundId.value) return;
    actionLoading.value = true;
    try {
        await ownerPaymentApi.rejectRefund(refundId.value, {
            decision_note: refundRejectReason.value.trim(),
        });
        toastStore.warning("Refund request has been rejected.", { title: "Rejected" });
        showRejectRefundInput.value = false;
        router.back();
    } catch (err) {
        console.error("Rejection error:", err);
        toastStore.danger(err.response?.data?.message || "Failed to reject refund");
    } finally {
        actionLoading.value = false;
    }
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case "requested":
        case "pending":
        case "submitted":
        case "confirmed":
            return "bg-amber-500/10 border-amber-500/20 text-amber-600";
        case "approved":
        case "refunded":
        case "verified":
        case "completed":
            return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
        case "rejected":
        case "failed":
        case "cancelled":
            return "bg-rose-500/10 border-rose-500/20 text-rose-600";
        default:
            return "bg-gray-500/10 border-gray-500/20 text-gray-500";
    }
};

onMounted(fetchPaymentDetails);
</script>

<template>
    <main class="owner-payment-details space-y-6 my-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <header class="mb-6 flex items-center pb-4">
            <button @click="router.back()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-(--color-surface) border border-(--color-border) rounded-xl text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer shadow-sm">
                <ArrowLeftIcon class="w-4 h-4" />
                <span>Back to List</span>
            </button>
        </header>

        <OwnerLoadingState v-if="loading" label="Loading transaction records..." />

        <div v-else-if="error"
            class="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-center font-bold text-sm">
            {{ error }}
        </div>

        <div v-else-if="reservation" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div
                class="lg:col-span-7 space-y-6 bg-(--color-surface) rounded-2xl border border-(--color-border) p-6 shadow-sm">
                <div class="space-y-3">
                    <span
                        class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5">Guest
                        Information</span>
                    <div
                        class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)">
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Full Name</span>
                            <span class="font-bold text-(--color-text) text-sm">{{ reservation.guestName }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Phone Number</span>
                            <span class="font-semibold text-(--color-primary) text-sm">{{ reservation.guestPhone
                                }}</span>
                        </div>
                        <div class="overflow-hidden">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Email
                                Address</span>
                            <span class="font-medium text-(--color-text) text-sm truncate block"
                                :title="reservation.guestEmail">{{ reservation.guestEmail }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <span
                        class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5">Stay
                        Details</span>
                    <div
                        class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)">
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Property
                                Name</span>
                            <span class="font-bold text-(--color-text) text-sm truncate block">{{
                                reservation.propertyName }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Room</span>
                            <span class="font-semibold text-(--color-text) text-sm">{{ reservation.roomName }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Duration</span>
                            <span class="font-bold text-(--color-primary) text-sm">{{ reservation.totalNights }}
                                Night(s)</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Check-in
                                Date</span>
                            <span class="font-medium text-(--color-text) text-xs">{{ formatDate(reservation.checkIn)
                                }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Check-out
                                Date</span>
                            <span class="font-medium text-(--color-text) text-xs">{{ formatDate(reservation.checkOut)
                                }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <span
                        class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5">Financial
                        Audit</span>
                    <div
                        class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)">
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Amount
                                Requested</span>
                            <span class="font-black text-(--color-success) text-lg">
                                {{ reservation.currency === "USD" ? "$" : "" }}{{ reservation.amount.toFixed(2) }}
                                {{ reservation.currency !== "USD" ? reservation.currency : "" }}
                            </span>
                        </div>
                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Payment
                                Method</span>
                            <span class="font-bold text-(--color-text) text-sm mt-1 block">{{ reservation.paymentMethod
                                }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Booking ID</span>
                            <span class="font-mono text-xs font-bold text-(--color-primary)">#{{ reservation.id
                                }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Transaction
                                Reference</span>
                            <span
                                class="font-mono text-xs text-(--color-text) bg-(--color-surface) px-2 py-1 rounded border border-(--color-border) mt-1 block truncate select-all">
                                {{ reservation.txRef || "N/A" }}
                            </span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Requested At</span>
                            <span class="font-medium text-(--color-muted) text-xs">{{ formatDate(reservation.createdAt)
                                }}</span>
                        </div>

                        <div>
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Payment
                                Status</span>
                            <span class="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded border mt-1"
                                :class="getStatusBadgeClass(reservation.paymentStatus)">
                                {{ reservation.paymentStatus || 'N/A' }}
                            </span>
                        </div>
                        <div v-if="reservation.reservationStatus">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Reservation
                                Status</span>
                            <span class="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded border mt-1"
                                :class="getStatusBadgeClass(reservation.reservationStatus)">
                                {{ reservation.reservationStatus }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="reservation.refundReason || reservation.decisionNote || reservation.rejectionReason || reservation.reservationStatus === 'cancelled' || reservation.cancellationReason"
                    class="space-y-4 pt-4 border-t border-(--color-border)">

                    <div v-if="reservation.refundReason" class="space-y-2">
                        <span class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block">Customer
                            Refund Request Reason</span>
                        <div class="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                            <p class="text-sm font-semibold text-(--color-text)">" {{ reservation.refundReason }} "</p>
                        </div>
                    </div>

                    <div v-if="reservation.decisionNote" class="space-y-2">
                        <span class="text-xs font-bold text-rose-600 tracking-wider block uppercase">Refund Rejection
                            Reason (Owner Decision)</span>
                        <div class="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                            <p class="text-sm font-bold text-rose-700">" {{ reservation.decisionNote }} "</p>
                        </div>
                    </div>

                    <div v-if="reservation.rejectionReason && reservation.paymentStatus === 'failed'" class="space-y-2">
                        <span class="text-xs font-bold text-red-600 uppercase tracking-wider block">Payment Rejection
                            Reason</span>
                        <div class="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                            <p class="text-sm font-bold text-red-700">" {{ reservation.rejectionReason }} "</p>
                        </div>
                    </div>

                    <div v-if="reservation.reservationStatus === 'cancelled' || reservation.cancellationReason"
                        class="space-y-2">
                        <span class="text-xs font-bold text-rose-600 uppercase tracking-wider block">Cancellation
                            Reason</span>
                        <div class="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                            <p class="text-sm font-bold text-rose-700">
                                " {{ reservation.cancellationReason ||
                                    'No details provided / លុបចោលដោយប្រព័ន្ធឬមិនមានបញ្ជាក់មូលហេតុ' }} "
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="showRejectPaymentInput" class="space-y-2 pt-4 border-t border-(--color-border)">
                    <label class="text-xs font-bold text-rose-600 block">Reason for Rejection Payment *</label>
                    <textarea v-model="paymentRejectReason"
                        placeholder="State the reason why you reject this payment..."
                        class="w-full border border-(--color-border) rounded-xl p-3 text-sm bg-(--color-surface-soft) text-(--color-text) focus:outline-none focus:border-rose-500 resize-none placeholder-(--color-muted)"
                        rows="3" :disabled="actionLoading"></textarea>
                </div>

                <div v-if="showRejectRefundInput" class="space-y-2 pt-4 border-t border-(--color-border)">
                    <label class="text-xs font-bold text-rose-600 block">Reason for Rejection Refund *</label>
                    <textarea v-model="refundRejectReason"
                        placeholder="State the reason why you reject this refund request..."
                        class="w-full border border-(--color-border) rounded-xl p-3 text-sm bg-(--color-surface-soft) text-(--color-text) focus:outline-none focus:border-rose-500 resize-none placeholder-(--color-muted)"
                        rows="3" :disabled="actionLoading"></textarea>
                </div>
            </div>

            <div
                class="lg:col-span-5 space-y-3 bg-(--color-surface) rounded-2xl border border-(--color-border) p-6 shadow-sm h-full flex flex-col">
                <span
                    class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block border-b border-(--color-border) pb-1.5">Customer
                    Submitted Proof</span>

                <div
                    class="border border-(--color-border) rounded-xl p-3 bg-white flex justify-center items-center flex-grow min-h-[360px] shadow-inner relative group overflow-hidden">
                    <img v-if="reservation.payment_proof_url" :src="reservation.payment_proof_url" alt="Payment Proof"
                        class="max-w-full h-auto max-h-[420px] object-contain rounded-lg shadow-sm cursor-zoom-in transition transform hover:scale-[1.02] duration-300"
                        @click="isImageViewerOpen = true" title="Click to view full image" />

                    <div v-else class="text-center p-8">
                        <img :src="defaultReceipt" alt="Placeholder graphic"
                            class="h-full w-full object-contain opacity-70" />
                    </div>
                </div>

                <div
                    class="flex items-start gap-3 p-3.5 rounded-2xl border border-(--color-border)/50 bg-(--color-surface-soft)/40">
                    <ShieldCheckIcon class="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-wider text-(--color-muted)">Verification
                            Note</p>
                        <p class="text-sm font-bold text-(--color-text) mt-0.5">Only accept clear and valid payment
                            proof showing transaction details.</p>
                    </div>
                </div>

                <div v-if="isImageViewerOpen && reservation.payment_proof_url"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    @click="isImageViewerOpen = false">
                    <button @click="isImageViewerOpen = false"
                        class="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition cursor-pointer z-50">
                        <XMarkIcon class="w-6 h-6" />
                    </button>
                    <img :src="reservation.payment_proof_url" alt="Full Payment Proof"
                        class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-zoom-out" />
                </div>
            </div>
        </div>

        <section v-if="reservation"
            class="mt-6 flex items-center justify-end gap-3 bg-(--color-surface) border border-(--color-border) p-4 rounded-2xl shadow-sm">

            

            <template v-if="reservation.paymentStatus === 'submitted'">
                <template v-if="showRejectPaymentInput">
                    <button type="button" @click="showRejectPaymentInput = false" :disabled="actionLoading"
                        class="px-5 py-2.5 border border-(--color-border) rounded-xl text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) cursor-pointer transition">
                        Back
                    </button>
                    <button type="button" @click="handleRejectPayment"
                        :disabled="!paymentRejectReason.trim() || actionLoading"
                        class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50 cursor-pointer transition flex items-center gap-1.5">
                        <LoadingSpinner v-if="actionLoading" label="Rejecting..." class="text-white text-xs" />
                        <span v-else>Confirm Reject Payment</span>
                    </button>
                </template>

                <template v-else>
                    <button type="button" @click="showRejectPaymentInput = true" :disabled="actionLoading"
                        class="inline-btn px-5 py-2.5 border border-rose-500/50 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl text-xs cursor-pointer transition">
                        Reject Payment
                    </button>
                    <button type="button" @click="handleApprovePayment" :disabled="actionLoading"
                        class="inline-btn px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition flex items-center gap-1.5">
                        <LoadingSpinner v-if="actionLoading" label="Approving..." class="text-white text-xs" />
                        <template v-else>
                            <CheckIcon class="w-4 h-4" />
                            <span>Confirm Payment</span>
                        </template>
                    </button>
                </template>
            </template>

            <template v-else-if="reservation.refundStatus === 'requested'">
                <div class="mr-auto flex items-center gap-2">
                    <span class="text-xs font-bold text-(--color-muted) uppercase tracking-wider block">Refund
                        Amount</span>
                    <div class="bg-emerald-500/5 rounded-xl border border-emerald-500/10 px-4 py-2">
                        <p class="text-sm font-bold text-emerald-700">${{ reservation.refundAmount.toFixed(2) }}</p>
                    </div>
                </div>

                <template v-if="showRejectRefundInput">
                    <button type="button" @click="showRejectRefundInput = false" :disabled="actionLoading"
                        class="px-5 py-2.5 border border-(--color-border) rounded-xl text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) cursor-pointer transition">
                        Back
                    </button>
                    <button type="button" @click="handleRejectRefund"
                        :disabled="!refundRejectReason.trim() || actionLoading"
                        class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50 cursor-pointer transition flex items-center gap-1.5">
                        <LoadingSpinner v-if="actionLoading" label="Rejecting..." class="text-white text-xs" />
                        <span v-else>Confirm Reject Refund</span>
                    </button>
                </template>

                <template v-else>
                    <button type="button" @click="showRejectRefundInput = true" :disabled="actionLoading"
                        class="inline-btn px-5 py-2.5 border border-rose-500/50 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl text-xs cursor-pointer transition">
                        Reject Refund
                    </button>
                    <button type="button" @click="handleApproveRefund" :disabled="actionLoading"
                        class="inline-btn px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition flex items-center gap-1.5">
                        <LoadingSpinner v-if="actionLoading" label="Approving..." class="text-white text-xs" />
                        <template v-else>
                            <CheckIcon class="w-4 h-4" />
                            <span>Approve Refund</span>
                        </template>
                    </button>
                </template>
            </template>

            <template v-else>
                <div
                    class="flex items-center gap-4 text-sm font-medium px-4 py-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft)">
                    <div class="flex items-center gap-1.5">
                        <span class="text-(--color-muted)">Payment:</span>
                        <span class="font-bold uppercase px-2 py-0.5 rounded border text-xs"
                            :class="getStatusBadgeClass(reservation.paymentStatus)">
                            {{ reservation.paymentStatus || 'N/A' }}
                        </span>
                    </div>
                    <div v-if="reservation.reservationStatus"
                        class="flex items-center gap-1.5 border-l border-(--color-border) pl-4">
                        <span class="text-(--color-muted)">Reservation:</span>
                        <span class="font-bold uppercase px-2 py-0.5 rounded border text-xs"
                            :class="getStatusBadgeClass(reservation.reservationStatus)">
                            {{ reservation.reservationStatus }}
                        </span>
                    </div>
                </div>
            </template>
        </section>
    </main>
</template>

<style scoped>
.owner-payment-details {
    font-family: var(--font-main);
    background-color: var(--color-page);
    color: var(--color-text);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.inline-btn {
    padding: var(--space-sm) var(--space-sm);
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}
</style>