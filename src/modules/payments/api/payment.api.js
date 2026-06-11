import http from "@/app/api/http";

export const paymentApi = {
  // Customer
  createPayment(data) {
    return http.post("/payments", data);
  },

  uploadReceipt(paymentId, formData) {
    return http.post(`/payments/${paymentId}/receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadProof(paymentId, formData) {
    return http.post(`/payments/${paymentId}/proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  replaceProof(paymentId, formData) {
    return http.patch(`/payments/${paymentId}/proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMyPayments() {
    return http.get("/payments/my");
  },

  getPaymentById(paymentId) {
    return http.get(`/payments/${paymentId}`);
  },

  getProofDetails(paymentId) {
    return http.get(`/payments/${paymentId}/proof`);
  },

  getPropertyPaymentAccounts(propertyId) {
    return http.get(`/properties/${propertyId}/payment-accounts`);
  },
};
