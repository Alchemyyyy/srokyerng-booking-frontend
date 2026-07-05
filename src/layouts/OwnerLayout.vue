<script setup>
import OwnerHeader from '@/modules/owner/components/layout/OwnerHeader.vue';
import OwnerSidebar from '@/modules/owner/components/layout/OwnerSidebar.vue';
import { useSidebar } from '@/shared/composables/useSidebar';

const { isSidebarOpen } = useSidebar();
</script>

<template>
  <OwnerHeader />
  <OwnerSidebar />

  <main 
    class="px-8 pt-24 pb-12 min-h-screen transition-all duration-300"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </main>
</template>
