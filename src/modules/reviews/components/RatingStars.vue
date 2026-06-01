<template>
  <div class="rating-stars">
    <button
      v-for="star in 5"
      :key="star"
      class="star-btn"
      :class="{ active: star <= (hovered || modelValue) }"
      @click="$emit('update:modelValue', star)"
      @mouseover="hovered = star"
      @mouseleave="hovered = 0"
      type="button"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </button>
    <span class="rating-label" v-if="modelValue > 0">
      {{ labels[modelValue - 1] }}
    </span>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  modelValue: { type: Number, default: 0 },
});

defineEmits(["update:modelValue"]);

const hovered = ref(0);
const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
</script>

<style scoped>
.rating-stars {
  display: flex;
  align-items: center;
  gap: 4px;
}
.star-btn {
  border: none;
  background: transparent;
  width: 36px; height: 36px;
  padding: 0; cursor: pointer;
  color: #d1d5db;
  transition: color 0.15s ease, transform 0.15s ease;
  display: flex; align-items: center; justify-content: center;
}
.star-btn svg { width: 28px; height: 28px; }
.star-btn:hover { transform: scale(1.15); }
.star-btn.active { color: #f59e0b; }
.rating-label {
  margin-left: 10px;
  font-size: 14px; font-weight: 600;
  color: #1a56db;
}
</style>