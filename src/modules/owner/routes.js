import AnalyticsDashboardView from "@/modules/owner/pages/AnalyticsDashboardView.vue";
import OwnerPaymentAccountsView from "@/modules/payments/pages/OwnerPaymentAccountsView.vue";
import MyPropertiesView from "@/modules/properties/pages/OwnerPropertiesView.vue";
import OwnerPropertyDetailView from "@/modules/properties/pages/OwnerPropertyDetailView.vue";
import OwnerReservationsView from "@/modules/reservations/pages/OwnerReservationsView.vue";
import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";
import AmenityManagementView from "@/modules/amenities/pages/AmenityManagementView.vue";
import OwnerRoomDetailView from "../rooms/pages/OwnerRoomDetailView.vue";
import OwnerPaymentsView from "./pages/OwnerPaymentsView.vue";
import OwnerPaymentDetailView from "./pages/OwnerPaymentDetailsPage.vue";

export const ownerRoutes = [
  {
    path: "",
    name: "dashboard",
    component: AnalyticsDashboardView,
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
  },
  {
    path: "reservations",
    name: "reservations",
    component: OwnerPaymentsView,
  },
  {
    path: "reservations/:id",
    name: "reservation-payment-detail",
    component: OwnerPaymentDetailView,
  },
  // {
  //   path: "reservations",
  //   name: "reservations",
  //   component: OwnerReservationsView,
  // },
  // {
  //   path: "/owner/payments",
  //   name: "owner-payments",
  //   component: () => import('./pages/OwnerPaymentsView.vue'),
  // },
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
];
