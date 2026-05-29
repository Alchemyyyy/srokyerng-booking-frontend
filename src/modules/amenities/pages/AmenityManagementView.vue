<template>
  <div class="amenity-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-inner">
        <!-- LEFT -->
        <div class="header-left">
          <div class="breadcrumb">
            <span class="bc-link" @click="$router.push('/owner')"
              >← Dashboard</span
            >
            <span class="separator">›</span>
            <span>Amenities</span>
          </div>
          <h1 class="page-title">Amenities</h1>
          <p class="page-subtitle">
            Browse all available amenities and manage them for your properties
          </p>
        </div>

        <!-- RIGHT -->
        <div class="header-actions">
          <button
            class="header-btn"
            :class="{ active: viewMode === 'catalogue' }"
            @click="viewMode = 'catalogue'"
          >
            Catalogue
          </button>
          <button
            class="header-btn"
            :class="{ active: viewMode === 'myprops' }"
            @click="viewMode = 'myprops'"
          >
            My Properties
          </button>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="page-body">
      <!-- ERROR -->
      <div v-if="error" class="error-banner">{{ error }}</div>

      <!-- CATALOGUE -->
      <template v-if="viewMode === 'catalogue'">
        <div v-if="loading">Loading amenities...</div>
        <template v-else>
          <AmenitySelector :amenities="amenities" v-model="selectedAmenities" />
        </template>
      </template>

      <!-- MY PROPERTIES -->
      <template v-else>
        <div class="myprops-topbar">
          <p class="myprops-subtitle">
            Select a property to view and edit its amenities.
          </p>
          <button class="btn-all-props">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            All Properties
          </button>
        </div>

        <div v-if="loadingProperties" class="loading-text">
          Loading properties...
        </div>

        <div v-else-if="myProperties.length === 0" class="empty-state">
          <div class="empty-icon">🏠</div>
          <h3>No properties yet</h3>
          <p>Add your first property</p>
          <button
            class="btn-primary"
            @click="$router.push('/owner/properties/create')"
          >
            Add Property
          </button>
        </div>

        <div v-else class="property-list">
          <div
            v-for="property in myProperties"
            :key="property.id"
            class="property-card"
          >
            <!-- TOP ROW -->
            <div class="property-top">
              <!-- Image with upload overlay -->
              <div
                class="property-img-wrap"
                @click="triggerImageUpload(property.id)"
              >
                <img
                  v-if="property.image"
                  :src="property.image"
                  class="property-image"
                />
                <div
                  v-else
                  class="property-placeholder"
                  :style="{
                    background: getPropertyColorScheme(property.id).bg,
                    color: getPropertyColorScheme(property.id).text,
                  }"
                >
                  {{ getPropertyInitials(property.name) }}
                </div>
                <div class="img-upload-overlay">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2.2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <input
                  :ref="
                    (el) => {
                      if (el) imageInputRefs[property.id] = el;
                    }
                  "
                  type="file"
                  accept="image/*"
                  class="hidden-input"
                  @change="onImageSelected($event, property)"
                />
              </div>

              <div class="property-info">
                <h3 class="prop-name">{{ property.name }}</h3>
                <p class="prop-meta">
                  {{ property.type }} · {{ property.location }}
                </p>
                <p class="prop-count">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="2.5"
                    style="
                      display: inline;
                      vertical-align: -2px;
                      margin-right: 4px;
                    "
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  {{ property.amenities.length }} amenities assigned
                </p>
              </div>

              <button class="btn-edit" @click="openEditModal(property)">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
                Edit Amenities
              </button>
            </div>

            <!-- CHIPS ROW -->
            <div class="chips-row">
              <span
                v-for="amenity in property.amenities.slice(0, 7)"
                :key="amenity.id"
                class="chip"
                :style="chipStyle(amenity.amenity_name)"
              >
                <span
                  class="chip-svg"
                  v-html="getChipSvg(amenity.amenity_name)"
                ></span>
                {{ amenity.amenity_name }}
              </span>

              <button class="chip chip-add" @click="openEditModal(property)">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add More
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- SAVE BAR -->
    <transition name="slide-up">
      <div v-if="isDirty && viewMode === 'catalogue'" class="save-bar">
        <div>{{ selectedAmenities.length }} amenities selected</div>
        <div class="save-actions">
          <button class="btn-secondary" @click="discardChanges">Discard</button>
          <button class="btn-primary" :disabled="saving" @click="saveAmenities">
            <span v-if="saving">Saving...</span>
            <span v-else-if="saveSuccess">✓ Saved</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- MODAL -->
    <transition name="fade">
      <div
        v-if="editModal.open"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal">
          <div class="modal-header">
            <div>
              <h2>Edit Amenities</h2>
              <p>{{ editModal.property?.name }}</p>
            </div>
            <button class="close-btn" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <AmenitySelector
              :amenities="amenities"
              v-model="editModal.selected"
            />
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeEditModal">
              Cancel
            </button>
            <button
              class="btn-primary"
              :disabled="editModal.saving"
              @click="saveModalAmenities"
            >
              <span v-if="editModal.saving">Saving...</span>
              <span v-else-if="editModal.saveSuccess">✓ Saved</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import AmenitySelector from "../components/AmenitySelector.vue";
