<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import RoomFilter from "@/modules/rooms/components/RoomFilter.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import http from "@/app/api/http";

const route = useRoute();
const router = useRouter();
const propertyId = route.params.propertyId;

const loading = ref(false);
const property = ref(null);
const rooms = ref([]);

onMounted(async () => {
  loading.value = true;
  try {
    const propRes = await http.get(`/properties/${propertyId}`);
    const p = propRes.data?.data || propRes.data;
    property.value = {
      name: p.property_name || p.name,
      city: p.city,
      rating: p.average_rating || 0,
      reviewsCount: p.review_count || p.reviews || 0,
      image: p.cover_image,
    };

    const roomsRes = await http.get(`/properties/${propertyId}/rooms`);
    const rawRooms = roomsRes.data?.data || roomsRes.data || [];
    const BASE_URL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"
    ).replace(/\/api\/?$/, "");

    // Fetch images for all rooms in parallel
    const roomsWithImages = await Promise.all(
      rawRooms.map(async (r) => {
        let image =
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80";

        try {
          const imgRes = await http.get(`/rooms/${r.id}/images`);
          const images = imgRes.data?.data || imgRes.data || [];

          // Prefer cover image, fallback to first image
          const cover = images.find((img) => img.is_cover === 1) || images[0];
          if (cover?.image_url) {
            image = `${BASE_URL}${cover.image_url}`;
          }
        } catch {
          // keep fallback image
        }

        return {
          id: r.id,
          name: r.room_name,
          type: r.type_name || "",
          price: r.price_per_night || 0,
          guests: r.max_guests || 2,
          description: r.description || "",
          image,
          amenities: [],
        };
      }),
    );

    rooms.value = roomsWithImages;
  } catch (err) {
    console.error("Failed to load rooms:", err);
  } finally {
    loading.value = false;
  }
});
const filters = ref({
  priceRange: 150,
  selectedCapacity: "2 Guests",
  selectedFacilities: [],
  sortBy: "Recommended",
});

const resetFilters = () => {
  filters.value = {
    priceRange: 150,
    selectedCapacity: "2 Guests",
    selectedFacilities: [],
    sortBy: "Recommended",
  };
};

