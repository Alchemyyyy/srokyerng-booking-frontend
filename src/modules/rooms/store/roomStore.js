import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { roomService } from "@/modules/rooms/services/roomService";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

export const useRoomStore = defineStore("rooms", () => {
  const loading = ref(false);
  const error = ref(null);
  const rawProperties = ref([]);
  const rooms = ref([]);
  const selectedPropertyId = ref("all");

  // New: Store images by room ID
  const roomImages = ref({}); // { roomId: [{id, image_url, is_cover, ...}] }

  const propertyFilterTabs = computed(() => {
    const propertyTabs = rawProperties.value
      .filter((property) => property != null) // 👈 add this filter
      .map((property) => {
        const roomCount = rooms.value.filter(
          (room) => room.property_id === property.id,
        ).length;
        return { id: property.id, name: property.name, roomCount };
      });
    return [
      { id: "all", name: "All", roomCount: rooms.value.length },
      ...propertyTabs,
    ];
  });

  const filteredRooms = computed(() => {
    if (!selectedPropertyId.value || selectedPropertyId.value === "all")
      return rooms.value;
    return rooms.value.filter(
      (room) => room.property_id === selectedPropertyId.value,
    );
  });

  const getRoomMeta = (room, index) => ({
    status:
      room.status_name === "Pending"
        ? "Maintenance"
        : room.status_name || "Available",
    guests: room.max_guests || room.guests || 0,
    size: room.size || room.room_size || "-",
    description: room.description || "-",
  });

  // ==================== NEW: Room Images ====================

  const fetchRoomImages = async (roomId) => {
    if (!roomId) return [];

    // Return cached images if already loaded
    if (roomImages.value[roomId]) {
      return roomImages.value[roomId];
    }

    try {
      const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/images`);
      const data = await res.json();

      if (data.success) {
        roomImages.value[roomId] = data.data || [];
        return roomImages.value[roomId];
      }
      return [];
    } catch (err) {
      console.error(`Failed to fetch images for room ${roomId}`, err);
      roomImages.value[roomId] = [];
      return [];
    }
  };

  // Fetch images for multiple rooms (useful after loading all rooms)
  const fetchAllRoomImages = async (roomList = rooms.value) => {
    const uniqueRoomIds = [...new Set(roomList.map((r) => r.id))];
    await Promise.all(uniqueRoomIds.map((id) => fetchRoomImages(id)));
  };

  // Helper to get full image URL
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
  };

  // Get cover image for a room
  const getCoverImage = (roomId) => {
    const images = roomImages.value[roomId] || [];
    const cover = images.find((img) => img.is_cover === 1);
    const firstImage = images[0];
    return cover || firstImage
      ? getFullImageUrl(cover?.image_url || firstImage.image_url)
      : null;
  };

  // ==================== Existing Methods ====================

  const setSelectedPropertyId = (propertyId) => {
    selectedPropertyId.value = propertyId;
  };

  /**
   * A "not found" response can show up in different shapes depending on
   * whether the http client's interceptor unwraps it or not. Cover all of them:
   *  1. Real axios-style error: err.response.status === 404
   *  2. Axios-style error body:  err.response.data.message
   *  3. Already-unwrapped body (this project's http interceptor rejects with
   *     the raw JSON payload directly): err.message / err.success / err itself
   */
  const isNotFoundError = (err) => {
    if (err?.response?.status === 404) return true;

    const candidates = [
      err?.response?.data?.message,
      err?.data?.message,
      err?.message,
      typeof err === "string" ? err : null,
    ];

    // Also handle the case where err itself IS the body: { success, message }
    if (
      err &&
      typeof err === "object" &&
      "success" in err &&
      err.success === false
    ) {
      candidates.push(err.message);
    }

    return candidates.some(
      (msg) =>
        typeof msg === "string" && msg.toLowerCase().includes("not found"),
    );
  };

  const fetchRoomsData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const propertyStore = usePropertyStore();
      await propertyStore.fetchMyProperties();

      rawProperties.value = propertyStore.myProperties
        .filter((p) => p.status !== undefined) // only real properties
        .map((p) => ({
          id: p.id,
          name: p.name,
          city: p.city,
          status: p.status,
          cover_image: p.image,
        }));

      // Fetch rooms for every property IN PARALLEL instead of one at a time.
      // Promise.allSettled means one slow/failing property never blocks the rest.
      const results = await Promise.allSettled(
        rawProperties.value.map((property) =>
          roomService.getMyRooms(property.id).then((roomsRes) => ({
            property,
            roomsRes,
          })),
        ),
      );

      const allRooms = [];
      for (const result of results) {
        if (result.status === "rejected") {
          // Skip expected "not found" cases silently; log anything else.
          if (!isNotFoundError(result.reason)) {
            console.error(
              "Failed to load rooms for a property:",
              result.reason,
            );
          }
          continue;
        }

        const { property, roomsRes } = result.value;

        // Some 404s resolve instead of reject if the http interceptor
        // treats success:false as a normal response — guard for that too.
        if (roomsRes && roomsRes.success === false) {
          if (!isNotFoundError(roomsRes)) {
            console.error("Failed to load rooms for a property:", roomsRes);
          }
          continue;
        }

        const propertyRooms = Array.isArray(roomsRes?.data)
          ? roomsRes.data
          : Array.isArray(roomsRes)
            ? roomsRes
            : [];

        const normalized = propertyRooms.map((r) => ({
          ...r,
          property_id: r.property_id || property.id,
          propertyName: property.name,
          type: r.room_name || "Room",
          roomTypeName: r.type_name || "",
          basePrice: r.price_per_night || 0,
          guests: r.max_guests || 0,
          size: r.size || "-",
          description: r.description || "-",
          image: r.cover_image || "",
          inventory: r.total_rooms || 0,
        }));
        allRooms.push(...normalized);
      }

      rooms.value = allRooms;
      selectedPropertyId.value = "all";
      if (allRooms.length > 0) {
        fetchAllRoomImages(allRooms);
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load rooms.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addRoom = async (propertyId, roomData) => {
    try {
      const { imageFiles, ...roomDataWithoutImage } = roomData; // ✅ imageFiles array

      console.log("imageFiles:", imageFiles);
      console.log("imageFiles length:", imageFiles?.length);
      const res = await roomService.createRoom(
        propertyId,
        roomDataWithoutImage,
      );
      const newRoom = res?.data || res;

      if (newRoom) {
        rooms.value.push(newRoom);

        // ✅ Upload multiple images
        if (imageFiles?.length && newRoom.id) {
          const formData = new FormData();
          imageFiles.forEach((file) => formData.append("images", file)); // ✅ all files
          try {
            await roomService.uploadRoomImages(newRoom.id, formData);
            delete roomImages.value[newRoom.id];
            await fetchRoomImages(newRoom.id);
          } catch (imgErr) {
            console.error("Image upload failed:", imgErr);
          }
        }
      }

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to add room.";
      throw err;
    }
  };
  // Inside useRoomStore
  const uploadRoomImages = async (roomId, formData) => {
    try {
      const res = await roomService.uploadRoomImages(roomId, formData);
      // Clear the cache for this room first — fetchRoomImages returns
      // cached data immediately if a cache entry exists, so without this
      // the "refresh" below would just hand back the stale pre-upload list.
      delete roomImages.value[roomId];
      await fetchRoomImages(roomId);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteRoomImage = async (roomId, imageId) => {
    try {
      await roomService.deleteRoomImage(roomId, imageId);
      // Remove from local cache so the UI updates without a refetch
      if (roomImages.value[roomId]) {
        roomImages.value[roomId] = roomImages.value[roomId].filter(
          (img) => img.id !== imageId,
        );
      }
    } catch (err) {
      console.error(
        `Failed to delete image ${imageId} for room ${roomId}`,
        err,
      );
      throw err;
    }
  };

  const setRoomCoverImage = async (roomId, imageId) => {
    try {
      await roomService.setCoverImage(roomId, imageId);
      // Update local cache: mark this image as cover, unmark others
      if (roomImages.value[roomId]) {
        roomImages.value[roomId] = roomImages.value[roomId].map((img) => ({
          ...img,
          is_cover: img.id === imageId ? 1 : 0,
        }));
      }
    } catch (err) {
      console.error(
        `Failed to set cover image ${imageId} for room ${roomId}`,
        err,
      );
      throw err;
    }
  };

  const updateRoom = async (propertyId, roomId, updatedData) => {
    try {
      const res = await roomService.updateRoom(propertyId, roomId, updatedData);
      const index = rooms.value.findIndex((r) => r.id === roomId);
      if (index !== -1)
        rooms.value[index] = { ...rooms.value[index], ...res.data };
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update room.";
      throw err;
    }
  };

  const deleteRoom = async (propertyId, roomId) => {
    try {
      await roomService.deleteRoom(propertyId, roomId);
      rooms.value = rooms.value.filter((r) => r.id !== roomId);
      // Clean up images cache
      delete roomImages.value[roomId];
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete room.";
      throw err;
    }
  };

  return {
    loading,
    error,
    rawProperties,
    rooms,
    selectedPropertyId,
    propertyFilterTabs,
    filteredRooms,
    roomImages, // ← new
    fetchRoomsData,
    getRoomMeta,
    setSelectedPropertyId,
    addRoom,
    updateRoom,
    deleteRoom,
    // New image methods
    fetchRoomImages,
    fetchAllRoomImages,
    getCoverImage,
    getFullImageUrl,
    uploadRoomImages,
    deleteRoomImage,
    setRoomCoverImage,
  };
});
