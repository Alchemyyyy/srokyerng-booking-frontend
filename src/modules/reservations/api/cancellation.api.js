import http from '@/app/api/http';

const noCache = {
  headers: { 'Cache-Control': 'no-cache' },
  params: { _t: Date.now() },
};

export const cancellationApi = {
  getReservationById(id) {
    return http.get(`/reservations/${id}`, noCache);
  },

  getMyPayments() {
    return http.get('/payments/my', noCache);
  },

  getPropertyImages(propertyId) {
    return http.get(`/properties/${propertyId}/images`, noCache);
  },

  getCancellationPolicy(id) {
    return http.get(`/reservations/${id}/cancellation-policy`, noCache);
  },

  cancelReservation(id, cancellation_reason) {
    // PATCH /api/reservations/:id/cancel
    return http.patch(`/reservations/${id}/cancel`, { cancellation_reason });
  },

  // POST /api/reservations/:id/refund-request
  // body: { amount: number, reason: string }
  requestRefund(id, payload) {
    return http.post(`/reservations/${id}/refund-request`, payload);
  },

  getMyRefundRequests() {
    return http.get('/reservations/my/refund-requests', noCache);
  },
};