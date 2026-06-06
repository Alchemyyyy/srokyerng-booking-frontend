<template>
  <div class="rating-stars" :class="[sizeClass, { 'readonly': readonly }]">
    <span
      v-for="star in 5"
      :key="star"
      class="star-wrap"
      @mouseover="!readonly && (hover = star)"
      @mouseleave="!readonly && (hover = 0)"
      @click="!readonly && setRating(star)"
    >
      <!-- Background (empty) star -->
      <span class="star star-empty">★</span>
      <!-- Filled star with clip -->
      <span
        class="star star-filled"
        :style="getStarStyle(star)"
      >★</span>
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: 'md' }
})

const emit = defineEmits(['update:modelValue'])
const hover = ref(0)

const sizeClass = computed(() => {
  const map = { sm: 'stars-sm', md: 'stars-md', lg: 'stars-lg', xl: 'stars-xl' }
  return map[props.size] || 'stars-md'
})

const displayValue = computed(() => hover.value || props.modelValue)

const getStarStyle = (star) => {
  const val = displayValue.value
  if (val >= star) return { clipPath: 'inset(0 0% 0 0)' }
  if (val >= star - 1) {
    const percent = (val - (star - 1)) * 100
    return { clipPath: `inset(0 ${100 - percent}% 0 0)` }
  }
  return { clipPath: 'inset(0 100% 0 0)' }
}

const setRating = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.rating-stars {
  display: inline-flex;
  gap: 2px;
  align-items: center;
}

.star-wrap {
  position: relative;
  display: inline-block;
  cursor: pointer;
  line-height: 1;
}

.readonly .star-wrap {
  cursor: default;
}

.star {
  display: block;
  line-height: 1;
}

.star-empty {
  color: #dde1e7;
}

.star-filled {
  position: absolute;
  top: 0;
  left: 0;
  color: #f59e0b;
  transition: clip-path 0.1s ease;
}

/* Sizes */
.stars-sm .star-wrap { font-size: 0.9rem; }
.stars-md .star-wrap { font-size: 1.2rem; }
.stars-lg .star-wrap { font-size: 1.6rem; }
.stars-xl .star-wrap { font-size: 2.2rem; }

.rating-stars:not(.readonly) .star-wrap:hover .star-empty,
.rating-stars:not(.readonly) .star-wrap:hover ~ .star-wrap .star-empty {
  color: #fcd34d;
}
</style>