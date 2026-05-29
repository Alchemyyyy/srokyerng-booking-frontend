import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import AdminDashboard from "@/modules/admin/pages/AdminDashboard.vue";
import { ROLES } from "@/shared/constants/roles";
// import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";

export const adminRoutes = [
  {
    path: "",
    name: "dashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "property-approvals",
    name: "propertyApprovals",
    component: ComingSoonView,
    props: { title: "Property Approvals" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "rooms-showcase",
    name: "rooms",
    component: ComingSoonView,
    props: { title: "Rooms Showcase" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "payment-verifications",
    name: "paymentVerifications",
    component: ComingSoonView,
    props: { title: "Payment Verifications" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "reservations",
    name: "reservations",
    component: ComingSoonView,
    props: { title: "Reservation Monitoring" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "users",
    name: "users",
    component: ComingSoonView,
    props: { title: "User Management" },
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
];
