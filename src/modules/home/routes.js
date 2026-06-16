import HomeView from "@/modules/home/pages/HomeView.vue";
import ListPropertyView from "@/modules/home/pages/ListPropertyView.vue";

export const homeRoutes = [
  {
    path: "",
    name: "home",
    component: HomeView,
  },
  {
    path: "list-your-property",
    name: "listProperty",
    component: ListPropertyView,
  },
];
