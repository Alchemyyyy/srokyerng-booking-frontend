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

/** All valid payment statuses returned by the API. */
export const PAYMENT_STATUSES = Object.freeze({
  PENDING: "pending", // payment created, no receipt yet
  SUBMITTED: "submitted", // receipt uploaded, awaiting verification
  PAID: "paid", // verified by owner/admin
  FAILED: "failed", // rejected — customer can re-upload
});

/**
 * Upload type — passed from the UI to tell submitProof
 * which first-time endpoint to use.
 *   "receipt" → POST /payments/:id/receipt  (official bank slip)
 *   "proof"   → POST /payments/:id/proof    (screenshot / photo evidence)
 */
export const UPLOAD_TYPES = Object.freeze({
  RECEIPT: "receipt",
  PROOF: "proof",
});

/**
 * Returns true when a payment can have proof uploaded or replaced.
 * @param {string} status
 */
export function canUploadProof(status) {
  return [PAYMENT_STATUSES.PENDING, PAYMENT_STATUSES.FAILED].includes(status);
}

/**
 * Returns true when proof already exists and needs to be replaced.
 * @param {string} status
 */
export function canReplaceProof(status) {
  return status === PAYMENT_STATUSES.FAILED;
}

// ─── Customer-facing operations ───────────────────────────────────────────────

/**
 * Fetch all payments belonging to the authenticated user.
 * @returns {Promise<Payment[]>}
 */
export async function getMyPayments() {
  const res = await paymentApi.getMyPayments();
  return res?.data?.data ?? res?.data ?? res ?? [];
}

/**
 * Fetch a single payment by ID.
 * @param {string|number} paymentId
 * @returns {Promise<Payment>}
 */
export async function getPaymentById(paymentId) {
  const res = await paymentApi.getPaymentById(paymentId);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Create a new payment record.
 * @param {{ reservation_id: string|number, amount: number }} payload
 * @returns {Promise<Payment>}
 */
export async function createPayment(payload) {
  const res = await paymentApi.createPayment(payload);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Upload an official receipt for the first time (pending → submitted).
 * Uses POST /payments/:id/receipt
 * @param {string|number} paymentId
 * @param {File} file
 * @param {string} [transactionReference]
 * @returns {Promise<Payment>}
 */
export async function uploadReceipt(paymentId, file, transactionReference = "") {
  const formData = new FormData();
  formData.append("receipt", file);
  if (transactionReference) formData.append("transaction_reference", transactionReference);
  const res = await paymentApi.uploadReceipt(paymentId, formData);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Upload alternative proof for the first time (pending → submitted).
 * Uses POST /payments/:id/proof
 * e.g. screenshot, phone photo, other evidence
 * @param {string|number} paymentId
 * @param {File} file
 * @param {string} [transactionReference]
 * @returns {Promise<Payment>}
 */
export async function uploadProof(paymentId, file, transactionReference = "") {
  const formData = new FormData();
  formData.append("receipt", file); // ✅ key is "receipt" per Postman
  if (transactionReference) formData.append("transaction_reference", transactionReference);
  const res = await paymentApi.uploadProof(paymentId, formData);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Replace an existing proof after rejection (failed → submitted).
 * Uses PATCH /payments/:id/proof
 * @param {string|number} paymentId
 * @param {File} file
 * @param {string} [transactionReference]
 * @returns {Promise<Payment>}
 */
export async function replaceProof(paymentId, file, transactionReference = "") {
  const formData = new FormData();
  formData.append("receipt", file); // ✅ key is "receipt" per Postman
  if (transactionReference) formData.append("transaction_reference", transactionReference);
  const res = await paymentApi.replaceProof(paymentId, formData);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Smart upload — picks the correct endpoint based on status and upload type:
 *
 *   status = "failed"            → PATCH /payments/:id/proof      (replace after rejection)
 *   status = "pending" + "proof" → POST  /payments/:id/proof      (alternative evidence)
 *   status = "pending" + "receipt" (default) → POST /payments/:id/receipt (official slip)
 *
 * @param {string|number} paymentId
 * @param {string} currentStatus
 * @param {File} file
 * @param {"receipt"|"proof"} uploadType - defaults to "receipt"
 * @returns {Promise<Payment>}
 */
export async function submitProof(
  paymentId,
  currentStatus,
  file,
  uploadType = UPLOAD_TYPES.RECEIPT,
  transactionReference = "",
) {
  // Re-upload after rejection — always use PATCH /proof
  if (canReplaceProof(currentStatus)) {
    return replaceProof(paymentId, file, transactionReference);
  }

  // First-time upload — pick endpoint based on what the customer has
  if (uploadType === UPLOAD_TYPES.PROOF) {
    return uploadProof(paymentId, file, transactionReference); // POST /proof  (screenshot/photo)
  }

  return uploadReceipt(paymentId, file, transactionReference); // POST /receipt (official bank slip)
}

/**
 * Fetch proof/receipt details for a payment.
 * @param {string|number} paymentId
 * @returns {Promise<ProofDetails>}
 */
export async function getProofDetails(paymentId) {
  const res = await paymentApi.getProofDetails(paymentId);
  return res?.data?.data ?? res?.data ?? res;
}

// ─── Property-level operations ────────────────────────────────────────────────

/**
 * Fetch the KHQR/Bakong payment accounts for a property.
 * @param {string|number} propertyId
 * @returns {Promise<PaymentAccount[]>}
 */
export async function getPropertyPaymentAccounts(propertyId) {
  const res = await paymentApi.getPropertyPaymentAccounts(propertyId);
  return res?.data?.data ?? res?.data ?? res ?? [];
}
