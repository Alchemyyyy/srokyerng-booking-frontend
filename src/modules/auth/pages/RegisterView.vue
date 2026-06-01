<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
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
  role: "customer",
});
const formErrors = reactive({
  full_name: "",
  email: "",
  password: "",
});
const errorMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const passwordMeetsLength = computed(() => hasMinPasswordLength(form.password));
const selectedRole = computed(() => {
  if (route.name === "public.registerCustomer") {
    return ROLES.CUSTOMER;
  }

  if (route.name === "public.registerOwner") {
    return ROLES.OWNER;
  }

  return "";
});
const roleLabel = computed(() => (selectedRole.value === ROLES.OWNER ? t("auth.owner") : t("auth.customer")));
const pageTitle = computed(() => {
  if (selectedRole.value === ROLES.CUSTOMER) {
    return t("auth.customerRegisterTitle");
  }

  if (selectedRole.value === ROLES.OWNER) {
    return t("auth.ownerRegisterTitle");
  }

  return t("auth.createAccountTitle");
});
const pageSubtitle = computed(() => {
  if (selectedRole.value === ROLES.CUSTOMER) {
    return t("auth.customerRegisterSubtitle");
  }

  if (selectedRole.value === ROLES.OWNER) {
    return t("auth.ownerRegisterSubtitle");
  }

  return t("auth.chooseAccountTypeSubtitle");
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
  formErrors.password = "";

  if (!form.full_name) {
    formErrors.full_name = t("auth.fullNameRequired");
  }

  if (!form.email) {
    formErrors.email = t("auth.emailRequired");
  } else if (!isValidEmail(form.email)) {
    formErrors.email = t("auth.emailInvalid");
  }

  if (!form.password) {
    formErrors.password = t("auth.passwordRequired");
  } else if (!passwordMeetsLength.value) {
    formErrors.password = t("auth.passwordMinLength");
  }

  return !formErrors.full_name && !formErrors.email && !formErrors.password;
};

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateForm()) {
    return;
  }

  try {
    await authStore.register(form);
    successMessage.value = t("auth.registrationSuccess");
  } catch (error) {
    errorMessage.value = error.message || t("auth.registrationFailed");
  }
};
</script>

<template>
  <AuthShell :title="pageTitle" :subtitle="pageSubtitle">
    <div v-if="!selectedRole" class="auth-role-grid">
      <RouterLink class="auth-role-card" :to="{ name: 'public.registerCustomer' }">
        <i class="bi bi-suitcase2" aria-hidden="true"></i>
        <span>
          <strong>{{ t("auth.customerEntryTitle") }}</strong>
          <small>{{ t("auth.customerEntrySubtitle") }}</small>
        </span>
      </RouterLink>

      <RouterLink class="auth-role-card" :to="{ name: 'public.registerOwner' }">
        <i class="bi bi-house-door" aria-hidden="true"></i>
        <span>
          <strong>{{ t("auth.ownerEntryTitle") }}</strong>
          <small>{{ t("auth.ownerEntrySubtitle") }}</small>
        </span>
      </RouterLink>
    </div>

    <form v-else-if="!successMessage" class="auth-form" novalidate @submit.prevent="submit">
      <div class="auth-role-pill">
        <span>{{ t("auth.accountType") }}: {{ roleLabel }}</span>
        <RouterLink :to="{ name: 'public.register' }">{{ t("auth.changeAccountType") }}</RouterLink>
      </div>

      <label>
        {{ t("auth.fullName") }}
        <input v-model.trim="form.full_name" type="text" autocomplete="name" />
        <span v-if="formErrors.full_name" class="form-field-error">{{ formErrors.full_name }}</span>
      </label>

      <label>
        {{ t("common.email") }}
        <input v-model.trim="form.email" type="email" autocomplete="email" />
        <span v-if="formErrors.email" class="form-field-error">{{ formErrors.email }}</span>
      </label>

      <label>
        {{ t("common.phone") }}
        <input v-model.trim="form.phone" type="tel" autocomplete="tel" />
      </label>

      <label>
        {{ t("common.password") }}
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

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <button class="primary-button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? t("auth.creating") : t("common.createAccount") }}
      </button>
    </form>

    <div v-else class="auth-result auth-result--success">
      <i class="bi bi-envelope-check" aria-hidden="true"></i>
      <p>{{ successMessage }}</p>
      <RouterLink class="primary-button auth-button-link" :to="{ name: 'public.login' }">
        {{ t("auth.signIn") }}
      </RouterLink>
    </div>

    <p class="auth-switch">
      {{ t("auth.alreadyHaveAccount") }}
      <RouterLink :to="{ name: 'public.login' }">{{ t("auth.signIn") }}</RouterLink>
    </p>
  </AuthShell>
</template>
