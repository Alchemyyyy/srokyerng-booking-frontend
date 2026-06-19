import { ROLES } from "@/shared/constants/roles";

export const getDashboardRouteByRole = (role) => {
  switch (role) {
    case ROLES.CUSTOMER:
      return { name: "customer.reservations" };
    case ROLES.OWNER:
      return { name: "owner.dashboard" };
    case ROLES.ADMIN:
      return { name: "admin.dashboard" };
    default:
      return null;
  }
};

export const getNotificationRouteByRole = (role) => {
  switch (role) {
    case ROLES.CUSTOMER:
      return { name: "customer.notifications" };
    case ROLES.OWNER:
      return { name: "owner.notifications" };
    case ROLES.ADMIN:
      return { name: "admin.notifications" };
    default:
      return null;
  }
};

export const getProfileRouteByRole = (role) => {
  switch (role) {
    case ROLES.CUSTOMER:
      return { name: "customer.profile" };
    case ROLES.OWNER:
      return { name: "owner.profile" };
    case ROLES.ADMIN:
      return { name: "admin.profile" };
    default:
      return null;
  }
};

export const getSettingsRouteByRole = (role) => {
  switch (role) {
    case ROLES.CUSTOMER:
      return { name: "customer.settings" };
    default:
      return null;
  }
};
