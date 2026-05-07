<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";

const route = useRoute();
const showNavbar = computed(() => !route.meta.publicOnly);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <PublicNavbar v-if="showNavbar" />
    <RouterView />
  </div>
</template>
