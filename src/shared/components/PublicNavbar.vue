<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import lightModeLogo from "@/assets/images/logos/logo.png";
import darkModeLogo from "@/assets/images/logos/logo2.png";

import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";
import AppButton from "@/shared/components/AppButton.vue";
import NotificationBell from "@/modules/notifications/components/NotificationBell.vue";
import NavbarAccountMenu from "@/shared/components/NavbarAccountMenu.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import { getDashboardRouteByRole } from "@/shared/utils/roleRoutes";
import { useNavbarAppearance } from "@/shared/composables/useNavbarAppearance";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const { t, locale } = useI18n({ useScope: "global" });

const { currentTheme, resolvedTheme, isNavbarSolid, toggleTheme } =
  useNavbarAppearance(route);

const isProfilePage = computed(() => route.name === "customer.profile");

const handleDone = () => {
  const targetRoute = getDashboardRouteByRole(authStore.user?.role) || { name: "public.home" };
  router.push(targetRoute);
};

const navigationItems = computed(() => [
  { label: t("nav.home"), to: { name: "public.home" }, icon: "bi-house" },
  {
    label: t("nav.properties"),
    to: { name: "public.properties" },
    icon: "bi-houses",
  },
  {
    label: t("nav.about"),
    to: { name: "public.about" },
    icon: "bi-info-circle",
  },
  {
    label: t("nav.contact"),
    to: { name: "public.contact" },
    icon: "bi-envelope",
  },
]);

const dashboardRoute = computed(() =>
  getDashboardRouteByRole(authStore.user?.role),
);

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

