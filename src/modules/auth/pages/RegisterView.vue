<script setup>
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";

const router = useRouter();
const authStore = useAuthStore();
const form = reactive({
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
});
const errorMessage = ref("");

const submit = async () => {
  errorMessage.value = "";

  try {
    await authStore.register(form);
    await router.push({ name: "public.login" });
  } catch (error) {
    errorMessage.value = error.message || "Registration failed";
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel">
      <p class="eyebrow">SrokYerng Booking</p>
      <h1>Create account</h1>
      <p class="muted">Join as a customer or property owner.</p>

      <form class="auth-form" @submit.prevent="submit">
        <label>
          Full name
          <input v-model.trim="form.full_name" type="text" autocomplete="name" required />
        </label>

        <label>
          Email
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          Phone
          <input v-model.trim="form.phone" type="tel" autocomplete="tel" />
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <label>
          Account type
          <select v-model="form.role">
            <option value="customer">Customer</option>
            <option value="owner">Property owner</option>
          </select>
        </label>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? "Creating..." : "Create account" }}
        </button>
      </form>

      <p class="auth-switch">
        Already have an account?
        <RouterLink :to="{ name: 'public.login' }">Sign in</RouterLink>
      </p>
    </section>
  </main>
</template>
