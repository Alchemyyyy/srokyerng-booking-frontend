<script setup>
import { ref, watch, onMounted } from "vue";
import http from "@/app/api/http";
import AppButton from "@/shared/components/AppButton.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppInput from "@/shared/components/AppInput.vue";
import { useToastStore } from "@/shared/store/toastStore";
import { CameraIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const toastStore = useToastStore();

const roomTypes = ref([]);
onMounted(async () => {
  try {
    const res = await http.get("/rooms/room-types");
    roomTypes.value = res.data?.data || res.data || [];
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
  existingImages: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "submit"]);

const imageFiles = ref([]);
const imagePreviews = ref([]);
// Track which existing (already-saved) images the owner removed in this
// session, so the parent can actually call the delete API for them.
const removedImageIds = ref([]);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal?.image) {
      imagePreviews.value = [newVal.image];
    }
    // Reset removal tracking whenever a different room is loaded into the form
    removedImageIds.value = [];
  },
  { immediate: true },
);

const handleImageSelect = (e) => {
  const files = Array.from(e.target.files);

  // Max 10 images
  if (imageFiles.value.length + files.length > 10) {
    toastStore.danger("You can upload maximum 10 images", {
      title: "Too Many Images",
    });
    return;
  }

  for (const file of files) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toastStore.danger(`${file.name} is not supported. Use JPG or PNG only.`);
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastStore.danger(`${file.name} exceeds 5MB limit.`);
      continue;
    }

    imageFiles.value.push(file);
    const reader = new FileReader();
    reader.onload = (ev) => imagePreviews.value.push(ev.target.result);
    reader.readAsDataURL(file);
  }
};

// Remove image
const removeImage = (index) => {
  imageFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const handleSubmit = () => {
  emit("submit", {
    ...props.modelValue,
    imageFiles: imageFiles.value,
    removedImageIds: removedImageIds.value,
  });
};

const closeModal = () => {
  imageFiles.value = [];
  imagePreviews.value = [];
  removedImageIds.value = [];
  emit("close");
};

// Existing images are now { id, url } objects (see ManageRoomsView.vue).
// Removing one here just marks it for deletion — the parent component
// (ManageRoomsView) is responsible for actually calling the delete API
// on submit, since this modal has no direct access to the room store.
const removeExistingImage = (index) => {
  const removed = props.modelValue.existingImages[index];
  if (removed?.id) {
    removedImageIds.value.push(removed.id);
  }
  // Create a new array instead of mutating the prop directly (avoids
  // Vue's "mutating a prop" warning and keeps parent/child state in sync
  // through the modelValue contract instead of a hidden side-effect).
  props.modelValue.existingImages = props.modelValue.existingImages.filter(
    (_, i) => i !== index,
  );
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
        <span>Property <span class="text-(--color-danger)">*</span></span>
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
        <span>Room Type <span class="text-(--color-danger)">*</span></span>
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
      <!-- NEW: Image Upload -->
      <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
        Room Images
        <span class="text-(--color-muted) font-normal text-xs">(max 10)</span>

        <div
          v-if="
            props.modelValue.existingImages?.length > 0 ||
            imagePreviews.length > 0
          "
          class="grid grid-cols-3 gap-2 mb-2"
        >
          <!-- Existing saved images -->
          <div
            v-for="(img, index) in props.modelValue.existingImages"
            :key="'existing-' + (img.id ?? index)"
            class="relative group"
          >
            <img
              :src="img.url"
              class="w-full h-20 object-cover rounded-lg opacity-80"
            />
            <span
              v-if="img.isCover"
              class="absolute bottom-1 left-1 text-[9px] bg-(--color-primary) text-white px-1 rounded"
              >Cover</span
            >
            <span
              v-else
              class="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 rounded"
              >Saved</span
            >
            <button
              type="button"
              @click="removeExistingImage(index)"
              aria-label="Remove image"
              class="absolute top-1 right-1 w-5 h-5 bg-(--color-danger) text-white rounded-full hidden group-hover:flex items-center justify-center"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </div>

          <!-- New previews -->
          <div
            v-for="(preview, index) in imagePreviews"
            :key="'new-' + index"
            class="relative group"
          >
            <img :src="preview" alt="New room photo preview" class="w-full h-20 object-cover rounded-lg" />
            <button
              type="button"
              @click="removeImage(index)"
              aria-label="Remove image"
              class="absolute top-1 right-1 w-5 h-5 bg-(--color-danger) text-white rounded-full hidden group-hover:flex items-center justify-center"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </div>

          <!-- Add more -->
          <label
            v-if="
              (props.modelValue.existingImages?.length || 0) +
                imagePreviews.length <
              10
            "
            for="room-image-upload"
            class="w-full h-20 border-2 border-dashed border-(--color-border) rounded-lg flex items-center justify-center cursor-pointer hover:border-(--color-primary) transition-colors"
          >
            <span class="text-2xl text-(--color-muted)">+</span>
          </label>
        </div>

        <!-- Show upload area when no images yet -->
        <label
          v-else
          for="room-image-upload"
          class="w-full h-24 border-2 border-dashed border-(--color-border) rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-(--color-primary) transition-colors gap-1"
        >
          <CameraIcon class="w-6 h-6 text-(--color-muted)" />
          <span class="text-xs text-(--color-muted)"
            >Click to upload images</span
          >
        </label>

        <!-- ✅ This was missing! -->
        <input
          id="room-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="hidden"
          @change="handleImageSelect"
        />
      </label>

      <!-- Rest of your form fields -->
      <div>
        <AppInput
          v-model="props.modelValue.roomName"
          label="Room Name"
          required
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
            label="Price / Night ($)"
            required
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
      <div>
        <AppInput
          v-model.number="props.modelValue.floorNumber"
          label="Floor Number"
          type="number"
          min="0"
          max="200"
          step="1"
          placeholder="e.g. 3"
        />
        <span
          v-if="errors.floorNumber"
          class="text-xs font-medium text-(--color-danger)"
        >
          {{ errors.floorNumber }}
        </span>
      </div>

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
