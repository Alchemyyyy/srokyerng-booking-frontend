<script setup>
import { ref, onMounted, computed, watch } from "vue";
import PropertyCard from "../components/PropertyCard.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppAlert from "@/shared/components/AppAlert.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton.vue";
import { useSidebar } from "@/shared/composables/useSidebar";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";
import { useToastStore } from "@/shared/store/toastStore";
import { propertyApi } from "@/modules/properties/api/property.api";
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api-srokyerng.devspace.linkpc.net";

const propertyStore = usePropertyStore();
const toast = useToastStore();
const { isSidebarOpen } = useSidebar();

const currentPage = ref(1);
const perPage = 4;

// ── Use store directly ────────────────────────────────────────────────────────
const properties = computed(() => propertyStore.myProperties);
const loading = computed(() => propertyStore.loading);

// ── Pagination ────────────────────────────────────────────────────────────────
const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return properties.value.slice(start, start + perPage);
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(properties.value.length / perPage)),
);
watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

// ── City Coordinates ──────────────────────────────────────────────────────────
const cityCoordinates = {
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Kampot: { lat: 10.6112, lng: 104.181 },
  Sihanoukville: { lat: 10.6345, lng: 103.4972 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Koh Rong": { lat: 10.7167, lng: 103.25 },
};
const categoryMap = { Hotel: 1, Villa: 2, Apartment: 3, Homestay: 4 };

// ── Add Modal ─────────────────────────────────────────────────────────────────
const isAddModalOpen = ref(false);
const addErrors = ref({});
const currentStep = ref(1);
const newPropertyId = ref(null);
const selectedImages = ref([]);
const imagePreviewUrls = ref([]);
const uploadingImages = ref(false);

const defaultForm = () => ({
  name: "",
  type: "Hotel",
  location: "Phnom Penh",
  address: "",
  description: "",
  contact_phone: "",
  contact_email: "",
});

const newProperty = ref(defaultForm());

const closeAddModal = () => {
  isAddModalOpen.value = false;
  currentStep.value = 1;
  newPropertyId.value = null;
  selectedImages.value = [];
  imagePreviewUrls.value = [];
  addErrors.value = {};
  newProperty.value = defaultForm();
};

const validateAddForm = () => {
  const errors = {};
  if (!newProperty.value.name.trim())
    errors.name = "Property name is required.";
  else if (newProperty.value.name.trim().length < 3)
    errors.name = "Property name must be at least 3 characters.";
  if (!newProperty.value.address.trim())
    errors.address = "Address is required.";
  else if (newProperty.value.address.trim().length < 5)
    errors.address = "Address must be at least 5 characters.";
  if (!newProperty.value.contact_phone.trim())
    errors.contact_phone = "Contact phone is required.";
  if (!newProperty.value.contact_email.trim())
    errors.contact_email = "Contact email is required.";
  else if (!/\S+@\S+\.\S+/.test(newProperty.value.contact_email))
    errors.contact_email = "Invalid email format.";
  return errors;
};

const handleAddProperty = async () => {
  addErrors.value = validateAddForm();
  if (Object.keys(addErrors.value).length > 0) return;

  const coords = cityCoordinates[newProperty.value.location] || {
    lat: 11.5564,
    lng: 104.9282,
  };
  try {
    const response = await propertyStore.registerProperty({
      property_name: newProperty.value.name,
      category_id: categoryMap[newProperty.value.type] || 1,
      description: newProperty.value.description,
      address: newProperty.value.address,
      city: newProperty.value.location,
      province: newProperty.value.location,
      country: "Cambodia",
      latitude: coords.lat,
      longitude: coords.lng,
      contact_phone: newProperty.value.contact_phone,
      contact_email: newProperty.value.contact_email,
    });
    newPropertyId.value = Number(
      response?.data?.[0]?.id || response?.data?.id || response?.id,
    );
    currentStep.value = 2;
  } catch {
    toast.danger("Failed to add property. Please try again.");
  }
};

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedImages.value = [...selectedImages.value, ...files];
  imagePreviewUrls.value = [
    ...imagePreviewUrls.value,
    ...files.map((f) => URL.createObjectURL(f)),
  ];
};

