<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { BellIcon, XMarkIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { getNotificationRouteByRole } from "@/shared/utils/roleRoutes";
import { useToastStore } from "@/shared/store/toastStore";
import AppButton from "@/shared/components/AppButton.vue";

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
const dropdownRef = ref(null);

// The dropdown is teleported to <body> so it can never get visually
// trapped under a higher-stacked ancestor (e.g. the dashboard sidebar,
// which sits above the fixed header this bell lives in). Since it's no
// longer positioned relative to the button, its coordinates are computed
// from the button's own bounding box instead of CSS `absolute` offsets.
const dropdownStyle = ref({ top: "0px", right: "0px" });

const updateDropdownPosition = () => {
  if (!bellRef.value) return;
  const rect = bellRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 12}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
};

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
  updateDropdownPosition();
  dropdownOpen.value = true;
  window.addEventListener("scroll", updateDropdownPosition, true);
  window.addEventListener("resize", updateDropdownPosition);
  await loadDropdownNotifications();
};

const closeDropdown = () => {
  dropdownOpen.value = false;
  window.removeEventListener("scroll", updateDropdownPosition, true);
  window.removeEventListener("resize", updateDropdownPosition);
};

const toggleDropdown = async () => {
  if (dropdownOpen.value) {
    closeDropdown();
    return;
  }

  await openDropdown();
};

const router = useRouter();
const selectedNotification = ref(null);

const closeDetailModal = () => {
  selectedNotification.value = null;
};

const getActionRoute = (notification) => {
  if (!notification || !authStore.isAuthenticated) return null;
  const role = authStore.user?.role;
  const meta = notification.data || {};

  if (role === "customer") {
    if (notification.type?.startsWith("reservation") && meta.reservation_id) {
      return { name: "customer.booking-detail", params: { id: meta.reservation_id } };
    }
    if (notification.type?.startsWith("payment") && meta.payment_id) {
      return { name: "customer.payment-detail", params: { paymentId: meta.payment_id } };
    }
    if (notification.type?.startsWith("reservation")) {
      return { name: "customer.booking-history" };
    }
  } else if (role === "owner") {
    if (notification.type?.startsWith("reservation")) {
      return { name: "owner.reservations" };
    }
    if (notification.type?.startsWith("payment") && meta.payment_id) {
      return { name: "owner.payment-detail", params: { id: meta.payment_id } };
    }
    if (notification.type?.startsWith("payment")) {
      return { name: "owner.payments" };
    }
    if (notification.type?.startsWith("property") && meta.property_id) {
      return { name: "owner.property-detail", params: { id: meta.property_id } };
    }
    if (notification.type?.startsWith("property")) {
      return { name: "owner.properties" };
    }
  }
  return null;
};

const getActionLabel = (notification) => {
  if (!notification) return t("notifications.actions.viewDetails");
  if (notification.type?.startsWith("reservation")) return t("notifications.actions.viewBooking");
  if (notification.type?.startsWith("payment")) return t("notifications.actions.viewPayment");
  if (notification.type?.startsWith("property")) return t("notifications.actions.viewProperty");
  return t("notifications.actions.viewDetails");
};

const getNotificationMetadataList = (notification) => {
  if (!notification || !notification.data) return [];
  const meta = notification.data;
  const list = [];

  if (meta.reservation_id) {
    list.push({ label: t("notifications.metadata.reservationId"), value: `#${meta.reservation_id}` });
  }
  if (meta.property_name || meta.propertyName) {
    list.push({ label: t("notifications.metadata.propertyName"), value: meta.property_name || meta.propertyName });
  }
  if (meta.property_id) {
    list.push({ label: t("notifications.metadata.propertyId"), value: `#${meta.property_id}` });
  }
  if (meta.amount) {
    list.push({ label: t("notifications.metadata.amount"), value: `$${Number(meta.amount).toFixed(2)}` });
  }
  if (meta.check_in || meta.checkIn) {
    list.push({ label: t("notifications.metadata.checkInDate"), value: meta.check_in || meta.checkIn });
  }
  if (meta.check_out || meta.checkOut) {
    list.push({ label: t("notifications.metadata.checkOutDate"), value: meta.check_out || meta.checkOut });
  }
  if (meta.status) {
    list.push({ label: t("notifications.metadata.status"), value: String(meta.status).toUpperCase() });
  }

  Object.keys(meta).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (["reservation_id", "property_name", "propertyname", "property_id", "amount", "check_in", "checkin", "check_out", "checkout", "status"].includes(lowerKey)) return;
    
    const label = key
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    list.push({ label, value: meta[key] });
  });

  return list;
};

