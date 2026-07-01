<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import HeroSearch from "../components/HeroSearch.vue";
import CategoriesSection from "../components/CategoriesSection.vue";
import FeaturedProperties from "../components/FeaturedProperties.vue";
import WhyChooseUs from "../components/WhyChooseUs.vue";
import CtaSection from "../components/CtaSection.vue";
import PopularDestinations from "../components/PopularDestinations.vue";
import BookingSteps from "../components/BookingSteps.vue";

const { t, locale } = useI18n({ useScope: "global" });
const selectedCategory = ref("all");
</script>

<template>
  <div :class="{ 'font-kantumruy': locale === 'km' }">
    <HeroSearch />
    <CategoriesSection v-model:selected-category="selectedCategory" />
    <FeaturedProperties :selected-category="selectedCategory" />
    <PopularDestinations />
    <BookingSteps />
    <WhyChooseUs />
    <CtaSection />
  </div>
</template>
