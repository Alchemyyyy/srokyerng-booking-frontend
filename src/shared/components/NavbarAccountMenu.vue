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
let previousBodyOverflow = "";

const lockBodyScroll = () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
  document.body.style.overflow = previousBodyOverflow;
};

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
    label: isCustomer.value ? "My account" : "Profile",
    to: profileRoute.value,
    icon: UserCircleIcon,
  },
  dashboardRoute.value && {
    label: isCustomer.value ? "My bookings" : t("nav.dashboard"),
    to: dashboardRoute.value,
    icon: Squares2X2Icon,
  },
  isCustomer.value && {
    label: "Saved stays",
    to: { name: "customer.wishlist" },
    icon: HeartIcon,
  },
  notificationRoute.value && {
    label: "Notifications",
    to: notificationRoute.value,
    icon: BellIcon,
  },
  settingsRoute.value && {
    label: "Settings",
    to: settingsRoute.value,
    icon: Cog6ToothIcon,
  },
  showListPropertyLink.value && {
    label: t("nav.listProperty"),
    to: { name: "public.listProperty" },
    icon: BuildingOffice2Icon,
    accent: true,
  },
].filter(Boolean));

const primaryActions = computed(() => accountActions.value.filter((action) => !action.accent));
const partnerAction = computed(() => accountActions.value.find((action) => action.accent));

watch(
  menuOpen,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll();
      return;
    }

    unlockBodyScroll();
  },
);

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  },
);

onUnmounted(() => {
  unlockBodyScroll();
});
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border px-1.5 pr-3 transition"
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
            class="absolute inset-0 cursor-default bg-(--color-surface-strong)/20"
            aria-label="Close account menu"
            @click="closeMenu"
          />

          <Transition name="account-drawer-slide" appear>
            <aside
              class="account-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[390px] flex-col border-l border-(--color-border) sm:max-w-[430px]"
              style="background-color: var(--account-drawer-bg, var(--color-surface));"
              role="dialog"
              aria-modal="true"
              aria-label="Account menu"
            >
              <div class="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
                <div class="min-w-0">
                  <p class="text-xl font-bold text-(--color-text)">
                    Account
                  </p>
                  <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                    Manage your booking account.
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full text-(--color-muted) transition hover:bg-(--color-surface-soft) hover:text-(--color-text)"
                  aria-label="Close account menu"
                  @click="closeMenu"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto px-5 pb-5 pt-3">
                <div class="account-drawer-card rounded-[var(--radius-lg)] border border-(--color-border) bg-(--color-surface-soft) p-4">
                  <div class="flex items-start gap-4">
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
                      <span class="mt-3 inline-flex rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-(--color-primary)">
                        {{ roleLabel }}
                      </span>
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
                    class="group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-semibold text-(--color-text) transition hover:bg-(--color-surface-soft)"
                    @click="closeMenu"
                  >
                    <span class="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-(--color-primary-soft) text-(--color-primary) transition group-hover:bg-(--color-primary) group-hover:text-white">
                      <component :is="action.icon" class="h-5 w-5" />
                    </span>
                    <span class="flex-1">{{ action.label }}</span>
                    <ChevronDownIcon class="h-4 w-4 -rotate-90 text-(--color-muted)" />
                  </RouterLink>
                </div>

                <RouterLink
                  v-if="partnerAction"
                  :to="partnerAction.to"
                  class="mt-6 block rounded-[var(--radius-lg)] border border-(--color-primary)/35 bg-(--color-primary-soft) p-4 text-(--color-primary) transition hover:border-(--color-primary)"
                  @click="closeMenu"
                >
                  <div class="flex items-start gap-3">
                    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-(--color-surface) text-(--color-primary)">
                      <component :is="partnerAction.icon" class="h-5 w-5" />
                    </span>
                    <div>
                      <p class="font-bold">{{ partnerAction.label }}</p>
                      <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                        Become a partner and host your accommodation.
                      </p>
                    </div>
                  </div>
                </RouterLink>
              </div>

              <div class="account-drawer-footer border-t border-(--color-border) bg-(--color-surface) p-5">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-(--color-danger) px-4 py-3 text-sm font-bold text-(--color-danger) transition hover:bg-(--color-danger-soft)"
                  @click="handleLogout"
                >
                  <ArrowRightOnRectangleIcon class="h-5 w-5" />
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
  --account-drawer-bg: #242526;
  --account-drawer-card-bg: #303132;
  --account-drawer-footer-bg: #242526;
  --account-drawer-menu-text: #e4e6eb;
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"])) {
    --account-drawer-bg: #242526;
    --account-drawer-card-bg: #303132;
    --account-drawer-footer-bg: #242526;
    --account-drawer-menu-text: #e4e6eb;
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
