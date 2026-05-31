import SearchView from "@/modules/properties/pages/SearchView.vue";
import PropertyDetailView from "./pages/PropertyDetailView.vue";
import PropertyRoomsView from "../rooms/pages/PropertyRoomsView.vue";

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
  { path: "properties/:propertyId/rooms", component: PropertyRoomsView },
];
