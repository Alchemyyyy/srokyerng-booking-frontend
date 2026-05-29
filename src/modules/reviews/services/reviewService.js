import api from "@/shared/services/api";

// CREATE
export const createReview = async (
  reservationId,
  payload
) => {
  const response = await api.post(
    `/reviews/reservations/${reservationId}/reviews`,
    payload
  );

  return response.data;
};

// PROPERTY REVIEWS
export const getPropertyReviews = async (
  propertyId
) => {
  const response = await api.get(
    `/reviews/properties/${propertyId}/reviews`
  );

  return response.data;
};

// CUSTOMER REVIEWS
export const getCustomerReviews = async () => {
  const response = await api.get(
    `/reviews/customer/reviews`
  );

  return response.data;
};

// UPDATE
export const updateReview = async (
  reviewId,
  payload
) => {
  const response = await api.patch(
    `/reviews/${reviewId}`,
    payload
  );

  return response.data;
};

// DELETE
export const deleteReview = async (
  reviewId
) => {
  const response = await api.delete(
    `/reviews/${reviewId}`
  );

  return response.data;
};

// ADMIN
export const getAllReviews = async () => {
  const response = await api.get(
    `/reviews/admin/reviews`
  );

  return response.data;
};