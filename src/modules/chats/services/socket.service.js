import { io } from "socket.io-client";

const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

let socket = null;

export const socketService = {
  connect() {
    if (!socket) {
      socket = io(base, {
        withCredentials: true,
        autoConnect: true,
      });
      console.log("Socket initialized, connecting to:", base);
    } else if (!socket.connected) {
      socket.connect();
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      console.log("Socket disconnected");
    }
  },

  joinConversation(conversationId) {
    this.connect();
    socket.emit("join-conversation", conversationId);
  },

  leaveConversation(conversationId) {
    if (socket) {
      socket.emit("leave-conversation", conversationId);
    }
  },

  onNewMessage(callback) {
    this.connect();
    socket.on("new-message", callback);
  },

  offNewMessage(callback) {
    if (socket) {
      socket.off("new-message", callback);
    }
  },

  onMessageUnsent(callback) {
    this.connect();
    socket.on("message-unsent", callback);
  },

  offMessageUnsent(callback) {
    if (socket) {
      socket.off("message-unsent", callback);
    }
  }
};
