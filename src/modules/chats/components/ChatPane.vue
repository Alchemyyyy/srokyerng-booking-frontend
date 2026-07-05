<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  MicrophoneIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useChatStore } from "../store/chatStore";
import { socketService } from "../services/socket.service";
import UserAvatar from "@/shared/components/UserAvatar.vue";

const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);

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

// Track active socket room
let activeRoomId = null;

const handleRealtimeNewMessage = (msg) => {
  if (Number(msg.conversation_id) === Number(props.conversationId)) {
    const exists = chatStore.messages.some((m) => m.id === msg.id);
    if (!exists) {
      chatStore.messages.push(msg);
      
      const convo = chatStore.conversations.find((c) => c.id === Number(props.conversationId));
      if (convo) {
        convo.last_message = msg.message_body || t("chats.pane.fallback.sentImage");
        convo.last_message_at = msg.created_at;
      }
    }
  }
};

const handleRealtimeMessageUnsent = ({ conversationId, messageId }) => {
  if (Number(conversationId) === Number(props.conversationId)) {
    chatStore.messages = chatStore.messages.filter((m) => m.id !== messageId);
  }
};

onMounted(() => {
  socketService.connect();
  socketService.onNewMessage(handleRealtimeNewMessage);
  socketService.onMessageUnsent(handleRealtimeMessageUnsent);
});

onUnmounted(() => {
  if (activeRoomId) {
    socketService.leaveConversation(activeRoomId);
  }
  socketService.offNewMessage(handleRealtimeNewMessage);
  socketService.offMessageUnsent(handleRealtimeMessageUnsent);

  // If the user navigates away mid-recording, stop the timer and release
  // the microphone instead of leaving both running on a torn-down component.
  clearInterval(durationInterval);
  if (mediaRecorder.value && mediaRecorder.value.state !== "inactive") {
    mediaRecorder.value.stop();
  }
  activeMediaStream?.getTracks().forEach((track) => track.stop());
});

// Watch for conversation changes and load messages
watch(
  () => props.conversationId,
  async (newId) => {
    if (newId) {
      if (activeRoomId) {
        socketService.leaveConversation(activeRoomId);
      }
      activeRoomId = newId;
      socketService.joinConversation(newId);

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

const handleUnsend = async (messageId) => {
  if (confirm(t("chats.pane.confirm.unsend"))) {
    try {
      await chatStore.unsendMessage(props.conversationId, messageId);
    } catch (err) {
      console.error("Failed to unsend message", err);
    }
  }
};

// ── Voice Recording Setup ──
const isRecording = ref(false);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const recordingDuration = ref(0);
let durationInterval = null;
let activeMediaStream = null;

const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const isAudioFile = (url) => {
  if (!url) return false;
  // Signed attachment URLs append `?exp=...&sig=...` after the extension,
  // so the extension check must run against the path only, not the query string.
  const path = url.split("?")[0].toLowerCase();
  return /\.(webm|mp3|ogg|wav|m4a|aac|opus|mp4)$/.test(path) || path.includes("voice_note") || path.includes("audio");
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeMediaStream = stream;
    audioChunks.value = [];
    mediaRecorder.value = new MediaRecorder(stream);
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });
      const file = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: "audio/webm" });
      
      // Clear file and set preview
      clearFile();
      selectedFile.value = file;
      filePreviewUrl.value = URL.createObjectURL(file);
      
      // Release tracks
      stream.getTracks().forEach((track) => track.stop());
      activeMediaStream = null;

      // Automatically send voice note
      await handleSend();
    };

    isRecording.value = true;
    recordingDuration.value = 0;
    clearInterval(durationInterval);
    durationInterval = setInterval(() => {
      recordingDuration.value++;
    }, 1000);

    mediaRecorder.value.start();
  } catch (err) {
    console.error("Microphone access denied or error:", err);
    alert(t("chats.pane.errors.micDenied"));
  }
};

