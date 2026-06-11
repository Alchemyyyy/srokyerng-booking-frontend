<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import http from "@/app/api/http";

const router = useRouter();
const route = useRoute();

const payment = ref(null);
const loading = ref(false);
const error = ref(null);

// ✅ correct param name
const paymentId = computed(() => route.params.paymentId);

const goToUpload = () => {
  router.push({
    name: "customer.payment-upload",
    params: { paymentId: paymentId.value },
  });
};

const fetchPayment = async () => {
  try {
    loading.value = true;
    const res = await http.get(`/payments/${paymentId.value}`);
    payment.value = res.data ?? res; // ✅ fixed unwrapping
  } catch (err) {
    error.value = "Failed to load payment";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPayment();
});
</script>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Payment Detail</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <div v-else-if="error" class="text-red-500 mt-2">{{ error }}</div>

    <div v-else-if="payment" class="border rounded p-4 space-y-2">
      <p><strong>Payment ID:</strong> {{ payment.id }}</p>
      <p><strong>Status:</strong> {{ payment.payment_status }}</p>
      <p><strong>Amount:</strong> ${{ payment.amount }}</p>
      <p><strong>Property:</strong> {{ payment.property_name }}</p>
      <p><strong>Room:</strong> {{ payment.room_name }}</p>

      <img
        v-if="payment.receipt_image_url"
        :src="payment.receipt_image_url"
        class="mt-4 rounded"
      />
    </div>

    <button
      v-if="payment"
      class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      @click="goToUpload"
    >
      Upload Payment Proof
    </button>
  </div>
</template>
