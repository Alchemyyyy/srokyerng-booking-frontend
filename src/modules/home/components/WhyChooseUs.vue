<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  ShieldCheckIcon,
  StarIcon,
  LifebuoyIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";
import img1 from "@/assets/images/home/whychooseus/img1.png";
import img2 from "@/assets/images/home/whychooseus/img2.png";
import img3 from "@/assets/images/home/whychooseus/img3.png";
import img4 from "@/assets/images/home/whychooseus/img4.png";

const { t, locale } = useI18n({ useScope: "global" });

const features = computed(() => [
  {
    title: t("home.whyUs.features.verified.title"),
    desc: t("home.whyUs.features.verified.desc"),
    icon: ShieldCheckIcon,
  },
  {
    title: t("home.whyUs.features.quality.title"),
    desc: t("home.whyUs.features.quality.desc"),
    icon: StarIcon,
  },
  {
    title: t("home.whyUs.features.support.title"),
    desc: t("home.whyUs.features.support.desc"),
    icon: LifebuoyIcon,
  },
  {
    title: t("home.whyUs.features.price.title"),
    desc: t("home.whyUs.features.price.desc"),
    icon: ArrowTrendingUpIcon,
  },
]);
</script>

<template>
  <section
    class="w-full bg-(--color-surface) py-20 lg:py-28 border-b border-(--color-border)/30"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
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
              <component :is="feature.icon" class="h-5 w-5" />
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
            :src="img1"
            alt="Resort"
            class="rounded-2xl object-cover h-64 w-full"
          />
          <img
            :src="img2"
            alt="Villa"
            class="rounded-2xl object-cover h-48 w-full"
          />
        </div>
        <div class="space-y-4 pt-12">
          <img
            :src="img3"
            alt="Interior"
            class="rounded-2xl object-cover h-48 w-full"
          />
          <img
            :src="img4"
            alt="Angkor Wat"
            class="rounded-2xl object-cover h-64 w-full"
          />
        </div>
      </div>
    </div>
  </section>
</template>
