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

const normalizeProperty = (item, index) => {
  // Build full image URLs from images array
  const allImages = Array.isArray(item.images)
    ? item.images
        .map((img) => {
          const url = typeof img === "string" ? img : img?.image_url || "";
          return url
            ? url.startsWith("http")
              ? url
              : `${BASE_URL}${url}`
            : "";
        })
        .filter(Boolean)
    : [];

  // Get cover image — prefer is_cover flag, fallback to first image
  const coverFromImages =
    item.images?.find((i) => i.is_cover === 1)?.image_url ||
    item.images?.[0]?.image_url;

  const rawCover =
    item.cover_image ||
    item.coverImage ||
    item.image_url ||
    coverFromImages ||
    allImages[0];

  // null when there's no real image — component decides what to show
  const coverImage = rawCover
    ? rawCover.startsWith("http")
      ? rawCover
      : `${BASE_URL}${rawCover}`
    : null;

  // Always provide 3 image slots (fill with cover/null if fewer than 3)
  const imagesArray =
    allImages.length > 0
      ? [
          allImages[0] || coverImage,
          allImages[1] || coverImage,
          allImages[2] || coverImage,
        ]
      : [coverImage, coverImage, coverImage];

  return {
    id: item.id ?? item.property_id ?? index + 1,
    name: item.property_name || item.name || `Property ${index + 1}`,
    city: String(
      typeof item.city === "string"
        ? item.city
        : item.city?.city_name ||
            item.city?.name ||
            item.city_name ||
            item.address ||
            "",
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-"),
    location:
      typeof item.city === "string"
        ? item.city
        : item.city?.city_name ||
          item.city?.name ||
          item.city_name ||
          item.address ||
          "",
    status:
      item.status?.status_name || item.status_name || item.status || "pending",
    type: String(
      item.type ||
        item.property_type ||
        item.category?.category_name ||
        item.category_name ||
        "hotel",
    )
      .trim()
      .toLowerCase(),
    price: Number(
      item.price_per_night ??
        item.price ??
        item.nightly_price ??
        item.base_price ??
        0,
    ),
    rating: Number(item.rating ?? item.average_rating ?? 4.8),
    reviews: Number(item.reviews ?? item.review_count ?? 0),
    rooms: item.rooms ?? item.room_count ?? 0,
    bookings: item.bookings ?? item.booking_count ?? 0,
    revenue: item.revenue ?? 0,
    floors: item.number_of_floors ?? item.floors ?? null,
    image: coverImage,
    description:
      item.description ||
      item.short_description ||
      item.address ||
      "Approved property",
    raw: item,
    images: imagesArray,
  };
};

// Groups reservations by property_id and computes booking count + revenue.
// - "cancelled" reservations are excluded from the bookings count entirely.
// - Revenue only counts "confirmed" and "completed" reservations
//   (pending bookings haven't been paid/confirmed yet).
const buildReservationStats = (reservations) => {
  const stats = {};

  for (const r of reservations) {
    const propertyId = r.property_id;
    if (propertyId == null) continue;

    if (!stats[propertyId]) {
      stats[propertyId] = { bookings: 0, revenue: 0 };
    }

    if (r.reservation_status === "cancelled") continue;

    stats[propertyId].bookings += 1;

    if (["confirmed", "completed"].includes(r.reservation_status)) {
      stats[propertyId].revenue += parseFloat(r.total_amount) || 0;
    }
  }

  return stats;
};

export const usePropertyStore = defineStore("properties", () => {
  const loading = ref(false);
  const error = ref("");
  const properties = ref([]);
  const property = ref(null);
  const myProperties = ref([]);

  // ── Image state (used by Edit modal) ────────────────────────────────
  const propertyImages = ref([]); // raw image objects from API: { id, image_url, is_cover, sort_order }
  const imagesLoading = ref(false);
  const imagesError = ref("");

  const approvedProperties = computed(() => properties.value);

  // Derive current cover id from propertyImages
  const coverId = computed(() => {
    const cover = propertyImages.value.find(
      (i) => i.is_cover === 1 || i.is_cover === true,
    );
    return cover?.id ?? propertyImages.value[0]?.id ?? null;
  });

  // ── Fetch approved (public) ──────────────────────────────────────────
  const fetchApprovedProperties = async (params) => {
    loading.value = true;
    error.value = "";
    try {
      // ✅ Remove default/empty values before sending to API
      const cleanParams = {};
      if (params?.search) cleanParams.search = params.search;
      if (params?.city && params.city !== "all") cleanParams.city = params.city;
      if (params?.type && params.type !== "all") cleanParams.type = params.type;

      const response = await propertyApi.getAllApprovedProperties(cleanParams);
      const items = Array.isArray(response) ? response : response?.data || [];
      properties.value = items.map((item, index) =>
        normalizeProperty(item, index),
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

      property.value = normalizeProperty(payload, 0);
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

      // First pass: normalise without images (shows fallback instantly)
      myProperties.value = items.map((item, index) =>
        normalizeProperty(item, index),
      );

      // Fetch all owner reservations ONCE (not per-property) and build
      // a property_id -> { bookings, revenue } lookup
      let reservationStats = {};
      try {
        const resvRes = await propertyApi.getOwnerReservations();
        const reservations = Array.isArray(resvRes)
          ? resvRes
          : (resvRes?.data ?? []);
        reservationStats = buildReservationStats(reservations);
      } catch {
        // If this call fails, bookings/revenue just stay at 0 — don't
        // block the rest of the property list from loading.
      }

      // Second pass: fetch real images AND room counts for each property in parallel
      await Promise.allSettled(
        items.map(async (item, index) => {
          try {
            // Fetch images and room count in parallel for each property
            const [imgRes, roomsRes] = await Promise.allSettled([
              propertyApi.getAllPropertyImages(item.id),
              propertyApi.getPropertyRooms(item.id),
            ]);

            // ── Images ──────────────────────────────────────────────
            if (imgRes.status === "fulfilled") {
              const imgs = Array.isArray(imgRes.value)
                ? imgRes.value
                : (imgRes.value?.data ?? []);

              if (imgs.length) {
                const fullUrls = imgs
                  .map((img) => {
                    const url = img?.image_url || "";
                    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
                  })
                  .filter(Boolean);

                const coverImg = imgs.find((i) => i.is_cover === 1) || imgs[0];
                const coverUrl = coverImg?.image_url
                  ? coverImg.image_url.startsWith("http")
                    ? coverImg.image_url
                    : `${BASE_URL}${coverImg.image_url}`
                  : fullUrls[0] || null;

                myProperties.value[index] = {
                  ...myProperties.value[index],
                  image: coverUrl,
                  images: [
                    fullUrls[0] || coverUrl,
                    fullUrls[1] || coverUrl,
                    fullUrls[2] || coverUrl,
                  ],
                };
              }
            }

            // ── Room count ──────────────────────────────────────────
            if (roomsRes.status === "fulfilled") {
              const roomData = Array.isArray(roomsRes.value)
                ? roomsRes.value
                : (roomsRes.value?.data ?? []);

              myProperties.value[index] = {
                ...myProperties.value[index],
                rooms: Array.isArray(roomData) ? roomData.length : 0,
              };
            }

            // ── Bookings & Revenue ────────────────────────────────────
            const stat = reservationStats[item.id];
            if (stat) {
              myProperties.value[index] = {
                ...myProperties.value[index],
                bookings: stat.bookings,
                revenue: stat.revenue,
              };
            }
          } catch {
            // silently keep existing state for this property
          }
        }),
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
        myProperties.value.unshift(normalizeProperty(item, 0));
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

  // ── Owner: fetch property images ─────────────────────────────────────
  const fetchPropertyImages = async (propertyId) => {
    imagesLoading.value = true;
    imagesError.value = "";
    propertyImages.value = [];
    try {
      const res = await propertyApi.getAllPropertyImages(propertyId);
      // Normalise: API may return array directly or wrapped in .data
      const imgs = Array.isArray(res) ? res : (res?.data ?? []);
      propertyImages.value = imgs;
      return imgs;
    } catch (err) {
      imagesError.value = err?.message || "Failed to load images.";
      propertyImages.value = [];
    } finally {
      imagesLoading.value = false;
    }
  };

  // ── Owner: upload images ─────────────────────────────────────────────
  // POST /properties/:id/images  (form-data key: "images")
  const uploadPropertyImages = async (propertyId, files) => {
    imagesLoading.value = true;
    imagesError.value = "";
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      await propertyApi.uploadPropertyImages(propertyId, formData);
      // Reload images so the grid updates
      await fetchPropertyImages(propertyId);
      // Refresh the property card so cover image is up to date
      await fetchMyProperties();
    } catch (err) {
      imagesError.value = err?.message || "Failed to upload images.";
      throw err;
    } finally {
      imagesLoading.value = false;
    }
  };

  // ── Owner: delete one image ──────────────────────────────────────────
  // DELETE /properties/:propertyId/images/:imageId
  const deletePropertyImage = async (propertyId, imageId) => {
    try {
      await propertyApi.deletePropertyImage(propertyId, imageId);
      // Remove from local state immediately (optimistic)
      propertyImages.value = propertyImages.value.filter(
        (i) => i.id !== imageId,
      );
      // Refresh property list so card reflects new cover
      await fetchMyProperties();
    } catch (err) {
      imagesError.value = err?.message || "Failed to delete image.";
      throw err;
    }
  };

  // ── Owner: set cover image ───────────────────────────────────────────
  // PATCH /properties/:propertyId/images/:imageId/cover
  const setCoverImage = async (propertyId, imageId) => {
    try {
      await propertyApi.setCoverImage(propertyId, imageId);
      // Update is_cover flag locally (optimistic)
      propertyImages.value = propertyImages.value.map((i) => ({
        ...i,
        is_cover: i.id === imageId ? 1 : 0,
      }));
      // Refresh property list so card shows new cover
      await fetchMyProperties();
    } catch (err) {
      imagesError.value = err?.message || "Failed to set cover image.";
      throw err;
    }
  };

  const clearProperty = () => {
    property.value = null;
  };

  const clearImages = () => {
    propertyImages.value = [];
    imagesError.value = "";
  };

  return {
    // State
    loading,
    error,
    properties,
    property,
    myProperties,
    propertyImages,
    imagesLoading,
    imagesError,

    // Getters
    approvedProperties,
    coverId,

    // Actions
    fetchApprovedProperties,
    fetchPropertyById,
    fetchMyProperties,
    registerProperty,
    updateProperty,
    deleteProperty,
    fetchPropertyImages,
    uploadPropertyImages,
    deletePropertyImage,
    setCoverImage,
    clearProperty,
    clearImages,
  };
});
