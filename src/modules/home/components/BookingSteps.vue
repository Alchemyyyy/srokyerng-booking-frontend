<template>
  <section
    class="py-20 px-4 transition-colors duration-300 bg-(--color-surface-soft)"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-6xl mx-auto text-center">
      <p
        class="text-(--color-primary) font-bold tracking-widest text-[10px] uppercase mb-3"
      >
        {{ t("home.steps.eyebrow") }}
      </p>
      <h2 class="text-3xl md:text-4xl font-extrabold mb-4 text-(--color-text)">
        {{ t("home.steps.title") }}
      </h2>
      <p class="text-(--color-muted) text-sm mb-16 max-w-lg mx-auto">
        {{ t("home.steps.subtitle") }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div
          class="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-(--color-border) -translate-y-16"
        ></div>

        <div
          v-for="step in steps"
          :key="step.number"
          class="relative z-10 group bg-(--color-surface) p-8 rounded-3xl border border-(--color-border) backdrop-blur-sm"
        >
          <span
            class="absolute top-6 right-8 text-4xl font-black text-(--color-text)/5 group-hover:text-(--color-primary)/20 transition-colors"
          >
            {{ step.number }}
          </span>
          <div
            class="w-14 h-14 bg-(--color-primary-soft) rounded-2xl flex items-center justify-center mb-6 mx-auto text-(--color-primary)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="step.icon"
              />
            </svg>
          </div>
          <h3 class="font-bold text-lg mb-3 text-(--color-text)">
            {{ step.title }}
          </h3>
          <p class="text-(--color-muted) text-sm leading-relaxed">
            {{ step.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t, locale } = useI18n({ useScope: "global" });

const steps = computed(() => [
  {
    number: "01",
    title: t("home.steps.step1.title"),
    desc: t("home.steps.step1.desc"),
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    number: "02",
    title: t("home.steps.step2.title"),
    desc: t("home.steps.step2.desc"),
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    number: "03",
    title: t("home.steps.step3.title"),
    desc: t("home.steps.step3.desc"),
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
]);
</script>
