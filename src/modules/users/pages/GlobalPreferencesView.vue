<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ChevronRightIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { setLocale } from "@/app/i18n";
import { currentCurrency, updateCurrency } from "@/shared/utils/currency";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const authStore = useAuthStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();
const { t, locale } = useI18n({ useScope: "global" });

const saving = ref(false);
const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));

// Selection states
const selectedLanguage = ref(locale.value);
const selectedCurrency = ref(currentCurrency.value);

const loadPreferences = () => {
  // Load Language from i18n
  selectedLanguage.value = locale.value;

  // Load Currency
  selectedCurrency.value = currentCurrency.value;
};

const handleLanguageChange = () => {
  saving.value = true;
  setLocale(selectedLanguage.value);

  setTimeout(() => {
    saving.value = false;
    toastStore.success(t("globalPreferencesPage.toast.languageUpdated"));
  }, 400);
};

const handleCurrencyChange = () => {
  saving.value = true;
  updateCurrency(selectedCurrency.value);

  setTimeout(() => {
    saving.value = false;
    toastStore.success(
      t("globalPreferencesPage.toast.currencyUpdated", { currency: selectedCurrency.value }),
    );
  }, 400);
};

onMounted(() => {
  loadPreferences();
});
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
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          {{ t("globalPreferencesPage.breadcrumb.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("globalPreferencesPage.breadcrumb.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("globalPreferencesPage.title") }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Left Panel: Option selection fields -->
        <div class="lg:col-span-2 space-y-8 divide-y divide-(--color-border)">

          <!-- Language Select -->
          <div class="py-6 first:pt-0 space-y-4">
            <div class="flex items-start gap-4">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <GlobeAltIcon class="h-5 w-5" />
              </span>
              <div class="flex-1">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("globalPreferencesPage.language.title") }}</h3>
                <p class="text-xs text-(--color-muted) font-medium mt-0.5">
                  {{ t("globalPreferencesPage.language.description") }}
                </p>

                <div class="mt-4 max-w-xs">
                  <select
                    v-model="selectedLanguage"
                    @change="handleLanguageChange"
                    class="w-full rounded-xl border border-(--color-border) px-4 py-2.5 text-xs bg-(--color-surface) text-(--color-text) font-semibold focus:outline-hidden focus:border-(--color-primary) cursor-pointer"
                  >
                    <option value="en">{{ t("globalPreferencesPage.language.en") }}</option>
                    <option value="km">{{ t("globalPreferencesPage.language.km") }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Currency Select -->
          <div class="py-6 space-y-4">
            <div class="flex items-start gap-4">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CurrencyDollarIcon class="h-5 w-5" />
              </span>
              <div class="flex-1">
                <h3 class="text-sm font-bold text-(--color-text)">{{ t("globalPreferencesPage.currency.title") }}</h3>
                <p class="text-xs text-(--color-muted) font-medium mt-0.5">
                  {{ t("globalPreferencesPage.currency.description") }}
                </p>

                <div class="mt-4 max-w-xs">
                  <select
                    v-model="selectedCurrency"
                    @change="handleCurrencyChange"
                    class="w-full rounded-xl border border-(--color-border) px-4 py-2.5 text-xs bg-(--color-surface) text-(--color-text) font-semibold focus:outline-hidden focus:border-(--color-primary) cursor-pointer"
                  >
                    <option value="USD">{{ t("globalPreferencesPage.currency.usd") }}</option>
                    <option value="KHR">{{ t("globalPreferencesPage.currency.khr") }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Side: Info Guide Box -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("globalPreferencesPage.sidebar.title") }}</h3>
            <p class="text-xs text-(--color-muted) leading-relaxed font-semibold">
              {{ t("globalPreferencesPage.sidebar.paragraph1") }}
            </p>
            <p class="text-xs text-(--color-muted) leading-relaxed font-semibold">
              {{ t("globalPreferencesPage.sidebar.paragraph2") }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter v-if="!isDashboardRole" />
  </div>
</template>
