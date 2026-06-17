import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ownerPaymentApi } from '../api/ownerPayment.api';

export const useOwnerPaymentStore = defineStore('ownerPayment', () => {
    const loading = ref(false);
    const error = ref(null);
    const accountInfo = ref(null);

    const fetchAccountDetails = async () => {
        loading.value = true;
        try {
            const res = await ownerPaymentApi.getAccountDetails();
            accountInfo.value = res.data?.data || null;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch account info';
        } finally {
            loading.value = false;
        }
    };

    const savePaymentAccount = async (formData) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await ownerPaymentApi.createOrUpdateAccount(formData);
            accountInfo.value = res.data?.data;
            return { success: true, message: res.data?.message || 'Account saved successfully' };
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to save payment account';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        accountInfo,
        fetchAccountDetails,
        savePaymentAccount
    };
});