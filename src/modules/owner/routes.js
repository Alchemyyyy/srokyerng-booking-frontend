import OwnerDashboardView from "@/modules/owner/pages/OwnerDashboardView.vue";
import OwnerPaymentAccountsView from "@/modules/payments/pages/OwnerPaymentAccountsView.vue";
import MyPropertiesView from "@/modules/properties/pages/MyPropertiesView.vue";
import OwnerReservationsView from "@/modules/reservations/pages/OwnerReservationsView.vue";
import ManageRoomsView from "@/modules/rooms/pages/ManageRoomsView.vue";

export const ownerRoutes = [
  {
    path: "",
    name: "dashboard",
    component: OwnerDashboardView,
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
