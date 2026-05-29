<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import ContactHero from "@/assets/images/contact/hero/hero_banner.png";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";

const { t, locale } = useI18n({ useScope: "global" });

const form = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
  agree: false,
});

const contactInfo = computed(() => [
  {
    title: t("contact.info.office.title"),
    value: t("contact.info.office.value"),
    icon: MapPinIcon,
  },
  {
    title: t("contact.info.phone.title"),
    value: "+855 23 111 444",
    icon: PhoneIcon,
  },
  {
    title: t("contact.info.hours.title"),
    value: t("contact.info.hours.value"),
    icon: ClockIcon,
  },
  {
    title: t("contact.info.email.title"),
    value: "support@srokyerng.com",
    icon: EnvelopeIcon,
  },
]);

const supportItems = computed(() => [
  {
    title: t("contact.support.booking.title"),
    desc: t("contact.support.booking.desc"),
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: t("contact.support.partners.title"),
    desc: t("contact.support.partners.desc"),
    icon: BuildingOffice2Icon,
  },
  {
    title: t("contact.support.trusted.title"),
    desc: t("contact.support.trusted.desc"),
    icon: ShieldCheckIcon,
  },
]);

const handleSubmit = () => {
  if (!form.value.agree) {
    alert(t("contact.form.alertAgree"));
    return;
  }

  console.log("Form Submitted Data:", { ...form.value });
};
</script>

