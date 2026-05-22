<template>
  <div class="amenity-page">
    <!-- ── Header ── -->
    <div class="page-header">
      <div class="header-inner">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="bc-link" @click="$router.push('/owner')">← Dashboard</span>
            <span class="bc-sep">›</span>
            <span class="bc-current">Amenities</span>
          </div>
          <h1 class="page-title">Amenities</h1>
          <p class="page-subtitle">Browse all available amenities and manage them for your properties</p>
        </div>
        <div class="header-actions">
          <button class="btn-catalogue" :class="{ active: viewMode === 'catalogue' }" @click="viewMode = 'catalogue'">
            Browse Catalogue
          </button>
          <button class="btn-myprops" :class="{ active: viewMode === 'myprops' }" @click="viewMode = 'myprops'">
            My Properties
          </button>
        </div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="page-body">

      <!-- ══ MY PROPERTIES VIEW ══ -->
      <template v-if="viewMode === 'myprops'">
        <div class="myprops-header">
          <p class="myprops-subtitle">Select a property to view and edit its amenities.</p>
          <button class="btn-add-property" @click="$router.push('/owner/properties/create')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Property
          </button>
        </div>

        <!-- Skeleton -->
        <div v-if="loadingProperties" class="skeleton-wrapper">
          <div class="skeleton-card" v-for="n in 3" :key="n" style="height:160px;border-radius:16px"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="myProperties.length === 0" class="empty-state">
          <div class="empty-icon">🏠</div>
          <h3>No properties yet</h3>
          <p>Add your first property to start managing amenities.</p>
          <button class="btn-try" @click="$router.push('/owner/properties/create')">Add Property</button>
        </div>

        <!-- Property list -->
        <div v-else class="myprops-list">
          <div v-for="property in myProperties" :key="property.id" class="myprop-card">
            <!-- Top row -->
            <div class="myprop-top">
              <img
                v-if="property.image || property.thumbnail"
                :src="property.image || property.thumbnail"
                :alt="property.name"
                class="myprop-img"
                @error="(e) => e.target.style.display = 'none'"
              />
              <div
                v-else
                class="myprop-img myprop-img-placeholder"
                :style="{ background: getPropertyColor(property.name) }"
              >
                {{ getPropertyInitials(property.name) }}
              </div>

              <div class="myprop-info">
                <h3 class="myprop-name">{{ property.name }}</h3>
                <p class="myprop-meta">{{ property.type }} · {{ property.location }}</p>
                <p class="myprop-count">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  {{ (property.amenities || []).length }} amenities assigned
                </p>
              </div>

              <button class="btn-edit-amenities" @click="openEditModal(property)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Amenities
              </button>
            </div>

            <!-- Chips row -->
            <div>
              <div class="myprop-divider"></div>
              <div class="myprop-chips">
                <template v-if="property.amenities && property.amenities.length">
                  <span
                    v-for="amenity in property.amenities.slice(0, 7)"
                    :key="amenity.id"
                    class="amenity-chip"
                    :style="getChipStyle(amenity.amenity_name)"
                  >
                    <span class="chip-icon">{{ getChipIcon(amenity.amenity_name) }}</span>
                    {{ amenity.amenity_name }}
                  </span>
                  <span v-if="property.amenities.length > 7" class="chip-overflow">
                    +{{ property.amenities.length - 7 }} more
                  </span>
                </template>
                <p v-else class="no-amenities-text">No amenities assigned yet.</p>
                <button class="chip-add-more" @click="openEditModal(property)">
                  {{ property.amenities && property.amenities.length ? '+ Add More' : '+ Assign Amenities' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ══ CATALOGUE VIEW ══ -->
      <template v-else>
        <div v-if="loading" class="skeleton-wrapper">
          <div class="skeleton-bar"></div>
          <div class="skeleton-pills">
            <div class="skeleton-pill" v-for="n in 6" :key="n"></div>
          </div>
          <div class="skeleton-section-title"></div>
          <div class="skeleton-grid">
            <div class="skeleton-card" v-for="n in 8" :key="n"></div>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to load amenities</h3>
          <p>{{ error }}</p>
          <button class="btn-try" @click="fetchAmenities">Try Again</button>
        </div>

        <template v-else>
          <div class="controls-row">
            <div class="search-wrap">
              <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input v-model="searchQuery" type="text" class="search-input" placeholder="Search amenities..."/>
            </div>
            <div class="filter-pills">
              <button
                v-for="cat in categoryPills" :key="cat.name"
                class="pill" :class="{ 'pill-active': activeCategory === cat.name }"
                @click="activeCategory = cat.name"
              >
                <span v-if="cat.name === 'All'" class="pill-plus">+</span>
                <span v-else class="pill-emoji">{{ cat.emoji }}</span>
                {{ cat.name }}
                <span class="pill-count">{{ cat.count }}</span>
              </button>
            </div>
          </div>

          <p class="total-count">{{ filteredAmenities.length }} amenities</p>

          <div v-for="group in visibleGroups" :key="group.category" class="category-section">
            <div class="category-heading">
              <span class="cat-emoji">{{ group.emoji }}</span>
              <span class="cat-name">{{ group.category }}</span>
              <span class="cat-badge">{{ group.items.length }}</span>
            </div>
            <div class="amenity-grid">
              <div
                v-for="amenity in group.items" :key="amenity.id"
                class="amenity-card" :class="{ selected: isSelected(amenity.id) }"
                @click="toggleAmenity(amenity.id)"
              >
                <div class="card-icon-wrap" :style="{ background: group.iconBg }">
                  <span class="card-svg-icon" :style="{ color: group.iconColor }" v-html="amenity.svg"></span>
                </div>
                <div class="card-body">
                  <div class="card-name">{{ amenity.amenity_name }}</div>
                  <div class="card-desc">{{ amenity.description }}</div>
                </div>
                <div class="card-check" v-if="isSelected(amenity.id)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- ── Floating Save Bar (catalogue only) ── -->
    <transition name="slide-up">
      <div class="save-bar" v-if="isDirty && viewMode === 'catalogue'">
        <span class="save-bar-text">
          <span class="pulse-dot"></span>
          {{ selectedAmenities.length }} amenities selected — unsaved changes
        </span>
        <div class="save-bar-actions">
          <button class="btn-discard" @click="discardChanges">Discard</button>
          <button class="btn-save" :disabled="saving" @click="saveAmenities">
            <span v-if="saving" class="spinner"></span>
            <span v-else-if="saveSuccess">✓ Saved!</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- ══ EDIT AMENITIES MODAL ══ -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="editModal.open" @click.self="closeEditModal">
        <div class="modal">

          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-header-left">
              <div
                class="modal-prop-thumb"
                :style="!(editModal.property?.image || editModal.property?.thumbnail)
                  ? { background: getPropertyColor(editModal.property?.name || '') }
                  : {}"
              >
                <img
                  v-if="editModal.property?.image || editModal.property?.thumbnail"
                  :src="editModal.property?.image || editModal.property?.thumbnail"
                  style="width:100%;height:100%;object-fit:cover;border-radius:10px"
                />
                <span v-else>{{ getPropertyInitials(editModal.property?.name || '') }}</span>
              </div>
              <div>
                <h2 class="modal-title">Edit Amenities</h2>
                <p class="modal-subtitle">{{ editModal.property?.name }}</p>
              </div>
            </div>
            <button class="modal-close" @click="closeEditModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Modal Search -->
          <div class="modal-search-wrap">
            <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input v-model="editModal.search" type="text" class="search-input" placeholder="Search amenities..." style="width:100%;padding-left:38px"/>
          </div>

          <!-- Selected count bar -->
          <div class="modal-count-bar">
            <span class="modal-count-text">
              <span class="modal-count-num">{{ editModal.selected.length }}</span> amenities selected
            </span>
            <button v-if="editModal.selected.length > 0" class="modal-clear-btn" @click="editModal.selected = []">
              Clear all
            </button>
          </div>

          <!-- Amenity list grouped by category -->
          <div class="modal-body">
            <div v-for="group in modalGroups" :key="group.category" class="modal-group">
              <div class="modal-group-heading">
                <span>{{ group.emoji }}</span>
                <span>{{ group.category }}</span>
                <span class="cat-badge">{{ group.items.length }}</span>
              </div>
              <div class="modal-amenity-grid">
                <div
                  v-for="amenity in group.items" :key="amenity.id"
                  class="modal-amenity-item"
                  :class="{ selected: editModal.selected.includes(amenity.id) }"
                  @click="toggleModalAmenity(amenity.id)"
                >
                  <div class="modal-item-icon" :style="{ background: group.iconBg, color: group.iconColor }" v-html="amenity.svg"></div>
                  <span class="modal-item-name">{{ amenity.amenity_name }}</span>
                  <div class="modal-item-check" v-if="editModal.selected.includes(amenity.id)">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-discard" @click="closeEditModal">Cancel</button>
            <button class="btn-save" :disabled="editModal.saving" @click="saveModalAmenities">
              <span v-if="editModal.saving" class="spinner"></span>
              <span v-else-if="editModal.saveSuccess">✓ Saved!</span>
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
import {
  getAllAmenities,
  getPropertyAmenities,
  updatePropertyAmenities,
} from "../services/amenityService";
import { getOwnerProperties } from "../../properties/services/propertyService";

const route = useRoute();
const router = useRouter();
const propertyId = computed(() => route.params.id);

// ── State ──────────────────────────────────────────────────────────
const amenities = ref([]);
const selectedAmenities = ref([]);
const originalSelected = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);
const saveSuccess = ref(false);
const searchQuery = ref("");
const activeCategory = ref("All");
const viewMode = ref("catalogue");
const myProperties = ref([]);
const loadingProperties = ref(false);

// ── Edit Modal state ───────────────────────────────────────────────
const editModal = ref({
  open: false,
  property: null,
  selected: [],
  original: [],
  search: "",
  saving: false,
  saveSuccess: false,
});

// ── Dirty check ────────────────────────────────────────────────────
const isDirty = computed(() => {
  const a = [...selectedAmenities.value].sort().join(",");
  const b = [...originalSelected.value].sort().join(",");
  return a !== b;
});

// ── Category meta ──────────────────────────────────────────────────
const categoryMeta = {
  Connectivity: {
    emoji: "📶",
    iconBg: "#e8f4fd",
    iconColor: "#2196F3",
    descriptions: { "Wi-Fi": "Wireless internet access" },
  },
  Recreation: {
    emoji: "🏊",
    iconBg: "#e8f8f0",
    iconColor: "#4CAF50",
    descriptions: {
      "Swimming Pool": "Swimming pool available",
      Gym: "Fitness gym available",
    },
  },
  Dining: {
    emoji: "🍽️",
    iconBg: "#fff8e8",
    iconColor: "#FF9800",
    descriptions: {
      Breakfast: "Breakfast available",
      Restaurant: "Restaurant available",
    },
  },
  Transport: {
    emoji: "🚗",
    iconBg: "#fdeaea",
    iconColor: "#F44336",
    descriptions: {
      Parking: "Parking available",
      "Airport Shuttle": "Airport shuttle service available",
    },
  },
  Services: {
    emoji: "🛎️",
    iconBg: "#f3e8ff",
    iconColor: "#9C27B0",
    descriptions: {
      Laundry: "Laundry service available",
      "Pet Friendly": "Pets are allowed",
      "Air Conditioning": "Air conditioning available",
    },
  },
  "Views & Nature": {
    emoji: "🌿",
    iconBg: "#e8f5e9",
    iconColor: "#388E3C",
    descriptions: {},
  },
};

// ── SVG icons by category ──────────────────────────────────────────
const svgByCategory = {
  Connectivity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  Recreation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M2 12h20M7 4c0 5 10 5 10 0M7 20c0-5 10-5 10 0"/></svg>`,
  Dining: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  Transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  Services: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  "Views & Nature": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 17l4-8 4 4 3-5 4 9H3z"/><circle cx="18" cy="6" r="3"/></svg>`,
};

// ── Chip meta ──────────────────────────────────────────────────────
const chipMeta = {
  "Wi-Fi":            { bg: "#e8f4fd", color: "#2196F3", border: "#b3d9f7" },
  "Swimming Pool":    { bg: "#e8f8f0", color: "#4CAF50", border: "#b2dfdb" },
  Restaurant:         { bg: "#fff8e8", color: "#FF9800", border: "#ffe0b2" },
  Gym:                { bg: "#e8f8f0", color: "#4CAF50", border: "#b2dfdb" },
  Parking:            { bg: "#f3f0ff", color: "#7C3AED", border: "#ddd6fe" },
  "Airport Shuttle":  { bg: "#fdeaea", color: "#F44336", border: "#ffcdd2" },
  Laundry:            { bg: "#f3e8ff", color: "#9C27B0", border: "#e1bee7" },
  Breakfast:          { bg: "#fff8e8", color: "#FF9800", border: "#ffe0b2" },
  "Pet Friendly":     { bg: "#fff0f5", color: "#E91E63", border: "#f8bbd0" },
  "Air Conditioning": { bg: "#e0f7fa", color: "#00BCD4", border: "#b2ebf2" },
};

const getChipStyle = (name) => {
  const meta = chipMeta[name] || {
    bg: "var(--color-surface-soft)",
    color: "var(--color-muted)",
    border: "var(--color-border)",
  };
  return { backgroundColor: meta.bg, color: meta.color, borderColor: meta.border };
};

const getChipIcon = (name) => {
  const icons = {
    "Wi-Fi": "📶", "Swimming Pool": "🏊", Restaurant: "🍽️", Gym: "🏋️",
    Parking: "🅿️", "Airport Shuttle": "🚐", Laundry: "🧺",
    Breakfast: "🍳", "Pet Friendly": "🐾", "Air Conditioning": "❄️",
  };
  return icons[name] || "✨";
};

// ── Property image helpers ─────────────────────────────────────────
const propertyColors = ["#0f6fa1","#4CAF50","#FF9800","#9C27B0","#F44336","#00BCD4","#388E3C","#7C3AED"];
const getPropertyColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return propertyColors[Math.abs(hash) % propertyColors.length];
};
const getPropertyInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

