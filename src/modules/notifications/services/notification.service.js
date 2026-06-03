import { notificationApi } from "@/modules/notifications/api/notification.api";

export const notificationService = {
  list(params) {
    return notificationApi.list(params);
  },

  getUnreadCount() {
    return notificationApi.getUnreadCount();
  },

  getById(notificationId) {
    return notificationApi.getById(notificationId);
  },

  markAsRead(notificationId) {
    return notificationApi.markAsRead(notificationId);
  },

  markAllAsRead() {
    return notificationApi.markAllAsRead();
  },

  archive(notificationId) {
    return notificationApi.archive(notificationId);
  },
};
