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

const currentPage = ref(1);
const perPage = 4;

const { isSidebarOpen } = useSidebar();

const loading = ref(true);
const properties = ref([]);

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
const newProperty = ref({
  name: "",
  type: "Hotel",
  location: "Phnom Penh",
  address: "",
  startingPrice: 0,
  description: "",
  image: "",
});

const resetForm = () => {
  newProperty.value = {
    name: "",
    type: "Hotel",
    location: "Phnom Penh",
    address: "",
    startingPrice: 0,
    description: "",
    image: "",
  };
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
  resetForm();
};

const handleAddProperty = () => {
  if (!newProperty.value.name) return;
  properties.value.push({
    id: Date.now(),
    name: newProperty.value.name,
    type: newProperty.value.type,
    location: newProperty.value.location,
    rooms: 0,
    bookings: 0,
    revenue: 0,
    status: "PENDING",
    image:
      newProperty.value.image ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  });
  currentPage.value = totalPages.value;
  closeAddModal();
};

// --- Edit Modal ---
const isEditModalOpen = ref(false);
const editingProperty = ref(null);

const openEditModal = (property) => {
  editingProperty.value = { ...property };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingProperty.value = null;
};

const handleEditProperty = () => {
  if (!editingProperty.value.name) return;
  const index = properties.value.findIndex(
    (p) => p.id === editingProperty.value.id,
  );
  if (index !== -1) {
    properties.value[index] = { ...editingProperty.value };
  }
  closeEditModal();
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

const confirmDelete = () => {
  properties.value = properties.value.filter(
    (p) => p.id !== deletingPropertyId.value,
  );
  currentPage.value = Math.min(currentPage.value, Math.max(totalPages.value, 1));
  closeDeleteModal();
};

// --- Fetch ---
const fetchPropertiesList = async () => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // temporary delay to see skeleton - remove later

    properties.value = data.properties || [];
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
      title="Add New Property"
      @close="closeAddModal"
    >
      <form
        id="add-property-form"
        class="space-y-4"
        @submit.prevent="handleAddProperty"
      >
        <AppInput
          v-model="newProperty.name"
          label="Property Name *"
          placeholder="e.g. Sunset Villa"
          required
        />
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

        <AppInput
          v-model="newProperty.address"
          label="Address"
          placeholder="Street address"
        />
        <AppInput
          v-model.number="newProperty.startingPrice"
          label="Starting Price / Night ($)"
          type="number"
        />
        <AppInput
          v-model="newProperty.description"
          label="Description"
          placeholder="Brief description for guests..."
        />
        <AppInput
          v-model="newProperty.image"
          label="Thumbnail Image URL"
          type="url"
          placeholder="https://images.unsplash.com/..."
        />
        <p class="text-xs text-(--color-muted)">
          New properties require admin approval before they're visible to
          guests.
        </p>
      </form>

      <template #footer>
        <AppButton variant="secondary" type="button" @click="closeAddModal"
          >Cancel</AppButton
        >
        <AppButton type="submit" form="add-property-form"
          >Add Property</AppButton
        >
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
          required
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
          v-model.number="editingProperty.startingPrice"
          label="Starting Price / Night ($)"
          type="number"
        />
        <AppInput
          v-model="editingProperty.description"
          label="Description"
          placeholder="Brief description for guests..."
        />
        <AppInput
          v-model="editingProperty.image"
          label="Thumbnail Image URL"
          type="url"
          placeholder="https://images.unsplash.com/..."
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
