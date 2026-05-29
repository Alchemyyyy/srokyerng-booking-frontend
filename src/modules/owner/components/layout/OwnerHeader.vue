<script setup>
import AppHeader from '@/shared/components/DashboardHeader.vue';
import { getInitials } from '@/shared/utils/getInitials';

const userName = 'Owner Name';

const user = { initials: getInitials(userName), };
</script>

<template>
    <AppHeader :user="user" />
</template>