/**
 * paymentService.js
 *
 * Business-logic layer that sits between views/store and paymentApi.
 * Handles:
 *   - FormData construction for file uploads
 *   - Response normalisation (unwraps .data.data)
 *   - Derived status helpers
 */

import { paymentApi } from "../api/payment.api";

// ─── Status helpers ───────────────────────────────────────────────────────────

/** All valid payment statuses in the system. */
export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  UPLOADED: "uploaded",
  VERIFIED: "verified",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
});

/**
 * Returns true when a payment can still have proof uploaded/replaced.
 * @param {string} status
 */
export function canUploadProof(status) {
  return [PAYMENT_STATUSES.PENDING, PAYMENT_STATUSES.REJECTED].includes(status);
}

/**
 * Returns true when a proof upload already exists and can be replaced.
 * @param {string} status
 */
export function canReplaceProof(status) {
  return status === PAYMENT_STATUSES.REJECTED;
}

// ─── Customer-facing operations ───────────────────────────────────────────────

/**
 * Fetch all payments belonging to the authenticated user.
 * @returns {Promise<Payment[]>}
 */
export async function getMyPayments() {
  const res = await paymentApi.getMyPayments();
  return res?.data ?? res ?? [];
}

/**
 * Fetch a single payment by ID.
 * @param {string|number} paymentId
 * @returns {Promise<Payment>}
 */
export async function getPaymentById(paymentId) {
  const res = await paymentApi.getPaymentById(paymentId);
  return res.data?.data ?? res.data;
}

/**
 * Create a new payment record.
 * @param {{ bookingId: string|number, amount: number, currency?: string, method?: string }} payload
 * @returns {Promise<Payment>}
 */
export async function createPayment(payload) {
  const res = await paymentApi.createPayment(payload);
  return res.data?.data ?? res.data;
}

/**
 * Upload a receipt image/PDF for a payment.
 * @param {string|number} paymentId
 * @param {File} file
 * @returns {Promise<Payment>}
 */
export async function uploadReceipt(paymentId, file) {
  const formData = new FormData();
  formData.append("receipt", file);
  const res = await paymentApi.uploadReceipt(paymentId, formData);
  return res.data ?? res;
}

/**
 * Upload payment proof for the first time (pending → uploaded).
 * @param {string|number} paymentId
 * @param {File} file
 * @returns {Promise<Payment>}
 */
export async function uploadProof(paymentId, file) {
  const formData = new FormData();
  formData.append("proof", file);
  const res = await paymentApi.uploadProof(paymentId, formData);
  return res.data?.data ?? res.data;
}

/**
 * Replace an existing proof after rejection.
 * @param {string|number} paymentId
 * @param {File} file
 * @returns {Promise<Payment>}
 */
export async function replaceProof(paymentId, file) {
  const formData = new FormData();
  formData.append("proof", file);
  const res = await paymentApi.replaceProof(paymentId, formData);
  return res.data?.data ?? res.data;
}

/**
 * Smart upload: calls uploadProof or replaceProof depending on current status.
 * @param {string|number} paymentId
 * @param {string} currentStatus
 * @param {File} file
 * @returns {Promise<Payment>}
 */
export async function submitProof(paymentId, currentStatus, file) {
  if (canReplaceProof(currentStatus)) {
    return replaceProof(paymentId, file);
  }
  return uploadProof(paymentId, file);
}

/**
 * Fetch proof/receipt details for a payment.
 * @param {string|number} paymentId
 * @returns {Promise<ProofDetails>}
 */
export async function getProofDetails(paymentId) {
  const res = await paymentApi.getProofDetails(paymentId);
  return res.data?.data ?? res.data;
}

// ─── Property-level operations ────────────────────────────────────────────────

/**
 * Fetch the KHQR/Bakong payment account for a property.
 * Returns an array; the first entry is the active QR account.
 * Expected shape: { id, account_name, qr_image_url, bakong_id }
 * @param {string|number} propertyId
 * @returns {Promise<PaymentAccount[]>}
 */
export async function getPropertyPaymentAccounts(propertyId) {
  const res = await paymentApi.getPropertyPaymentAccounts(propertyId);
  return res.data?.data ?? res.data ?? [];
}
