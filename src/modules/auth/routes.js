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
  {
    path: "register/customer",
    name: "registerCustomer",
    component: () => import("@/modules/auth/pages/RegisterView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "register/owner",
    name: "registerOwner",
    component: () => import("@/modules/auth/pages/RegisterView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "forgot-password",
    name: "forgotPassword",
    component: () => import("@/modules/auth/pages/ForgotPasswordView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "reset-password",
    name: "resetPassword",
    component: () => import("@/modules/auth/pages/ResetPasswordView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "verify-email",
    name: "verifyEmail",
    component: () => import("@/modules/auth/pages/VerifyEmailView.vue"),
    meta: { publicOnly: true },
  },
];
