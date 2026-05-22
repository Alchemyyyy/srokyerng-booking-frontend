<script setup>
import { useRoute } from "vue-router";
import { useTheme } from "../composables/useTheme";

import logoLight from "@/assets/images/logos/logo.png";
import logoDark from "@/assets/images/logos/logo2.png";

import {
    ChartBarIcon,
    BuildingOffice2Icon,
    KeyIcon,
    CalendarDaysIcon,
    CreditCardIcon
} from '@heroicons/vue/24/outline'

const { currentTheme } = useTheme();

const route = useRoute();

const menuItems = [
    { name: "Dashboard", path: "/owner", icon: ChartBarIcon },
    { name: "Properties", path: "/owner/properties", icon: BuildingOffice2Icon },
    { name: "Rooms", path: "/owner/rooms", icon: KeyIcon },
    { name: "Reservations", path: "/owner/reservations", icon: CalendarDaysIcon },
    { name: "Payment Accounts", path: "/owner/payment-accounts", icon: CreditCardIcon },
];

const isActive = (path) => route.path === path;
</script>

<template>
    <aside
        class="flex h-screen w-64 flex-col border-r border-(--color-border) bg-(--color-surface) transition-colors duration-300 fixed top-0 left-0 z-20">
        <!-- Logo -->
        <div class="flex flex-col h-40 items-center justify-center border-b border-(--color-border) px-6 gap-3">
            <img v-if="currentTheme === 'dark'" :src="logoDark" class="h-20 w-auto brightness-200" />
            <img v-else :src="logoLight" class="h-20 w-auto" />
            <span class="font-kantumruy text-xl font-extrabold tracking-wider leading-none self-center" :class="currentTheme === 'dark'
                ? 'text-(--color-primary) drop-shadow-[0_2px_12px_rgba(37,117,230,0.4)] brightness-125'
                : 'text-(--color-primary) drop-shadow-[0_2px_12px_rgba(37,117,230,0.4)]'
                ">
                ស្រុកយើង
            </span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 px-3 py-6">
            <router-link v-for="item in menuItems" :key="item.path" :to="item.path" :class="[
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.path)
                    ? 'bg-(--color-primary-soft) text-(--color-primary-strong)'
                    : 'text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)',
            ]">
                <span
                    class="mr-3 text-lg flex items-center text-(--color-primary) bg-(--color-primary-soft) rounded-xl p-2">
                    <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
                </span>

                {{ item.name }}

                <span v-if="isActive(item.path)" class="ml-auto h-1.5 w-1.5 rounded-full bg-(--color-primary)"></span>
            </router-link>
        </nav>
    </aside>
</template>