// ── Enrich amenities ───────────────────────────────────────────────
const enriched = computed(() =>
  amenities.value.map((a) => {
    let category = "Services", description = "Available at this property";
    let iconBg = "#f3e8ff", iconColor = "#9C27B0";
    for (const [cat, meta] of Object.entries(categoryMeta)) {
      if (meta.descriptions[a.amenity_name]) {
        category = cat;
        description = meta.descriptions[a.amenity_name];
        iconBg = meta.iconBg;
        iconColor = meta.iconColor;
        break;
      }
    }
    return {
      ...a, category, description, iconBg, iconColor,
      svg: svgByCategory[category] || svgByCategory["Services"],
    };
  }),
);

const filteredAmenities = computed(() => {
  const q = searchQuery.value.toLowerCase();
  let list = enriched.value;
  if (q) list = list.filter((a) => a.amenity_name.toLowerCase().includes(q));
  if (activeCategory.value !== "All")
    list = list.filter((a) => a.category === activeCategory.value);
  return list;
});

const categoryPills = computed(() => {
  const cats = ["All","Connectivity","Recreation","Dining","Transport","Services","Views & Nature"];
  return cats.map((name) => ({
    name,
    emoji: categoryMeta[name]?.emoji || "",
    count: name === "All"
      ? enriched.value.length
      : enriched.value.filter((a) => a.category === name).length,
  }));
});

