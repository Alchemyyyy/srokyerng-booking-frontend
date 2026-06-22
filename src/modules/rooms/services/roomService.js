import { roomApi } from "@/modules/rooms/api/room.api";

export const roomService = {
  async getMyRooms(propertyId = null) {
    const res = await roomApi.getMyRooms(propertyId);
    return res.data;
  },

  async createRoom(propertyId, roomData) {
    const res = await roomApi.createRoom(propertyId, roomData);
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
    const res = await roomApi.uploadRoomImages(roomId, formData); // missing this
    return res.data;
  },

  async setCoverImage(roomId, imageId) {
    const res = await roomApi.setCoverImage(roomId, imageId);
    return res.data;
  },

  async deleteRoomImage(roomId, imageId) {
    const res = await roomApi.deleteRoomImage(roomId, imageId);
    return res.data;
  },
};