const stopRecording = (shouldSend = true) => {
  if (mediaRecorder.value && mediaRecorder.value.state !== "inactive") {
    clearInterval(durationInterval);
    if (!shouldSend) {
      // Discard recording logic
      mediaRecorder.value.onstop = () => {
        audioChunks.value = [];
        isRecording.value = false;
      };
    }
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
};

const cancelRecording = () => {
  stopRecording(false);
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
            <span>{{ activeConversation.property_name || t("chats.pane.defaultPropertyName") }}</span>
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
        <p class="text-xs text-(--color-muted) mt-3 font-semibold">{{ t("chats.pane.loading") }}</p>
      </div>

      <div v-else-if="groupedMessages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="h-12 w-12 rounded-full bg-(--color-surface-soft) flex items-center justify-center text-(--color-muted) mb-4">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-sm font-bold text-(--color-text)">{{ t("chats.pane.empty.title") }}</h3>
        <p class="text-xs text-(--color-muted) mt-1 max-w-xs leading-relaxed">
          {{ t("chats.pane.empty.subtitle") }}
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
          class="flex flex-col group/msg"
          :class="msg.sender_id === authStore.user?.id ? 'items-end' : 'items-start'"
        >
          <!-- Message Row with Unsend Option -->
          <div class="flex items-center gap-2 max-w-[70%]" :class="msg.sender_id === authStore.user?.id ? 'flex-row-reverse' : 'flex-row'">
            <!-- Message Bubble -->
            <div
              class="rounded-2xl px-4 py-3 shadow-xs text-sm leading-relaxed"
              :class="
                msg.sender_id === authStore.user?.id
                  ? 'bg-(--color-primary) text-white rounded-tr-xs font-medium'
                  : 'bg-(--color-surface) text-(--color-text) rounded-tl-xs border border-(--color-border)/40 font-medium'
              "
            >
              <!-- Image / Audio Attachment -->
              <div v-if="msg.attachment_url">
                <!-- Audio Player -->
                <div v-if="isAudioFile(msg.attachment_url)" class="mb-2 w-64 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-(--color-border)/30">
                  <audio :src="getImageUrl(msg.attachment_url)" controls class="w-full h-8 outline-hidden"></audio>
                </div>
                <!-- Image view -->
                <div v-else class="mb-2 max-w-sm overflow-hidden rounded-xl border border-black/5">
                  <img
                    :src="getImageUrl(msg.attachment_url)"
                    :alt="t('chats.pane.attachmentAlt')"
                    class="w-full h-auto object-cover max-h-60"
                  />
                </div>
              </div>
              <!-- Message Body -->
              <p v-if="msg.message_body" class="whitespace-pre-wrap break-words">{{ msg.message_body }}</p>
            </div>

            <!-- Unsend Button (shown on hover, only for user's own messages) -->
            <button
              v-if="msg.sender_id === authStore.user?.id"
              type="button"
              @click="handleUnsend(msg.id)"
              class="opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150 p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 active:scale-90 border-none cursor-pointer flex items-center justify-center shrink-0"
              :title="t('chats.pane.actions.unsendTitle')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Time and Read Status -->
          <div class="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-semibold text-(--color-muted)">
            <span>{{ formatTime(msg.created_at) }}</span>
            <span v-if="msg.sender_id === authStore.user?.id">•</span>
            <span v-if="msg.sender_id === authStore.user?.id">
              {{ msg.is_read ? t('chats.pane.status.read') : t('chats.pane.status.sent') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Footer Bar -->
    <footer class="p-4 bg-(--color-surface) border-t border-(--color-border) shrink-0 space-y-3">
      <!-- File Selector Preview Panel -->
      <!-- File Selector Preview Panel -->
      <div v-if="filePreviewUrl" class="relative inline-flex rounded-xl overflow-hidden border border-(--color-border) p-1 bg-(--color-page)">
        <img v-if="!isAudioFile(selectedFile?.name)" :src="filePreviewUrl" class="h-16 w-16 object-cover rounded-lg" :alt="t('chats.pane.previewAlt')" />
        <div v-else class="h-16 px-4 py-2 bg-(--color-surface-soft) border border-(--color-border) rounded-lg flex items-center gap-2">
          <svg class="h-5 w-5 text-(--color-primary) animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span class="text-xs font-bold text-(--color-text)">{{ t("chats.pane.voiceNoteDraft") }}</span>
        </div>
        <button
          type="button"
          @click="clearFile"
          class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </div>

      <!-- Recording Audio Banner -->
      <div v-if="isRecording" class="flex items-center justify-between w-full bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-2xl animate-pulse">
        <div class="flex items-center gap-3">
          <!-- Red pulsing dot -->
          <div class="h-2.5 w-2.5 bg-rose-600 rounded-full animate-ping"></div>
          <span class="text-xs font-black text-rose-600 uppercase tracking-widest">{{ t("chats.pane.recording.label") }}</span>
          <span class="text-sm font-extrabold text-(--color-text)">{{ formatDuration(recordingDuration) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Discard button -->
          <button
            type="button"
            @click="cancelRecording"
            class="text-xs font-extrabold text-(--color-muted) hover:underline cursor-pointer border-none bg-transparent"
          >
            {{ t("chats.pane.recording.discard") }}
          </button>
          <!-- Done/Send button -->
          <button
            type="button"
            @click="stopRecording(true)"
            class="px-4 py-1.5 rounded-full bg-rose-600 hover:opacity-90 text-white text-xs font-bold shadow-md cursor-pointer border-none"
          >
            {{ t("chats.pane.recording.stopSend") }}
          </button>
        </div>
      </div>

      <div v-else class="flex items-end gap-2.5">
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
          :title="t('chats.pane.actions.addPhoto')"
        >
          <PhotoIcon class="h-6 w-6" />
        </button>

        <!-- Voice Recorder Trigger -->
        <button
          type="button"
          @click="startRecording"
          class="h-11 w-11 flex items-center justify-center rounded-full hover:bg-(--color-surface-soft) text-(--color-muted) hover:text-(--color-text) active:scale-90 transition cursor-pointer"
          :title="t('chats.pane.actions.recordVoice')"
        >
          <MicrophoneIcon class="h-6 w-6" />
        </button>

        <!-- Message input box -->
        <div class="flex-1 relative">
          <textarea
            v-model="messageText"
            rows="1"
            :placeholder="t('chats.pane.placeholders.message')"
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
          <PaperAirplaneIcon class="h-5 w-5" />
        </button>
      </div>
    </footer>
  </div>
</template>
