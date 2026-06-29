import http from "@/app/api/http";

export const reservationApi = {
  // Customer
  createReservation(data) {
    return http.post(`/reservations`, data);
  },

  getMyReservations() {
    return http.get(`/reservations/my`);
  },

  getReservationById(reservationId) {
    return http.get(`/reservations/${reservationId}`);
  },

  cancelReservation(id, cancellation_reason) {
    return http.patch(`/reservations/${id}/cancel`, { cancellation_reason })
  },

  // Owner
  listOwnerReservations() {
    return http.get(`/owner/reservations`);
  },

  getOwnerReservationById(reservationId) {
    return http.get(`/owner/reservations/${reservationId}`);
  },

  updateOwnerReservationStatus(reservationId, data) {
    return http.patch(`/owner/reservations/${reservationId}/status`, data);
  }
};
