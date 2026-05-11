<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ROLES } from "@/shared/constants/roles";
import logoUrl from "@/assets/images/logos/logo.png";
{
  /* <BrandLogo show-tagline />; */
}
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const { t, locale } = useI18n({ useScope: "global" });

const navigationItems = computed(() => [
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
  await router.push({ name: "public.properties" });
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
    class="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-surface)/90 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <RouterLink
        :to="{ name: 'public.properties' }"
        class="flex items-center gap-3 text-(--color-text) transition hover:text-(--color-primary)"
      >
        <img
          :src="logoUrl"
          alt="Srokyerng Booking"
          class="h-14 w-auto object-contain dark:brightness-200"
        />
        <span class="text-xl font-bold tracking-wide">ស្រុកយើង</span>
      </RouterLink>

      <nav
        class="hidden items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface-soft) p-1 lg:flex"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-medium transition"
          :class="
            isActiveRoute(item.to.name)
              ? 'bg-(--color-surface) text-(--color-primary) shadow-sm ring-1 ring-(--color-focus-ring)'
              : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-text)'
          "
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <ThemeToggle />
        <LanguageToggle />

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
          <RouterLink
            :to="{ name: 'public.login' }"
            class="rounded-full px-4 py-2 text-sm font-semibold text-(--color-muted) transition hover:text-(--color-primary)"
          >
            {{ t("nav.login") }}
          </RouterLink>

          <RouterLink
            :to="{ name: 'public.register' }"
            class="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-(--color-primary-strong)"
          >
            {{ t("nav.register") }}
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
          <ThemeToggle />
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
