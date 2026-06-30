<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import AppButton from "@/shared/components/AppButton.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import { useRoomStore } from "../store/roomStore";
import RoomCard from "../components/RoomCard.vue";
import RoomCardSkeleton from "../components/RoomCardSkeleton.vue";
import RoomFormModal from "../components/RoomFormModal.vue";
import RoomDeleteModal from "../components/RoomDeleteModal.vue";
import { useToastStore } from "@/shared/store/toastStore";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const toastStore = useToastStore();

const roomStore = useRoomStore();
const {
  loading,
  error,
  rawProperties,
  selectedPropertyId,
  propertyFilterTabs,
  filteredRooms,
} = storeToRefs(roomStore);
const {
  fetchRoomsData,
  getRoomMeta,
  setSelectedPropertyId,
  addRoom,
  updateRoom,
  deleteRoom,
} = roomStore;

const availableProperties = computed(() => rawProperties.value || []);
const currentPage = ref(1);
const perPage = 4;
const notice = ref("");
const addFormErrors = ref({});
const editFormErrors = ref({});
const searchQuery = ref("");

// Layer text search on top of the store's property-tab filtering, so both
// filters compose together instead of one overriding the other.
const searchedRooms = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return filteredRooms.value;

  return filteredRooms.value.filter((room) => {
    const haystack = [
      room.type,
      room.roomTypeName,
      room.propertyName,
      room.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRooms.value.length / perPage)),
);
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return sortedRooms.value.slice(start, start + perPage);
});

