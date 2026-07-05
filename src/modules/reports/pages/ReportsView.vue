<template>
  <ComingSoonView :title="t('reportsPage.reportsTitle')" />
</template>

<script setup>
import ComingSoonView from "@/shared/components/ComingSoonView.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
</script>
