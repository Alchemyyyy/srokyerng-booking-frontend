<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AppSidebar from "@/shared/components/DashboardSidebar.vue";
import { getInitials } from "@/shared/utils/getInitials";

import logoDark from "@/assets/images/logos/logo2.png";

import {
  ChartBarIcon,
  BuildingOffice2Icon,
  KeyIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const menuItems = computed(() => [
  { name: t("owner.sidebar.dashboard"), path: "/owner", icon: ChartBarIcon },
  {
    name: t("owner.sidebar.properties"),
    path: "/owner/properties",
    icon: BuildingOffice2Icon,
  },
  { name: t("owner.sidebar.rooms"), path: "/owner/rooms", icon: KeyIcon },
  {
    name: t("owner.sidebar.amenities"),
    path: "/owner/amenities",
    icon: SparklesIcon,
  },
  {
    name: t("owner.sidebar.bookingCalendar"),
    path: "/owner/booking-calendar",
    icon: CalendarIcon,
  },
  {
    name: t("owner.sidebar.reservations"),
    path: "/owner/reservations",
    icon: CalendarDaysIcon,
  },
  {
    name: t("owner.sidebar.payments"),
    path: "/owner/payments",
    icon: BanknotesIcon,
  },
  {
    name: t("owner.sidebar.messages"),
    path: "/owner/chats",
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
  {
    name: t("owner.sidebar.reviews"),
    path: "/owner/reviews",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: t("owner.sidebar.paymentAccounts"),
    path: "/owner/payment-accounts",
    icon: CreditCardIcon,
  },
]);

const bottomItems = computed(() => [
  {
    name: t("owner.sidebar.settings"),
    path: "/owner/settings",
    icon: Cog6ToothIcon,
  },
]);

const userName = computed(() => t("owner.profile.name"));

const user = computed(() => ({
  initials: getInitials(userName.value),
  name: userName.value,
  role: t("owner.profile.role"),
}));

const title = computed(() => t("app.name"));
const navigationLabel = computed(() => t("owner.sidebar.navigation"));
</script>

<template>
  <AppSidebar
    :menuItems="menuItems"
    :bottomItems="bottomItems"
    :logo="logoDark"
    :title="title"
    :navigation-label="navigationLabel"
    :user="user"
  />
</template>