import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://api-srokyerng.devspace.linkpc.net/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// GET ALL AMENITIES
// GET /api/amenities
// ==========================================
export const getAllAmenities = async () => {
  try {
    const response = await api.get("/amenities");
    return response.data.data || response.data || [];
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
    const response = await api.get(`/properties/${propertyId}/amenities`);
    return response.data.data || response.data || [];
  } catch (error) {
    // 404 = no amenities assigned yet, not a real error
    if (error.response?.status === 404) return [];
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
  const response = await api.put(
    `/properties/${propertyId}/amenities`,
    { amenity_ids: amenityIds ?? [] }
  );
  return response.data;
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

  const response = await api.post(
    `/properties/${propertyId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data?.image || response.data?.data?.image || null;
};