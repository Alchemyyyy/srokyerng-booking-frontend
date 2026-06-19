export const userRoutes = [
  {
    path: "profile",
    name: "profile",
    component: () => import("@/modules/users/pages/ProfileView.vue"),
    meta: { title: "Profile" },
  },
  {
    path: "settings",
    name: "settings",
    component: () => import("@/modules/users/pages/CustomerSettingsView.vue"),
    meta: { title: "Settings" },
  },
];
