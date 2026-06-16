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
    class="bg-(--color-background) pt-28 text-(--color-text)"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <section class="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-(--color-primary)">
          {{ t("ownerLanding.eyebrow") }}
        </p>
        <h1 class="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-(--color-text) sm:text-5xl lg:text-6xl">
          {{ t("ownerLanding.title") }}
        </h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-(--color-muted)">
          {{ t("ownerLanding.subtitle") }}
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <RouterLink
            :to="{ name: 'public.registerOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm bg-(--color-primary) px-6 text-sm font-semibold !text-white transition hover:bg-(--color-primary-strong)"
          >
            {{ t("ownerLanding.primaryCta") }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'public.loginOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm border border-(--color-border) px-6 text-sm font-semibold text-(--color-text) transition hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            {{ t("ownerLanding.secondaryCta") }}
          </RouterLink>
        </div>
      </div>

      <div class="relative min-h-[420px] overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface-soft)">
        <img
          :src="heroImage"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div class="absolute inset-0 bg-gradient-to-br from-sky-950/80 via-sky-900/55 to-sky-600/35"></div>
        <div class="relative flex h-full min-h-[420px] flex-col justify-end p-6 text-white sm:p-8">
          <div class="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">
              {{ t("ownerLanding.previewEyebrow") }}
            </p>
            <h2 class="mt-3 text-2xl font-bold">
              {{ t("ownerLanding.previewTitle") }}
            </h2>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in stats"
                :key="item.label"
                class="rounded-2xl bg-white/12 p-4"
              >
                <strong class="block text-2xl">{{ item.value }}</strong>
                <span class="mt-1 block text-sm text-sky-100">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="benefit in benefits"
          :key="benefit.title"
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
        >
          <component
            :is="benefit.icon"
            class="h-9 w-9 text-(--color-primary)"
            aria-hidden="true"
          />
          <h2 class="mt-5 text-xl font-bold text-(--color-text)">
            {{ benefit.title }}
          </h2>
          <p class="mt-3 text-sm leading-7 text-(--color-muted)">
            {{ benefit.description }}
          </p>
        </article>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:pb-20">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-(--color-primary)">
          {{ t("ownerLanding.stepsEyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-bold text-(--color-text)">
          {{ t("ownerLanding.stepsTitle") }}
        </h2>
        <p class="mt-4 text-base leading-7 text-(--color-muted)">
          {{ t("ownerLanding.stepsSubtitle") }}
        </p>
      </div>

      <div class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-6">
        <ol class="space-y-4">
          <li
            v-for="(step, index) in steps"
            :key="step"
            class="flex gap-4 rounded-2xl bg-(--color-surface-soft) p-4"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
              {{ index + 1 }}
            </span>
            <span class="pt-1 text-base font-semibold text-(--color-text)">
              {{ step }}
            </span>
          </li>
        </ol>

        <div class="mt-6 flex items-start gap-3 rounded-2xl border border-(--color-primary)/30 bg-(--color-primary-soft) p-4">
          <ClipboardDocumentCheckIcon class="mt-0.5 h-6 w-6 shrink-0 text-(--color-primary)" aria-hidden="true" />
          <p class="text-sm leading-7 text-(--color-muted)">
            {{ t("ownerLanding.reviewNote") }}
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-(--color-primary)">
          {{ t("ownerLanding.faqEyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-bold text-(--color-text)">
          {{ t("ownerLanding.faqTitle") }}
        </h2>
        <p class="mt-4 text-base leading-7 text-(--color-muted)">
          {{ t("ownerLanding.faqSubtitle") }}
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in faqs"
          :key="item.question"
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-(--color-text)"
            :aria-expanded="openFaqIndex === index"
            :aria-controls="`owner-faq-${index}`"
            @click="toggleFaq(index)"
          >
            <span>{{ item.question }}</span>
            <ChevronDownIcon
              class="h-5 w-5 shrink-0 text-(--color-primary) transition duration-300"
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

    <section class="border-t border-(--color-border) bg-(--color-surface)">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 class="text-2xl font-bold text-(--color-text)">
            {{ t("ownerLanding.finalTitle") }}
          </h2>
          <p class="mt-2 text-(--color-muted)">
            {{ t("ownerLanding.finalSubtitle") }}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <RouterLink
            :to="{ name: 'public.registerOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm bg-(--color-primary) px-6 text-sm font-semibold !text-white transition hover:bg-(--color-primary-strong)"
          >
            <CheckCircleIcon class="mr-2 h-5 w-5" aria-hidden="true" />
            {{ t("ownerLanding.primaryCta") }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'public.loginOwner' }"
            class="inline-flex h-12 items-center justify-center rounded-sm border border-(--color-border) px-6 text-sm font-semibold text-(--color-text) transition hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <CurrencyDollarIcon class="mr-2 h-5 w-5" aria-hidden="true" />
            {{ t("ownerLanding.secondaryCta") }}
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
