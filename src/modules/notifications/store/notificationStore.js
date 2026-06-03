import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { notificationService } from "@/modules/notifications/services/notification.service";

export const useNotificationStore = defineStore("notifications", () => {
  const notifications = ref([]);
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const currentStatus = ref("all");
  const unreadCount = ref(0);
  const loading = ref(false);
  const listLoading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  const hasUnread = computed(() => unreadCount.value > 0);
  const unreadLabel = computed(() => (unreadCount.value > 99 ? "99+" : String(unreadCount.value)));
  const hasNotifications = computed(() => notifications.value.length > 0);

  const fetchNotifications = async ({
    status = currentStatus.value,
    page = 1,
    limit = pagination.value.limit,
  } = {}) => {
    listLoading.value = true;
    error.value = null;
    currentStatus.value = status;

    try {
      const response = await notificationService.list({
        status,
        page,
        limit,
      });
      notifications.value = response.data?.notifications ?? [];
      pagination.value = response.data?.pagination ?? {
        page,
        limit,
        total: notifications.value.length,
        total_pages: 1,
      };
      return notifications.value;
    } catch (requestError) {
      error.value = requestError.message || "Could not load notifications";
      notifications.value = [];
      throw requestError;
    } finally {
      listLoading.value = false;
    }
  };

  const fetchUnreadCount = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await notificationService.getUnreadCount();
      unreadCount.value = response.data?.unread_count ?? 0;
      return unreadCount.value;
    } catch (requestError) {
      error.value = requestError.message || "Could not load notifications";
      unreadCount.value = 0;
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const markAllAsRead = async () => {
    actionLoading.value = true;

    try {
      const response = await notificationService.markAllAsRead();
      unreadCount.value = 0;
      const readAt = new Date().toISOString();

      if (currentStatus.value === "unread") {
        notifications.value = [];
        pagination.value = {
          ...pagination.value,
          total: 0,
          total_pages: 0,
        };
      } else {
        notifications.value = notifications.value.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || readAt,
        }));
      }

      return response;
    } finally {
      actionLoading.value = false;
    }
  };

  const markAsRead = async (notificationId) => {
    actionLoading.value = true;

    try {
      const response = await notificationService.markAsRead(notificationId);
      const updatedNotification = response.data;
      notifications.value = notifications.value.map((notification) =>
        notification.id === notificationId ? updatedNotification : notification,
      );
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      return updatedNotification;
    } finally {
      actionLoading.value = false;
    }
  };

  const archive = async (notificationId) => {
    actionLoading.value = true;

    try {
      const notification = notifications.value.find((item) => item.id === notificationId);
      const response = await notificationService.archive(notificationId);
      notifications.value = notifications.value.filter((item) => item.id !== notificationId);

      if (notification && !notification.is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }

      pagination.value = {
        ...pagination.value,
        total: Math.max(0, pagination.value.total - 1),
      };

      return response;
    } finally {
      actionLoading.value = false;
    }
  };

  const reset = () => {
    notifications.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    };
    currentStatus.value = "all";
    unreadCount.value = 0;
    loading.value = false;
    listLoading.value = false;
    actionLoading.value = false;
    error.value = null;
  };

  return {
    notifications,
    pagination,
    currentStatus,
    unreadCount,
    loading,
    listLoading,
    actionLoading,
    error,
    hasUnread,
    unreadLabel,
    hasNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
    archive,
    reset,
  };
});
