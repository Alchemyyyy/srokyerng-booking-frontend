<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSidebar } from '@/shared/composables/useSidebar';
import { useOwnerPaymentStore } from '../store/ownerPayment.store';
import CreatePaymentAccountForm from '../components/CreatePaymentAccountForm.vue';
import AppModal from '@/shared/components/AppModal.vue';
import defaultQR from '@/assets/images/default/default_qr.png';
import AppLoading from '@/shared/components/LoadingSpinner.vue';
import DashboardHero from '../components/DashboardHero.vue';
import PaymentAccountFilter from '../components/PaymentAccountFilter.vue';

// 🎯 Import Skeleton Component ចូលមក
import PaymentAccountSkeleton from '../components/PaymentAccountSkeleton.vue';

import { PencilIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline';

const paymentStore = useOwnerPaymentStore();
const isModalOpen = ref(false);
const { isSidebarOpen } = useSidebar();

const isQrModalOpen = ref(false);
const selectedQrUrl = ref('');
const selectedAccountName = ref('');
const currentTab = ref('all');

const selectedEditData = ref(null);
const togglingAccountId = ref(null);

// 🎯 State សម្រាប់កត់សម្គាល់ពេលកំពុង Fetch ទិន្នន័យដំបូង
const isInitialLoading = ref(true);

const preloadImage = (url) => {
    return new Promise((resolve) => {
        if (!url) return resolve();
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // ទោះបីជា load ធ្លាក់ក៏ឱ្យទៅមុខបន្តដើម្បីកុំឱ្យគាំង Page
    });
};

// onMounted(async () => {
//     // ដំណើរការ Fetch ទិន្នន័យពី API
//     await paymentStore.fetchAccountDetails();
//     isInitialLoading.value = false; // បិទ Skeleton ពេលទិន្នន័យមកដល់
// });

onMounted(async () => {
    // 1. Fetch ទិន្នន័យគណនីពី API មកសិន
    await paymentStore.fetchAccountDetails();

    // 2. ប្រមូលផ្តុំ URL រូបភាពទាំងអស់ដែលមាននៅក្នុងបញ្ជីគណនី (ទាំង Logo និង QR Code)
    const imageUrls = [];
    paymentStore.paymentAccounts.forEach(account => {
        // ប្រមូល Logo តាម Method ID
        const logoUrl = getBankLogo(account.payment_method_id);
        if (logoUrl) imageUrls.push(logoUrl);

        // ប្រមូល QR Code URL
        if (account.qr_image_url) imageUrls.push(account.qr_image_url);
    });

    // បន្ថែមរូបភាពលំនាំដើម (Default QR) ចូលទៅក្នុងកញ្ចប់ Preload ដែរ
    imageUrls.push(defaultQR);

    // 3. រង់ចាំឱ្យ Browser ទាញយករូបភាពទាំងអស់ខាងលើឱ្យចប់សព្វគ្រប់
    await Promise.all(imageUrls.map(url => preloadImage(url)));

    // 4. បិទ Skeleton Loader (ធានាថាមកដល់ព្រមគ្នាទាំងអក្សរ និងរូបភាព)
    isInitialLoading.value = false;
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const filteredAccounts = computed(() => {
    if (currentTab.value === 'active') return paymentStore.paymentAccounts.filter(acc => acc.is_active);
    if (currentTab.value === 'deactive') return paymentStore.paymentAccounts.filter(acc => !acc.is_active);
    return paymentStore.paymentAccounts;
});

const getBankName = (methodId) => {
    const id = Number(methodId);
    if (id === 1) return 'ABA Bank';
    if (id === 2) return 'Acleda Bank';
    if (id === 3) return 'Wing Bank';
    return 'Other Bank';
};

const getBankLogo = (methodId) => {
    const id = Number(methodId);
    if (id === 1) return 'https://i.pinimg.com/736x/e2/33/f5/e233f5b0c5a358449398f202b03f063a.jpg';
    if (id === 2) return 'https://companieslogo.com/img/orig/ABC.KH-3aa8d94f.png?t=1659408615';
    if (id === 3) return 'https://www.royalgroup.com.kh/img/business_division/WingBank_Logo.png';
    return 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png';
};

const getBankAccentClass = (methodId, isActive) => {
    if (!isActive) return 'border-t-4 border-slate-300 opacity-75';
    const id = Number(methodId);
    if (id === 1) return 'border-t-4 border-[#005f9e]';
    if (id === 2) return 'border-t-4 border-[#0b3366]';
    if (id === 3) return 'border-t-4 border-[#8cc63f]';
    return 'border-t-4 border-slate-400';
};

const openQrPreview = (account) => {
    selectedQrUrl.value = account.qr_image_url || defaultQR;
    selectedAccountName.value = `${getBankName(account.payment_method_id)} - ${account.account_name}`;
    isQrModalOpen.value = true;
};

const handleEditAccount = (account) => {
    selectedEditData.value = account;
    isModalOpen.value = true;
};

const openCreateModal = () => {
    selectedEditData.value = null;
    isModalOpen.value = true;
};

const handleToggleActive = async (account) => {
    togglingAccountId.value = account.id;
    const result = await paymentStore.toggleAccountStatus(account.id, account.is_active);
    if (!result.success) {
        console.error(result.error);
    }
    togglingAccountId.value = null;
};
</script>

<template>
    <div class="payment-account-container space-y-6 my-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">

        <div class="page-header">
            <DashboardHero eyebrow="Payment management center" title="Payment Accounts"
                subtitle="Manage all your bank accounts and QR codes for receiving bookings cash."
                class="items-center">
                <template #action>
                    <button @click="openCreateModal"
                        class="my-auto px-5 py-2.5 bg-(--color-primary) text-white font-bold rounded-xl shadow-sm hover:opacity-95 flex items-center gap-2 cursor-pointer transition transform active:scale-95 text-sm whitespace-nowrap">
                        <span>+ Create Account</span>
                    </button>
                </template>
            </DashboardHero>
        </div>

        <PaymentAccountFilter v-model="currentTab" :allAccounts="paymentStore.paymentAccounts" />

        <div v-if="isInitialLoading">
            <PaymentAccountSkeleton />
        </div>

        <div v-else-if="filteredAccounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="account in filteredAccounts" :key="account.id"
                class="bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md"
                :class="getBankAccentClass(account.payment_method_id, account.is_active)">

                <div
                    class="p-5 flex justify-between items-center border-b border-(--color-border) bg-(--color-input)/20">
                    <div class="h-7 max-w-25 flex items-center"
                        :class="!account.is_active ? 'grayscale opacity-50' : ''">
                        <img :src="getBankLogo(account.payment_method_id)" :alt="getBankName(account.payment_method_id)"
                            class="h-12 w-auto object-contain" />
                    </div>

                    <div class="flex items-center gap-2">
                        <div class="px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 select-none"
                            :class="account.is_active ? 'bg-(--color-success-soft) border-(--color-success) text-(--color-success)' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'">
                            <span class="w-1.5 h-1.5 rounded-full"
                                :class="account.is_active ? 'bg-(--color-success)' : 'bg-slate-400'"></span>
                            {{ account.is_active ? 'Active' : 'Deactivated' }}
                        </div>

                        <button @click="handleEditAccount(account)" title="Edit Account"
                            :disabled="paymentStore.loading"
                            class="p-1.5 rounded-lg border border-(--color-primary) hover:bg-(--color-primary-soft) text-(--color-primary) transition cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            <PencilIcon class="w-4 h-4" />
                        </button>

                        <button @click="handleToggleActive(account)" :disabled="paymentStore.loading"
                            :title="account.is_active ? 'Deactivate Account' : 'Activate Account'"
                            class="p-1.5 rounded-lg border transition flex items-center justify-center select-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed transform active:scale-95 min-w-8.5 min-h-8.5"
                            :class="account.is_active ? 'border-(--color-warning) text-(--color-warning) hover:bg-(--color-warning-soft)' : 'border-(--color-success) text-(--color-success) hover:bg-(--color-success-soft)'">
                            <ArrowsRightLeftIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div class="p-5 space-y-4 flex-1" :class="!account.is_active ? 'opacity-60' : ''">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span
                                class="text-[11px] uppercase tracking-wider text-(--color-muted) block font-medium">Account
                                Name</span>
                            <p class="text-sm font-bold text-(--color-text) uppercase mt-0.5 truncate">{{
                                account.account_name
                            }}</p>
                        </div>
                        <div class="text-right">
                            <span
                                class="text-[11px] uppercase tracking-wider text-(--color-muted) block font-medium">Bank
                                Name</span>
                            <p class="text-sm font-semibold text-(--color-text) mt-0.5">{{
                                getBankName(account.payment_method_id) }}</p>
                        </div>
                    </div>

                    <div>
                        <span
                            class="text-[11px] uppercase tracking-wider text-(--color-muted) block font-medium">Account
                            Number</span>
                        <p class="text-base font-mono font-black text-(--color-text) tracking-wide mt-0.5">{{
                            account.account_number }}</p>
                    </div>

                    <div class="border-t border-(--color-border) pt-3 flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                            <span class="text-[11px] font-medium text-(--color-text) block">Payment QR Code</span>
                            <span class="text-xs text-(--color-muted)">Click QR to view full size</span>
                        </div>
                        <div @click="openQrPreview(account)"
                            class="bg-(--color-surface-soft) p-1.5 rounded-xl border border-slate-200 w-17.5 h-17.5 flex items-center justify-center shadow-sm cursor-zoom-in hover:border-(--color-primary) hover:scale-105 transition duration-200">
                            <img :src="account.qr_image_url || defaultQR" alt="QR"
                                class="max-w-full max-h-full object-contain" />
                        </div>
                    </div>

                    <div
                        class="border-t border-(--color-border)/60 pt-3 flex flex-col gap-1 text-[10px] text-(--color-muted) font-medium">
                        <div class="flex justify-between">
                            <span>Created:</span>
                            <span class="text-(--color-text)/80">{{ formatDate(account.created_at) }}</span>
                        </div>
                        <div class="flex justify-between"
                            v-if="account.updated_at && account.updated_at !== account.created_at">
                            <span>Updated:</span>
                            <span class="text-(--color-primary) font-semibold">{{ formatDate(account.updated_at)
                            }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div v-else
            class="text-center py-12 bg-(--color-surface) rounded-2xl border border-dashed border-(--color-border)">
            <p class="text-(--color-muted) font-medium">No payment accounts found.</p>
        </div>

        <CreatePaymentAccountForm :is-open="isModalOpen" :editData="selectedEditData"
            @close="isModalOpen = false; selectedEditData = null" @saved="paymentStore.fetchAccountDetails()" />

        <AppModal :open="isQrModalOpen" :title="selectedAccountName" panelClass="max-w-md"
            @close="isQrModalOpen = false">
            <div class="flex flex-col items-center justify-center p-4 bg-(--color-surface-soft) rounded-xl shadow-inner border my-2">
                <img :src="selectedQrUrl" alt="Full QR Code" class="w-full max-w-[320px] h-auto object-contain" />
            </div>
            <template #footer>
                <button @click="isQrModalOpen = false"
                    class="px-4 py-2 bg-(--color-surface-soft) border border-(--color-border) text-(--color-text) rounded-xl hover:bg-(--color-surface) text-sm font-bold cursor-pointer">Close
                    Preview</button>
            </template>
        </AppModal>

    </div>
</template>

<style scoped>
.payment-account-container {
    font-family: var(--font-main);
    background-color: var(--color-page);
    color: var(--color-text);
    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header {
    padding-bottom: var(--space-md);
}
</style>