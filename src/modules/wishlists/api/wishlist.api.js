import http from "@/app/api/http";

export const wishlistApi = {
  getWishlists: async () => {
    const response = await http.get("/wishlists/my");
    return response.data;
  },

  addToWishlist: async (propertyId) => {
    const response = await http.post(`/wishlists/properties/${propertyId}`);
    return response.data;
  },

  removeFromWishlist: async (propertyId) => {
    const response = await http.delete(`/wishlists/properties/${propertyId}`);
    return response.data;
  },

  checkStatus: async (propertyId) => {
    const response = await http.get(`/wishlists/properties/${propertyId}/status`);
    return response.data;
  },
};

