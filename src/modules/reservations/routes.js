import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import { ROLES } from "@/shared/constants/roles";
import BookingHistoryView from "./pages/BookingHistoryView.vue";
import BookingDetailView from "./pages/BookingDetailView.vue";
import BookingCreateView from "./pages/BookingCreateView.vue";
import PaymentDetailView from "@/modules/payments/pages/PaymentDetailView.vue";
import PaymentUploadView from "@/modules/payments/pages/PaymentUploadView.vue";


export const reservationRoutes = [
  {
    path: "reservations",
    name: "reservations",
    component: ComingSoonView,
    props: { title: "My Reservations" },
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  {
    path: "booking-history",
    name: "booking-history",
    component: BookingHistoryView,
    meta: { requiresAuth: true, navbarSolid: false, roles: [ROLES.CUSTOMER] },
  },
  {
    path: "booking/create",
    name: "booking-create",
    component: BookingCreateView,
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  {
    path: "booking/:id",
    name: "booking-detail",
    component: BookingDetailView,
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  {
    path: "rooms/:id/book",
    name: "room-book",
    component: BookingCreateView,
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  // ─── Payment routes ───────────────────────────────────────────────
  {
    path: "payments/:paymentId", // ✅ removed leading slash
    name: "payment-detail",
    component: PaymentDetailView,
    meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
  },
  {
    path: "payments/:paymentId/upload", // ✅ removed leading slash
    name: "payment-upload",
    component: PaymentUploadView,
    meta: { requiresAuth: true, navbarSolid: true, roles: [ROLES.CUSTOMER] }, // ✅ added auth
  },
  // routes.js — add this to the existing array
  {
    path: '/customer/reservations/:id',
    name: 'customer.booking-detail',  // ← must match exactly
    component: () => import('./pages/BookingDetailView.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  }
];


