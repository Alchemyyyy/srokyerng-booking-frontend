<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { useToastStore } from "@/shared/store/toastStore";
import { socketService } from "@/shared/services/socket.service";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import ToastContainer from "@/shared/components/ToastContainer.vue";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const showAppLoader = computed(() => authStore.restoringSession);

// Global, app-lifetime listener — every NotificationBell instance reactively
// picks up the refreshed unread count via Pinia, so this doesn't need to live
// in any specific layout/component.
const handleIncomingNotification = (payload) => {
  notificationStore.fetchUnreadCount();
  if (payload?.title) {
    toastStore.info(payload.title);
  }
};

onMounted(() => {
  socketService.onNotification(handleIncomingNotification);
});

onUnmounted(() => {
  socketService.offNotification(handleIncomingNotification);
});
</script>

<template>
  <div v-if="showAppLoader" class="app-loading-screen">
    <LoadingSpinner />
  </div>
  <RouterView v-else />
  <ToastContainer />
</template>
