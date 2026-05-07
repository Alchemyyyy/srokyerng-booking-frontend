<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ROLES } from "@/shared/constants/roles";
import BrandLogo from "@/shared/components/BrandLogo.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const navigationItems = [
  { label: "Properties", to: { name: "public.properties" } },
  { label: "About Us", to: { name: "public.about" } },
  { label: "Contact", to: { name: "public.contact" } },
];

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
    "My account"
  );
});

const userInitial = computed(() => userLabel.value.trim().charAt(0).toUpperCase());

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
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink
        :to="{ name: 'public.properties' }"
        class="flex items-center gap-3 text-slate-900 transition hover:text-[#2b7fff]"
      >
        <BrandLogo show-tagline />
      </RouterLink>

      <nav
        class="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-medium transition"
          :class="
            isActiveRoute(item.to.name)
              ? 'bg-white text-[#2b7fff] shadow-sm ring-1 ring-[#2b7fff]/15'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          "
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <template v-if="authStore.isAuthenticated">
          <div class="flex items-center gap-3 rounded-full bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#2b7fff]/10 text-sm font-bold text-[#2b7fff]"
            >
              {{ userInitial }}
            </div>
            <div class="pr-1">
              <p class="max-w-40 truncate text-sm font-semibold text-slate-900">{{ userLabel }}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
                {{ authStore.user?.role || "Member" }}
              </p>
            </div>
          </div>

          <RouterLink
            v-if="dashboardRoute"
            :to="dashboardRoute"
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2b7fff]/30 hover:text-[#2b7fff]"
          >
            Dashboard
          </RouterLink>

          <button
            type="button"
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2b7fff]"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <RouterLink
            :to="{ name: 'public.login' }"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-[#2b7fff]"
          >
            Login
          </RouterLink>

          <RouterLink
            :to="{ name: 'public.register' }"
            class="rounded-full bg-[#2b7fff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2b7fff]/20 transition hover:bg-[#1f70ea]"
          >
            Register
          </RouterLink>
        </template>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#2b7fff]/30 hover:text-[#2b7fff] lg:hidden"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    <div v-if="mobileMenuOpen" class="border-t border-slate-200 bg-white lg:hidden">
      <div class="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <nav class="space-y-2">
          <RouterLink
            v-for="item in navigationItems"
            :key="`${item.label}-mobile`"
            :to="item.to"
            class="block rounded-2xl px-4 py-3 text-sm font-semibold transition"
            :class="
              isActiveRoute(item.to.name)
                ? 'bg-[#2b7fff]/10 text-[#2b7fff]'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            "
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <div class="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
            <p class="mt-2 text-base font-semibold text-slate-900">{{ userLabel }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ authStore.user?.role || "Member" }}</p>
          </div>

          <RouterLink
            v-if="dashboardRoute"
            :to="dashboardRoute"
            class="block rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-[#2b7fff]/30 hover:text-[#2b7fff]"
            @click="closeMobileMenu"
          >
            Open Dashboard
          </RouterLink>

          <button
            type="button"
            class="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2b7fff]"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>

        <div v-else class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            :to="{ name: 'public.login' }"
            class="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-[#2b7fff]/30 hover:text-[#2b7fff]"
            @click="closeMobileMenu"
          >
            Login
          </RouterLink>

          <RouterLink
            :to="{ name: 'public.register' }"
            class="rounded-2xl bg-[#2b7fff] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1f70ea]"
            @click="closeMobileMenu"
          >
            Register
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