const visibleGroups = computed(() => {
  const map = {};
  filteredAmenities.value.forEach((a) => {
    if (!map[a.category]) map[a.category] = [];
    map[a.category].push(a);
  });
  return Object.entries(map).map(([cat, items]) => ({
    category: cat,
    emoji: categoryMeta[cat]?.emoji || "📦",
    iconBg: categoryMeta[cat]?.iconBg || "#f0f4ff",
    iconColor: categoryMeta[cat]?.iconColor || "#666",
    items,
  }));
});

// ── Modal amenity groups (filtered by modal search) ────────────────
const modalGroups = computed(() => {
  const q = editModal.value.search.toLowerCase();
  const list = q
    ? enriched.value.filter((a) => a.amenity_name.toLowerCase().includes(q))
    : enriched.value;
  const map = {};
  list.forEach((a) => {
    if (!map[a.category]) map[a.category] = [];
    map[a.category].push(a);
  });
  return Object.entries(map).map(([cat, items]) => ({
    category: cat,
    emoji: categoryMeta[cat]?.emoji || "📦",
    iconBg: categoryMeta[cat]?.iconBg || "#f0f4ff",
    iconColor: categoryMeta[cat]?.iconColor || "#666",
    items,
  }));
});

// ── Catalogue toggles ──────────────────────────────────────────────
const isSelected = (id) => selectedAmenities.value.includes(id);
const toggleAmenity = (id) => {
  const idx = selectedAmenities.value.indexOf(id);
  if (idx === -1) selectedAmenities.value.push(id);
  else selectedAmenities.value.splice(idx, 1);
};
const discardChanges = () => {
  selectedAmenities.value = [...originalSelected.value];
};

