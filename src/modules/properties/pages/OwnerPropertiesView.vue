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
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

const propertyStore = usePropertyStore();
const toast = useToastStore();
const { isSidebarOpen } = useSidebar();

const currentPage = ref(1);
const perPage = 8;

const properties = computed(() => propertyStore.myProperties);
const loading = computed(() => propertyStore.loading);

// ── Search & Filters ──────────────────────────────────────────────────────────
const ownerFilters = ref({
  search: "",
  city: "all",
  category: "all",
  status: "all",
});

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const hasActiveFilters = computed(
  () =>
    ownerFilters.value.search.trim() !== "" ||
    ownerFilters.value.city !== "all" ||
    ownerFilters.value.category !== "all" ||
    ownerFilters.value.status !== "all",
);

const resetOwnerFilters = () => {
  ownerFilters.value = {
    search: "",
    city: "all",
    category: "all",
    status: "all",
  };
};

const filteredProperties = computed(() => {
  const query = normalize(ownerFilters.value.search);
  return properties.value.filter((p) => {
    const matchesQuery =
      !query ||
      normalize(p.name).includes(query) ||
      normalize(p.description).includes(query) ||
      normalize(p.location).includes(query);
    const matchesCity =
      ownerFilters.value.city === "all" ||
      normalize(p.location) === normalize(ownerFilters.value.city);
    const matchesCategory =
      ownerFilters.value.category === "all" ||
      normalize(p.type) === normalize(ownerFilters.value.category);
    const matchesStatus =
      ownerFilters.value.status === "all" ||
      normalize(p.status) === normalize(ownerFilters.value.status);
    return matchesQuery && matchesCity && matchesCategory && matchesStatus;
  });
});

watch(
  ownerFilters,
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

// ── Pagination ────────────────────────────────────────────────────────────────
const paginatedProperties = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredProperties.value.slice(start, start + perPage);
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProperties.value.length / perPage)),
);
watch(totalPages, (val) => {
  if (currentPage.value > val) currentPage.value = val;
});

// ── Cities ────────────────────────────────────────────────────────────────────
const cities = ref([]);
const fetchCities = async () => {
  try {
    const res = await propertyApi.getCities();
    cities.value = Array.isArray(res) ? res : (res?.data ?? []);
  } catch {
    cities.value = [];
  }
};

const resolveLocationIds = (cityName) => {
  const match = cities.value.find((c) => c.name === cityName);
  return {
    city_id: match?.id ?? null,
    province_id: match?.province_id ?? null,
    country_id: 1,
  };
};

