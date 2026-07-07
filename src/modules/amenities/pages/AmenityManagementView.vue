<template> <div class="amenity-page " :style="{ marginLeft: isMobile ? '0' : undefined }">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-inner">
        <!-- LEFT -->
        <div class="header-left">
          <div class="breadcrumb">
            <span class="bc-link" @click="$router.push('/owner')">
              {{ $t("amenityManagement.breadcrumb.dashboard") }}
            </span>
            <span class="separator">›</span>
            <span>{{ $t("amenityManagement.breadcrumb.amenities") }}</span>
          </div>
          <h1 class="page-title">{{ $t("amenityManagement.title") }}</h1>
          <p class="page-subtitle">{{ $t("amenityManagement.subtitle") }}</p>
        </div>

        <!-- RIGHT -->
        <div class="header-actions">
          <button
            class="header-btn"
            :class="{ active: viewMode === 'catalogue' }"
            @click="viewMode = 'catalogue'"
          >
            {{ $t("amenityManagement.tabs.catalogue") }}
          </button>
          <button
            class="header-btn"
            :class="{ active: viewMode === 'myprops' }"
            @click="viewMode = 'myprops'"
          >
            {{ $t("amenityManagement.tabs.myProperties") }}
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
        <OwnerLoadingState
          v-if="loading"
          :label="$t('amenityManagement.catalogue.loading')"
        />
        <template v-else>
          <div v-if="myProperties.length === 0 && !loadingProperties" class="catalogue-property-picker empty-state">
            <HomeIcon class="empty-icon" />
            <h3>{{ $t("amenityManagement.myProperties.empty.title") }}</h3>
            <p>{{ $t("amenityManagement.myProperties.empty.description") }}</p>
            <button class="btn-primary" @click="router.push({ name: 'owner.properties' })">
              {{ $t("amenityManagement.myProperties.empty.button") }}
            </button>
          </div>

          <template v-else>
            <div class="catalogue-property-picker">
              <label for="catalogue-property-select" class="picker-label">
                {{ $t("amenityManagement.catalogue.selectProperty") }}
              </label>
              <select
                id="catalogue-property-select"
                class="picker-select"
                v-model="selectedPropertyId"
              >
                <option :value="null" disabled>
                  {{ $t("amenityManagement.catalogue.selectPropertyPlaceholder") }}
                </option>
                <option
                  v-for="property in myProperties"
                  :key="property.id"
                  :value="property.id"
                >
                  {{ property.name }}
                </option>
              </select>
            </div>

            <OwnerLoadingState
              v-if="loadingCatalogueAmenities"
              :label="$t('amenityManagement.catalogue.loading')"
            />
            <p v-else-if="!selectedPropertyId" class="picker-hint">
              {{ $t("amenityManagement.catalogue.noPropertySelected") }}
            </p>
            <AmenitySelector
              v-else
              :amenities="amenities"
              v-model="selectedAmenities"
            />
          </template>
        </template>
      </template>

      <!-- MY PROPERTIES -->
      <template v-else>
        <div class="myprops-topbar">
          <p class="myprops-subtitle">
            {{ $t("amenityManagement.myProperties.subtitle") }}
          </p>
          <button
            class="btn-all-props"
            @click="router.push({ name: 'owner.properties' })"
          >
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
            {{ $t("amenityManagement.myProperties.allProperties") }}
          </button>
        </div>

        <OwnerLoadingState
          v-if="loadingProperties"
          :label="$t('amenityManagement.myProperties.loading')"
        />

        <div v-else-if="myProperties.length === 0" class="empty-state">
          <HomeIcon class="empty-icon" />
          <h3>{{ $t("amenityManagement.myProperties.empty.title") }}</h3>
          <p>{{ $t("amenityManagement.myProperties.empty.description") }}</p>
          <button
            class="btn-primary"
            @click="router.push({ name: 'owner.properties' })"
          >
            {{ $t("amenityManagement.myProperties.empty.button") }}
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
              <!-- Image (read-only — managed from the property's own edit page) -->
              <div class="property-img-wrap">
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
                    stroke="var(--color-success)"
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
                  {{
                    $t("amenityManagement.myProperties.amenitiesAssigned", {
                      count: property.amenities.length,
                    })
                  }}
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
                {{ $t("amenityManagement.myProperties.editButton") }}
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
                {{ $t("amenityManagement.myProperties.addMore") }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- SAVE BAR -->
    <transition name="slide-up">
      <div v-if="isDirty && viewMode === 'catalogue' && selectedPropertyId" class="save-bar">
        <div>
          {{
            $t("amenityManagement.saveBar.selected", {
              count: selectedAmenities.length,
            })
          }}
        </div>
        <div class="save-actions">
          <button class="btn-secondary" @click="discardChanges">
            {{ $t("amenityManagement.saveBar.discard") }}
          </button>
          <button class="btn-primary" :disabled="saving" @click="saveAmenities">
            <span v-if="saving">{{
              $t("amenityManagement.saveBar.saving")
            }}</span>
            <span v-else-if="saveSuccess">{{
              $t("amenityManagement.saveBar.saved")
            }}</span>
            <span v-else>{{
              $t("amenityManagement.saveBar.saveChanges")
            }}</span>
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
              <h2>{{ $t("amenityManagement.modal.title") }}</h2>
              <p>{{ editModal.property?.name }}</p>
            </div>
            <button class="close-btn" @click="closeEditModal">
              <XMarkIcon class="close-icon" />
            </button>
          </div>
          <div class="modal-body">
            <AmenitySelector
              :amenities="amenities"
              v-model="editModal.selected"
            />
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeEditModal">
              {{ $t("amenityManagement.modal.cancel") }}
            </button>
            <button
              class="btn-primary"
              :disabled="editModal.saving"
              @click="saveModalAmenities"
            >
              <span v-if="editModal.saving">{{
                $t("amenityManagement.modal.saving")
              }}</span>
              <span v-else-if="editModal.saveSuccess">{{
                $t("amenityManagement.modal.saved")
              }}</span>
              <span v-else>{{
                $t("amenityManagement.modal.saveChanges")
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import AmenitySelector from "../components/AmenitySelector.vue";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import { HomeIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import http from "@/app/api/http";

import {
  getAllAmenities,
  getPropertyAmenities,
  updatePropertyAmenities,
} from "../services/amenityService";
import { getOwnerProperties } from "../../properties/services/propertyService";

const { t } = useI18n();
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");

const route = useRoute();
const router = useRouter();

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

// Catalogue tab needs an explicit property to save amenity selections
// against — the route itself carries no property id, so this is picked
// from a dropdown populated from the owner's own properties.
const selectedPropertyId = ref(route.params.id ? Number(route.params.id) : null);
const loadingCatalogueAmenities = ref(false);

const isMobile = ref(window.innerWidth < 768);
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};
window.addEventListener("resize", handleResize);
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

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
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#f3e8ff", text: "#7e22ce" },
  { bg: "#fee2e2", text: "#b91c1c" },
  { bg: "#cffafe", text: "#0e7490" },
  { bg: "#fef9c3", text: "#a16207" },
  { bg: "#ede9fe", text: "#6d28d9" },
];

const getPropertyColorScheme = (id = "") => {
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

// ─── Chip colors & SVGs per amenity ─────────────────────
const chipMeta = {
  "Wi-Fi": {
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  },
  "Fiber Internet": {
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>`,
  },
  "Swimming Pool": {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/></svg>`,
  },
  Gym: {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11m-11 11h11M3 9.5v5m18-5v5"/></svg>`,
  },
  Restaurant: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/></svg>`,
  },
  Breakfast: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9"/></svg>`,
  },
  Parking: {
    color: "#9333ea",
    bg: "#fdf4ff",
    border: "#e9d5ff",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4"/></svg>`,
  },
  "Airport Shuttle": {
    color: "#9333ea",
    bg: "#fdf4ff",
    border: "#e9d5ff",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="11" rx="2"/><circle cx="7" cy="18" r="1" fill="currentColor"/><circle cx="17" cy="18" r="1" fill="currentColor"/></svg>`,
  },
  Laundry: {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/></svg>`,
  },
  "24h Front Desk": {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  },
  "Pet Friendly": {
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`,
  },
  "Air Conditioning": {
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M4.93 6.93l14.14 14.14"/><path d="M2 12h20"/><path d="M4.93 17.07 19.07 2.93"/></svg>`,
  },
};

const defaultChip = {
  color: "#64748b",
  bg: "#f8fafc",
  border: "#e2e8f0",
  svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
};

const chipStyle = (name) => {
  const m = chipMeta[name] || defaultChip;
  return { color: m.color, background: m.bg, borderColor: m.border };
};

const getChipSvg = (name) => (chipMeta[name] || defaultChip).svg;

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

// ─── Save modal amenities ────────────────────────────────
const saveModalAmenities = async () => {
  editModal.value.saving = true;
  error.value = null;
  try {
    await updatePropertyAmenities(
      editModal.value.property.id,
      editModal.value.selected,
    );

    const updatedAmenities = await getPropertyAmenities(
      editModal.value.property.id,
    );
    const property = myProperties.value.find(
      (p) => p.id === editModal.value.property.id,
    );
    if (property) property.amenities = updatedAmenities;

    editModal.value.saveSuccess = true;
    setTimeout(() => closeEditModal(), 1000);
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      t("amenityManagement.errors.saveAmenities");
  } finally {
    editModal.value.saving = false;
  }
};

// ─── Fetch all amenities (catalogue) ────────────────────
const fetchAmenities = async () => {
  loading.value = true;
  error.value = null;
  try {
    amenities.value = await getAllAmenities();
  } catch (err) {
    error.value = err?.response?.data?.message || t("amenityManagement.errors.loadAmenities");
  } finally {
    loading.value = false;
  }
};

// ─── Catalogue: load the selected property's current amenities ─────────
const loadCatalogueAmenitiesForProperty = async (id) => {
  if (!id) {
    selectedAmenities.value = [];
    originalSelected.value = [];
    return;
  }
  loadingCatalogueAmenities.value = true;
  error.value = null;
  try {
    const propertyAmenities = await getPropertyAmenities(id);
    const ids = (propertyAmenities || []).map((a) => a.id);
    selectedAmenities.value = [...ids];
    originalSelected.value = [...ids];
  } catch (err) {
    error.value =
      err?.response?.data?.message || t("amenityManagement.errors.loadPropertyAmenities");
  } finally {
    loadingCatalogueAmenities.value = false;
  }
};

watch(selectedPropertyId, (id) => {
  loadCatalogueAmenitiesForProperty(id);
});

// ─── Catalogue save ──────────────────────────────────────
const saveAmenities = async () => {
  if (!selectedPropertyId.value) return;
  saving.value = true;
  try {
    await updatePropertyAmenities(selectedPropertyId.value, selectedAmenities.value);
    originalSelected.value = [...selectedAmenities.value];
    saveSuccess.value = true;

    // Keep the "My Properties" tab's chip list consistent if it's already loaded.
    const property = myProperties.value.find(
      (p) => p.id === selectedPropertyId.value,
    );
    if (property) {
      property.amenities = await getPropertyAmenities(selectedPropertyId.value);
    }

    setTimeout(() => {
      saveSuccess.value = false;
    }, 2000);
  } catch (err) {
    error.value = err?.response?.data?.message || t("amenityManagement.errors.saveAmenities");
  } finally {
    saving.value = false;
  }
};

const discardChanges = () => {
  selectedAmenities.value = [...originalSelected.value];
};

// ─── Fetch owner properties + images + amenities ─────────
const fetchMyProperties = async () => {
  loadingProperties.value = true;
  error.value = null;
  try {
    const response = await getOwnerProperties();
    const properties = response?.data?.data || response?.data || response || [];

    myProperties.value = await Promise.all(
      properties.map(async (property) => {
        try {
          const [amenities, imagesRes] = await Promise.all([
            getPropertyAmenities(property.id),
            http.get(`/properties/${property.id}/images`).catch(() => null),
          ]);

          const images = imagesRes?.data || imagesRes || [];
          const cover = images.find((img) => img.is_cover == 1) || images[0];
          const rawUrl = cover?.image_url || cover?.url || cover?.path || null;
          const image = rawUrl ? `${BASE_URL}${rawUrl}` : null;

          return {
            ...property,
            amenities,
            image,
            name:
              property.property_name ||
              property.name ||
              t("amenityManagement.myProperties.empty.title"),
            type: property.category_name || property.type || "",
            location:
              property.city || property.province || property.location || "",
          };
        } catch {
          return {
            ...property,
            amenities: [],
            image: null,
            name: property.property_name || property.name || "",
            type: property.category_name || property.type || "",
            location:
              property.city || property.province || property.location || "",
          };
        }
      }),
    );
  } catch (err) {
    console.error("fetchMyProperties error:", err);
    error.value = t("amenityManagement.errors.loadProperties");
  } finally {
    loadingProperties.value = false;
  }
};

// ─── Lifecycle ───────────────────────────────────────────
onMounted(async () => {
  fetchAmenities();
  await fetchMyProperties();

  // Auto-pick the first property so the catalogue shows data immediately on
  // first open, instead of an empty "select a property" placeholder — unless
  // the (legacy) /owner/amenities/:id route already carries an id.
  if (!selectedPropertyId.value && myProperties.value.length > 0) {
    selectedPropertyId.value = myProperties.value[0].id;
  } else if (selectedPropertyId.value) {
    loadCatalogueAmenitiesForProperty(selectedPropertyId.value);
  }
});

watch(viewMode, (value) => {
  if (value === "myprops") fetchMyProperties();
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      selectedPropertyId.value = newId ? Number(newId) : null;
      fetchAmenities();
    }
  },
);
</script>

<style scoped>
.amenity-page {
  padding: 0 var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header {
  width: 100%;
  padding: 34px 40px 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 16px;
  }
  .page-body {
    padding: 24px 20px 80px;
  }
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-muted);
}

.bc-link {
  cursor: pointer;
  transition: color 0.2s;
}
.bc-link:hover {
  color: var(--color-primary);
}
.separator {
  opacity: 0.5;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -1px;
  margin: 0;
}

.page-subtitle {
  font-size: 15px;
  color: var(--color-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.header-btn {
  padding: 10px 20px;
  border-radius: 14px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.header-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: transparent;
}

.page-body {
  padding: 32px 40px 80px;
}

.myprops-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.catalogue-property-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  max-width: 360px;
}

.catalogue-property-picker.empty-state {
  max-width: none;
}

.picker-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-muted);
}

.picker-select {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.picker-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.picker-hint {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-muted);
  font-size: 15px;
}

.myprops-subtitle {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0;
}

.btn-all-props {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-all-props:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loading-text {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-muted);
  font-size: 15px;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.property-card:hover {
  box-shadow: var(--shadow-panel);
}

.property-top {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px 16px;
}

.property-img-wrap {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.property-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  border-radius: 14px;
}

.property-info {
  flex: 1;
  min-width: 0;
}

.prop-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border: 1.5px dashed var(--color-border);
  color: var(--color-muted);
  cursor: pointer;
}

.chip-add:hover {
  border-color: var(--color-primary, #1268b4);
  color: var(--color-primary, #1268b4);
}

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

.error-banner {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(180, 35, 24, 0.12);
}

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: 0.2s ease;
}

.close-icon {
  width: 18px;
  height: 18px;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.empty-state {
  text-align: center;
  padding: 90px 20px;
}

.empty-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  color: var(--color-muted);
}

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
