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
    class="rounded-md border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
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
        class="!rounded-sm"
        :disabled="saving || !hasChanges"
        :loading="saving"
      >
        {{ t("profile.details.saveProfile") }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
/* Focus behavior for all nested input, select, and textarea fields */
input:focus,
select:focus,
textarea:focus {
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 4px var(--color-accent-soft) !important;
  background-color: var(--color-surface-soft) !important;
  transform: translateY(-1px);
}

/* Base transitions and border optimizations */
input,
select,
textarea {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom premium styling for the select dropdown */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23f59e0b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.85rem center;
  background-size: 1.25em 1.25em;
  background-repeat: no-repeat;
  padding-right: 2.5rem;
}

/* Dropdown option menu background synchronization */
select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}
</style>
