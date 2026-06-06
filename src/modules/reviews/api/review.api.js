import http from '@/app/api/http';

const reviewApi = {
  async getPropertyReviews(propertyId) {
    return http.get(`/properties/${propertyId}/reviews`);
  },

  async createReview(reservationId, payload) {
    return http.post(`/reservations/${reservationId}/reviews`, payload);
  },

  async getMyReviews() {
    return http.get('/reviews/my');
  },

  async updateReview(reviewId, payload) {
    return http.patch(`/reviews/${reviewId}`, payload);
  },

  async deleteReview(reviewId) {
    return http.delete(`/reviews/${reviewId}`);
  },

  async getAllReviews() {
    return http.get('/admin/reviews');
  }
};

export default reviewApi;