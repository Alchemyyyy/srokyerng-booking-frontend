<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  LanguageIcon,
  LockClosedIcon,
  MoonIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BriefcaseIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

import AppButton from "@/shared/components/AppButton.vue";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";
import { useAuthStore } from "@/modules/auth/store/authStore";

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const userLabel = computed(() => user.value?.full_name || user.value?.email || "Guest");
const userEmail = computed(() => user.value?.email || "");

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push({ name: "public.home" });
};

const preferenceCards = [
  {
    icon: MoonIcon,
    title: "Appearance",
    description: "Choose the theme that feels best when browsing stays.",
    control: "theme",
  },
  {
    icon: LanguageIcon,
    title: "Language",
    description: "Switch between English and Khmer across the booking experience.",
    control: "language",
  },
];

const settingSections = [
  {
    icon: BellIcon,
    title: "Notifications",
    description: "Booking updates, account security, and important reminders will appear in your notification center.",
    badge: "In-app ready",
  },
  {
    icon: CalendarDaysIcon,
    title: "Reservation cancellation",
    description: "Cancellation is handled from each reservation. Review the property policy before cancelling a booking.",
    badge: "Per booking",
  },
  {
    icon: ShieldCheckIcon,
    title: "Account security",
    description: "Change your password and review active sessions from your profile security section.",
    badge: "Profile",
    to: { name: "customer.profile", hash: "#security" },
  },
  {
    icon: CreditCardIcon,
    title: "Payments & payouts",
    description: "Review payments, payouts, coupons, gift cards, and breakdown of taxes.",
    badge: "Secured",
    mockup: true,
  },
  {
    icon: BriefcaseIcon,
    title: "Travel work",
    description: "Manage company travel benefits, corporate billing, and business itineraries.",
    badge: "Enterprise",
    mockup: true,
  },
];
</script>

<template>
  <main class="min-h-screen bg-(--color-page) px-4 pb-20 pt-28 text-(--color-text) sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8">
        <AppButton variant="secondary" size="sm" class="!rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all duration-200" @click="goBack">
          <ArrowLeftIcon class="h-4 w-4" />
          Back
        </AppButton>
      </div>

      <!-- Airbnb Account Header -->
      <section class="rounded-3xl border border-(--color-border)/80 bg-(--color-surface)/95 p-8 shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl mb-12 transition-all duration-300">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-(--color-primary)">
              Account Overview
            </p>
            <h1 class="mt-2 text-4xl font-black tracking-tight sm:text-5xl text-(--color-text)">
              {{ userLabel }}
            </h1>
            <p class="mt-2 text-base font-bold text-(--color-muted) flex items-center gap-2">
              <span v-if="userEmail">{{ userEmail }}</span>
              <span v-if="userEmail">·</span>
              <RouterLink :to="{ name: 'customer.profile' }" class="text-(--color-primary) hover:underline font-extrabold">
                Go to profile
              </RouterLink>
            </p>
            <p class="mt-4 text-base leading-relaxed text-(--color-muted) font-medium">
              Manage your personal booking preferences, security controls, and enterprise travel features in one unified portal.
            </p>
          </div>

          <RouterLink :to="{ name: 'customer.profile' }">
            <AppButton variant="primary" size="lg" class="!rounded-2xl shadow-lg shadow-(--color-primary)/30 hover:shadow-xl hover:shadow-(--color-primary)/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-black py-4 px-8 flex items-center gap-2">
              <UserIcon class="h-5 w-5" />
              <span>Edit profile</span>
              <ChevronRightIcon class="h-4 w-4" />
            </AppButton>
          </RouterLink>
        </div>
      </section>

      <!-- Bento Feature Grid -->
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Global Preferences Bento Box -->
        <div class="rounded-3xl border border-(--color-border)/80 bg-(--color-surface)/95 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-(--color-primary)/40">
          <div>
            <div class="flex items-start gap-4">
              <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shadow-inner">
                <LockClosedIcon class="h-7 w-7" />
              </span>
              <div>
                <h2 class="text-2xl font-black tracking-tight">Global Preferences</h2>
                <p class="mt-1 text-sm leading-6 text-(--color-muted) font-medium">
                  These settings apply immediately on this browser experience.
                </p>
              </div>
            </div>

            <div class="mt-8 space-y-6">
              <article
                v-for="card in preferenceCards"
                :key="card.title"
                class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/60 p-6 shadow-inner transition-all duration-200 hover:bg-(--color-surface-soft)"
              >
                <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-start gap-4">
                    <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-surface) text-(--color-primary) shadow-xs border border-(--color-border)">
                      <component :is="card.icon" class="h-6 w-6" />
                    </span>
                    <div>
                      <h3 class="text-lg font-black text-(--color-text)">{{ card.title }}</h3>
                      <p class="mt-1 text-xs leading-relaxed text-(--color-muted) font-medium">
                        {{ card.description }}
                      </p>
                    </div>
                  </div>

                  <div class="shrink-0">
                    <ThemeToggle v-if="card.control === 'theme'" />
                    <LanguageToggle v-else />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Account Sections Bento Grid -->
        <div class="space-y-6">
          <article
            v-for="section in settingSections"
            :key="section.title"
            class="rounded-3xl border border-(--color-border)/80 bg-(--color-surface)/95 p-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-(--color-primary)/40 group cursor-pointer"
          >
            <div class="flex items-start gap-5">
              <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shadow-inner group-hover:scale-110 group-hover:bg-(--color-primary) group-hover:text-white transition-all duration-300">
                <component :is="section.icon" class="h-7 w-7 transition-colors" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2.5">
                  <h3 class="text-xl font-black text-(--color-text) group-hover:text-(--color-primary) transition-colors">{{ section.title }}</h3>
                  <span class="rounded-full bg-(--color-primary-soft) px-3 py-1 text-[10px] font-black tracking-widest uppercase text-(--color-primary) border border-(--color-primary)/20 shadow-xs">
                    {{ section.badge }}
                  </span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-(--color-muted) font-medium">
                  {{ section.description }}
                </p>

                <RouterLink
                  v-if="section.to"
                  :to="section.to"
                  class="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-(--color-primary) hover:underline group-hover:translate-x-1 transition-all duration-200"
                >
                  <span>Open profile security</span>
                  <ChevronRightIcon class="h-4 w-4" />
                </RouterLink>
                <div
                  v-else-if="section.mockup"
                  class="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-(--color-muted) group-hover:text-(--color-primary) transition-colors"
                >
                  <span>Manage configuration</span>
                  <ChevronRightIcon class="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </main>
</template>
