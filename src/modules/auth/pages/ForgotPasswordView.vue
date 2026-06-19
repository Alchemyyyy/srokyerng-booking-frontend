<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { isValidEmail } from "@/shared/utils/validators";

const { t } = useI18n();
const authStore = useAuthStore();
const form = reactive({
  email: "",
});
const formErrors = reactive({
  email: "",
});
const errorMessage = ref("");
const successMessage = ref("");

const isEmailValid = computed(() => form.email && isValidEmail(form.email));

const isShaking = ref(false);
const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
};

const validateForm = () => {
  formErrors.email = "";

  if (!form.email) {
    formErrors.email = t("auth.emailRequired");
  } else if (!isValidEmail(form.email)) {
    formErrors.email = t("auth.emailInvalid");
  }

  return !formErrors.email;
};

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateForm()) {
    triggerShake();
    return;
  }

  try {
    await authStore.forgotPassword(form);
    successMessage.value = t("auth.forgotPasswordSuccess");
  } catch (error) {
    errorMessage.value = error.message || t("auth.forgotPasswordFailed");
    triggerShake();
  }
};
</script>

<template>
  <AuthShell :title="t('auth.forgotPasswordTitle')" :subtitle="t('auth.forgotPasswordSubtitle')" mode="forgot-password">
    <form v-if="!successMessage" class="auth-form" :class="{ 'auth-shake-animation': isShaking }" novalidate @submit.prevent="submit">
      <div class="auth-floating-group">
        <label for="forgot-email" class="auth-standard-label">
          {{ t("common.email") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </label>
        <span class="auth-input-shell">
          <i class="bi bi-envelope" aria-hidden="true"></i>
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            id="forgot-email"
            :placeholder="t('auth.emailPlaceholder')"
          />
          <i class="bi bi-check auth-validation-icon" :class="{'auth-validation-icon--visible': isEmailValid}" aria-hidden="true"></i>
        </span>
        <span v-if="formErrors.email" class="form-field-error">{{ formErrors.email }}</span>
      </div>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <AppButton
        class="auth-submit-button"
        type="submit"
        size="lg"
        :loading="authStore.loading"
      >
        {{ authStore.loading ? t("auth.sendingResetLink") : t("auth.sendResetLink") }}
      </AppButton>
    </form>

    <div v-else class="auth-result auth-result--success">
      <i class="bi bi-envelope-check" aria-hidden="true"></i>
      <p>{{ successMessage }}</p>
      <RouterLink class="primary-button auth-button-link" :to="{ name: 'public.login' }">
        {{ t("auth.backToLogin") }}
      </RouterLink>
    </div>

    <p v-if="!successMessage" class="auth-switch">
      <RouterLink :to="{ name: 'public.login' }">{{ t("auth.backToLogin") }}</RouterLink>
    </p>
  </AuthShell>
</template>
