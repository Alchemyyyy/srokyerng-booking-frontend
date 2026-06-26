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
    class="rounded-3xl border border-(--color-border)/80 bg-(--color-surface)/95 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300"
    @submit.prevent="$emit('submit')"
  >
    <div class="mb-8 flex items-start gap-4 pb-6 border-b border-(--color-border)/60">
      <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary) shadow-inner">
        <UserCircleIcon class="h-8 w-8" />
      </span>
      <div>
        <h2 class="text-2xl font-black tracking-tight text-(--color-text)">{{ t("profile.details.title") }}</h2>
        <p class="mt-1 text-sm leading-relaxed text-(--color-muted) font-medium">{{ t("profile.details.description") }}</p>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/50 p-5 shadow-inner transition-all duration-200 focus-within:border-(--color-primary) focus-within:bg-(--color-surface-soft) focus-within:shadow-md">
        <AppInput
          v-model="form.full_name"
          :label="t('profile.details.fullName')"
          :placeholder="t('profile.details.fullNamePlaceholder')"
          :error="errors.full_name"
          required
          class="!font-bold"
        />
      </div>

      <div class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/50 p-5 shadow-inner transition-all duration-200 focus-within:border-(--color-primary) focus-within:bg-(--color-surface-soft) focus-within:shadow-md">
        <AppInput
          v-model="form.phone"
          :label="t('common.phone')"
          :placeholder="t('profile.details.phonePlaceholder')"
          :error="errors.phone"
          class="!font-bold"
        />
      </div>

      <div class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/50 p-5 shadow-inner transition-all duration-200 focus-within:border-(--color-primary) focus-within:bg-(--color-surface-soft) focus-within:shadow-md">
        <label class="grid gap-2 text-sm font-black text-(--color-text)">
          <span>{{ t("profile.details.gender") }}</span>
          <select
            v-model="form.gender"
            class="w-full rounded-xl border border-(--color-border) bg-(--color-input) px-4 py-3 text-(--color-text) font-bold outline-none transition focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring) shadow-xs"
          >
            <option value="">{{ t("profile.details.preferNotToSay") }}</option>
            <option value="male">{{ t("profile.details.male") }}</option>
            <option value="female">{{ t("profile.details.female") }}</option>
            <option value="other">{{ t("profile.details.other") }}</option>
          </select>
        </label>
      </div>

      <div class="rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/50 p-5 shadow-inner transition-all duration-200 focus-within:border-(--color-primary) focus-within:bg-(--color-surface-soft) focus-within:shadow-md">
        <AppInput
          v-model="form.date_of_birth"
          type="date"
          :label="t('profile.details.dateOfBirth')"
          :error="errors.date_of_birth"
          class="!font-bold"
        />
      </div>

      <div class="md:col-span-2 rounded-2xl border border-(--color-border) bg-(--color-surface-soft)/50 p-5 shadow-inner transition-all duration-200 focus-within:border-(--color-primary) focus-within:bg-(--color-surface-soft) focus-within:shadow-md">
        <AppTextarea
          v-model="form.address"
          :label="t('profile.details.address')"
          :placeholder="t('profile.details.addressPlaceholder')"
          rows="3"
          class="!font-bold"
        />
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-4 border-t border-(--color-border)/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-(--color-muted) font-medium">
        <span v-if="hasChanges" class="font-black text-(--color-warning) flex items-center gap-1.5">
          <span class="flex h-2 w-2 rounded-full bg-(--color-warning) animate-ping"></span>
          {{ t("profile.details.unsavedChanges") }}
        </span>
        <span v-else>
          {{ t("profile.details.helper") }}
        </span>
      </p>
      <AppButton
        type="submit"
        class="!rounded-2xl font-black px-8 py-3.5 shadow-lg shadow-(--color-primary)/20 hover:shadow-xl hover:shadow-(--color-primary)/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
