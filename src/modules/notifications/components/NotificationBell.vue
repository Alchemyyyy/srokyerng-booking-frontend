<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { BellIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { getNotificationRouteByRole } from "@/shared/utils/roleRoutes";
import { useToastStore } from "@/shared/store/toastStore";

const props = defineProps({
  solid: {
    type: Boolean,
    default: true,
  },
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const route = useRoute();
const { t, locale } = useI18n({ useScope: "global" });

const dropdownOpen = ref(false);
const bellRef = ref(null);

const notificationRoute = computed(() => getNotificationRouteByRole(authStore.user?.role));
const latestNotifications = computed(() => notificationStore.notifications.slice(0, 5));
const canMarkAllAsRead = computed(
  () => notificationStore.hasUnread && !notificationStore.actionLoading,
);

const buttonClass = computed(() => [
  "group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 hover:shadow-md",
  props.solid
    ? "border-(--color-border)/60 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) text-(--color-muted) hover:border-(--color-primary)/40 hover:text-(--color-primary) hover:bg-(--color-surface-soft)/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
    : "border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]",
]);

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale.value, {
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

const markAllAsRead = async () => {
  if (!canMarkAllAsRead.value) {
    return;
  }

  try {
    await notificationStore.markAllAsRead();
    toastStore.success(t("notifications.toast.markAllRead"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.update"));
  }
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
      :aria-label="t('notifications.title')"
      @click.stop="toggleDropdown"
    >
      <BellIcon class="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-active:-rotate-12" />
      <span
        v-if="notificationStore.hasUnread"
        class="absolute -right-1 -top-1 min-w-5 rounded-full bg-gradient-to-r from-(--color-danger) to-rose-500 px-1.5 py-0.5 text-center text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-(--color-surface) animate-pulse"
      >
        {{ notificationStore.unreadLabel }}
      </span>
    </button>

    <Transition name="notification-popup">
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-3 hidden w-[400px] overflow-hidden rounded-2xl border border-(--color-border)/60 bg-(--color-surface)/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 lg:block z-50"
      >
        <div class="relative overflow-hidden border-b border-(--color-border)/60 bg-gradient-to-r from-(--color-surface-soft) to-(--color-surface) px-5 py-4">
          <!-- Ambient glow -->
          <div class="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-(--color-primary)/10 blur-xl pointer-events-none"></div>
          
          <div class="relative z-10 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-base font-bold leading-6 text-(--color-text)">
                {{ t("notifications.title") }}
              </p>
              <p class="mt-0.5 text-sm text-(--color-muted)">
                {{ t("notifications.unreadUpdates", { count: notificationStore.unreadCount }) }}
              </p>
            </div>

            <span
              v-if="notificationStore.hasUnread"
              class="shrink-0 rounded-full bg-(--color-primary-soft) border border-(--color-primary)/20 px-3 py-1 text-xs font-bold text-(--color-primary) shadow-sm"
            >
              {{ notificationStore.unreadLabel }}
            </span>
          </div>
        </div>

        <div class="bg-(--color-surface)">
          <div
            v-if="notificationStore.listLoading"
            class="px-5 py-12 text-center text-sm font-medium text-(--color-muted)"
          >
            {{ t("notifications.loading") }}
          </div>

          <div
            v-else-if="latestNotifications.length === 0"
            class="px-6 py-12 text-center"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) border border-(--color-border)/40 text-(--color-muted) shadow-inner">
              <BellIcon class="h-6 w-6" />
            </div>
            <p class="mt-4 text-base font-bold text-(--color-text)">
              {{ t("notifications.emptyTitle") }}
            </p>
            <p class="mx-auto mt-2 max-w-xs text-sm leading-6 text-(--color-muted)">
              {{ t("notifications.emptyMessage") }}
            </p>
          </div>

          <div v-else class="max-h-[360px] overflow-y-auto">
            <button
              v-for="notification in latestNotifications"
              :key="notification.id"
              type="button"
              class="group/item block w-full border-b border-(--color-border)/40 px-5 py-4 text-left transition-all duration-200 last:border-b-0 hover:bg-(--color-surface-soft)/80 hover:pl-6"
              :class="notification.is_read ? '' : 'bg-(--color-primary-soft)/20'"
              @click="markAsRead(notification)"
            >
              <div class="flex items-start gap-3">
                <span
                  class="mt-2 h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover/item:scale-125"
                  :class="
                    notification.is_read
                      ? 'bg-(--color-border)'
                      : 'bg-(--color-primary) shadow-[0_0_8px_var(--color-primary)]'
                  "
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <p class="line-clamp-1 text-sm font-bold text-(--color-text) transition-colors group-hover/item:text-(--color-primary)">
                      {{ notification.title }}
                    </p>
                    <span class="shrink-0 pt-0.5 text-[11px] font-medium text-(--color-muted)">
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

        <div class="flex items-center justify-between gap-3 border-t border-(--color-border)/60 bg-gradient-to-b from-(--color-surface) to-(--color-surface-soft) px-5 py-3.5">
          <button
            type="button"
            class="text-xs font-bold text-(--color-primary) transition hover:text-(--color-primary-strong) disabled:cursor-not-allowed disabled:text-(--color-muted)"
            :disabled="!canMarkAllAsRead"
            @click="markAllAsRead"
          >
            {{ t("notifications.markAllRead") }}
          </button>
          <RouterLink
            :to="notificationRoute"
            class="inline-flex min-h-9 items-center justify-center rounded-xl bg-gradient-to-r from-(--color-primary) to-(--color-secondary) px-4 text-xs font-bold !text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:!text-white"
            @click="closeDropdown"
          >
            {{ t("notifications.viewAll") }}
          </RouterLink>
        </div>
      </div>
    </Transition>

    <RouterLink
      :to="notificationRoute"
      class="absolute inset-0 lg:hidden"
      :aria-label="t('notifications.ariaOpen')"
    />
  </div>
</template>

<style scoped>
.notification-popup-enter-active,
.notification-popup-leave-active {
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-popup-enter-from,
.notification-popup-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
