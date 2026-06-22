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

const isOwner = computed(() => authStore.user?.role === "owner" || authStore.user?.role === "admin");
const isCustomer = computed(() => authStore.user?.role === "customer");

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

const handleSwitchToHost = async () => {
  await authStore.logout();
  closeMobileMenu();
  await router.push({ name: "public.registerOwner" });
};

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
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
      <!-- Left Brand & Badge -->
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
          <span
            class="px-2 py-0.5 text-[10px] font-bold uppercase border border-(--color-primary)/30 text-(--color-primary) rounded-md bg-(--color-primary-soft) tracking-wider font-sans self-center whitespace-nowrap"
          >
            {{ t("ownerLanding.nav.partner") }}
          </span>
        </RouterLink>
      </div>

      <!-- Middle Navigation Links (Scroll anchors) -->
      <nav
        class="hidden shrink-0 items-center gap-1 rounded-md border border-(--color-border)/50 bg-(--color-surface-soft)/90 p-1 lg:flex shadow-sm backdrop-blur-md"
      >
        <button
          type="button"
          @click="scrollToSection('benefits')"
          class="flex items-center gap-1.5 rounded-sm px-3.5 h-8 text-sm font-semibold leading-none whitespace-nowrap transition-all border border-transparent !text-(--color-muted) hover:!text-(--color-primary) hover:bg-(--color-surface) hover:border-(--color-border)/30 hover:shadow-sm"
          :class="[locale === 'km' ? 'font-kantumruy text-sm' : 'font-sans']"
        >
          <i class="bi bi-info-circle mr-0.5"></i>
          <span>{{ t("ownerLanding.nav.whyHost") }}</span>
        </button>

        <button
          type="button"
          @click="scrollToSection('steps')"
          class="flex items-center gap-1.5 rounded-sm px-3.5 h-8 text-sm font-semibold leading-none whitespace-nowrap transition-all border border-transparent !text-(--color-muted) hover:!text-(--color-primary) hover:bg-(--color-surface) hover:border-(--color-border)/30 hover:shadow-sm"
          :class="[locale === 'km' ? 'font-kantumruy text-sm' : 'font-sans']"
        >
          <i class="bi bi-activity mr-0.5"></i>
          <span>{{ t("ownerLanding.nav.howItWorks") }}</span>
        </button>

        <button
          type="button"
          @click="scrollToSection('faqs')"
          class="flex items-center gap-1.5 rounded-sm px-3.5 h-8 text-sm font-semibold leading-none whitespace-nowrap transition-all border border-transparent !text-(--color-muted) hover:!text-(--color-primary) hover:bg-(--color-surface) hover:border-(--color-border)/30 hover:shadow-sm"
          :class="[locale === 'km' ? 'font-kantumruy text-sm' : 'font-sans']"
        >
          <i class="bi bi-question-circle mr-0.5"></i>
          <span>{{ t("ownerLanding.nav.faqs") }}</span>
        </button>
      </nav>

      <!-- Right Side Toggles & Action buttons -->
      <div class="hidden shrink-0 items-center gap-1.5 xl:gap-2.5 lg:flex">
        <!-- Inline Utilities -->
        <button
          type="button"
          @click="toggleTheme"
          class="h-8 w-8 flex items-center justify-center rounded-md text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text) transition border border-(--color-border)/20"
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

        <!-- Session Actions -->
        <template v-if="authStore.isAuthenticated">
          <!-- If logged in as customer, show Switch to Host -->
          <template v-if="isCustomer">
            <AppButton
              variant="ghost"
              size="sm"
              class="!rounded-sm border border-(--color-primary)/30 text-(--color-primary) hover:bg-(--color-primary-soft)"
              @click="handleSwitchToHost"
            >
              <i class="bi bi-arrow-left-right mr-1"></i>
              {{ t("ownerLanding.nav.switchToHost") }}
            </AppButton>
            <div class="h-4 w-px bg-(--color-border)/30 mx-0.5"></div>
            <NavbarAccountMenu :solid="true" />
          </template>

          <!-- If logged in as owner/admin, show Go to Dashboard -->
          <template v-else-if="isOwner">
            <RouterLink v-if="dashboardRoute" :to="dashboardRoute">
              <AppButton
                variant="primary"
                size="sm"
                class="!rounded-sm shadow-sm"
              >
                {{ t("ownerLanding.nav.dashboard") }}
              </AppButton>
            </RouterLink>
            <NotificationBell :solid="true" />
            <NavbarAccountMenu :solid="true" />
          </template>
        </template>

        <template v-else>
          <!-- Logged out partner sign in / register -->
          <RouterLink :to="{ name: 'public.loginOwner' }">
            <AppButton
              variant="ghost"
              size="sm"
              class="!rounded-sm"
            >
              {{ t("ownerLanding.secondaryCta") }}
            </AppButton>
          </RouterLink>

          <RouterLink :to="{ name: 'public.registerOwner' }">
            <AppButton
              variant="primary"
              size="sm"
              class="!rounded-sm shadow-sm"
            >
              {{ t("ownerLanding.primaryCta") }}
            </AppButton>
          </RouterLink>
        </template>
      </div>

      <!-- Mobile Menu Trigger -->
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) lg:hidden pointer-events-auto"
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
        </div>

        <!-- Links -->
        <nav class="space-y-2">
          <button
            type="button"
            @click="scrollToSection('benefits'); closeMobileMenu()"
            class="flex w-full items-center gap-2.5 rounded-md px-4 py-3 text-sm font-semibold transition bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text)"
          >
            <i class="bi bi-info-circle text-base"></i>
            <span>{{ t("ownerLanding.nav.whyHost") }}</span>
          </button>

          <button
            type="button"
            @click="scrollToSection('steps'); closeMobileMenu()"
            class="flex w-full items-center gap-2.5 rounded-md px-4 py-3 text-sm font-semibold transition bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text)"
          >
            <i class="bi bi-activity text-base"></i>
            <span>{{ t("ownerLanding.nav.howItWorks") }}</span>
          </button>

          <button
            type="button"
            @click="scrollToSection('faqs'); closeMobileMenu()"
            class="flex w-full items-center gap-2.5 rounded-md px-4 py-3 text-sm font-semibold transition bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text)"
          >
            <i class="bi bi-question-circle text-base"></i>
            <span>{{ t("ownerLanding.nav.faqs") }}</span>
          </button>
        </nav>

        <!-- User Options / CTAs -->
        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <template v-if="isCustomer">
              <button
                type="button"
                class="block w-full rounded-md border border-(--color-primary) px-4 py-3 text-center text-sm font-semibold text-(--color-primary) transition hover:bg-(--color-primary-soft)"
                @click="handleSwitchToHost"
              >
                <i class="bi bi-arrow-left-right mr-1"></i>
                {{ t("ownerLanding.nav.switchToHost") }}
              </button>
            </template>
            <template v-else-if="isOwner">
              <NotificationBell />
              <RouterLink
                v-if="dashboardRoute"
                :to="dashboardRoute"
                class="flex-1 rounded-md border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
                @click="closeMobileMenu"
              >
                {{ t("ownerLanding.nav.dashboard") }}
              </RouterLink>
            </template>
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
            class="block w-full rounded-md bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <div v-else class="space-y-3">
          <RouterLink
            :to="{ name: 'public.loginOwner' }"
            class="block rounded-md border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
            @click="closeMobileMenu"
          >
            {{ t("ownerLanding.secondaryCta") }}
          </RouterLink>

          <RouterLink
            :to="{ name: 'public.registerOwner' }"
            class="block rounded-md bg-(--color-primary) px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="closeMobileMenu"
          >
            {{ t("ownerLanding.primaryCta") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
