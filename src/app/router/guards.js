import { useAuthStore } from "@/modules/auth/store/authStore";
import { ROLES } from "@/shared/constants/roles";

const getLoginRouteForTarget = (to) => {
  if (to.meta.roles?.includes(ROLES.OWNER)) {
    return "public.loginOwner";
  }

  if (to.meta.roles?.includes(ROLES.CUSTOMER)) {
    return "public.loginCustomer";
  }

  return "public.login";
};

export const registerRouteGuards = (router) => {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    await authStore.restoreSession();

    if (to.meta.publicOnly && authStore.isAuthenticated) {
      return { name: "public.properties" };
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: getLoginRouteForTarget(to), query: { redirect: to.fullPath } };
    }

    if (to.meta.roles?.length && !to.meta.roles.includes(authStore.user?.role)) {
      return { name: "public.properties" };
    }

    return true;
  });
};
