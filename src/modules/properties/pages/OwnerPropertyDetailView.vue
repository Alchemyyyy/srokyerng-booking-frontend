<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { propertyApi } from "../api/property.api";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref("");
const property = ref(null);

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api-srokyerng.devspace.linkpc.net";
const images = ref([]);

const getImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
};

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f0f2f5'/%3E%3Crect x='300' y='160' width='600' height='440' rx='32' ry='32' fill='none' stroke='%23c8cdd6' stroke-width='18'/%3E%3Ccircle cx='460' cy='310' r='60' fill='%23c8cdd6'/%3E%3Cpolygon points='300,600 560,340 720,500 840,380 900,600' fill='%23c8cdd6'/%3E%3C/svg%3E";

const fetchImages = async () => {
  try {
    const res = await propertyApi.getAllPropertyImages(route.params.id);
    const items = Array.isArray(res) ? res : res?.data || [];
    images.value = items.map((img) => ({
      ...img,
      url: getImageUrl(img.image_url),
    }));
  } catch (err) {
    console.error("Failed to load images:", err);
  }
};

const fetchProperty = async () => {
  loading.value = true;
  error.value = "";
  try {
    await authStore.refreshSession();
    const res = await propertyApi.getMyPropertyById(route.params.id);
    const data = Array.isArray(res) ? res[0] : res?.data || res;
    property.value = data;
  } catch (err) {
    error.value = "Failed to load property details.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchProperty();
  await fetchImages();
});
</script>

<template>
  <main class="ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)">
    <!-- Loading -->
    <div v-if="loading" class="py-24 text-center text-(--color-muted) text-sm">
      Loading property details...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-24 text-center text-rose-500 text-sm">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="property" class="space-y-6">
      <!-- Header -->
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div class="flex items-center gap-2 mb-1">
            <button
              @click="router.push({ name: 'owner.properties' })"
              class="text-xs text-(--color-muted) hover:text-(--color-primary) transition"
            >
              ← Properties
            </button>
          </div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ property.property_name }}
          </h1>
          <p class="text-sm text-(--color-muted) mt-1">
            {{ property.city }}, {{ property.province }}, {{ property.country }}
          </p>
        </div>

        <!-- Status Badge -->
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border"
          :class="[
            property.status_name === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : property.status_name === 'pending'
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-100',
          ]"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="[
              property.status_name === 'approved'
                ? 'bg-emerald-500'
                : property.status_name === 'pending'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500',
            ]"
          />
          {{ property.status_name }}
        </span>
      </header>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- ✅ ONE left column only -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 1. Images TOP -->
          <div
            v-if="images.length > 0"
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Property Images
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="img in images"
                :key="img.id"
                class="relative aspect-[4/3] rounded-xl overflow-hidden bg-(--color-surface-soft) group"
              >
                <img
                  :src="img.url"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  v-if="img.is_cover"
                  class="absolute top-2 left-2 bg-(--color-primary) text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                >
                  Cover
                </span>
              </div>
            </div>
          </div>

          <!-- No images yet -->
          <div
            v-else-if="!loading"
            class="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-center space-y-3"
          >
            <div
              class="aspect-[4/3] max-w-xs mx-auto rounded-xl overflow-hidden bg-(--color-surface-soft)"
            >
              <img
                :src="fallbackImage"
                alt="No property images uploaded"
                class="w-full h-full object-cover"
              />
            </div>
            <p class="text-(--color-muted) text-sm">No images uploaded yet.</p>
          </div>

          <!-- 2. Property Information -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Property Information
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Property Name</span
                >
                <span class="font-semibold">{{ property.property_name }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Category</span
                >
                <span class="font-semibold">{{ property.category_name }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >City</span
                >
                <span class="font-semibold">{{ property.city }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Province</span
                >
                <span class="font-semibold">{{ property.province }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Country</span
                >
                <span class="font-semibold">{{ property.country }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Address</span
                >
                <span class="font-semibold">{{ property.address || "-" }}</span>
              </div>
              <div v-if="property.description" class="sm:col-span-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Description</span
                >
                <span class="font-semibold">{{
                  property.description || "-"
                }}</span>
              </div>
            </div>
          </div>

          <!-- 3. Contact Information -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Contact Information
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Phone</span
                >
                <span class="font-semibold">{{
                  property.contact_phone || "-"
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Email</span
                >
                <span class="font-semibold">{{
                  property.contact_email || "-"
                }}</span>
              </div>
            </div>
          </div>

          <!-- 4. Location Coordinates -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Location Coordinates
            </h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Latitude</span
                >
                <span class="font-semibold">{{ property.latitude }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Longitude</span
                >
                <span class="font-semibold">{{ property.longitude }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- ✅ END of left column -->

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Owner Info -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-4"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Owner Information
            </h2>
            <div class="space-y-3 text-sm">
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Name</span
                >
                <span class="font-semibold">{{ property.full_name }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Phone</span
                >
                <span class="font-semibold">{{ property.owner_phone }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                  >Email</span
                >
                <span class="font-semibold">{{ property.owner_email }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-3"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Quick Actions
            </h2>
            <RouterLink
              :to="`/owner/rooms?propertyId=${property.id}`"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-(--color-primary-soft) text-(--color-primary) text-sm font-semibold hover:bg-(--color-primary)/20 transition"
            >
              <span>Manage Rooms</span>
              <span>→</span>
            </RouterLink>
            <button
              @click="router.push({ name: 'owner.properties' })"
              class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-(--color-border) text-(--color-muted) text-sm font-semibold hover:bg-(--color-surface-soft) transition"
            >
              <span>Back to Properties</span>
              <span>→</span>
            </button>
          </div>

          <!-- Timestamps -->
          <div
            class="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-3 text-sm"
          >
            <h2
              class="text-sm font-bold uppercase tracking-wider text-(--color-muted) border-b border-(--color-border) pb-2"
            >
              Timeline
            </h2>
            <div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                >Created</span
              >
              <span class="font-semibold">{{
                new Date(property.created_at).toLocaleDateString()
              }}</span>
            </div>
            <div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-(--color-muted) block mb-0.5"
                >Last Updated</span
              >
              <span class="font-semibold">{{
                new Date(property.updated_at).toLocaleDateString()
              }}</span>
            </div>
          </div>
        </div>
        <!-- ✅ END of right column -->
      </div>
    </div>
  </main>
</template>
