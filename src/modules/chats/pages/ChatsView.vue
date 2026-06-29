<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ChatBubbleOvalLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useChatStore } from "../store/chatStore";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import UserAvatar from "@/shared/components/UserAvatar.vue";
import ChatPane from "../components/ChatPane.vue";

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const searchQuery = ref("");
const activeTab = ref("all"); // 'all' or 'unread'
const isDesktop = ref(window.innerWidth >= 1024);

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024;
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  if (authStore.isAuthenticated) {
    await chatStore.fetchConversations();
    // On desktop, auto-select the first conversation if none is active
    if (isDesktop.value && chatStore.conversations.length > 0 && !chatStore.activeConversationId) {
      chatStore.activeConversationId = chatStore.conversations[0].id;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// Filters conversations by active tab and search query
const filteredConversations = computed(() => {
  let list = chatStore.conversations;

  if (activeTab.value === "unread") {
    list = list.filter((c) => c.unread_count > 0);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.other_user_name?.toLowerCase().includes(q) ||
        c.property_name?.toLowerCase().includes(q)
    );
  }

  return list;
});

const selectConversation = (id) => {
  if (isDesktop.value) {
    chatStore.activeConversationId = id;
  } else {
    const prefix = authStore.user?.role === "owner" ? "owner" : "customer";
    router.push({ name: `${prefix}.chat-detail`, params: { conversationId: id } });
  }
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();

  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  // If yesterday, show 'Yesterday'
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Otherwise show date
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
</script>

<template>
  <div class="h-screen bg-(--color-page) text-(--color-text) flex flex-col font-sans overflow-hidden">
    <PublicNavbar />

    <!-- Split view pane container -->
    <main class="flex-grow pt-24 flex overflow-hidden">
      <!-- Left pane: Conversations List -->
      <section
        class="w-full lg:w-[380px] shrink-0 border-r border-(--color-border) flex flex-col h-full bg-(--color-surface)"
      >
        <!-- Header area -->
        <div class="p-4 border-b border-(--color-border) space-y-3 shrink-0">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-black tracking-tight text-(--color-text)">
              Messages
            </h1>
          </div>

          <!-- Search input box -->
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-muted)" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search messages"
              class="w-full pl-10 pr-4 py-2.5 bg-(--color-page) border border-(--color-border) rounded-2xl text-xs text-(--color-text) placeholder-(--color-muted) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition font-medium"
            />
          </div>

          <!-- Tabs (All / Unread) -->
          <div class="flex gap-2">
            <button
              type="button"
              @click="activeTab = 'all'"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
              :class="activeTab === 'all' ? 'bg-(--color-text) text-(--color-page)' : 'border border-(--color-border) text-(--color-text) hover:bg-(--color-surface-soft)'"
            >
              All
            </button>
            <button
              type="button"
              @click="activeTab = 'unread'"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              :class="activeTab === 'unread' ? 'bg-(--color-text) text-(--color-page)' : 'border border-(--color-border) text-(--color-text) hover:bg-(--color-surface-soft)'"
            >
              <span>Unread</span>
              <span
                v-if="chatStore.totalUnreadCount > 0"
                class="h-2 w-2 rounded-full bg-rose-500"
              ></span>
            </button>
          </div>
        </div>

        <!-- Scrollable conversation items list -->
        <div class="flex-1 overflow-y-auto divide-y divide-(--color-border)/50">
          <div v-if="chatStore.listLoading" class="flex flex-col items-center justify-center py-12">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent"></div>
            <p class="text-xs text-(--color-muted) mt-2 font-semibold">Loading conversations...</p>
          </div>

          <div
            v-else-if="filteredConversations.length === 0"
            class="p-8 text-center flex flex-col items-center justify-center h-48"
          >
            <ChatBubbleOvalLeftIcon class="h-10 w-10 text-(--color-muted) mb-3" />
            <h3 class="text-sm font-bold text-(--color-text)">No messages found</h3>
            <p class="text-xs text-(--color-muted) mt-1 leading-relaxed max-w-[200px]">
              {{ searchQuery ? 'Try adjusting your search criteria.' : 'When you contact owners, your chats appear here.' }}
            </p>
          </div>

          <button
            v-else
            v-for="convo in filteredConversations"
            :key="convo.id"
            type="button"
            @click="selectConversation(convo.id)"
            class="w-full flex items-start gap-3.5 px-4 py-4 text-left hover:bg-(--color-surface-soft) transition duration-150 cursor-pointer relative"
            :class="[
              chatStore.activeConversationId === convo.id && isDesktop ? 'bg-(--color-surface-soft) before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-(--color-primary)' : ''
            ]"
          >
            <!-- Participant Avatar -->
            <UserAvatar
              :name="convo.other_user_name"
              :src="convo.other_user_avatar"
              size-class="h-11 w-11 text-sm font-bold shadow-sm"
              class="shrink-0"
            />

            <!-- Convo summary content -->
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-sm text-(--color-text) truncate">
                  {{ convo.other_user_name }}
                </span>
                <span class="text-[9px] font-semibold text-(--color-muted) whitespace-nowrap">
                  {{ formatDate(convo.last_message_at) }}
                </span>
              </div>

              <p class="text-xs font-semibold text-(--color-muted) truncate">
                {{ convo.property_name }}
              </p>

              <p
                class="text-xs truncate max-w-[240px]"
                :class="convo.unread_count > 0 ? 'font-black text-(--color-text)' : 'font-medium text-(--color-muted)'"
              >
                {{ convo.last_message || "No messages yet" }}
              </p>
            </div>

            <!-- Unread Red Indicator Badge -->
            <span
              v-if="convo.unread_count > 0"
              class="absolute right-4 bottom-5 h-2.5 w-2.5 rounded-full bg-rose-500 flex items-center justify-center shrink-0 border border-white dark:border-zinc-900"
            ></span>
          </button>
        </div>
      </section>

      <!-- Right pane: Chat Thread Panel (desktop viewport only) -->
      <section class="hidden lg:flex flex-col flex-1 h-full bg-(--color-page)">
        <div v-if="chatStore.activeConversationId" class="h-full">
          <ChatPane :conversation-id="chatStore.activeConversationId" :show-back-button="false" />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-b from-transparent to-(--color-page-soft)/10">
          <ChatBubbleOvalLeftIcon class="h-16 w-16 text-(--color-muted) mb-4" />
          <h2 class="text-lg font-black text-(--color-text)">No conversation selected</h2>
          <p class="text-sm text-(--color-muted) mt-1.5 max-w-xs leading-relaxed font-semibold">
            Choose a thread from the list on the left side to review message logs.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
