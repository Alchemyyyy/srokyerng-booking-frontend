<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UserIcon,
  EyeIcon,
  GlobeAltIcon,
} from "@heroicons/vue/24/outline";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const authStore = useAuthStore();
const { isSidebarOpen } = useSidebar();

const user = computed(() => authStore.user);
const userLabel = computed(() => user.value?.full_name || user.value?.email || "Guest");
const userEmail = computed(() => user.value?.email || "");
const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans transition-all duration-300"
    :class="isDashboardRole ? (isSidebarOpen ? 'ml-64' : 'ml-20') : ''"
  >
    <PublicNavbar v-if="!isDashboardRole" />

    <main
      class="flex-1 min-h-screen pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col"
      :class="isDashboardRole ? 'pt-25' : 'pt-32'"
    >
      <!-- Title Header -->
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
          Account
        </h1>
        <div class="text-sm font-semibold text-(--color-muted) mt-2 flex flex-wrap items-center gap-1.5">
          <span>{{ userLabel }}</span>
          <span v-if="userEmail">•</span>
          <span v-if="userEmail" class="font-normal">{{ userEmail }}</span>
          <span>•</span>
          <RouterLink
            :to="{ name: `${rolePrefix}.profile` }"
            class="text-(--color-primary) hover:underline font-bold"
          >
            Go to profile
          </RouterLink>
        </div>
      </div>

      <!-- Settings Grid (Airbnb Style) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        
        <!-- Personal Info Card -->
        <RouterLink
          :to="{ name: `${rolePrefix}.personal-info` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group"
        >
          <div>
            <UserIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Personal info
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Provide personal details and how we can reach you.
            </p>
          </div>
        </RouterLink>

        <!-- Login & Security Card -->
        <RouterLink
          :to="{ name: `${rolePrefix}.login-security` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group"
        >
          <div>
            <ShieldCheckIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Login & security
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Update your password and secure your account.
            </p>
          </div>
        </RouterLink>

        <!-- Payments & Payouts Card -->
        <RouterLink
          :to="{ name: `${rolePrefix}.payments-payouts` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group block"
        >
          <div>
            <CreditCardIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Payments & payouts
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Review payments, payouts, coupons, and billing info.
            </p>
          </div>
        </RouterLink>

        <!-- Notifications Card -->
        <RouterLink
          :to="{ name: `${rolePrefix}.notification-settings` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group"
        >
          <div>
            <BellIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Notifications
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Choose notification preferences and how you want to be contacted.
            </p>
          </div>
        </RouterLink>

        <!-- Privacy & Sharing Card -->
        <RouterLink
          :to="{ name: `${rolePrefix}.privacy-sharing` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group block"
        >
          <div>
            <EyeIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Privacy & sharing
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Manage your personal data, sharing settings, and connected portals.
            </p>
          </div>
        </RouterLink>

        <!-- Global Preferences Card (Interactive) -->
        <RouterLink
          :to="{ name: `${rolePrefix}.global-preferences` }"
          class="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[165px] cursor-pointer group block"
        >
          <div>
            <GlobeAltIcon class="h-8 w-8 text-(--color-text) mb-4 group-hover:text-(--color-primary) transition-colors" />
            <h2 class="font-bold text-base text-(--color-text) group-hover:text-(--color-primary) transition-colors">
              Global preferences
            </h2>
            <p class="text-xs text-(--color-muted) mt-1.5 leading-normal font-normal">
              Set your default language, currency, and time zone.
            </p>
          </div>
        </RouterLink>

        <!-- Travel for Work Card -->

      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
