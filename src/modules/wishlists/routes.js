export const wishlistRoutes = [
  {
    path: "wishlist",
    name: "wishlist",
    component: () => import("@/modules/wishlists/pages/WishlistView.vue"),
    meta: { navbarSolid: true },
  },
];
