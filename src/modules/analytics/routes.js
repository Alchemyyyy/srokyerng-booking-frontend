export const ownerAnalyticsRoutes = [
  {
    path: "analytics",
    name: "owner.analytics",
    component: () => import("@/modules/analytics/pages/OwnerAnalyticsView.vue"),
  },
];

export const adminAnalyticsRoutes = [
  {
    path: "analytics",
    name: "admin.analytics",
    component: () => import("@/modules/analytics/pages/AdminAnalyticsView.vue"),
  },
];
