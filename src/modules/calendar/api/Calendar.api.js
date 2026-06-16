import http from "@/app/api/http";

export const calendarApi = {
  // ── Customer / Public ──────────────────────────────────────────────────────

  /**
   * Get availability calendar for a room.
   * GET /rooms/:roomId/availability-calendar?start_date=&end_date=
   */
  getRoomCalendar(roomId, startDate, endDate) {
    return http.get(`/rooms/${roomId}/availability-calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
  },

  /**
   * Get availability calendar for a property.
   * GET /properties/:propertyId/availability-calendar?start_date=&end_date=
   */
  getPropertyCalendar(propertyId, startDate, endDate) {
    return http.get(`/properties/${propertyId}/availability-calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
  },

  // ── Owner ──────────────────────────────────────────────────────────────────

  /**
   * Get availability calendar for owner's property.
   * GET /owner/properties/:propertyId/availability-calendar?start_date=&end_date=
   */
  getOwnerPropertyCalendar(propertyId, startDate, endDate) {
    return http.get(`/owner/properties/${propertyId}/availability-calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
  },

  /**
   * Get availability calendar for owner's room.
   * GET /owner/rooms/:roomId/availability-calendar?start_date=&end_date=
   */
  getOwnerRoomCalendar(roomId, startDate, endDate) {
    return http.get(`/owner/rooms/${roomId}/availability-calendar`, {
      params: { start_date: startDate, end_date: endDate },
    });
  },
};
