import http from '@/app/api/http';

export const ownerPaymentApi = {
    //payment accounts
    createOrUpdateAccount(formData) {
        return http.post('/owner/payment-accounts', formData);
    },

    getAccountDetails() {
        return http.get('/owner/payment-accounts');
    },

    updateAccount(id, formData) {
        return http.patch(`/owner/payment-accounts/${id}`, formData);
    },

    activateAccount(id) {
        return http.patch(`/owner/payment-accounts/${id}/activate`);
    },

    deactivateAccount(id) {
            return http.patch(`/owner/payment-accounts/${id}/deactivate`);
    },

    // customer payments endpoints for owner
    listOwnerPayments() {
        return http.get(`/owner/payments`);
    },

    getPaymentDetails(id) {
        return http.get(`/owner/payments/${id}`);
    },

    listPendingPayments() {
        return http.get('/owner/payments/pending-verification');
    },

    getProofDetail(id) {
        return http.get(`/payments/${id}/proof`);
    },

    verifyPayment(id) {
        return http.patch(`/owner/payments/${id}/verify`);
    },

    rejectPayment(id, data) {
        return http.patch(`/owner/payments/${id}/reject`, data);
    },

    listRefundRequests() {
        return http.get('/owner/refund-requests');
    },

    getRefundRequestDetails(id) {
        return http.get(`/owner/refund-requests/${id}`);
    },
 
    approveRefund(id, data) {
        return http.patch(`/owner/refund-requests/${id}/approve`, data);
    },
 
    rejectRefund(id, data) {
        return http.patch(`/owner/refund-requests/${id}/reject`, data);
    },
};