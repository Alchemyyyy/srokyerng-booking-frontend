<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import AuthShell from "@/modules/auth/components/AuthShell.vue";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const status = ref("idle");
const message = ref("");
const token = computed(() => String(route.query.token || ""));

const verifyEmail = async () => {
  if (!token.value) {
    status.value = "error";
    message.value = t("auth.verificationTokenMissing");
    return;
  }

  status.value = "loading";

  try {
    await authStore.verifyEmail({ token: token.value });
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
  <AuthShell :title="t('auth.verifyEmailTitle')" :subtitle="t('auth.verifyEmailSubtitle')">
    <div class="auth-status" :class="`auth-status--${status}`">
      <i v-if="status === 'loading'" class="bi bi-arrow-repeat" aria-hidden="true"></i>
      <i v-else-if="status === 'success'" class="bi bi-check-circle" aria-hidden="true"></i>
      <i v-else class="bi bi-exclamation-circle" aria-hidden="true"></i>
      <span>
        {{ status === "loading" ? t("auth.verifyingEmail") : message }}
      </span>
    </div>

    <div class="auth-actions">
      <button
        v-if="status === 'error' && token"
        class="secondary-button"
        type="button"
        :disabled="authStore.loading"
        @click="verifyEmail"
      >
        {{ t("common.retry") }}
      </button>
      <RouterLink class="primary-button auth-button-link" :to="{ name: 'public.login' }">
        {{ t("auth.backToLogin") }}
      </RouterLink>
    </div>
  </AuthShell>
</template>
