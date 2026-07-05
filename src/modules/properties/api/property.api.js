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

  getOwnerReservations() {
    return http.get(`/owner/reservations`);
  },

  getCities() {
    return http.get(`/properties/cities`);
  },

  getCategories() {
    return http.get(`/properties/categories`);
  },

  // ── NEW: Pending Edit Request APIs ──────────────────────────────────────────

  // Submit a pending edit request for an approved property
  // POST /properties/:id/edit-requests
  submitEditRequest(propertyId, payload) {
    return http.post(`/properties/${propertyId}/edit-requests`, payload);
  },

  // Get the current pending edit request for a property (if any)
  // GET /properties/:id/edit-requests/pending
  getPendingEditRequest(propertyId) {
    return http.get(`/properties/${propertyId}/edit-requests/pending`);
  },

  // Get all edit requests for a property (history)
  // GET /properties/:id/edit-requests
  getEditRequests(propertyId) {
    return http.get(`/properties/${propertyId}/edit-requests`);
  },
  deactivateProperty(propertyId) {
    return http.patch(`/owner/properties/${propertyId}/deactivate`);
  },

  activateProperty(propertyId) {
    return http.patch(`/owner/properties/${propertyId}/activate`);
  },
};
