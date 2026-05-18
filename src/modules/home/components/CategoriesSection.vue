<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();

const categories = computed(() => [
  {
    key: "hotel",
    label: t("home.categories.hotel"),
    count: 185,
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    key: "guesthouse",
    label: t("home.categories.guesthouse"),
    count: 124,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    key: "homestay",
    label: t("home.categories.homestay"),
    count: 89,
    icon: "M12 3l1.912 5.886H20.1l-4.992 3.634 1.912 5.886L12 14.772l-4.992 3.634 1.912-5.886-4.992-3.634h6.188L12 3z",
  },
  {
    key: "apartment",
    label: t("home.categories.apartment"),
    count: 67,
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
  },
  {
    key: "villa",
    label: t("home.categories.villa"),
    count: 43,
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    key: "resort",
    label: t("home.categories.resort"),
    count: 38,
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    key: "hostel",
    label: t("home.categories.hostel"),
    count: 52,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
]);

const goToCategory = (key) => {
  router.push({ name: "public.properties", query: { type: key } });
};
</script>

<template>
  <section
    class="bg-(--color-surface-soft) py-16 px-4"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-6xl mx-auto text-center">
      <p
        class="text-(--color-primary) font-bold tracking-widest text-xs uppercase mb-2"
      >
        {{ t("home.categories.eyebrow") }}
      </p>

      <h2 class="text-3xl md:text-4xl font-extrabold text-(--color-text) mb-12">
        {{ t("home.categories.title") }}
      </h2>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="bg-(--color-surface) p-6 rounded-2xl shadow-(--shadow-card) border border-(--color-border) flex flex-col items-center transition-all hover:scale-105 hover:border-(--color-primary) cursor-pointer"
          @click="goToCategory(cat.key)"
        >
          <div
            class="w-12 h-12 bg-(--color-primary-soft) rounded-xl flex items-center justify-center mb-4 text-(--color-primary)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="cat.icon"
              />
            </svg>
          </div>
          <h3 class="font-bold text-(--color-text) text-sm">
            {{ cat.label }}
          </h3>
          <p class="text-(--color-muted) text-xs mt-1">
            {{ cat.count }} {{ t("home.categories.places") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
