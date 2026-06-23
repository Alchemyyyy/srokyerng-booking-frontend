import adminApi from "../api/admin.api.js";

export const reservationService = {
  async getAllReservations(params = {}) {
    return await adminApi.get("/admin/reservations", { params });
  },

  async updateReservationStatus(id, status) {
    return await adminApi.patch(`/admin/reservations/${id}/status`, {
      status: status,
    });
  },
};
