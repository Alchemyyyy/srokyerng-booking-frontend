import ReviewCreateView from "./pages/ReviewCreateView.vue";
import ReviewManagementView from "./pages/ReviewManagementView.vue";


export const reviewRoutes = [
  {
    path: "reservations/:reservationId/review",
    name: "review-create",
    component: ReviewCreateView,
  },


  {
    path: "reviews",
    name: "reviews",
    component: ReviewManagementView,
  },
];