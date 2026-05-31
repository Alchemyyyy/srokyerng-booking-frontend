<script setup>
import { ref, onMounted } from "vue";
import PropertyCard from "../components/PropertyCard.vue";

const loading = ref(true);
const properties = ref([]);


const isEditModalOpen = ref(false);
const editingProperty = ref(null);

// show delete popup
const showDeleteConfirm = ref(false);
const deletingPropertyId = ref(null);

const openDeleteConfirm = (id) => {
  deletingPropertyId.value = id;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  deletingPropertyId.value = null;
};

const confirmDelete = () => {
  properties.value = properties.value.filter(
    (p) => p.id !== deletingPropertyId.value,
  );
  closeDeleteConfirm();
};

// Modal Visibility State
const isModalOpen = ref(false);

const openEditModal = (property) => {
  editingProperty.value = { ...property };
  isEditModalOpen.value = true;
};

//close edit modal
const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingProperty.value = null;
};

const handleDeleteProperty = (id) => {
  properties.value = properties.value.filter((p) => p.id !== id);
};

const handleEditProperty = () => {
  const index = properties.value.findIndex(
    (p) => p.id === editingProperty.value.id,
  );
  if (index !== -1) {
    properties.value[index] = { ...editingProperty.value };
  }
  closeEditModal();
};

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

const closeModal = () => {
  isModalOpen.value = false;
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

  closeModal();
};

const fetchPropertiesList = async () => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    properties.value = data.properties || [];
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
  <main class="mt-25 ml-64">
    <!-- Page Header -->
    <header class="mb-5">
      <h1 class="text-3xl font-semibold text-(--color-text)">
        My Properties
        <span class="text-(--color-muted)">({{ properties.length }})</span>
      </h1>
      <p class="mt-2 text-(--color-muted)">
        Manage your property listings here.
      </p>
    </header>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-3 mb-5">
      <RouterLink
        to="/owner/amenities"
        class="flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors"
        style="
          background: var(--color-primary-soft);
          border-color: var(--color-border);
          color: var(--color-primary);
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Manage Amenities
      </RouterLink>

      <button
        @click="isModalOpen = true"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
        style="
          background: var(--color-primary);
          color: var(--color-text-inverse);
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add New Property
      </button>
    </div>

    <!-- Properties List -->
    <section class="mt-6">
      <div
        v-if="loading"
        class="text-center py-16 text-xs text-slate-400 font-medium"
      >
        Loading properties database...
      </div>

      <div
        v-else-if="properties.length === 0"
        class="bg-white rounded-2xl border border-dashed border-slate-200/80 p-16 text-center text-xs text-slate-400 font-medium"
      >
        No properties found. Please add a property to get started.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
      >
        <PropertyCard
          v-for="property in properties"
          :key="property.id"
          :property="property"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />
      </div>
    </section>


    <!-- Add Property Modal -->
