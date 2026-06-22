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

const dashboardRoute = computed(() => getDashboardRouteByRole(authStore.user?.role));
const notificationRoute = computed(() => getNotificationRouteByRole(authStore.user?.role));
const profileRoute = computed(() => getProfileRouteByRole(authStore.user?.role));
const settingsRoute = computed(() => getSettingsRouteByRole(authStore.user?.role));
const showListPropertyLink = computed(() => authStore.user?.role === "customer");
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

const accountActions = computed(() => [
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
].filter(Boolean));

const primaryActions = computed(() => accountActions.value.filter((action) => !action.accent));
const partnerAction = computed(() => accountActions.value.find((action) => action.accent));

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
      class="flex h-10 items-center gap-2 rounded-sm border px-1.5 pr-3 transition"
      :class="
        solid
          ? 'border-(--color-border) bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-primary)'
          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      "
      :aria-expanded="menuOpen"
      aria-label="Open account menu"
      @click="toggleMenu"
    >
      <UserAvatar
        :name="userLabel"
        :src="authStore.user?.profile_image_url"
        size-class="h-7 w-7 text-xs"
        :class="
          solid
            ? ''
            : '!bg-white/20 !text-white'
        "
      />
      <ChevronDownIcon class="h-4 w-4 transition" :class="menuOpen ? 'rotate-180' : ''" />
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
              class="account-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[390px] flex-col border-l border-(--color-border)/30 bg-(--color-surface)/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.12)] sm:max-w-[430px]"
              role="dialog"
              aria-modal="true"
              aria-label="Account menu"
            >
              <div class="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
                <div class="min-w-0">
                  <p class="text-xl font-bold text-(--color-text)">
                    {{ t("nav.account") }}
                  </p>
                  <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                    {{ t("nav.manageAccount") }}
                  </p>
                </div>
                <button
                  type="button"
                  class="group flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border)/35 bg-(--color-surface-soft) text-(--color-muted) shadow-sm transition-all duration-300 hover:bg-(--color-primary) hover:text-white hover:border-(--color-primary)/20"
                  aria-label="Close account menu"
                  @click="closeMenu"
                >
                  <XMarkIcon class="h-4.5 w-4.5 transition-transform duration-200 group-hover:rotate-90" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-3">
                <div class="account-drawer-card relative overflow-hidden rounded-md border border-(--color-border)/45 bg-gradient-to-br from-(--color-surface-soft) to-(--color-surface) p-5 shadow-sm">
                  <!-- Ambient user card accent blob -->
                  <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-(--color-primary)/10 blur-xl pointer-events-none"></div>
                  
                  <div class="relative z-10 flex items-start gap-4">
                    <UserAvatar
                      :name="userLabel"
                      :src="authStore.user?.profile_image_url"
                      size-class="h-16 w-16 text-lg"
                    />
                    <div class="min-w-0 flex-1 pt-1">
                      <p class="truncate text-lg font-bold leading-6 text-(--color-text)">
                        {{ userLabel }}
                      </p>
                      <p class="mt-1 truncate text-sm text-(--color-muted)">
                        {{ userEmail }}
                      </p>
                      <div class="mt-3 flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center rounded-full bg-(--color-primary-soft) border border-(--color-primary)/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.1em] text-(--color-primary)">
                          {{ roleLabel }}
                        </span>
                        <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <i class="bi bi-patch-check-fill text-emerald-500"></i>
                          <span>{{ t("nav.verifiedProfile") }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6">
                  <p class="px-1 text-xs font-bold uppercase tracking-[0.18em] text-(--color-muted)">
                    Menu
                  </p>
                </div>

                <div class="mt-3 space-y-1">
                  <RouterLink
                    v-for="action in primaryActions"
                    :key="action.label"
                    :to="action.to"
                    class="group flex items-center gap-3 rounded-sm py-2 px-3 border-l-2 text-[15px] font-semibold transition-all duration-200"
                    :class="[
                      isActiveRoute(action.to)
                        ? 'bg-gradient-to-r from-(--color-primary-soft)/60 to-transparent border-(--color-primary) !text-(--color-primary)'
                        : 'border-transparent text-(--color-text) hover:bg-(--color-surface-soft)'
                    ]"
                    @click="closeMenu"
                  >
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-sm transition-all duration-300 shadow-sm"
                      :class="[
                        isActiveRoute(action.to)
                          ? 'bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) text-white'
                          : 'bg-gradient-to-tr from-(--color-primary-soft) to-(--color-surface-soft) text-(--color-primary) group-hover:from-(--color-primary) group-hover:to-(--color-secondary) group-hover:text-white'
                      ]"
                    >
                      <component :is="action.icon" class="h-4.5 w-4.5" />
                    </span>
                    <span class="flex-1">{{ action.label }}</span>
                    <ChevronDownIcon class="h-4 w-4 -rotate-90 text-(--color-muted) transition-transform duration-200 group-hover:translate-x-0.5" />
                  </RouterLink>
                </div>

                <RouterLink
                  v-if="partnerAction"
                  :to="partnerAction.to"
                  class="mt-6 block rounded-md bg-gradient-to-br from-(--color-primary-strong) to-(--color-surface-strong) text-white border border-(--color-primary)/35 p-5 shadow-lg relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-(--color-primary)/50"
                  @click="closeMenu"
                >
                  <!-- Ambient reflection blobs inside banner -->
                  <div class="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-gradient-to-tr from-(--color-primary) to-(--color-secondary) opacity-20 blur-xl group-hover:scale-110 transition-all duration-500"></div>
                  <div class="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-amber-500/10 blur-lg group-hover:scale-110 transition-all duration-500"></div>

                  <div class="relative z-10 flex items-start gap-4">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-white/10 backdrop-blur-sm text-white shadow-inner transition-transform duration-300 group-hover:scale-105">
                      <component :is="partnerAction.icon" class="h-5.5 w-5.5" />
                    </span>
                    <div>
                      <p class="font-bold text-white tracking-wide text-[15px]">{{ partnerAction.label }}</p>
                      <p class="mt-1.5 text-xs leading-normal text-white/80 font-medium">
                        {{ t("nav.becomePartnerDesc") }}
                      </p>
                    </div>
                  </div>
                </RouterLink>
              </div>

              <div class="account-drawer-footer border-t border-(--color-border) bg-(--color-surface) p-5">
                <button
                  type="button"
                  class="group flex w-full items-center justify-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500/10 hover:shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
                  @click="handleLogout"
                >
                  <ArrowRightOnRectangleIcon class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
