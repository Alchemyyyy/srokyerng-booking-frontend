<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSocialAuth } from "@/modules/auth/composables/useSocialAuth";

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const roleRef = computed(() => props.role);
const {
  errorMessage,
  facebookErrorMessage,
  googleButtonRef,
  googleErrorMessage,
  handleFacebookLogin,
  isFacebookLoginSupported,
  loadingProvider,
} = useSocialAuth(roleRef);
</script>

<template>
  <div class="auth-social-section">
    <div class="auth-social-divider">
      <span></span>
      <small>{{ t("auth.orContinueWith") }}</small>
      <span></span>
    </div>

    <div class="auth-social-grid" aria-label="Social login options">
      <div ref="googleButtonRef" class="auth-google-button"></div>
      <!-- Facebook login is currently disabled
      <button
        class="auth-facebook-icon-button"
        type="button"
        :disabled="!isFacebookLoginSupported || Boolean(loadingProvider)"
        :title="!isFacebookLoginSupported ? t('auth.facebookLoginRequiresHttps') : ''"
        @click="handleFacebookLogin"
      >
        <i class="bi bi-facebook" aria-hidden="true"></i>
      </button>
      -->
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <p v-if="googleErrorMessage" class="form-field-error">{{ googleErrorMessage }}</p>
    <p v-if="facebookErrorMessage" class="form-field-error">{{ facebookErrorMessage }}</p>
  </div>
</template>
