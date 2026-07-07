<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ChevronRightIcon,
  InformationCircleIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const { t } = useI18n({ useScope: "global" });

const authStore = useAuthStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

const saving = ref(false);
const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));

// Reactive state for user notification preferences (mock default values)
const preferences = reactive({
  offers_email: true,
  offers_push: false,
  security_email: true,
  security_push: true,
  booking_email: true,
  booking_push: true,
  messages_email: true,
  messages_push: true,
});

const loadPreferences = () => {
  const userId = authStore.user?.id || "guest";
  const saved = localStorage.getItem(`notification_prefs_${userId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(preferences, parsed);
    } catch (e) {
      console.error("Failed to parse notification preferences", e);
    }
  }
};

const handleSave = () => {
  saving.value = true;
  const userId = authStore.user?.id || "guest";
  localStorage.setItem(`notification_prefs_${userId}`, JSON.stringify(preferences));

  setTimeout(() => {
    saving.value = false;
    toastStore.success(t("settingsPage.notifications.toasts.updated"));
  }, 500);
};

onMounted(() => {
  loadPreferences();
});
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans transition-all duration-300"
    :class="authStore.user?.role === 'admin' ? (isSidebarOpen ? 'ml-64' : 'ml-20') : ''"
  >
    <PublicNavbar v-if="!isDashboardRole" />

    <main
      class="flex-1 min-h-screen pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col"
      :class="isDashboardRole ? 'pt-25' : 'pt-32'"
    >
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          {{ t("settingsPage.notifications.breadcrumb.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("settingsPage.notifications.breadcrumb.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("settingsPage.notifications.title") }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Main Form Settings (Left Side) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Card 1: Bookings and Stays -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <BellIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.notifications.sections.stays.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.notifications.sections.stays.description") }}
                </p>

                <div class="mt-6 space-y-5 divide-y divide-(--color-border)/60">
                  <!-- Email Toggle -->
                  <div class="flex items-center justify-between pt-4 first:pt-0">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.notifications.sections.stays.emailTitle") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.notifications.sections.stays.emailDescription") }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input type="checkbox" v-model="preferences.booking_email" @change="handleSave" class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                    </label>
                  </div>

                  <!-- Push Toggle -->
                  <div class="flex items-center justify-between pt-4">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.notifications.sections.stays.pushTitle") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.notifications.sections.stays.pushDescription") }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input type="checkbox" v-model="preferences.booking_push" @change="handleSave" class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Account security -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <ShieldCheckIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.notifications.sections.security.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.notifications.sections.security.description") }}
                </p>

                <div class="mt-6 space-y-5">
                  <!-- Email Toggle -->
                  <div class="flex items-center justify-between">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.notifications.sections.security.emailTitle") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.notifications.sections.security.emailDescription") }}</p>
                    </div>
                    <label class="relative inline-flex items-center select-none shrink-0 cursor-not-allowed">
                      <input type="checkbox" v-model="preferences.security_email" disabled class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 peer-checked:bg-(--color-primary) opacity-50"></div>
                    </label>
                  </div>
                  
                  <div class="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 flex gap-2.5 items-start mt-2">
                    <InformationCircleIcon class="h-4.5 w-4.5 text-(--color-muted) shrink-0 mt-0.5" />
                    <p class="text-[11px] text-(--color-muted) font-bold leading-relaxed">
                      {{ t("settingsPage.notifications.sections.security.complianceNote") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Sidebar Info Box (Right Side) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <div class="flex gap-2">
              <InformationCircleIcon class="h-5 w-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.notifications.sidebar.title") }}</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  {{ t("settingsPage.notifications.sidebar.description") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
