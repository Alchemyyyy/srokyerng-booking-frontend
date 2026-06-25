//OwnerPaymentDetailView.vue
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ownerPaymentApi } from "@/modules/payments/api/ownerPayment.api.js";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import defaultReceipt from '@/assets/images/default/default_receipt.png';
import { useSidebar } from "@/shared/composables/useSidebar";
import { ArrowLeftIcon, CheckIcon, XMarkIcon, ShieldCheckIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

const loading = ref(true);
const actionLoading = ref(false);
const error = ref("");
const reservation = ref(null);
const rejectReason = ref('');
const RejectInput = ref(false);
const isImageViewerOpen = ref(false);

const normalizeReservationItem = (item) => {
    // ចាប់យក Base URL របស់ Backend (ឧទាហរណ៍៖ http://localhost:5000)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const backendDomain = apiBaseUrl.replace(/\/api$/, ""); // ដកពាក្យ /api ចេញពីខាងចុង

    // បង្កើតអនុគមន៍ជំនួយសម្រាប់តភ្ជាប់ Path រូបភាព
    const getFullImageUrl = (urlPath) => {
        if (!urlPath) return null;
        if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) return urlPath;
        // ប្រសិនបើ urlPath មិនទាន់មាន "/" នៅខាងមុខ យើងបន្ថែមវា
        const formattedPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
        return `${backendDomain}${formattedPath}`;
    };

    return {
        id: item.reservation_id || item.id,
        customerPaymentId: item.id,
        guestName: item.customer_name || item.customerName || "Unknown guest",
        guestEmail: item.customer_email || "N/A",
        guestPhone: item.customer_phone || "N/A",
        propertyName: item.property_name || item.propertyName || "Unknown property",
        roomName: item.room_name || "N/A",
        totalNights: item.total_nights || 0,
        amount: Number(item.amount || item.total_amount || 0),
        currency: item.currency || "USD",
        paymentMethod: item.payment_method || "N/A",
        checkIn: item.check_in_date || item.checkIn || "-",
        checkOut: item.check_out_date || item.checkOut || "-",
        createdAt: item.created_at || null,
        status: String(item.payment_status || item.status || "pending").toLowerCase(),

        // កែប្រែត្រង់នេះ៖ ហៅអនុគមន៍ getFullImageUrl ដើម្បីបំលែងទៅជា Full URL មុននឹងយកទៅបង្ហាញ
        payment_proof_url: getFullImageUrl(item.receipt_image_url || item.payment_proof_url),

        txRef: item.transaction_reference || 'N/A'
    };
};

const fetchPaymentDetails = async () => {
    loading.value = true;
    try {
        await authStore.refreshSession();
        const response = await ownerPaymentApi.getPaymentDetails(route.params.id);
        const itemData = response?.data?.data || response?.data || response;

        if (itemData) {
            reservation.value = normalizeReservationItem(itemData);
        } else {
            error.value = "Payment record not found.";
            toastStore.danger("Payment record not found.");
        }
    } catch (err) {
        error.value = err.message || "Failed to load payment details.";
        toastStore.danger(error.value);
    } finally {
        loading.value = false;
    }
};

const handleVerify = async () => {
    if (!reservation.value?.customerPaymentId) return;

    // បញ្ជាក់លក្ខខណ្ឌ៖ អាចធ្វើទៅបានលុះត្រាតែ status ស្មើ 'submitted' 
    if (reservation.value.status !== 'submitted') {
        toastStore.warning("Only payments with 'Submitted' status can be verified.");
        return;
    }

    actionLoading.value = true;
    try {
        await ownerPaymentApi.verifyPayment(reservation.value.customerPaymentId);
        toastStore.success("Payment verified successfully!", { title: "Approved" });
        router.back();
    } catch (err) {
        console.error("Verification error:", err);
        const errMsg = err.response?.data?.message || "Failed to verify payment";
        toastStore.danger(errMsg, { title: "Error" });
    } finally {
        actionLoading.value = false;
    }
};

const handleReject = async () => {
    if (!rejectReason.value.trim() || !reservation.value?.customerPaymentId) return;

    // បញ្ជាក់លក្ខខណ្ឌ៖ អាចធ្វើទៅបានលុះត្រាតែ status ស្មើ 'submitted' 
    if (reservation.value.status !== 'submitted') {
        toastStore.warning("Only payments with 'Submitted' status can be rejected.");
        return;
    }

    actionLoading.value = true;
    try {
        await ownerPaymentApi.rejectPayment(reservation.value.customerPaymentId, {
            rejection_reason: rejectReason.value.trim()
        });
        toastStore.warning("Payment has been rejected.", { title: "Rejected" });
        router.back();
    } catch (err) {
        console.error("Rejection error:", err);
        const errMsg = err.response?.data?.message || "Failed to reject payment";
        toastStore.danger(errMsg, { title: "Error" });
    } finally {
        actionLoading.value = false;
    }
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit' });
};

