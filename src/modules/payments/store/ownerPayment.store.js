import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ownerPaymentApi } from '../api/ownerPayment.api';

export const useOwnerPaymentStore = defineStore('owner-payment-accounts', () => {
    const loading = ref(false);
    const error = ref(null);
    const paymentAccounts = ref([]);

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const baseUrl = envUrl.replace(/\/api\/?$/, '');
        return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    const fetchAccountDetails = async () => {
        loading.value = true;
        try {
            const res = await ownerPaymentApi.getAccountDetails();
            const rawData = res?.data || res || [];
            const list = Array.isArray(rawData) ? rawData : [rawData];

            paymentAccounts.value = list.map(account => ({
                ...account,
                is_active: account.is_active === true || account.is_active === 1 || account.is_active === 'true',
                qr_image_url: getFullImageUrl(account.qr_image || account.qr_image_url)
            }));
        } catch (err) {
            error.value = err?.message || 'Failed to fetch payment accounts';
        } finally {
            loading.value = false;
        }
    };

    // 🎯 Action សម្រាប់កែប្រែគណនី (PUT Endpoint)
    const updatePaymentAccount = async (id, formData) => {
        loading.value = true;
        try {
            // បោះ formData (ដែលមានទាំង text និង file រូបភាព) ទៅកាន់ API
            const res = await ownerPaymentApi.updateAccount(id, formData);
            await fetchAccountDetails(); // ទាញយកបញ្ជីថ្មីឡើងវិញ
            return { success: true, message: res?.message || 'Account updated successfully' };
        } catch (err) {
            return { success: false, error: err?.message || 'Failed to update account' };
        } finally {
            loading.value = false;
        }
    };

    const toggleAccountStatus = async (id, currentStatus) => {
        loading.value = true;
        try {
            let res;
            if (currentStatus) {
                // បើបច្ចុប្បន្ន True គឺយើងបិទ (Deactivate)
                res = await ownerPaymentApi.deactivateAccount(id);
            } else {
                // បើបច្ចុប្បន្ន False គឺយើងបើក (Activate)
                res = await ownerPaymentApi.activateAccount(id);
            }
            await fetchAccountDetails(); // Refresh បញ្ជីឡើងវិញ
            return { success: true, message: res?.message || 'Status updated successfully' };
        } catch (err) {
            return { success: false, error: err?.message || 'Failed to update status' };
        } finally {
            loading.value = false;
        }
    };

    const savePaymentAccount = async (formData) => {
        loading.value = true;
        try {
            const res = await ownerPaymentApi.createOrUpdateAccount(formData);
            await fetchAccountDetails();
            return { success: true, message: res?.message || 'Account saved successfully' };
        } catch (err) {
            return { success: false, error: err?.message };
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        paymentAccounts,
        fetchAccountDetails,
        updatePaymentAccount,
        savePaymentAccount,
        toggleAccountStatus,
    };
});