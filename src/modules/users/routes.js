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
  {
    path: "settings/personal-info",
    name: "personal-info",
    component: () => import("@/modules/users/pages/PersonalInfoView.vue"),
    meta: { title: "Personal Info" },
  },
  {
    path: "settings/login-security",
    name: "login-security",
    component: () => import("@/modules/users/pages/LoginSecurityView.vue"),
    meta: { title: "Login & Security" },
  },
  {
    path: "settings/payments",
    name: "payments-payouts",
    component: () => import("@/modules/users/pages/PaymentsPayoutsView.vue"),
    meta: { title: "Payments & Payouts" },
  },
  {
    path: "settings/notifications",
    name: "notification-settings",
    component: () => import("@/modules/users/pages/NotificationSettingsView.vue"),
    meta: { title: "Notification Settings" },
  },
  {
    path: "settings/privacy",
    name: "privacy-sharing",
    component: () => import("@/modules/users/pages/PrivacySharingView.vue"),
    meta: { title: "Privacy & Sharing" },
  },
  {
    path: "settings/preferences",
    name: "global-preferences",
    component: () => import("@/modules/users/pages/GlobalPreferencesView.vue"),
    meta: { title: "Global Preferences" },
  },
];
