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

const navigationItems = computed(() => [
  { label: t("nav.home"), to: { name: "public.home" }, icon: "bi-house" },
  { label: t("nav.properties"), to: { name: "public.properties" }, icon: "bi-houses" },
  { label: t("nav.about"), to: { name: "public.about" }, icon: "bi-info-circle" },
  { label: t("nav.contact"), to: { name: "public.contact" }, icon: "bi-envelope" },
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
    :class="[
      'fixed top-0 left-0 z-50 w-full pointer-events-auto transition-all duration-300 ease-in-out border-b',
      isNavbarSolid
        ? 'border-(--color-border) bg-(--color-surface)/95 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
        : 'border-b border-white/10 bg-(--color-surface)/80 backdrop-blur-xl py-4',
    ]"
  >
    <!-- Inner Centered Wrapper -->
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <!-- Left Brand & Contacts -->
      <div class="flex shrink-0 items-center gap-3">
        <RouterLink
          :to="{ name: 'public.home' }"
          class="flex shrink-0 items-center gap-2 text-(--color-text) transition hover:text-(--color-primary)"
        >
          <img
            v-if="resolvedTheme === 'dark'"
            :src="darkModeLogo"
            alt="Srokyerng Booking"
            class="h-11 w-auto object-contain brightness-200"
          />
          <img
            v-else
            :src="lightModeLogo"
            alt="Srokyerng Booking"
            class="h-11 w-auto object-contain"
          />
          <span
            class="font-kantumruy text-xl font-extrabold tracking-wider leading-none self-center text-(--color-text)"
          >
            ស្រុកយើង
          </span>
        </RouterLink>

        <!-- Sleek Integrated Contacts Pill Badge -->
        <div
          class="hidden 2xl:flex shrink-0 items-center gap-2.5 px-3 py-1 rounded-sm border border-(--color-border)/20 bg-(--color-surface-soft)/40 text-xs text-(--color-muted) transition-all duration-300"
        >
          <span class="flex items-center gap-1.5">
            <i class="bi bi-geo-alt-fill text-(--color-primary)" aria-hidden="true"></i>
            <span>Phnom Penh</span>
          </span>
          <span class="h-2 w-2 rounded-full bg-(--color-border)/50"></span>
          <span class="flex items-center gap-1.5">
            <i class="bi bi-telephone-fill text-(--color-primary)" aria-hidden="true"></i>
            <span>+855 12 345 678</span>
          </span>
        </div>
      </div>

      <!-- Middle Navigation Links (Combined Search + Nav capsule dock) -->
      <nav
        class="mx-2 hidden shrink-0 items-center gap-1 rounded-md border border-(--color-border)/50 bg-(--color-surface-soft)/90 p-1 lg:flex shadow-sm backdrop-blur-md"
      >
        <!-- Quick Search Pill inside capsule -->
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="flex items-center gap-2 bg-(--color-surface) border border-(--color-border)/30 px-3 h-8 rounded-sm text-xs font-semibold text-(--color-muted) hover:text-(--color-primary) hover:border-(--color-primary)/50 shadow-sm transition-all duration-200"
          :class="[locale === 'km' ? 'font-kantumruy' : 'font-sans']"
        >
          <i class="bi bi-search text-(--color-primary)"></i>
          <span>{{ t("nav.searchPlaceholder") }}</span>
        </RouterLink>

        <div class="h-4 w-px bg-(--color-border)/30 mx-1"></div>

        <!-- Main Nav Links inside capsule (filtering duplicate Properties) -->
        <RouterLink
          v-for="item in navigationItems.filter(i => i.to.name !== 'public.properties')"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-1.5 rounded-sm px-3.5 h-8 text-sm font-semibold leading-none whitespace-nowrap transition-all border"
          :class="[
            isActiveRoute(item.to.name)
              ? 'bg-(--color-surface) !text-(--color-primary) border-(--color-border)/30 shadow-sm'
              : 'bg-transparent border-transparent !text-(--color-muted) hover:!text-(--color-text)',
            locale === 'km' ? 'font-kantumruy text-sm' : 'font-sans',
            (item.to.name === 'public.about' || item.to.name === 'public.contact') ? 'hidden xl:flex' : 'flex'
          ]"
        >
          <i class="bi" :class="item.icon" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Right Side Toggles & Action buttons -->
      <div class="hidden shrink-0 items-center gap-1.5 xl:gap-2.5 lg:flex">
        <!-- Inline Utilities -->
        <button
          type="button"
          @click="toggleTheme"
          class="h-8 w-8 flex items-center justify-center rounded-sm text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text) transition border border-(--color-border)/20"
          aria-label="Toggle theme"
        >
          <span>
            <svg
              v-if="currentTheme === 'light'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.02 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z"
              />
            </svg>
            <svg
              v-else-if="currentTheme === 'dark'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
        </button>
        <LanguageToggle />

        <div class="h-4 w-px bg-(--color-border)/30 mx-0.5"></div>

        <!-- Customer Quick-Access Shortcuts -->
        <template v-if="authStore.isAuthenticated && authStore.user?.role === 'customer'">
          <RouterLink
            :to="{ name: 'customer.wishlist' }"
            class="h-8 w-8 flex items-center justify-center rounded-sm text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-red-500 hover:border-red-500/20 border border-transparent transition"
            title="Wishlist"
          >
            <i class="bi bi-heart text-base"></i>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.chats' }"
            class="h-8 w-8 flex items-center justify-center rounded-sm text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-primary) hover:border-(--color-primary)/20 border border-transparent transition"
            title="Messages"
          >
            <i class="bi bi-chat-dots text-base"></i>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.booking-history' }"
            class="h-8 w-8 flex items-center justify-center rounded-sm text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-primary) hover:border-(--color-primary)/20 border border-transparent transition"
            title="My Bookings"
          >
            <i class="bi bi-ticket-detailed text-base"></i>
          </RouterLink>
          <div class="h-4 w-px bg-(--color-border)/30 mx-0.5"></div>
        </template>

        <!-- CTAs / Session Actions -->
        <template v-if="authStore.isAuthenticated">
          <NotificationBell :solid="true" />
          <NavbarAccountMenu :solid="true" />
        </template>

        <template v-else>
          <!-- Highlighted Become a Partner CTA -->
          <RouterLink :to="{ name: 'public.listProperty' }">
            <AppButton
              variant="ghost"
              size="sm"
              class="!rounded-sm border border-(--color-primary)/30 text-(--color-primary) hover:bg-(--color-primary-soft)"
            >
              <i class="bi bi-house-add mr-1"></i>
              {{ t("nav.listProperty") }}
            </AppButton>
          </RouterLink>

          <RouterLink :to="{ name: 'public.loginCustomer' }">
            <AppButton
              variant="ghost"
              size="sm"
              class="!rounded-sm"
            >
              {{ t("nav.login") }}
            </AppButton>
          </RouterLink>

          <RouterLink :to="{ name: 'public.registerCustomer' }">
            <AppButton
              variant="primary"
              size="sm"
              class="!rounded-sm shadow-sm"
            >
              {{ t("nav.register") }}
            </AppButton>
          </RouterLink>
        </template>
      </div>

      <!-- Mobile Menu Trigger -->
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) lg:hidden pointer-events-auto"
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

    <!-- Mobile Drawer Menu (Positions absolutely flush below the header boundary) -->
    <div
      v-if="mobileMenuOpen"
      class="absolute top-full left-0 w-full border-b border-(--color-border)/30 bg-(--color-surface)/95 backdrop-blur-xl lg:hidden p-4 sm:p-6 shadow-xl pointer-events-auto transition-all duration-300"
    >
      <div class="space-y-5">
        <!-- Settings & Toggles -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <div class="h-4 w-px bg-(--color-border)/30"></div>
            <LanguageToggle />
          </div>
          
          <!-- Mobile Quick Search Shortcut -->
          <RouterLink
            :to="{ name: 'public.properties' }"
            @click="closeMobileMenu"
            class="flex items-center gap-2 bg-(--color-surface-soft) border border-(--color-border)/50 px-3 py-1.5 rounded-sm text-xs font-semibold text-(--color-primary)"
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
            class="flex items-center gap-2.5 rounded-sm px-4 py-3 text-sm font-semibold transition"
            :class="
              isActiveRoute(item.to.name)
                ? 'bg-(--color-primary-soft) text-(--color-primary)'
                : 'bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text)'
            "
            @click="closeMobileMenu"
          >
            <i class="bi text-base" :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Customer Mobile Shortcuts -->
        <div v-if="authStore.isAuthenticated && authStore.user?.role === 'customer'" class="grid grid-cols-3 gap-2 border-t border-(--color-border)/30 pt-3">
          <RouterLink
            :to="{ name: 'customer.wishlist' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1 py-2 rounded-sm bg-(--color-surface-soft) text-(--color-muted) hover:text-red-500 transition text-xs"
          >
            <i class="bi bi-heart text-lg"></i>
            <span>Wishlist</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.chats' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1 py-2 rounded-sm bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-primary) transition text-xs"
          >
            <i class="bi bi-chat-dots text-lg"></i>
            <span>Messages</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'customer.booking-history' }"
            @click="closeMobileMenu"
            class="flex flex-col items-center gap-1 py-2 rounded-sm bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-primary) transition text-xs"
          >
            <i class="bi bi-ticket-detailed text-lg"></i>
            <span>Bookings</span>
          </RouterLink>
        </div>

        <!-- User Options / CTAs -->
        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <NotificationBell />

            <RouterLink
              v-if="dashboardRoute"
              :to="dashboardRoute"
              class="flex-1 rounded-sm border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
              @click="closeMobileMenu"
            >
              {{ t("nav.dashboard") }}
            </RouterLink>
          </div>

          <div
            class="flex items-center gap-3 rounded-lg bg-(--color-surface-soft) p-4 ring-1 ring-(--color-border)"
          >
            <UserAvatar
              :name="userLabel"
              :src="authStore.user?.profile_image_url"
              size-class="h-12 w-12 text-sm"
            />
            <div class="min-w-0">
              <p
                class="text-xs uppercase tracking-[0.2em] text-(--color-muted)"
              >
                {{ t("nav.signedInAs") }}
              </p>
              <p
                class="mt-2 truncate text-base font-semibold text-(--color-text)"
              >
                {{ userLabel }}
              </p>
              <p class="mt-1 text-sm text-(--color-muted)">
                {{ authStore.user?.role || "Member" }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="block w-full rounded-sm bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <div v-else class="space-y-3">
          <RouterLink
            :to="{ name: 'public.listProperty' }"
            class="block rounded-sm border border-(--color-primary) px-4 py-3 text-center text-sm font-semibold text-(--color-primary) transition hover:bg-(--color-primary-soft)"
            @click="closeMobileMenu"
          >
            <i class="bi bi-house-add mr-1"></i>
            {{ t("nav.listProperty") }}
          </RouterLink>

          <div class="grid gap-3 sm:grid-cols-2">
            <RouterLink
              :to="{ name: 'public.loginCustomer' }"
              class="rounded-sm border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
              @click="closeMobileMenu"
            >
              {{ t("nav.login") }}
            </RouterLink>

            <RouterLink
              :to="{ name: 'public.registerCustomer' }"
              class="rounded-sm bg-(--color-primary) px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
              @click="closeMobileMenu"
            >
              {{ t("nav.register") }}
            </RouterLink>
          </div>
        </div>

        <!-- Integrated Contacts at bottom of Mobile Drawer -->
        <div class="border-t border-(--color-border)/30 pt-4 mt-4 text-xs text-(--color-muted) space-y-2">
          <div class="flex items-center gap-2 px-2">
            <i class="bi bi-geo-alt-fill text-(--color-primary)" aria-hidden="true"></i>
            <span>Phnom Penh, Cambodia</span>
          </div>
          <div class="flex items-center gap-2 px-2">
            <i class="bi bi-telephone-fill text-(--color-primary)" aria-hidden="true"></i>
            <span>+855 12 345 678</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
