<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import AuthSocialLogin from "@/modules/auth/components/AuthSocialLogin.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { ROLES } from "@/shared/constants/roles";
import { hasMinPasswordLength, isValidEmail } from "@/shared/utils/validators";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const form = reactive({
  full_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "customer",
});
const formErrors = reactive({
  full_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});
const errorMessage = ref("");
const successMessage = ref("");
const registeredEmail = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordMeetsLength = computed(() => hasMinPasswordLength(form.password));

const selectedRole = computed(() => {
  if (route.name === "public.registerOwner") {
    return ROLES.OWNER;
  }

  return ROLES.CUSTOMER;
});
const loginRoute = computed(() => {
  if (selectedRole.value === ROLES.OWNER) {
    return { name: "public.loginOwner" };
  }

  if (selectedRole.value === ROLES.CUSTOMER) {
    return { name: "public.loginCustomer" };
  }

  return { name: "public.loginCustomer" };
});
const brandContent = computed(() => {
  if (selectedRole.value === ROLES.OWNER) {
    return {
      eyebrow: "auth.ownerBrandEyebrow",
      title: "auth.ownerBrandTitle",
      subtitle: "auth.ownerBrandSubtitle",
      proofs: [
        { icon: "bi-building-check", label: "auth.ownerBrandProofListings" },
        { icon: "bi-calendar-range", label: "auth.ownerBrandProofReservations" },
        { icon: "bi-chat-dots", label: "auth.ownerBrandProofGuests" },
      ],
    };
  }

  return {
    eyebrow: "auth.customerBrandEyebrow",
    title: "auth.customerBrandTitle",
    subtitle: "auth.customerBrandSubtitle",
    proofs: [
      { icon: "bi-calendar-check", label: "auth.customerBrandProofVerified" },
      { icon: "bi-suitcase2", label: "auth.customerBrandProofBookings" },
      { icon: "bi-shield-lock", label: "auth.customerBrandProofSecure" },
    ],
  };
});
const pageTitle = computed(() => {
  if (selectedRole.value === ROLES.CUSTOMER) {
    return t("auth.customerRegisterTitle");
  }

  if (selectedRole.value === ROLES.OWNER) {
    return t("auth.ownerRegisterTitle");
  }

  return t("auth.customerRegisterTitle");
});
const pageSubtitle = computed(() => {
  if (selectedRole.value === ROLES.CUSTOMER) {
    return t("auth.customerRegisterSubtitle");
  }

  if (selectedRole.value === ROLES.OWNER) {
    return t("auth.ownerRegisterSubtitle");
  }

  return t("auth.customerRegisterSubtitle");
});

watch(
  selectedRole,
  (role) => {
    if (role) {
      form.role = role;
      errorMessage.value = "";
      successMessage.value = "";
    }
  },
  { immediate: true }
);

const validateForm = () => {
  formErrors.full_name = "";
  formErrors.email = "";
  formErrors.phone = "";
  formErrors.password = "";
  formErrors.confirmPassword = "";

  if (!form.full_name) {
    formErrors.full_name = t("auth.fullNameRequired");
  }

  if (!form.email) {
    formErrors.email = t("auth.emailRequired");
  } else if (!isValidEmail(form.email)) {
    formErrors.email = t("auth.emailInvalid");
  }

  if (!form.phone) {
    formErrors.phone = t("auth.phoneRequired");
  } else if (!/^[0-9+()\-\s]{7,20}$/.test(form.phone)) {
    formErrors.phone = t("auth.phoneInvalid");
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

  return (
    !formErrors.full_name &&
    !formErrors.email &&
    !formErrors.phone &&
    !formErrors.password &&
    !formErrors.confirmPassword
  );
};

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  registeredEmail.value = "";

  if (!validateForm()) {
    return;
  }

  try {
    await authStore.register({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
    });
    registeredEmail.value = form.email;
    successMessage.value = t("auth.registrationSuccess");
  } catch (error) {
    errorMessage.value = error.message || t("auth.registrationFailed");
  }
};
</script>

<template>
  <AuthShell :title="pageTitle" :subtitle="pageSubtitle" :brand="brandContent">
    <form v-if="!successMessage" class="auth-form" novalidate @submit.prevent="submit">
      <label>
        <span class="auth-field-label">
          {{ t("auth.fullName") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="auth-input-shell">
          <i class="bi bi-person" aria-hidden="true"></i>
          <input
            v-model.trim="form.full_name"
            type="text"
            autocomplete="name"
            :placeholder="t('auth.fullNamePlaceholder')"
          />
        </span>
        <span v-if="formErrors.full_name" class="form-field-error">{{ formErrors.full_name }}</span>
      </label>

      <label>
        <span class="auth-field-label">
          {{ t("common.email") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="auth-input-shell">
          <i class="bi bi-envelope" aria-hidden="true"></i>
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
          />
        </span>
        <span v-if="formErrors.email" class="form-field-error">{{ formErrors.email }}</span>
      </label>

      <label>
        <span class="auth-field-label">
          {{ t("common.phone") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="auth-input-shell">
          <i class="bi bi-telephone" aria-hidden="true"></i>
          <input
            v-model.trim="form.phone"
            type="tel"
            autocomplete="tel"
            :placeholder="t('auth.phonePlaceholder')"
          />
        </span>
        <span v-if="formErrors.phone" class="form-field-error">{{ formErrors.phone }}</span>
      </label>

      <label>
        <span class="auth-field-label">
          {{ t("common.password") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="password-field auth-input-shell">
          <i class="bi bi-lock" aria-hidden="true"></i>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            :placeholder="t('auth.passwordPlaceholder')"
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

      <label>
        <span class="auth-field-label">
          {{ t("auth.confirmPassword") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="password-field auth-input-shell">
          <i class="bi bi-lock-fill" aria-hidden="true"></i>
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
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
        <span
          class="password-requirement"
          :class="{ 'password-requirement--met': passwordMeetsLength }"
        >
          <i :class="passwordMeetsLength ? 'bi bi-check-circle' : 'bi bi-circle'" aria-hidden="true"></i>
          {{ t("auth.passwordRequirementLength") }}
        </span>
      </label>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <AppButton
        class="auth-submit-button"
        type="submit"
        size="lg"
        :loading="authStore.loading"
      >
        {{ authStore.loading ? t("auth.creating") : t("common.createAccount") }}
      </AppButton>

      <AuthSocialLogin :role="selectedRole" />
    </form>

    <div v-else class="auth-result auth-result--success">
      <span class="auth-result-icon">
        <i class="bi bi-envelope-check" aria-hidden="true"></i>
      </span>
      <div class="auth-result-copy">
        <h2>{{ t("auth.registrationVerifyTitle") }}</h2>
        <p>{{ successMessage }}</p>
      </div>
      <div class="auth-email-pill">
        <span>{{ t("auth.verificationSentTo") }}</span>
        <strong>{{ registeredEmail }}</strong>
      </div>
      <RouterLink class="primary-button auth-button-link" :to="loginRoute">
        {{ t("auth.backToLogin") }}
      </RouterLink>
    </div>

    <p class="auth-switch">
      {{ t("auth.alreadyHaveAccount") }}
      <RouterLink :to="loginRoute">{{ t("auth.signIn") }}</RouterLink>
    </p>
  </AuthShell>
</template>
