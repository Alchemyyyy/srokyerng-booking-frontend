<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import member2 from "@/assets/images/about/team/member_2.png";

const { t } = useI18n({ useScope: "global" });

const missionVision = computed(() => [
  {
    icon: "🎯",
    title: t("about.mission.title"),
    desc: t("about.mission.desc"),
  },
  {
    icon: "🌟",
    title: t("about.vision.title"),
    desc: t("about.vision.desc"),
  },
]);

const whyUs = computed(() => [
  {
    icon: "🇰🇭",
    title: t("about.why.local.title"),
    desc: t("about.why.local.desc"),
  },
  {
    icon: "✅",
    title: t("about.why.verified.title"),
    desc: t("about.why.verified.desc"),
  },
  {
    icon: "💰",
    title: t("about.why.price.title"),
    desc: t("about.why.price.desc"),
  },
  {
    icon: "🤝",
    title: t("about.why.support.title"),
    desc: t("about.why.support.desc"),
  },
]);

const team = computed(() => [
  {
    name: t("about.team.members.leakhena.name"),
    role: t("about.team.members.leakhena.role"),
    image: null,
  },
  {
    name: t("about.team.members.sambath.name"),
    role: t("about.team.members.sambath.role"),
    image: member2,
  },
  {
    name: t("about.team.members.meoun-chan-sambath.name"),
    role: t("about.team.members.meoun-chan-sambath.role"),
    image: null,
  },
  {
    name: t("about.team.members.ei-visal.name"),
    role: t("about.team.members.ei-visal.role"),
    image: null,
  },
  {
    name: t("about.team.members.houn-thanun.name"),
    role: t("about.team.members.houn-thanun.role"),
    image: null,
  },
  {
    name: t("about.team.members.an-menghour.name"),
    role: t("about.team.members.an-menghour.role"),
    image: null,
  },
]);
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero / Our Story -->
    <!-- Updated Hero / Our Story -->

    <section
      class="relative min-h-[70vh] flex items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
    >
      <!-- Decorative Background Elements -->
      <div
        class="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-(--color-primary-soft) opacity-40 blur-3xl"
      />
      <div
        class="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-(--color-secondary-soft) opacity-20 blur-3xl"
      />

      <div class="relative mx-auto max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <!-- Left Column: Content -->
          <div class="text-left">
            <div
              class="inline-flex items-center space-x-2 rounded-full bg-(--color-primary-soft) px-4 py-1.5 mb-6 border border-(--color-primary)/10"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--color-primary) opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-(--color-primary)"
                ></span>
              </span>
              <span
                class="text-xs font-bold tracking-wider uppercase text-(--color-primary)"
              >
                {{ t("about.story.eyebrow") }}
              </span>
            </div>

            <h1
              class="mb-6 text-4xl font-extrabold tracking-tight text-(--color-text) sm:text-6xl"
            >
              {{ t("about.story.title") }}
              <span
                class="block mt-2 bg-gradient-to-r from-(--color-primary) to-(--color-secondary) bg-clip-text text-transparent"
              >
                {{ t("about.story.titleHighlight") }}
              </span>
            </h1>

            <p
              class="mb-10 max-w-xl text-lg leading-relaxed text-(--color-muted)"
            >
              {{ t("about.story.desc") }}
            </p>

            <!-- Desktop Quick Stats (Horizontal) -->
            <div
              class="hidden sm:flex items-center space-x-8 border-t border-(--color-border) pt-8"
            >
              <div
                v-for="stat in [
                  { value: '500+', label: t('about.stats.properties') },
                  { value: '4.8★', label: t('about.stats.rating') },
                ]"
                :key="stat.label"
              >
                <p class="text-3xl font-bold text-(--color-text)">
                  {{ stat.value }}
                </p>
                <p class="text-sm font-medium text-(--color-muted)">
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Visual Element -->
          <div class="relative lg:block">
            <div
              class="relative z-10 overflow-hidden rounded-[2rem] border border-(--color-border) bg-(--color-surface) p-3 shadow-2xl"
            >
              <!-- Glassmorphism Image Overlay -->
              <div
                class="aspect-[4/5] rounded-[1.6rem] bg-gradient-to-br from-(--color-primary-soft) to-(--color-secondary-soft) relative flex items-center justify-center overflow-hidden"
              >
                <!-- Placeholder for your actual image -->
                <div
                  class="absolute inset-0 bg-black/5 backdrop-blur-[1px]"
                ></div>
                <span
                  class="text-8xl transform hover:scale-110 transition-transform duration-500"
                  >🏢</span
                >

                <!-- Floating Stats Card (Glassmorphism) -->
                <div
                  class="absolute bottom-6 right-6 left-6 backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-4 shadow-xl"
                >
                  <div class="flex justify-between items-center text-white">
                    <div>
                      <p class="text-xs font-medium opacity-80">Active Users</p>
                      <p class="text-xl font-bold">10K+</p>
                    </div>
                    <div class="h-10 w-px bg-white/20"></div>
                    <div>
                      <p class="text-xs font-medium opacity-80">Locations</p>
                      <p class="text-xl font-bold">25+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Abstract Shape behind image -->
            <div
              class="absolute -bottom-6 -right-6 -z-0 h-full w-full rounded-[2rem] border-2 border-(--color-primary-soft)"
            />
          </div>
        </div>

        <!-- Mobile Stats Grid (Visible only on small screens) -->
        <div class="mt-12 grid grid-cols-2 gap-4 sm:hidden">
          <div
            v-for="stat in [
              { value: '500+', label: t('about.stats.properties') },
              { value: '4.8★', label: t('about.stats.rating') },
            ]"
            :key="stat.label"
            class="rounded-2xl bg-(--color-surface-soft) p-4 border border-(--color-border)"
          >
            <p class="text-xl font-bold text-(--color-primary)">
              {{ stat.value }}
            </p>
            <p class="text-xs text-(--color-muted)">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="bg-(--color-surface-soft) px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 text-center">
          <p class="eyebrow mb-2">{{ t("about.mission.eyebrow") }}</p>
          <h2 class="text-3xl font-bold text-(--color-text)">
            {{ t("about.mission.sectionTitle") }}
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            v-for="item in missionVision"
            :key="item.title"
            class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-8 shadow-(--shadow-card)"
          >
            <div
              class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-2xl"
            >
              {{ item.icon }}
            </div>
            <h3 class="mb-3 text-xl font-bold text-(--color-text)">
              {{ item.title }}
            </h3>
            <p class="leading-relaxed text-(--color-muted)">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 text-center">
          <p class="eyebrow mb-2">{{ t("about.why.eyebrow") }}</p>
          <h2 class="text-3xl font-bold text-(--color-text)">
            {{ t("about.why.title") }}
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in whyUs"
            :key="item.title"
            class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 text-center shadow-(--shadow-card) transition hover:-translate-y-1 hover:border-(--color-primary) hover:shadow-lg"
          >
            <div class="mb-4 flex justify-center">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-2xl"
              >
                {{ item.icon }}
              </div>
            </div>
            <h3 class="mb-2 font-bold text-(--color-text)">{{ item.title }}</h3>
            <p class="text-sm leading-relaxed text-(--color-muted)">
              {{ item.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Team -->
    <section class="bg-(--color-surface-soft) px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 text-center">
          <p class="eyebrow mb-2">{{ t("about.team.eyebrow") }}</p>
          <h2 class="text-3xl font-bold text-(--color-text)">
            {{ t("about.team.title") }}
          </h2>
          <p class="mt-3 text-(--color-muted)">
            {{ t("about.team.subtitle") }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div
            v-for="member in team"
            :key="member.name"
            class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-card)"
          >
            <div class="mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full">
              <img
                :src="member.image"
                :alt="member.name"
                class="h-full w-full object-cover object-top"
              />
            </div>

            <h3 class="font-bold text-(--color-text)">{{ member.name }}</h3>
            <p class="mt-1 text-sm text-(--color-muted)">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section
      class="mx-4 mb-16 overflow-hidden rounded-3xl bg-gradient-to-r from-(--color-primary) to-(--color-secondary) px-8 py-14 text-center sm:mx-6 lg:mx-8"
    >
      <h2 class="mb-3 text-3xl font-bold text-white">
        {{ t("about.cta.title") }}
      </h2>
      <p class="mb-8 text-lg text-white/80">{{ t("about.cta.subtitle") }}</p>
      <div class="flex flex-wrap justify-center gap-4">
        <RouterLink
          :to="{ name: 'public.contact' }"
          class="rounded-full bg-white px-8 py-3 font-semibold text-(--color-primary) shadow-lg transition hover:bg-white/90"
        >
          {{ t("about.cta.contact") }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          {{ t("about.cta.browse") }}
        </RouterLink>
      </div>
    </section>

    <!-- THANK -->
    <section class="bg-(--color-surface) px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-16 text-center">
          <h2
            class="relative mb-6 inline-block text-2xl font-bold text-(--color-text) after:absolute after:-bottom-3 after:left-1/2 after:h-1 after:w-24 after:-translate-x-1/2 after:bg-(--color-primary)"
          >
            {{ t("about.thanks.title") }}
          </h2>

          <p class="mt-8 text-xl font-medium text-(--color-muted)">
            {{ t("about.thanks.subtitle") }}
          </p>
          <p
            class="mx-auto mt-6 max-w-4xl leading-loose text-(--color-muted) sm:text-lg"
          >
            {{ t("about.thanks.message") }}
          </p>
        </div>
        <div
          class="grid grid-cols-1 items-center justify-items-center gap-12 border-t border-(--color-border) pt-16 md:grid-cols-3"
        >
          <!-- MPTC -->
          <div class="flex flex-col items-center w-full">
            <img
              src="@/assets/images/about/thanks/mptc_logo.png"
              alt="MPTC Logo"
              class="w-full h-28 object-contain"
            />
          </div>

          <!-- CBRD -->
          <div class="flex flex-col items-center w-full">
            <img
              src="@/assets/images/about/thanks/cbrd_fund_logo.png"
              alt="CBRD Fund Logo"
              class="w-full h-auto object-contain dark:brightness-110"
            />
          </div>

          <!-- ANT -->
          <div class="flex flex-col items-center w-full">
            <img
              src="@/assets/images/about/thanks/ant_logo.png"
              alt="ANT Logo"
              class="w-full h-auto object-contain dark:brightness-110"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
