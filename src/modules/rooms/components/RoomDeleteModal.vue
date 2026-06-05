<script setup>
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";

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
  <AppModal :open="open" title="Delete Room" @close="$emit('close')">
    <p class="text-sm text-(--color-muted)">
      Are you sure you want to delete
      <span class="font-semibold text-(--color-text)">
        {{ room?.type }}
      </span>
      ? This action cannot be undone.
    </p>

    <template #footer>
      <AppButton variant="secondary" type="button" @click="$emit('close')">
        Cancel
      </AppButton>
      <AppButton variant="danger" type="button" @click="$emit('confirm')">
        Delete Room
      </AppButton>
    </template>
  </AppModal>
</template>
