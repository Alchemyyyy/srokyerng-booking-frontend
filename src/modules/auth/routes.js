export const authRoutes = [
  {
    path: "login",
    name: "login",
    redirect: { name: "public.loginCustomer" },
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "login/customer",
    name: "loginCustomer",
    component: () => import("@/modules/auth/pages/LoginView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "login/owner",
    name: "loginOwner",
    component: () => import("@/modules/auth/pages/LoginView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "login/admin",
    name: "loginAdmin",
    component: () => import("@/modules/auth/pages/LoginView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "register",
    name: "register",
    redirect: { name: "public.registerCustomer" },
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "register/customer",
    name: "registerCustomer",
    component: () => import("@/modules/auth/pages/RegisterView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "register/owner",
    name: "registerOwner",
    component: () => import("@/modules/auth/pages/RegisterView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "forgot-password",
    name: "forgotPassword",
    component: () => import("@/modules/auth/pages/ForgotPasswordView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "reset-password",
    name: "resetPassword",
    component: () => import("@/modules/auth/pages/ResetPasswordView.vue"),
    meta: { publicOnly: true, transition: 'page-fade' },
  },
  {
    path: "verify-email",
    name: "verifyEmail",
    component: () => import("@/modules/auth/pages/VerifyEmailView.vue"),
  },
];
