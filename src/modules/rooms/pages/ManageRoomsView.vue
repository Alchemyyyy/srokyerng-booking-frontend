<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import AppButton from "@/shared/components/AppButton.vue";
import { useRoomStore } from "../store/roomStore";
import RoomCard from "../components/RoomCard.vue";
import RoomCardSkeleton from "../components/RoomCardSkeleton.vue";
import RoomFormModal from "../components/RoomFormModal.vue";
import RoomDeleteModal from "../components/RoomDeleteModal.vue";

import { PlusIcon } from "@heroicons/vue/24/outline";

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
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRooms.value.length / perPage)),
);
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredRooms.value.slice(start, start + perPage);
});

watch(selectedPropertyId, () => {
  currentPage.value = 1;
});

watch(filteredRooms, () => {
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
  guests: 2,
  size: "",
  bedType: "",
  description: "",
  basePrice: 0,
  inventory: 1,
  available: 1,
  image: "",
});

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
    propertyId: room.propertyId,
    type: room.type,
    guests: room.guests,
    size: room.size,
    bedType: room.bedType,
    description: room.description,
    basePrice: room.basePrice,
    inventory: room.inventory,
    available: room.available,
    image: room.image || "",
  };
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

const handleAddRoom = () => {
  addFormErrors.value = {};
  const selectedProperty = availableProperties.value.find(
    (property) => property.id === addRoomForm.value.propertyId,
  );

  const errors = {};
  if (!addRoomForm.value.propertyId)
    errors.propertyId = "Please choose a property.";
  if (!addRoomForm.value.type) errors.type = "Room type is required.";
  if (!addRoomForm.value.size) errors.size = "Size is required.";
  addFormErrors.value = errors;

  if (Object.keys(errors).length > 0 || !selectedProperty) return;

  addRoom({
    id: `room-${Date.now()}`,
    propertyId: selectedProperty.id,
    propertyName: selectedProperty.name,
    type: addRoomForm.value.type,
    guests: Number(addRoomForm.value.guests) || 0,
    size: addRoomForm.value.size,
    bedType: addRoomForm.value.bedType,
    description: addRoomForm.value.description,
    basePrice: Number(addRoomForm.value.basePrice) || 0,
    inventory: Number(addRoomForm.value.inventory) || 1,
    available: Number(addRoomForm.value.available) || 1,
    status: "Pending",
    image:
      addRoomForm.value.image ||
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
    amenities: [],
  });

  closeAddRoomModal();
  setNotice("Room added successfully.");
};

const handleEditRoom = () => {
  editFormErrors.value = {};
  const selectedProperty = availableProperties.value.find(
    (property) => property.id === editRoomForm.value.propertyId,
  );

  const errors = {};
  if (!editRoomForm.value.propertyId)
    errors.propertyId = "Please choose a property.";
  if (!editRoomForm.value.type) errors.type = "Room type is required.";
  if (!editRoomForm.value.size) errors.size = "Size is required.";
  editFormErrors.value = errors;

  if (
    Object.keys(errors).length > 0 ||
    !selectedProperty ||
    !editingRoomId.value
  )
    return;

  updateRoom(editingRoomId.value, {
    propertyId: selectedProperty.id,
    propertyName: selectedProperty.name,
    type: editRoomForm.value.type,
    guests: Number(editRoomForm.value.guests) || 0,
    size: editRoomForm.value.size,
    bedType: editRoomForm.value.bedType,
    description: editRoomForm.value.description,
    basePrice: Number(editRoomForm.value.basePrice) || 0,
    inventory: Number(editRoomForm.value.inventory) || 1,
    available: Number(editRoomForm.value.available) || 1,
    image:
      editRoomForm.value.image ||
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
  });

  closeEditRoomModal();
  setNotice("Room updated successfully.");
};

const handleDeleteRoom = () => {
  if (!deletingRoom.value) return;
  deleteRoom(deletingRoom.value.id);
  closeDeleteRoomModal();
  setNotice("Room deleted successfully.");
};

onMounted(fetchRoomsData);
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
      <AppButton
        v-for="tab in propertyFilterTabs"
        :key="tab.id"
        @click="setSelectedPropertyId(tab.id)"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2.5',
          selectedPropertyId === tab.id
            ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
            : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
        ]"
        variant=""
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
      </AppButton>
    </nav>

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

      <div
        v-else-if="filteredRooms.length === 0"
        class="text-center py-20 border border-dashed border-(--color-border) rounded-xl"
      >
        <p class="text-sm text-(--color-muted)">
          No active room templates mapped to this specific asset filter.
        </p>
      </div>

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
        v-if="!loading && filteredRooms.length > perPage"
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
      @submit="handleAddRoom"
    />

    <RoomFormModal
      :open="isEditRoomModalOpen"
      title="Edit Room"
      :model-value="editRoomForm"
      :properties="availableProperties"
      :errors="editFormErrors"
      submit-label="Save Changes"
      @close="closeEditRoomModal"
      @submit="handleEditRoom"
    />

    <RoomDeleteModal
      :open="isDeleteRoomModalOpen"
      :room="deletingRoom"
      @close="closeDeleteRoomModal"
      @confirm="handleDeleteRoom"
    />
  </div>
</template>
