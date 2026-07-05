<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ChevronRightIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
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

// OAuth connection states
const googleConnected = ref(true);
const facebookConnected = ref(false);

const loadSharingPreferences = () => {
  const userId = authStore.user?.id || "guest";
  const saved = localStorage.getItem(`privacy_sharing_${userId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(sharing, parsed);
    } catch (e) {
      console.error(e);
    }
  }
};

const handleSave = () => {
  saving.value = true;
  const userId = authStore.user?.id || "guest";
  localStorage.setItem(`privacy_sharing_${userId}`, JSON.stringify(sharing));
  
  setTimeout(() => {
    saving.value = false;
    toastStore.success(t("settingsPage.privacySharing.toasts.preferencesUpdated"));
  }, 500);
};

const toggleConnection = (provider) => {
  if (provider === "google") {
    googleConnected.value = !googleConnected.value;
    toastStore.success(
      googleConnected.value
        ? t("settingsPage.privacySharing.toasts.googleConnected")
        : t("settingsPage.privacySharing.toasts.googleDisconnected")
    );
  } else if (provider === "facebook") {
    facebookConnected.value = !facebookConnected.value;
    toastStore.success(
      facebookConnected.value
        ? t("settingsPage.privacySharing.toasts.facebookConnected")
        : t("settingsPage.privacySharing.toasts.facebookDisconnected")
    );
  }
};

// High-fidelity profile data export downloader (PDF)
const downloadDataArchive = () => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  const userObj = authStore.user || {};

  const notProvided = t("settingsPage.privacySharing.dataArchive.notProvided");
  const dob = userObj.date_of_birth ? new Date(userObj.date_of_birth).toLocaleDateString() : notProvided;
  const joinedDate = userObj.created_at
    ? new Date(userObj.created_at).toLocaleDateString()
    : t("settingsPage.privacySharing.dataArchive.recent");

  doc.write(`
    <html>
      <head>
        <title>${t("settingsPage.privacySharing.dataArchive.documentTitle")}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            padding: 40px;
            line-height: 1.6;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1268b4;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 22px;
            font-weight: 800;
            color: #1268b4;
          }
          .title-area {
            text-align: right;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            color: #111;
          }
          .subtitle {
            margin: 5px 0 0 0;
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section {
            margin-bottom: 30px;
          }
          h2 {
            font-size: 16px;
            border-bottom: 1px solid #e4e4e7;
            padding-bottom: 8px;
            margin-bottom: 15px;
            color: #1268b4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #f4f4f5;
          }
          th {
            font-weight: 700;
            color: #4b5563;
            width: 30%;
          }
          td {
            color: #111827;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e4e4e7;
            padding-top: 20px;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ស្រុកយើង • Srok-Yerng</div>
          <div class="title-area">
            <h1>${t("settingsPage.privacySharing.dataArchive.reportTitle")}</h1>
            <p class="subtitle">${t("settingsPage.privacySharing.dataArchive.generatedOn", { date: new Date().toLocaleDateString() })}</p>
          </div>
        </div>

        <div class="section">
          <h2>${t("settingsPage.privacySharing.dataArchive.personalProfileSection")}</h2>
          <table>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.legalName")}</th>
              <td>${userObj.full_name || notProvided}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.emailAddress")}</th>
              <td>${userObj.email || notProvided}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.phoneNumber")}</th>
              <td>${userObj.phone || notProvided}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.gender")}</th>
              <td style="text-transform: capitalize;">${userObj.gender || notProvided}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.dateOfBirth")}</th>
              <td>${dob}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.address")}</th>
              <td>${userObj.address || notProvided}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>${t("settingsPage.privacySharing.dataArchive.accountMetadataSection")}</h2>
          <table>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.accountId")}</th>
              <td>#${userObj.id || t("settingsPage.privacySharing.dataArchive.notAvailable")}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.memberRole")}</th>
              <td style="text-transform: capitalize;">${userObj.role || t("settingsPage.privacySharing.dataArchive.customerRoleFallback")}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.dateJoined")}</th>
              <td>${joinedDate}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.googleAccount")}</th>
              <td>${googleConnected.value ? t("settingsPage.privacySharing.dataArchive.connectedLinked") : t("settingsPage.privacySharing.dataArchive.notLinked")}</td>
            </tr>
            <tr>
              <th>${t("settingsPage.privacySharing.dataArchive.facebookAccount")}</th>
              <td>${facebookConnected.value ? t("settingsPage.privacySharing.dataArchive.connectedLinked") : t("settingsPage.privacySharing.dataArchive.notLinked")}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>${t("settingsPage.privacySharing.dataArchive.footerConfidential")}</p>
          <p>&copy; ${t("settingsPage.privacySharing.dataArchive.footerRights", { year: new Date().getFullYear() })}</p>
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  }, 500);
};