import {
  getAllAmenities,
  getPropertyAmenities,
  updatePropertyAmenities,
} from "../services/amenityService";
import { getOwnerProperties } from "../../properties/services/propertyService";

const route = useRoute();
const router = useRouter();
const propertyId = computed(() => route.params.id);

const amenities = ref([]);
const selectedAmenities = ref([]);
const originalSelected = ref([]);
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const saveSuccess = ref(false);
const viewMode = ref("catalogue");
const myProperties = ref([]);
const loadingProperties = ref(false);

const editModal = ref({
  open: false,
  property: null,
  selected: [],
  original: [],
  saving: false,
  saveSuccess: false,
});

const isDirty = computed(() => {
  return (
    [...selectedAmenities.value].sort().join(",") !==
    [...originalSelected.value].sort().join(",")
  );
});

// ─── Property helpers ───────────────────────────────────
const propertyColors = [
  { bg: "#dbeafe", text: "#1d4ed8" }, // blue
  { bg: "#dcfce7", text: "#15803d" }, // green
  { bg: "#ffedd5", text: "#c2410c" }, // orange
  { bg: "#f3e8ff", text: "#7e22ce" }, // purple
  { bg: "#fee2e2", text: "#b91c1c" }, // red
  { bg: "#cffafe", text: "#0e7490" }, // cyan
  { bg: "#fef9c3", text: "#a16207" }, // yellow
  { bg: "#ede9fe", text: "#6d28d9" }, // violet
];

const getPropertyColorScheme = (id = "") => {
  // hash the id (always stable, never changes on refresh)
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + hash * 31;
  return propertyColors[Math.abs(hash) % propertyColors.length];
};

const getPropertyInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

// ─── Image upload ────────────────────────────────────────
const imageInputRefs = {};

const triggerImageUpload = (propertyId) => {
  imageInputRefs[propertyId]?.click();
};

const onImageSelected = async (event, property) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Preview immediately so user sees the change
  const localUrl = URL.createObjectURL(file);
  property.image = localUrl;

  // Upload to backend
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("_method", "PATCH"); // needed for Laravel

    const response = await axios.post(
      `/api/properties/${property.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    // Replace preview with real URL from server
    const savedUrl = response.data?.image || response.data?.data?.image;
    if (savedUrl) property.image = savedUrl;
  } catch (err) {
    console.error("Image upload failed:", err);
    error.value = "Failed to upload image. Please try again.";
    property.image = null; // revert preview on failure
  }

  // Reset input so same file can be re-selected
  event.target.value = "";
};

// ─── Chip colors & SVGs per amenity ─────────────────────
const chipMeta = {
  // Connectivity
  "Wi-Fi": {
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <circle cx="12" cy="20" r="1" fill="currentColor"/>
      </svg>
    `,
  },

  "Fiber Internet": {
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
      </svg>
    `,
  },

  // Recreation
  "Swimming Pool": {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/>
      </svg>
    `,
  },

  Gym: {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6.5 6.5h11m-11 11h11M3 9.5v5m18-5v5"/>
      </svg>
    `,
  },

  // Dining
  Restaurant: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
      </svg>
    `,
  },

  Breakfast: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M3 8h14v9"/>
      </svg>
    `,
  },

  // Transport
  Parking: {
    color: "#9333ea",
    bg: "#fdf4ff",
    border: "#e9d5ff",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 17V7h4"/>
      </svg>
    `,
  },

  "Airport Shuttle": {
    color: "#9333ea",
    bg: "#fdf4ff",
    border: "#e9d5ff",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="7" width="20" height="11" rx="2"/>
        <circle cx="7" cy="18" r="1" fill="currentColor"/>
        <circle cx="17" cy="18" r="1" fill="currentColor"/>
      </svg>
    `,
  },

  // Services
  Laundry: {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    `,
  },

  "24h Front Desk": {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    `,
  },

  // Other
  "Pet Friendly": {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="9" cy="10" r="1"/>
      <circle cx="15" cy="10" r="1"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    </svg>
  `,
  },

