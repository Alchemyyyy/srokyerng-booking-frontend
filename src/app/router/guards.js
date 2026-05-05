import { useAuthStore } from "@/modules/auth/store/authStore";

export const registerRouteGuards = (router) => {
  router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.publicOnly && authStore.isAuthenticated) {
      return { name: "public.properties" };
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: "public.login", query: { redirect: to.fullPath } };
    }

    if (to.meta.roles?.length && !to.meta.roles.includes(authStore.user?.role)) {
      return { name: "public.properties" };
    }

    return true;
  });
};
