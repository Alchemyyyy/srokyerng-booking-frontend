<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
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
const currentStep = ref(1);

const pastedToken = ref("");
const verifying = ref(false);
const resendCountdown = ref(0);
let timerInterval = null;
let storagePollInterval = null;

const startResendTimer = () => {
  resendCountdown.value = 59;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const resendVerification = async () => {
  if (resendCountdown.value > 0) return;
  errorMessage.value = "";
  successMessage.value = "";
  try {
    await authStore.resendVerificationEmail();
    startResendTimer();
    successMessage.value = t("auth.verificationResent") || "Verification email has been resent.";
    setTimeout(() => {
      successMessage.value = "";
    }, 4000);
  } catch (error) {
    errorMessage.value = error.message || t("auth.verificationResendFailed") || "Could not resend email.";
  }
};

const extractToken = (input) => {
  if (!input) return "";
  try {
    const url = new URL(input);
    const tokenParam = url.searchParams.get("token");
    if (tokenParam) return tokenParam;
  } catch (e) {
    // Treat as raw token
  }
  return input.trim();
};

const verifyTokenManual = async () => {
  const token = extractToken(pastedToken.value);
  if (!token) {
    errorMessage.value = t("auth.verificationTokenMissing") || "Please enter a valid token or link.";
    triggerShake();
    return;
  }

  verifying.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await authStore.verifyEmail({ token });
    currentStep.value = 4; // Welcome Success Step
    successMessage.value = t("auth.verifyEmailSuccess") || "Email verified successfully!";
  } catch (error) {
    errorMessage.value = error.message || t("auth.verifyEmailFailed") || "Verification failed.";
    triggerShake();
  } finally {
    verifying.value = false;
  }
};

const handleStorageChange = (event) => {
  if (
    event.key === `auth_email_verified_${registeredEmail.value}` ||
    event.key === "auth_email_verified_generic"
  ) {
    currentStep.value = 4;
    successMessage.value = t("auth.verifyEmailSuccess") || "Email verified successfully!";
  }
};

onMounted(() => {
  window.addEventListener("storage", handleStorageChange);
  
  // Polling check as fallback
  storagePollInterval = setInterval(() => {
    if (registeredEmail.value) {
      const verifiedKey = `auth_email_verified_${registeredEmail.value}`;
      if (localStorage.getItem(verifiedKey) === "true") {
        currentStep.value = 4;
        successMessage.value = t("auth.verifyEmailSuccess") || "Email verified successfully!";
        localStorage.removeItem(verifiedKey);
      }
    }
  }, 1500);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  clearInterval(timerInterval);
  clearInterval(storagePollInterval);
});

const isEmailValid = computed(() => form.email && isValidEmail(form.email));
const isPhoneValid = computed(() => form.phone && /^[0-9+()\-\s]{7,20}$/.test(form.phone));
const passwordMeetsLength = computed(() => hasMinPasswordLength(form.password));

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
      currentStep.value = 1;
    }
  },
  { immediate: true }
);

const validateStep1 = () => {
  formErrors.full_name = "";
  formErrors.email = "";

  if (!form.full_name) {
    formErrors.full_name = t("auth.fullNameRequired");
  }

  if (!form.email) {
    formErrors.email = t("auth.emailRequired");
  } else if (!isEmailValid.value) {
    formErrors.email = t("auth.emailInvalid");
  }

  return !formErrors.full_name && !formErrors.email;
};

const isShaking = ref(false);
const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
};

const goToStep2 = () => {
  if (validateStep1()) {
    currentStep.value = 2;
  } else {
    triggerShake();
  }
};

const goToStep1 = () => {
  currentStep.value = 1;
};

const validateStep2 = () => {
  formErrors.phone = "";
  formErrors.password = "";
  formErrors.confirmPassword = "";

  if (!form.phone) {
    formErrors.phone = t("auth.phoneRequired");
  } else if (!isPhoneValid.value) {
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

  return !formErrors.phone && !formErrors.password && !formErrors.confirmPassword;
};

const submit = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  registeredEmail.value = "";

  if (!validateStep2()) {
    triggerShake();
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
    
    // Auto-login behind the scenes so the session gets initialized and resending works
    try {
      await authStore.login({
        email: form.email,
        password: form.password,
      });
    } catch (loginErr) {
      console.warn("Auto-login failed:", loginErr);
    }
    
    currentStep.value = 3; // Step 3 Verification page
    successMessage.value = t("auth.registrationSuccess");
    startResendTimer();
  } catch (error) {
    errorMessage.value = error.message || t("auth.registrationFailed");
    triggerShake();
  }
};
</script>

