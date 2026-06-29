import http from '@/app/api/http';

const noCache = {
  headers: { 'Cache-Control': 'no-cache' },
  params: { _t: Date.now() },
};

const reviewApi = {
  // ── Customer ────────────────────────────────────────────────────────
  // GET /reviews/my
  getMyReviews() {
    return http.get('/reviews/my', noCache);
  },

  // POST /reservations/:reservationId/reviews  { rating, comment }
  createReview(reservationId, payload) {
    return http.post(`/reservations/${reservationId}/reviews`, payload);
  },

  // PATCH /reviews/:id  { rating, comment }
  updateReview(reviewId, payload) {
    return http.patch(`/reviews/${reviewId}`, payload);
  },

  // DELETE /reviews/:id
  deleteReview(reviewId) {
    return http.delete(`/reviews/${reviewId}`);
  },

  // ── Public ──────────────────────────────────────────────────────────
  // GET /reviews/properties/:propertyId/reviews
  getPropertyReviews(propertyId) {
    return http.get(`/reviews/properties/${propertyId}/reviews`, noCache);
  },

  // ── Owner ───────────────────────────────────────────────────────────
  // GET /reviews/owner
  getOwnerReviews() {
    return http.get('/reviews/owner', noCache);
  },

  // PATCH /reviews/:id/reply  { owner_reply: string }
  replyToReview(reviewId, ownerReply) {
    return http.patch(`/reviews/${reviewId}/reply`, { owner_reply: ownerReply });
  },

  // ── Admin ───────────────────────────────────────────────────────────
  // GET /admin/reviews
  getAllReviews() {
    return http.get('/admin/reviews', noCache);
  },
};

export default reviewApi;