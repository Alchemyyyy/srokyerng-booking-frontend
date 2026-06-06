import http from "@/app/api/http";

export const roomApi = {
  getMyRooms(propertyId) {
    if (propertyId && propertyId !== "all") {
      return http.get(`/properties/${propertyId}/rooms/my`);
    }
    return http.get(`/properties/rooms/my`);
  },

  createRoom(propertyId, roomData) {
    return http.post(`/properties/${propertyId}/rooms`, roomData);
  },

  updateRoom(propertyId, roomId, roomData) {
    // ← Fixed: added propertyId
    return http.patch(`/properties/${propertyId}/rooms/${roomId}`, roomData);
  },

  deleteRoom(propertyId, roomId) {
    // ← Fixed
    return http.delete(`/properties/${propertyId}/rooms/${roomId}`);
  },

  // Fixed: Use consistent endpoint
  uploadRoomImages(roomId, formData) {
    return http.post(`/rooms/${roomId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  setCoverImage(roomId, imageId) {
    return http.patch(`/rooms/${roomId}/images/${imageId}/cover`);
  },

  deleteRoomImage(roomId, imageId) {
    return http.delete(`/rooms/${roomId}/images/${imageId}`);
  },
};
