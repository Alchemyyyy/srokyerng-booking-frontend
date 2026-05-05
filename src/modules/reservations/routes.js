import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import { ROLES } from "@/shared/constants/roles";

export const reservationRoutes = [
  {
    path: "reservations",
    name: "reservations",
    component: ComingSoonView,
    props: { title: "My Reservations" },
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
];
