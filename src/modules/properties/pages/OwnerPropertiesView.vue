<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const properties = ref([]);

const fetchPropertiesList = async () => {
  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    // Maps the 3 assets shown in your visual design grid
    properties.value = data.properties ? data.properties.slice(0, 3) : [];
  } catch (err) {
    console.error("Error loading properties list:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPropertiesList);
</script>

<template>
  <div class="p-8 space-y-6 min-h-screen bg-[#030d1e] text-slate-200">
    
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">My Properties</h1>
        <p class="text-sm text-slate-400 mt-0.5">Manage your listed properties and their approval status.</p>
      </div>
      <button class="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-xs bg-[#2575e6] text-white hover:bg-blue-600 transition-colors shadow-sm">
        + Add Property
      </button>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-slate-800"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in properties" 
        :key="item.id"
        class="rounded-2xl overflow-hidden border border-slate-800/70 bg-[#091428] flex flex-col justify-between group shadow-lg"
      >
        <div class="relative h-45 w-full overflow-hidden bg-slate-900">
          <img :src="item.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          
          <span 
            :class="[
              'absolute top-4 left-4 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md',
              item.status === 'Approved' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
            ]"
          >
            {{ item.status }}
          </span>
        </div>

        <div class="p-5 space-y-4">
          <div>
            <h3 class="text-base font-bold tracking-tight text-white line-clamp-1">{{ item.name }}</h3>
            <p class="text-xs text-slate-400 flex items-center gap-1 mt-1">
              📍 {{ item.type }} · {{ item.location }}
            </p>
          </div>

          <div class="flex items-center gap-6 pt-1">
            <div>
              <span class="text-sm font-black text-white block">{{ item.rooms }}</span>
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Rooms</span>
            </div>
            <div>
              <span class="text-sm font-black text-white block">{{ item.bookings }}</span>
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Bookings</span>
            </div>
            <div>
              <span class="text-sm font-black text-white block">${{ item.revenue.toLocaleString() }}</span>
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Revenue</span>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-800/60 bg-[#071021] flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <button class="px-3 py-1.5 rounded-md border border-slate-800 bg-[#091428] text-xs font-semibold text-slate-300 hover:text-blue-400 flex items-center gap-1">
              🛏️ Rooms
            </button>
            <button class="px-3 py-1.5 rounded-md border border-slate-800 bg-[#091428] text-xs font-semibold text-slate-300 hover:text-blue-400 flex items-center gap-1">
              ✏️ Edit
            </button>
            <button class="px-3 py-1.5 rounded-md border border-slate-800 bg-[#091428] text-xs font-semibold text-slate-300 hover:text-blue-400 flex items-center gap-1">
              🔗 View
            </button>
          </div>
          
          <button class="p-2 rounded-md hover:bg-rose-500/10 text-rose-400/80 hover:text-rose-400 transition-colors">
            🗑️
          </button>
        </div>
        
      </div>
    </div>
  </div>
</template>