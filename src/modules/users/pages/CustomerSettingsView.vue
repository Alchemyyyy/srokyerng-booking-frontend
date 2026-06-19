<script setup>
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
} from "@heroicons/vue/24/outline";

import AppButton from "@/shared/components/AppButton.vue";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const router = useRouter();

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
];
</script>

<template>
  <main class="min-h-screen bg-(--color-page) px-4 pb-16 pt-28 text-(--color-text) sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6">
        <AppButton variant="secondary" size="sm" class="!rounded-full" @click="goBack">
          <ArrowLeftIcon class="h-4 w-4" />
          Back
        </AppButton>
      </div>

      <section class="rounded-[var(--radius-panel)] border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card) sm:p-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-(--color-primary)">
              Customer settings
            </p>
            <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Manage your booking preferences
            </h1>
            <p class="mt-3 text-base leading-7 text-(--color-muted)">
              Keep the controls that affect your customer account in one place. Profile edits and password changes still live on your profile page.
            </p>
          </div>

          <RouterLink :to="{ name: 'customer.profile' }">
            <AppButton variant="primary" size="md" class="!rounded-full">
              Edit profile
              <ChevronRightIcon class="h-4 w-4" />
            </AppButton>
          </RouterLink>
        </div>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div class="rounded-[var(--radius-panel)] border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
          <div class="flex items-start gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
              <LockClosedIcon class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-xl font-bold">Preferences</h2>
              <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                These settings apply immediately on this browser.
              </p>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <article
              v-for="card in preferenceCards"
              :key="card.title"
              class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-4"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-start gap-3">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-(--color-surface) text-(--color-primary)">
                    <component :is="card.icon" class="h-5 w-5" />
                  </span>
                  <div>
                    <h3 class="font-bold">{{ card.title }}</h3>
                    <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                      {{ card.description }}
                    </p>
                  </div>
                </div>

                <ThemeToggle v-if="card.control === 'theme'" />
                <LanguageToggle v-else />
              </div>
            </article>
          </div>
        </div>

        <div class="space-y-4">
          <article
            v-for="section in settingSections"
            :key="section.title"
            class="rounded-[var(--radius-panel)] border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
          >
            <div class="flex items-start gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
                <component :is="section.icon" class="h-5 w-5" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-bold">{{ section.title }}</h3>
                  <span class="rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-bold text-(--color-primary)">
                    {{ section.badge }}
                  </span>
                </div>
                <p class="mt-2 text-sm leading-6 text-(--color-muted)">
                  {{ section.description }}
                </p>

                <RouterLink
                  v-if="section.to"
                  :to="section.to"
                  class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-(--color-primary) hover:text-(--color-primary-strong)"
                >
                  Open profile security
                  <ChevronRightIcon class="h-4 w-4" />
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
