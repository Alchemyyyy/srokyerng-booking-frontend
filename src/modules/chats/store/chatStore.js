import { defineStore } from "pinia";
import { chatService } from "../services/chat.service";

export const useChatStore = defineStore("chat", {
  state: () => ({
    conversations: [],
    messages: [],
    activeConversationId: null,
    listLoading: false,
    messagesLoading: false,
    sendLoading: false,
    error: null,
  }),

  getters: {
    activeConversation: (state) =>
      state.conversations.find((c) => c.id === Number(state.activeConversationId)) || null,
    totalUnreadCount: (state) =>
      state.conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
  },

  actions: {
    // Fetch user's conversation threads
    async fetchConversations() {
      this.listLoading = true;
      this.error = null;
      try {
        const response = await chatService.getConversations();
        // Backend returns standard API envelope { data: [...] } or direct array
        this.conversations = response.data || response || [];
      } catch (err) {
        this.error = err.message || "Failed to load chats";
      } finally {
        this.listLoading = false;
      }
    },

    // Get message history for a conversation thread
    async fetchMessages(conversationId) {
      if (!conversationId) return;
      const requestId = Number(conversationId);
      this.activeConversationId = requestId;
      this.messagesLoading = true;
      this.error = null;
      try {
        const response = await chatService.getMessages(conversationId);
        // If the user has since switched to a different conversation, this
        // response is stale — discard it instead of overwriting newer messages.
        if (this.activeConversationId !== requestId) return;
        this.messages = response.data || response || [];

        // Try marking as read on the backend
        await this.markConversationRead(conversationId);
      } catch (err) {
        if (this.activeConversationId !== requestId) return;
        this.error = err.message || "Failed to load messages";
      } finally {
        if (this.activeConversationId === requestId) {
          this.messagesLoading = false;
        }
      }
    },

    // Send a message (handles plain text or images)
    async sendNewMessage(conversationId, { text, file }) {
      if (!conversationId) return;
      this.sendLoading = true;
      try {
        let payload;
        if (file) {
          payload = new FormData();
          if (text) {
            payload.append("message_body", text);
          }
          payload.append("image", file);
        } else {
          payload = { message_body: text };
        }

        const response = await chatService.sendMessage(conversationId, payload);
        const newMessage = response.data || response;

        // Push new message directly to display list — unless the realtime
        // socket "new-message" event (broadcast to the whole room, including
        // the sender) already delivered this same message first.
        const alreadyReceived = this.messages.some((m) => m.id === newMessage.id);
        if (!alreadyReceived) {
          this.messages.push(newMessage);
        }

        // Update local conversation item to reflect last message
        const convo = this.conversations.find((c) => c.id === Number(conversationId));
        if (convo) {
          convo.last_message = text || "Sent an image";
          convo.last_message_at = new Date().toISOString();
        }

        // Reorder conversations list to show active convo first
        this.conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
        return newMessage;
      } catch (err) {
        this.error = err.message || "Failed to send message";
        throw err;
      } finally {
        this.sendLoading = false;
      }
    },

    // Mark a thread as read locally and remotely
    async markConversationRead(conversationId) {
      const convo = this.conversations.find((c) => c.id === Number(conversationId));
      if (convo && convo.unread_count > 0) {
        convo.unread_count = 0;
        try {
          await chatService.markAsRead(conversationId);
        } catch (err) {
          console.error("Failed to mark conversation read", err);
        }
      }
    },

    // Unsend (delete) a message
    async unsendMessage(conversationId, messageId) {
      try {
        await chatService.unsendMessage(conversationId, messageId);
        // Remove from local messages state
        this.messages = this.messages.filter((m) => m.id !== messageId);

        // Update conversation summary text if needed
        const convo = this.conversations.find((c) => c.id === Number(conversationId));
        if (convo) {
          const lastMsg = this.messages[this.messages.length - 1];
          convo.last_message = lastMsg ? (lastMsg.message_body || "Sent an attachment") : "Message unsent";
        }
      } catch (err) {
        this.error = err.message || "Failed to unsend message";
        throw err;
      }
    },
  },
});
