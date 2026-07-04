import http from "@/app/api/http";

// ==========================================
// GET ALL AMENITIES
// GET /api/amenities
// ==========================================
export const getAllAmenities = async () => {
  try {
    const response = await http.get("/amenities");
    return response?.data || response || [];
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return [];
  }
};

// ==========================================
// GET PROPERTY AMENITIES
// GET /api/amenities/properties/:id/amenities
// Returns [] if property has no amenities yet (404)
// ==========================================
export const getPropertyAmenities = async (propertyId) => {
  try {
    const response = await http.get(`/properties/${propertyId}/amenities`);
    return response?.data || response || [];
  } catch (error) {
    // 404 = no amenities assigned yet, not a real error
    if (error?.status === 404) return [];
    console.error("Error fetching property amenities:", error);
    return [];
  }
};

// ==========================================
// UPDATE PROPERTY AMENITIES
// PUT /api/amenities/properties/:id/amenities
// Body: { amenity_ids: [1, 2, 3] }
// Sends empty array [] to clear all amenities
// ==========================================
export const updatePropertyAmenities = async (propertyId, amenityIds) => {
  const response = await http.put(
    `/properties/${propertyId}/amenities`,
    { amenity_ids: amenityIds ?? [] }
  );
  return response;
};

// ==========================================
// UPLOAD PROPERTY IMAGE
// POST /api/properties/:id  (multipart/form-data)
// Returns the saved image URL string
// ==========================================
export const uploadPropertyImage = async (propertyId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("_method", "PATCH");

  const response = await http.post(`/properties/${propertyId}`, formData);

  return response?.image || response?.data?.image || null;
};
