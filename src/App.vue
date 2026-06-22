<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/modules/auth/store/authStore";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import ToastContainer from "@/shared/components/ToastContainer.vue";

const authStore = useAuthStore();
const showAppLoader = computed(() => authStore.restoringSession);
</script>

<template>
  <div v-if="showAppLoader" class="app-loading-screen">
    <LoadingSpinner />
  </div>
  <RouterView v-else v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </RouterView>
  <ToastContainer />
</template>