// ── Modal helpers ──────────────────────────────────────────────────
const openEditModal = (property) => {
  const currentIds = (property.amenities || []).map((a) => a.id);
  editModal.value = {
    open: true,
    property,
    selected: [...currentIds],
    original: [...currentIds],
    search: "",
    saving: false,
    saveSuccess: false,
  };
  document.body.style.overflow = "hidden";
};

const closeEditModal = () => {
  editModal.value.open = false;
  document.body.style.overflow = "";
};

const toggleModalAmenity = (id) => {
  const idx = editModal.value.selected.indexOf(id);
  if (idx === -1) editModal.value.selected.push(id);
  else editModal.value.selected.splice(idx, 1);
};

const saveModalAmenities = async () => {
  editModal.value.saving = true;
  editModal.value.saveSuccess = false;
  try {
    await updatePropertyAmenities(editModal.value.property.id, editModal.value.selected);

    // Re-fetch this property's amenities to update chips reactively
    const updated = await getPropertyAmenities(editModal.value.property.id);
    const prop = myProperties.value.find((p) => p.id === editModal.value.property.id);
    if (prop) prop.amenities = updated;

    editModal.value.saveSuccess = true;
    setTimeout(() => { closeEditModal(); }, 900);
  } catch (err) {
    alert(err?.response?.data?.message || "Failed to save amenities");
  } finally {
    editModal.value.saving = false;
  }
};