const handleUploadImages = async () => {
  if (!selectedImages.value.length) {
    closeAddModal();
    return;
  }
  uploadingImages.value = true;
  try {
    await propertyStore.uploadPropertyImages(
      newPropertyId.value,
      selectedImages.value,
    );
    if (propertyStore.propertyImages.length) {
      await propertyStore.setCoverImage(
        newPropertyId.value,
        propertyStore.propertyImages[0].id,
      );
    }
    toast.success("Property created successfully!");
    closeAddModal();
  } catch {
    toast.danger("Failed to upload images. You can add them later.");
  } finally {
    uploadingImages.value = false;
  }
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const isEditModalOpen = ref(false);
const editingProperty = ref(null);
const editNewFiles = ref([]);
const editNewPreviews = ref([]);
const editImagesUploading = ref(false);

const editImages = computed(() => propertyStore.propertyImages);
const editImagesLoading = computed(() => propertyStore.imagesLoading);
const editCoverId = computed(() => propertyStore.coverId);

const openEditModal = async (property) => {
  try {
    const res = await propertyApi.getMyPropertyById(property.id);
    const full = Array.isArray(res)
      ? res[0]
      : res?.data?.[0] || res?.data || res;

    editingProperty.value = {
      id: property.id,
      name: full?.property_name || property.name,
      type: full?.category_name || "Hotel",
      location: full?.city || "Phnom Penh",
      address: full?.address || "",
      description: full?.description || "",
      contact_phone: full?.contact_phone || "",
      contact_email: full?.contact_email || "",
      raw: full,
    };
    editNewFiles.value = [];
    editNewPreviews.value = [];
    isEditModalOpen.value = true;
    await propertyStore.fetchPropertyImages(property.id);
  } catch {
    toast.danger("Failed to load property details.");
  }
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingProperty.value = null;
  editNewPreviews.value.forEach((u) => URL.revokeObjectURL(u));
  editNewFiles.value = [];
  editNewPreviews.value = [];
  propertyStore.clearImages();
};

const handleEditImageSelect = (event) => {
  const files = Array.from(event.target.files);
  editNewFiles.value = [...editNewFiles.value, ...files];
  editNewPreviews.value = [
    ...editNewPreviews.value,
    ...files.map((f) => URL.createObjectURL(f)),
  ];
  event.target.value = "";
};

const removeStagedFile = (index) => {
  URL.revokeObjectURL(editNewPreviews.value[index]);
  editNewFiles.value.splice(index, 1);
  editNewPreviews.value.splice(index, 1);
};

const deleteEditImage = async (imageId) => {
  try {
    await propertyStore.deletePropertyImage(editingProperty.value.id, imageId);
  } catch {
    toast.danger("Failed to delete image.");
  }
};

const setCover = async (imageId) => {
  try {
    await propertyStore.setCoverImage(editingProperty.value.id, imageId);
  } catch {
    toast.danger("Failed to set cover image.");
  }
};

const uploadStagedImages = async () => {
  if (!editNewFiles.value.length) return;
  editImagesUploading.value = true;
  try {
    await propertyStore.uploadPropertyImages(
      editingProperty.value.id,
      editNewFiles.value,
    );
    editNewPreviews.value.forEach((u) => URL.revokeObjectURL(u));
    editNewFiles.value = [];
    editNewPreviews.value = [];
    toast.success("Images uploaded successfully.");
  } catch {
    toast.danger("Failed to upload images.");
  } finally {
    editImagesUploading.value = false;
  }
};

const handleEditProperty = async () => {
  if (!editingProperty.value.name) return;
  try {
    await propertyStore.updateProperty(editingProperty.value.id, {
      property_name: editingProperty.value.name,
      category_id: categoryMap[editingProperty.value.type] || 1,
      description: editingProperty.value.description || "",
      address: editingProperty.value.address || "",
      city: editingProperty.value.location,
      province: editingProperty.value.location,
      country: "Cambodia",
      latitude: editingProperty.value.raw?.latitude || 0,
      longitude: editingProperty.value.raw?.longitude || 0,
      contact_phone: editingProperty.value.contact_phone || "",
      contact_email: editingProperty.value.contact_email || "",
    });
    if (editNewFiles.value.length) await uploadStagedImages();
    toast.success("Property updated successfully!");
    closeEditModal();
  } catch {
    toast.danger("Failed to update property. Please try again.");
  }
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const isDeleteModalOpen = ref(false);
const deletingPropertyId = ref(null);

const openDeleteModal = (id) => {
  deletingPropertyId.value = id;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deletingPropertyId.value = null;
};

const confirmDelete = async () => {
  try {
    await propertyStore.deleteProperty(deletingPropertyId.value);
    toast.success("Property deleted successfully.");
    closeDeleteModal();
  } catch {
    toast.danger("Failed to delete property.");
  }
};

// ── Fetch ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await propertyStore.fetchMyProperties();
    currentPage.value = 1;
  } catch {
    toast.danger("Failed to load properties.");
  }
});
</script>

