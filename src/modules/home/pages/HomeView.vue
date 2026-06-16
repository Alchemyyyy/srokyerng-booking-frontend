<script setup>
import { useI18n } from "vue-i18n";
import HeroSearch from "../components/HeroSearch.vue";
import CategoriesSection from "../components/CategoriesSection.vue";
import FeaturedProperties from "../components/FeaturedProperties.vue";
import WhyChooseUs from "../components/WhyChooseUs.vue";
import CtaSection from "../components/CtaSection.vue";
import PopularDestinations from "../components/PopularDestinations.vue";
import BookingSteps from "../components/BookingSteps.vue";
import TestimonialsSection from "../components/TestimonialsSection.vue";

const { t } = useI18n({ useScope: "global" });
</script>

<template>
  <div>
    <HeroSearch />
    <CategoriesSection />
    <FeaturedProperties />
    <PopularDestinations />
    <BookingSteps />
    <!-- <TestimonialsSection /> -->
    <WhyChooseUs />
    <CtaSection />
  </div>
</template>
