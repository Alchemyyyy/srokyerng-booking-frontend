export const authRoutes = [
  {
    path: "login",
    name: "login",
    component: () => import("@/modules/auth/pages/LoginView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "register",
    name: "register",
    component: () => import("@/modules/auth/pages/RegisterView.vue"),
    meta: { publicOnly: true },
  },
];
