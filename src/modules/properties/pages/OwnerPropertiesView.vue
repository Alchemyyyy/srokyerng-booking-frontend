<script setup>
import { ref, onMounted, computed, watch } from "vue";
import PropertyCard from "../components/PropertyCard.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton.vue";
import { useSidebar } from "@/shared/composables/useSidebar";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";
import { propertyApi } from "@/modules/properties/api/property.api";
import { useAuthStore } from "@/modules/auth/store/authStore";

const propertyStore = usePropertyStore();
const currentPage = ref(1);
const perPage = 4;
const authStore = useAuthStore();

const { isSidebarOpen } = useSidebar();

const loading = ref(true);
const properties = ref([]);
const selectedImages = ref([]);
const imagePreviewUrls = ref([]);

const currentStep = ref(1);
const newPropertyId = ref(null);
const uploadingImages = ref(false);

const categoryMap = {
  Hotel: 1,
  Villa: 2,
  Apartment: 3,
  Homestay: 4,
};

// pagination
const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return properties.value.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(properties.value.length / perPage));

watch([properties, totalPages], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(totalPages.value, 1);
  }
});

// --- Add Modal ---
const isAddModalOpen = ref(false);
const addErrors = ref({});

const cityCoordinates = {
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Kampot: { lat: 10.6112, lng: 104.181 },
  Sihanoukville: { lat: 10.6345, lng: 103.4972 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Koh Rong": { lat: 10.7167, lng: 103.25 },
};

const newProperty = ref({
  name: "",
  type: "Hotel",
  location: "Phnom Penh",
  address: "",
  description: "",
  contact_phone: "",
  contact_email: "",
});

const resetForm = () => {
  newProperty.value = {
    name: "",
    type: "Hotel",
    location: "Phnom Penh",
    address: "",
    description: "",
    contact_phone: "",
    contact_email: "",
  };
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
  currentStep.value = 1;
  newPropertyId.value = null;
  selectedImages.value = [];
  imagePreviewUrls.value = [];
  addErrors.value = {};
  resetForm();
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
    console.log("Register response:", JSON.stringify(response));
    newPropertyId.value = Number(
      response?.data?.[0]?.id || response?.data?.id || response?.id,
    );
    console.log("Property ID to upload to:", newPropertyId.value);
    currentStep.value = 2;
  } catch (err) {
    console.error("Failed to add property:", err);
  }
};
// ==================IMAGE UPLOAD [START]==================
const handleImageSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedImages.value = [...selectedImages.value, ...files];
  const newPreviews = files.map((file) => URL.createObjectURL(file));
  imagePreviewUrls.value = [...imagePreviewUrls.value, ...newPreviews];
};
const handleUploadImages = async () => {
  if (!selectedImages.value.length) {
    properties.value = propertyStore.myProperties;
    closeAddModal();
    return;
  }

  uploadingImages.value = true;
  try {
    await authStore.refreshSession();

    const formData = new FormData();
    selectedImages.value.forEach((file) => {
      formData.append("images", file);
    });

    await propertyApi.uploadPropertyImages(newPropertyId.value, formData);

    // ← Replace this section:
    const imagesResponse = await propertyApi.getAllPropertyImages(
      newPropertyId.value,
    );
    console.log("Images response:", JSON.stringify(imagesResponse)); // ← add
    const firstImage = Array.isArray(imagesResponse)
      ? imagesResponse[0]
      : imagesResponse?.data?.[0] || imagesResponse?.[0];
    console.log("First image:", firstImage); // ← add

    if (firstImage?.id) {
      await propertyApi.setCoverImage(newPropertyId.value, firstImage.id);
    }

    await propertyStore.fetchMyProperties();
    properties.value = propertyStore.myProperties;
    closeAddModal();
  } catch (err) {
    console.error("Failed to upload images:", err);
  } finally {
    uploadingImages.value = false;
  }
};
// ==================IMAGE UPLOAD [END]==================

// --- Edit Modal ---
const isEditModalOpen = ref(false);
const editingProperty = ref(null);

const openEditModal = async (property) => {
  try {
    const res = await propertyApi.getMyPropertyById(property.id);
    const full = Array.isArray(res)
      ? res[0]
      : res?.data?.[0] || res?.data || res;

    console.log("Full property:", JSON.stringify(full)); // check fields

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
    isEditModalOpen.value = true;
  } catch (err) {
    console.error("Failed to load property details:", err);
  }
};
const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingProperty.value = null;
};

const handleEditProperty = async () => {
  if (!editingProperty.value.name) return;
  try {
    await authStore.refreshSession(); // ← add this

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
      contact_phone: editingProperty.value.raw?.contact_phone || "",
      contact_email: editingProperty.value.raw?.contact_email || "",
    });

    await propertyStore.fetchMyProperties(); // ← refresh list
    properties.value = propertyStore.myProperties;
    closeEditModal();
  } catch (err) {
    console.error("Failed to update property:", err);
  }
};

// --- Delete Modal ---
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
    properties.value = propertyStore.myProperties;
    closeDeleteModal();
  } catch (err) {
    console.error("Failed to delete property:", err);
  }
};

// --- Fetch ---
const fetchPropertiesList = async () => {
  try {
    await propertyStore.fetchMyProperties();
    properties.value = propertyStore.myProperties;
    currentPage.value = 1;
  } catch (err) {
    console.error("Failed to load properties:", err);
    properties.value = [];
  } finally {
    loading.value = false;
  }
};
onMounted(fetchPropertiesList);
</script>

<template>
  <main class="mt-25" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
    <!-- Page Header -->
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
          <span v-if="addErrors.name" class="text-xs text-rose-500">{{
            addErrors.name
          }}</span>
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
          <span v-if="addErrors.contact_phone" class="text-xs text-rose-500">{{
            addErrors.contact_phone
          }}</span>
        </div>

        <div>
          <AppInput
            v-model="newProperty.contact_email"
            label="Contact Email *"
            type="email"
            placeholder="contact@example.com"
          />
          <span v-if="addErrors.contact_email" class="text-xs text-rose-500">{{
            addErrors.contact_email
          }}</span>
        </div>

        <div>
          <AppInput
            v-model="newProperty.address"
            label="Address *"
            placeholder="Street address"
          />
          <span v-if="addErrors.address" class="text-xs text-rose-500">{{
            addErrors.address
          }}</span>
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

        <!-- Image Previews -->
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
        <!-- Step 1 Footer -->
        <template v-if="currentStep === 1">
          <AppButton variant="secondary" type="button" @click="closeAddModal"
            >Cancel</AppButton
          >
          <AppButton type="submit" form="add-property-form">Next →</AppButton>
        </template>

        <!-- Step 2 Footer -->
        <template v-else>
          <AppButton
            variant="secondary"
            @click="handleUploadImages"
            :disabled="uploadingImages"
          >
            Skip
          </AppButton>
          <AppButton @click="handleUploadImages" :disabled="uploadingImages">
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
