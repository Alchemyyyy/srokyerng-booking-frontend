import http from "@/app/api/http";

export const wishlistApi = {
  getWishlists: async () => {
    const response = await http.get("/wishlists/my");
    return response;
  },

  addToWishlist: async (propertyId) => {
    const response = await http.post(`/wishlists/properties/${propertyId}`);
    return response;
  },

  removeFromWishlist: async (propertyId) => {
    const response = await http.delete(`/wishlists/properties/${propertyId}`);
    return response;
  },

  checkStatus: async (propertyId) => {
    const response = await http.get(`/wishlists/properties/${propertyId}/status`);
    return response;
  },
};

