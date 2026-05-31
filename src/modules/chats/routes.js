export const chatRoutes = [
  {
    path: "chats",
    name: "chats",
    component: () => import("@/modules/chats/pages/ChatsView.vue"),
  },
  {
    path: "chats/:conversationId",
    name: "chat-detail",
    component: () => import("@/modules/chats/pages/ChatThreadView.vue"),
  },
];
