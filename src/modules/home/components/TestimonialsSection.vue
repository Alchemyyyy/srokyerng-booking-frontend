<template>
  <section
    class="bg-(--color-surface-soft) py-16 px-4"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-7xl mx-auto text-center">
      <span
        class="text-xs font-bold uppercase tracking-widest text-(--color-primary)"
      >
        {{ t("home.testimonials.eyebrow") }}
      </span>
      <h2 class="mt-2 text-3xl font-extrabold text-(--color-text) sm:text-4xl">
        {{ t("home.testimonials.title") }}
      </h2>
      <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="flex flex-col justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 shadow-sm transition hover:shadow-md"
        >
          <div>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white"
                >
                  {{ testimonial.initials }}
                </div>
                <div class="text-left">
                  <h3 class="text-sm font-bold text-(--color-text)">
                    {{ testimonial.name }}
                  </h3>
                  <p
                    class="text-xs text-(--color-muted) uppercase tracking-tight"
                  >
                    {{ testimonial.location }}
                  </p>
                </div>
              </div>
              <div class="flex gap-0.5 text-yellow-400">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="h-4 w-4 fill-current"
                  :class="i > testimonial.rating ? 'text-(--color-border)' : ''"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
            </div>
            <p
              class="mt-6 text-left text-sm italic leading-relaxed text-(--color-muted)"
            >
              "{{ testimonial.quote }}"
            </p>
          </div>
          <div
            class="mt-8 border-t border-(--color-border) pt-4 flex items-center justify-between text-xs font-medium text-(--color-primary)"
          >
            <span class="hover:underline cursor-pointer">{{
              testimonial.property
            }}</span>
            <span class="text-(--color-muted)">{{ testimonial.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });

const testimonials = computed(() => [
  {
    initials: "SL",
    name: "Sophie Laurent",
    location: "FR France",
    rating: 5,
    quote:
      "Absolutely stunning hotel! The staff were incredibly welcoming and the room was spotless. The pool area is beautiful. Will definitely return on my next visit to Cambodia.",
    property: "Sokha Phnom Penh Hotel",
    date: `${t("home.testimonials.months.march")} 2025`,
  },
  {
    initials: "JW",
    name: "James Whitfield",
    location: "GB UK",
    rating: 5,
    quote:
      "The most beautiful resort I have ever stayed at. Waking up to the sound of the ocean every morning was pure bliss. The staff went above and beyond.",
    property: "Pearl Island Beach Resort",
    date: `${t("home.testimonials.months.february")} 2025`,
  },
  {
    initials: "YT",
    name: "Yuki Tanaka",
    location: "JP Japan",
    rating: 4,
    quote:
      "Such a peaceful and authentic experience. The family running the homestay were so kind and cooked delicious local food. Great value for money!",
    property: "Mango Riverside Lodge",
    date: `${t("home.testimonials.months.january")} 2025`,
  },
]);
</script>
