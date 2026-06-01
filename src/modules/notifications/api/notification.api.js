import http from "@/app/api/http";

export const notificationApi = {
  list(params) {
    return http.get("/notifications", { params });
  },

  getUnreadCount() {
    return http.get("/notifications/unread-count");
  },

  getById(notificationId) {
    return http.get(`/notifications/${notificationId}`);
  },

  markAsRead(notificationId) {
    return http.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead() {
    return http.patch("/notifications/mark-all-read");
  },

  archive(notificationId) {
    return http.patch(`/notifications/${notificationId}/archive`);
  },
};
