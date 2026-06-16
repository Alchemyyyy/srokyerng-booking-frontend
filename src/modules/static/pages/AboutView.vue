<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import aboutHero from "@/assets/images/about/hero/hero_section.png";
import member1 from "@/assets/images/about/team/member_1.PNG";
import member2 from "@/assets/images/about/team/member_2.png";
import member3 from "@/assets/images/about/team/member_3.png";
import member4 from "@/assets/images/about/team/member_4.png";
import member5 from "@/assets/images/about/team/member_5.png";
import member6 from "@/assets/images/about/team/member_6.png";
import AppButton from "@/shared/components/AppButton.vue";
import {
  ArrowRightIcon,
  BoltIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const { t, locale } = useI18n({ useScope: "global" });

const stats = computed(() => [
  {
    icon: BuildingOfficeIcon,
    value: "1,200+",
    label: t("about.stats.properties"),
  },
  { icon: UserGroupIcon, value: "35,000+", label: t("about.stats.travelers") },
  {
    icon: CalendarDaysIcon,
    value: "120,000+",
    label: t("about.stats.bookings"),
  },
  { icon: StarIcon, value: "4.8 / 5", label: t("about.stats.rating") },
]);

const storyFeatures = computed(() => [
  {
    icon: CalendarDaysIcon,
    title: t("about.story.feature1.title"),
    desc: t("about.story.feature1.desc"),
  },
  {
    icon: BuildingOffice2Icon,
    title: t("about.story.feature2.title"),
    desc: t("about.story.feature2.desc"),
  },
]);

const whyUs = computed(() => [
  {
    icon: "M12 21s-6.75-4.35-6.75-10.125a6.75 6.75 0 1113.5 0C18.75 16.65 12 21 12 21zm0-7.5a2.625 2.625 0 100-5.25 2.625 2.625 0 000 5.25z",
    title: t("about.why.local.title"),
    desc: t("about.why.local.desc"),
  },
  {
    icon: "M9 12.75 11.25 15 15 9.75m6 2.25c0 5.18-3.438 9.557-8.25 10.977C7.938 21.557 4.5 17.18 4.5 12V6.58a1.125 1.125 0 01.68-1.03l6.75-2.7a1.125 1.125 0 01.84 0l6.75 2.7a1.125 1.125 0 01.68 1.03V12z",
    title: t("about.why.verified.title"),
    desc: t("about.why.verified.desc"),
  },
  {
    icon: "M3 16.5 8.25 11.25 12 15l8.25-8.25M15.75 6.75h4.5v4.5",
    title: t("about.why.price.title"),
    desc: t("about.why.price.desc"),
  },
  {
    icon: "M7.5 9h9m-9 3h5.25m4.558 6.117-3.41-2.045a2.25 2.25 0 00-1.157-.322H6.75A2.25 2.25 0 014.5 13.5v-6A2.25 2.25 0 016.75 5.25h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25v2.367z",
    title: t("about.why.support.title"),
    desc: t("about.why.support.desc"),
  },
]);

const testimonials = ref([
  {
    name: "Sophea",
    location: "Phnom Penh",
    text: "The attention to detail in our villa was astounding. Every aspect of Cambodian heritage was woven into a modern comfort experience.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Marcus Chen",
    location: "Singapore",
    text: "SrokYerng Booking helped us discover verified stays and local experiences we would never have found alone.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena Rodriguez",
    location: "Madrid",
    text: "From the search process to the stay, everything felt clear, warm, and thoughtfully handled.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
]);

const team = computed(() => [
  {
    name: t("about.team.members.leakhena.name"),
    role: t("about.team.members.leakhena.role"),
    image: member1,
  },
  {
    name: t("about.team.members.sambath.name"),
    role: t("about.team.members.sambath.role"),
    image: member2,
  },
  {
    name: t("about.team.members.meoun-chan-sambath.name"),
    role: t("about.team.members.meoun-chan-sambath.role"),
    image: member3,
  },
  {
    name: t("about.team.members.ei-visal.name"),
    role: t("about.team.members.ei-visal.role"),
    image: member4,
  },
  {
    name: t("about.team.members.houn-thanun.name"),
    role: t("about.team.members.houn-thanun.role"),
    image: member5,
  },
  {
    name: t("about.team.members.an-menghour.name"),
    role: t("about.team.members.an-menghour.role"),
    image: member6,
  },
]);
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text)"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <section class="relative isolate min-h-[680px] overflow-hidden pt-24">
      <img
        :src="aboutHero"
        alt="SrokYerng accommodation in Cambodia"
        class="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,41,105,0.94),rgba(18,104,180,0.78)_44%,rgba(18,104,180,0.18)_100%)]"
      ></div>

      <div
        class="mx-auto grid min-h-[560px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8"
      >
        <div class="max-w-2xl">
          <p
            class="text-xs font-bold uppercase tracking-[0.28em] text-(--color-warning)"
          >
            {{ t("about.hero.eyebrow") }}
          </p>
          <h1
            class="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {{ t("about.hero.title") }}
            <span class="block text-(--color-warning)">
              {{ t("about.hero.titleHighlight") }}
            </span>
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-white/82 sm:text-lg">
            {{ t("about.hero.subtitle") }}
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <RouterLink :to="{ name: 'public.properties' }">
              <AppButton
                variant="primary"
                size="lg"
                class="w-full !rounded-lg sm:w-auto"
              >
                <MagnifyingGlassIcon class="h-5 w-5" />
                {{ t("about.hero.exploreBtn") }}
              </AppButton>
            </RouterLink>
            <RouterLink :to="{ name: 'public.contact' }">
              <AppButton
                variant="secondary"
                size="lg"
                class="w-full !rounded-lg !border-white/25 !bg-white/10 !text-white backdrop-blur sm:w-auto"
              >
                <ChatBubbleBottomCenterIcon class="h-5 w-5" />
                {{ t("about.hero.contactBtn") }}
              </AppButton>
            </RouterLink>
          </div>
        </div>

        <div class="hidden lg:block">
          <div
            class="ml-auto max-w-md rounded-3xl border border-white/15 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-md"
          >
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="stat in stats"
                :key="'hero-' + stat.label"
                class="rounded-2xl bg-white/12 p-5 ring-1 ring-white/10"
              >
                <component
                  :is="stat.icon"
                  class="mb-5 h-7 w-7 text-(--color-warning)"
                />
                <p class="text-2xl font-black">{{ stat.value }}</p>
                <p
                  class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/62"
                >
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div
        class="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
      >
        <div class="relative min-h-[480px]">
          <div
            class="absolute left-0 top-0 h-[420px] w-[82%] overflow-hidden rounded-3xl shadow-(--shadow-panel)"
          >
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
              alt="Boutique hotel pool"
              class="h-full w-full object-cover"
            />
          </div>
          <div
            class="absolute bottom-0 right-0 h-60 w-64 overflow-hidden rounded-3xl border-8 border-(--color-surface) bg-(--color-surface) shadow-(--shadow-panel)"
          >
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=900&auto=format&fit=crop"
              alt="Comfortable guest room"
              class="h-full w-full object-cover"
            />
          </div>
          <div
            class="absolute bottom-12 left-8 rounded-2xl bg-(--color-surface) px-5 py-4 shadow-(--shadow-card) ring-1 ring-(--color-border)"
          >
            <p class="text-2xl font-black text-(--color-primary)">4.8</p>
            <p
              class="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-muted)"
            >
              Guest Rating
            </p>
          </div>
        </div>

        <div>
          <p class="eyebrow">{{ t("about.story.eyebrow") }}</p>
          <h2
            class="mt-3 max-w-2xl text-3xl font-black leading-tight text-(--color-text) sm:text-4xl lg:text-5xl"
          >
            {{ t("about.story.title") }}
          </h2>
          <p class="mt-6 max-w-2xl text-base leading-8 text-(--color-muted)">
            {{ t("about.story.desc") }}
          </p>

          <div class="mt-9 grid gap-4 sm:grid-cols-2">
            <div
              v-for="feature in storyFeatures"
              :key="feature.title"
              class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-5"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"
              >
                <component :is="feature.icon" class="h-6 w-6" />
              </div>
              <h3 class="text-lg font-bold text-(--color-text)">
                {{ feature.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-(--color-muted)">
                {{ feature.desc }}
              </p>
            </div>
          </div>

          <RouterLink
            :to="{ name: 'public.properties' }"
            class="mt-8 inline-flex"
          >
            <AppButton variant="primary" size="lg" class="!rounded-lg">
              {{ t("about.story.discoverBtn") }}
              <ArrowRightIcon class="h-5 w-5" />
            </AppButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div
          class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p class="eyebrow">{{ t("about.stats.eyebrow") }}</p>
            <h2
              class="mt-2 text-3xl font-black text-(--color-text) sm:text-4xl"
            >
              {{ t("about.stats.title") }}
            </h2>
          </div>
          <p class="max-w-md text-sm leading-7 text-(--color-muted)">
            {{ t("about.why.subtitle") }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card) transition hover:-translate-y-1"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"
            >
              <component :is="stat.icon" class="h-6 w-6" />
            </div>
            <p class="text-3xl font-black text-(--color-text)">
              {{ stat.value }}
            </p>
            <p
              class="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-(--color-muted)"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto mb-12 max-w-3xl text-center">
          <p class="eyebrow">{{ t("about.mission.eyebrow") }}</p>
          <h2 class="mt-3 text-3xl font-black text-(--color-text) sm:text-4xl">
            {{ t("about.mission.sectionTitle") }}
          </h2>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          <div
            class="rounded-3xl bg-gradient-to-br from-(--color-primary) to-(--color-secondary) p-8 text-white shadow-(--shadow-panel)"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/15"
            >
              <BoltIcon class="h-6 w-6" />
            </div>
            <p
              class="text-xs font-bold uppercase tracking-[0.24em] text-white/62"
            >
              01
            </p>
            <h3 class="mt-3 text-2xl font-black">
              {{ t("about.mission.title") }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-white/82">
              {{ t("about.mission.desc") }}
            </p>
          </div>

          <div
            class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-8"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-surface) text-(--color-primary) ring-1 ring-(--color-border)"
            >
              <EyeIcon class="h-6 w-6" />
            </div>
            <p
              class="text-xs font-bold uppercase tracking-[0.24em] text-(--color-muted)"
            >
              02
            </p>
            <h3 class="mt-3 text-2xl font-black text-(--color-text)">
              {{ t("about.vision.title") }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-(--color-muted)">
              {{ t("about.vision.desc") }}
            </p>
          </div>

          <div
            class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-8"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-surface) text-(--color-primary) ring-1 ring-(--color-border)"
            >
              <SparklesIcon class="h-6 w-6" />
            </div>
            <p
              class="text-xs font-bold uppercase tracking-[0.24em] text-(--color-muted)"
            >
              03
            </p>
            <h3 class="mt-3 text-2xl font-black text-(--color-text)">
              {{ t("about.why.title") }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-(--color-muted)">
              {{ t("about.why.subtitle") }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div
          class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p class="eyebrow">{{ t("about.why.eyebrow") }}</p>
            <h2
              class="mt-2 text-3xl font-black text-(--color-text) sm:text-4xl"
            >
              {{ t("about.why.title") }}
            </h2>
          </div>
          <p class="max-w-lg text-sm leading-7 text-(--color-muted)">
            {{ t("about.why.subtitle") }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div
            v-for="item in whyUs"
            :key="item.title"
            class="group rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card) transition hover:-translate-y-1 hover:border-(--color-primary)"
          >
            <div class="flex gap-5">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :d="item.icon"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-(--color-text)">
                  {{ item.title }}
                </h3>
                <p class="mt-2 text-sm leading-7 text-(--color-muted)">
                  {{ item.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto mb-12 max-w-3xl text-center">
          <p class="eyebrow">Trusted by Travelers</p>
          <h2 class="mt-3 text-3xl font-black text-(--color-text) sm:text-4xl">
            Guests Love Their Stay With SrokYerng Booking
          </h2>
          <div
            class="mt-6 flex items-center justify-center gap-1 text-(--color-warning)"
          >
            <span v-for="n in 5" :key="'score-star-' + n">&#9733;</span>
            <span class="ml-3 text-sm font-bold text-(--color-text)"
              >4.8/5</span
            >
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <article
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-6"
          >
            <div class="mb-5 flex gap-1 text-sm text-(--color-warning)">
              <span
                v-for="star in testimonial.rating"
                :key="testimonial.name + star"
                >&#9733;</span
              >
            </div>
            <p class="text-sm leading-7 text-(--color-muted)">
              "{{ testimonial.text }}"
            </p>
            <div
              class="mt-7 flex items-center gap-3 border-t border-(--color-border) pt-5"
            >
              <img
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 class="text-sm font-bold text-(--color-text)">
                  {{ testimonial.name }}
                </h3>
                <p class="text-xs text-(--color-muted)">
                  from {{ testimonial.location }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto mb-12 max-w-3xl text-center">
          <p class="eyebrow">{{ t("about.team.eyebrow") }}</p>
          <h2 class="mt-3 text-3xl font-black text-(--color-text) sm:text-4xl">
            {{ t("about.team.title") }}
          </h2>
          <p class="mt-4 leading-7 text-(--color-muted)">
            {{ t("about.team.subtitle") }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="member in team"
            :key="member.name"
            class="group overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) text-center shadow-(--shadow-card) transition hover:-translate-y-1 hover:border-(--color-primary)"
          >
            <div
              class="bg-gradient-to-b from-(--color-primary-soft) to-transparent px-6 pb-4 pt-8"
            >
              <div
                class="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg shadow-blue-900/10 ring-4 ring-white"
              >
                <img
                  v-if="member.image"
                  :src="member.image"
                  :alt="member.name"
                  class="h-full w-full object-cover object-top"
                />
                <span v-else class="text-4xl font-black text-(--color-primary)">
                  {{ member.name.charAt(0) }}
                </span>
              </div>
            </div>
            <div class="px-6 pb-7 pt-2">
              <h3 class="text-lg font-bold leading-7 text-(--color-text)">
                {{ member.name }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-(--color-muted)">
                {{ member.role }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl text-center">
        <p class="eyebrow">{{ t("about.thanks.title") }}</p>
        <h2 class="mt-3 text-3xl font-black text-(--color-text) sm:text-4xl">
          {{ t("about.thanks.subtitle") }}
        </h2>
        <p class="mx-auto mt-5 max-w-3xl leading-8 text-(--color-muted)">
          {{ t("about.thanks.message") }}
        </p>
        <div
          class="mt-12 grid grid-cols-1 items-center gap-6 rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-6 sm:grid-cols-3"
        >
          <img
            src="@/assets/images/about/thanks/mptc_logo.png"
            alt="MPTC Logo"
            class="mx-auto h-24 w-full object-contain"
          />
          <img
            src="@/assets/images/about/thanks/cbrd_fund_logo.png"
            alt="CBRD Fund Logo"
            class="mx-auto h-24 w-full object-contain"
          />
          <img
            src="@/assets/images/about/thanks/ant_logo.png"
            alt="ANT Logo"
            class="mx-auto h-24 w-full object-contain"
          />
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-20 sm:px-6 lg:px-8">
      <div
        class="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-(--color-primary-strong) via-(--color-primary) to-(--color-secondary) px-6 py-16 text-center shadow-(--shadow-panel) sm:px-10 lg:px-16"
      >
        <h2 class="text-3xl font-black text-white sm:text-4xl">
          {{ t("about.cta.title") }}
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/82">
          {{ t("about.cta.subtitle") }}
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <RouterLink :to="{ name: 'public.contact' }">
            <AppButton
              variant="secondary"
              size="lg"
              class="w-full !rounded-lg !border-transparent !bg-white !text-(--color-primary) sm:w-auto"
            >
              {{ t("about.cta.contact") }}
            </AppButton>
          </RouterLink>
          <RouterLink :to="{ name: 'public.properties' }">
            <AppButton
              variant="secondary"
              size="lg"
              class="w-full !rounded-lg !border-white/25 !bg-white/10 !text-white sm:w-auto"
            >
              {{ t("about.cta.browse") }}
            </AppButton>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
