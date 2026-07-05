<script setup>
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";

const { t } = useI18n({ useScope: "global" });

defineProps({
  open: Boolean,
  room: {
    type: Object,
    default: null,
  },
});

defineEmits(["close", "confirm"]);
</script>

<template>
  <AppModal :open="open" :title="t('components.roomDeleteModal.title')" @close="$emit('close')">
    <p class="text-sm text-(--color-muted)">
      {{ t("components.roomDeleteModal.confirmPrefix") }}
      <span class="font-semibold text-(--color-text)">
        {{ room?.type }}
      </span>
      {{ t("components.roomDeleteModal.confirmSuffix") }}
    </p>

    <template #footer>
      <AppButton variant="secondary" type="button" @click="$emit('close')">
        {{ t("components.roomDeleteModal.cancel") }}
      </AppButton>
      <AppButton variant="danger" type="button" @click="$emit('confirm')">
        {{ t("components.roomDeleteModal.confirm") }}
      </AppButton>
    </template>
  </AppModal>
</template>
