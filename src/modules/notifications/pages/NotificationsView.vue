<script setup>
import { computed, onMounted, ref } from "vue";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  FaceSmileIcon,
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
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  InboxIcon,
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
import { useSidebar } from "@/shared/composables/useSidebar";

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const { t, te, locale } = useI18n({ useScope: "global" });
const { isSidebarOpen } = useSidebar();



const notificationToneClass = {
  reservation_created: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10",
  reservation_confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10",
  reservation_cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:border-rose-500/10",
  payment_submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400 dark:border-blue-500/10",
  payment_verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10",
  payment_rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:border-rose-500/10",
  payment_refunded: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400 dark:border-blue-500/10",
  property_approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10",
  property_rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/5 dark:text-rose-400 dark:border-rose-500/10",
  password_changed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400 dark:border-indigo-500/10",
  message_received: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/5 dark:text-violet-400 dark:border-violet-500/10",
  system: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/5 dark:text-sky-400 dark:border-sky-500/10",
};

const getNotificationIcon = (type) => {
  if (type === "message_received") return ChatBubbleLeftRightIcon;
  if (type?.startsWith("reservation")) return CalendarDaysIcon;
  if (type?.startsWith("payment")) return CreditCardIcon;
  if (type?.startsWith("property")) return BuildingOffice2Icon;
  if (type?.startsWith("password")) return KeyIcon;
  if (type?.startsWith("system")) return Cog6ToothIcon;
  return BellIcon;
};

const notificationBorderClass = {
  reservation_created: "border-l-4 border-l-amber-500",
  reservation_confirmed: "border-l-4 border-l-emerald-500",
  reservation_cancelled: "border-l-4 border-l-rose-500",
  payment_submitted: "border-l-4 border-l-blue-500",
  payment_verified: "border-l-4 border-l-emerald-500",
  payment_rejected: "border-l-4 border-l-rose-500",
  payment_refunded: "border-l-4 border-l-blue-500",
  property_approved: "border-l-4 border-l-emerald-500",
  property_rejected: "border-l-4 border-l-rose-500",
  password_changed: "border-l-4 border-l-indigo-500",
  message_received: "border-l-4 border-l-violet-500",
  system: "border-l-4 border-l-sky-500",
};

const getBorderClass = (type) => notificationBorderClass[type] || "border-l-4 border-l-sky-500";

const tabs = [
  { value: "all", label: computed(() => t("notifications.tabs.all", "All")) },
  { value: "unread", label: computed(() => t("notifications.tabs.unread", "Unread")) },
  { value: "archived", label: computed(() => t("notifications.tabs.archived", "Archived")) },
];

const getTabIcon = (status) => {
  if (status === "unread") return BellAlertIcon;
  if (status === "archived") return ArchiveBoxIcon;
  return BellIcon;
};

const getTabCount = (status) => {
  if (status === "unread") return notificationStore.unreadCount;
  return 0;
};

