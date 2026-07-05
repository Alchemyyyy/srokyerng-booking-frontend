<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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

const { t } = useI18n({ useScope: "global" });

const menuItems = computed(() => [
  {
    name: t("admin.sidebar.analytics"),
    path: "/admin/analytics",
    icon: ChartBarIcon,
    badge: null,
  },
  {
    name: t("admin.sidebar.properties"),
    path: "/admin/property-approvals",
    icon: BuildingOffice2Icon,
    badge: 3,
  },
  {
    name: t("admin.sidebar.reservations"),
    path: "/admin/reservations",
    icon: CalendarDaysIcon,
    badge: 7,
  },
  {
    name: t("admin.paymentMonitorPage.title"),
    path: "/admin/payment-verifications",
    icon: CreditCardIcon,
    badge: null,
  },

  { name: t("admin.sidebar.users"), path: "/admin/users", icon: UsersIcon, badge: null },
]);

const bottomItems = computed(() => [
  { name: t("admin.sidebar.settings"), path: "/admin/settings", icon: Cog6ToothIcon },
]);

const userName = computed(() => t("admin.profile.name"));

const user = computed(() => ({
  initials: getInitials(userName.value),
  name: userName.value,
  role: t("admin.profile.role"),
}));

const title = computed(() => t("app.name"));
const navigationLabel = computed(() => t("admin.sidebar.navigation"));
</script>

<template>
  <AppSidebar
    :menuItems="menuItems"
    :bottomItems="bottomItems"
    :logo="logoDark"
    :title="title"
    :user="user"
    :navigation-label="navigationLabel"
  />
</template>
