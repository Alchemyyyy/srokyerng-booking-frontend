<template>
  <div class="amenity-selector">
    <!-- Search + Filter Bar -->
    <div class="top-bar">
      <div class="search-bar">
        <span class="search-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('amenityManagement.selector.searchPlaceholder')"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          class="clear-btn"
          type="button"
          @click="searchQuery = ''"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category filter tabs -->
      <div class="filter-tabs">
        <button
          type="button"
          class="filter-tab"
          :class="{ active: activeCategory === null }"
          @click="activeCategory = null"
        >
          <Squares2X2Icon class="tab-icon" />
          {{ $t("amenityManagement.selector.all") }}
          <span class="tab-count">{{ enrichedAmenities.length }}</span>
        </button>
        <button
          v-for="group in allGroups"
          :key="group.category"
          type="button"
          class="filter-tab"
          :class="{ active: activeCategory === group.category }"
          @click="activeCategory = group.category"
        >
          <component :is="group.icon" class="tab-icon" />
          {{ group.category }}
          <span class="tab-count">{{ group.total }}</span>
        </button>
      </div>
    </div>

    <!-- Amenity count -->
    <p class="amenity-count">{{ t("amenityManagement.selector.amenityCount", { count: filteredAmenities.length }) }}</p>

    <!-- Groups -->
    <div v-if="groupedAmenities.length" class="groups-wrapper">
      <div
        v-for="group in groupedAmenities"
        :key="group.category"
        class="category-group"
      >
        <!-- Header -->
        <div class="category-header">
          <component :is="group.icon" class="category-icon" />
          <span class="category-title">{{ group.category }}</span>
          <span class="category-count" :style="countStyle(group.category)">{{
            group.items.length
          }}</span>
        </div>

        <!-- Grid -->
        <div class="amenity-grid">
          <button
            v-for="amenity in group.items"
            :key="amenity.id"
            type="button"
            class="amenity-card"
            :class="{ selected: isSelected(amenity.id) }"
            @click="toggleAmenity(amenity.id)"
          >
            <div class="amenity-icon-wrap" :style="iconStyle(amenity.category)">
              <span class="amenity-svg" v-html="amenity.svg"></span>
            </div>
            <div class="amenity-info">
              <div class="amenity-name">{{ amenity.amenity_name }}</div>
              <div class="amenity-desc">{{ amenity.description }}</div>
            </div>
            <div class="check-badge" v-if="isSelected(amenity.id)">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="3"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <MagnifyingGlassIcon class="empty-icon" />
      <p>{{ $t("amenityManagement.selector.noResults") }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  WifiIcon,
  SunIcon,
  CakeIcon,
  TruckIcon,
  BellIcon,
  GlobeAmericasIcon,
  SparklesIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

const props = defineProps({
  amenities: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const searchQuery = ref("");
const activeCategory = ref(null);
const selectedAmenities = ref([...props.modelValue]);

watch(
  () => props.modelValue,
  (value) => {
    if (JSON.stringify(value) !== JSON.stringify(selectedAmenities.value)) {
      selectedAmenities.value = [...value];
    }
  },
  { immediate: true, deep: true },
);

watch(
  selectedAmenities,
  (value) => {
    if (JSON.stringify(value) !== JSON.stringify(props.modelValue)) {
      emit("update:modelValue", value);
    }
  },
  { deep: true },
);

const amenityMeta = {
  "Wi-Fi": {
    category: "Connectivity",
    description: "High-speed wireless internet throughout",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  },
  "Fiber Internet": {
    category: "Connectivity",
    description: "Ultra-fast fiber optic connection",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>`,
  },
  "Work Desk": {
    category: "Connectivity",
    description: "Dedicated workspace with outlets",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>`,
  },
  "Swimming Pool": {
    category: "Recreation",
    description: "Outdoor or indoor swimming pool",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/><path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/><path d="M16 7h.01M12 3l2 2-2 2 2 2"/></svg>`,
  },
  "Infinity Pool": {
    category: "Recreation",
    description: "Stunning infinity-edge pool",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/><path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/><path d="M5 7h14"/></svg>`,
  },
  "Rooftop Pool": {
    category: "Recreation",
    description: "Pool on the rooftop with panoramic views",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 2.5 2"/><path d="M3 7l9-4 9 4"/><path d="M5 7v3m14-3v3"/></svg>`,
  },
  Gym: {
    category: "Recreation",
    description: "Fully equipped gym",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M3 9.5v5"/><path d="M21 9.5v5"/><path d="M5 7.5v9"/><path d="M19 7.5v9"/></svg>`,
  },
  "Fitness Center": {
    category: "Recreation",
    description: "Fully equipped gym and fitness area",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 6.5h11m-11 11h11M3 9.5v5m18-5v5M5 7.5v9m14-9v9"/></svg>`,
  },
  "Spa & Wellness": {
    category: "Recreation",
    description: "Full spa treatments and massage",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22c5.5-2.5 8-6 8-10a8 8 0 0 0-16 0c0 4 2.5 7.5 8 10z"/><path d="M12 22V11"/><path d="m12 11-3-4"/><path d="m12 11 3-4"/></svg>`,
  },
  "Yoga Classes": {
    category: "Recreation",
    description: "Daily guided yoga sessions",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="4" r="1.5"/><path d="M12 5.5v5l-3 5h6l-3-5"/><path d="M8.5 13.5l-2.5 5"/><path d="M15.5 13.5l2.5 5"/></svg>`,
  },
  "Tennis Court": {
    category: "Recreation",
    description: "Full-size tennis court",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="3"/><path d="M3 11h5m8 0h5M11 3v5m0 8v5"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  },
  Beachfront: {
    category: "Views & Nature",
    description: "Direct private beach access",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.5 9c0 4.5-5.5 11-5.5 11S6.5 13.5 6.5 9a5.5 5.5 0 0 1 11 0z"/><path d="M2 19c2-2 4-3 10-3s8 1 10 3"/></svg>`,
  },
  Restaurant: {
    category: "Dining",
    description: "On-site restaurant with full menu",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6h3.5"/><path d="M19.5 13V22"/></svg>`,
  },
  Breakfast: {
    category: "Dining",
    description: "Free daily breakfast for all guests",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
  },
  Parking: {
    category: "Transport",
    description: "On-site secure parking",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  },
  "Airport Shuttle": {
    category: "Transport",
    description: "Complimentary airport transfers",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="11" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="7" cy="18" r="1" fill="currentColor"/><circle cx="17" cy="18" r="1" fill="currentColor"/></svg>`,
  },
  Laundry: {
    category: "Services",
    description: "Full laundry and dry cleaning service",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6h.01M12 6h.01"/></svg>`,
  },
  "Pet Friendly": {
    category: "Services",
    description: "Pets welcome on the property",
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.827"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.827"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>`,
  },
  "Air Conditioning": {
    category: "Services",
    description: "Climate-controlled rooms",
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M4.9 4.9l14.2 14.2"/><path d="M19.1 4.9L4.9 19.1"/></svg>`,
  },
};

const categoryIcons = {
  Connectivity: WifiIcon,
  Recreation: SunIcon,
  Dining: CakeIcon,
  Transport: TruckIcon,
  Services: BellIcon,
  "Views & Nature": GlobeAmericasIcon,
  Other: SparklesIcon,
};

const categoryColors = {
  Connectivity: {
    bg: "var(--color-primary-soft)",
    border: "var(--color-primary)",
    color: "var(--color-primary)",
  },
  Recreation: {
    bg: "var(--color-success-soft)",
    border: "var(--color-success)",
    color: "var(--color-success)",
  },
  Dining: {
    bg: "var(--color-accent-soft)",
    border: "var(--color-accent)",
    color: "var(--color-accent-strong)",
  },
  Transport: {
    bg: "var(--color-secondary-soft)",
    border: "var(--color-secondary)",
    color: "var(--color-secondary)",
  },
  Services: {
    bg: "var(--color-info-soft)",
    border: "var(--color-info)",
    color: "var(--color-info)",
  },
  "Views & Nature": {
    bg: "var(--color-warning-soft)",
    border: "var(--color-warning)",
    color: "var(--color-warning)",
  },
  Other: {
    bg: "var(--color-surface-soft)",
    border: "var(--color-border)",
    color: "var(--color-muted)",
  },
};

const iconStyle = (category) => {
  const c = categoryColors[category] || categoryColors.Other;
  return { background: c.bg, borderColor: c.border, color: c.color };
};

const countStyle = (category) => {
  const c = categoryColors[category] || categoryColors.Other;
  return { background: c.bg, color: c.color, border: `1px solid ${c.border}` };
};

const enrichedAmenities = computed(() => {
  return props.amenities.map((amenity) => {
    const meta = amenityMeta[amenity.amenity_name] || {
      category: "Other",
      description: "",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
    };
    return { ...amenity, ...meta };
  });
});

const allGroups = computed(() => {
  const groups = {};
  enrichedAmenities.value.forEach((amenity) => {
    if (!groups[amenity.category]) groups[amenity.category] = 0;
    groups[amenity.category]++;
  });
  return Object.entries(groups).map(([category, total]) => ({
    category,
    icon: categoryIcons[category] || CubeIcon,
    total,
  }));
});

const filteredAmenities = computed(() => {
  let list = enrichedAmenities.value;
  const query = searchQuery.value.toLowerCase().trim();

  if (query) {
    list = list.filter((a) => {
      const name = a.amenity_name?.toLowerCase() || "";
      const desc = a.description?.toLowerCase() || "";
      const cat = a.category?.toLowerCase() || "";
      return query
        .split(" ")
        .every(
          (word) =>
            name.includes(word) || desc.includes(word) || cat.includes(word),
        );
    });
  }

  if (activeCategory.value) {
    list = list.filter((a) => a.category === activeCategory.value);
  }

  return list;
});

const groupedAmenities = computed(() => {
  const groups = {};
  filteredAmenities.value.forEach((amenity) => {
    if (!groups[amenity.category]) groups[amenity.category] = [];
    groups[amenity.category].push(amenity);
  });
  return Object.entries(groups).map(([category, items]) => ({
    category,
    icon: categoryIcons[category] || CubeIcon,
    items,
  }));
});

const isSelected = (id) => selectedAmenities.value.includes(id);

const toggleAmenity = (id) => {
  const index = selectedAmenities.value.indexOf(id);
  if (index === -1) selectedAmenities.value.push(id);
  else selectedAmenities.value.splice(index, 1);
};
</script>

<style scoped>
.amenity-selector {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.top-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-bar {
  width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: var(--color-surface);
  color: var(--color-text);
}

.search-input:focus {
  border-color: var(--color-primary);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  padding: 0;
}

.clear-btn:hover {
  color: var(--color-text);
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-muted);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-tab.active {
  background: var(--color-primary);
  border-color: transparent;
  color: #fff;
}

.tab-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.tab-count {
  background: var(--color-border);
  color: var(--color-muted);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 12px;
  font-weight: 700;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.amenity-count {
  font-size: 13px;
  color: var(--color-muted);
  margin: 0;
}

.groups-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.category-icon {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  color: var(--color-muted);
}
.category-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
}

.category-count {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.amenity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
}

.amenity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 20px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  min-height: 110px;
  transition: all 0.2s ease;
}

.amenity-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.amenity-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.amenity-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.amenity-card:hover .amenity-icon-wrap {
  transform: scale(1.06);
  filter: brightness(0.95) saturate(1.1);
}

.amenity-card.selected .amenity-icon-wrap {
  filter: brightness(0.9) saturate(1.2);
}

.amenity-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.amenity-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.amenity-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}
.amenity-desc {
  font-size: 12.5px;
  color: var(--color-muted);
  line-height: 1.4;
}

.check-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--color-muted);
}
.empty-icon {
  width: 38px;
  height: 38px;
  margin: 0 auto 10px;
}

@media (max-width: 768px) {
  .search-bar {
    width: 100%;
  }
  .amenity-grid {
    grid-template-columns: 1fr;
  }
  .filter-tabs {
    gap: 6px;
  }
  .filter-tab {
    padding: 7px 12px;
    font-size: 13px;
  }
}
</style>