const cityCoordinates = {
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Kampot: { lat: 10.6112, lng: 104.181 },
  Sihanoukville: { lat: 10.6345, lng: 103.4972 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Koh Rong": { lat: 10.7167, lng: 103.25 },
};
const categoryMap = {
  Hotel: 1,
  Villa: 2,
  Apartment: 3,
  Homestay: 4,
  Guesthouse: 5,
};

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total: properties.value.length,
  approved: properties.value.filter((p) => normalize(p.status) === "approved")
    .length,
  pending: properties.value.filter((p) => normalize(p.status) === "pending")
    .length,
  rejected: properties.value.filter((p) => normalize(p.status) === "rejected")
    .length,
}));

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
  number_of_floors: 1,
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
    errors.name = "At least 3 characters.";
  if (!newProperty.value.address.trim())
    errors.address = "Address is required.";
  else if (newProperty.value.address.trim().length < 5)
    errors.address = "At least 5 characters.";
  if (!newProperty.value.contact_phone.trim())
    errors.contact_phone = "Phone is required.";
  if (!newProperty.value.contact_email.trim())
    errors.contact_email = "Email is required.";
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
  const { city_id, province_id, country_id } = resolveLocationIds(
    newProperty.value.location,
  );
  if (!city_id || !province_id) {
    toast.danger("Please select a valid city.");
    return;
  }
  try {
    const response = await propertyStore.registerProperty({
      property_name: newProperty.value.name,
      category_id: categoryMap[newProperty.value.type] || 1,
      description: newProperty.value.description,
      address: newProperty.value.address,
      city_id,
      province_id,
      country_id,
      latitude: coords.lat,
      longitude: coords.lng,
      contact_phone: newProperty.value.contact_phone,
      contact_email: newProperty.value.contact_email,
      number_of_floors: Number(newProperty.value.number_of_floors) || 1,
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

const removeNewImage = (index) => {
  URL.revokeObjectURL(imagePreviewUrls.value[index]);
  selectedImages.value.splice(index, 1);
  imagePreviewUrls.value.splice(index, 1);
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
      type: full?.category?.category_name || full?.category_name || "Hotel",
      location: full?.city?.city_name || full?.city_name || "Phnom Penh",
      address: full?.address || "",
      description: full?.description || "",
      contact_phone: full?.contact_phone || "",
      contact_email: full?.contact_email || "",
      number_of_floors: full?.number_of_floors ?? 1,
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
    toast.success("Images uploaded.");
  } catch {
    toast.danger("Failed to upload images.");
  } finally {
    editImagesUploading.value = false;
  }
};

const handleEditProperty = async () => {
  if (!editingProperty.value.name) return;
  const { city_id, province_id, country_id } = resolveLocationIds(
    editingProperty.value.location,
  );
  if (!city_id || !province_id) {
    toast.danger("Please select a valid city.");
    return;
  }
  try {
    await propertyStore.updateProperty(editingProperty.value.id, {
      property_name: editingProperty.value.name,
      category_id: categoryMap[editingProperty.value.type] || 1,
      description: editingProperty.value.description || "",
      address: editingProperty.value.address || "",
      city_id,
      province_id,
      country_id,
      latitude: editingProperty.value.raw?.latitude || 0,
      longitude: editingProperty.value.raw?.longitude || 0,
      contact_phone: editingProperty.value.contact_phone || "",
      contact_email: editingProperty.value.contact_email || "",
      number_of_floors: Number(editingProperty.value.number_of_floors) || 1,
    });
    if (editNewFiles.value.length) await uploadStagedImages();
    toast.success("Property updated!");
    closeEditModal();
  } catch {
    toast.danger("Failed to update property.");
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
    toast.success("Property deleted.");
    closeDeleteModal();
  } catch {
    toast.danger("Failed to delete property.");
  }
};

// ── Fetch ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await Promise.all([propertyStore.fetchMyProperties(), fetchCities()]);
    currentPage.value = 1;
  } catch {
    toast.danger("Failed to load properties.");
  }
});
</script>

