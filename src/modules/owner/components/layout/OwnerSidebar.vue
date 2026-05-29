<script setup>
import AppSidebar from "@/shared/components/DashboardSidebar.vue";
import { getInitials } from "@/shared/utils/getInitials";

import logoDark from "@/assets/images/logos/logo2.png";

import {
    ChartBarIcon,
    BuildingOffice2Icon,
    KeyIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

const menuItems = [
    { name: "Dashboard", path: "/owner", icon: ChartBarIcon },
    { name: "Properties", path: "/owner/properties", icon: BuildingOffice2Icon },
    { name: "Rooms", path: "/owner/rooms", icon: KeyIcon },
    { name: "Reservations", path: "/owner/reservations", icon: CalendarDaysIcon },
    { name: "Payment Accounts", path: "/owner/payment-accounts", icon: CreditCardIcon },
];

const bottomItems = [
    { name: 'Settings', path: '/owner/settings', icon: Cog6ToothIcon },
];

const userName = "Owner Name";

const user = {
    initials: getInitials(userName),
    name: userName,
    role: "Property Owner",
};
</script>

<template>
    <AppSidebar :menuItems="menuItems" :bottomItems="bottomItems" :logo="logoDark" title="ស្រុកយើង" navigationLabel="Navigation" :user="user" />
</template>
