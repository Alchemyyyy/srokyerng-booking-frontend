<script setup>
import { computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import AppButton from "@/shared/components/AppButton.vue";
import { usePropertyStore } from "@/modules/properties/store/propertyStore";
import { SparklesIcon, HeartIcon } from "@heroicons/vue/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import { useWishlistStore } from "@/modules/wishlists/store/wishlistStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useToastStore } from "@/shared/store/toastStore";
import placeholderImage from "@/assets/images/properties/placeholder.png";

const props = defineProps({
  selectedCategory: { type: String, default: "all" },
});

const { t } = useI18n({ useScope: "global" });
const router = useRouter();
const propertyStore = usePropertyStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const featuredProperties = computed(() => {
  let list = propertyStore.approvedProperties;
  if (props.selectedCategory && props.selectedCategory !== "all") {
    list = list.filter(
      (p) => String(p.type).toLowerCase() === String(props.selectedCategory).toLowerCase()
    );
  }
  return list.slice(0, 8).map((property) => ({
    id: property.id,
    name: property.name,
    location:
      property.city || property.description || t("home.featured.subtitle"),
    price: property.price,
    rating: property.rating,
    reviews: property.reviews,
    category: property.type,
    image: property.image,
  }));
});

const goToProperty = (propertyId) => {
  router.push({
    name: "public.property-detail",
    params: { id: propertyId },
  });
};

const isSaved = (id) => wishlistStore.isPropertySaved(id);

const toggleSave = async (id, e) => {
  e.stopPropagation();
  if (!authStore.isAuthenticated) {
    toastStore.warning("Please login to save properties to your wishlist");
    return;
  }
  const property = featuredProperties.value.find((p) => p.id === id);
  const propertyName = property ? property.name : "";

  const success = await wishlistStore.toggleWishlist(id);
  if (success) {
    const isNowSaved = wishlistStore.isPropertySaved(id);
    if (isNowSaved) {
      toastStore.success(
        propertyName ? `Added "${propertyName}" to your wishlist!` : "Added to wishlist!"
      );
    } else {
      toastStore.success(
        propertyName ? `Removed "${propertyName}" from your wishlist!` : "Removed from wishlist!"
      );
    }
  } else {
    toastStore.danger(
      propertyName ? `Failed to update wishlist for "${propertyName}"` : "Failed to update wishlist"
    );
  }
};

onMounted(() => {
  if (!propertyStore.approvedProperties.length) {
    propertyStore.fetchApprovedProperties().catch(() => {});
  }
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlists().catch(() => {});
  }
});
</script>

