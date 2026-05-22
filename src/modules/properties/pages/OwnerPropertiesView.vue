<!-- <template>
  <main class="p-6">
    <h1 class="text-2xl font-semibold text-(--color-text)">My Properties</h1>
    <p class="mt-2 text-(--color-muted)">Owner property list, create, edit, delete, and restore actions will live here.</p>
  </main>
</template> -->

<script setup>
import { ref, onMounted } from "vue";
import PropertyCard from "../components/PropertyCard.vue";

import "@/assets/styles/variables.css";

const properties = ref([]);

const fetchProperties = async () => {
  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    properties.value = data.properties || [];
  } catch (err) {
    console.error("Failed to load properties:", err);
    properties.value = [];
  }
};

onMounted(fetchProperties);
</script>

<template>
  <main class="mt-25">
    <header class="mb-5">
      <h1 class="text-3xl font-semibold text-(--color-text)">
        My Properties
        <span class="text-(--color-muted)">({{ properties.length }})</span>
      </h1>
      <p class="mt-2 text-(--color-muted)">
        Manage your property listings here.
      </p>
    </header>

    <!-- Buttons row — sits just above the cards -->
    <div class="flex items-center justify-end gap-3 mb-5">
      <!-- Manage Amenities -->
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

      <!-- Add New Property -->
      <RouterLink
        to="/properties/new"
        class="flex items-center gap-2 px-6 py-3 rounded-xl transition-colors"
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
      </RouterLink>
    </div>

    <section>
      <div v-if="properties.length === 0" class="empty-state">
        No properties found. Please add a property to get started.
      </div>
      <PropertyCard
        v-else
        v-for="property in properties"
        :key="property.id"
        :property="property"
      />
    </section>
  </main>
</template>

<style scoped></style>
