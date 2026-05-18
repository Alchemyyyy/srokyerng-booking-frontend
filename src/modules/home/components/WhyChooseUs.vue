<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });

const features = computed(() => [
  {
    title: t("home.whyUs.features.verified.title"),
    desc: t("home.whyUs.features.verified.desc"),
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: t("home.whyUs.features.quality.title"),
    desc: t("home.whyUs.features.quality.desc"),
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    title: t("home.whyUs.features.support.title"),
    desc: t("home.whyUs.features.support.desc"),
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: t("home.whyUs.features.price.title"),
    desc: t("home.whyUs.features.price.desc"),
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
]);
</script>

<template>
  <section
    class="max-w-7xl mx-auto px-4 py-20 lg:py-28"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
      <div>
        <span
          class="text-xs font-bold uppercase tracking-widest text-(--color-primary)"
        >
          {{ t("home.whyUs.eyebrow") }}
        </span>
        <h2
          class="mt-4 text-4xl font-extrabold text-(--color-text) leading-tight"
        >
          {{ t("home.whyUs.title") }}<br />
          {{ t("home.whyUs.titleHighlight") }}
        </h2>
        <p class="mt-6 text-(--color-muted) leading-relaxed">
          {{ t("home.whyUs.subtitle") }}
        </p>
        <div class="mt-10 space-y-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex gap-4"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="feature.icon"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-md font-bold text-(--color-text)">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-(--color-muted) mt-1">
                {{ feature.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative grid grid-cols-2 gap-4">
        <div class="space-y-4">
          <img
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"
            alt="Resort"
            class="rounded-2xl object-cover h-64 w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=600&q=80"
            alt="Villa"
            class="rounded-2xl object-cover h-48 w-full"
          />
        </div>
        <div class="space-y-4 pt-12">
          <img
            src="https://images.unsplash.com/photo-1555854857-555ce6e56d3a?auto=format&fit=crop&w=600&q=80"
            alt="Interior"
            class="rounded-2xl object-cover h-48 w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1505993597083-3bd19f75e575?auto=format&fit=crop&w=600&q=80"
            alt="Angkor Wat"
            class="rounded-2xl object-cover h-64 w-full"
          />
        </div>
        <div
          class="absolute bottom-10 left-1/4 transform -translate-x-1/2 flex items-center gap-3 rounded-xl bg-(--color-surface) p-4 shadow-xl border border-(--color-border)"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-(--color-text)">
              {{ t("home.whyUs.happyGuests") }}
            </p>
            <div class="flex text-yellow-400 text-xs">
              <span>★★★★★</span>
              <span class="ml-1 text-(--color-muted) font-medium text-[10px]"
                >4.8 avg</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
