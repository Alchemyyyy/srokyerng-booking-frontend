<script setup>
import { KeyIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";

const { t } = useI18n({ useScope: "global" });

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
    class="rounded-md border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
    @submit.prevent="$emit('submit')"
  >
    <div class="mb-5 flex items-center gap-3">
      <KeyIcon class="h-6 w-6 text-(--color-primary)" />
      <div>
        <h2 class="text-xl font-bold">{{ t("profile.password.title") }}</h2>
        <p class="text-sm text-(--color-muted)">
          {{ t("profile.password.description") }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <AppInput
        v-model="form.current_password"
        type="password"
        :label="t('profile.password.current')"
        :error="errors.current_password"
        required
      />
      <AppInput
        v-model="form.new_password"
        type="password"
        :label="t('profile.password.new')"
        :error="errors.new_password"
        required
      />
      <AppInput
        v-model="form.confirm_password"
        type="password"
        :label="t('profile.password.confirm')"
        :error="errors.confirm_password"
        required
      />
    </div>

    <div class="mt-6 flex flex-col gap-3 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-(--color-muted)">
        {{ t("profile.password.helper") }}
      </p>
      <AppButton
        type="submit"
        variant="secondary"
        class="!rounded-sm"
        :disabled="saving"
        :loading="saving"
      >
        {{ t("profile.password.submit") }}
      </AppButton>
    </div>
  </form>
</template>
