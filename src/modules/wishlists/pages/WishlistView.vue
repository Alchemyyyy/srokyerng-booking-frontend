<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useWishlistStore } from "../store/wishlistStore";
import WishlistCard from "../components/WishlistCard.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import AppButton from "@/shared/components/AppButton.vue";
import { HeartIcon } from "@heroicons/vue/24/outline";

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
  <main class="bg-(--color-page) min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-(--color-text) tracking-tight">Your Wishlist</h1>
        <p class="text-(--color-muted) mt-2">Saved properties you want to keep an eye on.</p>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        <div v-for="i in 4" :key="i" class="bg-(--color-surface-soft) h-[320px] rounded-2xl border border-(--color-border)"></div>
      </div>

      <div v-else-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-center">
        {{ error }}
      </div>

      <EmptyState
        v-else-if="items.length === 0"
        title="Your Wishlist is Empty"
        message="You haven't saved any properties yet. Start exploring and click the heart icon to save your favorites."
      >
        <template #action>
          <AppButton @click="goToSearch" class="mt-4 inline-flex items-center gap-2">
            Explore Properties
          </AppButton>
        </template>
        <template #icon>
          <HeartIcon class="w-16 h-16 text-(--color-muted) opacity-50" />
        </template>
      </EmptyState>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <WishlistCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @click="goToProperty"
          @remove="handleRemove"
        />
      </div>
    </div>
  </main>
</template>