<template>
  <main
    class="mt-25 transition-all duration-300"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <div class="px-6 pb-10 space-y-6">
      <!-- ── Page Header ───────────────────────────────────────────── -->
      <header
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div class="flex items-center gap-2 mb-1">
            <BuildingOffice2Icon class="w-5 h-5 text-(--color-primary)" />
            <span
              class="text-xs font-bold uppercase tracking-widest text-(--color-primary)"
            >
              Property Management
            </span>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-(--color-text)">
            My Properties
          </h1>
          <p class="mt-1 text-sm text-(--color-muted)">
            {{ filteredProperties.length }} of
            {{ properties.length }} properties shown
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <RouterLink
            to="/owner/amenities"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-muted) text-sm font-semibold hover:border-(--color-primary) hover:text-(--color-primary) transition"
          >
            Manage Amenities
          </RouterLink>
          <button
            @click="isAddModalOpen = true"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-90 transition shadow-sm"
          >
            <PlusIcon class="w-4 h-4" />
            Add Property
          </button>
        </div>
      </header>

      <!-- ── Stats Bar ─────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 flex flex-col gap-1"
          :class="
            ownerFilters.status === 'all'
              ? 'border-(--color-primary) bg-(--color-primary-soft)'
              : ''
          "
          @click="ownerFilters.status = 'all'"
          role="button"
        >
          <span class="text-2xl font-black text-(--color-text)">{{
            stats.total
          }}</span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-(--color-muted)"
            >Total</span
          >
        </div>
        <div
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 flex flex-col gap-1 cursor-pointer hover:border-emerald-300 transition"
          :class="
            ownerFilters.status === 'approved'
              ? 'border-emerald-400 bg-emerald-50'
              : ''
          "
          @click="
            ownerFilters.status =
              ownerFilters.status === 'approved' ? 'all' : 'approved'
          "
          role="button"
        >
          <span class="text-2xl font-black text-emerald-600">{{
            stats.approved
          }}</span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-(--color-muted)"
            >Approved</span
          >
        </div>
        <div
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 flex flex-col gap-1 cursor-pointer hover:border-amber-300 transition"
          :class="
            ownerFilters.status === 'pending'
              ? 'border-amber-400 bg-amber-50'
              : ''
          "
          @click="
            ownerFilters.status =
              ownerFilters.status === 'pending' ? 'all' : 'pending'
          "
          role="button"
        >
          <span class="text-2xl font-black text-amber-500">{{
            stats.pending
          }}</span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-(--color-muted)"
            >Pending</span
          >
        </div>
        <div
          class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 flex flex-col gap-1 cursor-pointer hover:border-rose-300 transition"
          :class="
            ownerFilters.status === 'rejected'
              ? 'border-rose-400 bg-rose-50'
              : ''
          "
          @click="
            ownerFilters.status =
              ownerFilters.status === 'rejected' ? 'all' : 'rejected'
          "
          role="button"
        >
          <span class="text-2xl font-black text-rose-500">{{
            stats.rejected
          }}</span>
          <span
            class="text-xs font-bold uppercase tracking-wider text-(--color-muted)"
            >Rejected</span
          >
        </div>
      </div>

      <!-- ── Search & Filters ──────────────────────────────────────── -->
      <div
        class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <!-- Search -->
          <div class="relative flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted)"
            />
            <input
              v-model="ownerFilters.search"
              type="text"
              placeholder="Search properties..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-input) text-sm text-(--color-text) outline-none focus:border-(--color-primary) transition"
            />
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-2">
            <select
              v-model="ownerFilters.city"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3 py-2.5 text-sm text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option value="all">All Cities</option>
              <option v-for="c in cities" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>

            <select
              v-model="ownerFilters.category"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3 py-2.5 text-sm text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="homestay">Homestay</option>
              <option value="guesthouse">Guesthouse</option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="resetOwnerFilters"
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-muted) hover:border-rose-300 hover:text-rose-500 transition"
            >
              <XMarkIcon class="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        <!-- Active filter pills -->
        <div
          v-if="hasActiveFilters"
          class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-(--color-border)"
        >
          <span class="text-xs text-(--color-muted) self-center">
            <FunnelIcon class="w-3.5 h-3.5 inline mr-1" />Active filters:
          </span>
          <span
            v-if="ownerFilters.search"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold"
          >
            "{{ ownerFilters.search }}"
            <button @click="ownerFilters.search = ''" class="hover:opacity-70">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
          <span
            v-if="ownerFilters.city !== 'all'"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold"
          >
            {{ ownerFilters.city }}
            <button @click="ownerFilters.city = 'all'" class="hover:opacity-70">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
          <span
            v-if="ownerFilters.category !== 'all'"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold"
          >
            {{ ownerFilters.category }}
            <button
              @click="ownerFilters.category = 'all'"
              class="hover:opacity-70"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
          <span
            v-if="ownerFilters.status !== 'all'"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold"
          >
            {{ ownerFilters.status }}
            <button
              @click="ownerFilters.status = 'all'"
              class="hover:opacity-70"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>

      <!-- ── Properties Grid ───────────────────────────────────────── -->
      <section>
        <!-- Loading skeletons -->
        <div
          v-if="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <PropertyCardSkeleton v-for="n in 8" :key="n" />
        </div>

        <!-- Empty: no properties at all -->
        <div
          v-else-if="properties.length === 0"
          class="rounded-2xl border-2 border-dashed border-(--color-border) p-16 text-center"
        >
          <BuildingOffice2Icon
            class="w-12 h-12 text-(--color-muted) mx-auto mb-4 opacity-40"
          />
          <p class="text-lg font-bold text-(--color-text) mb-1">
            No properties yet
          </p>
          <p class="text-sm text-(--color-muted) mb-6">
            Add your first property to start accepting bookings.
          </p>
          <button
            @click="isAddModalOpen = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-90 transition"
          >
            <PlusIcon class="w-4 h-4" />
            Add your first property
          </button>
        </div>

        <!-- Empty: no matches -->
        <div
          v-else-if="filteredProperties.length === 0"
          class="rounded-2xl border-2 border-dashed border-(--color-border) p-16 text-center"
        >
          <MagnifyingGlassIcon
            class="w-12 h-12 text-(--color-muted) mx-auto mb-4 opacity-40"
          />
          <p class="text-lg font-bold text-(--color-text) mb-1">
            No matches found
          </p>
          <p class="text-sm text-(--color-muted) mb-6">
            Try adjusting your search or filters.
          </p>
          <button
            @click="resetOwnerFilters"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-(--color-border) text-(--color-muted) text-sm font-semibold hover:border-(--color-primary) hover:text-(--color-primary) transition"
          >
            <XMarkIcon class="w-4 h-4" />
            Clear all filters
          </button>
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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

      <!-- ── Pagination ─────────────────────────────────────────────── -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="px-4 py-2 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary) disabled:opacity-40 disabled:pointer-events-none transition"
        >
          ← Previous
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          class="w-9 h-9 rounded-xl text-sm font-bold transition"
          :class="
            currentPage === page
              ? 'bg-(--color-primary) text-white shadow-sm'
              : 'border border-(--color-border) text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary)'
          "
        >
          {{ page }}
        </button>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="px-4 py-2 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-muted) hover:border-(--color-primary) hover:text-(--color-primary) disabled:opacity-40 disabled:pointer-events-none transition"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- ── Add Modal ───────────────────────────────────────────────── -->
    <AppModal
      :open="isAddModalOpen"
      :title="currentStep === 1 ? 'Add New Property' : 'Upload Images'"
      @close="closeAddModal"
    >
      <!-- Step indicator -->
      <div class="flex items-center gap-2 mb-5">
        <div class="flex items-center gap-2">
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="
              currentStep >= 1
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface-soft) text-(--color-muted)'
            "
            >1</span
          >
          <span
            class="text-xs font-semibold"
            :class="
              currentStep >= 1 ? 'text-(--color-text)' : 'text-(--color-muted)'
            "
            >Details</span
          >
        </div>
        <div class="flex-1 h-px bg-(--color-border)" />
        <div class="flex items-center gap-2">
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="
              currentStep >= 2
                ? 'bg-(--color-primary) text-white'
                : 'bg-(--color-surface-soft) text-(--color-muted)'
            "
            >2</span
          >
          <span
            class="text-xs font-semibold"
            :class="
              currentStep >= 2 ? 'text-(--color-text)' : 'text-(--color-muted)'
            "
            >Images</span
          >
        </div>
      </div>

      <!-- Step 1 -->
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
          <label class="grid gap-1.5 text-sm font-semibold text-(--color-text)">
            Type *
            <select
              v-model="newProperty.type"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3.5 py-2.5 text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option>Hotel</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Homestay</option>
              <option>Guesthouse</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-semibold text-(--color-text)">
            City *
            <select
              v-model="newProperty.location"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3.5 py-2.5 text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option v-for="c in cities" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </label>
        </div>

        <AppInput
          v-model.number="newProperty.number_of_floors"
          type="number"
          min="1"
          label="Number of Floors *"
          placeholder="e.g. 5"
        />

        <div class="grid grid-cols-2 gap-4">
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

        <p
          class="text-xs text-(--color-muted) bg-(--color-surface-soft) rounded-xl px-3 py-2.5"
        >
          ℹ️ New properties require admin approval before they're visible to
          guests.
        </p>
      </form>

      <!-- Step 2 -->
      <div v-else class="space-y-4">
        <p class="text-sm text-(--color-muted)">
          Upload photos to help guests discover your property. You can skip and
          add them later.
        </p>

        <label
          class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-(--color-border) rounded-xl cursor-pointer hover:border-(--color-primary) hover:bg-(--color-primary-soft) transition-all"
        >
          <CloudArrowUpIcon class="w-8 h-8 text-(--color-muted) mb-2" />
          <span class="text-sm font-semibold text-(--color-text)"
            >Click to upload images</span
          >
          <span class="text-xs text-(--color-muted) mt-1"
            >PNG, JPG up to 10MB · Multiple allowed</span
          >
          <input
            type="file"
            class="hidden"
            accept="image/*"
            multiple
            @change="handleImageSelect"
          />
        </label>

        <div v-if="imagePreviewUrls.length" class="grid grid-cols-4 gap-2">
          <div
            v-for="(url, index) in imagePreviewUrls"
            :key="index"
            class="relative aspect-square rounded-xl overflow-hidden group"
          >
            <img :src="url" class="w-full h-full object-cover" />
            <button
              type="button"
              @click="removeNewImage(index)"
              class="absolute top-1 right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <XMarkIcon class="w-3.5 h-3.5 text-white" />
            </button>
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
            <CloudArrowUpIcon v-if="!uploadingImages" class="w-4 h-4" />
            {{
              uploadingImages
                ? "Uploading..."
                : `Upload ${selectedImages.length} photo(s)`
            }}
          </AppButton>
        </template>
      </template>
    </AppModal>

    <!-- ── Edit Modal ──────────────────────────────────────────────── -->
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
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <AppInput
              v-model="editingProperty.name"
              label="Property Name *"
              placeholder="e.g. Sunset Villa"
              required
            />
          </div>
          <div>
            <AppInput
              v-model="editingProperty.contact_phone"
              label="Contact Phone *"
              placeholder="+855 12 345 678"
            />
          </div>
          <div>
            <AppInput
              v-model="editingProperty.contact_email"
              label="Contact Email *"
              type="email"
              placeholder="contact@example.com"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <label class="grid gap-1.5 text-sm font-semibold text-(--color-text)">
            Type *
            <select
              v-model="editingProperty.type"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3.5 py-2.5 text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option>Hotel</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Homestay</option>
              <option>Guesthouse</option>
            </select>
          </label>
          <label class="grid gap-1.5 text-sm font-semibold text-(--color-text)">
            City *
            <select
              v-model="editingProperty.location"
              class="rounded-xl border border-(--color-border) bg-(--color-input) px-3.5 py-2.5 text-(--color-text) outline-none focus:border-(--color-primary) transition"
            >
              <option v-for="c in cities" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <AppInput
            v-model.number="editingProperty.number_of_floors"
            type="number"
            min="1"
            label="Number of Floors"
            placeholder="e.g. 5"
          />
          <AppInput
            v-model="editingProperty.address"
            label="Address"
            placeholder="Street address"
          />
        </div>

        <AppInput
          v-model="editingProperty.description"
          label="Description"
          placeholder="Brief description for guests..."
        />

        <!-- Image Manager -->
        <div class="pt-3 border-t border-(--color-border) space-y-3">
          <p class="text-sm font-bold text-(--color-text)">Property Images</p>

          <div
            v-if="editImagesLoading"
            class="flex items-center justify-center h-20 gap-2 text-sm text-(--color-muted)"
          >
            <div
              class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"
            />
            Loading images...
          </div>

          <div v-else>
            <div v-if="editImages.length" class="grid grid-cols-3 gap-2 mb-3">
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
                  :src="resolveAssetUrl(img.image_url)"
                  class="w-full h-full object-cover"
                />
                <div
                  v-if="editCoverId === img.id"
                  class="absolute top-1.5 left-1.5 bg-(--color-primary) text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                >
                  <StarIconSolid class="w-2.5 h-2.5" /> Cover
                </div>
                <div
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
                >
                  <button
                    v-if="editCoverId !== img.id"
                    type="button"
                    @click="setCover(img.id)"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-amber-500 flex items-center justify-center transition"
                  >
                    <StarIcon class="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    @click="deleteEditImage(img.id)"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-rose-500 flex items-center justify-center transition"
                  >
                    <TrashIcon class="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-center text-(--color-muted) py-3">
              No images yet.
            </p>

            <!-- Staged previews -->
            <div v-if="editNewPreviews.length" class="mb-3">
              <p
                class="text-xs font-bold text-(--color-muted) uppercase tracking-wider mb-2"
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
                    @click="removeStagedFile(idx)"
                    class="absolute top-1 right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                  >
                    <XMarkIcon class="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                :disabled="editImagesUploading"
                @click="uploadStagedImages"
                class="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-(--color-primary) text-(--color-primary) text-sm font-semibold hover:bg-(--color-primary-soft) disabled:opacity-50 transition"
              >
                <CloudArrowUpIcon class="w-4 h-4" />
                {{
                  editImagesUploading
                    ? "Uploading..."
                    : `Upload ${editNewPreviews.length} image(s)`
                }}
              </button>
            </div>

            <label
              class="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-(--color-border) rounded-xl cursor-pointer hover:border-(--color-primary) hover:bg-(--color-primary-soft) transition text-sm text-(--color-muted) hover:text-(--color-primary)"
            >
              <CloudArrowUpIcon class="w-4 h-4" />
              Add more images
              <input
                type="file"
                class="hidden"
                accept="image/*"
                multiple
                @change="handleEditImageSelect"
              />
            </label>
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

    <!-- ── Delete Modal ────────────────────────────────────────────── -->
    <AppModal
      :open="isDeleteModalOpen"
      title="Delete Property"
      @close="closeDeleteModal"
    >
      <div class="text-center py-2">
        <div
          class="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <TrashIcon class="w-7 h-7 text-rose-500" />
        </div>
        <p class="font-bold text-(--color-text) mb-1">Are you sure?</p>
        <p class="text-sm text-(--color-muted)">
          This property will be permanently deleted and cannot be recovered.
        </p>
      </div>
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
