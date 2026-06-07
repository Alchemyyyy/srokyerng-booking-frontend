<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";
import ToastContainer from "@/shared/components/ToastContainer.vue";
const route = useRoute();
const showNavbar = computed(() => !route.meta.publicOnly);
const showFooter = computed(() => !route.meta.publicOnly);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-(--color-page) text-(--color-text)">
    <PublicNavbar v-if="showNavbar" />
    <main class="flex-1">
      <RouterView />
    </main>
    <PublicFooter v-if="showFooter" />
    <ToastContainer />
  </div>
</template>
