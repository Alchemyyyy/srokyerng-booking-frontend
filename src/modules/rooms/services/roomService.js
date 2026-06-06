import { roomApi } from "@/modules/rooms/api/room.api";

export const roomService = {
  async getMyRooms(propertyId = null) {
    return res.data; // { success, message, data: [...] }
  },

  async createRoom(propertyId, roomData) {
    return res.data;
  },

  async updateRoom(propertyId, roomId, roomData) {
    const res = await roomApi.updateRoom(propertyId, roomId, roomData);
    return res.data;
  },

  async deleteRoom(propertyId, roomId) {
    const res = await roomApi.deleteRoom(propertyId, roomId);
    return res.data;
  },

  async uploadRoomImages(roomId, formData) {
    return res.data;
  },

  async setCoverImage(propertyId, roomId, imageId) {
    const res = await roomApi.setCoverImage(propertyId, roomId, imageId);
    return res.data;
  },

  async deleteRoomImage(propertyId, roomId, imageId) {
    const res = await roomApi.deleteRoomImage(propertyId, roomId, imageId);
    return res.data;
  },
};
