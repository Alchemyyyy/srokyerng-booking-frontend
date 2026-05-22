import AnalyticsDashboardView from "@/modules/owner/pages/AnalyticsDashboardView.vue";
import OwnerPaymentAccountsView from "@/modules/payments/pages/OwnerPaymentAccountsView.vue";
import MyPropertiesView from "@/modules/properties/pages/OwnerPropertiesView.vue";
import OwnerReservationsView from "@/modules/reservations/pages/OwnerReservationsView.vue";
import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";

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
    path: "rooms",
    name: "rooms",
    component: ManageRoomsView,
  },
  {
    path: "reservations",
    name: "reservations",
    component: OwnerReservationsView,
  },
  {
    path: "payment-accounts",
    name: "paymentAccounts",
    component: OwnerPaymentAccountsView,
  },
];
