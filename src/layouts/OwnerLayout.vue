<script setup>
import OwnerHeader from '@/modules/owner/components/layout/OwnerHeader.vue';
import OwnerSidebar from '@/modules/owner/components/layout/OwnerSidebar.vue';
</script>

<template>
  <OwnerHeader />
  <OwnerSidebar />

  <main class="px-8">
    <RouterView />
  </main>
</template>
