import SearchView from "@/modules/properties/pages/SearchView.vue";
import PropertyDetailView from "./pages/PropertyDetailView.vue";

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
];
