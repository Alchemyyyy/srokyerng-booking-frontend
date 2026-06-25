import http from "@/app/api/http";

export const userApi = {
  getMe() {
    return http.get("/users/me");
  },

  updateMe(payload) {
    return http.patch("/users/me", payload);
  },

  changePassword(payload) {
    return http.patch("/users/me/password", payload);
  },

  updateProfileImage(file) {
    const formData = new FormData();
    formData.append("profile_image", file);

    return http.patch("/users/me/profile-image", formData);
  },

  deleteProfileImage() {
    return http.delete("/users/me/profile-image");
  },

  listUsers(params) {
    return http.get("/users", { params });
  },

  getUserById(userId) {
    return http.get(`/users/${userId}`);
  },

  updateUserStatus(userId, payload) {
    return http.patch(`/users/${userId}/status`, payload);
  },
};
