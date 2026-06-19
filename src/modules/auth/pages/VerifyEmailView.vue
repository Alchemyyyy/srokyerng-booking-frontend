<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { getProfileRouteByRole } from "@/shared/utils/roleRoutes";
import AuthShell from "@/modules/auth/components/AuthShell.vue";
import AppButton from "@/shared/components/AppButton.vue";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();

const status = ref("idle");
const message = ref("");
const token = computed(() => String(route.query.token || ""));

const verifiedEmail = ref("");
const verifiedName = ref("");
const userRole = ref("customer");

const pageTitle = computed(() => {
  if (status.value === "success") {
    if (userRole.value === "owner") {
      return t("auth.ownerRegisterTitle");
    }
    return t("auth.customerRegisterTitle");
  }
  return t("auth.verifyEmailTitle");
});

const pageSubtitle = computed(() => {
  if (status.value === "success") {
    if (userRole.value === "owner") {
      return t("auth.ownerRegisterSubtitle");
    }
    return t("auth.customerRegisterSubtitle");
  }
  return t("auth.verifyEmailSubtitle");
});

const verifyEmail = async () => {
  if (!token.value) {
    status.value = "error";
    message.value = t("auth.verificationTokenMissing");
    return;
  }

  status.value = "loading";

  try {
    const res = await authStore.verifyEmail({ token: token.value });
    const verifiedUser = res?.data || {};
    verifiedEmail.value = verifiedUser.email || "";
    verifiedName.value = verifiedUser.fullName || "";
    userRole.value = verifiedUser.role || "customer";

    if (authStore.isAuthenticated) {
      await authStore.refreshSession();
    }
    
    // Set localStorage flags for cross-tab communication
    if (verifiedEmail.value) {
      localStorage.setItem(`auth_email_verified_${verifiedEmail.value}`, "true");
    }
    localStorage.setItem("auth_email_verified_generic", Date.now().toString());
    
    status.value = "success";
    message.value = t("auth.verifyEmailSuccess");
  } catch (error) {
    status.value = "error";
    message.value = error.message || t("auth.verifyEmailFailed");
  }
};

onMounted(verifyEmail);
</script>

<template>
  <AuthShell :title="pageTitle" :subtitle="pageSubtitle" :role="userRole" :mode="status === 'success' ? 'register' : 'verify-email'">
    
    <!-- Success UI celebrating email verification success -->
    <div v-if="status === 'success'" class="auth-result auth-result--success auth-flip-in">
      <span class="auth-result-icon" style="background: transparent;">
        <svg class="auth-animated-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <div class="auth-result-copy">
        <h2>
          {{ verifiedName ? `Welcome aboard, ${verifiedName.split(' ')[0]}!` : t("auth.welcomeBack") }}
        </h2>
        <p>{{ message }}</p>
      </div>
      <div class="auth-email-pill" style="animation: fade-in-up 0.5s ease 0.4s both;">
        <span>{{ t("auth.emailVerified") || "Email successfully verified." }}</span>
        <strong>{{ verifiedEmail }}</strong>
      </div>
      
      <RouterLink 
        class="primary-button auth-button-link" 
        :to="userRole === 'owner' ? { name: 'public.loginOwner' } : { name: 'public.loginCustomer' }" 
        style="animation: fade-in-up 0.5s ease 0.6s both; text-align: center;"
      >
        {{ t("auth.backToLogin") }}
      </RouterLink>
    </div>

    <!-- Loading / Error UI -->
    <div v-else class="auth-result auth-flip-in" style="align-items: center; justify-content: center; text-align: center;">
      <div class="auth-status" :class="`auth-status--${status}`">
        <i v-if="status === 'loading'" class="bi bi-arrow-repeat spin-loader" aria-hidden="true"></i>
        <i v-else class="bi bi-exclamation-circle" aria-hidden="true"></i>
        <span>
          {{ status === "loading" ? t("auth.verifyingEmail") : message }}
        </span>
      </div>

      <div class="auth-actions" style="margin-top: 24px; display: flex; width: 100%; gap: 12px; justify-content: center;">
        <AppButton
          v-if="status === 'error' && token"
          variant="secondary"
          type="button"
          :loading="authStore.loading"
          @click="verifyEmail"
          style="flex: 1;"
        >
          {{ t("common.retry") }}
        </AppButton>
        <RouterLink
          class="primary-button auth-button-link"
          :to="{ name: 'public.login' }"
          style="flex: 1; text-align: center;"
        >
          {{ t("auth.backToLogin") }}
        </RouterLink>
      </div>
    </div>

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
</style>
