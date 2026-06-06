<script setup>
import { getInitials } from '@/shared/utils/getInitials';
import AppHeader from '@/shared/components/DashboardHeader.vue';

const userName = 'Admin Name';

const user = { initials: getInitials(userName), };
</script>

<template>
    <AppHeader :user="user" />
</template>