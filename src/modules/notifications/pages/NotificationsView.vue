<script setup>
import { computed, onMounted } from "vue";
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  CheckIcon,
  BellIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  KeyIcon,
  Cog6ToothIcon,
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

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const { t, te, locale } = useI18n({ useScope: "global" });

const filters = computed(() => [
  { label: t("notifications.filters.all", "All"), value: "all" },
  { label: t("notifications.filters.unread", "Unread"), value: "unread" },
  { label: t("notifications.filters.read", "Read"), value: "read" },
  { label: t("notifications.filters.archived", "Archived"), value: "archived" },
]);

const notificationToneClass = {
  reservation_created: "bg-(--color-info-soft) text-(--color-info) border-(--color-info)/20",
  reservation_confirmed: "bg-(--color-success-soft) text-(--color-success) border-(--color-success)/20",
  reservation_cancelled: "bg-(--color-danger-soft) text-(--color-danger) border-(--color-danger)/20",
  payment_submitted: "bg-(--color-warning-soft) text-(--color-warning) border-(--color-warning)/20",
  payment_verified: "bg-(--color-success-soft) text-(--color-success) border-(--color-success)/20",
  payment_rejected: "bg-(--color-danger-soft) text-(--color-danger) border-(--color-danger)/20",
  property_approved: "bg-(--color-success-soft) text-(--color-success) border-(--color-success)/20",
  property_rejected: "bg-(--color-danger-soft) text-(--color-danger) border-(--color-danger)/20",
  password_changed: "bg-(--color-warning-soft) text-(--color-warning) border-(--color-warning)/20",
  system: "bg-(--color-primary-soft) text-(--color-primary) border-(--color-primary)/20",
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
  notificationToneClass[type] || "bg-(--color-info-soft) text-(--color-info) border-(--color-info)/20";

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

const markAsRead = async (notification) => {
  if (notification.is_read) {
    return;
  }

  try {
    await notificationStore.markAsRead(notification.id);
    toastStore.success(t("notifications.toast.markRead"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("notifications.errors.updateOne"));
  }
};

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    toastStore.success(t("notifications.toast.markAllRead"));
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
  <div class="min-h-screen bg-(--color-page) flex flex-col">
    <PublicNavbar />

    <main class="flex-1 px-4 py-8 sm:py-12 text-(--color-text) sm:px-6 lg:px-8">
      <section class="mx-auto max-w-4xl">
        <!-- ── Navigation Back Link ── -->
        <button
          type="button"
          class="inline-flex items-center gap-2 text-xs font-bold text-(--color-muted) hover:text-(--color-primary) transition mb-6"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          {{ t("common.back") }}
        </button>

        <!-- ── Premium Header Section ── -->
        <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-(--color-border)/60 pb-6">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-sm bg-(--color-primary-soft) border border-(--color-primary)/20 shadow-xs shrink-0"
              style="border-radius: var(--radius-sm);"
            >
              <BellAlertIcon class="h-6 w-6 text-(--color-primary)" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-(--color-primary)">
                {{ t("notifications.inbox") }}
              </p>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--color-text)">
                {{ pageTitle }}
              </h1>
              <p class="text-xs text-(--color-muted) mt-0.5">
                {{ t("notifications.pageSubtitle") }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 justify-center rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-bold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            style="border-radius: var(--radius-sm);"
            :disabled="notificationStore.actionLoading || !notificationStore.hasUnread"
            @click="markAllAsRead"
          >
            <CheckIcon class="h-4 w-4" />
            <span>{{ t("notifications.markAllAsRead") }}</span>
          </button>
        </header>

        <!-- ── Ultra-Sleek Filter Tabs Bar ── -->
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            class="inline-flex w-full border border-(--color-border)/60 bg-(--color-surface-soft) p-1 sm:w-auto shadow-inner gap-0.5"
            style="border-radius: var(--radius-sm);"
          >
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              class="flex-1 sm:flex-none px-3.5 py-1 text-xs transition-all duration-200 cursor-pointer text-center"
              style="border-radius: var(--radius-sm);"
              :class="
                notificationStore.currentStatus === filter.value
                  ? 'bg-(--color-primary) text-white font-bold shadow-xs'
                  : 'text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface)/50 font-semibold'
              "
              @click="loadNotifications(filter.value)"
            >
              {{ filter.label }}
            </button>
          </div>

          <div class="flex items-center gap-2 text-xs font-bold text-(--color-muted)">
            <span class="w-2 h-2 rounded-full bg-(--color-primary) animate-pulse"></span>
            <span>
              {{ t("notifications.totalUnread", {
                total: notificationStore.pagination.total,
                unread: notificationStore.unreadCount
              }) }}
            </span>
          </div>
        </div>

        <!-- ── Error State ── -->
        <div
          v-if="notificationStore.error"
          class="mb-6 rounded-sm border border-(--color-danger) bg-(--color-danger-soft) px-4 py-3 text-xs font-bold text-(--color-danger) shadow-xs"
          style="border-radius: var(--radius-sm);"
        >
          {{ notificationStore.error }}
        </div>

        <!-- ── Loading State ── -->
        <div
          v-if="notificationStore.listLoading"
          class="rounded-sm border border-(--color-border) bg-(--color-surface) p-12 text-center shadow-sm"
          style="border-radius: var(--radius-sm);"
        >
          <LoadingSpinner :label="t('notifications.loading')" />
        </div>

        <!-- ── Empty State ── -->
        <div v-else-if="!notificationStore.hasNotifications" class="rounded-sm border border-(--color-border) bg-(--color-surface) p-12 shadow-sm text-center" style="border-radius: var(--radius-sm);">
          <EmptyState
            :title="emptyTitle"
            :message="emptyMessage"
          >
            <template #icon>
              <BellAlertIcon class="h-8 w-8 text-(--color-primary)" />
            </template>
          </EmptyState>
        </div>

        <!-- ── Breathtaking Notification Cards List ── -->
        <div v-else class="space-y-4">
          <article
            v-for="notification in notificationStore.notifications"
            :key="notification.id"
            class="group rounded-sm border bg-(--color-surface) p-5 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style="border-radius: var(--radius-sm);"
            :class="
              notification.is_read
                ? 'border-(--color-border)'
                : 'border-(--color-primary)/80 bg-(--color-surface) ring-1 ring-(--color-primary)/10'
            "
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <!-- Left Status Icon & Main Content -->
              <div class="flex items-start gap-4 min-w-0 flex-1">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-sm border shrink-0 shadow-xs transition-transform group-hover:scale-105 duration-200"
                  style="border-radius: var(--radius-sm);"
                  :class="getToneClass(notification.type)"
                >
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex items-center border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      style="border-radius: var(--radius-sm);"
                      :class="getToneClass(notification.type)"
                    >
                      {{ getTypeLabel(notification.type) }}
                    </span>
                    <span
                      v-if="!notification.is_read"
                      class="inline-flex items-center bg-(--color-primary) px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                      style="border-radius: var(--radius-sm);"
                    >
                      {{ t("notifications.new") }}
                    </span>
                    <span class="text-xs font-bold text-(--color-muted)">
                      • {{ formatDate(notification.created_at) }}
                    </span>
                  </div>

                  <h2 class="text-base font-extrabold text-(--color-text) group-hover:text-(--color-primary) transition-colors duration-200 truncate">
                    {{ notification.title }}
                  </h2>
                  <p class="mt-1 text-xs font-medium leading-relaxed text-(--color-muted)">
                    {{ notification.message }}
                  </p>
                </div>
              </div>

              <!-- Right Actions -->
              <div class="flex shrink-0 items-center gap-1.5 sm:mt-0 mt-2 sm:pl-0 pl-14">
                <button
                  v-if="!notification.is_read"
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-(--color-border)/60 text-(--color-muted) bg-(--color-surface-soft) transition hover:border-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95 shadow-xs"
                  style="border-radius: var(--radius-sm);"
                  :title="t('notifications.markAsRead')"
                  :disabled="notificationStore.actionLoading"
                  @click="markAsRead(notification)"
                >
                  <CheckCircleIcon class="h-4.5 w-4.5" />
                </button>

                <span
                  v-else
                  class="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-(--color-success-soft) text-(--color-success) border border-(--color-success)/20 shadow-xs"
                  style="border-radius: var(--radius-sm);"
                  :title="t('notifications.read')"
                >
                  <EnvelopeOpenIcon class="h-4.5 w-4.5" />
                </span>

                <button
                  v-if="notificationStore.currentStatus !== 'archived'"
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-(--color-border)/60 text-(--color-muted) bg-(--color-surface-soft) transition hover:border-rose-500 hover:bg-rose-500 hover:text-white active:scale-95 shadow-xs"
                  style="border-radius: var(--radius-sm);"
                  :title="t('notifications.archive')"
                  :disabled="notificationStore.actionLoading"
                  @click="archiveNotification(notification)"
                >
                  <ArchiveBoxIcon class="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