"Air Conditioning": {
  color: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  svg: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v20"/>
      <path d="M4.93 6.93l14.14 14.14"/>
      <path d="M2 12h20"/>
      <path d="M4.93 17.07 19.07 2.93"/>
    </svg>
  `,
},
};

const defaultChip = {
  color: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  svg: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  `,
};

const chipStyle = (name) => {
  const m = chipMeta[name] || defaultChip;

  return {
    color: m.color,
    background: m.bg,
    borderColor: m.border,
  };
};

const getChipSvg = (name) => {
  return (chipMeta[name] || defaultChip).svg;
};

// ─── Modal ───────────────────────────────────────────────
const openEditModal = (property) => {
  const ids = (property.amenities || []).map((a) => a.id);
  editModal.value = {
    open: true,
    property,
    selected: [...ids],
    original: [...ids],
    saving: false,
    saveSuccess: false,
  };
  document.body.style.overflow = "hidden";
};
const closeEditModal = () => {
  editModal.value.open = false;
  document.body.style.overflow = "";
};

// ─── Save modal (Edit Amenities button in My Properties) ─
const saveModalAmenities = async () => {
  editModal.value.saving = true;
  error.value = null;
  try {
    // PUT /amenities/properties/:id/amenities  { amenity_ids: [...] }
    await updatePropertyAmenities(
      editModal.value.property.id,
      editModal.value.selected,
    );

    // Re-fetch the property's amenities so chips row updates live
    const updatedAmenities = await getPropertyAmenities(
      editModal.value.property.id,
    );
    const property = myProperties.value.find(
      (p) => p.id === editModal.value.property.id,
    );
    if (property) {
      property.amenities = updatedAmenities;
    }

    editModal.value.saveSuccess = true;
    setTimeout(() => closeEditModal(), 1000);
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      "Failed to save amenities. Check your backend connection.";
  } finally {
    editModal.value.saving = false;
  }
};

// ─── Fetch all amenities (catalogue) ────────────────────
const fetchAmenities = async () => {
  loading.value = true;
  error.value = null;
  try {
    // GET /amenities — returns full list for the selector
    amenities.value = await getAllAmenities();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load amenities.";
  } finally {
    loading.value = false;
  }
};

// ─── Catalogue save (not used on this page, kept for reuse)
const saveAmenities = async () => {
  if (!propertyId.value) return;
  saving.value = true;
  try {
    await updatePropertyAmenities(propertyId.value, selectedAmenities.value);
    originalSelected.value = [...selectedAmenities.value];
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 2000);
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to save amenities.";
  } finally {
    saving.value = false;
  }
};

const discardChanges = () => {
  selectedAmenities.value = [...originalSelected.value];
};

// ─── Fetch owner properties + their amenities ────────────
const fetchMyProperties = async () => {
  loadingProperties.value = true;
  error.value = null;
  try {
    // getOwnerProperties() calls your real backend (e.g. GET /api/properties/owner)
    const response = await getOwnerProperties();

    // Support both response.data (axios) and plain array
    const properties = response?.data?.data || response?.data || response || [];

    // For each property, also fetch its current amenities
    myProperties.value = await Promise.all(
      properties.map(async (property) => {
        try {
          const amenities = await getPropertyAmenities(property.id);
          return { ...property, amenities };
        } catch {
          // If property has no amenities yet, start with empty
          return { ...property, amenities: [] };
        }
      }),
    );
  } catch (err) {
    console.error("fetchMyProperties error:", err);
    error.value = "Failed to load your properties.";
  } finally {
    loadingProperties.value = false;
  }
};

