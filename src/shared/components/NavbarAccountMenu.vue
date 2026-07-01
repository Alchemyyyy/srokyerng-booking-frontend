<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import {
  getDashboardRouteByRole,
  getNotificationRouteByRole,
  getProfileRouteByRole,
  getSettingsRouteByRole,
} from "@/shared/utils/roleRoutes";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import { useNavbarAppearance } from "@/shared/composables/useNavbarAppearance";
import { setLocale } from "@/app/i18n";

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
const { t, locale } = useI18n({ useScope: "global" });
const { currentTheme, toggleTheme } = useNavbarAppearance(route);
const notificationStore = useNotificationStore();

watch(
  () => authStore.isAuthenticated,
  (newVal) => {
    if (newVal) {
      notificationStore.fetchUnreadCount();
    }
  },
  { immediate: true }
);

const toggleLanguage = () => {
  setLocale(locale.value === "en" ? "km" : "en");
};

const menuOpen = ref(false);
const menuRef = ref(null);

const handleDocumentClick = (e) => {
  if (menuOpen.value && menuRef.value && !menuRef.value.contains(e.target)) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  if (authStore.isAuthenticated) {
    notificationStore.fetchUnreadCount();
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});

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
const isHosting = computed(() => route.path.startsWith("/owner"));

const switchLink = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) return null;

  const role = authStore.user.role;
  if (role === "owner") {
    return isHosting.value
      ? { label: "Switch to traveling", to: "/" }
      : { label: "Switch to hosting", to: "/owner" };
  } else if (role === "customer") {
    return { label: "Switch to hosting", to: { name: "public.listProperty" } };
  } else if (role === "admin") {
    return { label: "Admin Dashboard", to: { name: "admin.dashboard" } };
  }
  return null;
});

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
  <div ref="menuRef" class="relative">
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
        class="group relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 hover:shadow-md cursor-pointer"
        :class="
          solid
            ? 'border-(--color-border)/60 bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-primary)/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
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
        <!-- Red Notification Dot Indicator -->
        <span
          v-if="notificationStore.unreadCount > 0"
          class="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-(--color-surface)"
        ></span>
      </button>
    </div>


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
        class="absolute right-0 top-14 z-50 w-80 max-h-[80vh] overflow-y-auto rounded-3xl bg-(--color-surface) py-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-(--color-border) text-sm font-semibold text-(--color-text)"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        <!-- Top Section -->
        <RouterLink
          v-if="switchLink"
          :to="switchLink.to"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <ArrowsRightLeftIcon class="h-5 w-5 text-(--color-text)" />
          <span>{{ switchLink.label }}</span>
        </RouterLink>

        <div v-if="switchLink" class="my-2 border-b border-(--color-border)"></div>

        <!-- Trips & Interaction Section -->
        <RouterLink
          :to="{ name: 'customer.wishlist' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <HeartIcon class="h-5 w-5 text-(--color-text)" />
          <span>Wishlists</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'customer.booking-history' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <Squares2X2Icon class="h-5 w-5 text-(--color-text)" />
          <span>Trips</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'customer.chats' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <ChatBubbleOvalLeftIcon class="h-5 w-5 text-(--color-text)" />
          <span>Messages</span>
        </RouterLink>

        <RouterLink
          v-if="profileRoute"
          :to="profileRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <UserCircleIcon class="h-5 w-5 text-(--color-text)" />
          <span>Profile</span>
        </RouterLink>

        <div class="my-2 border-b border-(--color-border)"></div>

        <!-- Account & Preferences Section -->
        <RouterLink
          v-if="notificationRoute"
          :to="notificationRoute"
          class="flex items-center justify-between px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <div class="flex items-center gap-4">
            <BellIcon class="h-5 w-5 text-(--color-text)" />
            <span>Notifications</span>
          </div>
          <!-- Dropdown Item Badge Unread Count -->
          <span
            v-if="notificationStore.unreadCount > 0"
            class="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </RouterLink>

        <RouterLink
          v-if="settingsRoute"
          :to="settingsRoute"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <Cog6ToothIcon class="h-5 w-5 text-(--color-text)" />
          <span>Account settings</span>
        </RouterLink>

        <!-- Theme Switcher Row -->
        <div
          class="flex items-center justify-between px-5 py-2.5 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click.stop="toggleTheme"
        >
          <div class="flex items-center gap-4">
            <MoonIcon v-if="currentTheme === 'dark'" class="h-5 w-5 text-(--color-text)" />
            <SunIcon v-else class="h-5 w-5 text-(--color-text)" />
            <span>Theme</span>
          </div>
          <span class="text-xs text-(--color-muted) capitalize font-medium">{{ currentTheme }}</span>
        </div>

        <!-- Language Switcher Row -->
        <div
          class="flex items-center justify-between px-5 py-2 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click.stop="toggleLanguage"
        >
          <div class="flex items-center gap-4">
            <GlobeAltIcon class="h-5 w-5 text-(--color-text)" />
            <span>Language</span>
          </div>
          <LanguageToggle @click.stop />
        </div>

        <RouterLink
          :to="{ name: 'public.contact' }"
          class="flex items-center gap-4 px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
          @click="closeMenu"
        >
          <QuestionMarkCircleIcon class="h-5 w-5 text-(--color-text)" />
          <span>Help Center</span>
        </RouterLink>

        <div class="my-2 border-b border-(--color-border)"></div>

        <!-- Become a host callout -->
        <RouterLink
          :to="{ name: 'public.listProperty' }"
          class="flex items-center justify-between px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer group"
          @click="closeMenu"
        >
          <div>
            <div class="font-bold text-(--color-text)">Become a host</div>
            <div class="text-xs text-(--color-muted) font-normal mt-0.5">It's easy to start hosting and earn extra income.</div>
          </div>
          <span class="text-2xl group-hover:scale-110 transition-transform">🏠</span>
        </RouterLink>



        <!-- Log out -->
        <button
          type="button"
          class="w-full text-left px-5 py-3 hover:bg-(--color-surface-soft) transition-colors cursor-pointer font-normal text-(--color-text) block"
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
