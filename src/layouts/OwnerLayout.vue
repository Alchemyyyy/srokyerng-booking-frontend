<script setup>
import OwnerHeader from '@/modules/owner/components/OwnerHeader.vue';
import OwnerSidebar from '@/modules/owner/components/OwnerSidebar.vue';
</script>

<template>
  <OwnerHeader />
  <OwnerSidebar />

  <main class="ml-64 px-8">
    <RouterView />
  </main>
</template>
