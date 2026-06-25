<script setup>
import { getInitials } from "@/shared/utils/getInitials";
import AppSidebar from "@/shared/components/DashboardSidebar.vue";

import logoDark from "@/assets/images/logos/logo2.png";

import {
  ChartBarIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/vue/24/outline";

const menuItems = [
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: ChartBarIcon,
    badge: null,
  },
  {
    name: "Properties",
    path: "/admin/property-approvals",
    icon: BuildingOffice2Icon,
    badge: 3,
  },
  {
    name: "Reservations",
    path: "/admin/reservations",
    icon: CalendarDaysIcon,
    badge: 7,
  },

  { name: "Users", path: "/admin/users", icon: UsersIcon, badge: null },
];

const bottomItems = [
  { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
];

const userName = "Admin Name";

const user = {
  initials: getInitials(userName),
  name: userName,
  role: "Super Admin",
};
</script>

<template>
  <AppSidebar
    :menuItems="menuItems"
    :bottomItems="bottomItems"
    :logo="logoDark"
    title="ស្រុកយើង"
    :user="user"
    navigationLabel="Navigation"
  />
</template>
