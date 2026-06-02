<script setup>
import { KeyIcon } from "@heroicons/vue/24/outline";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";

defineProps({
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit"]);
</script>

<template>
  <form
    class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
    @submit.prevent="$emit('submit')"
  >
    <div class="mb-5 flex items-center gap-3">
      <KeyIcon class="h-6 w-6 text-(--color-primary)" />
      <div>
        <h2 class="text-xl font-bold">Change password</h2>
        <p class="text-sm text-(--color-muted)">
          You will receive a security notification after changing it.
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <AppInput
        v-model="form.current_password"
        type="password"
        label="Current password"
        :error="errors.current_password"
        required
      />
      <AppInput
        v-model="form.new_password"
        type="password"
        label="New password"
        :error="errors.new_password"
        required
      />
      <AppInput
        v-model="form.confirm_password"
        type="password"
        label="Confirm password"
        :error="errors.confirm_password"
        required
      />
    </div>

    <div class="mt-6 flex flex-col gap-3 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-(--color-muted)">
        Use at least 8 characters. You will stay signed in after a normal password change.
      </p>
      <AppButton
        type="submit"
        variant="secondary"
        class="!rounded-lg"
        :disabled="saving"
        :loading="saving"
      >
        Change password
      </AppButton>
    </div>
  </form>
</template>
