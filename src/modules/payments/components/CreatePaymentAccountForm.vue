<script setup>
import { ref, watch } from 'vue';
import { useOwnerPaymentStore } from '../store/ownerPayment.store';
import { useToastStore } from '@/shared/store/toastStore';
import AppModal from '@/shared/components/AppModal.vue';
import { CameraIcon, CheckIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    editData: { type: Object, default: null }
});
const emit = defineEmits(['close', 'saved']);

const paymentStore = useOwnerPaymentStore();
const toastStore = useToastStore();

const paymentMethodId = ref('');
const accountName = ref('');
const accountNumber = ref('');
const qrFile = ref(null);
const qrPreviewUrl = ref(null);

const paymentMethods = [
    { id: 1, name: 'ABA Bank' },
    { id: 2, name: 'Acleda Bank' },
    { id: 3, name: 'Wing Bank' },
];

const resetForm = () => {
    paymentMethodId.value = '';
    accountName.value = '';
    accountNumber.value = '';
    qrFile.value = null;
    qrPreviewUrl.value = null;
};

watch(() => props.editData, (newData) => {
    if (newData) {
        paymentMethodId.value = newData.payment_method_id;
        accountName.value = newData.account_name;
        accountNumber.value = newData.account_number;
        qrPreviewUrl.value = newData.qr_image_url; // បង្ហាញរូបភាពចាស់ពី Backend មុន
        qrFile.value = null; // សម្អាត File ថ្មីសិន
    } else {
        resetForm();
    }
}, { immediate: true });

// ចាប់យក File រូបភាពនៅពេលអ្នកប្រើប្រាស់ជ្រើសរើស (ទាំង Create និង Edit)
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        qrFile.value = file;
        qrPreviewUrl.value = URL.createObjectURL(file); // បង្ហាញរូបភាពថ្មីជំនួសរូបចាស់ភ្លាមៗ
    }
};

const closeModal = () => {
    resetForm();
    emit('close');
};

const submitForm = async () => {
    if (!paymentMethodId.value || !accountName.value || !accountNumber.value) {
        toastStore.danger('Please fill in all required fields.', { title: 'Required Fields' });
        return;
    }

    let result;

    // 🎯 បង្កើត FormData ព្រោះក្នុងលក្ខខណ្ឌនេះ ទាំង Create និង Edit គឺសុទ្ធតែអាចមានរូបភាព QR
    const formData = new FormData();
    formData.append('account_name', accountName.value);
    formData.append('account_number', accountNumber.value);

    // បើមានការរើសរូបភាព QR ថ្មី (ទោះ Create ឬ Edit) គឺបោះចូល FormData ទាំងអស់
    if (qrFile.value) {
        formData.append('qr_image', qrFile.value);
    }

    if (props.editData) {
        // 🎯 ករណី EDIT (PATCH): បោះទៅកាន់ Store រួមជាមួយ ID គណនី
        result = await paymentStore.updatePaymentAccount(props.editData.id, formData);
    } else {
        // ករណី CREATE (POST): ត្រូវទាមទាររូបភាព QR ដាច់ខាត
        if (!qrFile.value) {
            toastStore.danger('Please upload a QR Code image.', { title: 'Required QR' });
            return;
        }
        formData.append('payment_method_id', paymentMethodId.value);
        result = await paymentStore.savePaymentAccount(formData);
    }

    if (result.success) {
        toastStore.success(result.message, { title: 'Success' });
        closeModal();
        emit('saved');
    } else {
        toastStore.danger(result.error, { title: 'Error' });
    }
};
</script>

<template>
    <AppModal :open="isOpen" :title="editData ? 'Update Payment Account' : 'Add Payment Account'" panelClass="max-w-md"
        @close="closeModal">
        <form id="paymentAccountForm" @submit.prevent="submitForm" class="space-y-4 pt-2">

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Select Bank</label>
                <select v-model="paymentMethodId" :disabled="!!editData"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary) disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                    <option value="" disabled selected>-- Choose Bank --</option>
                    <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                        {{ method.name }}
                    </option>
                </select>
                <p v-if="editData" class="text-[11px] text-(--color-muted) mt-1">Bank provider cannot be changed.</p>
            </div>

            <div>
                <label for="paymentAccountName" class="block text-sm font-medium text-(--color-text) mb-1">Account Name</label>
                <input id="paymentAccountName" v-model="accountName" type="text" placeholder="e.g. SOK SAN"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary)" />
            </div>

            <div>
                <label for="paymentAccountNumber" class="block text-sm font-medium text-(--color-text) mb-1">Account Number</label>
                <input id="paymentAccountNumber" v-model="accountNumber" type="text" placeholder="e.g. 000 111 222"
                    class="w-full border border-(--color-border) bg-(--color-input) text-(--color-text) p-2.5 rounded-xl outline-none focus:border-(--color-primary)" />
            </div>

            <div>
                <label class="block text-sm font-medium text-(--color-text) mb-1">Bank QR Code</label>

                <div
                    class="border-2 border-dashed border-(--color-border) rounded-xl p-4 text-center cursor-pointer hover:border-(--color-primary) transition relative bg-(--color-input)/5">
                    <input type="file" accept="image/*" @change="handleFileChange"
                        class="absolute inset-0 opacity-0 cursor-pointer" />

                    <div v-if="!qrPreviewUrl" class="text-(--color-muted) py-4">
                        <div class="flex flex-col items-center gap-2">
                            <CameraIcon class="h-8 w-8 text-(--color-muted)" />
                            <span class="text-sm font-semibold text-(--color-text)">Click to upload images</span>
                            <span class="text-xs text-(--color-muted)">PNG, JPG up to 10MB (multiple allowed)</span>
                        </div>
                    </div>

                    <div v-else class="flex flex-col items-center gap-2">
                        <img :src="qrPreviewUrl" alt="QR Preview"
                            class="w-32 h-32 object-contain border rounded-xl bg-white p-1 shadow-inner" />
                        <span
                            class="inline-flex items-center gap-1 text-xs text-(--color-primary) font-bold bg-(--color-primary)/10 px-2.5 py-1 rounded-lg">
                            <CheckIcon v-if="qrFile" class="h-3.5 w-3.5" />
                            {{ qrFile ? 'New QR Selected' : 'Click to Change QR Image' }}
                        </span>
                    </div>
                </div>
            </div>

        </form>

        <template #footer>
            <button type="button" @click="closeModal"
                class="px-4 py-2 border border-(--color-border) text-(--color-text) rounded-xl hover:bg-(--color-surface-soft) cursor-pointer">Cancel</button>
            <button type="submit" form="paymentAccountForm" :disabled="paymentStore.loading"
                class="px-4 py-2 bg-(--color-primary) text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer">
                <span>{{ paymentStore.loading ? 'Saving...' : (editData ? 'Update Now' : 'Save') }}</span>
            </button>
        </template>
    </AppModal>
</template>