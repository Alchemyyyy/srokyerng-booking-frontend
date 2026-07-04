import { createRouter, createWebHistory } from "vue-router";
import { registerRouteGuards } from "@/app/router/guards";

import AdminLayout from "@/layouts/AdminLayout.vue";
import CustomerLayout from "@/layouts/CustomerLayout.vue";
import OwnerLayout from "@/layouts/OwnerLayout.vue";
import PublicLayout from "@/layouts/PublicLayout.vue";

import { adminRoutes } from "@/modules/admin/routes";
import { authRoutes } from "@/modules/auth/routes";
import { homeRoutes } from "@/modules/home/routes";
import { ownerRoutes } from "@/modules/owner/routes";
import { propertyRoutes } from "@/modules/properties/routes";
import { reservationRoutes } from "@/modules/reservations/routes";
import { staticRoutes } from "@/modules/static/routes";
import { ROLES } from "@/shared/constants/roles";
import { reviewRoutes } from "@/modules/reviews/routes";
import {
  adminAnalyticsRoutes,
  ownerAnalyticsRoutes,
} from "@/modules/analytics/routes";
import { chatRoutes } from "@/modules/chats/routes";
import { notificationRoutes } from "@/modules/notifications/routes";
import {
  adminReportRoutes,
  customerReportRoutes,
  ownerReportRoutes,
} from "@/modules/reports/routes";
import { wishlistRoutes } from "@/modules/wishlists/routes";
import { userRoutes } from "@/modules/users/routes";

const withNamePrefix = (routes, prefix) =>
  routes.map((route) => ({
    ...route,
    name: route.name ? `${prefix}.${route.name}` : route.name,
    children: route.children
      ? withNamePrefix(route.children, prefix)
      : route.children,
  }));

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "public",
      component: PublicLayout,
      children: [
        ...withNamePrefix(homeRoutes, "public"),
        ...withNamePrefix(authRoutes, "public"),
        ...withNamePrefix(staticRoutes, "public"),
        ...withNamePrefix(propertyRoutes, "public"),
      ],
    },
    {
      path: "/customer",
      name: "customer",
      component: CustomerLayout,
      meta: { requiresAuth: true, roles: [ROLES.CUSTOMER] },
      children: [
        { path: "", redirect: { name: "customer.reservations" } },
        ...withNamePrefix(reservationRoutes, "customer"),
        ...withNamePrefix(reviewRoutes, "customer"),
        ...withNamePrefix(wishlistRoutes, "customer"),
        ...withNamePrefix(notificationRoutes, "customer"),
        ...withNamePrefix(userRoutes, "customer"),
        ...withNamePrefix(chatRoutes, "customer"),
        ...withNamePrefix(customerReportRoutes, "customer"),
      ],
    },
    {
      path: "/owner",
      name: "owner",
      component: OwnerLayout,
      meta: { requiresAuth: true, roles: [ROLES.OWNER] },
      children: [
        { path: "", redirect: { name: "owner.dashboard" } },
        ...withNamePrefix(ownerRoutes, "owner"),
        ...withNamePrefix(ownerAnalyticsRoutes, "owner"),
        ...withNamePrefix(notificationRoutes, "owner"),
        {
          path: "profile",
          name: "owner.profile",
          component: () => import("@/modules/owner/pages/OwnerProfileView.vue"),
          meta: { title: "Profile" },
        },
        ...withNamePrefix(
          userRoutes.filter((route) => route.name !== "profile"),
          "owner",
        ),
        ...withNamePrefix(chatRoutes, "owner"),
        ...withNamePrefix(ownerReportRoutes, "owner"),
      ],
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminLayout,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
      children: [
        { path: "", redirect: { name: "admin.dashboard" } },
        ...withNamePrefix(adminRoutes, "admin"),
        ...withNamePrefix(adminAnalyticsRoutes, "admin"),
        ...withNamePrefix(notificationRoutes, "admin"),
        ...withNamePrefix(userRoutes, "admin"),
        ...withNamePrefix(adminReportRoutes, "admin"),
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "public.home" },
    },
  ],
});

registerRouteGuards(router);

export default router;
