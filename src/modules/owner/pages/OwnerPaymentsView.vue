//OwnerPaymentsView.vue
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppTable from "@/shared/components/AppTable.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import PaymentFilterBar from "@/modules/payments/components/PaymentFilterBar.vue";

import { ownerPaymentApi } from "../../payments/api/ownerPayment.api.js";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ShieldCheckIcon } from "@heroicons/vue/24/outline";
import { useSidebar } from "@/shared/composables/useSidebar";

const router = useRouter();
const {isSidebarOpen} = useSidebar();

const loading = ref(true);
const actionLoading = ref(false);
const error = ref("");
const recentReservations = ref([]);
const authStore = useAuthStore();

// Filter Bar v-model state
const currentTab = ref("all");
const isReviewOpen = ref(false);
const selectedReservation = ref(null);

const reservationColumns = [
    { key: "id", label: "Booking ID" },
    { key: "guestName", label: "Guest Info" },
    { key: "propertyName", label: "Property & Room" },
    { key: "amount", label: "Amount" },
    { key: "checkIn", label: "Stay Period" },
    { key: "status", label: "Status" },
    { key: "action", label: "Verification" },
];

const stats = computed(() => {
    const totalEarnings = recentReservations.value
        .filter(r => r.status === 'confirmed' || r.status === 'paid' || r.status === 'completed')
        .reduce((sum, r) => sum + r.amount, 0);
    const pendingCount = recentReservations.value.filter(r => r.status === 'pending').length;
    return {
        totalEarnings,
        totalBookings: recentReservations.value.length,
        pendingCount
    };
});

// រាប់ចំនួនទិន្នន័យសម្រាប់ Filter Bar នីមួយៗ
const tabCounts = computed(() => {
    return {
        all: recentReservations.value.length,
        pending: recentReservations.value.filter(r => r.status === 'pending').length,
        submitted: recentReservations.value.filter(r => r.status === 'submitted').length,
        confirmed: recentReservations.value.filter(r => r.status === 'confirmed' || r.status === 'paid' || r.status === 'completed').length,
        cancelled: recentReservations.value.filter(r => r.status === 'cancelled' || r.status === 'failed').length,
        refunded: recentReservations.value.filter(r => r.status === 'refunded').length
    };
});

// ច្រោះទិន្នន័យទៅតាមការចុចលើ Filter Bar
const filteredReservations = computed(() => {
    if (currentTab.value === "all") return recentReservations.value;
    // Map UI filters to backend statuses
    const filterTab = currentTab.value.toLowerCase();
    return recentReservations.value.filter(r => {
        if (filterTab === 'submitted') return ['submitted'].includes(r.status);
        if (filterTab === 'confirmed') return ['confirmed', 'paid', 'completed'].includes(r.status);
        if (filterTab === 'cancelled') return ['cancelled', 'failed'].includes(r.status);
        if (filterTab === 'refunded') return ['refunded'].includes(r.status);
        return r.status === filterTab;
    });
});

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Map ទិន្នន័យទាំងអស់ពី API ចូលទៅក្នុង Object តែមួយ
const normalizeReservations = (items = []) =>
    items.map((item, index) => ({
        id: item.reservation_id || item.id || `res-${index + 1}`,
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
        payment_proof_url: item.receipt_image_url || item.payment_proof_url || null,
        txRef: item.transaction_reference || 'N/A'
    }));

const fetchReservations = async () => {
    loading.value = true;
    error.value = "";
    try {
        await authStore.refreshSession();
        const response = await ownerPaymentApi.listOwnerPayments();

        let items = [];
        if (response && response.data && Array.isArray(response.data.data)) {
            items = response.data.data;
        } else if (Array.isArray(response)) {
            items = response;
        } else if (response?.data) {
            items = response.data;
        }

        recentReservations.value = normalizeReservations(items);
    } catch (requestError) {
        error.value = requestError?.message || "Failed to load payment records.";
        recentReservations.value = [];
    } finally {
        loading.value = false;
    }
};

const openReview = (row) => {
    router.push({
        path: "reservations/" + (row.customerPaymentId || row.id),
    });
};

