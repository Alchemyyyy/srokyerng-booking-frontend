<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
} from "@heroicons/vue/24/outline";
import heroImage from "@/assets/images/about/hero/hero_section.png";

const { t, locale } = useI18n({ useScope: "global" });
const openFaqIndex = ref(0);

const benefits = computed(() => [
  {
    icon: BuildingOffice2Icon,
    title: t("ownerLanding.benefits.listings.title"),
    description: t("ownerLanding.benefits.listings.description"),
  },
  {
    icon: CalendarDaysIcon,
    title: t("ownerLanding.benefits.reservations.title"),
    description: t("ownerLanding.benefits.reservations.description"),
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: t("ownerLanding.benefits.guests.title"),
    description: t("ownerLanding.benefits.guests.description"),
  },
]);

const steps = computed(() => [
  t("ownerLanding.steps.create"),
  t("ownerLanding.steps.verify"),
  t("ownerLanding.steps.publish"),
]);

const stats = computed(() => [
  { value: "5+", label: t("ownerLanding.stats.cities") },
  { value: "24/7", label: t("ownerLanding.stats.access") },
  { value: "0", label: t("ownerLanding.stats.setupFee") },
]);

const faqs = computed(() => [
  {
    question: t("ownerLanding.faq.free.question"),
    answer: t("ownerLanding.faq.free.answer"),
  },
  {
    question: t("ownerLanding.faq.approval.question"),
    answer: t("ownerLanding.faq.approval.answer"),
  },
  {
    question: t("ownerLanding.faq.customerAccount.question"),
    answer: t("ownerLanding.faq.customerAccount.answer"),
  },
  {
    question: t("ownerLanding.faq.manage.question"),
    answer: t("ownerLanding.faq.manage.answer"),
  },
]);

const toggleFaq = (index) => {
  openFaqIndex.value = openFaqIndex.value === index ? -1 : index;
};
</script>

