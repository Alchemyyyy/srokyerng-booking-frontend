<template>
  <div class="amenity-selector">
    <!-- Search Filter -->
    <div class="search-bar">
      <span class="search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search amenities..."
        class="search-input"
      />
      <span v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</span>
    </div>

    <!-- Category Groups -->
    <div v-if="filteredGroups.length" class="groups-wrapper">
      <div
        v-for="group in filteredGroups"
        :key="group.category"
        class="category-group"
      >
        <div class="category-header">
          <span class="category-icon">{{ group.icon }}</span>
          <span class="category-label">{{ group.category }}</span>
          <span class="category-count">{{ group.items.length }}</span>
        </div>

        <div class="amenity-grid">
          <button
            v-for="amenity in group.items"
            :key="amenity.id"
            type="button"
            class="amenity-card"
            :class="{ selected: isSelected(amenity.id) }"
            @click="toggleAmenity(amenity.id)"
          >
            <span class="amenity-emoji">{{ amenity.icon }}</span>
            <span class="amenity-name">{{ amenity.amenity_name }}</span>
            <span class="check-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <span>🔍</span>
      <p>No amenities match "<strong>{{ searchQuery }}</strong>"</p>
    </div>

    <!-- Footer count -->
    <div class="selection-footer" v-if="selectedAmenities.length > 0">
      <span class="selected-pill">
        {{ selectedAmenities.length }} selected
      </span>
      <button type="button" class="clear-all" @click="clearAll">Clear all</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  amenities: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(["update:modelValue"]);

const selectedAmenities = ref([...props.modelValue]);
const searchQuery = ref("");

watch(selectedAmenities, (val) => emit("update:modelValue", val), { deep: true });
watch(() => props.modelValue, (val) => { selectedAmenities.value = [...val]; });

const isSelected = (id) => selectedAmenities.value.includes(id);

const toggleAmenity = (id) => {
  const idx = selectedAmenities.value.indexOf(id);
  if (idx === -1) selectedAmenities.value.push(id);
  else selectedAmenities.value.splice(idx, 1);
};

const clearAll = () => { selectedAmenities.value = []; };

// Map amenity names to icons and categories
const amenityMeta = {
  // Essentials
  "WiFi": { icon: "📶", category: "Essentials" },
  "Air Conditioning": { icon: "❄️", category: "Essentials" },
  "Heating": { icon: "🔥", category: "Essentials" },
  "Washer": { icon: "🫧", category: "Essentials" },
  "Dryer": { icon: "💨", category: "Essentials" },
  "Kitchen": { icon: "🍳", category: "Essentials" },
  "TV": { icon: "📺", category: "Essentials" },
  "Iron": { icon: "👕", category: "Essentials" },
  // Outdoor
  "Pool": { icon: "🏊", category: "Outdoor" },
  "Hot Tub": { icon: "🛁", category: "Outdoor" },
  "BBQ Grill": { icon: "🔥", category: "Outdoor" },
  "Patio": { icon: "🌿", category: "Outdoor" },
  "Garden": { icon: "🌱", category: "Outdoor" },
  "Beach Access": { icon: "🏖️", category: "Outdoor" },
  "Lake Access": { icon: "🏞️", category: "Outdoor" },
  // Safety
  "Smoke Alarm": { icon: "🚨", category: "Safety" },
  "Carbon Monoxide Alarm": { icon: "⚠️", category: "Safety" },
  "First Aid Kit": { icon: "🩹", category: "Safety" },
  "Fire Extinguisher": { icon: "🧯", category: "Safety" },
  // Accessibility
  "Wheelchair Accessible": { icon: "♿", category: "Accessibility" },
  "Elevator": { icon: "🛗", category: "Accessibility" },
  // Parking & Logistics
  "Free Parking": { icon: "🅿️", category: "Parking" },
  "Garage": { icon: "🚗", category: "Parking" },
  "EV Charger": { icon: "⚡", category: "Parking" },
};

const enriched = computed(() =>
  props.amenities.map((a) => {
    const meta = amenityMeta[a.amenity_name] || { icon: "✨", category: "Other" };
    return { ...a, ...meta };
  })
);

const filteredAmenities = computed(() => {
  if (!searchQuery.value) return enriched.value;
  const q = searchQuery.value.toLowerCase();
  return enriched.value.filter((a) => a.amenity_name.toLowerCase().includes(q));
});

const filteredGroups = computed(() => {
  const map = {};
  const categoryIcons = {
    Essentials: "🏠", Outdoor: "🌳", Safety: "🛡️",
    Accessibility: "♿", Parking: "🚘", Other: "✨"
  };
  filteredAmenities.value.forEach((a) => {
    if (!map[a.category]) map[a.category] = [];
    map[a.category].push(a);
  });
  return Object.entries(map).map(([cat, items]) => ({
    category: cat,
    icon: categoryIcons[cat] || "📦",
    items
  }));
});
</script>

<style scoped>
.amenity-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f7f8fa;
  border: 1.5px solid #e4e7ed;
  border-radius: 12px;
  padding: 10px 14px;
  transition: border-color 0.2s;
}
.search-bar:focus-within {
  border-color: #4f7ef8;
  background: #fff;
}
.search-icon { color: #999; display: flex; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
  font-family: inherit;
}
.search-input::placeholder { color: #bbb; }
.clear-btn {
  color: #aaa;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
  transition: all 0.15s;
}
.clear-btn:hover { background: #e4e7ed; color: #555; }

/* Groups */
.groups-wrapper { display: flex; flex-direction: column; gap: 24px; }

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.category-icon { font-size: 16px; }
.category-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #666;
}
.category-count {
  margin-left: auto;
  font-size: 11px;
  color: #aaa;
  background: #f0f0f0;
  border-radius: 20px;
  padding: 2px 8px;
}

/* Grid */
.amenity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

/* Card */
.amenity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #fff;
  border: 1.5px solid #e8eaf0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  text-align: center;
}
.amenity-card:hover {
  border-color: #c5d3fa;
  background: #f5f8ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 126, 248, 0.12);
}
.amenity-card.selected {
  border-color: #4f7ef8;
  background: linear-gradient(135deg, #eef3ff 0%, #f5f0ff 100%);
  box-shadow: 0 4px 16px rgba(79, 126, 248, 0.2);
}
.amenity-emoji { font-size: 26px; line-height: 1; }
.amenity-name {
  font-size: 12px;
  font-weight: 500;
  color: #444;
  line-height: 1.3;
}
.amenity-card.selected .amenity-name { color: #2d5be3; font-weight: 600; }

/* Check badge */
.check-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e8eaf0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.2s;
}
.amenity-card.selected .check-badge {
  background: #4f7ef8;
  color: #fff;
}

/* Footer */
.selection-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f0f4ff;
  border: 1.5px solid #c5d3fa;
  border-radius: 12px;
}
.selected-pill {
  font-size: 13px;
  font-weight: 600;
  color: #4f7ef8;
}
.clear-all {
  font-size: 12px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
  transition: color 0.15s;
}
.clear-all:hover { color: #e05a5a; }

/* Empty */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #aaa;
  font-size: 14px;
}
.empty-state span { font-size: 32px; display: block; margin-bottom: 8px; }
</style>