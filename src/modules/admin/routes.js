import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import { ROLES } from "@/shared/constants/roles";

export const adminRoutes = [
  {
    path: "",
    name: "dashboard",
    component: ComingSoonView,
    props: { title: "Admin Dashboard" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
];