const sortBy = ref("default");
const sortOptions = [
  { value: "default", label: "Default order" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest first" },
  { value: "id_asc", label: "Room ID (ascending)" },
];

// Sort layers on top of the search results, so all three filters
// (property tab, search text, sort order) compose together.
const sortedRooms = computed(() => {
  const rooms = [...searchedRooms.value];

  switch (sortBy.value) {
    case "price_low":
      return rooms.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    case "price_high":
      return rooms.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    case "newest":
      // Higher ID generally means more recently created in this dataset.
      return rooms.sort((a, b) => (b.id || 0) - (a.id || 0));
    case "id_asc":
      return rooms.sort((a, b) => (a.id || 0) - (b.id || 0));
    default:
      return rooms;
  }
});

const clearSearch = () => {
  searchQuery.value = "";
};

const hasActiveFilters = computed(
  () =>
    selectedPropertyId.value !== "all" ||
    searchQuery.value.trim() !== "" ||
    sortBy.value !== "default",
);

const resetFilters = () => {
  setSelectedPropertyId("all");
  searchQuery.value = "";
  sortBy.value = "default";
};

watch(selectedPropertyId, () => {
  currentPage.value = 1;
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(sortBy, () => {
  currentPage.value = 1;
});

watch(sortedRooms, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const setNotice = (message) => {
  notice.value = message;
};

const clearNotice = () => {
  notice.value = "";
};

const emptyRoom = () => ({
  propertyId: availableProperties.value[0]?.id || "",
  type: "",
  roomName: "",
  guests: 2,
  description: "",
  basePrice: 0,
  inventory: 1,
  floorNumber: null,
  imageFile: [],
});

// Floor number bounds. Bump FLOOR_MIN to -5 (or wherever) if you need to
// support basement levels like B1, B2.
const FLOOR_MIN = 0;
const FLOOR_MAX = 200;

/**
 * Floor number is optional by default (defaults to 1 on save — see
 * normalizeFloorNumber). Pass { required: true } when the property is
 * already known to span multiple floors, so owners can't accidentally
 * leave a 2nd/3rd-floor room defaulting to 1.
 */
const validateFloorNumber = (value, { required = false } = {}) => {
  const isEmpty = value === null || value === undefined || value === "";

  if (isEmpty) {
    return required
      ? "This property already has rooms on different floors — please set the floor for this room."
      : null;
  }

  const num = Number(value);
  if (Number.isNaN(num)) return "Floor number must be a number.";
  if (!Number.isInteger(num))
    return "Floor number must be a whole number (no decimals).";
  if (num < FLOOR_MIN) return `Floor number can't be less than ${FLOOR_MIN}.`;
  if (num > FLOOR_MAX) return `Floor number seems too high — double check it.`;

  return null;
};

/**
 * Looks at rooms already saved for this property. If they span more than
 * one distinct floor, we know it's a multi-floor building — so floor
 * number should be required going forward instead of silently defaulted.
 */
const isKnownMultiFloorProperty = (propertyId) => {
  const knownFloors = new Set(
    roomStore.rooms
      .filter((r) => r.property_id === propertyId)
      .map((r) => r.floor_number)
      .filter((f) => f !== null && f !== undefined && f !== ""),
  );
  return knownFloors.size > 1;
};

// Most properties on this platform (homestays, single-story houses) only
// have one floor, and there's no total_floors field on the property to
// check against. So instead of forcing the owner to type something, an
// empty floor number just defaults to 1. Owners with multi-floor buildings
// can still override it with the real floor number.
const normalizeFloorNumber = (value) => {
  if (value === null || value === undefined || value === "") return 1;
  return Number(value);
};

const isAddRoomModalOpen = ref(false);
const isEditRoomModalOpen = ref(false);
const isDeleteRoomModalOpen = ref(false);
const editingRoomId = ref(null);
const deletingRoom = ref(null);
const addRoomForm = ref(emptyRoom());
const editRoomForm = ref(emptyRoom());

const openAddRoomModal = () => {
  addRoomForm.value = emptyRoom();
  addFormErrors.value = {};
  isAddRoomModalOpen.value = true;
};

const closeAddRoomModal = () => {
  isAddRoomModalOpen.value = false;
};

const openEditRoomModal = (room) => {
  editingRoomId.value = room.id;
  editRoomForm.value = {
    propertyId: room.property_id, // ✅ use property_id
    type: room.room_type_id, // ✅ use room_type_id for dropdown
    roomName: room.room_name || room.type, // ✅ room name
    guests: room.max_guests || room.guests,
    description: room.description || "",
    basePrice: room.price_per_night || room.basePrice,
    inventory: room.total_rooms || room.inventory,
    floorNumber: room.floor_number ?? null,
    image: room.image || "",
    existingImages: [], // populated below with {id, url, isCover}
  };
  const existingImages = roomStore.roomImages[room.id] || [];
  // Keep the image id alongside the URL so removal can actually call the
  // delete API later (previously this only stored a URL string, which made
  // it impossible to know which image to delete on the backend).
  editRoomForm.value.existingImages = existingImages.map((img) => ({
    id: img.id,
    url: roomStore.getFullImageUrl(img.image_url),
    isCover: img.is_cover === 1,
  }));

  editFormErrors.value = {};
  isEditRoomModalOpen.value = true;
};

const closeEditRoomModal = () => {
  isEditRoomModalOpen.value = false;
  editingRoomId.value = null;
};

const openDeleteRoomModal = (room) => {
  deletingRoom.value = room;
  isDeleteRoomModalOpen.value = true;
};

const closeDeleteRoomModal = () => {
  isDeleteRoomModalOpen.value = false;
  deletingRoom.value = null;
};
const handleAddRoom = async (formData) => {
  addRoomForm.value = { ...addRoomForm.value, ...formData };
  console.log("formData received:", formData); // 👈 add this
  console.log("imageFiles in formData:", formData?.imageFiles); // 👈 add this
  addRoomForm.value = { ...addRoomForm.value, ...formData };
  console.log("addRoomForm after merge:", addRoomForm.value); // 👈 add this
  const selectedProperty = availableProperties.value.find(
    (p) => p.id === addRoomForm.value.propertyId,
  );

  const errors = {};
  if (!addRoomForm.value.propertyId)
    errors.propertyId = "Please choose a property.";
  if (!addRoomForm.value.type) errors.type = "Room type is required.";
  if (!addRoomForm.value.roomName?.trim())
    errors.roomName = "Room name is required.";
  if (!addRoomForm.value.basePrice || addRoomForm.value.basePrice <= 0)
    errors.basePrice = "Price is required.";

  const floorRequired = isKnownMultiFloorProperty(selectedProperty?.id);
  const floorError = validateFloorNumber(addRoomForm.value.floorNumber, {
    required: floorRequired,
  });
  if (floorError) errors.floorNumber = floorError;

  addFormErrors.value = errors;
  if (Object.keys(errors).length > 0 || !selectedProperty) return;

  try {
    console.log("🚀 Creating room for property ID:", selectedProperty.id);

    const response = await addRoom(selectedProperty.id, {
      room_type_id: Number(addRoomForm.value.type),
      room_name: addRoomForm.value.roomName.trim(),
      description: addRoomForm.value.description?.trim() || "",
      price_per_night: Number(addRoomForm.value.basePrice),
      max_guests: Number(addRoomForm.value.guests) || 2,
      total_rooms: Number(addRoomForm.value.inventory) || 1,
      floor_number: normalizeFloorNumber(addRoomForm.value.floorNumber),
      imageFiles: addRoomForm.value.imageFiles,
    });

    const newRoom = response?.data || response;

    closeAddRoomModal();
    toastStore.success("Room added successfully.");
    await fetchRoomsData();
  } catch (err) {
    console.error("❌ Create room failed:", err.response?.data || err);
  }
};
// Helper function
const uploadRoomImage = async (propertyId, roomId, file) => {
  const formData = new FormData();
  formData.append("images", file); // Try "images" first

  try {
    await roomStore.uploadRoomImages(propertyId, roomId, formData);
  } catch (uploadErr) {
    console.warn("Room created but image upload failed:", uploadErr);
  }
};
const handleEditRoom = async (formData) => {
  editFormErrors.value = {};

  const errors = {};
  if (!formData.propertyId) errors.propertyId = "Please choose a property.";
  if (!formData.type) errors.type = "Room type is required.";

  const floorRequired = isKnownMultiFloorProperty(formData.propertyId);
  const floorError = validateFloorNumber(formData.floorNumber, {
    required: floorRequired,
  });
  if (floorError) errors.floorNumber = floorError;
  editFormErrors.value = errors;
  if (Object.keys(errors).length > 0 || !editingRoomId.value) return;

  try {
    await updateRoom(formData.propertyId, editingRoomId.value, {
      room_type_id: Number(formData.type),
      room_name: formData.roomName,
      description: formData.description,
      price_per_night: Number(formData.basePrice),
      max_guests: Number(formData.guests),
      total_rooms: Number(formData.inventory),
      floor_number: normalizeFloorNumber(formData.floorNumber),
    });

    // Delete any existing images the owner removed in the modal.
    // This was previously missing entirely — removing an image in the UI
    // never reached the backend, so deleted photos silently reappeared
    // on reload.
    if (formData.removedImageIds?.length) {
      for (const imageId of formData.removedImageIds) {
        try {
          await roomStore.deleteRoomImage(editingRoomId.value, imageId);
        } catch (delErr) {
          console.error(`Failed to delete image ${imageId}:`, delErr);
          toastStore.danger(
            "Some images could not be removed. Please try again.",
          );
        }
      }
    }

    // Upload new images if any
    if (formData.imageFiles?.length) {
      const fd = new FormData();
      formData.imageFiles.forEach((file) => fd.append("images", file));
      try {
        await roomStore.uploadRoomImages(editingRoomId.value, fd);
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        toastStore.danger("Room updated, but new images failed to upload.");
      }
    }

    closeEditRoomModal();
    toastStore.success("Room updated successfully.");
    await fetchRoomsData();
  } catch {
    // error handled in store
  }
};

const handleDeleteRoom = async () => {
  if (!deletingRoom.value) return;
  try {
    await deleteRoom(deletingRoom.value.property_id, deletingRoom.value.id);
    closeDeleteRoomModal();
    toastStore.success("Room deleted successfully.");
  } catch {
    toastStore.danger("Failed to delete room. Please try again.");
  }
};

const route = useRoute();

onMounted(async () => {
  if (route.query.propertyId) {
    setSelectedPropertyId(route.query.propertyId);
  }
  await fetchRoomsData();
});
</script>

<template>
  <div
    class="my-25 space-y-6 min-h-screen text-(--color-text) transition-colors duration-300 owner-dashboard ml-64 p-6"
  >
    <header
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Rooms</h1>
        <p class="text-sm text-(--color-muted) mt-1">
          Manage rooms across all your properties.
        </p>
      </div>
      <AppButton
        class="inline-flex items-center gap-2"
        @click="openAddRoomModal"
      >
        <PlusIcon class="h-4 w-4" aria-hidden="true" />
        <span>Add Room</span>
      </AppButton>
    </header>

    <nav class="flex flex-wrap gap-3 py-2">
      <button
        v-for="tab in propertyFilterTabs"
        :key="tab.id"
        @click="setSelectedPropertyId(tab.id)"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2.5',
          selectedPropertyId === tab.id
            ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
            : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
        ]"
      >
        {{ tab.name }}
        <span
          :class="[
            'text-xs px-1.5 py-0.5 rounded-full font-bold',
            selectedPropertyId === tab.id
              ? 'bg-(--color-primary) text-white'
              : 'bg-(--color-surface-soft) text-(--color-muted)',
          ]"
        >
          {{ tab.roomCount }}
        </span>
      </button>
    </nav>

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative max-w-sm w-full">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-muted) pointer-events-none"
          aria-hidden="true"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by room name, type, or property..."
          class="w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-9 pr-9 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-muted) outline-none focus:border-(--color-primary) transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="clearSearch"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-(--color-muted) hover:text-(--color-text) hover:bg-(--color-surface-soft) transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <select
        v-model="sortBy"
        class="rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:border-(--color-primary) transition-colors sm:w-56"
      >
        <option
          v-for="option in sortOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <button
        v-if="hasActiveFilters"
        type="button"
        @click="resetFilters"
        class="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-(--color-muted) hover:text-(--color-text) rounded-xl border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-soft) transition-colors whitespace-nowrap"
      >
        <XMarkIcon class="h-3.5 w-3.5" aria-hidden="true" />
        Reset filters
      </button>
    </div>

    <main class="relative min-h-100">
      <div
        v-if="notice"
        class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500"
      >
        <span>{{ notice }}</span>
        <button
          type="button"
          class="text-xs font-semibold uppercase tracking-wide"
          @click="clearNotice"
        >
          Dismiss
        </button>
      </div>

      <div
        v-if="error"
        class="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
      >
        {{ error }}
      </div>

      <div v-if="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RoomCardSkeleton v-for="n in perPage" :key="n" />
      </div>

      <EmptyState
        v-else-if="sortedRooms.length === 0"
        :title="searchQuery ? 'No rooms found' : 'No Rooms Found'"
        :message="
          searchQuery
            ? 'Try a different search term or clear the filter.'
            : 'No rooms have been added yet. Click Add Room to get started.'
        "
      >
        <template #action>
          <AppButton @click="openAddRoomModal">
            <PlusIcon class="h-4 w-4" />
            Add Room
          </AppButton>
        </template>
      </EmptyState>

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RoomCard
          v-for="(room, index) in paginatedRooms"
          :key="room.id"
          :room="room"
          :status="getRoomMeta(room, (currentPage - 1) * perPage + index)"
          @edit="openEditRoomModal"
          @delete="openDeleteRoomModal"
        />
      </div>

      <div
        v-if="!loading && sortedRooms.length > perPage"
        class="mt-8 flex items-center justify-center gap-2"
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
          class="h-9 w-9 rounded-lg border text-sm font-semibold transition"
          :class="
            currentPage === page
              ? 'bg-(--color-primary) border-(--color-primary) text-white'
              : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:bg-(--color-surface-soft)'
          "
          @click="currentPage = page"
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
    </main>

    <RoomFormModal
      :open="isAddRoomModalOpen"
      title="Add Room"
      :model-value="addRoomForm"
      :properties="availableProperties"
      :errors="addFormErrors"
      submit-label="Save Room"
      @close="closeAddRoomModal"
      @submit="(data) => handleAddRoom(data)"
    />

    <RoomFormModal
      :open="isEditRoomModalOpen"
      title="Edit Room"
      :model-value="editRoomForm"
      :properties="availableProperties"
      :errors="editFormErrors"
      submit-label="Save Changes"
      @close="closeEditRoomModal"
      @submit="(data) => handleEditRoom(data)"
    />

    <RoomDeleteModal
      :open="isDeleteRoomModalOpen"
      :room="deletingRoom"
      @close="closeDeleteRoomModal"
      @confirm="handleDeleteRoom"
    />
  </div>
</template>
