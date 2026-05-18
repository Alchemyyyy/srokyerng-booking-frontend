<template>
  <section
    class="max-w-7xl mx-auto px-4 py-12"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 p-8 md:p-12 lg:flex lg:items-center lg:justify-between"
    >
      <div
        class="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10"
      ></div>
      <div
        class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5"
      ></div>

      <div class="relative z-10 lg:w-2/3">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {{ t("home.cta.ownerTitle") }}
        </h2>
        <p class="mt-4 text-lg text-blue-10/80 text-gray-200">
          {{ t("home.cta.ownerSubtitle") }}
        </p>

        <div class="mt-8 flex flex-wrap gap-4 text-sm font-medium text-white">
          <div
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-2"
          >
            <svg
              class="h-4 w-4 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ feature }}
          </div>
        </div>
      </div>

      <div class="relative z-10 mt-10 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
        <a
          href="#"
          class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-gray-100 shadow-lg"
        >
          {{ t("home.cta.listButton") }}
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });

const features = computed(() => [
  t("home.cta.feature1"),
  t("home.cta.feature2"),
  t("home.cta.feature3"),
  t("home.cta.feature4"),
]);
</script>
