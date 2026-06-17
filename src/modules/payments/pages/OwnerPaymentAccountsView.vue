<script setup>
import { onMounted } from 'vue';
import { useOwnerPaymentStore } from '../store/ownerPayment.store';
import CreatePaymentAccountForm from '../components/CreatePaymentAccountForm.vue';
import { useSidebar } from '@/shared/composables/useSidebar';

const paymentStore = useOwnerPaymentStore();
const { isSidebarOpen } = useSidebar();

onMounted(() => {
    paymentStore.fetchAccountDetails();
});

const handleSavedSuccess = () => {
    paymentStore.fetchAccountDetails();
};
</script>

<template>
    <div class="payment-account-container my-25 space-y-6"  :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
        <div>
            <h2 class="text-2xl font-black text-(--color-text)">Payment Configuration</h2>
            <p class="text-sm text-(--color-muted)">Manage the bank account details where you receive customers' booking
                payments.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <CreatePaymentAccountForm @saved="handleSavedSuccess" />
            </div>

            <div class="bg-(--color-surface) border border-(--color-border) p-6 rounded-2xl h-fit shadow-sm">
                <h3 class="text-sm font-bold text-(--color-muted) uppercase tracking-wider mb-4">Active Account info
                </h3>

                <div v-if="paymentStore.accountInfo" class="space-y-4">
                    <div>
                        <p class="text-xs text-(--color-muted)">Holder Name</p>
                        <p class="text-base font-bold text-(--color-text)">{{ paymentStore.accountInfo.account_name }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-(--color-muted)">Account Number</p>
                        <p class="text-base font-mono font-bold text-(--color-text)">{{
                            paymentStore.accountInfo.account_number }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-(--color-muted) mb-2">Attached QR Code</p>
                        <img :src="paymentStore.accountInfo.qr_image_url" alt="Live QR"
                            class="w-full max-w-200px border rounded-xl bg-white p-2" />
                    </div>
                </div>

                <div v-else class="text-center py-8 text-(--color-muted)">
                    <p class="text-sm">No payment receiving account configured yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.payment-account-container {
    font-family: var(--font-main);
    background-color: var(--color-page);
    color: var(--color-text);
}
</style>