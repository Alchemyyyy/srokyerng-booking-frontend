<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import logoUrl from "@/assets/images/logos/logo.png";
import heroSectionImg from "@/assets/images/about/hero/hero_section.png";
import heroBannerImg from "@/assets/images/home/hero/hero_banner.png";
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
  backRoute: {
    type: Object,
    default: () => ({ name: 'public.home' })
  },
  backLabel: {
    type: String,
    default: 'auth.backToHome'
  },
  role: {
    type: String,
    default: "customer",
  },
  mode: {
    type: String,
    default: "login",
  },
  heroImage: {
    type: String,
    default: "",
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

const resolvedHeroImage = computed(() => {
  if (props.heroImage) return props.heroImage;
  
  if (props.role === "owner") {
    return props.mode === "register" ? heroSectionImg : heroBannerImg;
  }
  
  if (props.mode === "register") {
    return heroBannerImg;
  }
  
  return heroSectionImg;
});
</script>

<template>
  <main class="auth-page">
    <!-- Animated background shapes for a premium vibe -->
    <div class="auth-bg-shapes" aria-hidden="true">
      <div class="auth-shape auth-shape-1"></div>
      <div class="auth-shape auth-shape-2"></div>
      <div class="auth-shape auth-shape-3"></div>
      <div class="auth-shape auth-shape-4"></div>
    </div>


    <div class="auth-shell">
      <section class="auth-brand" :class="[`auth-brand--${role}`, `auth-brand--${mode}`]">
        <img class="auth-brand-image" :src="resolvedHeroImage" alt="" aria-hidden="true" />

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
        <RouterLink class="auth-back-link" :to="backRoute">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          {{ t(backLabel) }}
        </RouterLink>

        <p class="eyebrow">{{ t("app.name") }}</p>
        <h1>{{ title }}</h1>
        <p class="muted">{{ subtitle }}</p>

        <slot />
      </section>
    </div>
  </main>
</template>
