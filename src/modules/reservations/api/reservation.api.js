import http from "@/app/api/http";

export const reservationApi = {
  listOwnerReservations(params) {
    return http.get("/reservations/owner", { params });
  },

  listCustomerReservations(params) {
    return http.get("/reservations", { params });
  },

  getReservationById(reservationId) {
    return http.get(`/reservations/${reservationId}`);
  },

  createReservation(payload) {
    return http.post("/reservations", payload);
  },

  checkAvailability(payload) {
    return http.post("/reservations/check-availability", payload);
  },
};
