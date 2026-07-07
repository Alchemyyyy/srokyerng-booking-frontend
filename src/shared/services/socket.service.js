import { io } from "socket.io-client";

// Anchored to the end — a plain .replace("/api", "") mangles hostnames that
// contain "/api" earlier in the string, e.g. "https://api-example.com/api"
// (the "//api" right after the scheme matches before the intended suffix).
const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

let socket = null;
let authToken = null;

export const socketService = {
  setAuthToken(token) {
    authToken = token || null;
  },

  connect() {
    if (!socket) {
      socket = io(base, {
        withCredentials: true,
        autoConnect: true,
        // A callback (not a static object) so socket.io-client re-reads the
        // current token on every (re)connection attempt, rather than baking
        // in whatever token existed the first time connect() was called.
        auth: (cb) => cb({ token: authToken }),
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
  },

  onNotification(callback) {
    this.connect();
    socket.on("notification:new", callback);
  },

  offNotification(callback) {
    if (socket) {
      socket.off("notification:new", callback);
    }
  },

  onAdminActivity(callback) {
    this.connect();
    socket.on("admin:activity", callback);
  },

  offAdminActivity(callback) {
    if (socket) {
      socket.off("admin:activity", callback);
    }
  },
};
