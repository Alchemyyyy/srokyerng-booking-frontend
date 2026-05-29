<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  HomeModernIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const { t, locale } = useI18n({ useScope: "global" });

const highlights = computed(() => [
  {
    icon: ClipboardDocumentListIcon,
    title: t("terms.highlights.clear.title"),
    desc: t("terms.highlights.clear.desc"),
  },
  {
    icon: ShieldCheckIcon,
    title: t("terms.highlights.trust.title"),
    desc: t("terms.highlights.trust.desc"),
  },
  {
    icon: BanknotesIcon,
    title: t("terms.highlights.payment.title"),
    desc: t("terms.highlights.payment.desc"),
  },
]);

const sections = computed(() => [
  {
    id: "acceptance",
    icon: ScaleIcon,
    title: t("terms.sections.acceptance.title"),
    body: t("terms.sections.acceptance.body"),
    points: [
      t("terms.sections.acceptance.points.use"),
      t("terms.sections.acceptance.points.account"),
      t("terms.sections.acceptance.points.updates"),
    ],
  },
  {
    id: "bookings",
    icon: HomeModernIcon,
    title: t("terms.sections.bookings.title"),
    body: t("terms.sections.bookings.body"),
    points: [
      t("terms.sections.bookings.points.accuracy"),
      t("terms.sections.bookings.points.confirmation"),
      t("terms.sections.bookings.points.rules"),
    ],
  },
  {
    id: "payments",
    icon: BanknotesIcon,
    title: t("terms.sections.payments.title"),
    body: t("terms.sections.payments.body"),
    points: [
      t("terms.sections.payments.points.pricing"),
      t("terms.sections.payments.points.fees"),
      t("terms.sections.payments.points.refunds"),
    ],
  },
  {
    id: "responsibilities",
    icon: UserGroupIcon,
    title: t("terms.sections.responsibilities.title"),
    body: t("terms.sections.responsibilities.body"),
    points: [
      t("terms.sections.responsibilities.points.guests"),
      t("terms.sections.responsibilities.points.owners"),
      t("terms.sections.responsibilities.points.content"),
    ],
  },
  {
    id: "limitations",
    icon: ExclamationTriangleIcon,
    title: t("terms.sections.limitations.title"),
    body: t("terms.sections.limitations.body"),
    points: [
      t("terms.sections.limitations.points.availability"),
      t("terms.sections.limitations.points.thirdParty"),
      t("terms.sections.limitations.points.disputes"),
    ],
  },
]);
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text)"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <section class="relative isolate overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(57,149,198,0.42),transparent_34%),linear-gradient(135deg,#062969_0%,#0b3779_48%,#1268b4_100%)] px-4 pb-20 pt-40 text-white sm:px-6 lg:px-8 lg:pt-44">
      <div class="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-black/12 to-transparent"></div>
      <div class="absolute right-0 top-20 -z-10 h-64 w-64 rounded-full bg-white/8 blur-3xl"></div>
      <div class="mx-auto max-w-7xl">
        <div class="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.28em] text-(--color-warning)">
              {{ t("terms.hero.eyebrow") }}
            </p>
            <h1 class="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {{ t("terms.hero.title") }}
            </h1>
            <p class="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
              {{ t("terms.hero.subtitle") }}
            </p>
          </div>

          <div class="rounded-3xl border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/12 text-(--color-warning)">
                <ScaleIcon class="h-6 w-6" />
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ t("terms.hero.updatedLabel") }}</p>
                <p class="mt-1 text-sm leading-7 text-white/72">
                  {{ t("terms.hero.updatedDate") }}
                </p>
              </div>
            </div>
            <div class="mt-6 border-t border-white/12 pt-6">
              <p class="text-sm leading-7 text-white/76">
                {{ t("terms.hero.note") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        <article
          v-for="item in highlights"
          :key="item.title"
          class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
            <component :is="item.icon" class="h-6 w-6" />
          </div>
          <h2 class="text-lg font-bold text-(--color-text)">{{ item.title }}</h2>
          <p class="mt-3 text-sm leading-7 text-(--color-muted)">{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_1fr]">
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <div class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-5">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-(--color-primary)">
              {{ t("terms.contents") }}
            </p>
            <nav class="mt-5 grid gap-2">
              <a
                v-for="section in sections"
                :key="section.id"
                :href="`#${section.id}`"
                class="rounded-xl px-3 py-2 text-sm font-semibold text-(--color-muted) transition hover:bg-(--color-surface) hover:text-(--color-primary)"
              >
                {{ section.title }}
              </a>
            </nav>
          </div>
        </aside>

        <div class="space-y-6">
          <article
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="scroll-mt-28 rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-6 sm:p-8"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <component :is="section.icon" class="h-6 w-6" />
              </div>
              <div>
                <h2 class="text-2xl font-black text-(--color-text)">
                  {{ section.title }}
                </h2>
                <p class="mt-4 leading-8 text-(--color-muted)">
                  {{ section.body }}
                </p>
              </div>
            </div>
            <ul class="mt-6 grid gap-3">
              <li
                v-for="point in section.points"
                :key="point"
                class="flex gap-3 text-sm leading-7 text-(--color-muted)"
              >
                <CheckCircleIcon class="mt-0.5 h-5 w-5 shrink-0 text-(--color-primary)" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-(--color-primary-strong) via-(--color-primary) to-(--color-secondary) p-8 text-white shadow-(--shadow-panel) lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.26em] text-white/68">
            {{ t("terms.contact.eyebrow") }}
          </p>
          <h2 class="mt-3 text-3xl font-black sm:text-4xl">
            {{ t("terms.contact.title") }}
          </h2>
          <p class="mt-4 max-w-2xl leading-8 text-white/82">
            {{ t("terms.contact.subtitle") }}
          </p>
        </div>

        <RouterLink :to="{ name: 'public.contact' }">
          <AppButton
            variant="secondary"
            size="lg"
            class="w-full !rounded-lg !border-transparent !bg-white !text-(--color-primary) sm:w-auto"
          >
            {{ t("terms.contact.button") }}
            <ArrowRightIcon class="h-5 w-5" />
          </AppButton>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
