<script setup>
import { computed, ref, watch } from "vue";
import { resolveAssetUrl } from "@/shared/utils/assetUrl";

const props = defineProps({
  name: {
    type: String,
    default: "User",
  },
  src: {
    type: String,
    default: "",
  },
  sizeClass: {
    type: String,
    default: "h-10 w-10",
  },
});

const imageFailed = ref(false);

const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || "U");
const imageUrl = computed(() =>
  imageFailed.value ? "" : resolveAssetUrl(props.src),
);

const handleImageError = () => {
  imageFailed.value = true;
};

watch(
  () => props.src,
  () => {
    imageFailed.value = false;
  },
);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--color-primary-soft) font-bold text-(--color-primary)"
    :class="sizeClass"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="name"
      class="h-full w-full object-cover"
      @error="handleImageError"
    />
    <span v-else>{{ initial }}</span>
  </span>
</template>
