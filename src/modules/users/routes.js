export const userRoutes = [
  {
    path: "profile",
    name: "profile",
    component: () => import("@/modules/users/pages/ProfileView.vue"),
    meta: { title: "Profile" },
  },
];
