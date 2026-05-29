import { userApi } from "@/modules/users/api/user.api";

export const userService = {
  getMe() {
    return userApi.getMe();
  },

  updateMe(payload) {
    return userApi.updateMe(payload);
  },

  changePassword(payload) {
    return userApi.changePassword(payload);
  },

  updateProfileImage(file) {
    return userApi.updateProfileImage(file);
  },

  listUsers(params) {
    return userApi.listUsers(params);
  },

  getUserById(userId) {
    return userApi.getUserById(userId);
  },

  updateUserStatus(userId, payload) {
    return userApi.updateUserStatus(userId, payload);
  },
};
