<script setup>
import AdminHeader from "@/modules/admin/components/layout/AdminHeader.vue";
import AdminSidebar from "@/modules/admin/components/layout/AdminSidebar.vue";
</script>
<template>
  <AdminHeader />
  <AdminSidebar />

  <main class="px-8">
    <RouterView />
  </main>
</template>