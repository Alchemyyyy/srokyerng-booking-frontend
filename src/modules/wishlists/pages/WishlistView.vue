<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useWishlistStore } from "../store/wishlistStore";
import WishlistCard from "../components/WishlistCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { HeartIcon } from "@heroicons/vue/24/outline";
import PublicNavbar from "@/shared/components/PublicNavbar.vue";
import PublicFooter from "@/shared/components/PublicFooter.vue";

const router = useRouter();
const wishlistStore = useWishlistStore();
const { items, loading, error } = storeToRefs(wishlistStore);

onMounted(() => {
  wishlistStore.fetchWishlists();
});

const goToProperty = (propertyId) => {
  router.push({ name: "public.property-detail", params: { id: propertyId } });
};

const handleRemove = async (propertyId) => {
  await wishlistStore.toggleWishlist(propertyId);
};

const goToSearch = () => {
  router.push({ name: "public.properties" });
};
</script>

<template>
  <div class="min-h-screen bg-(--color-page) flex flex-col">
    <PublicNavbar />
    <main class="flex-1 min-h-screen pt-32 pb-12 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full flex flex-col">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-black text-(--color-text) tracking-tight">Wishlists</h1>
          <p class="text-(--color-muted) text-sm mt-1.5 font-medium">View, explore, and manage your saved properties</p>
        </div>
        <div v-if="!loading && !error && items.length > 0" class="text-sm font-bold text-(--color-text) bg-(--color-surface-soft) border border-(--color-border) px-4 py-2 rounded-full shadow-xs w-fit">
          {{ items.length }} {{ items.length === 1 ? 'saved stay' : 'saved stays' }}
        </div>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-pulse flex-1">
        <div v-for="i in 4" :key="i" class="flex flex-col gap-3">
          <div class="bg-(--color-surface-soft) aspect-[20/19] rounded-2xl"></div>
          <div class="bg-(--color-surface-soft) h-4 w-2/3 rounded-md mt-1"></div>
          <div class="bg-(--color-surface-soft) h-3 w-1/2 rounded-md"></div>
          <div class="bg-(--color-surface-soft) h-4 w-1/3 rounded-md mt-1"></div>
        </div>
      </div>

      <div v-else-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-center font-semibold flex-1 flex items-center justify-center">
        {{ error }}
      </div>

      <div v-else-if="items.length === 0" class="flex-1 py-8 flex flex-col items-center justify-start pt-12 text-center max-w-md mx-auto">
        <div class="h-20 w-20 bg-(--color-surface-soft) rounded-full flex items-center justify-center border border-(--color-border) mb-6">
          <HeartIcon class="w-10 h-10 text-blue-600 dark:text-blue-500" />
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-(--color-text) tracking-tight">Your Wishlist is Empty</h2>
        <p class="text-(--color-muted) mt-3 text-base leading-relaxed">
          You haven't saved any properties yet. Start exploring and click the heart icon on any stay to save your favorites.
        </p>
        <button
          type="button"
          @click="goToSearch"
          class="mt-8 px-8 py-3.5 bg-(--color-primary) hover:opacity-90 text-white text-base font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
        >
          Explore Properties
        </button>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        <WishlistCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @click="goToProperty"
          @remove="handleRemove"
        />
      </div>
    </main>
    <PublicFooter />
  </div>
</template>