// ─── Lifecycle ───────────────────────────────────────────
onMounted(() => {
  fetchAmenities();
});

watch(viewMode, (value) => {
  if (value === "myprops") {
    // Always re-fetch when switching to My Properties tab
    // so newly added amenities from the catalogue show up
    fetchMyProperties();
  }
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) fetchAmenities();
  },
);
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.amenity-page {
  width: calc(100% + 80px);
  margin-left: -40px;
  margin-right: -40px;
  min-height: 100vh;
  background: var(--color-page);
  color: var(--color-text);
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

/* =========================================================
   HEADER
========================================================= */

.page-header {
  width: 100%;
  background: linear-gradient(135deg, #021b3a, #0a4d8c, #38bdf8);
  padding: 34px 40px;
  box-sizing: border-box;
}

.header-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 500;
}

.bc-link {
  cursor: pointer;
  transition: 0.2s ease;
}
.bc-link:hover {
  color: white;
}
.separator {
  opacity: 0.7;
}

.page-title {
  margin-top: 18px;
  color: white;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;
}

.page-subtitle {
  margin-top: 6px;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.header-btn {
  min-width: 150px;
  height: 50px;
  padding: 0 22px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  color: white;
  margin-top: 60px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}
.header-btn.active {
  background: white;
  color: var(--color-primary-strong);
  border-color: white;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

/* =========================================================
   BODY
========================================================= */

.page-body {
  width: 100%;
  padding: 34px 40px 90px;
  box-sizing: border-box;
}

/* =========================================================
   MYPROPS TOP BAR
========================================================= */

.myprops-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.myprops-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
}

.btn-all-props {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-all-props:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* =========================================================
   PROPERTY LIST
========================================================= */

.property-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.property-card:hover {
  border-color: #bae6fd;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.1);
}

/* =========================================================
   PROPERTY TOP ROW
========================================================= */

.property-top {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px 18px;
}

.property-image,
.property-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.property-img-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
}

.img-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 16px;
}

.property-img-wrap:hover .img-upload-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.property-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.property-info {
  flex: 1;
}

.prop-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
}

.prop-meta {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-muted);
}

.prop-count {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--color-muted);
  font-weight: 500;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border: none;
  border-radius: 14px;
  background: var(--color-primary, #1268b4);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* =========================================================
   CHIPS ROW
========================================================= */

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 24px 20px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: 0.18s ease;
}

.chip:hover {
  transform: translateY(-1px);
  filter: brightness(0.96);
}

.chip-svg {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.chip-add {
  background: transparent;
  border: 1.5px dashed #cbd5e1;
  color: #64748b;
  cursor: pointer;
}

.chip-add:hover {
  border-color: var(--color-primary, #1268b4);
  color: var(--color-primary, #1268b4);
}

/* =========================================================
   BUTTONS
========================================================= */

.btn-primary {
  border: none;
  background: var(--color-primary);
  color: white;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  opacity: 0.96;
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-surface-soft);
}

/* =========================================================
   ERROR
========================================================= */

.error-banner {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(180, 35, 24, 0.12);
}

/* =========================================================
   SAVE BAR
========================================================= */

.save-bar {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 22px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-panel);
  z-index: 100;
}

.save-actions {
  display: flex;
  gap: 10px;
}

/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
}

.modal {
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-panel);
}

.modal-header,
.modal-footer {
  padding: 22px 24px;
  border-color: var(--color-border);
}

.modal-header {
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-footer {
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.close-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  cursor: pointer;
  font-size: 18px;
  transition: 0.2s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  text-align: center;
  padding: 90px 20px;
}
.empty-icon {
  font-size: 54px;
  margin-bottom: 14px;
}

/* =========================================================
   TRANSITIONS
========================================================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 768px) {
  .page-header {
    padding: 26px 20px;
  }
  .page-body {
    padding: 24px 20px 80px;
  }
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
  }
  .header-btn {
    flex: 1;
  }
  .page-title {
    font-size: 34px;
  }
  .property-top {
    flex-direction: column;
    align-items: flex-start;
  }
  .save-bar {
    width: calc(100% - 40px);
    justify-content: space-between;
  }
  .chips-row {
    padding: 0 16px 16px;
  }
}
</style>
