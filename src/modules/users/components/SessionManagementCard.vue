<script setup>
import { computed, onMounted, ref } from "vue";
import {
  ArrowPathIcon,
  ComputerDesktopIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import { authService } from "@/modules/auth/services/authService";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";

const { t, locale } = useI18n({ useScope: "global" });
const authStore = useAuthStore();
const toastStore = useToastStore();

const sessions = ref([]);
const loading = ref(false);
const actionSessionId = ref(null);
const loggingOutAll = ref(false);

const hasSessions = computed(() => sessions.value.length > 0);
const sessionCountLabel = computed(() =>
  t("profile.sessions.activeCount", { count: sessions.value.length }),
);

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getBrowserLabel = (userAgent = "") => {
  if (/edg/i.test(userAgent)) return "Microsoft Edge";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) return "Safari";
  return t("profile.sessions.unknownDevice");
};

const getPlatformLabel = (userAgent = "") => {
  if (/iphone|ipad/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/linux/i.test(userAgent)) return "Linux";
  return t("profile.sessions.unknownDevice");
};

const getPlatformIconClass = (userAgent = "") => {
  const agent = userAgent.toLowerCase();
  if (/iphone|ipad/i.test(agent)) return "bi bi-phone text-lg";
  if (/android/i.test(agent)) return "bi bi-android2 text-lg";
  if (/mac os|macintosh/i.test(agent)) return "bi bi-apple text-lg";
  if (/windows/i.test(agent)) return "bi bi-windows text-lg";
  if (/linux/i.test(agent)) return "bi bi-terminal text-lg";
  return "bi bi-laptop text-lg";
};

const getDeviceLabel = (userAgent) => {
  if (!userAgent) {
    return t("profile.sessions.unknownDevice");
  }

  if (/iphone|ipad|android|mobile/i.test(userAgent)) {
    return userAgent.split(")").at(0)?.replace("(", "") || t("profile.sessions.currentDevice");
  }

  return userAgent.split(")").at(0)?.replace("(", "") || t("profile.sessions.currentDevice");
};

const loadSessions = async ({ notify = false } = {}) => {
  loading.value = true;

  try {
    const response = await authService.getSessions();
    sessions.value = response.data || [];

    if (notify) {
      toastStore.success(t("profile.sessions.fetched"));
    }
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.sessionErrors.load"));
  } finally {
    loading.value = false;
  }
};

