import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { roomService } from "@/modules/rooms/services/roomService";
import { getOwnerProperties } from "@/modules/properties/services/propertyService";

const BASE_URL = "https://api-srokyerng.devspace.linkpc.net";

export const useRoomStore = defineStore("rooms", () => {
  const loading = ref(false);
  const error = ref(null);
  const rawProperties = ref([]);
  const rooms = ref([]);
  const selectedPropertyId = ref("all");

  // New: Store images by room ID
  const roomImages = ref({}); // { roomId: [{id, image_url, is_cover, ...}] }

  const propertyFilterTabs = computed(() => {
    const propertyTabs = rawProperties.value.map((property) => {
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

  const fetchRoomsData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const propertiesRes = await getOwnerProperties();

      const propertiesList = Array.isArray(propertiesRes)
        ? propertiesRes
        : propertiesRes?.data || [];

      rawProperties.value = propertiesList.map((p) => ({
        id: p.id,
        name: p.property_name,
        city: p.city,
        status: p.status_name,
        cover_image: p.cover_image,
      }));

      const allRooms = [];
      for (const property of rawProperties.value) {
        try {
          const roomsRes = await roomService.getMyRooms(property.id);
          const propertyRooms = Array.isArray(roomsRes?.data)
            ? roomsRes.data
            : Array.isArray(roomsRes)
              ? roomsRes
              : [];

          const normalized = propertyRooms.map((r) => ({
            ...r,
            property_id: r.property_id || property.id,
            propertyName: property.name,
            type: r.room_name || r.type_name || "Room",
            basePrice: r.price_per_night || 0,
            guests: r.max_guests || 0,
            size: r.size || "-",
            description: r.description || "-",
            image: r.cover_image || "",
            inventory: r.total_rooms || 0,
          }));

          allRooms.push(...normalized);
        } catch {
          // skip if property has no rooms
        }
      }

      rooms.value = allRooms;
      selectedPropertyId.value = "all";

      // Auto fetch images for all rooms after loading
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
      const res = await roomService.createRoom(propertyId, roomData);
      const newRoom = res?.data || res;
      if (newRoom) rooms.value.push(newRoom);
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
      // Refresh images for this room
      await fetchRoomImages(roomId);
      return res;
    } catch (err) {
      console.error(err);
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
  };
});
