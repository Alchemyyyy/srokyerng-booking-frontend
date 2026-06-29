<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  XMarkIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useChatStore } from "../store/chatStore";
import UserAvatar from "@/shared/components/UserAvatar.vue";

const props = defineProps({
  conversationId: {
    type: [Number, String],
    required: true,
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const messageText = ref("");
const selectedFile = ref(null);
const filePreviewUrl = ref(null);
const fileInput = ref(null);
const messagesContainer = ref(null);

const activeConversation = computed(() => chatStore.activeConversation);

// Scroll container to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Watch for conversation changes and load messages
watch(
  () => props.conversationId,
  async (newId) => {
    if (newId) {
      await chatStore.fetchMessages(newId);
      scrollToBottom();
    }
  },
  { immediate: true }
);

// Watch for message changes (e.g. receiving a message) to scroll
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom();
  }
);

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    filePreviewUrl.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const clearFile = () => {
  selectedFile.value = null;
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = null;
  }
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const handleSend = async () => {
  const text = messageText.value.trim();
  const file = selectedFile.value;

  if (!text && !file) return;

  try {
    messageText.value = "";
    clearFile();
    await chatStore.sendNewMessage(props.conversationId, { text, file });
    scrollToBottom();
  } catch (err) {
    console.error("Failed to send message", err);
  }
};

// Formats absolute URLs dynamically for chats
const getImageUrl = (path) => {
  if (!path) return "";
  const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";
  return path.startsWith("http") ? path : `${base}${path}`;
};

// Helper to group messages by date
const groupedMessages = computed(() => {
  const groups = [];
  chatStore.messages.forEach((msg) => {
    const dateObj = new Date(msg.created_at);
    const dateStr = dateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let group = groups.find((g) => g.date === dateStr);
    if (!group) {
      group = { date: dateStr, messages: [] };
      groups.push(group);
    }
    group.messages.push(msg);
  });
  return groups;
});

const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const goBack = () => {
  const prefix = authStore.user?.role === "owner" ? "owner" : "customer";
  router.push({ name: `${prefix}.chats` });
};
</script>

<template>
  <div class="flex flex-col h-full bg-(--color-page) text-(--color-text) relative">
    <!-- Header -->
    <header class="h-16 border-b border-(--color-border) flex items-center px-4 bg-(--color-surface) shrink-0 gap-3">
      <button
        v-if="showBackButton"
        type="button"
        @click="goBack"
        class="h-9 w-9 rounded-full hover:bg-(--color-surface-soft) flex items-center justify-center text-(--color-muted) hover:text-(--color-text) active:scale-95 transition cursor-pointer"
      >
        <ArrowLeftIcon class="h-5 w-5" />
      </button>

      <div class="flex items-center gap-3 min-w-0" v-if="activeConversation">
        <UserAvatar
          :name="activeConversation.other_user_name"
          :src="activeConversation.other_user_avatar"
          size-class="h-10 w-10 text-sm font-bold shadow-sm"
        />
        <div class="min-w-0">
          <h2 class="font-extrabold text-sm text-(--color-text) truncate">
            {{ activeConversation.other_user_name }}
          </h2>
          <p class="text-[10px] text-(--color-muted) font-semibold flex items-center gap-1.5 truncate">
            <BuildingOffice2Icon class="h-3.5 w-3.5 shrink-0 text-(--color-primary)" />
            <span>{{ activeConversation.property_name || "Conversation thread" }}</span>
          </p>
        </div>
      </div>
    </header>

    <!-- Message Feed -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gradient-to-b from-transparent to-(--color-page-soft)/20"
    >
      <div v-if="chatStore.messagesLoading" class="flex flex-col items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-(--color-primary) border-t-transparent"></div>
        <p class="text-xs text-(--color-muted) mt-3 font-semibold">Loading messages...</p>
      </div>

      <div v-else-if="groupedMessages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="h-12 w-12 rounded-full bg-(--color-surface-soft) flex items-center justify-center text-(--color-muted) mb-4">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-sm font-bold text-(--color-text)">No messages yet</h3>
        <p class="text-xs text-(--color-muted) mt-1 max-w-xs leading-relaxed">
          Start the conversation by typing a message below.
        </p>
      </div>

      <!-- Messages Grouped by Date -->
      <div v-else v-for="group in groupedMessages" :key="group.date" class="space-y-4">
        <!-- Date Separator -->
        <div class="flex justify-center">
          <span class="px-3 py-1 rounded-full bg-(--color-surface-soft) text-[10px] font-bold text-(--color-muted) border border-(--color-border)/30">
            {{ group.date }}
          </span>
        </div>

        <div
          v-for="msg in group.messages"
          :key="msg.id"
          class="flex flex-col"
          :class="msg.sender_id === authStore.user?.id ? 'items-end' : 'items-start'"
        >
          <!-- Message Bubble -->
          <div
            class="max-w-[70%] rounded-2xl px-4 py-3 shadow-xs text-sm leading-relaxed"
            :class="
              msg.sender_id === authStore.user?.id
                ? 'bg-(--color-primary) text-white rounded-tr-xs font-medium'
                : 'bg-(--color-surface) text-(--color-text) rounded-tl-xs border border-(--color-border)/40 font-medium'
            "
          >
            <!-- Image Attachment -->
            <div v-if="msg.attachment_url" class="mb-2 max-w-sm overflow-hidden rounded-xl border border-black/5">
              <img
                :src="getImageUrl(msg.attachment_url)"
                alt="Attachment"
                class="w-full h-auto object-cover max-h-60"
              />
            </div>
            <!-- Message Body -->
            <p v-if="msg.message_body" class="whitespace-pre-wrap break-words">{{ msg.message_body }}</p>
          </div>

          <!-- Time and Read Status -->
          <div class="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-semibold text-(--color-muted)">
            <span>{{ formatTime(msg.created_at) }}</span>
            <span v-if="msg.sender_id === authStore.user?.id">•</span>
            <span v-if="msg.sender_id === authStore.user?.id">
              {{ msg.is_read ? 'Read' : 'Sent' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Footer Bar -->
    <footer class="p-4 bg-(--color-surface) border-t border-(--color-border) shrink-0 space-y-3">
      <!-- File Selector Preview Panel -->
      <div v-if="filePreviewUrl" class="relative inline-flex rounded-xl overflow-hidden border border-(--color-border) p-1 bg-(--color-page)">
        <img :src="filePreviewUrl" class="h-16 w-16 object-cover rounded-lg" alt="Preview image" />
        <button
          type="button"
          @click="clearFile"
          class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </div>

      <div class="flex items-end gap-2.5">
        <!-- Hidden file input -->
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Attachment Button -->
        <button
          type="button"
          @click="triggerFileInput"
          class="h-11 w-11 flex items-center justify-center rounded-full hover:bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text) active:scale-90 transition cursor-pointer"
          title="Add photo"
        >
          <PhotoIcon class="h-6 w-6" />
        </button>

        <!-- Message input box -->
        <div class="flex-1 relative">
          <textarea
            v-model="messageText"
            rows="1"
            placeholder="Type a message..."
            class="w-full rounded-2xl border border-(--color-border) px-4 py-3 text-sm bg-(--color-page) text-(--color-text) placeholder-(--color-muted) focus:outline-hidden focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) resize-none max-h-24 min-h-[44px]"
            @keydown.enter.prevent="handleSend"
          ></textarea>
        </div>

        <!-- Send Button -->
        <button
          type="button"
          @click="handleSend"
          :disabled="!messageText.trim() && !selectedFile"
          class="h-11 w-11 flex items-center justify-center rounded-full bg-(--color-primary) disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90 active:scale-90 transition shadow-md cursor-pointer shrink-0"
        >
          <PaperAirplaneIcon class="h-5 w-5 transform rotate-90" />
        </button>
      </div>
    </footer>
  </div>
</template>
