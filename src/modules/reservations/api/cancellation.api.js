import http from '@/app/api/http'

export const cancellationApi = {
  /**
   * GET /reservations/:id
   * Get reservation details including status
   */
  getReservationById(id) {
    return http.get(`/reservations/${id}`)
  },

  /**
   * PATCH /reservations/:id/cancel
   * Body: { cancellation_reason: string }
   */
  cancelReservation(id, cancellation_reason) {
    return http.patch(`/reservations/${id}/cancel`, { cancellation_reason })
  },

  /**
   * GET /properties/:id/images
   * Get all images for a property
   */
  getPropertyImages(propertyId) {
    return http.get(`/properties/${propertyId}/images`)
  },

  /**
   * PATCH /owner/payments/:id/refund
   * Body: { notes: string }
   */
  refundPayment(paymentId, notes = '') {
    return http.patch(`/owner/payments/${paymentId}/refund`, { notes })
  },
}