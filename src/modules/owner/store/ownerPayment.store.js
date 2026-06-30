// ../stores/ownerPayment.store.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { ownerPaymentApi } from "@/modules/payments/api/ownerPayment.api";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import { reservationApi } from "@/modules/reservations/api/reservation.api";

export const useOwnerPaymentStore = defineStore("owner-guest-payments", () => {
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    // Core States
    const loading = ref(true);
    const actionLoading = ref(false);
    const error = ref("");
    const activeModule = ref("payments");
    const recentReservations = ref([]);
    const refundRequests = ref([]);
    const currentTab = ref("all");

    // Pagination States
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Watchers
    watch([activeModule, currentTab], () => {
        currentPage.value = 1;
    });

    // Computeds
    const stats = computed(() => {
        const totalEarnings = recentReservations.value
            .filter(r => ['confirmed', 'paid', 'completed'].includes(r.status))
            .reduce((sum, r) => sum + r.amount, 0);
        const pendingCount = recentReservations.value.filter(r => r.status === 'pending' || r.status === 'submitted').length;
        const pendingRefunds = refundRequests.value.filter(r => ['pending', 'requested'].includes(r.refund_status)).length;
        return {
            totalEarnings,
            totalBookings: recentReservations.value.length,
            pendingCount,
            pendingRefunds
        };
    });

    const tabCounts = computed(() => {
        if (activeModule.value === 'payments') {
            return {
                all: recentReservations.value.length,
                pending: recentReservations.value.filter(r => r.status === 'pending').length,
                submitted: recentReservations.value.filter(r => r.status === 'submitted').length,
                confirmed: recentReservations.value.filter(r => ['confirmed', 'paid', 'completed'].includes(r.status)).length,
                cancelled: recentReservations.value.filter(r => ['cancelled', 'failed'].includes(r.status)).length,
                refunded: recentReservations.value.filter(r => r.status === 'refunded').length
            };
        } else {
            return {
                all: refundRequests.value.length,
                pending: refundRequests.value.filter(r => ['pending', 'requested'].includes(r.refund_status)).length,
                approved: refundRequests.value.filter(r => r.refund_status === 'approved').length,
                rejected: refundRequests.value.filter(r => r.refund_status === 'rejected').length
            };
        }
    });

    const filteredItems = computed(() => {
        if (activeModule.value === 'payments') {
            if (currentTab.value === "all") return recentReservations.value;
            const filterTab = currentTab.value.toLowerCase();
            return recentReservations.value.filter(r => {
                if (filterTab === 'submitted') return r.status === 'submitted';
                if (filterTab === 'confirmed') return ['confirmed', 'paid', 'completed'].includes(r.status);
                if (filterTab === 'cancelled') return ['cancelled', 'failed'].includes(r.status);
                return r.status === filterTab;
            });
        } else {
            if (currentTab.value === "all") return refundRequests.value;
            const filterTab = currentTab.value.toLowerCase();
            return refundRequests.value.filter(r => {
                if (filterTab === 'pending') return ['pending', 'requested'].includes(r.refund_status);
                return r.refund_status === filterTab;
            });
        }
    });

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredItems.value.slice(start, end);
    });

    const totalPages = computed(() => {
        return Math.ceil(filteredItems.value.length / itemsPerPage.value) || 1;
    });

    // Helper Methods
    const switchModule = (moduleType) => {
        activeModule.value = moduleType;
        currentTab.value = "all";
    };

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
            reservation_status: String(item.reservation_status || "pending").toLowerCase(),
            payment_proof_url: item.receipt_image_url || item.payment_proof_url || null,
            txRef: item.transaction_reference || 'N/A'
        }));

    // Async Actions
    const loadData = async () => {
        loading.value = true;
        error.value = "";
        try {
            await authStore.refreshSession();
            const [paymentsRes, refundsRes] = await Promise.all([
                ownerPaymentApi.listOwnerPayments(),
                ownerPaymentApi.listRefundRequests()
            ]);

            let pItems = paymentsRes?.data?.data || paymentsRes?.data || paymentsRes || [];
            recentReservations.value = normalizeReservations(Array.isArray(pItems) ? pItems : []);

            let rItems = refundsRes?.data?.data || refundsRes?.data || refundsRes || [];
            refundRequests.value = Array.isArray(rItems) ? rItems : [];
        } catch (requestError) {
            error.value = requestError?.message || "Failed to load management logs.";
        } finally {
            loading.value = false;
        }
    };

    const changeReservationStatus = async (reservationId, status, reason = "") => {
        actionLoading.value = true;
        try {
            await reservationApi.updateOwnerReservationStatus(reservationId, {
                status: status,
                reason: reason || `Status manually updated to ${status} by owner.`
            });

            toastStore?.success?.(`Reservation status updated to ${status} successfully.`);
            await loadData(); // ទាញយកទិន្នន័យថ្មីដើម្បី Update Table
            return true;
        } catch (err) {
            toastStore?.danger?.(err.response?.data?.message || "Failed to update reservation status.");
            return false;
        } finally {
            actionLoading.value = false;
        }
    };

    const verifyPayment = async (customerPaymentId) => {
        actionLoading.value = true;
        try {
            await ownerPaymentApi.verifyPayment(customerPaymentId);
            toastStore?.success?.("Payment verification processed successfully.");
            await loadData();
            return true;
        } catch (err) {
            toastStore?.danger?.(err.response?.data?.message || "Verification adjustment failed.");
            return false;
        } finally {
            actionLoading.value = false;
        }
    };

    const approveRefund = async (id) => {
        actionLoading.value = true;
        try {
            await ownerPaymentApi.approveRefund(id, { decision_note: "Approved refund for cancelled reservation" });
            toastStore?.success?.("Refund request approved successfully.");
            await loadData();
            return true;
        } catch (err) {
            toastStore?.danger?.(err.response?.data?.message || "Verification adjustment failed.");
            return false;
        } finally {
            actionLoading.value = false;
        }
    };

    const rejectPayment = async (customerPaymentId, reason) => {
        actionLoading.value = true;
        try {
            await ownerPaymentApi.rejectPayment(customerPaymentId, {
                rejection_reason: reason
            });
            toastStore?.warning?.("Payment proof marked as rejected.");
            await loadData();
            return true;
        } catch (err) {
            toastStore?.danger?.(err.response?.data?.message || "Failed to commit rejection parameters.");
            return false;
        } finally {
            actionLoading.value = false;
        }
    };

    const rejectRefund = async (id, reason) => {
        actionLoading.value = true;
        try {
            await ownerPaymentApi.rejectRefund(id, { decision_note: reason });
            toastStore?.warning?.("Refund request rejected successfully.");
            await loadData();
            return true;
        } catch (err) {
            toastStore?.danger?.(err.response?.data?.message || "Failed to commit rejection parameters.");
            return false;
        } finally {
            actionLoading.value = false;
        }
    };

    return {
        loading,
        actionLoading,
        error,
        activeModule,
        recentReservations,
        refundRequests,
        currentTab,
        currentPage,
        itemsPerPage,
        stats,
        tabCounts,
        filteredItems,
        paginatedItems,
        totalPages,
        switchModule,
        loadData,
        changeReservationStatus,
        verifyPayment,
        approveRefund,
        rejectPayment,
        rejectRefund
    };
});