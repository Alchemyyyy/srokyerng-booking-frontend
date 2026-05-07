export const staticRoutes = [
  {
    path: "about",
    name: "about",
    component: () => import("@/modules/static/pages/AboutView.vue"),
  },
  {
    path: "contact",
    name: "contact",
    component: () => import("@/modules/static/pages/ContactView.vue"),
  },
  {
    path: "color-system",
    name: "color-system",
    component: () => import("@/modules/static/pages/ColorSystemView.vue"),
  },
  {
    path: "components",
    name: "components-demo",
    component: () => import("@/modules/static/pages/ComponentsDemoView.vue"),
  },
  {
    path: "privacy",
    name: "privacy",
    component: () => import("@/modules/static/pages/PrivacyView.vue"),
  },
  {
    path: "terms",
    name: "terms",
    component: () => import("@/modules/static/pages/TermsView.vue"),
  },
];