<template>
  <main
    class="bg-(--color-background) pt-28 text-(--color-text) overflow-x-hidden"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <!-- Hero Section -->
    <section class="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
      <!-- Background Ambient Glow Spots -->
      <div class="absolute -top-10 -left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="relative z-10">
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-(--color-accent)">
          {{ t("ownerLanding.eyebrow") }}
        </p>
        <h1 class="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-(--color-text) sm:text-5xl lg:text-6xl">
          {{ t("ownerLanding.title") }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-(--color-muted)">
          {{ t("ownerLanding.subtitle") }}
        </p>

        <div class="mt-8 flex flex-col gap-3.5 sm:flex-row">
          <RouterLink
            :to="{ name: 'public.registerOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm bg-(--color-primary) px-6 text-sm font-semibold !text-white transition hover:bg-(--color-primary-strong) hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-md hover:shadow-lg"
          >
            {{ t("ownerLanding.primaryCta") }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'public.loginOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm border border-(--color-border) px-6 text-sm font-semibold text-(--color-text) transition hover:border-(--color-primary) hover:text-(--color-primary) hover:scale-[1.02] active:scale-[0.98] duration-300 bg-(--color-surface)/40 backdrop-blur-sm shadow-sm"
          >
            {{ t("ownerLanding.secondaryCta") }}
          </RouterLink>
        </div>
      </div>

      <div class="relative z-10 min-h-[440px] overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface-soft) shadow-2xl ring-1 ring-white/10">
        <img
          :src="heroImage"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div class="absolute inset-0 bg-gradient-to-br from-sky-950/85 via-sky-900/55 to-sky-600/30"></div>
        <div class="relative flex h-full min-h-[440px] flex-col justify-end p-6 text-white sm:p-8">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/80">
              {{ t("ownerLanding.previewEyebrow") }}
            </p>
            <h2 class="mt-2 text-2xl font-bold tracking-tight">
              {{ t("ownerLanding.previewTitle") }}
            </h2>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in stats"
                :key="item.label"
                class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <strong class="block text-2xl font-extrabold text-(--color-accent)">{{ item.value }}</strong>
                <span class="mt-1 block text-xs text-sky-100/90 font-medium">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="benefit in benefits"
          :key="benefit.title"
          class="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-(--color-accent)/30"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-accent-soft) text-(--color-accent) transition duration-300 group-hover:scale-110">
            <component
              :is="benefit.icon"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </div>
          <h3 class="mt-5 text-xl font-bold text-(--color-text) tracking-tight group-hover:text-(--color-primary) transition duration-300">
            {{ benefit.title }}
          </h3>
          <p class="mt-3 text-sm leading-7 text-(--color-muted)">
            {{ benefit.description }}
          </p>
        </article>
      </div>
    </section>

    <!-- Steps Timeline Section -->
    <section id="steps" class="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-(--color-accent)">
          {{ t("ownerLanding.stepsEyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight text-(--color-text) sm:text-4xl">
          {{ t("ownerLanding.stepsTitle") }}
        </h2>
        <p class="mt-4 text-base leading-7 text-(--color-muted)">
          {{ t("ownerLanding.stepsSubtitle") }}
        </p>
      </div>

      <div class="relative rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 sm:p-8 shadow-sm">
        <!-- Vertical Connecting Timeline Line -->
        <div class="absolute top-12 bottom-24 left-[38px] w-[2px] bg-gradient-to-b from-(--color-accent) via-(--color-border) to-transparent hidden sm:block"></div>
        
        <ol class="space-y-6 relative z-10">
          <li
            v-for="(step, index) in steps"
            :key="step"
            class="group flex flex-col sm:flex-row gap-4 rounded-2xl bg-(--color-surface-soft)/40 p-4 border border-transparent transition-all duration-300 hover:bg-(--color-surface-soft) hover:border-(--color-border)/50"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-sm font-bold text-white shadow-md group-hover:scale-110 transition duration-300">
              {{ index + 1 }}
            </span>
            <div class="pt-1">
              <span class="text-base font-semibold text-(--color-text) leading-6">
                {{ step }}
              </span>
            </div>
          </li>
        </ol>

        <div class="mt-8 flex items-start gap-3 rounded-2xl border border-l-4 border-(--color-accent)/30 border-l-(--color-accent) bg-(--color-accent-soft)/40 p-4">
          <ClipboardDocumentCheckIcon class="mt-0.5 h-6 w-6 shrink-0 text-(--color-accent)" aria-hidden="true" />
          <p class="text-sm leading-7 text-(--color-muted)">
            {{ t("ownerLanding.reviewNote") }}
          </p>
        </div>
      </div>
    </section>

    <!-- FAQs Section -->
    <section id="faqs" class="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-(--color-accent)">
          {{ t("ownerLanding.faqEyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight text-(--color-text) sm:text-4xl">
          {{ t("ownerLanding.faqTitle") }}
        </h2>
        <p class="mt-4 text-base leading-7 text-(--color-muted)">
          {{ t("ownerLanding.faqSubtitle") }}
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(item, index) in faqs"
          :key="item.question"
          class="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 transition-all duration-300 hover:shadow-md hover:border-(--color-primary)/20"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-(--color-text) group-hover:text-(--color-primary) transition duration-300"
            :aria-expanded="openFaqIndex === index"
            :aria-controls="`owner-faq-${index}`"
            @click="toggleFaq(index)"
          >
            <span>{{ item.question }}</span>
            <ChevronDownIcon
              class="h-5 w-5 shrink-0 text-(--color-accent) transition duration-300"
              :class="openFaqIndex === index ? 'rotate-180' : ''"
              aria-hidden="true"
            />
          </button>

          <div
            :id="`owner-faq-${index}`"
            class="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
            :class="openFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <p class="pt-4 text-sm leading-7 text-(--color-muted)">
                {{ item.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom SaaS CTA Section -->
    <section class="relative z-10 border-t border-(--color-border) bg-(--color-surface-soft)/50 py-16 sm:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 px-6 py-12 shadow-2xl sm:px-12 sm:py-16 md:px-16">
          <!-- Ambient spots inside card -->
          <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div class="absolute -left-20 -top-20 w-80 h-80 bg-sky-500/15 rounded-full blur-[80px] pointer-events-none"></div>

          <div class="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-2xl">
              <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {{ t("ownerLanding.finalTitle") }}
              </h2>
              <p class="mt-4 text-lg text-sky-100/90 leading-7">
                {{ t("ownerLanding.finalSubtitle") }}
              </p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row shrink-0">
              <RouterLink
                :to="{ name: 'public.registerOwner' }"
                class="inline-flex h-12 items-center justify-center rounded-sm bg-(--color-accent) px-6 text-sm font-semibold !text-white transition hover:bg-(--color-accent-strong) hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-md"
              >
                <CheckCircleIcon class="mr-2 h-5 w-5" aria-hidden="true" />
                {{ t("ownerLanding.primaryCta") }}
              </RouterLink>
              <RouterLink
                :to="{ name: 'public.loginOwner' }"
                class="inline-flex h-12 items-center justify-center rounded-sm border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98] duration-300 backdrop-blur-sm"
              >
                <CurrencyDollarIcon class="mr-2 h-5 w-5" aria-hidden="true" />
                {{ t("ownerLanding.secondaryCta") }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
html {
  scroll-behavior: smooth;
  scroll-padding-top: 100px;
}
</style>
