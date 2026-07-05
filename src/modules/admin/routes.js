import AdminAnalyticsView from "@/modules/analytics/pages/AdminAnalyticsView.vue";
import PropertyApprovalView from "@/modules/admin/pages/PropertyApprovalView.vue";
import PropertyReviewDetail from "@/modules/admin/pages/PropertyReviewDetail.vue";
import ReservationMonitorView from "@/modules/admin/pages/ReservationMonitorView.vue";
import PaymentMonitorView from "@/modules/admin/pages/PaymentMonitorView.vue";
import UserManagementView from "./pages/UserManagementView.vue";
import { ROLES } from "@/shared/constants/roles";

export const adminRoutes = [
  {
    path: "analytics",
    name: "dashboard",
    component: AdminAnalyticsView,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "property-approvals",
    name: "admin.properties.index",
    component: PropertyApprovalView,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "property-approvals/:id/",
    name: "admin.properties.review",
    component: PropertyReviewDetail,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "payment-verifications",
    name: "admin.paymentVerifications", // ⚡ aligned with dashboard.store.js quickLinks
    component: PaymentMonitorView,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "reservations",
    name: "admin.reservations", // ⚡ aligned with dashboard.store.js quickLinks
    component: ReservationMonitorView,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "users",
    name: "admin.users", // ⚡ aligned with dashboard.store.js quickLinks
    component: UserManagementView,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
];
