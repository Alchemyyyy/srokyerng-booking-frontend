<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ChevronRightIcon,
  InformationCircleIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { useOwnerPaymentStore } from "@/modules/payments/store/ownerPayment.store";
import { getBankName } from "@/modules/payments/utils/bankBranding";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import http from "@/app/api/http";
import { formatPrice } from "@/shared/utils/currency";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value || "").toLowerCase()}`, value);

const authStore = useAuthStore();
const { isSidebarOpen } = useSidebar();
const ownerPaymentStore = useOwnerPaymentStore();

const activeTab = ref("payments"); // "payments" or "payouts"

const transactions = ref([]);
const loadingTransactions = ref(false);

const maskAccountNumber = (value) => {
  const str = String(value || "");
  if (str.length <= 4) return str;
  return `${"•".repeat(str.length - 4)}${str.slice(-4)}`;
};

const rolePrefix = computed(() => {
  const role = authStore.user?.role;
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "customer";
});
const isDashboardRole = computed(() => ["owner", "admin"].includes(authStore.user?.role));

// Fetch actual user reservations to list payment history
const fetchPaymentHistory = async () => {
  loadingTransactions.value = true;
  try {
    // Fetch user reservations
    const response = await http.get("/reservations/my");
    const bookings = response.data || response || [];
    
    // Extract payment details from bookings
    transactions.value = bookings.map(b => ({
      id: b.id,
      propertyName: b.property?.property_name || t("settingsPage.paymentsPayouts.transactions.defaultPropertyName"),
      amount: b.total_price,
      status: b.payment_status || b.status || "pending",
      date: b.created_at ? new Date(b.created_at).toLocaleDateString() : t("settingsPage.paymentsPayouts.transactions.recent"),
      roomType: b.room_type || t("settingsPage.paymentsPayouts.transactions.defaultRoomType"),
    }));
  } catch (err) {
    console.error("Failed to load payment history", err);
  } finally {
    loadingTransactions.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchPaymentHistory();
    if (authStore.user?.role === "owner") {
      ownerPaymentStore.fetchAccountDetails();
    }
  }
});

const getStatusBadgeClass = (status) => {
  const s = String(status).toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed") {
    return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
  }
  if (s === "pending" || s === "submitted") {
    return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
  }
  if (s === "refunded" || s === "cancelled") {
    return "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20";
  }
  return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
};
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
          {{ t("settingsPage.paymentsPayouts.breadcrumb.account") }}
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">{{ t("settingsPage.paymentsPayouts.breadcrumb.current") }}</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        {{ t("settingsPage.paymentsPayouts.title") }}
      </h1>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-(--color-border) gap-6 mt-8">
        <button
          type="button"
          @click="activeTab = 'payments'"
          class="pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer"
          :class="activeTab === 'payments' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
        >
          {{ t("settingsPage.paymentsPayouts.tabs.payments") }}
        </button>
        <button
          type="button"
          @click="activeTab = 'payouts'"
          class="pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer"
          :class="activeTab === 'payouts' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
        >
          {{ t("settingsPage.paymentsPayouts.tabs.payouts") }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Main Panel -->
        <div class="lg:col-span-2 space-y-10">
          
          <!-- Tab 1: Payments -->
          <div v-if="activeTab === 'payments'" class="space-y-10">
            <!-- Saved Payment Methods & Credits (not built yet) -->
            <section class="space-y-4">
              <div class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft)/40 p-6 flex items-start gap-3">
                <InformationCircleIcon class="h-5 w-5 text-(--color-muted) shrink-0 mt-0.5" />
                <div>
                  <h2 class="text-sm font-extrabold text-(--color-text)">{{ t("settingsPage.paymentsPayouts.methods.comingSoonTitle") }}</h2>
                  <p class="text-xs text-(--color-muted) mt-1 leading-relaxed">
                    {{ t("settingsPage.paymentsPayouts.methods.comingSoonDesc") }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Payment Transaction History -->
            <section class="space-y-4 pt-6 border-t border-(--color-border)">
              <h2 class="text-xl font-extrabold text-(--color-text)">{{ t("settingsPage.paymentsPayouts.transactions.title") }}</h2>

              <div class="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
                <table class="min-w-full divide-y divide-(--color-border) text-left text-sm">
                  <thead class="bg-(--color-surface-soft)/40 font-bold text-xs text-(--color-muted)">
                    <tr>
                      <th class="px-6 py-4">{{ t("settingsPage.paymentsPayouts.transactions.columns.transaction") }}</th>
                      <th class="px-6 py-4">{{ t("settingsPage.paymentsPayouts.transactions.columns.date") }}</th>
                      <th class="px-6 py-4">{{ t("settingsPage.paymentsPayouts.transactions.columns.amount") }}</th>
                      <th class="px-6 py-4">{{ t("settingsPage.paymentsPayouts.transactions.columns.status") }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-(--color-border) font-medium text-xs">
                    <tr v-if="loadingTransactions">
                      <td colspan="4" class="px-6 py-8 text-center text-(--color-muted)">
                        {{ t("settingsPage.paymentsPayouts.transactions.loading") }}
                      </td>
                    </tr>
                    <tr v-else-if="transactions.length === 0">
                      <td colspan="4" class="px-6 py-8 text-center text-(--color-muted)">
                        {{ t("settingsPage.paymentsPayouts.transactions.empty") }}
                      </td>
                    </tr>
                    <tr v-else v-for="tx in transactions" :key="tx.id" class="hover:bg-(--color-surface-soft)/30 transition">
                      <td class="px-6 py-4">
                        <p class="font-bold text-(--color-text)">{{ tx.propertyName }}</p>
                        <p class="text-[10px] text-(--color-muted) mt-0.5">{{ tx.roomType }}</p>
                      </td>
                      <td class="px-6 py-4 text-(--color-muted)">{{ tx.date }}</td>
                      <td class="px-6 py-4 font-bold text-(--color-text)">{{ formatPrice(tx.amount) }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="getStatusBadgeClass(tx.status)">
                          {{ statusLabel(tx.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- Tab 2: Payouts -->
          <div v-else class="space-y-6">
            <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 space-y-4 shadow-xs">
              <div class="flex items-start gap-4">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <BanknotesIcon class="h-6 w-6" />
                </span>
                <div>
                  <h3 class="text-lg font-extrabold text-(--color-text)">{{ t("settingsPage.paymentsPayouts.payouts.title") }}</h3>
                  <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                    {{ t("settingsPage.paymentsPayouts.payouts.description") }}
                  </p>
                </div>
              </div>

              <!-- Owner Payout Account status -->
              <div v-if="authStore.user?.role === 'owner'" class="pt-4 space-y-4">
                <div v-if="ownerPaymentStore.loading" class="text-xs text-(--color-muted)">
                  {{ t("settingsPage.paymentsPayouts.payouts.loadingAccounts") }}
                </div>
                <div v-else-if="ownerPaymentStore.paymentAccounts.length === 0" class="text-xs text-(--color-muted)">
                  {{ t("settingsPage.paymentsPayouts.payouts.noAccountsConfigured") }}
                </div>
                <div
                  v-else
                  v-for="account in ownerPaymentStore.paymentAccounts"
                  :key="account.id"
                  class="flex justify-between items-center bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)/60 text-xs"
                >
                  <div>
                    <p class="font-bold">{{ getBankName(account.payment_method_id) }}</p>
                    <p class="text-(--color-muted) mt-0.5">{{ maskAccountNumber(account.account_number) }}</p>
                  </div>
                  <span class="text-xs font-bold" :class="account.is_active ? 'text-emerald-600' : 'text-(--color-muted)'">
                    {{ account.is_active ? statusLabel("active") : statusLabel("inactive") }}
                  </span>
                </div>
                <RouterLink
                  to="/owner/payment-accounts"
                  class="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary) hover:underline"
                >
                  {{ t("settingsPage.paymentsPayouts.payouts.manageLink") }}
                  <ChevronRightIcon class="h-3.5 w-3.5" />
                </RouterLink>
              </div>

              <div v-else class="pt-4 border-t border-(--color-border) space-y-4">
                <p class="text-xs text-(--color-muted) leading-relaxed">
                  {{ t("settingsPage.paymentsPayouts.payouts.notPartnerNote") }}
                </p>
                <RouterLink
                  :to="{ name: 'public.listProperty' }"
                  class="inline-flex px-4 py-2 bg-(--color-primary) hover:bg-opacity-90 !text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  {{ t("settingsPage.paymentsPayouts.payouts.becomePartner") }}
                </RouterLink>
              </div>
            </div>
          </div>

        </div>

        <!-- Sidebar Info Guide (Right Side) -->
        <div class="lg:col-span-1">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft)/40 p-7 space-y-6">
            <div class="flex gap-2">
              <InformationCircleIcon class="h-5 w-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h3 class="font-extrabold text-sm text-(--color-text)">{{ t("settingsPage.paymentsPayouts.sidebar.title") }}</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  {{ t("settingsPage.paymentsPayouts.sidebar.description") }}
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
