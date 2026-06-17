<script setup>
import { ref } from 'vue';
import { useOwnerPaymentStore } from '../store/ownerPayment.store';
import { useToastStore } from '@/shared/store/toastStore';

const emit = defineEmits(['saved']);
const paymentStore = useOwnerPaymentStore();
const toastStore = useToastStore();

// Form Fields
const paymentMethodId = ref(''); // 🎯 បន្ថែមសម្រាប់ចាប់យក ID វិធីសាស្ត្រទូទាត់ប្រាក់
const accountName = ref('');
const accountNumber = ref('');
const qrFile = ref(null);
const qrPreviewUrl = ref(null);

// 💡 បញ្ជីវិធីសាស្ត្រទូទាត់ប្រាក់ (បងអាចកែសម្រួល ID ឱ្យត្រូវតាម Database Backend របស់បង)
const paymentMethods = [
    { id: 1, name: 'ABA' },
    { id: 2, name: 'ACLEDA' },
    { id: 3, name: 'Wing' }
];  

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        qrFile.value = file;
        qrPreviewUrl.value = URL.createObjectURL(file);
    }
};

const submitForm = async () => {
    // 🎯 ឆែកលក្ខខណ្ឌត្រូវតែជ្រើសរើស Payment Method ដែរ
    if (!paymentMethodId.value || !accountName.value || !accountNumber.value || !qrFile.value) {
        toastStore.danger('Please fill in all fields, select a payment method, and upload your QR code.', { title: 'Required Fields' });
        return;
    }

    const formData = new FormData();
    formData.append('payment_method_id', paymentMethodId.value); // 🔄 ញាត់ចូល FormData តាម Postman
    formData.append('account_name', accountName.value);
    formData.append('account_number', accountNumber.value);
    formData.append('qr_image', qrFile.value);

    const result = await paymentStore.savePaymentAccount(formData);

    if (result.success) {
        toastStore.success(result.message, { title: 'Success' });
        // លាងសម្អាត Form ក្រោយជោគជ័យ
        paymentMethodId.value = '';
        accountName.value = '';
        accountNumber.value = '';
        qrFile.value = null;
        qrPreviewUrl.value = null;
        emit('saved');
    } else {
        toastStore.danger(result.error, { title: 'Error' });
    }
};
</script>

<template>
    <div class="bg-(--color-surface) border border-(--color-border) p-6 rounded-2xl max-w-lg shadow-sm">
        <h3 class="text-lg font-bold text-(--color-text) mb-4">Setup Payment Receiving Account</h3>

        <form @submit.prevent="submitForm" class="space-y-4">

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Select Payment Method</label>
                <select v-model="paymentMethodId"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary) cursor-pointer">
                    <option value="" disabled selected>-- Choose Bank --</option>
                    <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                        {{ method.name }}
                    </option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Account Name</label>
                <input v-model="accountName" type="text" placeholder="e.g. SOK SAN"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary)" />
            </div>

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Account Number</label>
                <input v-model="accountNumber" type="text" placeholder="e.g. 000 111 222"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary)" />
            </div>

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Upload Bank QR Code</label>
                <div
                    class="border-2 border-dashed border-(--color-border) rounded-xl p-4 text-center cursor-pointer hover:border-(--color-primary) transition relative">
                    <input type="file" accept="image/*" @change="handleFileChange"
                        class="absolute inset-0 opacity-0 cursor-pointer" />

                    <div v-if="!qrPreviewUrl" class="text-(--color-muted) py-4">
                        <p class="text-sm font-medium">Click to upload or drag QR Image here</p>
                        <p class="text-xs mt-1">Supports PNG, JPG (Max 2MB)</p>
                    </div>

                    <div v-else class="flex flex-col items-center gap-2">
                        <img :src="qrPreviewUrl" alt="QR Preview"
                            class="w-40 h-40 object-contain border rounded-lg bg-white p-1" />
                        <span class="text-xs text-(--color-primary) font-medium">Change QR Code</span>
                    </div>
                </div>
            </div>

            <div class="pt-2 flex justify-end gap-3">
                <button type="submit" :disabled="paymentStore.loading"
                    class="px-5 py-2.5 bg-(--color-primary) text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer">
                    <span v-if="paymentStore.loading">Saving...</span>
                    <span v-else>Save Account</span>
                </button>
            </div>
        </form>
    </div>
</template>