<Teleport to="body">
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        @click="closeModal"
      />
      <div class="relative bg-white w-full max-w-lg rounded-[22px] shadow-2xl overflow-hidden z-10">
        <!-- Header -->
        <div class="bg-[#1062b3] px-6 py-4 flex items-center justify-between">
          <h3 class="text-[16px] font-bold text-white tracking-wide">Add New Property</h3>
          <button @click="closeModal" class="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Form -->
        <form @submit.prevent="handleAddProperty" class="p-6 space-y-4 text-[11px]">
          <div>
            <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">
              Property Name <span class="text-red-500">*</span>
            </label>
            <input v-model="newProperty.name" type="text" placeholder="e.g. Sunset Villa" required
              class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">Type <span class="text-red-500">*</span></label>
              <div class="relative">
                <select v-model="newProperty.type" class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none bg-white appearance-none transition">
                  <option>Hotel</option>
                  <option>Villa</option>
                  <option>Apartment</option>
                  <option>Homestay</option>
                </select>
                <span class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[9px]">▼</span>
              </div>
            </div>
            <div>
              <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">Location <span class="text-red-500">*</span></label>
              <div class="relative">
                <select v-model="newProperty.location" class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none bg-white appearance-none transition">
                  <option>Phnom Penh</option>
                  <option>Siem Reap</option>
                  <option>Kampot</option>
                  <option>Sihanoukville</option>
                  <option>Battambang</option>
                  <option>Koh Rong</option>
                </select>
                <span class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[9px]">▼</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">Address</label>
            <input v-model="newProperty.address" type="text" placeholder="Street address"
              class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300" />
          </div>

          <div class="w-1/2 pr-2">
            <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">Starting Price / Night ($)</label>
            <input v-model.number="newProperty.startingPrice" type="number" min="0"
              class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition" />
          </div>

          <div>
            <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5">Description</label>
            <textarea v-model="newProperty.description" rows="3" placeholder="Brief description for guests..."
              class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition resize-none placeholder-slate-300" />
          </div>

          <div>
            <label class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5 text-[10px]">Thumbnail Image Link URL</label>
            <input v-model="newProperty.image" type="url" placeholder="https://images.unsplash.com/your-photo-link"
              class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300" />
          </div>

          <p class="text-[11px] text-[#1e3a8a]/70 font-medium pt-1">
            New properties require admin approval before they're visible to guests.
          </p>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
            <button type="button" @click="closeModal"
              class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-5 py-2 rounded-xl transition text-xs cursor-pointer">
              Cancel
            </button>
            <button type="submit"
              class="bg-[#0064d2] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition text-xs shadow-md shadow-blue-700/10 cursor-pointer">
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</Teleport>
    <!-- Edit Property Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isEditModalOpen && editingProperty"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            @click="closeEditModal"
          />

          <div
            class="relative bg-white w-full max-w-lg rounded-[22px] shadow-2xl overflow-hidden z-10"
          >
            <!-- Header -->
            <div
              class="bg-[#1062b3] px-6 py-4 flex items-center justify-between"
            >
              <h3 class="text-[16px] font-bold text-white tracking-wide">
                Edit Property
              </h3>
              <button
                @click="closeEditModal"
                class="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form
              @submit.prevent="handleEditProperty"
              class="p-6 space-y-4 text-[11px]"
            >
              <!-- Property Name -->
              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Property Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editingProperty.name"
                  type="text"
                  required
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <!-- Type & Location -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                  >
                    Type <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <select
                      v-model="editingProperty.type"
                      class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none bg-white appearance-none transition"
                    >
                      <option>Hotel</option>
                      <option>Villa</option>
                      <option>Apartment</option>
                      <option>Homestay</option>
                    </select>
                    <span
                      class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[9px]"
                      >▼</span
                    >
                  </div>
                </div>
                <div>
                  <label
                    class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                  >
                    Location <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <select
                      v-model="editingProperty.location"
                      class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none bg-white appearance-none transition"
                    >
                      <option>Phnom Penh</option>
                      <option>Siem Reap</option>
                      <option>Kampot</option>
                      <option>Sihanoukville</option>
                      <option>Battambang</option>
                      <option>Koh Rong</option>
                    </select>
                    <span
                      class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[9px]"
                      >▼</span
                    >
                  </div>
                </div>
              </div>

              <!-- Address -->
              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Address
                </label>
                <input
                  v-model="editingProperty.address"
                  type="text"
                  placeholder="Street address"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <!-- Starting Price -->
              <div class="w-1/2 pr-2">
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Starting Price / Night ($)
                </label>
                <input
                  v-model.number="editingProperty.startingPrice"
                  type="number"
                  min="0"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition"
                />
              </div>

              <!-- Description -->
              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Description
                </label>
                <textarea
                  v-model="editingProperty.description"
                  rows="3"
                  placeholder="Brief description for guests..."
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition resize-none placeholder-slate-300"
                />
              </div>

              <!-- Image URL -->
              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5 text-[10px]"
                >
                  Thumbnail Image Link URL
                </label>
                <input
                  v-model="editingProperty.image"
                  type="url"
                  placeholder="https://images.unsplash.com/your-photo-link"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <!-- Footer Buttons -->
              <div
                class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5"
              >
                <button
                  type="button"
                  @click="closeEditModal"
                  class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-5 py-2 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="bg-[#0064d2] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition text-xs shadow-md shadow-blue-700/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- delete modal -->
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            @click="closeDeleteConfirm"
          />

          <div
            class="relative bg-white w-full max-w-sm rounded-[22px] shadow-2xl overflow-hidden z-10"
          >
            <!-- Header -->
            <div class="bg-red-500 px-6 py-4 flex items-center justify-between">
              <h3 class="text-[16px] font-bold text-white tracking-wide">
                Delete Property
              </h3>
              <button
                @click="closeDeleteConfirm"
                class="text-white/80 hover:text-white transition p-1.5 hover:bg-white/10 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 text-center">
              <div
                class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-7 h-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-[#0f2942] mb-1">
                Are you sure?
              </h4>
              <p class="text-xs text-slate-400">
                This property will be permanently deleted and cannot be
                recovered.
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex items-center gap-3 px-6 pb-6">
              <button
                @click="closeDeleteConfirm"
                class="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-5 py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl transition text-xs shadow-md shadow-red-500/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
