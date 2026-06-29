<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import ChatPane from "../components/ChatPane.vue";

const route = useRoute();
const conversationId = computed(() => route.params.conversationId);
</script>

<template>
  <div class="h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans overflow-hidden">
    <PublicNavbar />
    <main class="flex-grow pt-24 overflow-hidden">
      <ChatPane :conversation-id="conversationId" :show-back-button="true" />
    </main>
  </div>
</template>
