export const ownerAnalyticsRoutes = [
  {
    path: "analytics",
    name: "analytics",
    component: () => import("@/modules/analytics/pages/OwnerAnalyticsView.vue"),
  },
];

export const adminAnalyticsRoutes = [
  {
    path: "analytics",
    name: "analytics",
    component: () => import("@/modules/analytics/pages/AdminAnalyticsView.vue"),
  },
];
