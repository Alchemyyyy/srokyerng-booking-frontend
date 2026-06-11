import ReviewCreateView from "./pages/ReviewCreateView.vue";
import ReviewManagementView from "./pages/ReviewManagementView.vue";

export const reviewRoutes = [
  {
    path: "reservations/:reservationId/review",
    name: "review-create",
    component: ReviewCreateView,
    meta: { requiresAuth: true, roles: ["customer"] },
    beforeEnter: (to) => {
      const id = Number(to.params.reservationId);
      if (!Number.isInteger(id) || id <= 0) {
        return { name: "reviews" };
      }
    },
  },

  {
    path: "reviews",
    name: "reviews",
    component: ReviewManagementView,
    meta: { requiresAuth: true, roles: ["customer"] },
  },
];