// មុខងារជំនួយសម្រាប់កំណត់ Style ពណ៌ទៅតាម Payment Status ទាំង ៥
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'submitted':
            return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
        case 'paid':
            return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600';
        case 'failed':
            return 'bg-rose-500/10 border-rose-500/20 text-rose-600';
        case 'refunded':
            return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
        default: // pending
            return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
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
            <!-- <h1 class="text-xl font-bold tracking-tight text-(--color-text)">Payment Audit Details</h1>
            <div class="w-24"></div> -->
        </header>

        <div v-if="loading"
            class="flex flex-col items-center justify-center py-20 bg-(--color-surface) rounded-2xl border border-(--color-border)">
            <LoadingSpinner label="Loading transaction records..." class="text-sm font-semibold" />
        </div>

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
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Amount Paid</span>
                            <span class="font-black text-(--color-success) text-lg">
                                {{ reservation.currency === 'USD' ? '$' : '' }}{{ reservation.amount.toFixed(2) }} {{
                                    reservation.currency !== 'USD' ? reservation.currency : '' }}
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
                                {{ reservation.txRef || 'N/A' }}
                            </span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-[10px] text-(--color-muted) uppercase font-bold block">Created At</span>
                            <span class="font-medium text-(--color-muted) text-xs">{{ formatDate(reservation.createdAt)
                            }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="RejectInput" class="space-y-2 pt-4 border-t border-(--color-border)">
                    <label class="text-xs font-bold text-rose-600 block">Reason for Rejection *</label>
                    <textarea v-model="rejectReason"
                        placeholder="State the reason (e.g., Wrong transaction ID, blurred receipt image, incorrect amount)..."
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
                            proof showing transaction details. Reject if the image is blurred, irrelevant, or if
                            transaction details do not match the booking information.</p>
                    </div>
                </div>

                <div
                    class="flex items-start gap-3 p-3.5 rounded-2xl border border-(--color-border)/50 bg-(--color-surface-soft)/40">
                    <ShieldCheckIcon class="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-wider text-(--color-muted)">Important
                            Reminder</p>
                        <p class="text-sm font-bold text-(--color-text) mt-0.5">Verify the payment proof against the
                            booking details and transaction reference. If in doubt, communicate with the customer for
                            clarification before making a decision.</p>
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
            class="mt-6 flex justify-end gap-3 bg-(--color-surface) border border-(--color-border) p-4 rounded-2xl shadow-sm">

            <template v-if="reservation.status === 'submitted'">
                <template v-if="RejectInput">
                    <button type="button" @click="RejectInput = false" :disabled="actionLoading"
                        class="px-5 py-2.5 border border-(--color-border) rounded-xl text-xs font-bold text-(--color-text) hover:bg-(--color-surface-soft) cursor-pointer transition">Back</button>
                    <button type="button" @click="handleReject" :disabled="!rejectReason.trim() || actionLoading"
                        class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50 cursor-pointer transition">
                        <LoadingSpinner v-if="actionLoading" label="Rejecting..." class="text-white text-xs" />
                        <span v-else>Confirm Reject</span>
                    </button>
                </template>

                <template v-else>
                    <button type="button" @click="RejectInput = true" :disabled="actionLoading"
                        class="px-5 py-2.5 border border-rose-500/50 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl text-xs cursor-pointer transition">Reject
                        Payment</button>
                    <button type="button" @click="handleVerify" :disabled="actionLoading"
                        class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition flex items-center gap-1.5">
                        <LoadingSpinner v-if="actionLoading" label="Approving..." class="text-white text-xs" />
                        <template v-else>
                            <CheckIcon class="w-4 h-4" />
                            <span>Approve & Confirm Paid</span>
                        </template>
                    </button>
                </template>
            </template>

            <template v-else>
                <div class="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
                    :class="getStatusBadgeClass(reservation.status)">
                    <span>Audit Status: </span>
                    <span class="font-bold uppercase">{{ reservation.status }}</span>
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

.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-muted);
}
</style>