const actionRoute = computed(() => getActionRoute(selectedNotification.value));
const actionLabel = computed(() => getActionLabel(selectedNotification.value));
const metadataList = computed(() => getNotificationMetadataList(selectedNotification.value));

const handleActionClick = () => {
  if (actionRoute.value) {
    router.push(actionRoute.value);
    closeDetailModal();
  }
};

const markAsRead = async (notification) => {
  selectedNotification.value = notification;
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
  const insideBell = bellRef.value?.contains(event.target);
  const insideDropdown = dropdownRef.value?.contains(event.target);
  if (!insideBell && !insideDropdown) {
    closeDropdown();
  }
};

onMounted(() => {
  syncUnreadCount();
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  window.removeEventListener("scroll", updateDropdownPosition, true);
  window.removeEventListener("resize", updateDropdownPosition);
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

    <Teleport to="body">
    <Transition name="notification-popup">
      <div
        v-if="dropdownOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed hidden w-[400px] overflow-hidden rounded-2xl border border-(--color-border)/60 bg-(--color-surface)/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 lg:block z-50"
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
    </Teleport>

    <RouterLink
      :to="notificationRoute"
      class="absolute inset-0 lg:hidden"
      :aria-label="t('notifications.ariaOpen')"
    />

    <!-- Notification Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedNotification"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          @click="closeDetailModal"
        ></div>

        <!-- Modal Panel -->
        <div
          class="relative w-full max-w-lg transform overflow-hidden rounded-3xl border border-(--color-border)/60 bg-(--color-surface) p-6 text-left shadow-2xl transition-all duration-300 scale-100"
        >
          <!-- Top close button -->
          <button
            type="button"
            class="absolute top-4 right-4 h-8 w-8 rounded-full border border-(--color-border)/40 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) text-(--color-muted) hover:text-(--color-text) hover:border-(--color-border) flex items-center justify-center transition active:scale-95 cursor-pointer"
            @click="closeDetailModal"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>

          <!-- Icon / Header -->
          <div class="flex items-center gap-3.5 mb-5 pr-8">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
              <BellIcon class="h-5.5 w-5.5" />
            </div>
            <div>
              <p class="text-xs font-semibold text-(--color-muted)">
                {{ formatDate(selectedNotification.created_at) }}
              </p>
              <h3 class="text-base font-extrabold text-(--color-text) leading-tight mt-0.5">
                {{ selectedNotification.title }}
              </h3>
            </div>
          </div>

          <!-- Message Body -->
          <div class="border-t border-(--color-border)/30 pt-4 pb-4">
            <p class="text-sm leading-6 text-(--color-text) whitespace-pre-wrap font-semibold">
              {{ selectedNotification.message }}
            </p>
          </div>

          <!-- Metadata Fields Grid -->
          <div
            v-if="metadataList.length > 0"
            class="mb-6 rounded-2xl bg-(--color-surface-soft) p-4 border border-(--color-border)/40 text-xs space-y-2.5"
          >
            <div class="font-bold text-(--color-muted) uppercase tracking-wider text-[10px] border-b border-(--color-border)/20 pb-1.5 mb-2">
              {{ t("notifications.detailModal.title") }}
            </div>
            <div
              v-for="item in metadataList"
              :key="item.label"
              class="flex justify-between items-baseline gap-4"
            >
              <span class="text-(--color-muted) font-semibold">{{ item.label }}</span>
              <span class="text-(--color-text) font-bold text-right truncate max-w-[240px]">{{ item.value }}</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end items-center gap-3 border-t border-(--color-border)/30 pt-4">
            <AppButton
              v-if="actionRoute"
              variant="primary"
              size="sm"
              class="!rounded-xl gap-1"
              @click="handleActionClick"
            >
              {{ actionLabel }}
              <ArrowRightIcon class="h-4 w-4" />
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              class="!rounded-xl"
              @click="closeDetailModal"
            >
              {{ t("common.close") }}
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
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
