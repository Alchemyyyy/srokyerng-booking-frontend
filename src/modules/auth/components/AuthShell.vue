<script setup>
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";
import logoUrl from "@/assets/images/logos/SY_logo_no_background.png";
import "@/modules/auth/styles/auth.css";

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
</script>

<template>
  <main class="auth-page">
    <div class="auth-toolbar">
      <ThemeToggle />
      <LanguageToggle />
    </div>

    <div class="auth-shell">
      <section class="auth-brand">
        <RouterLink class="auth-logo-link" :to="{ name: 'public.home' }" :aria-label="t('app.name')">
          <img :src="logoUrl" :alt="t('app.name')" />
        </RouterLink>

        <div class="auth-brand-copy">
          <p class="eyebrow">{{ t("auth.secureAccess") }}</p>
          <h2>{{ t("auth.secureAccessTitle") }}</h2>
          <p>{{ t("auth.secureAccessSubtitle") }}</p>
        </div>

        <ul class="auth-proof-list">
          <li>
            <i class="bi bi-calendar-check" aria-hidden="true"></i>
            <span>{{ t("auth.customerBookings") }}</span>
          </li>
          <li>
            <i class="bi bi-house-check" aria-hidden="true"></i>
            <span>{{ t("auth.ownerTools") }}</span>
          </li>
          <li>
            <i class="bi bi-shield-lock" aria-hidden="true"></i>
            <span>{{ t("auth.protectedSessions") }}</span>
          </li>
        </ul>

        <div class="auth-brand-strip" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      <section class="auth-panel">
        <p class="eyebrow">{{ t("app.name") }}</p>
        <h1>{{ title }}</h1>
        <p class="muted">{{ subtitle }}</p>

        <slot />
      </section>
    </div>
  </main>
</template>
