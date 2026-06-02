<script setup>
import { computed, onMounted } from "vue";
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import AppButton from "@/shared/components/AppButton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { useToastStore } from "@/shared/store/toastStore";
import { getDashboardRouteByRole } from "@/shared/utils/roleRoutes";

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const toastStore = useToastStore();

const filters = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const notificationTypeLabel = {
  reservation_created: "Reservation created",
  reservation_confirmed: "Reservation confirmed",
  reservation_cancelled: "Reservation cancelled",
  payment_submitted: "Payment submitted",
  payment_verified: "Payment verified",
  payment_rejected: "Payment rejected",
  property_approved: "Property approved",
  property_rejected: "Property rejected",
  password_changed: "Password changed",
  system: "System",
};

const notificationToneClass = {
  reservation_created: "bg-(--color-info-soft) text-(--color-info)",
  reservation_confirmed: "bg-(--color-success-soft) text-(--color-success)",
  reservation_cancelled: "bg-(--color-danger-soft) text-(--color-danger)",
  payment_submitted: "bg-(--color-warning-soft) text-(--color-warning)",
  payment_verified: "bg-(--color-success-soft) text-(--color-success)",
  payment_rejected: "bg-(--color-danger-soft) text-(--color-danger)",
  property_approved: "bg-(--color-success-soft) text-(--color-success)",
  property_rejected: "bg-(--color-danger-soft) text-(--color-danger)",
  password_changed: "bg-(--color-warning-soft) text-(--color-warning)",
  system: "bg-(--color-primary-soft) text-(--color-primary)",
};

const pageTitle = computed(() => {
  if (notificationStore.currentStatus === "unread") {
    return "Unread notifications";
  }

  if (notificationStore.currentStatus === "read") {
    return "Read notifications";
  }

  return "Notifications";
});

const emptyTitle = computed(() => {
  if (notificationStore.currentStatus === "unread") {
    return "No unread notifications";
  }

  if (notificationStore.currentStatus === "read") {
    return "No read notifications";
  }

  return "No notifications yet";
});

const emptyMessage = computed(() => {
  if (notificationStore.currentStatus === "all") {
    return "Important booking, payment, property, and account updates will appear here.";
  }

  return "Try switching filters to see other notifications.";
});

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

const getTypeLabel = (type) => notificationTypeLabel[type] || "Notification";
const getToneClass = (type) =>
  notificationToneClass[type] || "bg-(--color-info-soft) text-(--color-info)";

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
    toastStore.danger(requestError.message || "Could not load notifications");
    return [];
  }
};

const markAsRead = async (notification) => {
  if (notification.is_read) {
    return;
  }

  try {
    await notificationStore.markAsRead(notification.id);
    toastStore.success("Notification marked as read");
  } catch (requestError) {
    toastStore.danger(requestError.message || "Could not update notification");
  }
};

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    toastStore.success("All notifications marked as read");
  } catch (requestError) {
    toastStore.danger(requestError.message || "Could not update notifications");
  }
};

const archiveNotification = async (notification) => {
  try {
    await notificationStore.archive(notification.id);
    toastStore.success("Notification archived");
  } catch (requestError) {
    toastStore.danger(requestError.message || "Could not archive notification");
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      notificationStore.fetchNotifications({ status: "all", page: 1 }),
      notificationStore.fetchUnreadCount(),
    ]);
  } catch (requestError) {
    toastStore.danger(requestError.message || "Could not load notifications");
  }
});
</script>

<template>
  <main class="min-h-screen bg-(--color-page) px-4 py-8 text-(--color-text) sm:px-6 lg:px-8">
    <section class="mx-auto max-w-5xl">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AppButton
            type="button"
            variant="primary"
            size="sm"
            class="mb-4 !rounded-lg"
            @click="goBack"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            Back
          </AppButton>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
            Inbox
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-(--color-text)">
            {{ pageTitle }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-(--color-muted)">
            Track account, booking, payment, and property updates in one place.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-(--color-border) px-4 py-2 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="notificationStore.actionLoading || !notificationStore.hasUnread"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </header>

      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          class="inline-flex w-full rounded-lg border border-(--color-border) bg-(--color-surface-soft) p-1 sm:w-auto"
        >
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            class="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition sm:flex-none"
            :class="
              notificationStore.currentStatus === filter.value
                ? 'bg-(--color-surface) text-(--color-primary) shadow-sm'
                : 'text-(--color-muted) hover:text-(--color-text)'
            "
            @click="loadNotifications(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>

        <p class="text-sm text-(--color-muted)">
          {{ notificationStore.pagination.total }} total &middot;
          {{ notificationStore.unreadCount }} unread
        </p>
      </div>

      <div
        v-if="notificationStore.error"
        class="mb-5 rounded-lg border border-(--color-danger) bg-(--color-danger-soft) px-4 py-3 text-sm font-semibold text-(--color-danger)"
      >
        {{ notificationStore.error }}
      </div>

      <div
        v-if="notificationStore.listLoading"
        class="rounded-lg border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-card)"
      >
        <LoadingSpinner label="Loading notifications..." />
      </div>

      <EmptyState
        v-else-if="!notificationStore.hasNotifications"
        :title="emptyTitle"
        :message="emptyMessage"
      >
        <template #icon>
          <BellAlertIcon class="h-6 w-6" />
        </template>
      </EmptyState>

      <div v-else class="space-y-3">
        <article
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="rounded-lg border bg-(--color-surface) p-4 shadow-(--shadow-card) transition hover:border-(--color-primary)"
          :class="
            notification.is_read
              ? 'border-(--color-border)'
              : 'border-(--color-primary) ring-1 ring-(--color-focus-ring)'
          "
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="getToneClass(notification.type)"
                >
                  {{ getTypeLabel(notification.type) }}
                </span>
                <span
                  v-if="!notification.is_read"
                  class="inline-flex items-center rounded-full bg-(--color-primary) px-2.5 py-1 text-xs font-bold text-white"
                >
                  New
                </span>
                <span class="text-xs font-medium text-(--color-muted)">
                  {{ formatDate(notification.created_at) }}
                </span>
              </div>

              <h2 class="text-lg font-bold text-(--color-text)">
                {{ notification.title }}
              </h2>
              <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                {{ notification.message }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                v-if="!notification.is_read"
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) text-(--color-muted) transition hover:border-(--color-success) hover:text-(--color-success)"
                title="Mark as read"
                :disabled="notificationStore.actionLoading"
                @click="markAsRead(notification)"
              >
                <CheckCircleIcon class="h-5 w-5" />
              </button>

              <span
                v-else
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-success-soft) text-(--color-success)"
                title="Read"
              >
                <EnvelopeOpenIcon class="h-5 w-5" />
              </span>

              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) text-(--color-muted) transition hover:border-(--color-danger) hover:text-(--color-danger)"
                title="Archive"
                :disabled="notificationStore.actionLoading"
                @click="archiveNotification(notification)"
              >
                <ArchiveBoxIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
