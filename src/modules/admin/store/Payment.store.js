import { defineStore } from "pinia";
import { ref, computed } from "vue";
// import { paymentService } from "../services/payment.service";
import { paymentService } from "../services/Payment.service";
import { getImageUrl } from "../utils/formatters";

const STATUS_OPTIONS = ["submitted", "verified", "rejected"];

export const usePaymentStore = defineStore("admin-payments", () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const payments = ref([]);
  const currentPayment = ref(null);
  const loading = ref(false);
  const processing = ref(false);
  const error = ref(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const statusFilter = ref("all");
  const searchQuery = ref("");

  // ── Computed ──────────────────────────────────────────────────────────────
  const filteredPayments = computed(() => {
    let result = payments.value;

    if (statusFilter.value !== "all") {
      result = result.filter((p) => p.payment_status === statusFilter.value);
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      result = result.filter((p) =>
        [
          p.customer_name,
          p.customer_email,
          p.customer_phone,
          p.transaction_reference,
          p.payment_method,
          String(p.id),
          String(p.reservation_id),
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }

    return result;
  });

  const statusCounts = computed(() => {
    const counts = { all: payments.value.length };
    STATUS_OPTIONS.forEach((status) => {
      counts[status] = payments.value.filter(
        (p) => p.payment_status === status,
      ).length;
    });
    return counts;
  });

  // Pending = submitted payments awaiting verification
  const pendingCount = computed(
    () => payments.value.filter((p) => p.payment_status === "submitted").length,
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fetch all payments
   * GET /admin/payments
   * Response: { success, message, data: [...] }
   */
  const fetchPayments = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getAllPayments(params);
      const payload = response?.data ?? response;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      payments.value = items;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load payments.";
      console.error("[paymentStore] fetchPayments:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch only pending-verification payments
   * GET /admin/payments/pending-verification
   * Same response shape as getAllPayments
   */
  const fetchPendingPayments = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getPendingPayments(params);
      const payload = response?.data ?? response;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      payments.value = items;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load pending payments.";
      console.error("[paymentStore] fetchPendingPayments:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single payment by ID
   * GET /admin/payments/:id
   * Response: { success, message, data: { id, reservation_id, amount, receipt_image_url, ... } }
   */
  const fetchPaymentById = async (id) => {
    loading.value = true;
    error.value = null;
    currentPayment.value = null;
    try {
      const response = await paymentService.getPaymentById(id);
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload;
      currentPayment.value = {
        ...data,
        receipt_image_url: getImageUrl(data?.receipt_image_url),
      };
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load payment detail.";
      console.error("[paymentStore] fetchPaymentById:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch proof details only (lighter call — receipt + status fields)
   * GET /admin/payments/:id/proof
   * Response: { success, message, data: {
   *   id, payment_status, receipt_image_url, rejection_reason,
   *   verified_by, verified_by_name, verified_at, paid_at
   * }}
   */
  const fetchPaymentProof = async (id) => {
    try {
      const response = await paymentService.getPaymentProof(id);
      const payload = response?.data ?? response;
      const proof = payload?.data ?? payload;
      return {
        ...proof,
        receipt_image_url: getImageUrl(proof?.receipt_image_url),
      };
    } catch (err) {
      console.error("[paymentStore] fetchPaymentProof:", err);
      return null;
    }
  };

  /**
   * Verify a payment
   * PATCH /admin/payments/:id/verify
   */
  const verifyPayment = async (id) => {
    processing.value = true;
    error.value = null;
    try {
      const response = await paymentService.verifyPayment(id);
      const updated = response?.data?.data ?? response?.data ?? null;
      _patchPaymentInList(id, updated ?? { payment_status: "verified" });
      return true;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to verify payment.";
      console.error("[paymentStore] verifyPayment:", err);
      return false;
    } finally {
      processing.value = false;
    }
  };

  /**
   * Reject a payment with a reason
   * PATCH /admin/payments/:id/reject
   */
  const rejectPayment = async (id, reason) => {
    processing.value = true;
    error.value = null;
    try {
      const response = await paymentService.rejectPayment(id, reason);
      const updated = response?.data?.data ?? response?.data ?? null;
      _patchPaymentInList(
        id,
        updated ?? { payment_status: "rejected", rejection_reason: reason },
      );
      return true;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reject payment.";
      console.error("[paymentStore] rejectPayment:", err);
      return false;
    } finally {
      processing.value = false;
    }
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const setStatusFilter = (status) => {
    statusFilter.value = status;
  };
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  // ── Internal helpers ──────────────────────────────────────────────────────
  const _patchPaymentInList = (id, patch) => {
    const index = payments.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      payments.value[index] = { ...payments.value[index], ...patch };
    }
    if (currentPayment.value?.id === id) {
      currentPayment.value = { ...currentPayment.value, ...patch };
    }
  };

  return {
    // State
    payments,
    currentPayment,
    loading,
    processing,
    error,

    // Filters
    statusFilter,
    searchQuery,

    // Computed
    filteredPayments,
    statusCounts,
    pendingCount,

    // Actions
    fetchPayments,
    fetchPendingPayments,
    fetchPaymentById,
    fetchPaymentProof,
    verifyPayment,
    rejectPayment,
    setStatusFilter,
    setSearchQuery,
  };
});
