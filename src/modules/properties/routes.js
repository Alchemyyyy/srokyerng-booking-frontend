import SearchView from "@/modules/properties/pages/SearchView.vue";
import PropertyDetailView from "./pages/PropertyDetailView.vue";
import RoomsView from "../rooms/pages/RoomsView.vue";
import PropertyRoomsView from "../properties/pages/PropertyRoomsView.vue";

export const propertyRoutes = [
  {
    path: "properties",
    name: "properties",
    component: SearchView,
  },
  {
    path: "properties/:id",
    name: "property-detail",
    component: PropertyDetailView,
    meta: { navbarSolid: true },
  },
  // { path: "properties/:propertyId/rooms", component: PropertyRoomsView },
  {
    path: "/properties/:propertyId/rooms",
    name: "property-rooms",
    component: PropertyRoomsView,
  },
  {
    path: "/rooms/:id",
    name: "room-detail",
    component: RoomsView,
  },
];
