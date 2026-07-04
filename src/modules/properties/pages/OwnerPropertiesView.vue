<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from "vue";
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
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  Squares2X2Icon,
  PhotoIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

const propertyStore = usePropertyStore();
const toast = useToastStore();
const { isSidebarOpen } = useSidebar();

const currentPage = ref(1);
const perPage = 8;

const properties = computed(() => propertyStore.myProperties);
const loading = computed(() => propertyStore.loading);

const imageError = ref("");

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
    const matchesStatus = (() => {
      if (ownerFilters.value.status === "all") return true;
      if (ownerFilters.value.status === "pending_changes")
        return p.pendingEdit === true;
      return normalize(p.status) === normalize(ownerFilters.value.status);
    })();
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
  latitude: 11.5564,
  longitude: 104.9282,
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
      latitude: newProperty.value.latitude ?? coords.lat,
      longitude: newProperty.value.longitude ?? coords.lng,
      contact_phone: newProperty.value.contact_phone,
      contact_email: newProperty.value.contact_email,
      number_of_floors: Number(newProperty.value.number_of_floors) || 1,
    });
    newPropertyId.value = Number(
      response?.data?.[0]?.id ??
        response?.data?.id ??
        response?.data?.property?.id ??
        response?.id,
    );
    currentStep.value = 2;
  } catch {
    toast.danger("Failed to add property. Please try again.");
  }
};

const handleImageSelect = (event) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const maxImages = 10;

  const files = Array.from(event.target.files);
  const validFiles = [];
  const errors = [];

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`"${file.name}" is not supported. Use PNG or JPG only.`);
      continue;
    }
    if (file.size > maxSize) {
      errors.push(`"${file.name}" exceeds 10MB limit.`);
      continue;
    }
    validFiles.push(file);
  }

  const totalAfter = selectedImages.value.length + validFiles.length;
  if (totalAfter > maxImages) {
    imageError.value = `You can upload a maximum of ${maxImages} images. You already have ${selectedImages.value.length}.`;
    event.target.value = "";
    return;
  }

  imageError.value = errors.length ? errors.join(" · ") : "";

  if (!validFiles.length) {
    event.target.value = "";
    return;
  }

  selectedImages.value = [...selectedImages.value, ...validFiles];
  imagePreviewUrls.value = [
    ...imagePreviewUrls.value,
    ...validFiles.map((f) => URL.createObjectURL(f)),
  ];

  event.target.value = "";
};

const removeNewImage = (index) => {
  URL.revokeObjectURL(imagePreviewUrls.value[index]);
  selectedImages.value.splice(index, 1);
  imagePreviewUrls.value.splice(index, 1);
};

