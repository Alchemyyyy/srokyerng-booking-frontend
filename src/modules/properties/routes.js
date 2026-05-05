import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import { ROLES } from "@/shared/constants/roles";

export const propertyRoutes = [
  {
    path: "properties",
    name: "properties",
    component: ComingSoonView,
    props: { title: "Browse Properties" },
  },
];

export const ownerPropertyRoutes = [
  {
    path: "",
    name: "dashboard",
    component: ComingSoonView,
    props: { title: "Owner Dashboard" },
    meta: { requiresAuth: true, roles: [ROLES.OWNER] },
  },
];