// ── API ────────────────────────────────────────────────────────────
const fetchAmenities = async () => {
  loading.value = true;
  error.value = null;
  try {
    const allAmenities = await getAllAmenities();
    amenities.value = allAmenities;
    if (propertyId.value) {
      const propertyAmenities = await getPropertyAmenities(propertyId.value);
      selectedAmenities.value = propertyAmenities.map((amenity) => amenity.id);
      originalSelected.value = [...selectedAmenities.value];
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || "Failed to load amenities";
  } finally {
    loading.value = false;
  }
};

const saveAmenities = async () => {
  saving.value = true;
  saveSuccess.value = false;
  try {
    await updatePropertyAmenities(propertyId.value, selectedAmenities.value);
    originalSelected.value = [...selectedAmenities.value];
    saveSuccess.value = true;
    setTimeout(() => { saveSuccess.value = false; }, 2000);
  } catch (err) {
    alert(err?.response?.data?.message || "Failed to save amenities");
  } finally {
    saving.value = false;
  }
};

const fetchMyProperties = async () => {
  loadingProperties.value = true;
  try {
    const res = await getOwnerProperties();
    const props = res.data || [];
    const withAmenities = await Promise.all(
      props.map(async (property) => {
        try {
          const ams = await getPropertyAmenities(property.id);
          return { ...property, amenities: ams };
        } catch {
          return { ...property, amenities: [] };
        }
      })
    );
    myProperties.value = withAmenities;
  } catch (err) {
    console.error("Failed to load properties:", err);
  } finally {
    loadingProperties.value = false;
  }
};

// Always fetch all amenities on mount
onMounted(() => { fetchAmenities(); });

watch(viewMode, (val) => {
  if (val === "myprops" && myProperties.value.length === 0) fetchMyProperties();
});

watch(
  () => route.params.id,
  (newId, oldId) => { if (newId !== oldId) fetchAmenities(); }
);
</script>

<style scoped>
* { box-sizing: border-box; }

.amenity-page {
  min-height: 100vh;
  background: var(--color-page);
  font-family: var(--font-main);
  color: var(--color-text);
  padding-bottom: 100px;
  transition: background 0.3s, color 0.3s;
}

/* ── Header ── */
.page-header { margin-top: 60px; background: linear-gradient(135deg, #094260, #0f6fa1); }
.header-inner {
  max-width: 1200px; margin: 0 auto; padding: 28px 36px 32px;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
}
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 10px; }
.bc-link { cursor: pointer; }
.bc-link:hover { color: #fff; }
.bc-sep { color: rgba(255,255,255,0.35); }
.bc-current { color: rgba(255,255,255,0.85); }
.page-title { font-size: 30px; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: -0.3px; }
.page-subtitle { font-size: 14px; color: rgba(255,255,255,0.65); margin: 0; }
.header-actions { display: flex; gap: 10px; flex-shrink: 0; }
.btn-catalogue, .btn-myprops {
  padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.btn-catalogue { background: var(--color-surface); color: var(--color-primary-strong); border: 2px solid var(--color-surface); }
.btn-catalogue.active { box-shadow: var(--shadow-card); }
.btn-myprops { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.45); }
.btn-myprops:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.9); }
.btn-myprops.active { background: rgba(255,255,255,0.18); border-color: #fff; }

/* ── Body ── */
.page-body { max-width: 1200px; margin: 0 auto; padding: 32px 36px; }

/* ── My Properties header ── */
.myprops-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
}
.myprops-subtitle { font-size: 14px; color: var(--color-muted); margin: 0; }

.btn-add-property {
  display: flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 10px;
  background: var(--color-primary); color: #fff; border: none; font-size: 14px;
  font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.btn-add-property:hover { background: var(--color-primary-strong); box-shadow: var(--shadow-card); }

/* ── Empty state ── */
.empty-state {
  text-align: center; padding: 80px 24px; background: var(--color-surface);
  border-radius: 16px; border: 1.5px solid var(--color-border);
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; margin: 0 0 8px; color: var(--color-text); }
.empty-state p { color: var(--color-muted); font-size: 14px; margin: 0 0 20px; }

/* ── Property cards ── */
.myprops-list { display: flex; flex-direction: column; gap: 16px; }
.myprop-card {
  background: var(--color-surface); border: 1.5px solid var(--color-border);
  border-radius: 16px; overflow: hidden; transition: box-shadow 0.2s;
}
.myprop-card:hover { box-shadow: var(--shadow-card); }
.myprop-top { display: flex; align-items: center; gap: 16px; padding: 20px 24px; }
.myprop-img {
  width: 72px; height: 72px; border-radius: 12px; object-fit: cover;
  flex-shrink: 0; border: 1.5px solid var(--color-border);
}
.myprop-img-placeholder {
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: #fff; letter-spacing: 1px; border: none;
}
.myprop-info { flex: 1; min-width: 0; }
.myprop-name { font-size: 17px; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
.myprop-meta { font-size: 13px; color: var(--color-muted); margin: 0 0 6px; }
.myprop-count { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--color-success); font-weight: 500; margin: 0; }
.btn-edit-amenities {
  display: flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 10px;
  background: var(--color-primary); color: #fff; border: none; font-size: 14px;
  font-weight: 600; cursor: pointer; font-family: inherit; flex-shrink: 0; transition: all 0.2s;
}
.btn-edit-amenities:hover { background: var(--color-primary-strong); box-shadow: var(--shadow-card); }
.myprop-divider { height: 1px; background: var(--color-border); margin: 0 24px; }
.myprop-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 24px; align-items: center; }
.amenity-chip {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px;
  border-radius: 20px; font-size: 12px; font-weight: 500;
  border: 1.5px solid transparent; white-space: nowrap;
}
.chip-icon { display: flex; align-items: center; line-height: 1; }
.chip-icon svg { width: 13px; height: 13px; }
.chip-overflow {
  display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 20px;
  font-size: 12px; font-weight: 600; background: var(--color-surface-soft);
  color: var(--color-muted); border: 1.5px solid var(--color-border);
}
.chip-add-more {
  display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; border: 1.5px dashed var(--color-primary);
  background: transparent; color: var(--color-primary); cursor: pointer;
  font-family: inherit; transition: all 0.18s;
}
.chip-add-more:hover { background: var(--color-primary-soft); }
.no-amenities-text { font-size: 13px; color: var(--color-muted); margin: 0; }

/* ── Controls ── */
.controls-row { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.search-wrap { position: relative; flex-shrink: 0; }
.search-icon-svg {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--color-muted); pointer-events: none;
}
.search-input {
  width: 240px; padding: 10px 14px 10px 38px; border: 1.5px solid var(--color-border);
  border-radius: 8px; font-size: 14px; font-family: inherit; outline: none;
  background: var(--color-input); color: var(--color-text);
  transition: border-color 0.2s, background 0.3s, color 0.3s;
}
.search-input:focus { border-color: var(--color-primary); }
.search-input::placeholder { color: var(--color-muted); }

/* ── Pills ── */
.filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill {
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
  border: 1.5px solid var(--color-border); background: var(--color-surface);
  color: var(--color-muted); transition: all 0.18s; white-space: nowrap;
}
.pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
.pill-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.pill-plus { font-size: 15px; font-weight: 800; line-height: 1; }
.pill-emoji { font-size: 14px; }
.pill-count { font-size: 12px; font-weight: 600; opacity: 0.75; }
.pill-active .pill-count { opacity: 0.9; }
.total-count { font-size: 14px; color: var(--color-muted); margin: 0 0 28px; font-weight: 500; }

/* ── Category section ── */
.category-section { margin-bottom: 40px; }
.category-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.cat-emoji { font-size: 20px; }
.cat-name { font-size: 17px; font-weight: 700; color: var(--color-text); }
.cat-badge {
  font-size: 12px; font-weight: 600; color: var(--color-muted);
  background: var(--color-surface-soft); border-radius: 20px; padding: 2px 9px;
}
.amenity-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.amenity-card {
  position: relative; background: var(--color-surface); border: 1.5px solid var(--color-border);
  border-radius: 12px; padding: 20px 18px; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; gap: 12px; user-select: none;
}
.amenity-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-card); transform: translateY(-2px); }
.amenity-card.selected { border-color: var(--color-primary); background: var(--color-primary-soft); }
.card-icon-wrap { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-svg-icon { display: flex; align-items: center; justify-content: center; line-height: 1; }
.card-name { font-size: 14px; font-weight: 700; color: var(--color-text); margin-bottom: 4px; line-height: 1.3; }
.card-desc { font-size: 12px; color: var(--color-muted); line-height: 1.4; }
.amenity-card.selected .card-name { color: var(--color-primary); }
.card-check {
  position: absolute; top: 12px; right: 12px; width: 22px; height: 22px;
  background: var(--color-primary); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* ── Save Bar ── */
.save-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--color-surface); border: 1.5px solid var(--color-border);
  border-radius: 16px; padding: 14px 22px; display: flex; align-items: center;
  justify-content: space-between; gap: 24px; box-shadow: var(--shadow-panel);
  z-index: 100; min-width: 480px; transition: background 0.3s, border-color 0.3s;
}
.save-bar-text { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--color-text); }
.pulse-dot { width: 8px; height: 8px; background: var(--color-warning); border-radius: 50%; flex-shrink: 0; animation: pulse 1.4s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.6)} }
.save-bar-actions { display: flex; gap: 10px; }
.btn-discard {
  padding: 9px 18px; border: 1.5px solid var(--color-border); border-radius: 8px;
  background: var(--color-surface); color: var(--color-muted); font-size: 13px;
  font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-discard:hover { border-color: var(--color-muted); color: var(--color-text); }
.btn-save {
  padding: 9px 24px; border-radius: 8px; background: var(--color-primary); color: #fff;
  border: none; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  min-width: 130px; justify-content: center;
}
.btn-save:hover:not(:disabled) { background: var(--color-primary-strong); box-shadow: var(--shadow-card); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(24px); }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 24px;
}
.modal {
  background: var(--color-surface); border-radius: 20px;
  width: 100%; max-width: 680px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  border: 1.5px solid var(--color-border); overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1.5px solid var(--color-border); flex-shrink: 0;
}
.modal-header-left { display: flex; align-items: center; gap: 14px; }
.modal-prop-thumb {
  width: 46px; height: 46px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; color: #fff; overflow: hidden;
}
.modal-title { font-size: 18px; font-weight: 800; color: var(--color-text); margin: 0 0 2px; }
.modal-subtitle { font-size: 13px; color: var(--color-muted); margin: 0; }
.modal-close {
  width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--color-border);
  background: var(--color-surface); color: var(--color-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.modal-close:hover { background: var(--color-surface-soft); color: var(--color-text); }
.modal-search-wrap {
  position: relative; padding: 14px 24px 0; flex-shrink: 0;
}
.modal-search-wrap .search-icon-svg { top: calc(50% + 7px); left: 36px; }
.modal-count-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 24px; flex-shrink: 0;
}
.modal-count-text { font-size: 13px; color: var(--color-muted); }
.modal-count-num { font-weight: 700; color: var(--color-primary); }
.modal-clear-btn {
  font-size: 12px; font-weight: 600; color: #f44336; background: none;
  border: none; cursor: pointer; font-family: inherit; padding: 0;
}
.modal-clear-btn:hover { text-decoration: underline; }
.modal-body { overflow-y: auto; padding: 0 24px 8px; flex: 1; }
.modal-group { margin-bottom: 24px; }
.modal-group-heading {
  display: flex; align-items: center; gap: 8px; font-size: 14px;
  font-weight: 700; color: var(--color-text); margin-bottom: 12px; padding-top: 16px;
}
.modal-amenity-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.modal-amenity-item {
  position: relative; display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 10px; cursor: pointer;
  border: 1.5px solid var(--color-border); background: var(--color-surface);
  transition: all 0.18s; user-select: none;
}
.modal-amenity-item:hover { border-color: var(--color-primary); }
.modal-amenity-item.selected { border-color: var(--color-primary); background: var(--color-primary-soft); }
.modal-item-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-item-name { font-size: 13px; font-weight: 600; color: var(--color-text); line-height: 1.3; flex: 1; }
.modal-amenity-item.selected .modal-item-name { color: var(--color-primary); }
.modal-item-check {
  position: absolute; top: 8px; right: 8px; width: 18px; height: 18px;
  background: var(--color-primary); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1.5px solid var(--color-border); flex-shrink: 0;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal {
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.modal-fade-enter-from .modal, .modal-fade-leave-to .modal { transform: scale(0.95) translateY(16px); }

/* ── Error ── */
.error-state {
  text-align: center; padding: 80px 24px; background: var(--color-surface);
  border-radius: 16px; border: 1.5px solid var(--color-danger-soft);
}
.error-icon { font-size: 44px; margin-bottom: 14px; }
.error-state h3 { font-size: 18px; margin: 0 0 8px; color: var(--color-text); }
.error-state p { color: var(--color-danger); font-size: 13px; margin: 0 0 20px; }
.btn-try {
  padding: 11px 28px; background: var(--color-primary); color: #fff; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
}

/* ── Skeleton ── */
.skeleton-wrapper { display: flex; flex-direction: column; gap: 16px; }
.skeleton-bar,.skeleton-pill,.skeleton-section-title,.skeleton-card {
  background: linear-gradient(90deg, var(--color-surface-soft) 25%, var(--color-surface) 50%, var(--color-surface-soft) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skeleton-bar { height: 20px; width: 120px; border-radius: 6px; }
.skeleton-pills { display: flex; gap: 8px; }
.skeleton-pill { height: 36px; width: 110px; border-radius: 8px; }
.skeleton-section-title { height: 22px; width: 160px; border-radius: 6px; margin-top: 10px; }
.skeleton-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.skeleton-card { height: 110px; border-radius: 12px; }
@keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .amenity-grid { grid-template-columns: repeat(3,1fr); }
  .modal-amenity-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 768px) {
  .header-inner { flex-direction: column; align-items: flex-start; padding: 20px 16px 24px; }
  .page-body { padding: 20px 16px; }
  .amenity-grid { grid-template-columns: repeat(2,1fr); }
  .modal-amenity-grid { grid-template-columns: repeat(2,1fr); }
  .controls-row { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; }
  .save-bar { min-width: unset; width: calc(100% - 32px); flex-direction: column; gap: 12px; }
  .myprop-top { flex-wrap: wrap; }
  .btn-edit-amenities { width: 100%; justify-content: center; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal { max-height: 95vh; border-radius: 16px 16px 0 0; }
}
</style>