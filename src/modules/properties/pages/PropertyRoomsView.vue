<script setup>
import { ref } from "vue";

// Mock data reflecting premium room configurations
const rooms = ref([
  {
    id: 1,
    name: "Deluxe Premium Room",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
    guests: "2 Guests",
    beds: "1 King Bed",
    size: "28 m²",
    price: 40,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Smart TV",
      "Private En-Suite Bathroom",
    ],
    hasBreakfast: true,
  },
  {
    id: 2,
    name: "Superior Signature Room",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    guests: "2 Guests",
    beds: "2 Single Beds",
    size: "32 m²",
    price: 55,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Smart TV",
      "Private En-Suite Bathroom",
    ],
    hasBreakfast: true,
  },
  {
    id: 3,
    name: "Executive Family Room",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
    guests: "4 Guests",
    beds: "2 Queen Beds",
    size: "45 m²",
    price: 80,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Smart TV",
      "Private En-Suite Bathroom",
    ],
    hasBreakfast: true,
  },
]);

const priceRange = ref(150);
const selectedCapacity = ref("2 Guests");
const selectedFacilities = ref(["Free WiFi", "Air Conditioning"]);
const sortBy = ref("Recommended");

const toggleFacility = (facility) => {
  if (selectedFacilities.value.includes(facility)) {
    selectedFacilities.value = selectedFacilities.value.filter(
      (f) => f !== facility,
    );
  } else {
    selectedFacilities.value.push(facility);
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-[#fdfdfe] text-[#0f2942] antialiased pb-20 font-sans"
  >
    <!-- Premium Top Navigation Track Area -->
    <div
      class="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between text-xs font-medium"
      >
        <div class="flex items-center gap-2 text-slate-400">
          <a href="#" class="hover:text-[#1062b3] transition">Home</a>
          <span class="text-slate-300">/</span>
          <a href="#" class="hover:text-[#1062b3] transition">Properties</a>
          <span class="text-slate-300">/</span>
          <span class="text-[#0f2942] font-semibold">Angkor Palace Hotel</span>
        </div>

        <div
          class="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5"
        >
          <span
            class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
          ></span>
          Instant Booking Active
        </div>
      </div>
    </div>

    <!-- 1. High-End Premium Header Banner with Gradient Fusion -->
    <div class="max-w-7xl mx-auto px-6 mt-8 mb-10">
      <div
        class="relative bg-gradient-to-r from-[#0b427b] to-[#1a73e8] rounded-[32px] p-8 md:p-10 shadow-xl shadow-blue-950/10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <!-- Abstract Ambient Background Glows -->
        <div
          class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute left-1/3 -bottom-20 w-60 h-60 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"
        ></div>

        <!-- Left Context Content Layout block -->
        <div class="relative z-10 space-y-4 max-w-xl text-white">
          <div
            class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs font-semibold"
          >
            <span class="text-amber-300 text-sm">★</span> 4.8
            <span class="text-white/60 font-normal"
              >(128 Verified Reviews)</span
            >
          </div>

          <h1
            class="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight"
          >
            Available Rooms at <br /><span
              class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400"
              >Angkor Palace Hotel</span
            >
          </h1>

          <p
            class="text-xs text-blue-100/80 font-medium leading-relaxed flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4 text-amber-300"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            National Road 6, Airport District, Siem Reap, Cambodia
          </p>
        </div>

        <!-- Right Panorama Image Deck with Asymmetric Frame Clamping -->
        <div
          class="relative w-full md:w-[48%] h-52 md:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent z-10"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80"
            alt="Room Cover View"
            class="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </div>

    <!-- 2. Split Workspace Section Grid Layout -->
    <div
      class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"
    >
      <!-- Modernized Left Sidebar Controls Filter Group Card -->
      <aside
        class="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-8 sticky top-24"
      >
        <div class="flex items-center justify-between">
          <h2
            class="text-sm font-black text-[#0f2942] uppercase tracking-wider"
          >
            Filter Options
          </h2>
          <button
            class="text-[11px] text-slate-400 font-bold hover:text-[#1062b3] transition"
          >
            Reset All
          </button>
        </div>

        <!-- Price Selection Range Component Layer -->
        <div class="space-y-3">
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
          >
            Max Nightly Budget
          </label>
          <div class="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div class="flex justify-between items-baseline mb-2">
              <span class="text-[10px] text-slate-400 font-bold">$20</span>
              <span class="text-lg font-black text-[#1062b3]"
                >${{ priceRange }}</span
              >
            </div>
            <input
              v-model="priceRange"
              type="range"
              min="20"
              max="250"
              class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1062b3] outline-none"
            />
          </div>
        </div>

        <!-- Modern Chip Capacity Selectors -->
        <div class="space-y-3">
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
          >
            Room Capacity
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="cap in ['1 Guest', '2 Guests', '3 Guests', '4+ Guests']"
              :key="cap"
              @click="selectedCapacity = cap"
              type="button"
              :class="
                selectedCapacity === cap
                  ? 'bg-[#1062b3] border-[#1062b3] text-white shadow-md shadow-blue-600/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              "
              class="border rounded-xl py-2 text-center text-[11px] font-bold transition cursor-pointer"
            >
              {{ cap }}
            </button>
          </div>
        </div>

        <!-- Luxury Icon-Less Interactive Facility Filter Badges -->
        <div class="space-y-3">
          <label
            class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest"
          >
            Facilities & Amenities
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="fac in [
                'Free WiFi',
                'Air Conditioning',
                'Breakfast Included',
                'Smart TV',
                'Balcony',
                'Private Bathroom',
              ]"
              :key="fac"
              @click="toggleFacility(fac)"
              type="button"
              :class="
                selectedFacilities.includes(fac)
                  ? 'bg-blue-50 border-blue-200 text-[#1062b3] font-bold'
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
              "
              class="border rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition cursor-pointer"
            >
              {{ fac }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Right Column: Premium Active Rooms Stream Grid -->
      <main class="lg:col-span-3 space-y-6">
        <!-- Interactive Sorter Header Panel Line -->
        <div
          class="flex items-center justify-between gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl mb-2"
        >
          <div>
            <h3
              class="text-sm font-black text-[#0f2942] tracking-wide uppercase"
            >
              Available Configurations
            </h3>
            <p class="text-[11px] text-slate-400 font-medium mt-0.5">
              {{ rooms.length }} luxury premium suites ready
            </p>
          </div>

          <div
            class="relative bg-white border border-slate-200/60 rounded-xl px-3 py-2 flex items-center gap-1 shadow-sm min-w-[170px]"
          >
            <span class="text-slate-400 text-[11px] font-medium">Sort:</span>
            <select
              v-model="sortBy"
              class="bg-transparent font-bold text-slate-700 text-xs outline-none pr-4 appearance-none cursor-pointer flex-1"
            >
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <span
              class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[8px]"
              >▼</span
            >
          </div>
        </div>

        <!-- Premium Asymmetric Row Deck Layout for Card Items -->
        <div
          v-for="room in rooms"
          :key="room.id"
          class="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden p-4 flex flex-col md:flex-row gap-6 items-stretch hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300"
        >
          <!-- Modern Media Canvas Frame with Zoom Accent Anchor -->
          <div
            class="w-full md:w-[280px] aspect-[4/3] md:h-auto rounded-xl overflow-hidden flex-shrink-0 relative group"
          >
            <img
              :src="room.image"
              :alt="room.name"
              class="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-500"
            />
            <div
              class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider text-[#0f2942] uppercase shadow-sm"
            >
              Luxury Collection
            </div>
          </div>

          <!-- Body Description & Structural Matrix Grid Area -->
          <div class="flex-1 flex flex-col justify-between py-1">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h4 class="text-lg font-black text-[#0f2942] tracking-tight">
                    {{ room.name }}
                  </h4>
                  <p
                    class="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5"
                  >
                    Premium Quality Verified · Non-Smoking Suite
                  </p>
                </div>
                <span
                  v-if="room.hasBreakfast"
                  class="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100"
                >
                  Breakfast Included
                </span>
              </div>

              <!-- High Contrast Structural Spec Line Track Elements -->
              <div
                class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#0f2942]/80"
              >
                <span
                  class="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                  {{ room.guests }}
                </span>
                <span
                  class="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0V6.75m0 9.75V21m7.5-14.25v14.25M2.25 21h19.5"
                    />
                  </svg>
                  {{ room.beds }}
                </span>
                <span
                  class="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 3.75v16.5h16.5V3.75H3.75Zm16.5 4.5H3.75m16.5 4.5H3.75m16.5 4.5H3.75M11.25 3.75v16.5"
                    />
                  </svg>
                  {{ room.size }}
                </span>
              </div>

              <!-- Amenity Tags Inline Line Structure -->
              <div
                class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 border-t border-slate-50"
              >
                <span
                  v-for="amenity in room.amenities"
                  :key="amenity"
                  class="text-xs text-slate-400 font-medium flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {{ amenity }}
                </span>
              </div>
            </div>

            <div class="pt-4 md:pt-3">
              <button
                class="text-xs text-[#1062b3] font-bold hover:text-blue-700 transition flex items-center gap-1 group/btn cursor-pointer"
              >
                View detailed room specs
                <span
                  class="transform group-hover/btn:translate-x-0.5 transition-transform"
                  >→</span
                >
              </button>
            </div>
          </div>

          <!-- Right Pricing Engine Call To Action Core block -->
          <div
            class="w-full md:w-[150px] flex flex-row md:flex-col justify-between items-center md:items-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-4"
          >
            <div class="md:w-full text-left md:text-right md:mb-6">
              <span
                class="text-[10px] text-slate-400 font-bold block uppercase tracking-widest"
                >Rate From</span
              >
              <div
                class="text-3xl font-black text-[#0f2942] tracking-tight mt-0.5"
              >
                ${{ room.price }}
              </div>
              <div class="text-[10px] text-slate-400 font-medium">
                per night
              </div>
            </div>

            <button
              class="bg-gradient-to-r from-[#1062b3] to-[#1a73e8] hover:from-blue-700 hover:to-blue-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-blue-600/15 hover:shadow-xl hover:shadow-blue-600/25 transition-all whitespace-nowrap cursor-pointer"
            >
              Book This Room
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
