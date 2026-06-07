<script setup>
import { ref } from "vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppButton from "@/shared/components/AppButton.vue";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: "Save",
  },
});

const emit = defineEmits(["submit", "cancel"]);

const categoryMap = {
  Hotel: 1,
  Villa: 2,
  Apartment: 3,
  Homestay: 4,
  Guesthouse: 5, // ✅ Added Guesthouse
};

const cityCoordinates = {
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Kampot: { lat: 10.6112, lng: 104.181 },
  Sihanoukville: { lat: 10.6345, lng: 103.4972 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Koh Rong": { lat: 10.7167, lng: 103.25 },
};

const form = ref({
  name: props.initialData.name || "",
  type: props.initialData.type || "Hotel",
  location: props.initialData.location || "Phnom Penh",
  address: props.initialData.address || "",
  description: props.initialData.description || "",
  contact_phone: props.initialData.contact_phone || "",
  contact_email: props.initialData.contact_email || "",
});

const errors = ref({});

const validate = () => {
  const e = {};
  if (!form.value.name.trim()) e.name = "Property name is required.";
  else if (form.value.name.trim().length < 3)
    e.name = "Property name must be at least 3 characters.";

  if (!form.value.address.trim()) e.address = "Address is required.";
  else if (form.value.address.trim().length < 5)
    e.address = "Address must be at least 5 characters.";

  if (!form.value.contact_phone.trim())
    e.contact_phone = "Contact phone is required.";

  if (!form.value.contact_email.trim())
    e.contact_email = "Contact email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.value.contact_email))
    e.contact_email = "Invalid email format.";

  errors.value = e;
  return Object.keys(e).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  const coords = cityCoordinates[form.value.location] || {
    lat: 11.5564,
    lng: 104.9282,
  };

  emit("submit", {
    property_name: form.value.name,
    category_id: categoryMap[form.value.type] || 1,
    description: form.value.description,
    address: form.value.address,
    city: form.value.location,
    province: form.value.location,
    country: "Cambodia",
    latitude: coords.lat,
    longitude: coords.lng,
    contact_phone: form.value.contact_phone,
    contact_email: form.value.contact_email,
  });
};
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <AppInput
        v-model="form.name"
        label="Property Name *"
        placeholder="e.g. Sunset Villa"
      />
      <span v-if="errors.name" class="text-xs text-rose-500">{{
        errors.name
      }}</span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Type *
        <select
          v-model="form.type"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
        >
          <option>Hotel</option>
          <option>Villa</option>
          <option>Apartment</option>
          <option>Homestay</option>
          <option>Guesthouse</option>
        </select>
      </label>

      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Location *
        <select
          v-model="form.location"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
        >
          <option>Phnom Penh</option>
          <option>Siem Reap</option>
          <option>Kampot</option>
          <option>Sihanoukville</option>
          <option>Battambang</option>
          <option>Koh Rong</option>
        </select>
      </label>
    </div>

    <div>
      <AppInput
        v-model="form.contact_phone"
        label="Contact Phone *"
        placeholder="+855 12 345 678"
      />
      <span v-if="errors.contact_phone" class="text-xs text-rose-500">{{
        errors.contact_phone
      }}</span>
    </div>

    <div>
      <AppInput
        v-model="form.contact_email"
        label="Contact Email *"
        type="email"
        placeholder="contact@example.com"
      />
      <span v-if="errors.contact_email" class="text-xs text-rose-500">{{
        errors.contact_email
      }}</span>
    </div>

    <div>
      <AppInput
        v-model="form.address"
        label="Address *"
        placeholder="Street address"
      />
      <span v-if="errors.address" class="text-xs text-rose-500">{{
        errors.address
      }}</span>
    </div>

    <AppInput
      v-model="form.description"
      label="Description"
      placeholder="Brief description for guests..."
    />

    <p class="text-xs text-(--color-muted)">
      New properties require admin approval before they're visible to guests.
    </p>

    <div class="flex justify-end gap-3 pt-2 border-t border-(--color-border)">
      <AppButton variant="secondary" type="button" @click="emit('cancel')">
        Cancel
      </AppButton>
      <AppButton type="submit" :disabled="loading">
        {{ loading ? "Saving..." : submitLabel }}
      </AppButton>
    </div>
  </form>
</template>
