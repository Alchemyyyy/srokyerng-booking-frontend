<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import { ROLES } from "@/shared/constants/roles";
import { isValidEmail } from "@/shared/utils/validators";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const form = reactive({
  email: "",
  password: "",
});
const formErrors = reactive({
  email: "",
  password: "",
});
const errorMessage = ref("");
const showPassword = ref(false);

const getPostLoginRoute = (user) => {
  if (route.query.redirect) {
    return route.query.redirect;
  }

  const routeByRole = {
    [ROLES.ADMIN]: { name: "admin.dashboard" },
    [ROLES.OWNER]: { name: "owner.dashboard" },
    [ROLES.CUSTOMER]: { name: "public.home" },
  };

  return routeByRole[user?.role] || { name: "public.properties" };
};

const validateForm = () => {
  formErrors.email = "";
  formErrors.password = "";

  if (!form.email) {
    formErrors.email = t("auth.emailRequired");
  } else if (!isValidEmail(form.email)) {
    formErrors.email = t("auth.emailInvalid");
  }

  if (!form.password) {
    formErrors.password = t("auth.passwordRequired");
  }

  return !formErrors.email && !formErrors.password;
};

const submit = async () => {
  errorMessage.value = "";

  if (!validateForm()) {
    return;
  }

  try {
    const user = await authStore.login(form);
    await router.push(getPostLoginRoute(user));
  } catch (error) {
    errorMessage.value = error.message || t("auth.invalidCredentials");
  }
};
</script>

<template>
  <AuthShell :title="t('auth.welcomeBack')" :subtitle="t('auth.loginSubtitle')">
    <form class="auth-form" novalidate @submit.prevent="submit">
      <label>
        {{ t("common.email") }}
        <input v-model.trim="form.email" type="email" autocomplete="email" />
        <span v-if="formErrors.email" class="form-field-error">{{ formErrors.email }}</span>
      </label>

      <label>
        {{ t("common.password") }}
        <span class="password-field">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
          />
          <button
            type="button"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
          </button>
        </span>
        <span v-if="formErrors.password" class="form-field-error">{{ formErrors.password }}</span>
      </label>

      <RouterLink class="auth-small-link" :to="{ name: 'public.forgotPassword' }">
        {{ t("auth.forgotPassword") }}
      </RouterLink>

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
  </AuthShell>
</template>
