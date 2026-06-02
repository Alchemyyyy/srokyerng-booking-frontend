<script setup>
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppTextarea from "@/shared/components/AppTextarea.vue";

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
        <h2 class="text-xl font-bold">Personal information</h2>
        <p class="text-sm text-(--color-muted)">Update your public profile details.</p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <AppInput
        v-model="form.full_name"
        label="Full name"
        placeholder="Your full name"
        :error="errors.full_name"
        required
      />
      <AppInput
        v-model="form.phone"
        label="Phone"
        placeholder="012345678"
        :error="errors.phone"
      />
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        <span>Gender</span>
        <select
          v-model="form.gender"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none transition focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring)"
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <AppInput
        v-model="form.date_of_birth"
        type="date"
        label="Date of birth"
        :error="errors.date_of_birth"
      />
      <div class="md:col-span-2">
        <AppTextarea
          v-model="form.address"
          label="Address"
          placeholder="Your address"
          rows="3"
        />
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-(--color-muted)">
        <span v-if="hasChanges" class="font-semibold text-(--color-warning)">
          Unsaved changes.
        </span>
        <span v-else>
          These details are used for booking communication and account recovery.
        </span>
      </p>
      <AppButton
        type="submit"
        class="!rounded-lg"
        :disabled="saving || !hasChanges"
        :loading="saving"
      >
        Save profile
      </AppButton>
    </div>
  </form>
</template>
