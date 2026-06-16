import { ROLES } from "@/shared/constants/roles";

export const getPostLoginRoute = (user, redirect = null) => {
  if (redirect) {
    return redirect;
  }

  const routeByRole = {
    [ROLES.ADMIN]: { name: "admin.dashboard" },
    [ROLES.OWNER]: { name: "owner.dashboard" },
    [ROLES.CUSTOMER]: { name: "public.home" },
  };

  return routeByRole[user?.role] || { name: "public.properties" };
};