<template>
  <main class="mt-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
    <!-- Header -->
    <header class="mb-5 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-(--color-text)">
          My Properties
          <span class="text-(--color-muted)">({{ properties.length }})</span>
        </h1>
        <p class="mt-2 text-(--color-muted)">
          Manage your property listings here.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/owner/amenities"
          class="flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors"
          style="
            background: var(--color-primary-soft);
            border-color: var(--color-border);
            color: var(--color-primary);
          "
        >
          Manage Amenities
        </RouterLink>
        <AppButton @click="isAddModalOpen = true">
          <PlusIcon class="w-4 h-4" />
          Add New Property
        </AppButton>
      </div>
    </header>

    <!-- Properties List -->
    <section class="mt-6">
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
      >
        <PropertyCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <EmptyState
        v-else-if="properties.length === 0"
        title="No Properties Found"
        message="You haven't added any properties yet. Click 'Add New Property' to get started."
      >
        <template #action>
          <AppButton @click="isAddModalOpen = true">
            <PlusIcon class="w-4 h-4" />
            Add New Property
          </AppButton>
        </template>
      </EmptyState>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
      >
        <PropertyCard
          v-for="property in paginatedProperties"
          :key="property.id"
          :property="property"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </div>
    </section>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 mt-8"
    >
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Previous
      </AppButton>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        class="w-9 h-9 rounded-lg text-sm font-semibold transition"
        :class="
          currentPage === page
            ? 'bg-(--color-primary) text-white'
            : 'bg-(--color-surface) border border-(--color-border) text-(--color-muted) hover:bg-(--color-surface-soft)'
        "
      >
        {{ page }}
      </button>
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </AppButton>
    </div>

    <!-- Add Modal -->
    <AppModal
      :open="isAddModalOpen"
      :title="currentStep === 1 ? 'Add New Property' : 'Upload Images'"
      @close="closeAddModal"
    >
      <!-- Step 1: Property Info -->
      <form
        v-if="currentStep === 1"
        id="add-property-form"
        class="space-y-4"
        @submit.prevent="handleAddProperty"
      >
        <div>
          <AppInput
            v-model="newProperty.name"
            label="Property Name *"
            placeholder="e.g. Sunset Villa"
          />
          <AppAlert v-if="addErrors.name" variant="danger" class="mt-1">{{
            addErrors.name
          }}</AppAlert>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            Type *
            <select
              v-model="newProperty.type"
              class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
            >
              <option>Hotel</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Homestay</option>
            </select>
          </label>
          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            Location *
            <select
              v-model="newProperty.location"
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
            v-model="newProperty.contact_phone"
            label="Contact Phone *"
            placeholder="+855 12 345 678"
          />
          <AppAlert
            v-if="addErrors.contact_phone"
            variant="danger"
            class="mt-1"
            >{{ addErrors.contact_phone }}</AppAlert
          >
        </div>

        <div>
          <AppInput
            v-model="newProperty.contact_email"
            label="Contact Email *"
            type="email"
            placeholder="contact@example.com"
          />
          <AppAlert
            v-if="addErrors.contact_email"
            variant="danger"
            class="mt-1"
            >{{ addErrors.contact_email }}</AppAlert
          >
        </div>

        <div>
          <AppInput
            v-model="newProperty.address"
            label="Address *"
            placeholder="Street address"
          />
          <AppAlert v-if="addErrors.address" variant="danger" class="mt-1">{{
            addErrors.address
          }}</AppAlert>
        </div>

        <AppInput
          v-model="newProperty.description"
          label="Description"
          placeholder="Brief description for guests..."
        />

        <p class="text-xs text-(--color-muted)">
          New properties require admin approval before they're visible to
          guests.
        </p>
      </form>

      <!-- Step 2: Upload Images -->
      <div v-else class="space-y-4">
        <p class="text-sm text-(--color-muted)">
          Upload images for your property. You can skip this and add images
          later.
        </p>
        <label
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-(--color-border) rounded-xl cursor-pointer hover:border-(--color-primary) transition-colors"
        >
          <div class="flex flex-col items-center gap-2">
            <span class="text-3xl">📸</span>
            <span class="text-sm font-semibold text-(--color-text)"
              >Click to upload images</span
            >
            <span class="text-xs text-(--color-muted)"
              >PNG, JPG up to 10MB (multiple allowed)</span
            >
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            multiple
            @change="handleImageSelect"
          />
        </label>
        <div v-if="imagePreviewUrls.length" class="grid grid-cols-3 gap-2">
          <div
            v-for="(url, index) in imagePreviewUrls"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden"
          >
            <img :src="url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <template #footer>
        <template v-if="currentStep === 1">
          <AppButton variant="secondary" type="button" @click="closeAddModal"
            >Cancel</AppButton
          >
          <AppButton type="submit" form="add-property-form">Next →</AppButton>
        </template>
        <template v-else>
          <AppButton
            variant="secondary"
            :disabled="uploadingImages"
            @click="handleUploadImages"
            >Skip</AppButton
          >
          <AppButton :disabled="uploadingImages" @click="handleUploadImages">
            {{ uploadingImages ? "Uploading..." : "Upload & Finish" }}
          </AppButton>
        </template>
      </template>
    </AppModal>

    <!-- Edit Modal -->
    <AppModal
      v-if="editingProperty"
      :open="isEditModalOpen"
      title="Edit Property"
      @close="closeEditModal"
    >
      <form
        id="edit-property-form"
        class="space-y-4"
        @submit.prevent="handleEditProperty"
      >
        <AppInput
          v-model="editingProperty.name"
          label="Property Name *"
          placeholder="e.g. Sunset Villa"
          required
        />
        <AppInput
          v-model="editingProperty.contact_phone"
          label="Contact Phone *"
          placeholder="+855 12 345 678"
        />
        <AppInput
          v-model="editingProperty.contact_email"
          label="Contact Email *"
          type="email"
          placeholder="contact@example.com"
        />

        <div class="grid grid-cols-2 gap-4">
          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            Type *
            <select
              v-model="editingProperty.type"
              class="w-full rounded-sm border border-(--color-border) bg-(--color-input) px-3.5 py-3 text-(--color-text) outline-none focus:border-(--color-primary)"
            >
              <option>Hotel</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Homestay</option>
            </select>
          </label>
          <label class="grid gap-2 text-sm font-semibold text-(--color-text)">
            Location *
            <select
              v-model="editingProperty.location"
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

        <AppInput
          v-model="editingProperty.address"
          label="Address"
          placeholder="Street address"
        />
        <AppInput
          v-model="editingProperty.description"
          label="Description"
          placeholder="Brief description for guests..."
        />

        <!-- Image Manager -->
        <div class="pt-2 border-t border-(--color-border)">
          <p class="text-sm font-semibold text-(--color-text) mb-3">
            Property Images
          </p>

          <div
            v-if="editImagesLoading"
            class="flex items-center justify-center h-24 text-(--color-muted) text-sm gap-2"
          >
            <div
              class="w-5 h-5 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"
            />
            Loading images...
          </div>

          <div v-else class="space-y-3">
            <div v-if="editImages.length" class="grid grid-cols-3 gap-2">
              <div
                v-for="img in editImages"
                :key="img.id"
                class="relative aspect-square rounded-xl overflow-hidden border-2 transition-all group"
                :class="
                  editCoverId === img.id
                    ? 'border-(--color-primary)'
                    : 'border-(--color-border)'
                "
              >
                <img
                  :src="`${BASE_URL}${img.image_url}`"
                  class="w-full h-full object-cover"
                  alt="Property image"
                />

                <div
                  v-if="editCoverId === img.id"
                  class="absolute top-1 left-1 bg-(--color-primary) text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                >
                  <StarIconSolid class="w-3 h-3" /> Cover
                </div>

                <div
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                >
                  <button
                    v-if="editCoverId !== img.id"
                    type="button"
                    title="Set as cover"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-amber-500 backdrop-blur-sm flex items-center justify-center transition-colors"
                    @click="setCover(img.id)"
                  >
                    <StarIcon class="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    title="Delete image"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-rose-500 backdrop-blur-sm flex items-center justify-center transition-colors"
                    @click="deleteEditImage(img.id)"
                  >
                    <TrashIcon class="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <p v-else class="text-xs text-(--color-muted) text-center py-4">
              No images yet.
            </p>

            <div v-if="editNewPreviews.length">
              <p
                class="text-xs font-semibold text-(--color-muted) mb-2 uppercase tracking-wider"
              >
                Ready to upload ({{ editNewPreviews.length }})
              </p>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(url, idx) in editNewPreviews"
                  :key="idx"
                  class="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-(--color-primary)/40"
                >
                  <img
                    :src="url"
                    class="w-full h-full object-cover opacity-80"
                  />
                  <button
                    type="button"
                    class="absolute top-1 right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                    @click="removeStagedFile(idx)"
                  >
                    <XMarkIcon class="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                class="mt-2 w-full"
                :disabled="editImagesUploading"
                @click="uploadStagedImages"
              >
                <CloudArrowUpIcon class="w-4 h-4" />
                {{
                  editImagesUploading
                    ? "Uploading..."
                    : `Upload ${editNewPreviews.length} image(s)`
                }}
              </AppButton>
            </div>

            <label
              class="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-(--color-border) rounded-xl cursor-pointer hover:border-(--color-primary) transition-colors text-sm text-(--color-muted) hover:text-(--color-primary)"
            >
              <CloudArrowUpIcon class="w-5 h-5" />
              <span>Add more images</span>
              <input
                type="file"
                class="hidden"
                accept="image/*"
                multiple
                @change="handleEditImageSelect"
              />
            </label>

            <p class="text-[11px] text-(--color-muted)">
              Hover an image to set it as cover or delete it. Cover image is
              shown first to guests.
            </p>
          </div>
        </div>
      </form>

      <template #footer>
        <AppButton variant="secondary" type="button" @click="closeEditModal"
          >Cancel</AppButton
        >
        <AppButton type="submit" form="edit-property-form"
          >Save Changes</AppButton
        >
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal
      :open="isDeleteModalOpen"
      title="Delete Property"
      @close="closeDeleteModal"
    >
      <p class="text-(--color-muted) text-sm">
        This property will be permanently deleted and cannot be recovered. Are
        you sure?
      </p>
      <template #footer>
        <AppButton variant="secondary" @click="closeDeleteModal"
          >Cancel</AppButton
        >
        <AppButton variant="danger" @click="confirmDelete"
          >Yes, Delete</AppButton
        >
      </template>
    </AppModal>
  </main>
</template>
