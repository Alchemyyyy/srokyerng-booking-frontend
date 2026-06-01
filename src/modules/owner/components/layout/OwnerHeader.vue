<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeader from '@/shared/components/DashboardHeader.vue';
import { getInitials } from '@/shared/utils/getInitials';

const { t } = useI18n();

const userName = computed(() => t('owner.profile.name'));

const user = computed(() => ({ initials: getInitials(userName.value) }));
</script>

<template>
    <AppHeader :user="user" />
</template>