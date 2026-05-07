<script setup>
defineProps({
  showTagline: {
    type: Boolean,
    default: false,
  },
  subtitle: {
    type: String,
    default: "Find your next stay with confidence",
  },
});
</script>

<template>
  <div class="flex items-center gap-3">
    <div
      class="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-(--color-primary) to-(--color-primary-strong) shadow-lg shadow-blue-500/20"
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent_50%)]"></div>
      <svg
        class="relative h-7 w-7 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.75 10.75 12 5.5l7.25 5.25V18A1.75 1.75 0 0 1 17.5 19.75h-11A1.75 1.75 0 0 1 4.75 18v-7.25Z"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <path
          d="M9.25 19.75v-4.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v4.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15.25 9.4a2.35 2.35 0 1 1 4.7 0c0 1.54-2.35 3.8-2.35 3.8s-2.35-2.26-2.35-3.8Z"
          fill="currentColor"
        />
        <circle cx="17.6" cy="9.4" r="0.72" fill="var(--color-primary)" />
      </svg>
    </div>

    <div class="min-w-0">
      <p class="text-sm font-black leading-tight tracking-tight text-(--color-text) sm:text-base">
        SrokYerng Booking
      </p>
      <p v-if="showTagline" class="text-xs text-(--color-muted)">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
