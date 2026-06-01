<script setup>
import { computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { BellIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { getNotificationRouteByRole } from "@/shared/utils/roleRoutes";

const props = defineProps({
  solid: {
    type: Boolean,
    default: true,
  },
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const notificationRoute = computed(() => getNotificationRouteByRole(authStore.user?.role));

const buttonClass = computed(() => [
  "relative flex h-10 w-10 items-center justify-center rounded-full border transition",
  props.solid
    ? "border-(--color-border) bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary)"
    : "border-white/20 bg-white/10 text-white hover:bg-white/20",
]);

const syncUnreadCount = () => {
  if (!authStore.isAuthenticated) {
    notificationStore.reset();
    return;
  }

  notificationStore.fetchUnreadCount();
};

onMounted(syncUnreadCount);

watch(
  () => authStore.isAuthenticated,
  syncUnreadCount,
);
</script>

<template>
  <RouterLink
    v-if="notificationRoute"
    :to="notificationRoute"
    :class="buttonClass"
    aria-label="Notifications"
  >
    <BellIcon class="h-5 w-5" />
    <span
      v-if="notificationStore.hasUnread"
      class="absolute -right-1 -top-1 min-w-5 rounded-full bg-(--color-danger) px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white ring-2 ring-(--color-surface)"
    >
      {{ notificationStore.unreadLabel }}
    </span>
  </RouterLink>
</template>
