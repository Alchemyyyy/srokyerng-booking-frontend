<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import AppButton from "@/shared/components/AppButton.vue";
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
const confirmPasswordMatches = computed(() => form.confirmPassword && form.password === form.confirmPassword);

const passwordStrength = computed(() => {
  if (!form.password) return '';
  let score = 0;
  if (form.password.length > 5) score++;
  if (form.password.length >= 8) score++;
  if (/[A-Z]/.test(form.password)) score++;
  if (/[0-9]/.test(form.password)) score++;
  if (/[^A-Za-z0-9]/.test(form.password)) score++;

  if (score < 3) return 'weak';
  if (score < 5) return 'fair';
  return 'strong';
});

const isShaking = ref(false);
const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
};

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  formErrors.password = "";
  formErrors.confirmPassword = "";

  if (!token.value) {
    errorMessage.value = t("auth.resetTokenMissing");
    triggerShake();
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
    triggerShake();
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
    triggerShake();
  }
};
</script>

<template>
  <AuthShell :title="t('auth.resetPasswordTitle')" :subtitle="t('auth.resetPasswordSubtitle')" mode="reset-password">
    <form v-if="!successMessage" class="auth-form" :class="{ 'auth-shake-animation': isShaking }" novalidate @submit.prevent="submit">
      <div class="auth-floating-group">
        <label for="reset-password" class="auth-standard-label">
          {{ t("auth.newPassword") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </label>
        <span class="password-field auth-input-shell">
          <i class="bi bi-lock" aria-hidden="true"></i>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            id="reset-password"
            :placeholder="t('auth.newPasswordPlaceholder')"
          />
          <button
            type="button"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
          </button>
        </span>
        
        <div v-if="form.password" class="auth-strength-meter" :class="'auth-strength--' + passwordStrength" aria-hidden="true">
          <div class="auth-strength-segment"></div>
          <div class="auth-strength-segment"></div>
          <div class="auth-strength-segment"></div>
        </div>

        <div v-if="form.password" class="auth-password-feedback">
          <span class="auth-strength-text">
            {{ t('auth.passwordStrength') }}: 
            <strong :class="'strength-text--' + passwordStrength">
              {{ t('auth.passwordStrength' + passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)) }}
            </strong>
          </span>
        </div>

        <div class="auth-password-hint">
          {{ t("auth.passwordHint") }}
        </div>

        <span v-if="formErrors.password" class="form-field-error">{{ formErrors.password }}</span>
        <span
          class="password-requirement"
          :class="{ 'password-requirement--met': passwordMeetsLength }"
        >
          <i :class="passwordMeetsLength ? 'bi bi-check-circle' : 'bi bi-circle'" aria-hidden="true"></i>
          {{ t("auth.passwordRequirementLength") }}
        </span>
      </div>

      <div class="auth-floating-group">
        <label for="reset-confirm" class="auth-standard-label">
          {{ t("auth.confirmPassword") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </label>
        <span class="password-field auth-input-shell">
          <i class="bi bi-lock-fill" aria-hidden="true"></i>
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            id="reset-confirm"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
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
      </div>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <AppButton
        class="auth-submit-button"
        type="submit"
        size="lg"
        :loading="authStore.loading"
      >
        {{ authStore.loading ? t("auth.resettingPassword") : t("auth.resetPassword") }}
      </AppButton>
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
