<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const { t } = useI18n();
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
    errorMessage.value = error.message || t("auth.registrationFailed");
  }
};
</script>

<template>
  <main class="auth-page">
    <div class="fixed right-4 top-4 z-10 flex flex-wrap justify-end gap-2">
      <ThemeToggle />
      <LanguageToggle />
    </div>

    <section class="auth-panel">
      <p class="eyebrow">{{ t("app.name") }}</p>
      <h1>{{ t("auth.createAccountTitle") }}</h1>
      <p class="muted">{{ t("auth.joinSubtitle") }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <label>
          {{ t("auth.fullName") }}
          <input v-model.trim="form.full_name" type="text" autocomplete="name" required />
        </label>

        <label>
          {{ t("common.email") }}
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          {{ t("common.phone") }}
          <input v-model.trim="form.phone" type="tel" autocomplete="tel" />
        </label>

        <label>
          {{ t("common.password") }}
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <label>
          {{ t("auth.accountType") }}
          <select v-model="form.role">
            <option value="customer">{{ t("auth.customer") }}</option>
            <option value="owner">{{ t("auth.owner") }}</option>
          </select>
        </label>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? t("auth.creating") : t("common.createAccount") }}
        </button>
      </form>

      <p class="auth-switch">
        {{ t("auth.alreadyHaveAccount") }}
        <RouterLink :to="{ name: 'public.login' }">{{ t("auth.signIn") }}</RouterLink>
      </p>
    </section>
  </main>
</template>
