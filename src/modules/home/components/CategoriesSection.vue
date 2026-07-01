<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";

const props = defineProps({
  selectedCategory: { type: String, default: "all" },
});

const emit = defineEmits(["update:selectedCategory"]);

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();
const propertyStore = usePropertyStore();

const categories = computed(() => {
  const getCount = (key) => {
    return propertyStore.approvedProperties.filter(
      (p) => String(p.type).toLowerCase() === String(key).toLowerCase()
    ).length;
  };

  return [
    {
      key: "all",
      label: t("home.categories.allStays", "All Stays"),
      count: propertyStore.approvedProperties.length,
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    },
    {
      key: "hotel",
      label: t("home.categories.hotel"),
      count: getCount("hotel"),
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
      key: "guesthouse",
      label: t("home.categories.guesthouse"),
      count: getCount("guesthouse"),
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      key: "homestay",
      label: t("home.categories.homestay"),
      count: getCount("homestay"),
      icon: "M12 3l1.912 5.886H20.1l-4.992 3.634 1.912 5.886L12 14.772l-4.992 3.634 1.912-5.886-4.992-3.634h6.188L12 3z",
    },
    {
      key: "apartment",
      label: t("home.categories.apartment"),
      count: getCount("apartment"),
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1",
    },
    {
      key: "villa",
      label: t("home.categories.villa"),
      count: getCount("villa"),
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      key: "resort",
      label: t("home.categories.resort"),
      count: getCount("resort"),
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      key: "hostel",
      label: t("home.categories.hostel"),
      count: getCount("hostel"),
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ];
});

const handleCategoryClick = (key) => {
  emit("update:selectedCategory", key);
};

onMounted(() => {
  if (!propertyStore.approvedProperties.length) {
    propertyStore.fetchApprovedProperties().catch(() => {});
  }
});
</script>

<template>
  <section
    class="bg-(--color-surface) py-16 px-6 border-b border-(--color-border)/40"
    :class="{ 'font-kantumruy': locale === 'km' }"
  >
    <div class="max-w-6xl mx-auto text-center">
      <!-- Section Headers -->
      <p
        class="text-(--color-primary) font-black tracking-widest text-[10px] uppercase mb-2.5"
      >
        {{ t("home.categories.eyebrow") }}
      </p>

      <h2 class="text-3xl font-black text-(--color-text) tracking-tight mb-12">
        {{ t("home.categories.title") }}
      </h2>

      <!-- Airbnb-Style Horizontal Scroll Categories -->
      <div
        class="flex items-center justify-start md:justify-center gap-8 md:gap-11 overflow-x-auto scrollbar-none pb-4 px-2"
      >
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="flex flex-col items-center pb-2.5 border-b-2 transition-all duration-200 cursor-pointer focus:outline-none shrink-0 group"
          :class="[
            selectedCategory === cat.key
              ? 'opacity-100 border-(--color-primary) text-(--color-primary) font-black'
              : 'border-transparent text-(--color-muted) opacity-60 hover:opacity-100 hover:border-(--color-border)/60'
          ]"
          @click="handleCategoryClick(cat.key)"
        >
          <!-- Icon -->
          <div class="group-hover:scale-105 transition-all duration-200 mb-2"
               :class="selectedCategory === cat.key ? 'text-(--color-primary)' : 'text-(--color-muted) group-hover:text-(--color-text)'">
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
                stroke-width="1.5"
                :d="cat.icon"
              />
            </svg>
          </div>
          
          <!-- Label -->
          <span class="font-bold text-xs tracking-wide">
            {{ cat.label }}
          </span>

          <!-- Places count (clean, tiny subtext) -->
          <span class="text-[9px] font-semibold mt-0.5"
                :class="selectedCategory === cat.key ? 'text-(--color-primary)/80' : 'text-(--color-muted)'">
            {{ cat.count }} {{ t("home.categories.places") }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom hide scrollbar rule */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

<style scoped>
/* Custom hide scrollbar rule */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
