<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import aboutHero from "@/assets/images/about/hero/hero_section.png";
import member1 from "@/assets/images/about/team/member_1.PNG";
import member2 from "@/assets/images/about/team/member_2.png";
import member3 from "@/assets/images/about/team/member_3.png";
import member5 from "@/assets/images/about/team/member_5.png";

const { t, locale } = useI18n({ useScope: "global" });

const storyStats = computed(() => [
  { value: "500+", label: t("about.stats.properties") },
  { value: "4.8 / 5", label: t("about.stats.rating") },
]);

const missionVision = computed(() => [
  {
    icon: "M",
    eyebrow: "01",
    title: t("about.mission.title"),
    desc: t("about.mission.desc"),
    accent: "from-(--color-primary) to-(--color-secondary)",
    chip: "bg-(--color-primary-soft) text-(--color-primary) border-(--color-primary)/15",
  },
  {
    icon: "V",
    eyebrow: "02",
    title: t("about.vision.title"),
    desc: t("about.vision.desc"),
    accent: "from-amber-400 to-orange-500",
    chip: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
]);

const whyUs = computed(() => [
  {
    icon: "M12 21s-6.75-4.35-6.75-10.125a6.75 6.75 0 1113.5 0C18.75 16.65 12 21 12 21zm0-7.5a2.625 2.625 0 100-5.25 2.625 2.625 0 000 5.25z",
    title: t("about.why.local.title"),
    desc: t("about.why.local.desc"),
    highlight: true,
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
    image: null,
  },
  {
    name: t("about.team.members.houn-thanun.name"),
    role: t("about.team.members.houn-thanun.role"),
    image: member5,
  },
  {
    name: t("about.team.members.an-menghour.name"),
    role: t("about.team.members.an-menghour.role"),
    image: null,
  },
]);
</script>

<template>
  <div class="min-h-screen" :class="{ 'font-kantumruy': locale === 'km' }">
    <div class="w-full font-sans antialiased text-slate-800">
      <section
        class="relative w-full h-[450px] flex items-center justify-center bg-[#071324] overflow-hidden"
      >
        <div class="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=95"
            alt="SrokYerng Premium Infinity Pool Resort View"
            class="w-full h-full object-cover object-center transform scale-100"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-black/50 via-[#071324]/65 to-[#071324]/85 mix-blend-multiply"
          ></div>
          <div class="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
        </div>

        <div
          class="relative z-10 max-w-4xl mx-auto text-center px-4 flex flex-col items-center"
        >
          <div
            class="mb-3 text-[#c59d5f] opacity-90 flex items-center justify-center gap-2"
          >
            <div
              class="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#c59d5f]"
            ></div>
            <span class="text-lg font-serif">✥</span>
            <div
              class="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#c59d5f]"
            ></div>
          </div>

          <h1
            class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-md"
          >
            About Us
          </h1>

          <nav
            class="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-widest"
          >
            <a
              href="#"
              class="text-slate-300 hover:text-white transition-colors"
              >Home</a
            >
            <span class="text-[#c59d5f] font-light">/</span>
            <span class="text-[#c59d5f]">About Us</span>
          </nav>
        </div>

        <div
          class="absolute bottom-6 right-8 z-10 text-white/20 animate-pulse pointer-events-none hidden sm:block"
        >
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0l3.5 8.5 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5z"
            />
          </svg>
        </div>
      </section>
    </div>

    <section class="bg-(--color-surface-soft) px-4 py-18 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div
          class="relative overflow-hidden rounded-[36px] border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_24px_70px_rgba(6,41,105,0.12)] sm:p-8 lg:p-10"
        >
          <div
            class="pointer-events-none absolute -left-16 top-12 h-36 w-36 rounded-full bg-(--color-primary-soft) blur-3xl"
          ></div>
          <div
            class="pointer-events-none absolute -right-16 bottom-8 h-40 w-40 rounded-full bg-(--color-secondary-soft)/50 blur-3xl"
          ></div>

          <div class="relative text-center mb-10">
            <div
              class="inline-flex items-center rounded-full border border-(--color-border) bg-(--color-surface-soft) px-4 py-1.5 mb-4"
            >
              <span
                class="text-[11px] font-bold uppercase tracking-[0.22em] text-(--color-primary)"
              >
                {{ t("about.mission.eyebrow") }}
              </span>
            </div>
            <h2
              class="text-3xl font-black leading-tight text-(--color-text) sm:text-[2.4rem]"
            >
              {{ t("about.mission.sectionTitle") }}
            </h2>
          </div>

          <div class="relative grid gap-6 lg:grid-cols-2">
            <!-- Mission Card -->
            <div
              class="relative overflow-hidden rounded-[28px] border border-transparent bg-gradient-to-br from-(--color-primary) to-(--color-secondary) p-8 text-white shadow-[0_24px_50px_rgba(18,104,180,0.28)]"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/15 mb-6"
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
                    stroke-width="1.8"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <span
                class="absolute right-6 top-6 text-[11px] font-bold tracking-[0.22em] text-white/70"
                >01</span
              >
              <h3 class="text-xl font-bold">{{ t("about.mission.title") }}</h3>
              <p class="mt-3 text-sm leading-7 text-white/82">
                {{ t("about.mission.desc") }}
              </p>
            </div>

            <!-- Vision Card -->
            <div
              class="relative overflow-hidden rounded-[28px] border border-(--color-border) bg-(--color-surface-soft) p-8 shadow-[0_12px_30px_rgba(6,41,105,0.08)]"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-surface) text-(--color-primary) ring-1 ring-(--color-border) mb-6"
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
                    stroke-width="1.8"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span
                class="absolute right-6 top-6 text-[11px] font-bold tracking-[0.22em] text-(--color-muted)"
                >02</span
              >
              <h3 class="text-xl font-bold text-(--color-text)">
                {{ t("about.vision.title") }}
              </h3>
              <p class="mt-3 text-sm leading-7 text-(--color-muted)">
                {{ t("about.vision.desc") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

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
            <div
              class="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-(--color-surface-soft)"
            >
              <img
                v-if="member.image"
                :src="member.image"
                :alt="member.name"
                class="h-full w-full object-cover object-top"
              />
              <span v-else class="text-2xl font-bold text-(--color-primary)">
                {{ member.name.charAt(0) }}
              </span>
            </div>

            <h3 class="font-bold text-(--color-text)">{{ member.name }}</h3>
            <p class="mt-1 text-sm text-(--color-muted)">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

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
          <div class="flex w-full flex-col items-center">
            <img
              src="@/assets/images/about/thanks/mptc_logo.png"
              alt="MPTC Logo"
              class="h-28 w-full object-contain"
            />
          </div>

          <div class="flex w-full flex-col items-center">
            <img
              src="@/assets/images/about/thanks/cbrd_fund_logo.png"
              alt="CBRD Fund Logo"
              class="h-auto w-full object-contain dark:brightness-110"
            />
          </div>

          <div class="flex w-full flex-col items-center">
            <img
              src="@/assets/images/about/thanks/ant_logo.png"
              alt="ANT Logo"
              class="h-auto w-full object-contain dark:brightness-110"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