const switchTab = async (status) => {
  selectedIds.value = [];
  await loadNotifications(status);
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
    if (notification.type === "message_received" && meta.conversation_id) {
      return { name: "customer.chat-detail", params: { conversationId: meta.conversation_id } };
    }
    if (notification.type === "message_received") {
      return { name: "customer.chats" };
    }
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
    if (notification.type === "message_received" && meta.conversation_id) {
      return { name: "owner.chat-detail", params: { conversationId: meta.conversation_id } };
    }
    if (notification.type === "message_received") {
      return { name: "owner.chats" };
    }
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
  if (notification.type === "message_received") return t("notifications.actions.viewChat");
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


const selectedIds = ref([]);

const isAllSelected = computed(() => {
  return (
    notificationStore.notifications.length > 0 &&
    selectedIds.value.length === notificationStore.notifications.length
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = notificationStore.notifications.map((n) => n.id);
  }
};

const toggleSelection = (id, event) => {
  if (event) event.stopPropagation();
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  } else {
    selectedIds.value.push(id);
  }
};

const bulkMarkAsRead = async () => {
  if (selectedIds.value.length === 0) return;
  try {
    await Promise.all(selectedIds.value.map(id => notificationStore.markAsRead(id)));
    selectedIds.value = [];
    toastStore.success(t("notifications.toast.markedAsRead", "Marked as read"));
  } catch (err) {
    toastStore.danger(err.message || t("notifications.errors.update"));
  }
};

const bulkArchive = async () => {
  if (selectedIds.value.length === 0) return;
  try {
    await Promise.all(selectedIds.value.map(id => notificationStore.archive(id)));
    selectedIds.value = [];
    toastStore.success(t("notifications.toast.archived", "Archived"));
  } catch (err) {
    toastStore.danger(err.message || t("notifications.errors.archive"));
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
    <PublicNavbar v-if="authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin'" />

    <main
      class="flex-1 min-h-screen pb-24 flex flex-col transition-all duration-300 w-full"
      :class="
        authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin'
          ? 'pt-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto'
          : [
              'pt-25 px-4 sm:px-6 lg:px-8',
              authStore.user?.role === 'admin'
                ? (isSidebarOpen ? 'ml-64' : 'ml-20')
                : ''
            ]
      "
    >
      <!-- Inner content wrapper -->
      <div class="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-6">
        
        <!-- Navigation Breadcrumbs & Back -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            @click="goBack"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-(--color-muted) hover:text-(--color-primary) transition cursor-pointer active:scale-95"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            <span>{{ t("common.back") }}</span>
          </button>
        </div>

        <!-- Page Title and Count Badge -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-black tracking-tight text-(--color-text)">
                {{ t("notifications.title", "Notifications") }}
              </h1>
              <!-- Glowing Unread Count Badge -->
              <span 
                v-if="notificationStore.unreadCount > 0"
                class="inline-flex items-center justify-center bg-(--color-primary-soft) text-(--color-primary) border border-(--color-primary)/20 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs"
              >
                {{ notificationStore.unreadCount }} {{ t("notifications.tabs.unread", "Unread") }}
              </span>
            </div>
            <p class="text-xs text-(--color-muted) font-semibold mt-1">
              {{ t("notifications.pageSubtitle", "Manage your platform notifications") }}
            </p>
          </div>

          <!-- Mark All Read / Quick Actions -->
          <div class="flex items-center gap-3">
            <button
              v-if="notificationStore.hasUnread"
              type="button"
              :disabled="notificationStore.actionLoading"
              @click="markAllAsRead"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-(--color-primary) to-(--color-secondary) rounded-xl hover:shadow-md hover:scale-97 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              <CheckIcon class="w-4 h-4" />
              <span>{{ t("notifications.markAllAsRead", "Mark all as read") }}</span>
            </button>
          </div>
        </div>

        <!-- Unified Tabs & Search Segmented Bar -->
        <div class="bg-(--color-surface-soft)/40 border border-(--color-border)/50 p-1.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <!-- Tabs pills -->
          <nav class="flex items-center gap-1.5">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              @click="switchTab(tab.value)"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
              :class="
                notificationStore.currentStatus === tab.value
                  ? 'bg-(--color-surface) text-(--color-primary) shadow-xs border border-(--color-border)/30'
                  : 'text-(--color-muted) hover:text-(--color-text)'
              "
            >
              <component
                :is="getTabIcon(tab.value)"
                class="w-4 h-4"
                :class="notificationStore.currentStatus === tab.value ? 'text-(--color-primary)' : 'text-(--color-muted)'"
              />
              <span>{{ tab.label }}</span>
              <span
                v-if="getTabCount(tab.value) > 0"
                class="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                :class="
                  notificationStore.currentStatus === tab.value
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-surface-soft) text-(--color-muted)'
                "
              >
                {{ getTabCount(tab.value) }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Bulk Actions / Toolbar -->
        <div 
          v-if="notificationStore.hasNotifications"
          class="flex items-center justify-between bg-(--color-surface) border border-(--color-border)/50 px-4 py-3 rounded-2xl shadow-xs transition-all duration-300"
        >
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              class="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span class="text-xs text-(--color-muted) font-semibold">
              {{ selectedIds.length > 0 ? `${selectedIds.length} selected` : t("notifications.selectAll", "Select all") }}
            </span>
          </div>

          <!-- Sliding toolbar actions -->
          <div class="flex items-center gap-2 transition-all duration-300" :class="{ 'opacity-0 translate-y-1 pointer-events-none': selectedIds.length === 0 }">
            <button 
              type="button" 
              @click="bulkMarkAsRead"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--color-border)/50 bg-(--color-surface-soft) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) hover:text-(--color-primary) transition cursor-pointer"
            >
              <CheckIcon class="w-3.5 h-3.5" />
              <span>{{ t("notifications.actions.markRead", "Mark read") }}</span>
            </button>
            <button 
              type="button" 
              @click="bulkArchive"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--color-border)/50 bg-(--color-surface-soft) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) hover:text-red-500 transition cursor-pointer"
            >
              <ArchiveBoxIcon class="w-3.5 h-3.5" />
              <span>{{ t("notifications.actions.archive", "Archive") }}</span>
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="notificationStore.error" class="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-xs font-semibold text-red-600 mb-6">
          {{ notificationStore.error }}
        </div>

        <!-- Loading State -->
        <div v-if="notificationStore.listLoading" class="py-20 text-center flex-1 flex flex-col justify-center items-center">
          <LoadingSpinner :label="t('notifications.loading')" />
        </div>

        <!-- Empty State -->
        <div v-else-if="!notificationStore.hasNotifications" class="py-20 text-center flex-1 flex flex-col justify-center items-center bg-(--color-surface) rounded-3xl border border-(--color-border)/60 p-8 shadow-xs">
          <div class="max-w-md mx-auto flex flex-col items-center justify-center">
            <div class="h-16 w-16 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) border border-(--color-border)/60 text-(--color-muted) rounded-3xl flex items-center justify-center mb-5 shadow-inner">
              <BellIcon class="h-8 w-8 text-(--color-muted)" />
            </div>
            <h3 class="text-lg font-black text-(--color-text) mb-1.5">
              {{ emptyTitle }}
            </h3>
            <p class="text-xs font-semibold text-(--color-muted) mb-6 leading-relaxed max-w-xs">
              {{ emptyMessage }}
            </p>
            <RouterLink
              v-if="authStore.user?.role === 'customer'"
              :to="{ name: 'public.properties' }"
              class="px-5 py-2.5 bg-gradient-to-r from-(--color-primary) to-(--color-secondary) text-white !text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center hover:shadow-lg"
            >
              <span>{{ t("notifications.empty.exploreProperties", "Explore Stays") }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- Feed Content -->
        <div v-else class="space-y-4">
          <TransitionGroup name="list" tag="div" class="space-y-3">
            <article
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              class="group relative flex items-start gap-4 p-4 rounded-2xl bg-(--color-surface) border border-(--color-border)/50 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer animate-fade-in"
              :class="[
                getBorderClass(notification.type),
                notification.is_read ? 'opacity-85' : 'bg-gradient-to-r from-(--color-surface) to-(--color-primary-soft)/10'
              ]"
              @click="openDetail(notification)"
            >
              <!-- Bulk Selection checkbox (Stop propagation) -->
              <div class="pt-1.5 flex items-center w-5 shrink-0" @click.stop>
                <input 
                  type="checkbox" 
                  class="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
                  :checked="selectedIds.includes(notification.id)"
                  @change="toggleSelection(notification.id, $event)"
                />
              </div>

              <!-- Notification Icon Badge -->
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--color-border)/30 shadow-inner mt-0.5"
                :class="getToneClass(notification.type)"
              >
                <component :is="getNotificationIcon(notification.type)" class="w-5.5 h-5.5" />
              </div>

              <!-- Notification Message & Info -->
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-(--color-surface-soft) text-(--color-muted)">
                    {{ getTypeLabel(notification.type) }}
                  </span>
                  <span v-if="!notification.is_read" class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--color-primary) opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-(--color-primary)"></span>
                  </span>
                </div>

                <h3 class="text-sm font-extrabold text-(--color-text) leading-snug">
                  {{ notification.title }}
                </h3>
                
                <p class="text-xs text-(--color-muted) font-medium leading-relaxed line-clamp-2">
                  {{ notification.message }}
                </p>

                <!-- Inline Action button (Stop propagation) -->
                <div v-if="getActionRoute(notification)" class="pt-1.5" @click.stop>
                  <RouterLink
                    :to="getActionRoute(notification)"
                    class="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary) hover:text-(--color-primary-strong) transition-colors cursor-pointer group/link"
                  >
                    <span>{{ getActionLabel(notification) }}</span>
                    <ArrowRightIcon class="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                  </RouterLink>
                </div>
              </div>

              <!-- Timestamp & Actions menu (appears on hover) -->
              <div class="shrink-0 flex flex-col items-end gap-3 self-stretch justify-between text-right min-w-[70px]">
                <span class="text-[10px] text-(--color-muted) font-bold whitespace-nowrap pt-1">
                  {{ formatDate(notification.created_at) }}
                </span>

                <!-- Hover Quick Actions (Stop propagation) -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" @click.stop>
                  <button
                    v-if="!notification.is_read"
                    type="button"
                    :disabled="notificationStore.actionLoading"
                    @click.stop="markAsRead(notification)"
                    class="p-1.5 rounded-xl border border-(--color-border)/40 bg-(--color-surface-soft) hover:bg-(--color-surface) text-(--color-muted) hover:text-(--color-primary) transition cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckIcon class="h-3.5 w-3.5" />
                  </button>
                  <button
                    v-if="notificationStore.currentStatus !== 'archived'"
                    type="button"
                    :disabled="notificationStore.actionLoading"
                    @click.stop="archiveNotification(notification)"
                    class="p-1.5 rounded-xl border border-(--color-border)/40 bg-(--color-surface-soft) hover:bg-(--color-surface) text-(--color-muted) hover:text-red-500 transition cursor-pointer"
                    title="Archive"
                  >
                    <ArchiveBoxIcon class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </article>
          </TransitionGroup>
        </div>
      </div>
    </main>

    <PublicFooter v-if="authStore.user?.role !== 'owner' && authStore.user?.role !== 'admin'" />

    <!-- Premium Slide-over Drawer / Sheet for Details -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedNotification" class="fixed inset-0 z-50 overflow-hidden font-sans">
          <div class="absolute inset-0 overflow-hidden">
            <!-- Backdrop with blur -->
            <div 
              class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
              @click="closeDetailModal"
            ></div>

            <!-- Drawer content -->
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div class="pointer-events-auto w-screen max-w-md transform">
                <div class="flex h-full flex-col overflow-y-auto bg-(--color-surface) border-l border-(--color-border)/60 p-6 shadow-2xl relative">
                  
                  <!-- Top Close and Header actions -->
                  <div class="flex items-center justify-between pb-5 border-b border-(--color-border)/30">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-(--color-border)/30" :class="getToneClass(selectedNotification.type)">
                        <component :is="getNotificationIcon(selectedNotification.type)" class="w-4 h-4" />
                      </span>
                      <span class="text-xs font-black uppercase tracking-wider text-(--color-muted)">
                        {{ getTypeLabel(selectedNotification.type) }}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="h-8 w-8 rounded-full border border-(--color-border)/40 bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text) hover:border-(--color-border) flex items-center justify-center transition active:scale-95 cursor-pointer"
                      @click="closeDetailModal"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>

                  <!-- Detail Body -->
                  <div class="flex-1 py-6 space-y-6">
                    <div>
                      <span class="text-[10px] text-(--color-muted) font-bold">
                        {{ formatDate(selectedNotification.created_at) }}
                      </span>
                      <h2 class="text-lg font-black text-(--color-text) leading-tight mt-1">
                        {{ selectedNotification.title }}
                      </h2>
                    </div>

                    <div class="bg-gradient-to-br from-(--color-surface-soft)/40 to-(--color-surface) border border-(--color-border)/30 rounded-2xl p-5 shadow-xs">
                      <p class="text-sm leading-relaxed text-(--color-text) whitespace-pre-wrap font-semibold">
                        {{ selectedNotification.message }}
                      </p>
                    </div>

                    <!-- Metadata Fields Grid -->
                    <div
                      v-if="metadataList.length > 0"
                      class="rounded-2xl bg-(--color-surface-soft) p-4 border border-(--color-border)/40 text-xs space-y-2.5"
                    >
                      <div class="font-bold text-(--color-muted) uppercase tracking-wider text-[10px] border-b border-(--color-border)/20 pb-1.5 mb-2">
                        {{ t("notifications.detailModal.title", "Metadata") }}
                      </div>
                      <div
                        v-for="item in metadataList"
                        :key="item.label"
                        class="flex justify-between items-baseline gap-4"
                      >
                        <span class="text-(--color-muted) font-semibold">{{ item.label }}</span>
                        <span class="text-(--color-text) font-bold text-right truncate max-w-[200px]">{{ item.value }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions Footer -->
                  <div class="border-t border-(--color-border)/30 pt-4 flex items-center justify-end gap-3 shrink-0">
                    <button
                      v-if="actionRoute"
                      type="button"
                      class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-(--color-primary) to-(--color-secondary) rounded-xl hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                      @click="handleActionClick"
                    >
                      <span>{{ actionLabel }}</span>
                      <ArrowRightIcon class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-(--color-text) bg-(--color-surface-soft) border border-(--color-border)/40 rounded-xl hover:bg-(--color-surface) active:scale-95 transition-all duration-200 cursor-pointer"
                      @click="closeDetailModal"
                    >
                      {{ t("common.close") }}
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Drawer Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .transform {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-leave-active .transform {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from .transform,
.drawer-leave-to .transform {
  transform: translateX(100%);
}
</style>