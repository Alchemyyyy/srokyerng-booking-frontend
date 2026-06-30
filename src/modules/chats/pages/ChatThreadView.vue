<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import ChatPane from "../components/ChatPane.vue";

const route = useRoute();
const authStore = useAuthStore();
const { isSidebarOpen } = useSidebar();
const conversationId = computed(() => route.params.conversationId);
</script>

<template>
  <div
    class="bg-(--color-page) text-(--color-text) flex flex-col font-sans overflow-hidden transition-all duration-300"
    :class="authStore.user?.role === 'owner' ? (isSidebarOpen ? 'fixed top-16 right-0 bottom-0 left-64' : 'fixed top-16 right-0 bottom-0 left-20') : 'h-screen'"
  >
    <PublicNavbar v-if="authStore.user?.role !== 'owner'" />
    <main class="flex-grow overflow-hidden" :class="authStore.user?.role !== 'owner' ? 'pt-24' : ''">
      <ChatPane :conversation-id="conversationId" :show-back-button="true" />
    </main>
  </div>
</template>
