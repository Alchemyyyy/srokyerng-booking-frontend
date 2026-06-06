<script setup>
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppInput from "@/shared/components/AppInput.vue";

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Object,
    required: true,
  },
  properties: {
    type: Array,
    default: () => [],
  },
  submitLabel: {
    type: String,
    default: "Save",
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(["close", "submit"]);

// Room types from API
const roomTypes = [
  { id: 1, name: "Standard" },
  { id: 2, name: "Deluxe" },
  { id: 3, name: "Suite" },
  { id: 4, name: "Family" },
];
</script>

<template>
  <AppModal :open="open" :title="title" @close="$emit('close')">
    <form
      class="space-y-4"
      :id="`${title.toLowerCase().replace(/\s+/g, '-')}-form`"
      @submit.prevent="$emit('submit')"
    >
      <!-- Property -->
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Property *
        <select
          v-model="props.modelValue.propertyId"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
        >
          <option disabled value="">Select property</option>
          <option
            v-for="property in properties"
            :key="property.id"
            :value="property.id"
          >
            {{ property.name }}
          </option>
        </select>
        <span
          v-if="errors.propertyId"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.propertyId }}
        </span>
      </label>

      <!-- Room Type -->
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Room Type *
        <select
          v-model="props.modelValue.type"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
        >
          <option disabled value="">Select room type</option>
          <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">
            {{ rt.name }}
          </option>
        </select>
        <span
          v-if="errors.type"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.type }}
        </span>
      </label>

      <!-- Room Name -->
      <div>
        <AppInput
          v-model="props.modelValue.roomName"
          label="Room Name *"
          placeholder="e.g. Deluxe King Suite"
        />
        <span
          v-if="errors.roomName"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.roomName }}
        </span>
      </div>

      <!-- Price & Guests -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <AppInput
            v-model.number="props.modelValue.basePrice"
            label="Price / Night ($) *"
            type="number"
            min="0"
          />
          <span
            v-if="errors.basePrice"
            class="text-xs font-medium text-(--color-danger)"
          >
            {{ errors.basePrice }}
          </span>
        </div>
        <AppInput
          v-model.number="props.modelValue.guests"
          label="Max Guests"
          type="number"
          min="1"
        />
      </div>

      <!-- Total Rooms -->
      <AppInput
        v-model.number="props.modelValue.inventory"
        label="Total Rooms"
        type="number"
        min="1"
      />

      <!-- Description -->
      <AppInput
        v-model="props.modelValue.description"
        label="Description"
        placeholder="Short room description..."
      />
    </form>

    <template #footer>
      <AppButton variant="secondary" type="button" @click="$emit('close')">
        Cancel
      </AppButton>
      <AppButton
        type="submit"
        :form="`${title.toLowerCase().replace(/\s+/g, '-')}-form`"
      >
        {{ submitLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>
