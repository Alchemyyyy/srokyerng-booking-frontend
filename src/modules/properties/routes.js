import SearchView from "@/modules/properties/pages/SearchView.vue";
import PropertyDetailView from "./pages/PropertyDetailView.vue";
import PropertyRoomsView from "../rooms/pages/PropertyRoomsView.vue";
import RoomDetailView from "../rooms/pages/RoomDetailView.vue";

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
  {
    path: "properties/:propertyId/rooms",
    name: "property-rooms",
    component: PropertyRoomsView,
    meta: { navbarSolid: true },
  },
  {
    path: "room/:id",
    name: "room-detail",
    component: RoomDetailView,
    meta: { navbarSolid: true },
  },
];
