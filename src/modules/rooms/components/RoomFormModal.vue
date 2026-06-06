<script setup>
import { ref, watch, onMounted } from "vue";
import http from "@/app/api/http";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppInput from "@/shared/components/AppInput.vue";

const roomTypes = ref([]);
onMounted(async () => {
  try {
    const res = await http.get("/rooms/room-types");
    roomTypes.value = res.data || res || [];
    console.log("Room types:", roomTypes.value); // check what comes back
  } catch (e) {
    console.error("Failed to load room types", e);
  }
});

const props = defineProps({
  open: Boolean,
  title: { type: String, default: "" },
  modelValue: { type: Object, required: true },
  properties: { type: Array, default: () => [] },
  submitLabel: { type: String, default: "Save" },
  errors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "submit"]);

const imageFile = ref(null);
const imagePreview = ref(null);

// Watch modelValue for image changes (edit mode)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal?.image) {
      imagePreview.value = newVal.image;
    }
  },
  { immediate: true },
);

const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file (jpg, png, webp, etc.)");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    // 5MB limit
    alert("Image size must be less than 5MB");
    return;
  }

  imageFile.value = file;

  const reader = new FileReader();
  reader.onload = (ev) => {
    imagePreview.value = ev.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = () => {
  emit("submit", {
    ...props.modelValue,
    imageFile: imageFile.value, // ← Important: Pass file to parent
  });
};

const closeModal = () => {
  imageFile.value = null;
  imagePreview.value = null;
  emit("close");
};
</script>

<template>
  <AppModal :open="open" :title="title" @close="closeModal">
    <form
      class="space-y-4"
      :id="`${title.toLowerCase().replace(/\s+/g, '-')}-form`"
      @submit.prevent="handleSubmit"
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

      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Room Type *
        <select
          v-model="props.modelValue.type"
          class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
        >
          <option disabled value="">Select room type</option>
          <option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">
            {{ rt.type_name || rt.name }}
          </option>
        </select>
        <span
          v-if="errors.type"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.type }}
        </span>
      </label>
      <!-- NEW: Image Upload -->
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Room Image
        <div
          class="border-2 border-dashed border-(--color-border) rounded-xl p-6 text-center hover:border-(--color-primary) transition-colors"
        >
          <input
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            class="hidden"
            id="room-image-upload"
          />
          <label for="room-image-upload" class="cursor-pointer block">
            <div v-if="imagePreview" class="mb-4">
              <img
                :src="imagePreview"
                class="mx-auto max-h-52 rounded-lg object-cover shadow-sm"
                alt="Preview"
              />
            </div>
            <div v-else class="text-(--color-muted)">
              <span class="text-4xl mb-2 block">📸</span>
              <span class="font-medium">Click to upload image</span>
              <p class="text-xs mt-1">PNG, JPG, WEBP (max 5MB)</p>
            </div>
          </label>
        </div>
        <span
          v-if="errors.image"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.image }}
        </span>
      </label>

      <!-- Rest of your form fields -->
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

      <AppInput
        v-model.number="props.modelValue.inventory"
        label="Total Rooms"
        type="number"
        min="1"
      />

      <AppInput
        v-model="props.modelValue.description"
        label="Description"
        placeholder="Short room description..."
      />
    </form>

    <template #footer>
      <AppButton variant="secondary" type="button" @click="closeModal">
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