<template>
  <AuthShell :title="pageTitle" :subtitle="pageSubtitle" :brand="brandContent" :role="selectedRole" mode="register">
    
    <div v-if="currentStep < 4" class="auth-progress-bar" aria-hidden="true">
      <div class="auth-progress-step" :class="{ 'auth-progress-step--active': currentStep >= 1 }"></div>
      <div class="auth-progress-step" :class="{ 'auth-progress-step--active': currentStep >= 2 }"></div>
      <div class="auth-progress-step" :class="{ 'auth-progress-step--active': currentStep >= 3 }"></div>
    </div>

    <form v-if="currentStep < 3" class="auth-form" :class="{ 'auth-shake-animation': isShaking }" novalidate @submit.prevent="currentStep === 1 ? goToStep2() : submit()">
      
      <div class="auth-step-container">
        
        <!-- STEP 1: BASICS -->
        <div 
          :class="[
            'auth-step',
            currentStep === 1 ? 'auth-step--active' : '',
            currentStep !== 1 ? 'auth-step--hidden-left' : ''
          ]"
        >
          <div class="auth-floating-group">
            <label for="reg-fullname" class="auth-standard-label">
                {{ t("auth.fullName") }} <span class="auth-required-mark" aria-hidden="true">*</span>
              </label>
              <span class="auth-input-shell">
                <i class="bi bi-person" aria-hidden="true"></i>
              <input
                v-model.trim="form.full_name"
                type="text"
                autocomplete="name"
                id="reg-fullname"
                :placeholder="t('auth.fullNamePlaceholder')"
              />
              
              <i class="bi bi-check auth-validation-icon" :class="{'auth-validation-icon--visible': form.full_name.length > 2}" aria-hidden="true"></i>
            </span>
            <span v-if="formErrors.full_name" class="form-field-error">{{ formErrors.full_name }}</span>
          </div>

          <div class="auth-floating-group">
            <label for="reg-email" class="auth-standard-label">
                {{ t("common.email") }} <span class="auth-required-mark" aria-hidden="true">*</span>
              </label>
              <span class="auth-input-shell">
                <i class="bi bi-envelope" aria-hidden="true"></i>
              <input
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                id="reg-email"
                :placeholder="t('auth.emailPlaceholder')"
              />
              
              <i class="bi bi-check auth-validation-icon" :class="{'auth-validation-icon--visible': isEmailValid}" aria-hidden="true"></i>
            </span>
            <span v-if="formErrors.email" class="form-field-error">{{ formErrors.email }}</span>
          </div>

          <AppButton
            class="auth-submit-button"
            type="button"
            size="lg"
            @click="goToStep2"
            style="margin-top: 16px;"
          >
            {{ t("common.continue") }} <i class="bi bi-arrow-right ml-2"></i>
          </AppButton>
          <AuthSocialLogin :role="selectedRole" style="margin-top: 24px;" />
        </div>

        <!-- STEP 2: SECURITY & CONTACT -->
        <div 
          :class="[
            'auth-step',
            currentStep === 2 ? 'auth-step--active' : '',
            currentStep !== 2 ? 'auth-step--hidden-right' : ''
          ]"
        >
          <button type="button" @click="goToStep1" class="auth-small-link" style="display: flex; align-items: center; gap: 4px; margin-bottom: 16px; justify-self: start; cursor: pointer; background: transparent; border: none; font-family: inherit;">
            <i class="bi bi-arrow-left"></i> {{ t("common.back") }}
          </button>

          <div class="auth-floating-group">
            <label for="reg-phone" class="auth-standard-label">
                {{ t("common.phone") }} <span class="auth-required-mark" aria-hidden="true">*</span>
              </label>
              <span class="auth-input-shell">
                <i class="bi bi-telephone" aria-hidden="true"></i>
              <input
                v-model.trim="form.phone"
                type="tel"
                autocomplete="tel"
                id="reg-phone"
                :placeholder="t('auth.phonePlaceholder')"
              />
              
              <i class="bi bi-check auth-validation-icon" :class="{'auth-validation-icon--visible': isPhoneValid}" aria-hidden="true"></i>
            </span>
            <span v-if="formErrors.phone" class="form-field-error">{{ formErrors.phone }}</span>
          </div>

          <div class="auth-floating-group">
            <label for="reg-password" class="auth-standard-label">
                {{ t("common.password") }} <span class="auth-required-mark" aria-hidden="true">*</span>
              </label>
              <span class="password-field auth-input-shell">
                <i class="bi bi-lock" aria-hidden="true"></i>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                id="reg-password"
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
          </div>

          <div class="auth-floating-group">
            <label for="reg-confirm" class="auth-standard-label">
                {{ t("auth.confirmPassword") }} <span class="auth-required-mark" aria-hidden="true">*</span>
              </label>
              <span class="password-field auth-input-shell">
                <i class="bi bi-lock-fill" aria-hidden="true"></i>
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                id="reg-confirm"
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
          </div>

          <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

          <AppButton
            class="auth-submit-button"
            type="submit"
            size="lg"
            :loading="authStore.loading"
            style="margin-top: 16px;"
          >
            {{ authStore.loading ? t("auth.creating") : t("common.createAccount") }}
          </AppButton>
          </div>
      </div>
    </form>

    <!-- STEP 3: EMAIL VERIFICATION -->
    <div v-if="currentStep === 3" class="auth-result auth-result--success auth-flip-in" :class="{ 'auth-shake-animation': isShaking }">
      <span class="auth-result-icon" style="background: transparent;">
        <svg class="auth-animated-check" viewBox="0 0 24 24" style="animation: none; stroke-dashoffset: 0; opacity: 0.85;">
          <polyline points="22 4 12 14.01 9 11.01" style="stroke: var(--color-primary);"></polyline>
        </svg>
      </span>
      <div class="auth-result-copy">
        <h2>{{ t("auth.verifyEmailTitle") || "Verify email" }}</h2>
        <p>{{ t("auth.verifyEmailSubtitle") || "We have sent a verification link to your email." }}</p>
      </div>

      <div class="auth-waiting-badge">
        <i class="bi bi-arrow-repeat spin-loader"></i>
        <span>Waiting for email verification...</span>
      </div>

      <div class="auth-email-pill">
        <span>{{ t("auth.verificationSentTo") }}</span>
        <strong>{{ registeredEmail }}</strong>
      </div>

      <!-- Manual paste token section -->
      <div class="auth-verification-box">
        <div class="auth-token-paste-group">
          <label for="verification-token" class="auth-standard-label" style="font-size: 0.85rem; justify-content: center;">
            Or paste the link or token from your email:
          </label>
          <div class="auth-token-input-shell">
            <input
              v-model="pastedToken"
              id="verification-token"
              placeholder="Paste token or link here..."
              @keyup.enter="verifyTokenManual"
            />
            <AppButton
              class="auth-token-verify-btn"
              type="button"
              variant="primary"
              :loading="verifying"
              @click="verifyTokenManual"
            >
              Verify
            </AppButton>
          </div>
        </div>
        
        <p v-if="errorMessage" class="form-error" style="margin: 0;">{{ errorMessage }}</p>
        <p v-if="successMessage && successMessage !== t('auth.registrationSuccess')" class="form-success" style="margin: 0; color: var(--auth-success);">{{ successMessage }}</p>

        <div class="auth-resend-countdown">
          <span v-if="resendCountdown > 0">
            Resend email in <strong>{{ resendCountdown }}s</strong>
          </span>
          <button
            v-else
            type="button"
            class="auth-resend-link"
            @click="resendVerification"
            :disabled="authStore.loading"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>

    <!-- STEP 4: SUCCESS CELEBRATION -->
    <div v-if="currentStep === 4" class="auth-result auth-result--success auth-flip-in">
      <span class="auth-result-icon" style="background: transparent;">
        <svg class="auth-animated-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <div class="auth-result-copy">
        <h2>Welcome aboard, {{ form.full_name.split(' ')[0] || form.full_name }}!</h2>
        <p>{{ successMessage }}</p>
      </div>
      <div class="auth-email-pill" style="animation: fade-in-up 0.5s ease 0.4s both;">
        <span>{{ t("auth.emailVerified") || "Email successfully verified." }}</span>
        <strong>{{ registeredEmail }}</strong>
      </div>
      <RouterLink class="primary-button auth-button-link" :to="loginRoute" style="animation: fade-in-up 0.5s ease 0.6s both;">
        {{ t("auth.backToLogin") }}
      </RouterLink>
    </div>

    <p class="auth-switch" v-if="currentStep < 3">
      {{ t("auth.alreadyHaveAccount") }}
      <RouterLink :to="loginRoute">{{ t("auth.signIn") }}</RouterLink>
    </p>
  </AuthShell>
</template>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spin-loader {
  display: inline-block;
  animation: spin 2s infinite linear;
}

.auth-single-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.auth-single-step {
  display: flex;
  flex-direction: column;
}
</style>