const handleVerifyPayment = async () => {
    if (!selectedReservation.value) return;
    actionLoading.value = true;
    try {
        // await reservationApi.updateStatus(selectedReservation.value.id, { status: 'confirmed' });
        isReviewOpen.value = false;
        selectedReservation.value = null;
        await fetchReservations();
    } catch (err) {
        console.error("Verification error:", err);
    } finally {
        actionLoading.value = false;
    }
};

const handleRejectPayment = async (reason) => {
    if (!selectedReservation.value) return;
    actionLoading.value = true;
    try {
        // await reservationApi.updateStatus(selectedReservation.value.id, { status: 'cancelled', reason });
        isReviewOpen.value = false;
        selectedReservation.value = null;
        await fetchReservations();
    } catch (err) {
        console.error("Rejection error:", err);
    } finally {
        actionLoading.value = false;
    }
};

onMounted(fetchReservations);
</script>

<template>
    <main class="owner-payments space-y-6 my-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-(--color-text)">Payments Verifications</h1>
                <p class="mt-1 text-sm text-(--color-muted)">Review and verify customer payment receipts securely.</p>
            </div>

            <button type="button"
                class="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-(--color-text) transition hover:bg-(--color-input)/50 shadow-sm"
                :disabled="loading" @click="fetchReservations">
                <LoadingSpinner v-if="loading" class="h-4 w-4" />
                <span>Refresh Data</span>
            </button>
        </header>

        <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Total Confirmed
                    Earnings</span>
                <h3 class="mt-1 text-2xl font-bold text-(--color-text)">${{ formatCurrency(stats.totalEarnings) }}</h3>
            </div>
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Total Payment
                    Records</span>
                <h3 class="mt-1 text-2xl font-bold text-(--color-text)">{{ stats.totalBookings }}</h3>
            </div>
            <div class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
                <span class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)">Requires Action</span>
                <h3 class="mt-1 text-2xl font-bold text-amber-500">{{ stats.pendingCount }}</h3>
            </div>
        </section>

        <section class="mb-6">
            <PaymentFilterBar v-model="currentTab" :counts="tabCounts" />
        </section>

        <section class="space-y-4 bg-(--color-surface) rounded-2xl border border-(--color-border) p-4 shadow-sm">
            <div v-if="error"
                class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">{{ error }}
            </div>
            <div v-if="loading" class="rounded-xl px-5 py-10 text-center text-(--color-muted)">Loading comprehensive
                payment data...</div>
            <div v-else-if="filteredReservations.length === 0"
                class="rounded-xl px-5 py-10 text-center text-(--color-muted)">
                No payments match the "{{ currentTab }}" filter.
            </div>

            <AppTable v-else :columns="reservationColumns" :rows="filteredReservations">

                <template #cell-guestName="{ row }">
                    <div class="flex flex-col text-sm">
                        <span class="font-bold text-(--color-text)">{{ row.guestName }}</span>
                        <span class="text-xs text-(--color-muted)">{{ row.guestPhone }}</span>
                    </div>
                </template>

                <template #cell-propertyName="{ row }">
                    <div class="flex flex-col text-sm">
                        <span class="font-semibold text-(--color-text)">{{ row.propertyName }}</span>
                        <span class="text-xs text-(--color-muted)">Room: {{ row.roomName }}</span>
                    </div>
                </template>

                <template #cell-amount="{ value }">
                    <span class="font-bold text-(--color-text)">${{ formatCurrency(value) }}</span>
                </template>

                <template #cell-status="{ value }">
                    <span
                        class="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border"
                        :class="[
                            value === 'confirmed' || value === 'paid' || value === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : '',
                            value === 'cancelled' || value === 'failed' ? 'border-rose-500/30 bg-rose-500/10 text-rose-600' : '',
                            value === 'pending' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : '',
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
                    <button v-if="row.status === 'pending'" type="button" @click="openReview(row)"
                        class="px-3 py-1.5 bg-(--color-primary) hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition active:scale-95">
                        <ShieldCheckIcon class="w-4 h-4" />
                        <span>Audit Proof</span>
                    </button>
                    <button v-else type="button" @click="openReview(row)"
                        class="px-3 py-1.5 bg-(--color-input)/50 hover:bg-(--color-input) text-(--color-text) rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
                        <span>View Details</span>
                    </button>
                </template>
            </AppTable>
        </section>
    </main>
</template>

<style scoped>
.owner-payments {
    font-family: var(--font-main);
    background-color: var(--color-page);
    color: var(--color-text);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

</style>