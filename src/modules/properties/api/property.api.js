import http from "@/app/api/http";

export const propertyApi = {
  getAllApprovedProperties(params) {
    return http.get(`/properties`, { params });
  },

  getApprovedPropertyById(propertyId) {
    return http.get(`/properties/${propertyId}`);
  },

  getAllPropertyImages(propertyId) {
    return http.get(`/properties/${propertyId}/images`);
  },

  setCoverImage(propertyId, imageId) {
    return http.patch(`/properties/${propertyId}/images/${imageId}/cover`);
  },

  getMyProperties(params) {
    return http.get(`/properties/my`, { params });
  },
  getMyPropertyById(propertyId) {
    return http.get(`/properties/my/${propertyId}`);
  },

  registerProperty(payload) {
    return http.post(`/properties`, payload);
  },

  updateProperty(propertyId, payload) {
    return http.patch(`/properties/${propertyId}`, payload);
  },

  deleteProperty(propertyId) {
    return http.delete(`/properties/${propertyId}`);
  },

  uploadPropertyImages(propertyId, formData) {
    return http.post(`/properties/${propertyId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePropertyImage(propertyId, imageId) {
    return http.delete(`/properties/${propertyId}/images/${imageId}`);
  },
  getPropertyRooms(propertyId) {
    return http.get(`/properties/${propertyId}/rooms`);
  },
  getPropertyReviews(propertyId) {
    return http.get(`/properties/${propertyId}/reviews`);
  },
  getPropertyAmenities(propertyId) {
    return http.get(`/properties/${propertyId}/amenities`);
  },

  // All reservations across every property this owner manages —
  // used to compute bookings count + revenue per property.
  getOwnerReservations() {
    return http.get(`/owner/reservations`);
  },

  // [{ id, province_id, name }] — used to resolve city_id/province_id
  // from the city name picked in the location dropdown.
  getCities() {
    return http.get(`/properties/cities`);
  },
};
