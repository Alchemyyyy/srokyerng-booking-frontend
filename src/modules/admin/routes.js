import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import AdminAnalyticsView from "@/modules/analytics/pages/AdminAnalyticsView.vue";
import PropertyApprovalView from "@/modules/admin/pages/PropertyApprovalView.vue";
import PropertyApprovalDetail from "@/modules/admin/pages/PropertyApprovalDetailView.vue";
import PropertyReviewDetail from "@/modules/admin/pages/PropertyReviewDetail.vue";
import { ROLES } from "@/shared/constants/roles";
// import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";

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
    path: "property-approvals/:id",
    name: "admin.properties.approval.detail",
    component: PropertyApprovalDetail,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: "property-approvals/:id/review",
    name: "admin.properties.review",
    component: PropertyReviewDetail,
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