const handleUploadImages = async () => {
  if (!selectedImages.value.length) {
    imageError.value = "Please upload at least 1 image to continue.";
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
    // Ensure cities are loaded before we open the modal
    if (!cities.value.length) await fetchCities();

    const res = await propertyApi.getMyPropertyById(property.id);
    const full = Array.isArray(res)
      ? res[0]
      : res?.data?.[0] || res?.data || res;
    editingProperty.value = {
      id: property.id,
      name: full?.property_name || property.name,
      type: (() => {
        const raw =
          full?.category?.category_name || full?.category_name || "Hotel";
        return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      })(),
      location: full?.city?.city_name || full?.city_name || "Phnom Penh",
      address: full?.address || "",
      description: full?.description || "",
      contact_phone: full?.contact_phone || "",
      contact_email: full?.contact_email || "",
      number_of_floors: full?.number_of_floors ?? 1,
      latitude: full?.latitude ? Number(full.latitude) : (property.latitude ? Number(property.latitude) : null),
      longitude: full?.longitude ? Number(full.longitude) : (property.longitude ? Number(property.longitude) : null),
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

  // Resolve city/province ids — cities may not have loaded yet; fall back gracefully
  let city_id = null;
  let province_id = null;
  let country_id = 1;

  if (cities.value.length) {
    const resolved = resolveLocationIds(editingProperty.value.location);
    city_id = resolved.city_id;
    province_id = resolved.province_id;
    country_id = resolved.country_id;

    if (!city_id || !province_id) {
      toast.danger("Please select a valid city.");
      return;
    }
  } else {
    // Cities list not loaded — use ids from the raw property if available
    city_id =
      editingProperty.value.raw?.city_id ??
      editingProperty.value.raw?.city?.id ??
      null;
    province_id = editingProperty.value.raw?.province_id ?? null;
  }

  // Normalise whatever shape the backend returns: { status_name } | string | nested
  const rawStatus = String(
    editingProperty.value.raw?.status?.status_name ??
      editingProperty.value.raw?.status_name ??
      editingProperty.value.raw?.status ??
      "",
  )
    .toLowerCase()
    .trim();
  const isApprovedProperty = rawStatus === "approved";

  const payload = {
    property_name: editingProperty.value.name,
    category_id: categoryMap[editingProperty.value.type] || 1,
    description: editingProperty.value.description || "",
    address: editingProperty.value.address || "",
    city_id,
    province_id,
    country_id,
    latitude: editingProperty.value.latitude ?? (
      cityCoordinates[editingProperty.value.location] || {
        lat: editingProperty.value.raw?.latitude || 11.5564,
      }
    ).lat,
    longitude: editingProperty.value.longitude ?? (
      cityCoordinates[editingProperty.value.location] || {
        lng: editingProperty.value.raw?.longitude || 104.9282,
      }
    ).lng,
    contact_phone: editingProperty.value.contact_phone || "",
    contact_email: editingProperty.value.contact_email || "",
    number_of_floors: Number(editingProperty.value.number_of_floors) || 1,
  };

  try {
    // Always use PATCH — the backend decides whether to update directly
    // or create a pending edit request (for approved properties).
    await propertyStore.updateProperty(editingProperty.value.id, payload);
    if (editNewFiles.value.length) await uploadStagedImages();

    const successMsg = isApprovedProperty
      ? "Your property changes have been submitted for admin approval."
      : "Property updated successfully!";
    toast.success(successMsg);

    closeEditModal();
    await propertyStore.fetchMyProperties();
  } catch {
    toast.danger("Failed to submit changes. Please try again.");
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

// ── Activate / Deactivate ─────────────────────────────────────────────────────
const handleToggleStatus = async ({ id, action }) => {
  try {
    if (action === "deactivate") {
      await propertyApi.deactivateProperty(id);
      toast.success("Property deactivated.");
    } else {
      await propertyApi.activateProperty(id);
      toast.success("Property activated.");
    }
    await propertyStore.fetchMyProperties();
  } catch {
    toast.danger(`Failed to ${action} property. Please try again.`);
  }
};

// ── Leaflet.js Map Picker Integration ─────────────────────────────────────────
let registerMapInstance = null;
let registerMarker = null;
let editMapInstance = null;
let editMarker = null;

const initRegisterMap = () => {
  const container = document.getElementById("register-map");
  if (!container || !window.L) return;

  if (registerMapInstance) {
    registerMapInstance.remove();
    registerMapInstance = null;
    registerMarker = null;
  }

  const lat = newProperty.value.latitude || 11.5564;
  const lng = newProperty.value.longitude || 104.9282;

  registerMapInstance = window.L.map("register-map", {
    zoomControl: false
  }).setView([lat, lng], 13);

  const isDarkMode = document.documentElement.classList.contains("dark");
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  window.L.tileLayer(tileUrl, {
    maxZoom: 19
  }).addTo(registerMapInstance);

  window.L.control.zoom({
    position: 'topright'
  }).addTo(registerMapInstance);

  const icon = window.L.divIcon({
    className: "custom-picker-pin",
    html: `<div class="w-7 h-7 bg-(--color-wishlist) rounded-full border-2 border-white flex items-center justify-center shadow-xl animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4"><path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  registerMarker = window.L.marker([lat, lng], {
    icon,
    draggable: true
  }).addTo(registerMapInstance);

  registerMarker.on("dragend", (event) => {
    const marker = event.target;
    const position = marker.getLatLng();
    newProperty.value.latitude = Number(position.lat.toFixed(6));
    newProperty.value.longitude = Number(position.lng.toFixed(6));
  });

  registerMapInstance.on("click", (event) => {
    const latlng = event.latlng;
    registerMarker.setLatLng(latlng);
    newProperty.value.latitude = Number(latlng.lat.toFixed(6));
    newProperty.value.longitude = Number(latlng.lng.toFixed(6));
  });
};

const initEditMap = () => {
  const container = document.getElementById("edit-map");
  if (!container || !editingProperty.value || !window.L) return;

  if (editMapInstance) {
    editMapInstance.remove();
    editMapInstance = null;
    editMarker = null;
  }

  const lat = editingProperty.value.latitude || 11.5564;
  const lng = editingProperty.value.longitude || 104.9282;

  editMapInstance = window.L.map("edit-map", {
    zoomControl: false
  }).setView([lat, lng], 13);

  const isDarkMode = document.documentElement.classList.contains("dark");
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  window.L.tileLayer(tileUrl, {
    maxZoom: 19
  }).addTo(editMapInstance);

  window.L.control.zoom({
    position: 'topright'
  }).addTo(editMapInstance);

  const icon = window.L.divIcon({
    className: "custom-picker-pin",
    html: `<div class="w-7 h-7 bg-(--color-wishlist) rounded-full border-2 border-white flex items-center justify-center shadow-xl animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4"><path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  editMarker = window.L.marker([lat, lng], {
    icon,
    draggable: true
  }).addTo(editMapInstance);

  editMarker.on("dragend", (event) => {
    const marker = event.target;
    const position = marker.getLatLng();
    editingProperty.value.latitude = Number(position.lat.toFixed(6));
    editingProperty.value.longitude = Number(position.lng.toFixed(6));
  });

  editMapInstance.on("click", (event) => {
    const latlng = event.latlng;
    editMarker.setLatLng(latlng);
    editingProperty.value.latitude = Number(latlng.lat.toFixed(6));
    editingProperty.value.longitude = Number(latlng.lng.toFixed(6));
  });
};

const handleRegisterMapLifecycle = async () => {
  if (isAddModalOpen.value && currentStep.value === 1) {
    await nextTick();
    const initialCoords = cityCoordinates[newProperty.value.location] || { lat: 11.5564, lng: 104.9282 };
    newProperty.value.latitude = newProperty.value.latitude || initialCoords.lat;
    newProperty.value.longitude = newProperty.value.longitude || initialCoords.lng;
    initRegisterMap();
  } else {
    if (registerMapInstance) {
      registerMapInstance.remove();
      registerMapInstance = null;
      registerMarker = null;
    }
  }
};

watch([isAddModalOpen, currentStep], handleRegisterMapLifecycle);

watch(() => newProperty.value.location, (newLocation) => {
  const coords = cityCoordinates[newLocation];
  if (coords && registerMapInstance && registerMarker) {
    newProperty.value.latitude = coords.lat;
    newProperty.value.longitude = coords.lng;
    registerMarker.setLatLng([coords.lat, coords.lng]);
    registerMapInstance.setView([coords.lat, coords.lng], 13);
  }
});

watch(isEditModalOpen, async (isOpen) => {
  if (isOpen && editingProperty.value) {
    await nextTick();
    const initialCoords = cityCoordinates[editingProperty.value.location] || { lat: 11.5564, lng: 104.9282 };
    editingProperty.value.latitude = editingProperty.value.latitude || initialCoords.lat;
    editingProperty.value.longitude = editingProperty.value.longitude || initialCoords.lng;
    initEditMap();
  } else {
    if (editMapInstance) {
      editMapInstance.remove();
      editMapInstance = null;
      editMarker = null;
    }
  }
});

watch(() => editingProperty.value?.location, (newLocation) => {
  if (!newLocation || !editingProperty.value) return;
  const coords = cityCoordinates[newLocation];
  if (coords && editMapInstance && editMarker) {
    editingProperty.value.latitude = coords.lat;
    editingProperty.value.longitude = coords.lng;
    editMarker.setLatLng([coords.lat, coords.lng]);
    editMapInstance.setView([coords.lat, coords.lng], 13);
  }
});

onBeforeUnmount(() => {
  if (registerMapInstance) {
    registerMapInstance.remove();
    registerMapInstance = null;
  }
  if (editMapInstance) {
    editMapInstance.remove();
    editMapInstance = null;
  }
});

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
    class="mt-24 transition-all duration-300 min-h-screen bg-(--color-background)"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <div class="max-w-[1600px] mx-auto px-8 pb-16 pt-4">
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 class="text-[28px] font-black text-(--color-text) tracking-tight">
            My Properties
          </h1>
          <p class="mt-1 text-sm font-medium text-(--color-muted)">
            Monitor asset status, update information portfolios, and review live
            pipeline records.
          </p>
        </div>
        <button
          @click="isAddModalOpen = true"
          class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:shadow-[0_8px_20px_rgba(var(--color-primary-rgb),0.24)] hover:-translate-y-0.5 transition-all duration-200 shrink-0"
        >
          <PlusIcon class="w-4 h-4 stroke-[3]" />
          Add New Property
        </button>
      </header>

      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-(--color-border) bg-(--color-surface) p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
      >
        <div class="flex flex-wrap items-center gap-1">
          <button
            @click="ownerFilters.status = 'all'"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="
              ownerFilters.status === 'all'
                ? 'bg-(--color-primary)/10 text-(--color-primary)'
                : 'text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            All Properties
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-black"
              :class="
                ownerFilters.status === 'all'
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
              "
            >
              {{ stats.total }}
            </span>
          </button>

          <button
            @click="ownerFilters.status = 'approved'"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="
              ownerFilters.status === 'approved'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-black"
              :class="
                ownerFilters.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
              "
            >
              {{ stats.approved }}
            </span>
          </button>

          <button
            @click="ownerFilters.status = 'pending_changes'"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="
              ownerFilters.status === 'pending_changes'
                ? 'bg-orange-50 text-orange-700'
                : 'text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Pending Changes
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-black"
              :class="
                ownerFilters.status === 'pending_changes'
                  ? 'bg-orange-500 text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
              "
            >
              {{ properties.filter((p) => p.pendingEdit).length }}
            </span>
          </button>

          <button
            @click="ownerFilters.status = 'pending'"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="
              ownerFilters.status === 'pending'
                ? 'bg-blue-50 text-blue-700'
                : 'text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Under Review
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-black"
              :class="
                ownerFilters.status === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
              "
            >
              {{ stats.pending }}
            </span>
          </button>

          <button
            @click="ownerFilters.status = 'rejected'"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="
              ownerFilters.status === 'rejected'
                ? 'bg-rose-50 text-rose-700'
                : 'text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-black"
              :class="
                ownerFilters.status === 'rejected'
                  ? 'bg-rose-600 text-white'
                  : 'bg-(--color-border) text-(--color-muted)'
              "
            >
              {{ stats.rejected }}
            </span>
          </button>
        </div>

        <div class="flex items-center gap-2 px-2 md:border-l border-(--color-border)">
          <button
            class="flex items-center gap-1.5 text-xs text-(--color-muted) font-bold tracking-wide uppercase bg-(--color-surface-soft) hover:bg-(--color-border) transition px-3.5 py-2 rounded-xl border border-(--color-border)"
          >
            <FunnelIcon class="w-3.5 h-3.5" />
            Sort
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <div class="relative w-full sm:max-w-sm group">
          <MagnifyingGlassIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) group-focus-within:text-(--color-primary) transition-colors"
          />
          <input
            v-model="ownerFilters.search"
            type="text"
            placeholder="Search by name, tags, or region..."
            class="w-full pl-11 pr-4 py-3 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm text-(--color-text) placeholder-gray-400 outline-none focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 shadow-[0_4px_18px_rgba(0,0,0,0.01)] transition-all"
          />
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select
            v-model="ownerFilters.city"
            class="w-full sm:w-auto rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-semibold text-(--color-muted) outline-none focus:border-(--color-primary) shadow-[0_4px_18px_rgba(0,0,0,0.01)] transition"
          >
            <option value="all">All Cities</option>
            <option v-for="c in cities" :key="c.id" :value="c.name">
              {{ c.name }}
            </option>
          </select>

          <select
            v-model="ownerFilters.category"
            class="w-full sm:w-auto rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-semibold text-(--color-muted) outline-none focus:border-(--color-primary) shadow-[0_4px_18px_rgba(0,0,0,0.01)] transition"
          >
            <option value="all">All Property Types</option>
            <option value="hotel">Hotel</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="homestay">Homestay</option>
            <option value="guesthouse">Guesthouse</option>
          </select>

          <button
            v-if="hasActiveFilters"
            @click="resetOwnerFilters"
            class="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-rose-100 text-sm font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-all"
          >
            <XMarkIcon class="w-4 h-4 stroke-[2.5]" />
            Reset
          </button>
        </div>
      </div>

      <section class="mb-12">
        <div
          v-if="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <PropertyCardSkeleton v-for="n in 8" :key="n" />
        </div>

        <div
          v-else-if="properties.length === 0"
          class="bg-(--color-surface) rounded-3xl border border-(--color-border) p-20 text-center shadow-[0_10px_40px_rgba(0,0,0,0.02)] max-w-2xl mx-auto"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-(--color-surface-soft) flex items-center justify-center mx-auto mb-5 text-(--color-muted)"
          >
            <BuildingOffice2Icon class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-black text-(--color-text) tracking-tight">
            No registered properties
          </h3>
          <p class="text-sm text-(--color-muted) max-w-sm mx-auto mt-2 mb-8">
            You haven't registered any properties yet. Add your first property to start receiving bookings.
          </p>
          <button
            @click="isAddModalOpen = true"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-90 transition"
          >
            <PlusIcon class="w-4 h-4 stroke-[2.5]" />
            Add First Property
          </button>
        </div>

        <div
          v-else-if="filteredProperties.length === 0"
          class="bg-(--color-surface) rounded-3xl border border-(--color-border) p-20 text-center shadow-[0_10px_40px_rgba(0,0,0,0.02)] max-w-2xl mx-auto"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-(--color-background) flex items-center justify-center mx-auto mb-5 text-(--color-muted)"
          >
            <MagnifyingGlassIcon class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-black text-(--color-text) tracking-tight">
            No properties found
          </h3>
          <p class="text-sm text-(--color-muted) max-w-sm mx-auto mt-2 mb-8">
            We couldn't find any properties matching your current search criteria.
          </p>
          <button
            @click="resetOwnerFilters"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-(--color-border) text-(--color-muted) bg-(--color-surface) text-sm font-bold hover:bg-(--color-surface-soft) transition"
          >
            <XMarkIcon class="w-4 h-4" />
            Clear Filters
          </button>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <PropertyCard
            v-for="property in paginatedProperties"
            :key="property.id"
            :property="property"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @toggle-status="handleToggleStatus"
          />
        </div>
      </section>

      <footer
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 border-t border-(--color-border) pt-8"
      >
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm font-bold text-(--color-muted) hover:border-(--color-border) disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <ArrowLeftIcon class="w-4 h-4 stroke-[2.5]" />
          Prev
        </button>
        <div class="flex items-center gap-1.5 mx-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="w-10 h-10 rounded-xl text-sm font-bold transition-all"
            :class="
              currentPage === page
                ? 'bg-(--color-primary) text-white shadow-md shadow-primary/20 scale-105'
                : 'bg-(--color-surface) border border-(--color-border) text-(--color-muted) hover:bg-(--color-surface-soft)'
            "
          >
            {{ page }}
          </button>
        </div>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm font-bold text-(--color-muted) hover:border-(--color-border) disabled:opacity-40 disabled:pointer-events-none transition"
        >
          Next
          <ArrowRightIcon class="w-4 h-4 stroke-[2.5]" />
        </button>
      </footer>
    </div>

    <AppModal
      :open="isAddModalOpen"
      :title="
        currentStep === 1 ? 'Property Details' : 'Property Images'
      "
      @close="closeAddModal"
    >
      <div
        class="flex items-center gap-3 bg-(--color-surface-soft) p-3 rounded-xl border border-(--color-border) mb-6"
      >
        <div class="flex items-center gap-2 px-2">
          <span
            class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all"
            :class="
              currentStep >= 1
                ? 'bg-(--color-primary) text-white shadow-sm'
                : 'bg-gray-200 text-(--color-muted)'
            "
            >1</span
          >
          <span
            class="text-xs font-bold"
            :class="currentStep >= 1 ? 'text-(--color-text)' : 'text-(--color-muted)'"
            >Details</span
          >
        </div>
        <div class="flex-1 h-0.5 bg-gray-200 rounded-full" />
        <div class="flex items-center gap-2 px-2">
          <span
            class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all"
            :class="
              currentStep >= 2
                ? 'bg-(--color-primary) text-white shadow-sm'
                : 'bg-gray-200 text-(--color-muted)'
            "
            >2</span
          >
          <span
            class="text-xs font-bold"
            :class="currentStep >= 2 ? 'text-(--color-text)' : 'text-(--color-muted)'"
            >Images</span
          >
        </div>
      </div>

      <form
        v-if="currentStep === 1"
        id="add-property-form"
        class="space-y-4"
        @submit.prevent="handleAddProperty"
      >
        <div>
          <AppInput
            v-model="newProperty.name"
            label="Property Name"
            required
            placeholder="e.g. Skyline Residency Tower"
            :error="addErrors.name"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-(--color-muted) tracking-wide uppercase"
              >Property Type <span class="text-(--color-danger)">*</span></label
            >
            <select
              v-model="newProperty.type"
              class="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-3 text-sm font-semibold text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-4 focus:ring-primary/5 transition"
            >
              <option>Hotel</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Homestay</option>
              <option>Guesthouse</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-bold text-(--color-muted) tracking-wide uppercase"
              >City / Location <span class="text-(--color-danger)">*</span></label
            >
            <select
              v-model="newProperty.location"
              class="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-3 text-sm font-semibold text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-4 focus:ring-primary/5 transition"
            >
              <option>Phnom Penh</option>
              <option>Siem Reap</option>
              <option>Kampot</option>
              <option>Sihanoukville</option>
              <option>Battambang</option>
              <option>Koh Rong</option>
            </select>
          </div>
        </div>

        <div>
          <AppInput
            v-model="newProperty.address"
            label="Street Address"
            required
            placeholder="e.g. St. 210, Sangkat Boeung Keng Kang I"
            :error="addErrors.address"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <AppInput
              v-model="newProperty.contact_phone"
              label="Contact Phone"
              required
              placeholder="e.g. +855 12 345 678"
              :error="addErrors.contact_phone"
            />
          </div>
          <div>
            <AppInput
              v-model="newProperty.contact_email"
              label="Contact Email"
              required
              placeholder="e.g. desks@property.com"
              :error="addErrors.contact_email"
            />
          </div>
        </div>

        <div>
          <AppInput
            v-model="newProperty.number_of_floors"
            type="number"
            min="1"
            max="200"
            label="Number of Floors"
            placeholder="1"
          />
        </div>

        <div>
          <label
            class="text-xs font-bold text-(--color-muted) tracking-wide uppercase block mb-1.5"
            >Property Description</label
          >
          <textarea
            v-model="newProperty.description"
            rows="3"
            placeholder="Elaborate on structural values, proximity configurations, luxury perks..."
            class="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-4 focus:ring-primary/5 transition resize-none"
          ></textarea>
        </div>

        <div>
          <label class="text-xs font-bold text-(--color-muted) tracking-wide uppercase block mb-1.5">
            Pin Property Location on Map (Click or drag pin to position)
          </label>
          <div id="register-map" class="w-full h-64 border border-(--color-border) rounded-xl overflow-hidden relative z-10"></div>
          <div class="flex gap-4 mt-2 text-xs text-(--color-muted) font-semibold">
            <span>Latitude: <strong class="text-(--color-text)">{{ newProperty.latitude || 'Not set' }}</strong></span>
            <span>Longitude: <strong class="text-(--color-text)">{{ newProperty.longitude || 'Not set' }}</strong></span>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 border-t border-(--color-border) pt-4 mt-6"
        >
          <button
            type="button"
            @click="closeAddModal"
            class="px-5 py-2.5 rounded-xl border border-(--color-border) text-sm font-bold text-(--color-muted) hover:bg-(--color-surface-soft) transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-95 transition shadow-sm"
          >
            Save & Advance
          </button>
        </div>
      </form>

      <div v-else class="space-y-5">
        <div
          class="relative group border-2 border-dashed border-(--color-border) hover:border-(--color-primary) bg-(--color-background) rounded-2xl p-8 text-center transition"
        >
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="handleImageSelect"
          />
          <div
            class="w-12 h-12 bg-(--color-surface) rounded-xl shadow-sm flex items-center justify-center text-(--color-muted) mx-auto mb-3 group-hover:scale-110 transition duration-300"
          >
            <CloudArrowUpIcon class="w-6 h-6 text-(--color-primary)" />
          </div>
          <p class="text-sm font-bold text-(--color-text)">
            Drop property images here, or click to browse
          </p>
          <p class="text-xs text-(--color-muted) mt-1 font-medium">
            Supports ultra-high-definition PNG, JPEG, WebP (Max 10MB per unit,
            Limit 10 items)
          </p>
        </div>

        <AppAlert v-if="imageError" variant="danger">{{ imageError }}</AppAlert>

        <div v-if="imagePreviewUrls.length > 0" class="space-y-2">
          <label
            class="text-xs font-black text-(--color-muted) tracking-wider uppercase block"
            >Staged Upload Runway ({{ imagePreviewUrls.length }})</label
          >
          <div
            class="grid grid-cols-5 gap-3 bg-(--color-surface) border border-(--color-border) p-3 rounded-2xl"
          >
            <div
              v-for="(url, idx) in imagePreviewUrls"
              :key="idx"
              class="relative aspect-square rounded-xl overflow-hidden group/thumb border border-(--color-border)"
            >
              <img :src="url" class="w-full h-full object-cover" />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all duration-150"
              >
                <button
                  @click="removeNewImage(idx)"
                  class="w-7 h-7 bg-(--color-surface) rounded-full flex items-center justify-center text-rose-600 shadow transition transform hover:scale-110"
                >
                  <XMarkIcon class="w-4 h-4 stroke-[3]" />
                </button>
              </div>
              <span
                v-if="idx === 0"
                class="absolute bottom-1 left-1 text-[8px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                >Cover Priority</span
              >
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 border-t border-(--color-border) pt-4"
        >
          <button
            :disabled="uploadingImages"
            @click="closeAddModal"
            class="px-5 py-2.5 rounded-xl border border-(--color-border) text-sm font-bold text-(--color-muted) hover:bg-(--color-surface-soft) transition disabled:opacity-50"
          >
            Skip For Now
          </button>
          <button
            :disabled="uploadingImages || !selectedImages.length"
            @click="handleUploadImages"
            class="px-5 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-95 disabled:opacity-40 transition flex items-center gap-2 shadow-sm"
          >
            <ClockIcon v-if="uploadingImages" class="w-4 h-4 animate-spin" />
            Upload & Finish
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      :open="isEditModalOpen"
      title="Edit Property"
      @close="closeEditModal"
    >
      <div v-if="editingProperty" class="space-y-6">
        <div class="space-y-4">
          <div>
            <AppInput
              v-model="editingProperty.name"
              label="Property Name"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-bold text-(--color-muted) tracking-wide uppercase"
                >Property Type</label
              >
              <select
                v-model="editingProperty.type"
                class="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-3 text-sm font-semibold text-(--color-text) outline-none focus:border-(--color-primary) transition"
              >
                <option>Hotel</option>
                <option>Villa</option>
                <option>Apartment</option>
                <option>Homestay</option>
                <option>Guesthouse</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-bold text-(--color-muted) tracking-wide uppercase"
                >City / Location</label
              >
              <select
                v-model="editingProperty.location"
                class="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-3 text-sm font-semibold text-(--color-text) outline-none focus:border-(--color-primary) transition"
              >
                <option>Phnom Penh</option>
                <option>Siem Reap</option>
                <option>Kampot</option>
                <option>Sihanoukville</option>
                <option>Battambang</option>
                <option>Koh Rong</option>
              </select>
            </div>
          </div>

          <div>
            <AppInput
              v-model="editingProperty.address"
              label="Street Address"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <AppInput
              v-model="editingProperty.contact_phone"
              label="Contact Phone"
            />
            <AppInput
              v-model="editingProperty.contact_email"
              label="Contact Email"
            />
          </div>

          <div>
            <AppInput
              v-model="editingProperty.number_of_floors"
              type="number"
              min="1"
              max="200"
              label="Number of Floors"
            />
          </div>

          <div>
            <label
              class="text-xs font-bold text-(--color-muted) tracking-wide uppercase block mb-1.5"
              >Property Description</label
            >
            <textarea
              v-model="editingProperty.description"
              rows="3"
              class="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm text-(--color-text) outline-none focus:border-(--color-primary) transition resize-none"
            ></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-(--color-muted) tracking-wide uppercase block mb-1.5">
              Pin Property Location on Map (Click or drag pin to position)
            </label>
            <div id="edit-map" class="w-full h-64 border border-(--color-border) rounded-xl overflow-hidden relative z-10"></div>
            <div class="flex gap-4 mt-2 text-xs text-(--color-muted) font-semibold">
              <span>Latitude: <strong class="text-(--color-text)">{{ editingProperty.latitude || 'Not set' }}</strong></span>
              <span>Longitude: <strong class="text-(--color-text)">{{ editingProperty.longitude || 'Not set' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="border-t border-(--color-border) pt-5">
          <h4
            class="text-xs font-black text-(--color-muted) tracking-wider uppercase mb-3"
          >
            Uploaded Images
          </h4>

          <div
            v-if="editImagesLoading"
            class="flex items-center justify-center py-6"
          >
            <ClockIcon class="w-6 h-6 text-(--color-muted) animate-spin" />
          </div>

          <div
            v-else
            class="grid grid-cols-4 gap-3 bg-(--color-background) p-3 rounded-2xl border border-(--color-border)"
          >
            <div
              v-for="img in editImages"
              :key="img.id"
              class="relative aspect-square bg-(--color-surface) rounded-xl overflow-hidden border border-(--color-border) group/media"
            >
              <img
                :src="resolveAssetUrl(img.image_url)"
                class="w-full h-full object-cover"
              />

              <div
                v-if="editCoverId === img.id"
                class="absolute top-1.5 left-1.5 bg-emerald-600 text-[8px] font-black tracking-widest text-white px-2 py-0.5 rounded-md uppercase"
              >
                Active Cover
              </div>

              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 flex items-center justify-center gap-2 transition duration-200"
              >
                <button
                  v-if="editCoverId !== img.id"
                  @click="setCover(img.id)"
                  class="p-1.5 bg-(--color-surface) text-(--color-text) hover:text-emerald-600 hover:scale-105 rounded-lg shadow transition text-[10px] font-bold"
                  title="Make Cover"
                >
                  Set Cover
                </button>
                <button
                  @click="deleteEditImage(img.id)"
                  class="p-1.5 bg-(--color-surface) text-rose-600 hover:bg-rose-50 hover:scale-105 rounded-lg shadow transition"
                  title="Delete Image"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <label
              class="aspect-square border-2 border-dashed border-(--color-border) hover:border-(--color-primary) bg-(--color-surface) rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition text-(--color-muted) hover:text-(--color-primary)"
            >
              <PhotoIcon class="w-5 h-5" />
              <span class="text-[10px] font-bold tracking-tight"
                >Add Photo</span
              >
              <input
                type="file"
                multiple
                class="hidden"
                @change="handleEditImageSelect"
              />
            </label>
          </div>

          <div
            v-if="editNewPreviews.length > 0"
            class="mt-4 p-3 border border-orange-100 bg-orange-50/20 rounded-2xl space-y-2"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-[11px] font-bold text-orange-700 uppercase tracking-wider"
                >Unsaved Images ({{
                  editNewPreviews.length
                }})</span
              >
              <button
                :disabled="editImagesUploading"
                @click="uploadStagedImages"
                class="text-[11px] font-black text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg transition disabled:opacity-50"
              >
                Upload Images
              </button>
            </div>
            <div class="grid grid-cols-6 gap-2">
              <div
                v-for="(url, idx) in editNewPreviews"
                :key="idx"
                class="relative aspect-square rounded-lg overflow-hidden border border-orange-200/50 group/staged"
              >
                <img :src="url" class="w-full h-full object-cover" />
                <button
                  @click="removeStagedFile(idx)"
                  class="absolute top-1 right-1 w-5 h-5 bg-white/90 text-rose-600 rounded-full flex items-center justify-center hover:bg-(--color-surface) transition"
                >
                  <XMarkIcon class="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 border-t border-(--color-border) pt-4 mt-6"
        >
          <button
            type="button"
            @click="closeEditModal"
            class="px-5 py-2.5 rounded-xl border border-(--color-border) text-sm font-bold text-(--color-muted) hover:bg-(--color-surface-soft) transition"
          >
            Close Panel
          </button>
          <button
            @click="handleEditProperty"
            class="px-5 py-2.5 rounded-xl bg-(--color-primary) text-white text-sm font-bold hover:opacity-95 transition shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      :open="isDeleteModalOpen"
      title="Delete Property"
      @close="closeDeleteModal"
    >
      <div class="p-1 text-center">
        <div
          class="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4 animate-bounce"
        >
          <TrashIcon class="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 class="text-lg font-black text-(--color-text) tracking-tight">
          Delete Property??
        </h3>
        <p class="text-sm text-(--color-muted) mt-2 max-w-sm mx-auto font-medium">
          Are you sure you want to delete this property? This action is permanent and cannot be undone.
        </p>
        <div class="flex items-center justify-center gap-3 mt-8">
          <button
            @click="closeDeleteModal"
            class="px-5 py-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) text-sm font-bold text-(--color-muted) hover:bg-(--color-surface-soft) transition"
          >
            Cancel
          </button>
          <button
            @click="
              async () => {
                try {
                  await propertyStore.deleteProperty(deletingPropertyId);
                  toast.success('Asset successfully purged.');
                  closeDeleteModal();
                  await propertyStore.fetchMyProperties();
                } catch {
                  toast.danger('Destruction chain failed to resolve.');
                }
              }
            "
            class="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-100 transition duration-150"
          >
            Delete Property
          </button>
        </div>
      </div>
    </AppModal>
  </main>
</template>
