import http from '@/app/api/http';

// These two endpoints return frequently-changing data (new reviews can be
// added/edited/deleted at any time). The browser was caching responses and
// returning 304 Not Modified with stale data, so every request bypasses
// the HTTP cache explicitly.
const noCache = {
  headers: { 'Cache-Control': 'no-cache' },
  params: { _t: Date.now() },
};

const reviewApi = {
  async getPropertyReviews(propertyId) {
    return http.get(`/properties/${propertyId}/reviews`, noCache);
  },

  async createReview(reservationId, payload) {
    return http.post(`/reservations/${reservationId}/reviews`, payload);
  },

  async getMyReviews() {
    return http.get('/reviews/my', noCache);
  },

  async updateReview(reviewId, payload) {
    return http.patch(`/reviews/${reviewId}`, payload);
  },

  async deleteReview(reviewId) {
    return http.delete(`/reviews/${reviewId}`);
  },

  async getAllReviews() {
    return http.get('/admin/reviews', noCache);
  }
};

export default reviewApi;