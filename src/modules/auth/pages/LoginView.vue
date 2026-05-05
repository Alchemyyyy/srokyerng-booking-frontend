<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const form = reactive({
  email: "",
  password: "",
});
const errorMessage = ref("");

const submit = async () => {
  errorMessage.value = "";

  try {
    await authStore.login(form);
    await router.push(route.query.redirect || { name: "public.properties" });
  } catch (error) {
    errorMessage.value = error.message || "Invalid email or password";
  }
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel">
      <p class="eyebrow">SrokYerng Booking</p>
      <h1>Welcome back</h1>
      <p class="muted">Sign in to manage bookings, properties, and payments.</p>

      <form class="auth-form" @submit.prevent="submit">
        <label>
          Email
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? "Signing in..." : "Sign in" }}
        </button>
      </form>

      <p class="auth-switch">
        New here?
        <RouterLink :to="{ name: 'public.register' }">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
