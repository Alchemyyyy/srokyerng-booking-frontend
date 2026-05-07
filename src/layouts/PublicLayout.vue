<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";

const route = useRoute();
const showNavbar = computed(() => !route.meta.publicOnly);
</script>

<template>
  <div class="min-h-screen bg-(--color-page) text-(--color-text)">
    <PublicNavbar v-if="showNavbar" />
    <RouterView />
  </div>
</template>
