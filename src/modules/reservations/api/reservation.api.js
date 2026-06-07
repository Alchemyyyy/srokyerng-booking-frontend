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

  cancelReservation(reservationId) {
    return http.patch(`/reservations/${reservationId}/cancel`);
  },

  // Owner
  listOwnerReservations() {
    return http.get(`/owner/reservations`);
  },

  getOwnerReservationById(reservationId) {
    return http.get(`/owner/reservations/${reservationId}`);
  },
};
