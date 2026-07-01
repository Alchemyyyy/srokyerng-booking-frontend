<script setup>
import { computed, onMounted, ref } from "vue";
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CheckIcon,
  BellIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  KeyIcon,
  Cog6ToothIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import AppButton from "@/shared/components/AppButton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { useToastStore } from "@/shared/store/toastStore";
import { getDashboardRouteByRole } from "@/shared/utils/roleRoutes";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const { t, te, locale } = useI18n({ useScope: "global" });



const notificationToneClass = {
  reservation_created: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  reservation_confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  reservation_cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  payment_submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  payment_verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  payment_rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  property_approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  property_rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  password_changed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  system: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

const getNotificationIcon = (type) => {
  if (type?.startsWith("reservation")) return CalendarDaysIcon;
  if (type?.startsWith("payment")) return CreditCardIcon;
  if (type?.startsWith("property")) return BuildingOffice2Icon;
  if (type?.startsWith("password")) return KeyIcon;
  if (type?.startsWith("system")) return Cog6ToothIcon;
  return BellIcon;
};

const pageTitle = computed(() => {
  if (notificationStore.currentStatus === "unread") {
    return t("notifications.pageTitles.unread", "Unread Notifications");
  }

  if (notificationStore.currentStatus === "read") {
    return t("notifications.pageTitles.read", "Read Notifications");
  }

  if (notificationStore.currentStatus === "archived") {
    return t("notifications.pageTitles.archived", "Archived Notifications");
  }

  return t("notifications.pageTitles.all", "All Notifications");
});

const emptyTitle = computed(() => {
  if (notificationStore.currentStatus === "unread") {
    return t("notifications.empty.unreadTitle");
  }

  if (notificationStore.currentStatus === "read") {
    return t("notifications.empty.readTitle");
  }

  return t("notifications.empty.allTitle");
});

const emptyMessage = computed(() => {
  if (notificationStore.currentStatus === "all") {
    return t("notifications.empty.allMessage");
  }

  return t("notifications.empty.filteredMessage");
});

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

const getTypeLabel = (type) => {
  const key = `notifications.types.${type}`;
  return te(key) ? t(key) : t("notifications.types.default");
};
const getToneClass = (type) =>
  notificationToneClass[type] || "bg-sky-500/10 text-sky-600 border-sky-500/20";

const goBack = async () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  await router.push(getDashboardRouteByRole(authStore.user?.role) || { name: "public.home" });
};

const loadNotifications = async (status = notificationStore.currentStatus) => {
  try {
    return await notificationStore.fetchNotifications({ status, page: 1 });
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.load"));
    return [];
  }
};

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
  if (!notification) return "View Details";
  if (notification.type?.startsWith("reservation")) return "View Booking";
  if (notification.type?.startsWith("payment")) return "View Payment";
  if (notification.type?.startsWith("property")) return "View Property";
  return "View Details";
};

const getNotificationMetadataList = (notification) => {
  if (!notification || !notification.data) return [];
  const meta = notification.data;
  const list = [];

  if (meta.reservation_id) {
    list.push({ label: "Reservation ID", value: `#${meta.reservation_id}` });
  }
  if (meta.property_name || meta.propertyName) {
    list.push({ label: "Property Name", value: meta.property_name || meta.propertyName });
  }
  if (meta.property_id) {
    list.push({ label: "Property ID", value: `#${meta.property_id}` });
  }
  if (meta.amount) {
    list.push({ label: "Amount", value: `$${Number(meta.amount).toFixed(2)}` });
  }
  if (meta.check_in || meta.checkIn) {
    list.push({ label: "Check-in Date", value: meta.check_in || meta.checkIn });
  }
  if (meta.check_out || meta.checkOut) {
    list.push({ label: "Check-out Date", value: meta.check_out || meta.checkOut });
  }
  if (meta.status) {
    list.push({ label: "Status", value: String(meta.status).toUpperCase() });
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

const openDetail = async (notification) => {
  selectedNotification.value = notification;
  if (notification.is_read) {
    return;
  }

  try {
    await notificationStore.markAsRead(notification.id);
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.updateOne"));
  }
};

const markAsRead = async (notification) => {
  if (notification.is_read) {
    return;
  }

  try {
    await notificationStore.markAsRead(notification.id);
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.updateOne"));
  }
};

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.update"));
  }
};

