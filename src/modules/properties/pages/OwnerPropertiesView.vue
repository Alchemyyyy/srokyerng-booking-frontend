<!-- <template>
  <main class="p-6">
    <h1 class="text-2xl font-semibold text-(--color-text)">My Properties</h1>
    <p class="mt-2 text-(--color-muted)">Owner property list, create, edit, delete, and restore actions will live here.</p>
  </main>
</template> -->

<script setup>
import { ref, onMounted } from 'vue';
import PropertyCard from '../components/PropertyCard.vue';

import '@/assets/styles/variables.css';

const properties = ref([]);

const fetchProperties = async () => {
  try {
    const res = await fetch('/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    properties.value = data.properties || [];
  } catch (err) {
    console.error('Failed to load properties:', err);
    properties.value = [];
  }
};

onMounted(fetchProperties);
</script>

<template>
  <PropertyCard v-for="item in properties" :key="item.id" :property="item" />
</template>
