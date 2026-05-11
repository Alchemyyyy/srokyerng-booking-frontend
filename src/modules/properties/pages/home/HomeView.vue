<template>
  <div class="home-view">
    <HeroSearch />
    <FeaturedProperties />
    <PopularDestinations />
  </div>
</template>

<script setup>
import HeroSearch from "../components/HeroSearch.vue";
import FeaturedProperties from "../components/FeaturedProperties.vue";
import PopularDestinations from "../components/PopularDestinations.vue";
</script>

<style scoped>
.home-view {
  width: 100%;
}
</style>