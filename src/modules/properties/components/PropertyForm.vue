<script setup>
import { ref, onMounted } from "vue";
import PropertyCard from "../components/PropertyCard.vue";

const loading = ref(true);
const properties = ref([]);

// Form Fields State matching the screenshot explicitly
const newProperty = ref({
  name: "",
  type: "Hotel",
  location: "Phnom Penh",
  address: "",
  startingPrice: 0,
  description: "",
  image: "", // Fallback handled on save
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  // Reset form fields back to default empty structures
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

const handleAddProperty = () => {
  if (!newProperty.value.name) {
    return;
  }

  // Push new property structure directly into listing array
  properties.value.push({
    id: Date.now(),
    name: newProperty.value.name,
    type: newProperty.value.type,
    location: newProperty.value.location,
    rooms: 0,
    bookings: 0,
    revenue: 0,
    status: "PENDING",
    // Use user image or assign a beautiful placeholder
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
  <main
    class="min-h-screen bg-slate-50/50 p-6 md:p-8 pt-10 transition-all duration-300 md:ml-64"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold text-[#0f2942] tracking-tight">
          My Properties
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Manage your listed properties and their approval status.
        </p>
      </div>

      <div
        class="flex items-center gap-2 self-stretch sm:self-auto justify-end"
      >
        <RouterLink
          to="/owner/amenities"
          class="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-sm transition-all"
        >
          Manage Amenities
        </RouterLink>

        <button
          @click="openModal"
          class="flex items-center gap-1 bg-[#1a73e8] hover:bg-blue-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm shadow-blue-600/10 transition-all cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke="currentColor"
            class="w-3.5 h-3.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Property
        </button>
      </div>
    </div>

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
        />
      </div>
    </section>

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
          ></div>

          <div
            class="relative bg-white w-full max-w-lg rounded-[22px] shadow-2xl overflow-hidden transform transition-all z-10"
          >
            <div
              class="bg-[#1062b3] px-6 py-4 flex items-center justify-between"
            >
              <h3 class="text-[16px] font-bold text-white tracking-wide">
                Add New Property
              </h3>
              <button
                @click="closeModal"
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

            <form
              @submit.prevent="handleAddProperty"
              class="p-6 space-y-4 text-[11px]"
            >
              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Property Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProperty.name"
                  type="text"
                  placeholder="e.g. Sunset Villa"
                  required
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                  >
                    Type <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <select
                      v-model="newProperty.type"
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
                      v-model="newProperty.location"
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

              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Address
                </label>
                <input
                  v-model="newProperty.address"
                  type="text"
                  placeholder="Street address"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <div class="w-1/2 pr-2">
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Starting Price / Night ($)
                </label>
                <input
                  v-model.number="newProperty.startingPrice"
                  type="number"
                  min="0"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition"
                />
              </div>

              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5"
                >
                  Description
                </label>
                <textarea
                  v-model="newProperty.description"
                  rows="3"
                  placeholder="Brief description for guests..."
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition resize-none placeholder-slate-300"
                ></textarea>
              </div>

              <div>
                <label
                  class="block font-bold text-[#475569] uppercase tracking-wide mb-1.5 text-[10px]"
                >
                  Thumbnail Image Link URL
                </label>
                <input
                  v-model="newProperty.image"
                  type="url"
                  placeholder="https://images.unsplash.com/your-photo-link"
                  class="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition placeholder-slate-300"
                />
              </div>

              <p class="text-[11px] text-[#1e3a8a]/70 font-medium pt-1">
                New properties require admin approval before they're visible to
                guests.
              </p>

              <div
                class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-5"
              >
                <button
                  type="button"
                  @click="closeModal"
                  class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-5 py-2 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="bg-[#0064d2] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition text-xs shadow-md shadow-blue-700/10 cursor-pointer"
                >
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