<template>
  <div
    class="min-h-screen bg-(--color-page) text-(--color-text)"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <section class="relative isolate min-h-[620px] overflow-hidden pt-24">
      <img
        :src="ContactHero"
        alt="SrokYerng contact support"
        class="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,41,105,0.94),rgba(18,104,180,0.78)_45%,rgba(18,104,180,0.18)_100%)]"
      ></div>

      <div
        class="mx-auto grid min-h-[500px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8"
      >
        <div class="max-w-2xl">
          <p
            class="text-xs font-bold uppercase tracking-[0.28em] text-(--color-warning)"
          >
            {{ t("contact.hero.eyebrow") }}
          </p>
          <h1
            class="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {{ t("contact.hero.title") }}
            <span class="block text-(--color-warning)">
              {{ t("contact.hero.titleHighlight") }}
            </span>
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-white/82 sm:text-lg">
            {{ t("contact.hero.subtitle") }}
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <RouterLink :to="{ name: 'public.properties' }">
              <AppButton
                variant="primary"
                size="lg"
                class="w-full !rounded-lg sm:w-auto"
              >
                {{ t("contact.hero.browseBtn") }}
                <ArrowRightIcon class="h-5 w-5" />
              </AppButton>
            </RouterLink>
            <a href="tel:+85523111444">
              <AppButton
                variant="secondary"
                size="lg"
                class="w-full !rounded-lg !border-white/25 !bg-white/10 !text-white backdrop-blur sm:w-auto"
              >
                <PhoneIcon class="h-5 w-5" />
                {{ t("contact.hero.callBtn") }}
              </AppButton>
            </a>
          </div>
        </div>

        <div
          class="hidden rounded-3xl border border-white/15 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-md lg:block"
        >
          <div class="grid gap-3">
            <div
              v-for="item in contactInfo"
              :key="'hero-' + item.title"
              class="flex items-center gap-4 rounded-2xl bg-white/12 p-4 ring-1 ring-white/10"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-(--color-warning)"
              >
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-bold">{{ item.title }}</p>
                <p class="mt-1 text-sm text-white/68">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface-soft) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <aside class="space-y-5">
          <div>
            <p class="eyebrow">{{ t("contact.details.eyebrow") }}</p>
            <h2
              class="mt-3 text-3xl font-black leading-tight text-(--color-text) sm:text-4xl"
            >
              {{ t("contact.details.title") }}
            </h2>
            <p class="mt-4 max-w-xl leading-8 text-(--color-muted)">
              {{ t("contact.details.subtitle") }}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div
              v-for="info in contactInfo"
              :key="info.title"
              class="flex gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
            >
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"
              >
                <component :is="info.icon" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-(--color-text)">
                  {{ info.title }}
                </h3>
                <p class="mt-1 text-sm leading-6 text-(--color-muted)">
                  {{ info.value }}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div
          class="rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-panel) sm:p-8"
        >
          <div class="mb-8">
            <p class="eyebrow">{{ t("contact.form.eyebrow") }}</p>
            <h2 class="mt-2 text-2xl font-black text-(--color-text)">
              {{ t("contact.form.title") }}
            </h2>
            <p class="mt-2 text-sm leading-7 text-(--color-muted)">
              {{ t("contact.form.subtitle") }}
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppInput
                v-model="form.name"
                :label="t('contact.form.name')"
                :placeholder="t('contact.form.namePlaceholder')"
              />
              <AppInput
                v-model="form.email"
                :label="t('contact.form.email')"
                :placeholder="t('contact.form.emailPlaceholder')"
              />
            </div>

            <AppInput
              v-model="form.subject"
              :label="t('contact.form.subject')"
              :placeholder="t('contact.form.subjectPlaceholder')"
            />

            <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
              {{ t("contact.form.message") }}
              <textarea
                v-model="form.message"
                rows="6"
                :placeholder="t('contact.form.messagePlaceholder')"
                class="w-full resize-none rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none transition placeholder:text-(--color-muted) focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring)"
              ></textarea>
            </label>

            <div
              class="flex flex-col gap-4 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <label
                class="flex items-start gap-3 text-sm leading-6 text-(--color-muted)"
              >
                <input
                  v-model="form.agree"
                  type="checkbox"
                  class="mt-1 h-4 w-4 accent-(--color-primary)"
                />
                <span>{{ t("contact.form.agree") }}</span>
              </label>

              <AppButton
                type="submit"
                variant="primary"
                size="lg"
                class="w-full !rounded-lg sm:w-auto"
              >
                {{ t("contact.form.submit") }}
                <ArrowRightIcon class="h-5 w-5" />
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </section>

    <section class="bg-(--color-surface) px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="eyebrow">{{ t("contact.support.eyebrow") }}</p>
            <h2 class="mt-2 text-3xl font-black text-(--color-text) sm:text-4xl">
              {{ t("contact.support.title") }}
            </h2>
          </div>
          <p class="max-w-lg text-sm leading-7 text-(--color-muted)">
            {{ t("contact.support.subtitle") }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <article
            v-for="item in supportItems"
            :key="item.title"
            class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) p-6"
          >
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"
            >
              <component :is="item.icon" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-bold text-(--color-text)">
              {{ item.title }}
            </h3>
            <p class="mt-3 text-sm leading-7 text-(--color-muted)">
              {{ item.desc }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="px-4 pb-20 sm:px-6 lg:px-8">
      <div
        class="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-(--color-primary-strong) via-(--color-primary) to-(--color-secondary) p-8 text-white shadow-(--shadow-panel) lg:grid-cols-[1fr_auto] lg:items-center lg:p-10"
      >
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.26em] text-white/68">
            {{ t("contact.cta.eyebrow") }}
          </p>
          <h2 class="mt-3 text-3xl font-black sm:text-4xl">
            {{ t("contact.cta.title") }}
          </h2>
          <p class="mt-4 max-w-2xl leading-8 text-white/82">
            {{ t("contact.cta.subtitle") }}
          </p>
        </div>

        <RouterLink :to="{ name: 'public.register' }">
          <AppButton
            variant="secondary"
            size="lg"
            class="w-full !rounded-lg !border-transparent !bg-white !text-(--color-primary) sm:w-auto"
          >
            {{ t("contact.cta.button") }}
            <ArrowRightIcon class="h-5 w-5" />
          </AppButton>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