const archiveNotification = async (notification) => {
  try {
    await notificationStore.archive(notification.id);
    toastStore.success(t("notifications.toast.archived"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.archive"));
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      notificationStore.fetchNotifications({ status: "all", page: 1 }),
      notificationStore.fetchUnreadCount(),
    ]);
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.load"));
  }
});
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans">
    <PublicNavbar />

    <main class="flex-1 min-h-screen pt-32 pb-12 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full flex flex-col">
      <div class="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <!-- Page Header Row -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black tracking-tight text-(--color-text)">
              {{ pageTitle }}
            </h1>
            <p class="text-xs text-(--color-muted) font-semibold mt-1.5">
              {{ t("notifications.pageSubtitle") }}
            </p>
          </div>

          <button
            v-if="notificationStore.hasUnread"
            type="button"
            :disabled="notificationStore.actionLoading"
            @click="markAllAsRead"
            class="text-xs font-bold text-(--color-primary) hover:underline cursor-pointer disabled:opacity-50"
          >
            {{ t("notifications.markAllAsRead") }}
          </button>
        </div>

        <!-- Alert / Loading / Empty Feed wrapper -->
        <div v-if="notificationStore.error" class="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-sm font-semibold text-red-600 mb-6">
          {{ notificationStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="notificationStore.listLoading" class="py-20 text-center">
          <LoadingSpinner :label="t('notifications.loading')" />
        </div>

        <!-- Empty State -->
        <div v-else-if="!notificationStore.hasNotifications" class="py-20 text-center flex-1 flex flex-col justify-center">
          <div class="max-w-md mx-auto flex flex-col items-center justify-center">
            <div class="h-16 w-16 bg-(--color-surface-soft) border border-(--color-border) text-(--color-muted) rounded-full flex items-center justify-center mb-6">
              <BellIcon class="h-8 w-8" />
            </div>
            <h3 class="text-xl font-extrabold text-(--color-text) mb-2">
              {{ emptyTitle }}
            </h3>
            <p class="text-sm font-semibold text-(--color-muted) mb-8 leading-relaxed max-w-sm">
              {{ emptyMessage }}
            </p>
            <RouterLink
              :to="{ name: 'public.properties' }"
              class="px-7 py-3 bg-(--color-primary) hover:opacity-90 text-white !text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center"
            >
              <span class="text-white !text-white">Explore Properties</span>
            </RouterLink>
          </div>
        </div>

        <!-- Active Notifications List (Airbnb style list layout) -->
        <div v-else class="divide-y divide-(--color-border)/60">
          <TransitionGroup name="list" tag="div" class="divide-y divide-(--color-border)/60">
            <article
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              class="relative flex items-start gap-4 py-6 transition duration-200 hover:bg-(--color-surface-soft)/30 px-4 -mx-4 rounded-2xl group cursor-pointer"
              @click="openDetail(notification)"
            >
              <!-- Unread Status Dot -->
              <div class="flex items-center justify-center w-2 h-12">
                <span
                  v-if="!notification.is_read"
                  class="h-2 w-2 rounded-full bg-(--color-primary)"
                ></span>
              </div>

              <!-- Left side Icon Circle -->
              <div
                class="flex items-center justify-center w-12 h-12 rounded-full border border-(--color-border)/40 shadow-inner shrink-0"
                :class="getToneClass(notification.type)"
              >
                <component :is="getNotificationIcon(notification.type)" class="w-5.5 h-5.5" />
              </div>

              <!-- Middle Text Body -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-baseline gap-2 mb-1">
                  <span
                    class="text-[10px] font-black uppercase tracking-wider text-(--color-primary)"
                  >
                    {{ getTypeLabel(notification.type) }}
                  </span>
                  <span class="text-[10px] font-bold text-(--color-muted)">•</span>
                  <span class="text-xs font-semibold text-(--color-muted)">
                    {{ formatDate(notification.created_at) }}
                  </span>
                </div>

                <h3 class="text-base font-extrabold text-(--color-text) group-hover:text-(--color-primary) transition-colors duration-200">
                  {{ notification.title }}
                </h3>
                <p class="mt-1 text-sm font-semibold leading-relaxed text-(--color-muted) line-clamp-2">
                  {{ notification.message }}
                </p>
              </div>

              <!-- Right side row Actions -->
              <div class="flex items-center gap-1 shrink-0 self-center">
                <button
                  v-if="!notification.is_read"
                  type="button"
                  :disabled="notificationStore.actionLoading"
                  @click.stop="markAsRead(notification)"
                  class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-success) transition duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Mark as read"
                >
                  <CheckIcon class="h-5 w-5" />
                </button>

                <span
                  v-else
                  class="h-9 w-9 flex items-center justify-center text-emerald-600/70"
                  title="Read"
                >
                  <EyeIcon class="h-4.5 w-4.5" />
                </span>

                <button
                  v-if="notificationStore.currentStatus !== 'archived'"
                  type="button"
                  :disabled="notificationStore.actionLoading"
                  @click.stop="archiveNotification(notification)"
                  class="h-9 w-9 flex items-center justify-center rounded-full hover:bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-danger) transition duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Archive"
                >
                  <ArchiveBoxIcon class="h-4.5 w-4.5" />
                </button>
              </div>
            </article>
          </TransitionGroup>
        </div>
      </div>
    </main>
    <PublicFooter />

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
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--color-border)/40 shadow-inner"
              :class="getToneClass(selectedNotification.type)"
            >
              <component :is="getNotificationIcon(selectedNotification.type)" class="w-5.5 h-5.5" />
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
              Notification details
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
              Close
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
</style>
