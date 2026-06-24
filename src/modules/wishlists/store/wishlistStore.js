import { defineStore } from "pinia";
import { wishlistApi } from "../api/wishlist.api";
import { useAuthStore } from "@/modules/auth/store/authStore";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    wishlistCount: (state) => state.items.length,
    isPropertySaved: (state) => (propertyId) => {
      return state.items.some((item) => Number(item.property_id) === Number(propertyId));
    },
  },

  actions: {
    async fetchWishlists() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await wishlistApi.getWishlists();
        if (response.result) {
          this.items = response.data || [];
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to fetch wishlist";
        console.error("Fetch wishlist error:", err);
      } finally {
        this.loading = false;
      }
    },

    async toggleWishlist(propertyId) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        // Option to handle unauthenticated action, like showing login modal
        return false;
      }

      const isSaved = this.isPropertySaved(propertyId);
      
      // Optimistic update
      if (isSaved) {
        this.items = this.items.filter((item) => Number(item.property_id) !== Number(propertyId));
      } else {
        // Temporarily push an object just to show it's saved locally
        this.items.push({ property_id: propertyId });
      }

      try {
        if (isSaved) {
          const response = await wishlistApi.removeFromWishlist(propertyId);
          if (!response.result) throw new Error("Failed to remove");
        } else {
          const response = await wishlistApi.addToWishlist(propertyId);
          if (!response.result) throw new Error("Failed to add");
        }
        
        // Refresh to get full data (like cover_image, price, rating if newly added)
        if (!isSaved) {
          await this.fetchWishlists();
        }
        
        return true;
      } catch (err) {
        // Revert optimistic update on error
        console.error("Toggle wishlist error:", err);
        await this.fetchWishlists();
        return false;
      }
    },

    async checkStatus(propertyId) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return false;

      try {
        const response = await wishlistApi.checkStatus(propertyId);
        if (response.result && response.data.is_saved) {
          if (!this.isPropertySaved(propertyId)) {
             // Add it locally if not present but backend says it's saved
             this.items.push({ property_id: propertyId });
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error("Check status error:", err);
        return false;
      }
    },

    clearWishlist() {
      this.items = [];
      this.error = null;
    }
  },
});
