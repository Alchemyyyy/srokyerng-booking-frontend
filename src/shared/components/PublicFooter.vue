<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });

const currentYear = new Date().getFullYear();

const quickLinks = computed(() => [
  { label: t("nav.properties"), to: { name: "public.properties" } },
  { label: t("nav.about"), to: { name: "public.about" } },
  { label: t("nav.contact"), to: { name: "public.contact" } },
]);

const legalLinks = computed(() => [
  { label: t("footer.privacyPolicy"), to: { name: "public.privacy" } },
  { label: t("footer.termsOfService"), to: { name: "public.terms" } },
]);

const contactInfo = computed(() => [
  {
    label: t("footer.address"),
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  },
  {
    label: t("footer.email"),
    href: "mailto:info@srokyerng.com",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 mt-0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  },
  {
    label: t("footer.phone"),
    href: "tel:+85512345678",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.59 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  },
]);

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  },
  {
    label: "Telegram",
    href: "https://t.me",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>`,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`,
  },
];
</script>

<template>
  <footer class="border-t border-white/10 bg-(--color-surface)">
    <!-- Main Footer -->
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <RouterLink
            :to="{ name: 'public.properties' }"
            class="inline-flex items-center gap-3 transition hover:opacity-80"
          >
            <img
              src="@/assets/images/logos/logo.png"
              alt="Srokyerng Booking"
              class="h-14 w-auto object-contain"
            />
          </RouterLink>
          <p class="mt-4 text-sm leading-relaxed text-(--color-muted)">
            {{ t("footer.tagline") }}
          </p>
          <!-- Social Links -->
          <div class="mt-5 flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-muted) transition hover:border-(--color-primary) hover:text-(--color-primary)"
              v-html="social.icon"
            />
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3
            class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary)"
          >
            {{ t("footer.explore") }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-sm text-(--color-muted) transition hover:text-(--color-primary)"
              >
                {{ t(link.label) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Legal Links -->
        <div>
          <h3
            class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary)"
          >
            {{ t("footer.legal") }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in legalLinks" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-sm text-(--color-muted) transition hover:text-(--color-primary)"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3
            class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary)"
          >
            {{ t("footer.contact") }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in contactInfo"
              :key="item.label"
              class="flex items-start gap-2 text-sm text-(--color-muted)"
            >
              <span v-html="item.icon" />
              <a
                v-if="item.href"
                :href="item.href"
                class="transition hover:text-(--color-primary)"
              >
                {{ item.label }}
              </a>
              <span v-else>{{ item.label }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-(--color-border)">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8"
      >
        <p class="text-xs text-(--color-muted)">
          © {{ currentYear }} {{ t("app.name") }}. {{ t("footer.rights") }}
        </p>
        <p class="text-xs text-(--color-muted)">
          {{ t("footer.madeWith") }}
        </p>
      </div>
    </div>
  </footer>
</template>
