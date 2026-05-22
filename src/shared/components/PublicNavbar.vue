<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ROLES } from "@/shared/constants/roles";
import { onMounted, onUnmounted } from "vue";
import lightModeLogo from "@/assets/images/logos/logo.png";
import darkModeLogo from "@/assets/images/logos/logo2.png";

import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";
import { getStoredTheme, setTheme } from "@/shared/services/themeStorage";
import { setLocale } from "@/app/i18n";
import AppButton from "@/shared/components/AppButton.vue";

const currentTheme = ref(getStoredTheme());
const systemTheme = ref("light");
let systemThemeQuery;
let themeObserver;

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const isScrolled = ref(false);
const { t, locale } = useI18n({ useScope: "global" });

const toggleTheme = () => {
  const next = currentTheme.value === "light" ? "dark" : "light";
  currentTheme.value = next;
  setTheme(next);
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const syncThemeState = () => {
  currentTheme.value = getStoredTheme();
  systemTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const handleSystemThemeChange = (event) => {
  systemTheme.value = event.matches ? "dark" : "light";
};

onMounted(() => {
  syncThemeState();
  handleScroll();

  systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);

  themeObserver = new MutationObserver(syncThemeState);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  systemThemeQuery?.removeEventListener("change", handleSystemThemeChange);
  themeObserver?.disconnect();
});

const navigationItems = computed(() => [
  { label: t("nav.home"), to: { name: "public.home" } },
  { label: t("nav.properties"), to: { name: "public.properties" } },
  { label: t("nav.about"), to: { name: "public.about" } },
  { label: t("nav.contact"), to: { name: "public.contact" } },
]);

const dashboardRoute = computed(() => {
  switch (authStore.user?.role) {
    case ROLES.CUSTOMER:
      return { name: "customer.reservations" };
    case ROLES.OWNER:
      return { name: "owner.dashboard" };
    case ROLES.ADMIN:
      return { name: "admin.dashboard" };
    default:
      return null;
  }
});

const resolvedTheme = computed(() =>
  currentTheme.value === "system" ? systemTheme.value : currentTheme.value,
);

const isNavbarSolid = computed(
  () => isScrolled.value || Boolean(route.meta.navbarSolid),
);

const userLabel = computed(() => {
  return (
    authStore.user?.name ||
    authStore.user?.fullName ||
    authStore.user?.username ||
    authStore.user?.email ||
    t("nav.signedInAs")
  );
});

const userInitial = computed(() =>
  userLabel.value.trim().charAt(0).toUpperCase(),
);

const isActiveRoute = (name) => route.name === name;

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const handleLogout = async () => {
  authStore.logout();
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
      'fixed top-0 z-50 w-full transition-all duration-300',
      isNavbarSolid
        ? 'border-b border-(--color-border) bg-(--color-surface)/90 backdrop-blur-xl py-3'
        : 'bg-transparent border-b border-white/10 py-6',
    ]"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <RouterLink
        :to="{ name: 'public.home' }"
        class="flex shrink-0 items-center gap-2 text-(--color-text) transition hover:text-(--color-primary)"
      >
        <img
          v-if="resolvedTheme === 'dark' || !isNavbarSolid"
          :src="darkModeLogo"
          alt="Srokyerng Booking"
          class="h-10 w-auto object-contain brightness-200"
        />
        <img
          v-else
          :src="lightModeLogo"
          alt="Srokyerng Booking"
          class="h-10 w-auto object-contain"
        />
        <span
          class="font-kantumruy text-xl font-extrabold tracking-wider leading-none self-center"
          :class="
            !isNavbarSolid
              ? 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]'
              : 'text-(--color-text)'
          "
        >
          ស្រុកយើង
        </span>
      </RouterLink>
      <nav
        class="hidden items-center gap-1 rounded-full border p-1 lg:flex mx-4"
        :class="
          isNavbarSolid
            ? 'border-(--color-border) bg-(--color-surface-soft)'
            : '!border-white/20 !bg-white/10 backdrop-blur-md'
        "
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :to="item.to"
          class="rounded-full px-5 py-2 text-sm font-medium transition-all"
          :class="[
            isActiveRoute(item.to.name)
              ? isNavbarSolid
                ? 'bg-(--color-surface) !text-(--color-primary)'
                : '!bg-white/20 !text-white'
              : isNavbarSolid
                ? '!text-(--color-muted) hover:!text-(--color-text)'
                : '!text-white/80 hover:!text-white',
            locale === 'km' ? 'font-kantumruy text-[15px]' : 'font-sans',
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <!-- <ThemeToggle v-if="isScrolled" /> -->
      <div class="hidden shrink-0 items-center gap-3 lg:flex">
        <button
          type="button"
          @click="toggleTheme"
          :class="[
            'h-9 w-9 flex items-center justify-center rounded-full transition',
            !isNavbarSolid
              ? 'text-white hover:bg-white/10'
              : 'text-(--color-muted) hover:bg-(--color-surface-soft)',
          ]"
        >
          <span>
            <!-- Sun icon = light mode -->
            <svg
              v-if="currentTheme === 'light'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
            <!-- Moon icon = dark mode -->
            <svg
              v-else-if="currentTheme === 'dark'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
            <!-- Monitor icon = system mode -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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

        <div
          v-if="!isNavbarSolid"
          class="inline-flex rounded-full border-white/20 bg-white/10 backdrop-blur-md p-1"
        >
          <button
            v-for="option in [
              { value: 'en', label: 'EN' },
              { value: 'km', label: 'ខ្មែរ' },
            ]"
            :key="option.value"
            type="button"
            :class="[
              'rounded-full px-3 py-1.5 text-sm font-semibold transition',
              locale === option.value
                ? 'bg-(--color-primary) text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            ]"
            @click="setLocale(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <template v-if="authStore.isAuthenticated">
          <div
            class="flex items-center gap-3 rounded-full bg-(--color-surface-soft) px-3 py-2 ring-1 ring-(--color-border)"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary-soft) text-sm font-bold text-(--color-primary)"
            >
              {{ userInitial }}
            </div>
            <div class="pr-1">
              <p
                class="max-w-40 truncate text-sm font-semibold text-(--color-text)"
              >
                {{ userLabel }}
              </p>
              <p
                class="text-xs uppercase tracking-[0.2em] text-(--color-muted)"
              >
                {{ authStore.user?.role || "Member" }}
              </p>
            </div>
          </div>

          <RouterLink
            v-if="dashboardRoute"
            :to="dashboardRoute"
            class="rounded-full border border-(--color-border) px-4 py-2 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            {{ t("nav.dashboard") }}
          </RouterLink>

          <button
            type="button"
            class="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="handleLogout"
          >
            {{ t("nav.logout") }}
          </button>
        </template>

        <template v-else>
          <!-- Login - also has same conflict, fix it -->
          <RouterLink :to="{ name: 'public.login' }">
            <AppButton
              variant="ghost"
              size="sm"
              :class="
                !isNavbarSolid
                  ? '!text-white hover:!bg-white/10 !rounded-full'
                  : '!rounded-full'
              "
            >
              {{ t("nav.login") }}
            </AppButton>
          </RouterLink>

          <!-- Register - remove text-white from static class -->
          <RouterLink :to="{ name: 'public.register' }">
            <AppButton
              variant="primary"
              size="sm"
              :class="[
                '!rounded-full',
                !isNavbarSolid
                  ? 'bg-white/20 !text-white !border-white/20 hover:bg-white/30 hover:border-white/30'
                  : '',
              ]"
            >
              {{ t("nav.register") }}
            </AppButton>
          </RouterLink>
        </template>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary) lg:hidden"
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

    <div
      v-if="mobileMenuOpen"
      class="border-t border-(--color-border) bg-(--color-surface) lg:hidden"
    >
      <div class="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <div class="flex flex-wrap gap-2">
          <ThemeToggle v-if="isNavbarSolid" />
          <LanguageToggle />
        </div>

        <nav class="space-y-2">
          <RouterLink
            v-for="item in navigationItems"
            :key="`${item.label}-mobile`"
            :to="item.to"
            class="block rounded-2xl px-4 py-3 text-sm font-semibold transition"
            :class="
              isActiveRoute(item.to.name)
                ? 'bg-(--color-primary-soft) text-(--color-primary)'
                : 'bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text)'
            "
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <div
            class="rounded-3xl bg-(--color-surface-soft) p-4 ring-1 ring-(--color-border)"
          >
            <p class="text-xs uppercase tracking-[0.2em] text-(--color-muted)">
              {{ t("nav.signedInAs") }}
            </p>
            <p class="mt-2 text-base font-semibold text-(--color-text)">
              {{ userLabel }}
            </p>
            <p class="mt-1 text-sm text-(--color-muted)">
              {{ authStore.user?.role || "Member" }}
            </p>
          </div>

          <RouterLink
            v-if="dashboardRoute"
            :to="dashboardRoute"
            class="block rounded-2xl border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
            @click="closeMobileMenu"
          >
            {{ t("nav.dashboard") }}
          </RouterLink>

          <button
            type="button"
            class="block w-full rounded-2xl bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <div v-else class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            :to="{ name: 'public.login' }"
            class="rounded-2xl border border-(--color-border) px-4 py-3 text-center text-sm font-semibold text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
            @click="closeMobileMenu"
          >
            Login
          </RouterLink>

          <RouterLink
            :to="{ name: 'public.register' }"
            class="rounded-2xl bg-(--color-primary) px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-(--color-primary-strong)"
            @click="closeMobileMenu"
          >
            Register
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
