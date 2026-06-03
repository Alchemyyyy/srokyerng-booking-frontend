<script setup>
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppTextarea from "@/shared/components/AppTextarea.vue";

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
  hasChanges: {
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
      <UserCircleIcon class="h-6 w-6 text-(--color-primary)" />
      <div>
        <h2 class="text-xl font-bold">{{ t("profile.details.title") }}</h2>
        <p class="text-sm text-(--color-muted)">{{ t("profile.details.description") }}</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <AppInput
        v-model="form.full_name"
        :label="t('profile.details.fullName')"
        :placeholder="t('profile.details.fullNamePlaceholder')"
        :error="errors.full_name"
        required
      />
      <AppInput
        v-model="form.phone"
        :label="t('common.phone')"
        :placeholder="t('profile.details.phonePlaceholder')"
        :error="errors.phone"
      />
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        <span>{{ t("profile.details.gender") }}</span>
        <select
          v-model="form.gender"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none transition focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring)"
        >
          <option value="">{{ t("profile.details.preferNotToSay") }}</option>
          <option value="male">{{ t("profile.details.male") }}</option>
          <option value="female">{{ t("profile.details.female") }}</option>
          <option value="other">{{ t("profile.details.other") }}</option>
        </select>
      </label>
      <AppInput
        v-model="form.date_of_birth"
        type="date"
        :label="t('profile.details.dateOfBirth')"
        :error="errors.date_of_birth"
      />
      <div class="md:col-span-2">
        <AppTextarea
          v-model="form.address"
          :label="t('profile.details.address')"
          :placeholder="t('profile.details.addressPlaceholder')"
          rows="3"
        />
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-(--color-muted)">
        <span v-if="hasChanges" class="font-semibold text-(--color-warning)">
          {{ t("profile.details.unsavedChanges") }}
        </span>
        <span v-else>
          {{ t("profile.details.helper") }}
        </span>
      </p>
      <AppButton
        type="submit"
        class="!rounded-lg"
        :disabled="saving || !hasChanges"
        :loading="saving"
      >
        {{ t("profile.details.saveProfile") }}
      </AppButton>
    </div>
  </form>
</template>
