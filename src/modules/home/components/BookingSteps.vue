<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";

const { t, locale } = useI18n({ useScope: "global" });

const steps = computed(() => [
  {
    number: "01",
    title: t("home.steps.step1.title"),
    desc: t("home.steps.step1.desc"),
    icon: MagnifyingGlassIcon,
  },
  {
    number: "02",
    title: t("home.steps.step2.title"),
    desc: t("home.steps.step2.desc"),
    icon: MapPinIcon,
  },
  {
    number: "03",
    title: t("home.steps.step3.title"),
    desc: t("home.steps.step3.desc"),
    icon: ShieldCheckIcon,
  },
]);
</script>

<template>
  <section
    class="w-full bg-(--color-surface-soft) py-20 px-6 border-b border-(--color-border)/30"
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
            <component :is="step.icon" class="h-7 w-7" />
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
