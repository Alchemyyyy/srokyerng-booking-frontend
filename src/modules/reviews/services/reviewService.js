import reviewApi from '../api/review.api.js'

// Backend wraps responses as { success, message, data }.
// Axios wraps that again as response.data.
// So the actual payload is response.data.data.
const unwrapData = (response, fallback = null) => response?.data?.data ?? fallback;

const reviewService = {
  async getReviews(propertyId = 1) {
    const response = await reviewApi.getPropertyReviews(propertyId);
    return unwrapData(response, []);
  },

  async getMyReviews() {
    const response = await reviewApi.getMyReviews();
    return unwrapData(response, []);
  },

  async createReview(reservationId, reviewData) {
    const response = await reviewApi.createReview(reservationId, reviewData);
    return unwrapData(response, response?.data);
  },

  async updateReview(reviewId, reviewData) {
    const response = await reviewApi.updateReview(reviewId, reviewData);
    return unwrapData(response, response?.data);
  },

  async deleteReview(reviewId) {
    const response = await reviewApi.deleteReview(reviewId);
    return unwrapData(response, response?.data);
  },

  async getReviewStats() {
    return {
      overall: 4.9,
      totalReviews: 1284,
      breakdown: [
        { stars: 5, percent: 89 },
        { stars: 4, percent: 8 },
        { stars: 3, percent: 2 },
        { stars: 2, percent: 1 },
        { stars: 1, percent: 0 }
      ]
    };
  }
};

export default reviewService;