onMounted(() => {
  loadSharingPreferences();
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
        <div class="lg:col-span-2 space-y-8 divide-y divide-(--color-border)">
          
          <!-- Section 1: Sharing Preferences -->
          <div class="py-6 first:pt-0">
            <h2 class="text-lg font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.sharing.title") }}</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              {{ t("settingsPage.privacySharing.sections.sharing.description") }}
            </p>

            <div class="mt-6 space-y-4">
              <!-- Search engine indexing -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.toggles.searchEngines.label") }}</h4>
                  <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.toggles.searchEngines.description") }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" v-model="sharing.search_engines" @change="handleSave" class="sr-only peer" />
                  <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                </label>
              </div>

              <!-- Review sharing -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.toggles.reviewSharing.label") }}</h4>
                  <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.toggles.reviewSharing.description") }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" v-model="sharing.review_sharing" @change="handleSave" class="sr-only peer" />
                  <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Section 2: Connected Accounts -->
          <div class="py-6">
            <h2 class="text-lg font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.connections.title") }}</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              {{ t("settingsPage.privacySharing.sections.connections.description") }}
            </p>

            <div class="mt-6 space-y-4">
              <!-- Google account -->
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

              <!-- Facebook account -->
              <div class="flex items-center justify-between py-3 rounded-xl border border-(--color-border) px-4 bg-(--color-surface-soft)/40">
                <div class="flex items-center gap-3">
                  <i class="bi bi-facebook text-lg text-blue-600"></i>
                  <div>
                    <h4 class="text-xs font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.connections.facebook.label") }}</h4>
                    <p class="text-[10px] text-(--color-muted) font-semibold mt-0.5">
                      {{ facebookConnected ? t("settingsPage.privacySharing.connections.facebook.linked") : t("settingsPage.privacySharing.connections.notLinked") }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="toggleConnection('facebook')"
                  class="px-4 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer"
                >
                  {{ facebookConnected ? t("settingsPage.privacySharing.connections.disconnect") : t("settingsPage.privacySharing.connections.connect") }}
                </button>
              </div>
            </div>
          </div>

          <!-- Section 3: Data Management -->
          <div class="py-6">
            <h2 class="text-lg font-extrabold text-(--color-text)">{{ t("settingsPage.privacySharing.sections.dataArchive.title") }}</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              {{ t("settingsPage.privacySharing.sections.dataArchive.description") }}
            </p>

            <div class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-(--color-surface-soft)/60 border border-(--color-border)">
              <div>
                <h4 class="text-sm font-bold text-(--color-text)">{{ t("settingsPage.privacySharing.dataArchive.exportCard.title") }}</h4>
                <p class="text-xs text-(--color-muted) font-medium mt-0.5">{{ t("settingsPage.privacySharing.dataArchive.exportCard.description") }}</p>
              </div>
              <button
                type="button"
                @click="downloadDataArchive"
                class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) hover:opacity-90 font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                {{ t("settingsPage.privacySharing.dataArchive.exportCard.button") }}
              </button>
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
