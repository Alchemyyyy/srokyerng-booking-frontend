<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  Cog6ToothIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
  getDashboardRouteByRole,
  getNotificationRouteByRole,
  getProfileRouteByRole,
  getSettingsRouteByRole,
} from "@/shared/utils/roleRoutes";
import UserAvatar from "@/shared/components/UserAvatar.vue";

const isActiveRoute = (target) => {
  if (!target) return false;
  if (typeof target === "string") return route.path === target;
  if (target.name) return route.name === target.name;
  return false;
};

defineProps({
  solid: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n({ useScope: "global" });

const menuOpen = ref(false);

const userLabel = computed(() => {
  return (
    authStore.user?.name ||
    authStore.user?.full_name ||
    authStore.user?.fullName ||
    authStore.user?.username ||
    authStore.user?.email ||
    t("nav.signedInAs")
  );
});

const userEmail = computed(() => authStore.user?.email || "");

const roleLabel = computed(() => {
  const role = authStore.user?.role || "member";

  if (role === "customer") return t("roles.customer");
  if (role === "owner") return t("roles.owner");
  if (role === "admin") return t("roles.admin");

  return role.charAt(0).toUpperCase() + role.slice(1);
});

const dashboardRoute = computed(() =>
  getDashboardRouteByRole(authStore.user?.role),
);
const notificationRoute = computed(() =>
  getNotificationRouteByRole(authStore.user?.role),
);
const profileRoute = computed(() =>
  getProfileRouteByRole(authStore.user?.role),
);
const settingsRoute = computed(() =>
  getSettingsRouteByRole(authStore.user?.role),
);
const showListPropertyLink = computed(
  () => authStore.user?.role === "customer",
);
const isCustomer = computed(() => authStore.user?.role === "customer");

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  closeMenu();
  await router.push({ name: "public.home" });
};

const accountActions = computed(() =>
  [
    profileRoute.value && {
      label: isCustomer.value ? t("nav.myAccount") : t("nav.profile"),
      to: profileRoute.value,
      icon: UserCircleIcon,
    },
    dashboardRoute.value && {
      label: isCustomer.value ? t("nav.myBookings") : t("nav.dashboard"),
      to: dashboardRoute.value,
      icon: Squares2X2Icon,
    },
    isCustomer.value && {
      label: t("nav.savedStays"),
      to: { name: "customer.wishlist" },
      icon: HeartIcon,
    },
    notificationRoute.value && {
      label: t("nav.notifications"),
      to: notificationRoute.value,
      icon: BellIcon,
    },
    settingsRoute.value && {
      label: t("nav.settings"),
      to: settingsRoute.value,
      icon: Cog6ToothIcon,
    },
    {
      label: t("nav.helpSupport"),
      to: { name: "public.contact" },
      icon: QuestionMarkCircleIcon,
    },
    showListPropertyLink.value && {
      label: t("nav.becomePartner"),
      to: { name: "public.listProperty" },
      icon: BuildingOffice2Icon,
      accent: true,
    },
  ].filter(Boolean),
);

const primaryActions = computed(() =>
  accountActions.value.filter((action) => !action.accent),
);
const partnerAction = computed(() =>
  accountActions.value.find((action) => action.accent),
);

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  },
);
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="group flex h-10 items-center gap-2.5 rounded-xl border p-1 pr-3 transition-all duration-300 active:scale-95 hover:shadow-md"
      :class="
        solid
          ? 'border-(--color-border)/60 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) text-(--color-text) hover:border-(--color-primary)/40 hover:bg-(--color-surface-soft)/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
          : 'border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]'
      "
      :aria-expanded="menuOpen"
      aria-label="Open account menu"
      @click="toggleMenu"
    >
      <UserAvatar
        :name="userLabel"
        :src="authStore.user?.profile_image_url"
        size-class="h-8 w-8 text-xs font-bold shadow-sm transition-transform duration-300 group-hover:scale-105"
        :class="solid ? '' : '!bg-white/20 !text-white'"
      />
      <ChevronDownIcon
        class="h-4 w-4 transition-all duration-300 group-hover:text-(--color-primary)"
        :class="menuOpen ? 'rotate-180 text-(--color-primary)' : 'text-(--color-muted)'"
      />
    </button>

    <Teleport to="body">
      <Transition name="account-drawer-fade">
        <div v-if="menuOpen" class="fixed inset-0 z-[100]">
          <button
            type="button"
            class="absolute inset-0 cursor-default bg-transparent"
            aria-label="Close account menu"
            @click="closeMenu"
          />

          <Transition name="account-drawer-slide" appear>
            <aside
              class="account-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[390px] flex-col border-l border-(--color-border)/30 bg-(--color-surface)/95 backdrop-blur-xl shadow-[-20px_0_60px_rgba(0,0,0,0.2)] sm:max-w-[430px]"
              role="dialog"
              aria-modal="true"
              aria-label="Account menu"
            >
              <div
                class="flex items-start justify-between gap-4 px-6 pb-3 pt-6"
              >
                <div class="min-w-0">
                  <p class="text-2xl font-extrabold text-(--color-text) tracking-tight">
                    {{ t("nav.account") }}
                  </p>
                  <p class="mt-1 text-sm text-(--color-muted)">
                    {{ t("nav.manageAccount") }}
                  </p>
                </div>
                <button
                  type="button"
                  class="group flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border)/35 bg-(--color-surface-soft) text-(--color-muted) shadow-sm transition-all duration-300 hover:bg-(--color-primary) hover:text-white hover:border-(--color-primary)/20 hover:scale-105"
                  aria-label="Close account menu"
                  @click="closeMenu"
                >
                  <XMarkIcon
                    class="h-5 w-5 transition-transform duration-200 group-hover:rotate-90"
                  />
                </button>
              </div>

              <div
                class="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-4"
              >
                <div
                  class="account-drawer-card relative overflow-hidden rounded-2xl border border-(--color-border)/60 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-(--color-primary)/30"
                >
                  <!-- Ambient user card accent blob -->
                  <div
                    class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-(--color-primary)/15 blur-2xl pointer-events-none"
                  ></div>
                  <div
                    class="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-(--color-secondary)/10 blur-2xl pointer-events-none"
                  ></div>

                  <div class="relative z-10 flex items-start gap-4">
                    <UserAvatar
                      :name="userLabel"
                      :src="authStore.user?.profile_image_url"
                      size-class="h-16 w-16 text-xl font-extrabold shadow-md ring-2 ring-(--color-surface)/50"
                    />
                    <div class="min-w-0 flex-1 pt-1">
                      <p
                        class="truncate text-lg font-bold leading-6 text-(--color-text)"
                      >
                        {{ userLabel }}
                      </p>
                      <p class="mt-1 truncate text-sm text-(--color-muted)">
                        {{ userEmail }}
                      </p>
                      <div class="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          class="inline-flex items-center rounded-full bg-(--color-primary-soft) border border-(--color-primary)/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-(--color-primary) shadow-sm"
                        >
                          {{ roleLabel }}
                        </span>
                        <span
                          class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm"
                        >
                          <i
                            class="bi bi-patch-check-fill text-emerald-500"
                          ></i>
                          <span>{{ t("nav.verifiedProfile") }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-8">
                  <p
                    class="px-1 text-xs font-bold uppercase tracking-[0.2em] text-(--color-muted)"
                  >
                    Menu
                  </p>
                </div>

                <div class="mt-3 space-y-1.5">
                  <RouterLink
                    v-for="action in primaryActions"
                    :key="action.label"
                    :to="action.to"
                    class="group flex items-center gap-3.5 rounded-xl py-3 px-4 text-[15px] font-semibold transition-all duration-200"
                    :class="[
                      isActiveRoute(action.to)
                        ? 'bg-gradient-to-r from-(--color-primary-soft) to-(--color-surface-soft) border border-(--color-primary)/30 !text-(--color-primary) shadow-sm'
                        : 'border border-transparent text-(--color-text) hover:bg-(--color-surface-soft) hover:border-(--color-border)/40 hover:shadow-sm',
                    ]"
                    @click="closeMenu"
                  >
                    <span
                      class="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 shadow-sm"
                      :class="[
                        isActiveRoute(action.to)
                          ? 'bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) text-white shadow-md'
                          : 'bg-gradient-to-tr from-(--color-primary-soft) to-(--color-surface-soft) text-(--color-primary) group-hover:from-(--color-primary) group-hover:to-(--color-secondary) group-hover:text-white group-hover:shadow-md group-hover:scale-105',
                      ]"
                    >
                      <component :is="action.icon" class="h-5 w-5" />
                    </span>
                    <span class="flex-1 transition-transform duration-200 group-hover:translate-x-1">{{ action.label }}</span>
                    <ChevronDownIcon
                      class="h-4 w-4 -rotate-90 text-(--color-muted) transition-transform duration-200 group-hover:translate-x-1 group-hover:text-(--color-primary)"
                    />
                  </RouterLink>
                </div>

                <RouterLink
                  v-if="partnerAction"
                  :to="partnerAction.to"
                  class="mt-8 block rounded-2xl bg-gradient-to-br from-(--color-primary-strong) to-(--color-surface-strong) text-white border border-(--color-primary)/40 p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-(--color-primary)/60"
                  @click="closeMenu"
                >
                  <!-- Ambient reflection blobs inside banner -->
                  <div
                    class="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) opacity-30 blur-2xl group-hover:scale-125 transition-all duration-500"
                  ></div>
                  <div
                    class="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-amber-500/15 blur-xl group-hover:scale-125 transition-all duration-500"
                  ></div>

                  <div class="relative z-10 flex items-start gap-4">
                    <span
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    >
                      <component :is="partnerAction.icon" class="h-6 w-6" />
                    </span>
                    <div>
                      <p class="font-extrabold text-white tracking-wide text-base group-hover:text-amber-300 transition-colors">
                        {{ partnerAction.label }}
                      </p>
                      <p
                        class="mt-1.5 text-xs leading-relaxed text-white/80 font-medium"
                      >
                        {{ t("nav.becomePartnerDesc") }}
                      </p>
                    </div>
                  </div>
                </RouterLink>
              </div>

              <div
                class="account-drawer-footer border-t border-(--color-border)/60 bg-gradient-to-b from-(--color-surface) to-(--color-surface-soft) p-6"
              >
                <button
                  type="button"
                  class="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-sm font-bold text-red-500 shadow-sm transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500/10 hover:shadow-[0_8px_25px_rgba(239,68,68,0.3)] active:scale-[0.98]"
                  @click="handleLogout"
                >
                  <ArrowRightOnRectangleIcon
                    class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  />
                  {{ t("nav.logout") }}
                </button>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.account-drawer-fade-enter-active,
