import { ROLES } from "@/shared/constants/roles";

export const ownerAnalyticsRoutes = [
  {
    path: "analytics",
    name: "owner.analytics",
    component: () => import("@/modules/analytics/pages/OwnerAnalyticsView.vue"),
    meta: { requiresAuth: true, roles: [ROLES.OWNER] } // សម្រួលឱ្យត្រូវតាមប្រព័ន្ធរួម
  },
];

export const adminAnalyticsRoutes = [
  {
    path: "analytics",
    name: "admin.analytics", // ប្រើឈ្មោះជាក់លាក់សម្រាប់ Admin Analytics
    component: () => import("@/modules/analytics/pages/AdminAnalyticsView.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true, // រក្សាទុកសម្រាប់ Guard ចាស់ (បើមាន)
      roles: [ROLES.ADMIN] // 🌟 ប្រើទម្រង់ Array ស្របតាម Admin Module
    },
  },
];