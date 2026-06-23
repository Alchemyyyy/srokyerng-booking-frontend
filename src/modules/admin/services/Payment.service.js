import adminApi from "../api/admin.api.js";

export const paymentService = {
  // GET /admin/payments
  async getAllPayments(params = {}) {
    return await adminApi.get("/admin/payments", { params });
  },

  // GET /admin/payments/pending-verification
  async getPendingPayments(params = {}) {
    return await adminApi.get("/admin/payments/pending-verification", {
      params,
    });
  },

  // GET /admin/payments/:id
  async getPaymentById(id) {
    return await adminApi.get(`/admin/payments/${id}`);
  },

  // GET /admin/payments/:id/proof  (admin scope — returns status + receipt_image_url)
  async getPaymentProof(id) {
    return await adminApi.get(`/admin/payments/${id}/proof`);
  },

  async verifyPayment(id) {
    return await adminApi.patch(`/admin/payments/${id}/verify`);
  },

  async rejectPayment(id, reason) {
    return await adminApi.patch(`/admin/payments/${id}/reject`, {
      rejection_reason: reason,
    });
  },
};
