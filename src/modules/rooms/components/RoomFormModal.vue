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
</script>

<template>
  <AppModal :open="open" :title="title" @close="$emit('close')">
    <form
      class="space-y-4"
      :id="`${title.toLowerCase().replace(/\s+/g, '-')}-form`"
      @submit.prevent="$emit('submit')"
    >
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
        <span v-if="errors.propertyId" class="text-xs font-medium text-(--color-danger)">
          {{ errors.propertyId }}
        </span>
      </label>

      <AppInput
        v-model="props.modelValue.type"
        label="Room Type *"
        placeholder="e.g. Deluxe King Suite"
        required
      />
      <span v-if="errors.type" class="text-xs font-medium text-(--color-danger)">
        {{ errors.type }}
      </span>

      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model.number="props.modelValue.guests" label="Guests" type="number" min="1" />
        <AppInput
          v-model.number="props.modelValue.basePrice"
          label="Base Price / Night"
          type="number"
          min="0"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="props.modelValue.size" label="Size" placeholder="e.g. 36 sqm" />
        <AppInput v-model="props.modelValue.bedType" label="Bed Type" placeholder="e.g. King Bed" />
      </div>
      <span v-if="errors.size" class="text-xs font-medium text-(--color-danger)">
        {{ errors.size }}
      </span>

      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model.number="props.modelValue.inventory" label="Inventory" type="number" min="1" />
        <AppInput v-model.number="props.modelValue.available" label="Available" type="number" min="0" />
      </div>

      <AppInput
        v-model="props.modelValue.description"
        label="Description"
        placeholder="Short room description..."
      />
      <AppInput
        v-model="props.modelValue.image"
        label="Image URL"
        type="url"
        placeholder="https://images.unsplash.com/..."
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
