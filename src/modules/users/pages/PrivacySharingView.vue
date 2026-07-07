<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ChevronRightIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShareIcon,
  LinkIcon,
  FingerPrintIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || "").toLowerCase()}`, value);

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

// Reactive sharing options
const sharing = reactive({
  search_engines: false,
  review_sharing: true,
  activity_sharing: true,
});

// Cookie preferences
const cookies = reactive({
  essential: true,
  analytical: false,
  marketing: false,
});

// Data retention
const dataRetention = ref("indefinite");

// FAQ accordion state
const activeFaq = ref(null);
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};

// OAuth connection states
const googleConnected = ref(true);

const loadSharingPreferences = () => {
  const userId = authStore.user?.id || "guest";
  const saved = localStorage.getItem(`privacy_sharing_${userId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.sharing) {
        Object.assign(sharing, parsed.sharing);
      } else {
        // Backwards compatibility with old flat structure
        Object.assign(sharing, parsed);
      }
      if (parsed.cookies) Object.assign(cookies, parsed.cookies);
      if (parsed.dataRetention) dataRetention.value = parsed.dataRetention;
    } catch (e) {
      console.error(e);
    }
  }
};

const handleSave = () => {
  saving.value = true;
  const userId = authStore.user?.id || "guest";
  const dataToSave = {
    sharing,
    cookies,
    dataRetention: dataRetention.value,
  };
  localStorage.setItem(`privacy_sharing_${userId}`, JSON.stringify(dataToSave));
  
  setTimeout(() => {
    saving.value = false;
    toastStore.success(t("settingsPage.privacySharing.toasts.preferencesUpdated"));
  }, 400);
};

const toggleConnection = (provider) => {
  if (provider === "google") {
    googleConnected.value = !googleConnected.value;
    toastStore.success(
      googleConnected.value
        ? t("settingsPage.privacySharing.toasts.googleConnected")
        : t("settingsPage.privacySharing.toasts.googleDisconnected")
    );
  }
};