const filteredRooms = computed(() => {
  let result = rooms.value;
  result = result.filter((r) => r.price <= filters.value.priceRange);
  const capMap = { "1 Guest": 1, "2 Guests": 2, "3 Guests": 3, "4+ Guests": 4 };
  const minGuests = capMap[filters.value.selectedCapacity] || 0;
  result = result.filter((r) =>
    filters.value.selectedCapacity === "4+ Guests"
      ? r.guests >= 4
      : r.guests >= minGuests,
  );
  if (filters.value.sortBy === "Price: Low to High")
    result = [...result].sort((a, b) => a.price - b.price);
  else if (filters.value.sortBy === "Price: High to Low")
    result = [...result].sort((a, b) => b.price - a.price);
  return result;
});
</script>
<template>
  <div
    style="
      background-color: var(--color-page);
      color: var(--color-text);
      font-family: var(--font-main);
    "
    class="min-h-screen antialiased pb-20 transition-colors duration-300"
  >
    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-6 pt-30 text-xs font-medium">
      <div style="color: var(--color-muted)" class="flex items-center gap-2">
        <RouterLink
          :to="{ name: 'public.home' }"
          class="hover:opacity-80 transition"
          >Home</RouterLink
        >
        <span>/</span>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="hover:opacity-80 transition"
          >Properties</RouterLink
        >
        <span>/</span>
        <span style="color: var(--color-text)" class="font-semibold">{{
          property?.name || ""
        }}</span>
      </div>
    </div>

    <!-- Hotel Hero -->
    <div class="max-w-7xl mx-auto px-6 mt-4 mb-10">
      <div
        style="
          background-color: var(--color-surface);
          border-color: var(--color-border);
          box-shadow: var(--shadow-panel);
          border-radius: var(--radius-panel);
        "
        class="border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300"
      >
        <div class="space-y-4 max-w-xl">
          <div
            style="
              background-color: var(--color-surface-soft);
              border-color: var(--color-border);
              color: var(--color-muted);
            "
            class="inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[11px] font-bold"
          >
            <span v-if="property?.rating > 0" class="inline-flex items-center gap-1.5">
              <span class="text-amber-400">★</span> {{ Number(property.rating).toFixed(1) }}
              <span style="color: var(--color-border)">|</span>
              <span>{{ property.reviewsCount }} Verified Reviews</span>
            </span>
            <span v-else class="inline-flex items-center gap-1">
              <span>🌱 New Listing</span>
            </span>
          </div>
          <h1
            style="font-family: var(--font-secondary)"
            class="text-2xl md:text-3xl font-bold tracking-tight leading-tight"
          >
            Available Rooms at <br />
            <span style="color: var(--color-primary)">{{
              property?.name || "Loading..."
            }}</span>
          </h1>
          <p
            style="color: var(--color-muted)"
            class="text-xs font-medium flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-3.5 h-3.5 opacity-70"
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
        <div
          style="
            border-radius: var(--radius-md);
            border-color: var(--color-border);
          "
          class="w-full md:w-[45%] h-48 md:h-52 rounded-xl overflow-hidden border flex-shrink-0"
        >
          <img
            :src="
              property?.image
                ? `${BASE_URL}${property.image}`
                : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80'
            "
            alt="Room Cover View"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div
      class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"
    >
      <!-- ✅ RoomFilter Component -->
      <RoomFilter v-model="filters" @reset="resetFilters" />

      <!-- Rooms List -->
      <main class="lg:col-span-3 space-y-4">
        <!-- Sort Header -->
        <div
          style="
            background-color: var(--color-surface);
            border-color: var(--color-border);
            box-shadow: var(--shadow-card);
            border-radius: var(--radius-md);
          "
          class="flex items-center justify-between px-4 py-3 border transition-colors duration-300"
        >
          <div>
            <h3
              style="color: var(--color-muted)"
              class="text-[11px] font-bold uppercase tracking-wider"
            >
              Available Configurations
            </h3>
            <p style="color: var(--color-muted)" class="text-[11px] mt-0.5">
              {{ filteredRooms.length }} room{{
                filteredRooms.length !== 1 ? "s" : ""
              }}
              found
            </p>
          </div>
          <div class="relative flex items-center gap-1.5 text-xs">
            <span style="color: var(--color-muted)" class="font-medium"
              >Sort by:</span
            >
            <select
              :value="filters.sortBy"
              @change="filters.sortBy = $event.target.value"
              style="color: var(--color-text)"
              class="bg-transparent font-bold outline-none pr-4 appearance-none cursor-pointer"
            >
              <option :style="{ backgroundColor: 'var(--color-surface)' }">
                Recommended
              </option>
              <option :style="{ backgroundColor: 'var(--color-surface)' }">
                Price: Low to High
              </option>
              <option :style="{ backgroundColor: 'var(--color-surface)' }">
                Price: High to Low
              </option>
            </select>
            <span
              style="color: var(--color-muted)"
              class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[8px]"
              >▼</span
            >
          </div>
        </div>

        <!-- Room Cards -->
        <div v-if="loading" class="flex justify-center py-20">
          <LoadingSpinner />
        </div>

        <template v-else>
          <div
            v-for="room in filteredRooms"
            :key="room.id"
            style="
              background-color: var(--color-surface);
              border-color: var(--color-border);
              box-shadow: var(--shadow-card);
              border-radius: var(--radius-md);
            "
            class="border overflow-hidden p-4 flex flex-col md:flex-row gap-6 items-stretch hover:opacity-95 transition-all duration-300"
          >
            <!-- Image -->
            <div
              style="border-radius: var(--radius-sm)"
              class="w-full md:w-[240px] aspect-[4/3] md:h-auto overflow-hidden flex-shrink-0 relative"
            >
              <img
                :src="room.image"
                :alt="room.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 flex flex-col justify-between py-1">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h4
                      style="color: var(--color-text)"
                      class="text-base font-bold tracking-tight"
                    >
                      {{ room.name }}
                    </h4>
                    <p
                      style="color: var(--color-muted)"
                      class="text-[11px] font-medium mt-0.5"
                    >
                      {{
                        [room.type, room.description || "Available room"]
                          .filter(Boolean)
                          .join(" · ")
                      }}
                    </p>
                  </div>
                </div>

                <!-- Specs -->
                <div
                  style="color: var(--color-muted)"
                  class="flex flex-wrap items-center gap-2 text-[11px] font-medium"
                >
                  <span
                    style="
                      background-color: var(--color-surface-soft);
                      border-color: var(--color-border);
                    "
                    class="border px-2 py-1 rounded"
                  >
                    {{ room.guests }} Guests
                  </span>
                </div>
              </div>

              <div class="pt-4 md:pt-0">
                <RouterLink
                  :to="{ name: 'public.room-detail', params: { id: room.id } }"
                  style="color: var(--color-primary)"
                  class="text-[11px] font-bold hover:opacity-80 transition flex items-center gap-1 cursor-pointer"
                >
                  View detailed room specs →
                </RouterLink>
              </div>
            </div>

            <!-- Price & Book -->
            <div
              style="border-color: var(--color-surface-soft)"
              class="w-full md:w-[160px] flex flex-row md:flex-col justify-between items-center md:items-end md:justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 gap-4"
            >
              <div class="md:w-full text-left md:text-right md:mb-4">
                <span
                  style="color: var(--color-muted)"
                  class="text-[10px] font-bold block uppercase tracking-widest"
                  >Rate From</span
                >
                <div
                  style="color: var(--color-text)"
                  class="text-2xl font-bold tracking-tight"
                >
                  ${{ room.price }}
                </div>
                <div
                  style="color: var(--color-muted)"
                  class="text-[10px] font-medium"
                >
                  per night
                </div>
              </div>
              <RouterLink
                :to="{ name: 'public.room-detail', params: { id: room.id } }"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text-inverse)',
                }"
                class="w-full md:w-auto hover:opacity-90 font-bold text-xs px-5 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-center"
              >
                Book Room
              </RouterLink>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredRooms.length === 0"
            style="
              background-color: var(--color-surface);
              border-color: var(--color-border);
            "
            class="border border-dashed rounded-2xl p-16 text-center"
          >
            <p style="color: var(--color-muted)" class="text-sm font-medium">
              No rooms match your filters. Try adjusting your criteria.
            </p>
            <button
              @click="resetFilters"
              style="color: var(--color-primary)"
              class="text-xs font-bold mt-3 hover:opacity-80 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
