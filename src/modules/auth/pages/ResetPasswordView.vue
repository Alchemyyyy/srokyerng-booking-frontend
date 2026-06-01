<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import { hasMinPasswordLength } from "@/shared/utils/validators";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const form = reactive({
  password: "",
  confirmPassword: "",
});
const formErrors = reactive({
  password: "",
  confirmPassword: "",
});
const errorMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const token = computed(() => String(route.query.token || ""));
const passwordMeetsLength = computed(() => hasMinPasswordLength(form.password));

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  formErrors.password = "";
  formErrors.confirmPassword = "";

  if (!token.value) {
    errorMessage.value = t("auth.resetTokenMissing");
    return;
  }

  if (!form.password) {
    formErrors.password = t("auth.passwordRequired");
  } else if (!passwordMeetsLength.value) {
    formErrors.password = t("auth.passwordMinLength");
  }

  if (!form.confirmPassword) {
    formErrors.confirmPassword = t("auth.confirmPasswordRequired");
  } else if (form.password !== form.confirmPassword) {
    formErrors.confirmPassword = t("auth.passwordsDoNotMatch");
  }

  if (formErrors.password || formErrors.confirmPassword) {
    return;
  }

  try {
    await authStore.resetPassword({
      token: token.value,
      password: form.password,
    });
    successMessage.value = t("auth.resetPasswordSuccess");
  } catch (error) {
    errorMessage.value = error.message || t("auth.resetPasswordFailed");
  }
};
</script>

<template>
  <AuthShell :title="t('auth.resetPasswordTitle')" :subtitle="t('auth.resetPasswordSubtitle')">
    <form v-if="!successMessage" class="auth-form" novalidate @submit.prevent="submit">
      <label>
        {{ t("auth.newPassword") }}
        <span class="password-field">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
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
        <span
          class="password-requirement"
          :class="{ 'password-requirement--met': passwordMeetsLength }"
        >
          <i :class="passwordMeetsLength ? 'bi bi-check-circle' : 'bi bi-circle'" aria-hidden="true"></i>
          {{ t("auth.passwordRequirementLength") }}
        </span>
      </label>

      <label>
        {{ t("auth.confirmPassword") }}
        <span class="password-field">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
          />
          <button
            type="button"
            :aria-label="showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
          </button>
        </span>
        <span v-if="formErrors.confirmPassword" class="form-field-error">
          {{ formErrors.confirmPassword }}
        </span>
      </label>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <button class="primary-button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? t("auth.resettingPassword") : t("auth.resetPassword") }}
      </button>
    </form>

    <div v-else class="auth-result auth-result--success">
      <i class="bi bi-check-circle" aria-hidden="true"></i>
      <p>{{ successMessage }}</p>
      <RouterLink class="primary-button auth-button-link" :to="{ name: 'public.login' }">
        {{ t("auth.signIn") }}
      </RouterLink>
    </div>

    <p v-if="!successMessage" class="auth-switch">
      <RouterLink :to="{ name: 'public.login' }">{{ t("auth.backToLogin") }}</RouterLink>
    </p>
  </AuthShell>
</template>
