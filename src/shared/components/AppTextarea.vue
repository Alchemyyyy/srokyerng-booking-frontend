<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  rows: {
    type: [Number, String],
    default: 4,
  },
  error: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="grid gap-2 text-sm font-semibold text-(--color-text)" :for="id">
    <span v-if="label">{{ label }}</span>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="w-full resize-y rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none transition placeholder:text-(--color-muted) focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="text-sm font-medium text-(--color-danger)">
      {{ error }}
    </span>
  </label>
</template>