.account-drawer-fade-leave-active {
  transition: opacity 180ms ease;
}

.account-drawer-fade-enter-from,
.account-drawer-fade-leave-to {
  opacity: 0;
}

.account-drawer-slide-enter-active,
.account-drawer-slide-leave-active {
  transition: transform 220ms ease;
}

.account-drawer-slide-enter-from,
.account-drawer-slide-leave-to {
  transform: translateX(100%);
}

:global(:root[data-theme="dark"]) {
  --account-drawer-bg: var(--color-surface);
  --account-drawer-card-bg: var(--color-surface-soft);
  --account-drawer-footer-bg: var(--color-surface);
  --account-drawer-menu-text: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"])) {
    --account-drawer-bg: var(--color-surface);
    --account-drawer-card-bg: var(--color-surface-soft);
    --account-drawer-footer-bg: var(--color-surface);
    --account-drawer-menu-text: var(--color-text);
  }
}

.account-drawer-card {
  background-color: var(--account-drawer-card-bg, var(--color-surface-soft));
}

.account-drawer-footer {
  background-color: var(--account-drawer-footer-bg, var(--color-surface));
}

.account-drawer-panel a:not([class*="text-(--color-primary)"]) {
  color: var(--account-drawer-menu-text, var(--color-text));
}
</style>
