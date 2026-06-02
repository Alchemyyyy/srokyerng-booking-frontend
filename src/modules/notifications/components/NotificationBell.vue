<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
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
const route = useRoute();

const dropdownOpen = ref(false);
const bellRef = ref(null);

const notificationRoute = computed(() => getNotificationRouteByRole(authStore.user?.role));
const latestNotifications = computed(() => notificationStore.notifications.slice(0, 5));

const buttonClass = computed(() => [
  "relative flex h-10 w-10 items-center justify-center rounded-full border transition",
  props.solid
    ? "border-(--color-border) bg-(--color-surface-soft) text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary)"
    : "border-white/20 bg-white/10 text-white hover:bg-white/20",
]);

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const syncUnreadCount = async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.reset();
    return;
  }

  await notificationStore.fetchUnreadCount();
};

const loadDropdownNotifications = async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  await notificationStore.fetchNotifications({
    status: "all",
    page: 1,
    limit: 5,
  });
};

const openDropdown = async () => {
  dropdownOpen.value = true;
  await loadDropdownNotifications();
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const toggleDropdown = async () => {
  if (dropdownOpen.value) {
    closeDropdown();
    return;
  }

  await openDropdown();
};

const markAsRead = async (notification) => {
  if (notification.is_read || notificationStore.actionLoading) {
    return;
  }

  await notificationStore.markAsRead(notification.id);
};

const handleDocumentClick = (event) => {
  if (!bellRef.value?.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  syncUnreadCount();
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});

watch(
  () => authStore.isAuthenticated,
  syncUnreadCount,
);

watch(
  () => route.fullPath,
  () => {
    closeDropdown();
  },
);
</script>

<template>
  <div v-if="notificationRoute" ref="bellRef" class="relative">
    <button
      type="button"
      :class="buttonClass"
      :aria-expanded="dropdownOpen"
      aria-label="Notifications"
      @click.stop="toggleDropdown"
    >
      <BellIcon class="h-5 w-5" />
      <span
        v-if="notificationStore.hasUnread"
        class="absolute -right-1 -top-1 min-w-5 rounded-full bg-(--color-danger) px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white ring-2 ring-(--color-surface)"
      >
        {{ notificationStore.unreadLabel }}
      </span>
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-3 hidden w-96 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl ring-1 ring-black/5 lg:block"
    >
      <div class="flex items-center justify-between gap-3 border-b border-(--color-border) px-4 py-3">
        <div>
          <p class="text-sm font-bold text-(--color-text)">Notifications</p>
          <p class="text-xs text-(--color-muted)">
            {{ notificationStore.unreadCount }} unread
          </p>
        </div>
        <RouterLink
          :to="notificationRoute"
          class="text-xs font-bold text-(--color-primary) hover:text-(--color-primary-strong)"
          @click="closeDropdown"
        >
          View all
        </RouterLink>
      </div>

      <div
        v-if="notificationStore.listLoading"
        class="px-4 py-8 text-center text-sm font-medium text-(--color-muted)"
      >
        Loading notifications...
      </div>

      <div
        v-else-if="latestNotifications.length === 0"
        class="px-4 py-8 text-center"
      >
        <p class="text-sm font-bold text-(--color-text)">No notifications yet</p>
        <p class="mt-1 text-xs text-(--color-muted)">
          Account and booking updates will appear here.
        </p>
      </div>

      <div v-else class="max-h-[360px] overflow-y-auto">
        <button
          v-for="notification in latestNotifications"
          :key="notification.id"
          type="button"
          class="block w-full border-b border-(--color-border) px-4 py-3 text-left transition last:border-b-0 hover:bg-(--color-surface-soft)"
          :class="notification.is_read ? '' : 'bg-(--color-primary-soft)/40'"
          @click="markAsRead(notification)"
        >
          <div class="flex items-start gap-3">
            <span
              class="mt-2 h-2 w-2 shrink-0 rounded-full"
              :class="
                notification.is_read
                  ? 'bg-(--color-border)'
                  : 'bg-(--color-primary)'
              "
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-3">
                <p class="truncate text-sm font-bold text-(--color-text)">
                  {{ notification.title }}
                </p>
                <span class="shrink-0 text-[11px] font-medium text-(--color-muted)">
                  {{ formatDate(notification.created_at) }}
                </span>
              </div>
              <p class="mt-1 line-clamp-2 text-xs leading-5 text-(--color-muted)">
                {{ notification.message }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <RouterLink
      :to="notificationRoute"
      class="absolute inset-0 lg:hidden"
      aria-label="Open notifications"
    />
  </div>
</template>
