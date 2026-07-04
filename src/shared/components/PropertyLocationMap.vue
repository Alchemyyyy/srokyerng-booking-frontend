<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

const props = defineProps({
  latitude: { type: [Number, String], default: null },
  longitude: { type: [Number, String], default: null },
  label: { type: String, default: "" },
  height: { type: String, default: "280px" },
});

const mapEl = ref(null);
let mapInstance = null;

const hasCoordinates = () => {
  const lat = Number(props.latitude);
  const lng = Number(props.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
};

const renderMap = () => {
  if (!mapEl.value || !window.L || !hasCoordinates()) return;

  const lat = Number(props.latitude);
  const lng = Number(props.longitude);

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  mapInstance = window.L.map(mapEl.value, { zoomControl: false }).setView([lat, lng], 15);

  const isDarkMode = document.documentElement.classList.contains("dark");
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  window.L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(mapInstance);
  window.L.control.zoom({ position: "topright" }).addTo(mapInstance);

  const icon = window.L.divIcon({
    className: "property-location-pin",
    html: `<div class="flex items-center justify-center rounded-full bg-(--color-primary) text-white shadow-2xl border-2 border-white" style="width: 32px; height: 32px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4 shrink-0"><path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const marker = window.L.marker([lat, lng], { icon }).addTo(mapInstance);
  if (props.label) {
    marker.bindTooltip(props.label, { direction: "top", offset: [0, -8] });
  }
};

watch(
  () => [props.latitude, props.longitude, props.label],
  async () => {
    await nextTick();
    renderMap();
  },
);

onMounted(async () => {
  await nextTick();
  renderMap();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-xl border border-(--color-border)"
    :style="{ height }"
  >
    <div v-if="hasCoordinates()" ref="mapEl" class="absolute inset-0 h-full w-full"></div>
    <div
      v-else
      class="absolute inset-0 flex items-center justify-center text-sm text-(--color-muted) bg-(--color-surface-soft)"
    >
      No coordinates available for this property.
    </div>
  </div>
</template>
