/**
 * paymentStore.js
 *
 * Pinia store for payment state.
 * Owns:
 *   - The current user's payment list
 *   - A single "active" payment detail (e.g. currently viewed)
 *   - Payment-account options for the current property
 *   - Loading / error states for each async operation
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getMyPayments,
  getPaymentById,
  uploadReceipt,
  submitProof,
  createPayment,
  getProofDetails,
  getPropertyPaymentAccounts,
  canUploadProof,
  PAYMENT_STATUSES,
} from "../services/paymentService";

export const usePaymentStore = defineStore("payment", () => {
  // ─── State ────────────────────────────────────────────────────────────────

  /** @type {import('vue').Ref<Payment[]>} */
  const payments = ref([]);

  /** @type {import('vue').Ref<Payment|null>} */
  const activePayment = ref(null);

  /** @type {import('vue').Ref<PaymentAccount[]>} */
  const paymentAccounts = ref([]);

  /** @type {import('vue').Ref<ProofDetails|null>} */
  const proofDetails = ref(null);

  // Loading flags per operation
  const loadingList = ref(false);
  const loadingDetail = ref(false);
  const loadingSubmitProof = ref(false);
  const loadingAccounts = ref(false);

  // Error messages per operation
  const errorList = ref(null);
  const errorDetail = ref(null);
  const errorSubmitProof = ref(null);
  const errorAccounts = ref(null);

  // ─── Getters ──────────────────────────────────────────────────────────────

  const pendingPayments = computed(() =>
    payments.value.filter((p) => p.status === PAYMENT_STATUSES.PENDING),
  );

  const verifiedPayments = computed(() =>
    payments.value.filter((p) => p.status === PAYMENT_STATUSES.VERIFIED),
  );

  /** Whether the active payment can have proof submitted. */
  const activeCanUpload = computed(() =>
    activePayment.value ? canUploadProof(activePayment.value.status) : false,
  );

  const isLoading = computed(
    () =>
      loadingList.value ||
      loadingDetail.value ||
      loadingSubmitProof.value ||
      loadingAccounts.value,
  );

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Fetch the authenticated user's full payment list.
   */
  async function fetchMyPayments() {
    loadingList.value = true;
    errorList.value = null;
    try {
      payments.value = await getMyPayments();
    } catch (err) {
      errorList.value =
        err?.response?.data?.message ?? "Failed to load payments.";
      console.error("[paymentStore] fetchMyPayments:", err);
    } finally {
      loadingList.value = false;
    }
  }

  /**
   * Fetch and set a single payment as the active detail.
   * @param {string|number} paymentId
   */
  async function fetchPaymentById(paymentId) {
    loadingDetail.value = true;
    errorDetail.value = null;
    activePayment.value = null;
    try {
      activePayment.value = await getPaymentById(paymentId);
    } catch (err) {
      errorDetail.value =
        err?.response?.data?.message ?? "Failed to load payment details.";
      console.error("[paymentStore] fetchPaymentById:", err);
    } finally {
      loadingDetail.value = false;
    }
  }

  /**
   * Fetch proof details for the active payment.
   * @param {string|number} paymentId
   */
  async function fetchProofDetails(paymentId) {
    loadingDetail.value = true;
    proofDetails.value = null;
    try {
      proofDetails.value = await getProofDetails(paymentId);
    } catch (err) {
      // Proof may simply not exist yet — treat 404 as empty, not an error.
      if (err?.response?.status !== 404) {
        console.error("[paymentStore] fetchProofDetails:", err);
      }
    } finally {
      loadingDetail.value = false;
    }
  }

  /**
   * Create a payment and append it to the local list.
   * @param {object} payload
   * @returns {Promise<Payment>}
   */
  async function createNewPayment(payload) {
    const payment = await createPayment(payload);
    payments.value.unshift(payment);
    return payment;
  }

  /**
   * Submit (upload or replace) proof for a payment.
   * Updates the active payment in-place on success.
   * @param {string|number} paymentId
   * @param {File} file
   * @returns {Promise<boolean>} true on success
   */
  async function submitPaymentProof(paymentId, file) {
    loadingSubmitProof.value = true;
    errorSubmitProof.value = null;
    try {
      const currentStatus =
        activePayment.value?.status ?? PAYMENT_STATUSES.PENDING;

      let updated;

      if (currentStatus === PAYMENT_STATUSES.PENDING) {
        // First time → use /receipt
        updated = await uploadReceipt(paymentId, file);
      } else {
        // Re-upload after rejection → use /proof
        updated = await submitProof(paymentId, currentStatus, file);
      }

      activePayment.value = updated;
      const idx = payments.value.findIndex((p) => p.id === updated.id);
      if (idx !== -1) payments.value[idx] = updated;

      return true;
    } catch (err) {
      errorSubmitProof.value =
        err?.response?.data?.message ??
        "Failed to submit payment proof. Please try again.";
      console.error("[paymentStore] submitPaymentProof:", err);
      return false;
    } finally {
      loadingSubmitProof.value = false;
    }
  }

  /**
   * Fetch the payment accounts for a property (bank, KHQR, etc.).
   * @param {string|number} propertyId
   */
  async function fetchPaymentAccounts(propertyId) {
    loadingAccounts.value = true;
    errorAccounts.value = null;
    try {
      paymentAccounts.value = await getPropertyPaymentAccounts(propertyId);
    } catch (err) {
      errorAccounts.value =
        err?.response?.data?.message ?? "Failed to load payment accounts.";
      console.error("[paymentStore] fetchPaymentAccounts:", err);
    } finally {
      loadingAccounts.value = false;
    }
  }

  /** Reset all state (e.g. on logout). */
  function $reset() {
    payments.value = [];
    activePayment.value = null;
    paymentAccounts.value = [];
    proofDetails.value = null;
    errorList.value = null;
    errorDetail.value = null;
    errorSubmitProof.value = null;
    errorAccounts.value = null;
  }

  return {
    // State
    payments,
    activePayment,
    paymentAccounts,
    proofDetails,
    loadingList,
    loadingDetail,
    loadingSubmitProof,
    loadingAccounts,
    errorList,
    errorDetail,
    errorSubmitProof,
    errorAccounts,

    // Getters
    pendingPayments,
    verifiedPayments,
    activeCanUpload,
    isLoading,

    // Actions
    fetchMyPayments,
    fetchPaymentById,
    fetchProofDetails,
    createNewPayment,
    submitPaymentProof,
    fetchPaymentAccounts,
    $reset,
  };
});
