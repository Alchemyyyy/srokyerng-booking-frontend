<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  ChevronRightIcon,
  CreditCardIcon,
  GiftIcon,
  InformationCircleIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import http from "@/app/api/http";

const authStore = useAuthStore();
const toastStore = useToastStore();

const activeTab = ref("payments"); // "payments" or "payouts"
const couponCode = ref("");
const applyingCoupon = ref(false);
const userCredits = ref(25.00); // Mock credit starting balance

const transactions = ref([]);
const loadingTransactions = ref(false);

const rolePrefix = computed(() => authStore.user?.role === "owner" ? "owner" : "customer");

// Fetch actual user reservations to list payment history
const fetchPaymentHistory = async () => {
  loadingTransactions.value = true;
  try {
    // Fetch user reservations
    const response = await http.get("/reservations");
    const bookings = response.data || response || [];
    
    // Extract payment details from bookings
    transactions.value = bookings.map(b => ({
      id: b.id,
      propertyName: b.property?.property_name || "Stay Booking",
      amount: b.total_price,
      status: b.payment_status || b.status || "pending",
      date: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent",
      roomType: b.room_type || "Room Stay",
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
  }
});

const handleApplyCoupon = () => {
  if (!couponCode.value.trim()) return;
  applyingCoupon.value = true;
  
  setTimeout(() => {
    applyingCoupon.value = false;
    // Mock successful coupon application
    if (couponCode.value.toUpperCase() === "SROKYERNG50") {
      userCredits.value += 50.00;
      toastStore.success("Promo code applied! $50.00 credit added to your balance.");
      couponCode.value = "";
    } else {
      toastStore.danger("Invalid or expired coupon code.");
    }
  }, 1000);
};

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
  <div class="min-h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans">
    <PublicNavbar />

    <main class="flex-1 min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto w-full flex flex-col">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1 text-xs font-bold text-(--color-text) mb-3">
        <RouterLink :to="{ name: `${rolePrefix}.settings` }" class="hover:underline">
          Account
        </RouterLink>
        <ChevronRightIcon class="h-3.5 w-3.5 text-(--color-muted)" />
        <span class="text-(--color-muted) font-semibold">Payments & payouts</span>
      </nav>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-text)">
        Payments & payouts
      </h1>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-(--color-border) gap-6 mt-8">
        <button
          type="button"
          @click="activeTab = 'payments'"
          class="pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer"
          :class="activeTab === 'payments' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
        >
          Payments
        </button>
        <button
          type="button"
          @click="activeTab = 'payouts'"
          class="pb-4 text-sm font-bold border-b-2 transition duration-200 cursor-pointer"
          :class="activeTab === 'payouts' ? 'border-(--color-text) text-(--color-text)' : 'border-transparent text-(--color-muted) hover:text-(--color-text)'"
        >
          Payouts
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <!-- Main Panel -->
        <div class="lg:col-span-2 space-y-10">
          
          <!-- Tab 1: Payments -->
          <div v-if="activeTab === 'payments'" class="space-y-10">
            <!-- Saved Cards / Visual Credit Card -->
            <section class="space-y-4">
              <h2 class="text-xl font-extrabold text-(--color-text)">Your payment methods</h2>
              
              <!-- Card Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- High-fidelity Visa Mockup Card -->
                <div class="relative h-44 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 flex flex-col justify-between shadow-lg overflow-hidden group">
                  <div class="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-zinc-700/20 blur-xl"></div>
                  
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Default Method</p>
                      <h4 class="text-sm font-extrabold mt-1">Visa Classic</h4>
                    </div>
                    <span class="text-xs font-bold bg-zinc-700/50 px-2 py-0.5 rounded-md">Debit</span>
                  </div>

                  <div class="space-y-1.5">
                    <p class="text-base font-bold tracking-[0.2em]">••••  ••••  ••••  4242</p>
                    <div class="flex justify-between items-center text-xs">
                      <p class="font-medium text-zinc-400">Sambath Boyloy</p>
                      <p class="font-bold text-zinc-300">Exp 12/28</p>
                    </div>
                  </div>
                </div>

                <!-- Add Payment Method Card -->
                <button
                  type="button"
                  class="h-44 rounded-2xl border-2 border-dashed border-(--color-border) hover:border-(--color-primary) flex flex-col items-center justify-center gap-3 text-(--color-muted) hover:text-(--color-primary) active:scale-98 transition duration-200 cursor-pointer"
                >
                  <CreditCardIcon class="h-8 w-8" />
                  <span class="text-xs font-bold">Add payment method</span>
                </button>
              </div>
            </section>

            <!-- Srok-Yerng Gift Credits & Promo Codes -->
            <section class="space-y-4 pt-6 border-t border-(--color-border)">
              <h2 class="text-xl font-extrabold text-(--color-text)">Srok-Yerng credits & coupons</h2>
              
              <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 space-y-4 shadow-xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <GiftIcon class="h-5 w-5" />
                    </span>
                    <div>
                      <p class="text-sm font-bold text-(--color-text)">Available balance</p>
                      <p class="text-[10px] text-(--color-muted) font-semibold mt-0.5">Use credits during checkout for instant discounts.</p>
                    </div>
                  </div>
                  <span class="text-2xl font-black text-emerald-600">${{ userCredits.toFixed(2) }}</span>
                </div>

                <!-- Coupon Entry form -->
                <div class="flex items-center gap-2 pt-2">
                  <div class="relative flex-1">
                    <input
                      v-model="couponCode"
                      type="text"
                      placeholder="Enter promo code (e.g. SROKYERNG50)"
                      class="w-full rounded-xl border border-(--color-border) px-4 py-2.5 text-xs bg-(--color-page) text-(--color-text) focus:outline-hidden focus:border-(--color-primary) font-semibold uppercase tracking-wider placeholder-normal-case"
                      @keyup.enter="handleApplyCoupon"
                    />
                  </div>
                  <button
                    type="button"
                    @click="handleApplyCoupon"
                    :disabled="applyingCoupon || !couponCode.trim()"
                    class="px-5 py-2.5 rounded-xl bg-(--color-text) text-(--color-page) font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {{ applyingCoupon ? 'Applying...' : 'Apply' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- Payment Transaction History -->
            <section class="space-y-4 pt-6 border-t border-(--color-border)">
              <h2 class="text-xl font-extrabold text-(--color-text)">Recent transactions</h2>
              
              <div class="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
                <table class="min-w-full divide-y divide-(--color-border) text-left text-sm">
                  <thead class="bg-(--color-surface-soft)/40 font-bold text-xs text-(--color-muted)">
                    <tr>
                      <th class="px-6 py-4">Transaction / Stay</th>
                      <th class="px-6 py-4">Date</th>
                      <th class="px-6 py-4">Amount</th>
                      <th class="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-(--color-border) font-medium text-xs">
                    <tr v-if="loadingTransactions">
                      <td colspan="4" class="px-6 py-8 text-center text-(--color-muted)">
                        Loading transactions history...
                      </td>
                    </tr>
                    <tr v-else-if="transactions.length === 0">
                      <td colspan="4" class="px-6 py-8 text-center text-(--color-muted)">
                        No recent transactions found.
                      </td>
                    </tr>
                    <tr v-else v-for="tx in transactions" :key="tx.id" class="hover:bg-(--color-surface-soft)/30 transition">
                      <td class="px-6 py-4">
                        <p class="font-bold text-(--color-text)">{{ tx.propertyName }}</p>
                        <p class="text-[10px] text-(--color-muted) mt-0.5">{{ tx.roomType }}</p>
                      </td>
                      <td class="px-6 py-4 text-(--color-muted)">{{ tx.date }}</td>
                      <td class="px-6 py-4 font-bold text-(--color-text)">${{ Number(tx.amount).toFixed(2) }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="getStatusBadgeClass(tx.status)">
                          {{ tx.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- Tab 2: Payouts (Host Settings Mockup) -->
          <div v-else class="space-y-6">
            <div class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 space-y-4 shadow-xs">
              <div class="flex items-start gap-4">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <BanknotesIcon class="h-6 w-6" />
                </span>
                <div>
                  <h3 class="text-lg font-extrabold text-(--color-text)">Receive host payouts</h3>
                  <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                    If you listing stays on Srok-Yerng Booking, this is how you set up payout methods to receive direct deposit earnings from guest reservations.
                  </p>
                </div>
              </div>

              <!-- Owner Payout Account status -->
              <div v-if="authStore.user?.role === 'owner'" class="pt-4 space-y-4">
                <div class="flex justify-between items-center bg-(--color-surface-soft) p-4 rounded-xl border border-(--color-border)/60 text-xs">
                  <div>
                    <p class="font-bold">ABA Bank Transfer</p>
                    <p class="text-(--color-muted) mt-0.5">Account ID ending in 9696</p>
                  </div>
                  <span class="text-xs font-bold text-emerald-600">Active</span>
                </div>
                <RouterLink
                  to="/owner/payment-accounts"
                  class="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary) hover:underline"
                >
                  Manage payment accounts in host dashboard
                  <ChevronRightIcon class="h-3.5 w-3.5" />
                </RouterLink>
              </div>

              <div v-else class="pt-4 border-t border-(--color-border) space-y-4">
                <p class="text-xs text-(--color-muted) leading-relaxed">
                  Only verified Partner/Host accounts can receive reservation payouts.
                </p>
                <RouterLink
                  :to="{ name: 'public.listProperty' }"
                  class="inline-flex px-4 py-2 bg-(--color-primary) hover:bg-opacity-90 !text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Become a Partner
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
                <h3 class="font-extrabold text-sm text-(--color-text)">Payment security</h3>
                <p class="text-xs text-(--color-muted) mt-1.5 leading-relaxed font-semibold">
                  All credit cards and transactions are encrypted and secured. Srok-Yerng Booking never exposes raw payment credentials to hosts or third-parties.
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