const revokeSession = async (sessionId) => {
  actionSessionId.value = sessionId;

  try {
    await authService.revokeSession(sessionId);
    sessions.value = sessions.value.filter((session) => session.id !== sessionId);
    toastStore.success(t("profile.sessions.revoked"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.sessionErrors.revoke"));
  } finally {
    actionSessionId.value = null;
  }
};

const logoutAllSessions = async () => {
  loggingOutAll.value = true;

  try {
    await authStore.logoutAll();
    toastStore.success(t("profile.sessions.loggedOutAll"));
  } catch (requestError) {
    toastStore.danger(requestError.message || t("profile.sessionErrors.logoutAll"));
  } finally {
    loggingOutAll.value = false;
  }
};

onMounted(() => {
  loadSessions();
});
</script>

<template>
  <section class="rounded-md border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
    <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
          <ComputerDesktopIcon class="h-5 w-5" />
        </span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-xl font-bold">{{ t("profile.sessions.title") }}</h2>
            <span class="rounded-full bg-(--color-surface-soft) px-2.5 py-1 text-xs font-bold text-(--color-muted)">
              {{ sessionCountLabel }}
            </span>
          </div>
          <p class="mt-1 text-sm leading-6 text-(--color-muted)">
            {{ t("profile.sessions.description") }}
          </p>
        </div>
      </div>

      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        class="shrink-0 !rounded-sm"
        :disabled="loading"
        @click="loadSessions({ notify: true })"
      >
        <ArrowPathIcon class="h-4 w-4" />
        {{ t("profile.sessions.refresh") }}
      </AppButton>
    </div>

    <div
      v-if="loading"
      class="rounded-md border border-(--color-border) bg-(--color-surface-soft) p-6 text-center"
    >
      <LoadingSpinner :label="t('profile.sessions.loading')" />
    </div>

    <div
      v-else-if="!hasSessions"
      class="rounded-md border border-(--color-border) bg-(--color-surface-soft) px-4 py-6 text-center text-sm font-medium text-(--color-muted)"
    >
      {{ t("profile.sessions.empty") }}
    </div>

    <div v-else class="grid gap-3">
      <article
        v-for="session in sessions"
        :key="session.id"
        class="rounded-sm border border-(--color-border) bg-(--color-surface-soft) p-4 transition-all duration-300 hover:border-(--color-primary)"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="flex min-w-0 flex-1 gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-(--color-surface) text-(--color-primary) transition-colors duration-300">
              <i :class="getPlatformIconClass(session.user_agent)"></i>
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-bold text-(--color-text)">
                {{ getDeviceLabel(session.user_agent) }}
              </h3>
              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-(--color-surface) px-2.5 py-1 font-semibold text-(--color-muted)">
                  {{ t("profile.sessions.browser") }}: {{ getBrowserLabel(session.user_agent) }}
                </span>
                <span class="rounded-full bg-(--color-surface) px-2.5 py-1 font-semibold text-(--color-muted)">
                  {{ t("profile.sessions.platform") }}: {{ getPlatformLabel(session.user_agent) }}
                </span>
                <span class="rounded-full bg-(--color-surface) px-2.5 py-1 font-semibold text-(--color-muted)">
                  {{ t("profile.sessions.ipAddress") }}: {{ session.ip_address || "-" }}
                </span>
              </div>
              <dl class="mt-4 grid gap-3 text-xs text-(--color-muted) sm:grid-cols-3">
                <div class="rounded-md bg-(--color-surface) px-3 py-2">
                  <dt class="font-bold text-(--color-text)">{{ t("profile.sessions.lastUsed") }}</dt>
                  <dd class="mt-1">{{ formatDate(session.last_used_at) }}</dd>
                </div>
                <div class="rounded-md bg-(--color-surface) px-3 py-2">
                  <dt class="font-bold text-(--color-text)">{{ t("profile.sessions.created") }}</dt>
                  <dd class="mt-1">{{ formatDate(session.created_at) }}</dd>
                </div>
                <div class="rounded-md bg-(--color-surface) px-3 py-2">
                  <dt class="font-bold text-(--color-text)">{{ t("profile.sessions.expires") }}</dt>
                  <dd class="mt-1">{{ formatDate(session.expires_at) }}</dd>
                </div>
              </dl>
              <p class="mt-3 line-clamp-1 text-[11px] text-(--color-muted)">
                {{ session.user_agent || t("profile.sessions.unknownDevice") }}
              </p>
            </div>
          </div>

          <div class="flex justify-end">
            <AppButton
              type="button"
              variant="danger"
              size="sm"
              class="!rounded-sm"
              :disabled="Boolean(actionSessionId) || loggingOutAll"
              :loading="actionSessionId === session.id"
              @click="revokeSession(session.id)"
            >
              <TrashIcon class="h-4 w-4" />
              {{ t("profile.sessions.revoke") }}
            </AppButton>
          </div>
        </div>
      </article>
    </div>

    <div class="mt-5 rounded-sm border border-(--color-warning) bg-(--color-warning-soft) p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-surface) text-(--color-warning)">
            <ShieldExclamationIcon class="h-5 w-5" />
          </span>
          <div>
            <p class="text-sm font-bold text-(--color-warning)">
              {{ t("profile.sessions.logoutAll") }}
            </p>
            <p class="mt-1 text-sm leading-6 text-(--color-warning)">
              {{ t("profile.sessions.logoutAllHint") }}
            </p>
          </div>
        </div>
        <AppButton
          type="button"
          variant="danger"
          class="shrink-0 !rounded-sm"
          :disabled="loggingOutAll"
          :loading="loggingOutAll"
          @click="logoutAllSessions"
        >
          {{ t("profile.sessions.logoutAll") }}
        </AppButton>
      </div>
    </div>
  </section>
</template>
