<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getInitials } from '@/shared/utils/getInitials';
import AppHeader from '@/shared/components/DashboardHeader.vue';

const { t } = useI18n({ useScope: "global" });

const userName = computed(() => t('admin.profile.name'));

const user = computed(() => ({ initials: getInitials(userName.value) }));
</script>

<template>
    <AppHeader :user="user" />
</template>