onMounted(() => {
  loadSharingPreferences();
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
          {{ t("settingsPage.privacySharing.breadcrumbs.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("settingsPage.privacySharing.breadcrumbs.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("settingsPage.privacySharing.title") }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Settings Form Panel (Left Side) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Section 1: Sharing Preferences Card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <ShareIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.sharing.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.privacySharing.sections.sharing.description") }}
                </p>

                <div class="mt-6 space-y-4">
                  <!-- Review sharing toggle -->
                  <div class="flex items-center justify-between py-2">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.toggles.reviewSharing.label") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.toggles.reviewSharing.description") }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input type="checkbox" v-model="sharing.review_sharing" @change="handleSave" class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Connected Accounts Card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <LinkIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.connections.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.privacySharing.sections.connections.description") }}
                </p>

                <div class="mt-6 space-y-4">
                  <!-- Google account Connection -->
                  <div class="flex items-center justify-between py-3 rounded-xl border border-(--color-border) px-4 bg-(--color-surface-soft)/40">
                    <div class="flex items-center gap-3">
                      <i class="bi bi-google text-lg text-rose-500"></i>
                      <div>
                        <h4 class="text-xs font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.connections.google.label") }}</h4>
                        <p class="text-[10px] text-(--color-muted) font-semibold mt-0.5">
                          {{ googleConnected ? t("settingsPage.privacySharing.connections.google.linked") : t("settingsPage.privacySharing.connections.notLinked") }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="toggleConnection('google')"
                      class="px-4 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer"
                    >
                      {{ googleConnected ? t("settingsPage.privacySharing.connections.disconnect") : t("settingsPage.privacySharing.connections.connect") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Cookie Preferences Card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <FingerPrintIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.cookies.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.privacySharing.sections.cookies.description") }}
                </p>

                <div class="mt-6 space-y-5 divide-y divide-(--color-border)/60">
                  <!-- Essential cookies (required) -->
                  <div class="flex items-center justify-between pt-4 first:pt-0">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.cookies.essential.label") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.cookies.essential.description") }}</p>
                    </div>
                    <label class="relative inline-flex items-center select-none shrink-0 cursor-not-allowed">
                      <input type="checkbox" v-model="cookies.essential" disabled class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 peer-checked:bg-(--color-primary) opacity-50"></div>
                    </label>
                  </div>

                  <!-- Analytical cookies -->
                  <div class="flex items-center justify-between pt-4">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.cookies.analytical.label") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.cookies.analytical.description") }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input type="checkbox" v-model="cookies.analytical" @change="handleSave" class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                    </label>
                  </div>

                  <!-- Marketing cookies -->
                  <div class="flex items-center justify-between pt-4">
                    <div class="pr-4">
                      <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.cookies.marketing.label") }}</h4>
                      <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.cookies.marketing.description") }}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input type="checkbox" v-model="cookies.marketing" @change="handleSave" class="sr-only peer" />
                      <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Data Retention Card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <ClockIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.retention.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.privacySharing.sections.retention.description") }}
                </p>

                <div class="mt-6 space-y-4">
                  <div class="max-w-md">
                    <label class="block text-xs font-bold text-(--color-text) mb-1.5">
                      {{ t("settingsPage.privacySharing.retention.label") }}
                    </label>
                    <select
                      v-model="dataRetention"
                      @change="handleSave"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) font-semibold cursor-pointer"
                    >
                      <option value="indefinite">{{ t("settingsPage.privacySharing.retention.options.indefinite") }}</option>
                      <option value="m3">{{ t("settingsPage.privacySharing.retention.options.m3") }}</option>
                      <option value="m6">{{ t("settingsPage.privacySharing.retention.options.m6") }}</option>
                      <option value="m12">{{ t("settingsPage.privacySharing.retention.options.m12") }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: FAQ Accordion Card -->
          <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xs hover:border-(--color-primary)/30 transition duration-300">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <QuestionMarkCircleIcon class="h-5 w-5" />
              </div>
              <div class="flex-grow">
                <h2 class="text-base font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.faq.title") }}</h2>
                <p class="text-xs text-(--color-muted) mt-1 font-semibold leading-relaxed">
                  {{ t("settingsPage.privacySharing.sections.faq.description") }}
                </p>

                <div class="mt-6 space-y-3">
                  <!-- FAQ Item 1 -->
                  <div class="rounded-xl border border-(--color-border) bg-(--color-page) overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      @click="toggleFaq(1)"
                      class="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer"
                    >
                      <span>{{ t("settingsPage.privacySharing.faq.items.q1") }}</span>
                      <ChevronDownIcon
                        class="h-4 w-4 text-(--color-muted) transition-transform duration-300"
                        :class="activeFaq === 1 ? 'rotate-180' : ''"
                      />
                    </button>
                    <div
                      v-show="activeFaq === 1"
                      class="px-4 pb-4 pt-1 text-xs text-(--color-muted) leading-relaxed font-semibold animate-fadeIn"
                    >
                      {{ t("settingsPage.privacySharing.faq.items.a1") }}
                    </div>
                  </div>

                  <!-- FAQ Item 2 -->
                  <div class="rounded-xl border border-(--color-border) bg-(--color-page) overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      @click="toggleFaq(2)"
                      class="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer"
                    >
                      <span>{{ t("settingsPage.privacySharing.faq.items.q2") }}</span>
                      <ChevronDownIcon
                        class="h-4 w-4 text-(--color-muted) transition-transform duration-300"
                        :class="activeFaq === 2 ? 'rotate-180' : ''"
                      />
                    </button>
                    <div
                      v-show="activeFaq === 2"
                      class="px-4 pb-4 pt-1 text-xs text-(--color-muted) leading-relaxed font-semibold animate-fadeIn"
                    >
                      {{ t("settingsPage.privacySharing.faq.items.a2") }}
                    </div>
                  </div>

                  <!-- FAQ Item 3 -->
                  <div class="rounded-xl border border-(--color-border) bg-(--color-page) overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      @click="toggleFaq(3)"
                      class="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-(--color-text) hover:bg-(--color-surface-soft) transition cursor-pointer"
                    >
                      <span>{{ t("settingsPage.privacySharing.faq.items.q3") }}</span>
                      <ChevronDownIcon
                        class="h-4 w-4 text-(--color-muted) transition-transform duration-300"
                        :class="activeFaq === 3 ? 'rotate-180' : ''"
                      />
                    </button>
                    <div
                      v-show="activeFaq === 3"
                      class="px-4 pb-4 pt-1 text-xs text-(--color-muted) leading-relaxed font-semibold animate-fadeIn"
                    >
                      {{ t("settingsPage.privacySharing.faq.items.a3") }}
                    </div>
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
              <GlobeAltIcon class="h-5 w-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.privacySharing.sidebar.privacyCommitment.title") }}</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  {{ t("settingsPage.privacySharing.sidebar.privacyCommitment.description") }}
                </p>
              </div>
            </div>

            <div class="my-4 border-t border-(--color-border)/60"></div>

            <div class="flex gap-2">
              <SparklesIcon class="h-5 w-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.privacySharing.sidebar.appConnections.title") }}</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  {{ t("settingsPage.privacySharing.sidebar.appConnections.description") }}
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