<template>
  <section class="bg-(--color-surface-soft) py-20 px-6 font-sans border-b border-(--color-border)/30">
    <div class="mx-auto max-w-7xl">
      <div class="mb-10 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <span class="text-orange-400">✨</span>
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-(--color-primary)"
            >
              {{ t("home.featured.eyebrow") }}
            </p>
          </div>
          <h2 class="text-3xl font-black text-(--color-text) tracking-tight">
            {{ t("home.featured.title") }}
          </h2>
          <p class="mt-2 text-sm text-(--color-muted)">
            {{ t("home.featured.subtitle") }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'public.properties' }"
          class="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--color-primary) hover:underline md:mt-0"
        >
          <span>{{ t("home.featured.viewAll") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5 transition-transform duration-200 hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </RouterLink>
      </div>

      <div
        v-if="propertyStore.loading"
        class="rounded-3xl border border-(--color-border) bg-(--color-surface-soft) px-6 py-16 text-center text-(--color-muted)"
      >
        <div class="inline-block w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mb-2"></div>
        <p class="text-sm font-semibold">Loading featured properties...</p>
      </div>

      <div
        v-else-if="propertyStore.error"
        class="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-6 py-12 text-center text-rose-600"
      >
        {{ propertyStore.error }}
      </div>

      <div v-else>
        <!-- Empty State Fallback -->
        <div v-if="featuredProperties.length === 0" class="py-20 text-center rounded-[32px] border border-(--color-border)/35 bg-(--color-surface-soft)/40 max-w-2xl mx-auto flex flex-col items-center justify-center px-6">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-(--color-primary-soft) rounded-full text-(--color-primary) mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 13.5a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h3 class="text-lg font-black text-(--color-text) mb-1.5">No stays available</h3>
          <p class="text-xs text-(--color-muted) max-w-sm leading-relaxed font-semibold">
            There are no approved stays listed under this category at the moment. Try selecting another tab or click the explorer link to search all locations.
          </p>
        </div>

        <!-- Properties Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          <article
            v-for="property in featuredProperties"
            :key="property.id"
            class="group cursor-pointer overflow-hidden bg-transparent transition-all duration-300 flex flex-col w-full"
            @click="goToProperty(property.id)"
          >
            <!-- Property Image Section -->
            <div
              class="relative overflow-hidden bg-(--color-surface-soft) shrink-0 w-full aspect-[20/19] rounded-2xl mb-3 border border-(--color-border)/10 shadow-xs group-hover:shadow-md transition-shadow"
            >
              <img
                :src="property.image || placeholderImage"
                :alt="property.name"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <!-- Heart Save Button -->
              <button
                type="button"
                class="absolute top-3 right-3 h-8 w-8 bg-black/30 backdrop-blur-xs hover:bg-black/45 rounded-full flex items-center justify-center border-none active:scale-90 z-20 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                @click="toggleSave(property.id, $event)"
              >
                <HeartIconSolid v-if="isSaved(property.id)" class="h-4.5 w-4.5 text-rose-500 animate-scaleUp" />
                <HeartIcon v-else class="h-4.5 w-4.5 text-white stroke-[2.5] hover:scale-105 transition" />
              </button>

              <!-- Top Left Badges -->
              <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span
                  v-if="property.rating >= 4.8"
                  class="inline-flex items-center gap-1 rounded-full bg-white/95 text-gray-900 font-extrabold px-3 py-1 text-[9px] shadow-md tracking-wider uppercase"
                >
                  <SparklesIcon class="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>Guest favorite</span>
                </span>
                <span
                  v-else-if="!property.rating || property.rating === 0"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white font-extrabold px-3 py-1 text-[9px] shadow-md tracking-wider uppercase"
                >
                  <span>New Listing</span>
                </span>
              </div>
            </div>

            <!-- Property Details Section -->
            <div class="flex flex-col justify-between flex-1 min-w-0 p-0.5">
              <div>
                <div class="flex items-start justify-between gap-3">
                  <h3 class="text-sm font-extrabold text-(--color-text) group-hover:text-(--color-primary) transition-colors duration-200 truncate">
                    {{ property.name }}
                  </h3>
                  <div v-if="property.rating > 0" class="flex items-center gap-1 text-sm font-bold text-(--color-text) shrink-0">
                    <StarIconSolid class="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{{ Number(property.rating).toFixed(1) }}</span>
                  </div>
                  <div v-else class="text-xs font-bold text-(--color-muted) shrink-0">
                    New
                  </div>
                </div>

                <!-- Location & Distance -->
                <p class="text-xs font-semibold text-(--color-muted) mt-1 truncate">
                  {{ property.location }}
                </p>

                <!-- Specifications -->
                <p class="text-xs font-semibold text-(--color-muted) mt-0.5 capitalize truncate">
                  {{ property.category || 'Stay' }} • Free cancellation
                </p>
              </div>

              <!-- Price -->
              <div class="mt-2 flex items-baseline gap-1">
                <span class="text-sm font-black text-(--color-text)">${{ property.price }}</span>
                <span class="text-xs font-normal text-(--color-muted)">/ night</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="mt-12 text-center">
        <RouterLink :to="{ name: 'public.properties' }">
          <AppButton variant="primary" size="lg" class="!rounded-xl gap-2 shadow-xs hover:shadow-md transition-all">
            {{ t("home.featured.exploreAll") }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </AppButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
