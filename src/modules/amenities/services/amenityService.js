import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// ─────────────────────────────────────
// GET ALL AMENITIES
// ─────────────────────────────────────
export const getAllAmenities = async () => {
  const response = await api.get("/amenities");

  return response.data.data || [];
};

// ─────────────────────────────────────
// GET PROPERTY AMENITIES
// ─────────────────────────────────────
export const getPropertyAmenities = async (propertyId) => {
  const response = await api.get(
    `/amenities/properties/${propertyId}/amenities`
  );

  return response.data.data || [];
};

// ─────────────────────────────────────
// UPDATE PROPERTY AMENITIES
// ─────────────────────────────────────
export const updatePropertyAmenities = async (
  propertyId,
  amenityIds
) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/amenities/properties/${propertyId}/amenities`,
    {
      amenity_ids: amenityIds,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};