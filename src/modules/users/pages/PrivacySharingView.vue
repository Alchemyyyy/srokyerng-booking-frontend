<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  ChevronRightIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const authStore = useAuthStore();
const toastStore = useToastStore();

const saving = ref(false);
const rolePrefix = computed(() => authStore.user?.role === "owner" ? "owner" : "customer");

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
    toastStore.success("Privacy preferences updated successfully.");
  }, 500);
};

const toggleConnection = (provider) => {
  if (provider === "google") {
    googleConnected.value = !googleConnected.value;
    toastStore.success(googleConnected.value ? "Connected to Google Account." : "Disconnected Google Account.");
  } else if (provider === "facebook") {
    facebookConnected.value = !facebookConnected.value;
    toastStore.success(facebookConnected.value ? "Connected to Facebook Account." : "Disconnected Facebook Account.");
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
  
  const dob = userObj.date_of_birth ? new Date(userObj.date_of_birth).toLocaleDateString() : "Not provided";
  const joinedDate = userObj.created_at ? new Date(userObj.created_at).toLocaleDateString() : "Recent";
  
  doc.write(`
    <html>
      <head>
        <title>Srok-Yerng Booking - Personal Data Archive</title>
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
            <h1>Data Archive Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Personal Profile Information</h2>
          <table>
            <tr>
              <th>Legal Name</th>
              <td>${userObj.full_name || "Not provided"}</td>
            </tr>
            <tr>
              <th>Email Address</th>
              <td>${userObj.email || "Not provided"}</td>
            </tr>
            <tr>
              <th>Phone Number</th>
              <td>${userObj.phone || "Not provided"}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td style="text-transform: capitalize;">${userObj.gender || "Not provided"}</td>
            </tr>
            <tr>
              <th>Date of Birth</th>
              <td>${dob}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>${userObj.address || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Account Metadata</h2>
          <table>
            <tr>
              <th>Account ID</th>
              <td>#${userObj.id || "N/A"}</td>
            </tr>
            <tr>
              <th>Member Role</th>
              <td style="text-transform: capitalize;">${userObj.role || "Customer"}</td>
            </tr>
            <tr>
              <th>Date Joined</th>
              <td>${joinedDate}</td>
            </tr>
            <tr>
              <th>Google Account</th>
              <td>${googleConnected.value ? 'Connected / Linked' : 'Not linked'}</td>
            </tr>
            <tr>
              <th>Facebook Account</th>
              <td>${facebookConnected.value ? 'Connected / Linked' : 'Not linked'}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Srok-Yerng Booking Privacy Data Export • Confidential. For user personal reference only.</p>
          <p>&copy; ${new Date().getFullYear()} Srok-Yerng Booking. All rights reserved.</p>
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
  <div class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans">
    <PublicNavbar />

    <main class="flex-1 min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          Account
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">Privacy & sharing</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        Privacy & sharing
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Settings Form Panel (Left Side) -->
        <div class="lg:col-span-2 space-y-8 divide-y divide-(--color-border)">
          
          <!-- Section 1: Sharing Preferences -->
          <div class="py-6 first:pt-0">
            <h2 class="text-lg font-extrabold text-(--color-text)">Profile sharing</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              Control how your profile and reviews appear on search results or partner websites.
            </p>

            <div class="mt-6 space-y-4">
              <!-- Search engine indexing -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <h4 class="text-sm font-bold text-(--color-text)">Search engine indexing</h4>
                  <p class="text-xs text-(--color-muted) font-medium mt-0.5">Let search engines like Google and Bing list your profile page.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" v-model="sharing.search_engines" @change="handleSave" class="sr-only peer" />
                  <div class="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-primary)"></div>
                </label>
              </div>

              <!-- Review sharing -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <h4 class="text-sm font-bold text-(--color-text)">Review sharing</h4>
                  <p class="text-xs text-(--color-muted) font-medium mt-0.5">Publish your feedback and review comments to external travel portals.</p>
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
            <h2 class="text-lg font-extrabold text-(--color-text)">Connected portals</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              Link your Srok-Yerng Booking account to social services for fast authentication.
            </p>

            <div class="mt-6 space-y-4">
              <!-- Google account -->
              <div class="flex items-center justify-between py-3 rounded-xl border border-(--color-border) px-4 bg-(--color-surface-soft)/40">
                <div class="flex items-center gap-3">
                  <i class="bi bi-google text-lg text-rose-500"></i>
                  <div>
                    <h4 class="text-xs font-bold text-(--color-text)">Google Account</h4>
                    <p class="text-[10px] text-(--color-muted) font-semibold mt-0.5">
                      {{ googleConnected ? 'Linked to your email' : 'Not linked' }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="toggleConnection('google')"
                  class="px-4 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer"
                >
                  {{ googleConnected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>

              <!-- Facebook account -->
              <div class="flex items-center justify-between py-3 rounded-xl border border-(--color-border) px-4 bg-(--color-surface-soft)/40">
                <div class="flex items-center gap-3">
                  <i class="bi bi-facebook text-lg text-blue-600"></i>
                  <div>
                    <h4 class="text-xs font-bold text-(--color-text)">Facebook Account</h4>
                    <p class="text-[10px] text-(--color-muted) font-semibold mt-0.5">
                      {{ facebookConnected ? 'Linked successfully' : 'Not linked' }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="toggleConnection('facebook')"
                  class="px-4 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-surface) text-xs font-bold text-(--color-text) transition active:scale-95 cursor-pointer"
                >
                  {{ facebookConnected ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Section 3: Data Management -->
          <div class="py-6">
            <h2 class="text-lg font-extrabold text-(--color-text)">Data archive</h2>
            <p class="text-xs text-(--color-muted) mt-1 font-medium leading-relaxed">
              Download a copy of your personal data archive containing reservations history and profile details.
            </p>

            <div class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-(--color-surface-soft)/60 border border-(--color-border)">
              <div>
                <h4 class="text-sm font-bold text-(--color-text)">Export my profile data</h4>
                <p class="text-xs text-(--color-muted) font-medium mt-0.5">Compiles all of your records into a portable PDF document.</p>
              </div>
              <button
                type="button"
                @click="downloadDataArchive"
                class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) hover:opacity-90 font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                Request Archive
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
                <h3 class="font-extrabold text-sm text-(--color-text)">Privacy commitment</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  We care about your privacy. We never sell your personal data or reservation itineraries to advertising syndicates.
                </p>
              </div>
            </div>

            <div class="my-4 border-t border-(--color-border)/60"></div>

            <div class="flex gap-2">
              <SparklesIcon class="h-5 w-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-(--color-text)">App connections</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  Connecting your Facebook or Google profile allows you to sign in with a single click, using social auth credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <PublicFooter />
  </div>
</template>
