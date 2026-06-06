import http from "@/app/api/http";
const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api-srokyerng.devspace.linkpc.net/api";

export const reservationApi = {
  listOwnerReservations() {
    return http.get(`${BASE}/owner/reservations`);
  },

  getOwnerReservationById(reservationId) {
    return http.get(`${BASE}/owner/reservations/${reservationId}`);
  },

  getMyReservations() {
    return http.get(`${BASE}/customer/reservations`);
  },
};
