import http from "@/app/api/http";

export const chatService = {
  // Fetch conversations list for authenticated user
  getConversations() {
    return http.get("/chats");
  },

  // Create a conversation
  createConversation(payload) {
    return http.post("/chats", payload);
  },

  // Get messages of a conversation
  getMessages(conversationId) {
    return http.get(`/chats/${conversationId}/messages`);
  },

  // Send a message (takes FormData or standard JSON payload)
  sendMessage(conversationId, payload) {
    // If sending an image attachment, payload is FormData
    const isFormData = payload instanceof FormData;
    return http.post(`/chats/${conversationId}/messages`, payload, {
      headers: {
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    });
  },

  // Mark messages as read
  markAsRead(conversationId) {
    return http.patch(`/chats/${conversationId}/read`);
  },
};
