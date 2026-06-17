<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import AuthSocialLogin from "@/modules/auth/components/AuthSocialLogin.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { ROLES } from "@/shared/constants/roles";
import { getPostLoginRoute } from "@/modules/auth/utils/authRedirect";
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

const selectedLoginRole = computed(() => {
  if (route.name === "public.loginOwner") {
    return ROLES.OWNER;
  }

  if (route.name === "public.loginAdmin") {
    return ROLES.ADMIN;
  }

  return ROLES.CUSTOMER;
});

const isAdminLogin = computed(() => selectedLoginRole.value === ROLES.ADMIN);

const pageTitle = computed(() => {
  if (selectedLoginRole.value === ROLES.CUSTOMER) {
    return t("auth.customerLoginTitle");
  }

  if (selectedLoginRole.value === ROLES.OWNER) {
    return t("auth.ownerLoginTitle");
  }

  if (selectedLoginRole.value === ROLES.ADMIN) {
    return t("auth.adminLoginTitle");
  }

  return t("auth.loginGatewayTitle");
});

const pageSubtitle = computed(() => {
  if (selectedLoginRole.value === ROLES.CUSTOMER) {
    return t("auth.customerLoginSubtitle");
  }

  if (selectedLoginRole.value === ROLES.OWNER) {
    return t("auth.ownerLoginSubtitle");
  }

  if (selectedLoginRole.value === ROLES.ADMIN) {
    return t("auth.adminLoginSubtitle");
  }

  return t("auth.loginGatewaySubtitle");
});

const registerRoute = computed(() => {
  if (selectedLoginRole.value === ROLES.OWNER) {
    return { name: "public.registerOwner" };
  }

  return { name: "public.registerCustomer" };
});

const brandContent = computed(() => {
  if (selectedLoginRole.value === ROLES.ADMIN) {
    return {
      eyebrow: "auth.adminBrandEyebrow",
      title: "auth.adminBrandTitle",
      subtitle: "auth.adminBrandSubtitle",
      proofs: [
        { icon: "bi-shield-check", label: "auth.adminBrandProofApprovals" },
        { icon: "bi-speedometer2", label: "auth.adminBrandProofOperations" },
        { icon: "bi-people", label: "auth.adminBrandProofUsers" },
      ],
    };
  }

  if (selectedLoginRole.value === ROLES.OWNER) {
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

const roleMismatchMessage = computed(() => {
  if (selectedLoginRole.value === ROLES.CUSTOMER) {
    return t("auth.customerLoginRoleMismatch");
  }

  if (selectedLoginRole.value === ROLES.OWNER) {
    return t("auth.ownerLoginRoleMismatch");
  }

  if (selectedLoginRole.value === ROLES.ADMIN) {
    return t("auth.adminLoginRoleMismatch");
  }

  return t("auth.invalidCredentials");
});

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

    if (selectedLoginRole.value && user?.role !== selectedLoginRole.value) {
      await authStore.logout();
      errorMessage.value = roleMismatchMessage.value;
      return;
    }

    await router.push(getPostLoginRoute(user, route.query.redirect));
  } catch (error) {
    errorMessage.value = error.message || t("auth.invalidCredentials");
  }
};
</script>

<template>
  <AuthShell :title="pageTitle" :subtitle="pageSubtitle" :brand="brandContent">
    <form class="auth-form" novalidate @submit.prevent="submit">
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
          {{ t("common.password") }} <span class="auth-required-mark" aria-hidden="true">*</span>
        </span>
        <span class="password-field auth-input-shell">
          <i class="bi bi-lock" aria-hidden="true"></i>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
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

      <RouterLink class="auth-small-link" :to="{ name: 'public.forgotPassword' }">
        {{ t("auth.forgotPassword") }}
      </RouterLink>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <AppButton
        class="auth-submit-button"
        type="submit"
        size="lg"
        :loading="authStore.loading"
      >
        {{ authStore.loading ? t("auth.signingIn") : t("auth.signIn") }}
      </AppButton>

      <AuthSocialLogin v-if="!isAdminLogin" :role="selectedLoginRole" />
    </form>

    <p v-if="!isAdminLogin" class="auth-switch">
      {{ t("auth.newHere") }}
      <RouterLink :to="registerRoute">
        {{ t("common.createAccount") }}
      </RouterLink>
    </p>
  </AuthShell>
</template>
