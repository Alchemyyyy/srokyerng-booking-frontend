import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { propertyApi } from "../api/property.api";

const BASE_URL = "https://api-srokyerng.devspace.linkpc.net";

const normalizeImages = (item) => {
  const images =
    item.images || item.property_images || item.gallery || item.media || [];

  if (Array.isArray(images)) {
    return images
      .map((image) =>
        typeof image === "string"
          ? image
          : image?.url || image?.image_url || image?.path || image?.src || "",
      )
      .filter(Boolean);
  }

  return [];
};

const normalizeProperty = (item, index, fallbackImage) => {
  const images = normalizeImages(item);

  // Get raw cover image
  const rawCover =
    item.cover_image || item.coverImage || item.image || images[0];

  // Fix relative URLs by prepending BASE_URL
  const coverImage = rawCover
    ? rawCover.startsWith("http")
      ? rawCover
      : `${BASE_URL}${rawCover}`
    : fallbackImage;

  return {
    id: item.id ?? item.property_id ?? index + 1,
    name: item.property_name || item.name || `Property ${index + 1}`,
    city: String(item.city || item.address || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-"),
    location: item.city || item.address || "",
    status: item.status_name || item.status || "pending",
    type: String(
      item.type || item.property_type || item.category_name || "hotel",
    )
      .trim()
      .toLowerCase(),
    price: Number(item.price ?? item.nightly_price ?? item.base_price ?? 0),
    rating: Number(item.rating ?? item.average_rating ?? 4.8),
    reviews: Number(item.reviews ?? item.review_count ?? 0),
    rooms: item.rooms ?? item.room_count ?? 0,
    bookings: item.bookings ?? item.booking_count ?? 0,
    revenue: item.revenue ?? 0,
    image: coverImage, // ← now has full URL
    description:
      item.description ||
      item.short_description ||
      item.address ||
      "Approved property",
    raw: item,
    images: coverImage,
  };
};

export const usePropertyStore = defineStore("properties", () => {
  const loading = ref(false);
  const error = ref("");
  const properties = ref([]);
  const property = ref(null);
  const myProperties = ref([]);

  const fallbackImage =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

  const approvedProperties = computed(() => properties.value);

  // ── Fetch approved (public) ──────────────────────────────────────────
  const fetchApprovedProperties = async (params) => {
    loading.value = true;
    error.value = "";
    try {
      const response = await propertyApi.getAllApprovedProperties(params);
      const items = Array.isArray(response) ? response : response?.data || [];
      properties.value = items.map((item, index) =>
        normalizeProperty(item, index, fallbackImage),
      );
      return properties.value;
    } catch (requestError) {
      error.value =
        requestError?.message || "Failed to load approved properties.";
      properties.value = [];
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  // ── Fetch single property ────────────────────────────────────────────
  const fetchPropertyById = async (propertyId) => {
    loading.value = true;
    error.value = "";
    try {
      const response = await propertyApi.getApprovedPropertyById(propertyId);
      const payload = Array.isArray(response)
        ? response[0]
        : response?.data || response;

      if (!payload) throw new Error("Property not found.");

      property.value = normalizeProperty(payload, 0, fallbackImage);
      return property.value;
    } catch (requestError) {
      error.value = requestError?.message || "Failed to load property details.";
      property.value = null;
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  // ── Owner: fetch my properties ───────────────────────────────────────
  const fetchMyProperties = async (params) => {
    loading.value = true;
    error.value = "";
    try {
      const response = await propertyApi.getMyProperties(params);
      const items = Array.isArray(response) ? response : response?.data || [];
      myProperties.value = items.map((item, index) =>
        normalizeProperty(item, index, fallbackImage),
      );
      return myProperties.value;
    } catch (requestError) {
      error.value = requestError?.message || "Failed to load my properties.";
      myProperties.value = [];
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  // ── Owner: create property ───────────────────────────────────────────
  const registerProperty = async (payload) => {
    loading.value = true;
    error.value = "";
    try {
      const response = await propertyApi.registerProperty(payload);
      console.log("Raw register response:", JSON.stringify(response));
      const item = response?.data?.[0] || response?.data || response;
      if (item) {
        myProperties.value.unshift(normalizeProperty(item, 0, fallbackImage));
      }
      return response;
    } catch (requestError) {
      error.value = requestError?.message || "Failed to create property.";
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  // ── Owner: update property ───────────────────────────────────────────
  const updateProperty = async (propertyId, payload) => {
    loading.value = true;
    error.value = "";
    try {
      const response = await propertyApi.updateProperty(propertyId, payload);
      await fetchMyProperties();
      return response;
    } catch (requestError) {
      error.value = requestError?.message || "Failed to update property.";
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  // ── Owner: delete property ───────────────────────────────────────────
  const deleteProperty = async (propertyId) => {
    loading.value = true;
    error.value = "";
    try {
      await propertyApi.deleteProperty(propertyId);
      myProperties.value = myProperties.value.filter(
        (p) => p.id !== propertyId,
      );
    } catch (requestError) {
      error.value = requestError?.message || "Failed to delete property.";
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  const clearProperty = () => {
    property.value = null;
  };

  return {
    loading,
    error,
    properties,
    property,
    myProperties,
    approvedProperties,
    fetchApprovedProperties,
    fetchPropertyById,
    fetchMyProperties,
    registerProperty,
    updateProperty,
    deleteProperty,
    clearProperty,
  };
});
