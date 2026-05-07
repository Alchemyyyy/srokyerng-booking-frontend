<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const { t } = useI18n();
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
    errorMessage.value = error.message || t("auth.invalidCredentials");
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
      <h1>{{ t("auth.welcomeBack") }}</h1>
      <p class="muted">{{ t("auth.loginSubtitle") }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <label>
          {{ t("common.email") }}
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>

        <label>
          {{ t("common.password") }}
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? t("auth.signingIn") : t("auth.signIn") }}
        </button>
      </form>

      <p class="auth-switch">
        {{ t("auth.newHere") }}
        <RouterLink :to="{ name: 'public.register' }">
          {{ t("common.createAccount") }}
        </RouterLink>
      </p>
    </section>
  </main>
</template>
