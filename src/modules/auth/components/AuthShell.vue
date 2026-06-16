<script setup>
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";
import logoUrl from "@/assets/images/logos/logo.png";
import authHeroUrl from "@/assets/images/about/hero/hero_section.png";
import "@/modules/auth/styles/auth.css";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  brand: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();

const fallbackBrand = {
  eyebrow: "auth.secureAccess",
  title: "auth.secureAccessTitle",
  subtitle: "auth.secureAccessSubtitle",
  proofs: [
    { icon: "bi-calendar-check", label: "auth.customerBookings" },
    { icon: "bi-house-check", label: "auth.ownerTools" },
    { icon: "bi-shield-lock", label: "auth.protectedSessions" },
  ],
};

const getBrandValue = (key) => props.brand[key] || fallbackBrand[key];
const getBrandProofs = () => props.brand.proofs || fallbackBrand.proofs;
</script>

<template>
  <main class="auth-page">
    <div class="auth-toolbar">
      <ThemeToggle />
      <LanguageToggle />
    </div>

    <div class="auth-shell">
      <section class="auth-brand">
        <img class="auth-brand-image" :src="authHeroUrl" alt="" aria-hidden="true" />

        <RouterLink class="auth-logo-lockup" :to="{ name: 'public.home' }" :aria-label="t('app.name')">
          <span class="auth-logo-link">
            <img :src="logoUrl" :alt="t('app.name')" />
          </span>
          <span>
            <strong>SrokYerng</strong>
            <small>Booking</small>
          </span>
        </RouterLink>

        <div class="auth-brand-copy">
          <p class="eyebrow">{{ t(getBrandValue("eyebrow")) }}</p>
          <h2>{{ t(getBrandValue("title")) }}</h2>
          <p>{{ t(getBrandValue("subtitle")) }}</p>
        </div>

        <ul class="auth-proof-list">
          <li v-for="proof in getBrandProofs()" :key="proof.label">
            <i class="bi" :class="proof.icon" aria-hidden="true"></i>
            <span>{{ t(proof.label) }}</span>
          </li>
        </ul>

        <div class="auth-brand-strip" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      <section class="auth-panel">
        <RouterLink class="auth-back-link" :to="{ name: 'public.home' }">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          {{ t("auth.backToHome") }}
        </RouterLink>

        <p class="eyebrow">{{ t("app.name") }}</p>
        <h1>{{ title }}</h1>
        <p class="muted">{{ subtitle }}</p>

        <slot />
      </section>
    </div>
  </main>
</template>
