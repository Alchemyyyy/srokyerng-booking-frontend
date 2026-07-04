import OwnerAnalyticsView from "@/modules/analytics/pages/OwnerAnalyticsView.vue";
import OwnerPaymentAccountsView from "@/modules/payments/pages/OwnerPaymentAccountsView.vue";
import MyPropertiesView from "@/modules/properties/pages/OwnerPropertiesView.vue";
import OwnerPropertyDetailView from "@/modules/properties/pages/OwnerPropertyDetailView.vue";
import OwnerReservationsView from "@/modules/reservations/pages/OwnerReservationsView.vue";
import OwnerReservationDetailView from "@/modules/reservations/pages/OwnerReservationDetailView.vue";
import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";
import AmenityManagementView from "@/modules/amenities/pages/AmenityManagementView.vue";
import OwnerRoomDetailView from "../rooms/pages/OwnerRoomDetailView.vue";
import BookingCalendarView from "../calendar/pages/BookingCalendarView.vue";
import OwnerPaymentsView from "./pages/OwnerPaymentsView.vue";
import OwnerPaymentDetailView from "./pages/OwnerPaymentDetailView.vue";
import OwnerReviewsView from "./pages/OwnerReviewsView.vue"; // ← NEW

export const ownerRoutes = [
  {
    path: "analytics",
    name: "dashboard",
    component: OwnerAnalyticsView,
  },
  {
    path: "properties",
    name: "properties",
    component: MyPropertiesView,
  },
  {
    path: "properties/:id",
    name: "property-detail",
    component: OwnerPropertyDetailView,
    meta: { parent: { name: "owner.properties", label: "Properties" } },
  },
  {
    path: "rooms",
    name: "rooms",
    component: ManageRoomsView,
  },
  {
    path: "rooms/:id",
    name: "room-detail",
    component: OwnerRoomDetailView,
    meta: { parent: { name: "owner.rooms", label: "Rooms" } },
  },
  {
    path: "booking-calendar",
    name: "bookingCalendar",
    component: BookingCalendarView,
  },
  {
    path: "reservations",
    name: "reservations",
    component: OwnerReservationsView,
  },
  {
    path: "reservations/:id",
    name: "reservation-detail",
    component: OwnerReservationDetailView,
    meta: { parent: { name: "owner.reservations", label: "Reservations" } },
  },
  {
    path: "payments",
    name: "payments",
    component: OwnerPaymentsView,
  },
  {
    path: "payments/:id",
    name: "payment-detail",
    component: OwnerPaymentDetailView,
    meta: { parent: { name: "owner.payments", label: "Payments & Refunds" } },
  },
  {
    path: "payment-accounts",
    name: "paymentAccounts",
    component: OwnerPaymentAccountsView,
  },
  {
    path: "amenities",
    name: "amenities",
    component: AmenityManagementView,
  },
  {
    path: "amenities/:id",
    name: "propertyAmenities",
    component: AmenityManagementView,
  },
  // ── Reviews ────────────────────────────────────────────────────────
  {
    path: "reviews",
    name: "reviews",
    component: OwnerReviewsView,
    meta: { requiresAuth: true },
  },
];