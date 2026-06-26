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
  Bars3Icon,
  GlobeAltIcon,
  ChatBubbleOvalLeftIcon,
  ArrowsRightLeftIcon,
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

const goToProfile = () => {
  if (profileRoute.value) {
    router.push(profileRoute.value);
  }
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
    <div class="flex items-center gap-3">
      <!-- Profile Avatar Circle Button -->
      <button
        type="button"
        class="group flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 hover:shadow-md cursor-pointer overflow-hidden"
        :class="
          solid
            ? 'border-(--color-border)/60 bg-(--color-surface-soft) hover:border-(--color-primary)/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
            : 'border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/30 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]'
        "
        :aria-expanded="menuOpen"
        aria-label="Go to profile"
        @click="goToProfile"
      >
        <UserAvatar
          :name="userLabel"
          :src="authStore.user?.profile_image_url"
          size-class="h-full w-full text-base font-bold shadow-sm transition-transform duration-300 group-hover:scale-105"
          :class="solid ? '' : '!bg-white/20 !text-white'"
        />
      </button>

      <!-- Hamburger Menu Circle Button -->
      <button
        type="button"
        class="group flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 hover:shadow-md cursor-pointer"
        :class="
          solid
            ? 'border-(--color-border)/60 bg-gray-100 dark:bg-neutral-800 text-(--color-text) hover:border-(--color-primary)/40 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
            : 'border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]'
        "
        :aria-expanded="menuOpen"
        aria-label="Open account menu"
        @click="toggleMenu"
      >
        <Bars3Icon
          class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
          :class="menuOpen ? 'text-(--color-primary)' : 'text-(--color-text)'"
        />
      </button>
    </div>

    <!-- Full screen invisible backdrop to close menu when clicking outside -->
    <div
      v-if="menuOpen"
      class="fixed inset-0 z-40 bg-transparent"
      @click="closeMenu"
    ></div>

    <!-- Floating Airbnb Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="menuOpen"
        class="absolute right-0 top-14 z-50 w-80 rounded-3xl bg-white dark:bg-neutral-900 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-neutral-800 text-sm font-semibold text-gray-800 dark:text-gray-200"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        <!-- Top Section -->
        <RouterLink
          v-if="dashboardRoute"
          :to="dashboardRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <ArrowsRightLeftIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>{{ isCustomer ? 'Switch to hosting' : 'Dashboard' }}</span>
        </RouterLink>

        <div class="my-2 border-b border-gray-100 dark:border-neutral-800"></div>

        <!-- Trips & Interaction Section -->
        <RouterLink
          :to="{ name: 'customer.wishlist' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <HeartIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Wishlists</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'customer.reservations' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <Squares2X2Icon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Trips</span>
        </RouterLink>

        <div
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <ChatBubbleOvalLeftIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Messages</span>
        </div>

        <RouterLink
          v-if="profileRoute"
          :to="profileRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <UserCircleIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Profile</span>
        </RouterLink>

        <div class="my-2 border-b border-gray-100 dark:border-neutral-800"></div>

        <!-- Account & Preferences Section -->
        <RouterLink
          v-if="notificationRoute"
          :to="notificationRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <BellIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Notifications</span>
        </RouterLink>

        <RouterLink
          v-if="settingsRoute"
          :to="settingsRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <Cog6ToothIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Account settings</span>
        </RouterLink>

        <div
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <GlobeAltIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Languages & currency</span>
        </div>

        <RouterLink
          :to="{ name: 'public.contact' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <QuestionMarkCircleIcon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span>Help Center</span>
        </RouterLink>

        <div class="my-2 border-b border-gray-100 dark:border-neutral-800"></div>

        <!-- Become a host callout -->
        <RouterLink
          :to="{ name: 'public.listProperty' }"
          class="flex items-center justify-between px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
          @click="closeMenu"
        >
          <div>
            <div class="font-bold text-gray-900 dark:text-white">Become a host</div>
            <div class="text-xs text-gray-500 font-normal mt-0.5">It's easy to start hosting and earn extra income.</div>
          </div>
          <span class="text-2xl group-hover:scale-110 transition-transform">🏠</span>
        </RouterLink>

        <div class="my-2 border-b border-gray-100 dark:border-neutral-800"></div>

        <!-- Referral & Extra Links -->
        <div class="px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-normal" @click="closeMenu">
          Refer a Host
        </div>
        <div class="px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-normal" @click="closeMenu">
          Find a co-host
        </div>
        <div class="px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-normal" @click="closeMenu">
          Gift cards
        </div>

        <div class="my-2 border-b border-gray-100 dark:border-neutral-800"></div>

        <!-- Log out -->
        <button
          type="button"
          class="w-full text-left px-5 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-normal text-gray-900 dark:text-white block"
          @click="handleLogout"
        >
          Log out
        </button>
      </div>
    </Transition>
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