const isActiveRoute = (name) => route.name === name;

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
  closeMobileMenu();
  await router.push({ name: "public.home" });
};

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu();
  },
);
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 w-full pointer-events-auto transition-all duration-300 ease-in-out border-b border-(--color-border)/70 bg-(--color-page)/80 backdrop-blur-md py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
  >
    <!-- Inner Centered Wrapper -->
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <!-- Left Brand Section -->
      <div class="flex shrink-0 items-center gap-3">
        <RouterLink
          :to="{ name: 'public.home' }"
          class="flex shrink-0 items-center gap-2.5 text-(--color-text) transition group"
        >
          <img
            v-if="resolvedTheme === 'dark'"
            :src="darkModeLogo"
            alt="Srokyerng Booking"
            class="h-9 w-auto object-contain brightness-200 group-hover:scale-105 transition-transform duration-200"
          />
          <img
            v-else
            :src="lightModeLogo"
            alt="Srokyerng Booking"
            class="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <span
            class="font-kantumruy text-2xl font-black tracking-tight leading-none self-center text-(--color-primary)"
          >
            ស្រុកយើង
          </span>
        </RouterLink>
      </div>

      <!-- Middle Airbnb Pill Dock -->
      <nav
        v-if="!isProfilePage"
        class="hidden lg:flex items-center rounded-full border border-(--color-border) bg-(--color-surface) py-1.5 px-2.5 shadow-xs hover:shadow-md transition-all duration-200"
      >
        <!-- Properties / Stays -->
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-(--color-text) hover:bg-(--color-surface-soft) rounded-full transition-colors cursor-pointer"
          :class="[isActiveRoute('public.properties') ? 'bg-(--color-surface-soft) !text-(--color-primary)' : '']"
        >
          <i class="bi bi-houses text-base transition-colors" :class="isActiveRoute('public.properties') ? 'text-(--color-primary)' : 'text-(--color-muted)'"></i>
          <span>{{ t("nav.properties") }}</span>
        </RouterLink>

        <div class="h-4 w-px bg-(--color-border) mx-1"></div>

        <!-- About -->
        <RouterLink
          :to="{ name: 'public.about' }"
          class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-(--color-text) hover:bg-(--color-surface-soft) rounded-full transition-colors cursor-pointer"
          :class="[isActiveRoute('public.about') ? 'bg-(--color-surface-soft) !text-(--color-primary)' : '']"
        >
          <i class="bi bi-info-circle text-base transition-colors" :class="isActiveRoute('public.about') ? 'text-(--color-primary)' : 'text-(--color-muted)'"></i>
          <span>{{ t("nav.about") }}</span>
        </RouterLink>

        <div class="h-4 w-px bg-(--color-border) mx-1"></div>

        <!-- Contact -->
        <RouterLink
          :to="{ name: 'public.contact' }"
          class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-(--color-text) hover:bg-(--color-surface-soft) rounded-full transition-colors cursor-pointer"
          :class="[isActiveRoute('public.contact') ? 'bg-(--color-surface-soft) !text-(--color-primary)' : '']"
        >
          <i class="bi bi-envelope text-base transition-colors" :class="isActiveRoute('public.contact') ? 'text-(--color-primary)' : 'text-(--color-muted)'"></i>
          <span>{{ t("nav.contact") }}</span>
        </RouterLink>

        <!-- Signature Airbnb Search Circular Button -->
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="h-9 w-9 bg-(--color-primary) hover:opacity-90 text-white rounded-full flex items-center justify-center ml-2 shadow-md transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer"
          title="Search properties"
        >
          <i class="bi bi-search text-sm font-bold"></i>
        </RouterLink>
      </nav>

      <!-- Right Side Section (Host CTA + Account Menu) -->
      <div class="hidden lg:flex shrink-0 items-center gap-2">
        <template v-if="isProfilePage">
          <button
            type="button"
            @click="handleDone"
            class="px-6 py-2 rounded-full bg-(--color-surface-soft) text-(--color-text) border border-(--color-border) text-sm font-bold shadow-xs hover:opacity-90 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </template>
        <template v-else>
          <RouterLink
            :to="{ name: 'public.listProperty' }"
            class="text-sm font-bold px-4 py-2.5 rounded-full hover:bg-(--color-surface-soft) text-(--color-text) transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i class="bi bi-house-add text-base text-(--color-primary)"></i>
            <span>{{ t("nav.listProperty") }}</span>
          </RouterLink>

          <!-- Theme & Language Switchers -->
          <div class="flex items-center gap-2 px-1">
            <ThemeToggle />
            <div class="h-4 w-px bg-(--color-border)/85"></div>
            <LanguageToggle />
          </div>

          <!-- CTAs / Session Actions -->
          <template v-if="authStore.isAuthenticated">
            <NavbarAccountMenu :solid="true" />
          </template>

          <template v-else>
            <RouterLink :to="{ name: 'public.loginCustomer' }">
              <button
                type="button"
                class="px-5 py-2.5 rounded-full border border-(--color-border) text-sm font-bold text-(--color-text) hover:bg-(--color-surface-soft) transition-colors cursor-pointer"
              >
                {{ t("nav.login") }}
              </button>
            </RouterLink>

            <RouterLink :to="{ name: 'public.registerCustomer' }">
              <button
                type="button"
                class="px-5 py-2.5 rounded-full bg-(--color-primary) hover:opacity-90 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {{ t("nav.register") }}
              </button>
            </RouterLink>
          </template>
        </template>
      </div>

      <!-- Mobile Action Section (Done button or Menu Trigger) -->
      <template v-if="isProfilePage">
        <button
          type="button"
          @click="handleDone"
          class="px-5 py-2 rounded-full bg-(--color-surface-soft) text-(--color-text) border border-(--color-border) text-sm font-bold shadow-xs hover:opacity-90 transition-all duration-200 active:scale-95 cursor-pointer lg:hidden"
        >
          Done
        </button>
      </template>
      <button
        v-else
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-soft) text-(--color-text) transition hover:border-(--color-primary) hover:text-(--color-primary) lg:hidden pointer-events-auto shadow-sm cursor-pointer"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="
              mobileMenuOpen
                ? 'M6 6l12 12M6 18L18 6'
                : 'M4 7h16M4 12h16M4 17h16'
            "
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer Menu -->
    <div
      v-if="mobileMenuOpen"
      class="absolute top-full left-0 w-full border-b border-(--color-border) bg-(--color-page) backdrop-blur-xl lg:hidden p-6 shadow-2xl pointer-events-auto transition-all duration-300"
    >
      <div class="space-y-6">
        <!-- Settings & Toggles -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <div class="h-4 w-px bg-(--color-border)"></div>
            <LanguageToggle />
          </div>

          <!-- Mobile Quick Search Shortcut -->
          <RouterLink
            :to="{ name: 'public.properties' }"
            @click="closeMobileMenu"
            class="flex items-center gap-2 bg-(--color-surface) border border-(--color-primary)/30 px-4 py-2 rounded-full text-xs font-bold text-(--color-primary)"
          >
            <i class="bi bi-search"></i>
            <span>{{ t("nav.searchPlaceholder") }}</span>
          </RouterLink>
        </div>

        <!-- Links -->
        <nav class="space-y-2">
          <RouterLink
            v-for="item in navigationItems"
            :key="`${item.label}-mobile`"
            :to="item.to"
            class="flex items-center gap-4 rounded-2xl px-5 py-3.5 text-base font-semibold transition-colors cursor-pointer"
            :class="
              isActiveRoute(item.to.name)
                ? 'bg-(--color-surface-soft) text-(--color-primary) font-bold'
                : 'bg-(--color-surface) text-(--color-text) hover:bg-(--color-surface-soft)'
            "
            @click="closeMobileMenu"
          >
            <i class="bi text-lg" :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Customer Mobile Shortcuts -->
        <div
          v-if="
            authStore.isAuthenticated && authStore.user?.role === 'customer'
          "
          class="grid grid-cols-3 gap-3 border-t border-(--color-border) pt-6"
        >
          <RouterLink
            :to="{ name: 'customer.wishlist' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-(--color-surface) text-(--color-text) hover:text-(--color-primary) transition-colors text-xs font-semibold"
          >
            <i class="bi bi-heart text-xl"></i>
            <span>Wishlist</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.chats' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-(--color-surface) text-(--color-text) hover:text-(--color-primary) transition-colors text-xs font-semibold"
          >
            <i class="bi bi-chat-dots text-xl"></i>
            <span>Messages</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.booking-history' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-(--color-surface) text-(--color-text) hover:text-(--color-primary) transition-colors text-xs font-semibold"
          >
            <i class="bi bi-ticket-detailed text-xl"></i>
            <span>Bookings</span>
          </RouterLink>
        </div>

        <!-- User Options / CTAs -->
        <div v-if="authStore.isAuthenticated" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <NotificationBell />

            <RouterLink
              v-if="dashboardRoute"
              :to="dashboardRoute"
              class="flex-1 rounded-2xl border border-(--color-border) px-5 py-3.5 text-center text-base font-bold text-(--color-text) transition hover:bg-(--color-surface-soft) cursor-pointer"
              @click="closeMobileMenu"
            >
              {{ t("nav.dashboard") }}
            </RouterLink>
          </div>

          <div
            class="flex items-center gap-4 rounded-2xl bg-(--color-surface) p-5 border border-(--color-border)"
          >
            <UserAvatar
              :name="userLabel"
              :src="authStore.user?.profile_image_url"
              size-class="h-14 w-14 text-lg font-bold"
            />
            <div class="min-w-0">
              <p
                class="text-xs font-bold uppercase tracking-[0.2em] text-(--color-muted)"
              >
                {{ t("nav.signedInAs") }}
              </p>
              <p
                class="mt-1 truncate text-lg font-bold text-(--color-text)"
              >
                {{ userLabel }}
              </p>
              <p class="text-xs font-medium text-(--color-muted)">
                {{ authStore.user?.role || "Member" }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="block w-full rounded-2xl bg-(--color-primary) hover:opacity-90 px-5 py-3.5 text-base font-bold text-white transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <div v-else class="space-y-4">
          <RouterLink
            :to="{ name: 'public.listProperty' }"
            class="block rounded-2xl border border-(--color-border) px-5 py-3.5 text-center text-base font-bold text-(--color-text) transition hover:bg-(--color-surface-soft) cursor-pointer"
            @click="closeMobileMenu"
          >
            <i class="bi bi-house-add mr-2 text-lg"></i>
            {{ t("nav.listProperty") }}
          </RouterLink>

          <div class="grid gap-4 sm:grid-cols-2">
            <RouterLink
              :to="{ name: 'public.loginCustomer' }"
              class="rounded-2xl border border-(--color-border) px-5 py-3.5 text-center text-base font-bold text-(--color-text) transition hover:bg-(--color-surface-soft) cursor-pointer block"
              @click="closeMobileMenu"
            >
              {{ t("nav.login") }}
            </RouterLink>

            <RouterLink
              :to="{ name: 'public.registerCustomer' }"
              class="rounded-2xl bg-(--color-primary) hover:opacity-90 px-5 py-3.5 text-center text-base font-bold text-white !text-white transition shadow-md hover:shadow-lg block active:scale-95 cursor-pointer"
              @click="closeMobileMenu"
            >
              {{ t("nav.register") }}
            </RouterLink>
          </div>
        </div>

        <!-- Integrated Contacts at bottom of Mobile Drawer -->
        <div
          class="border-t border-(--color-border) pt-6 mt-6 text-xs font-medium text-(--color-muted) space-y-2.5"
        >
          <div class="flex items-center gap-3 px-2">
            <i
              class="bi bi-geo-alt-fill text-(--color-primary) text-base"
              aria-hidden="true"
            ></i>
            <span>Phnom Penh, Cambodia</span>
          </div>
          <div class="flex items-center gap-3 px-2">
            <i
              class="bi bi-telephone-fill text-(--color-primary) text-base"
              aria-hidden="true"
            ></i>
            <span>+855 12 345 678</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
