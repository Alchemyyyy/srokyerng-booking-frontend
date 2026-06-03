<template>
  <div
    class="bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden flex flex-col animate-pulse"
  >
    <!-- Image skeleton -->
    <div class="aspect-[4/3] w-full bg-(--color-surface-soft)" />

    <div class="p-4 flex-1 flex flex-col gap-3">
      <!-- Title -->
      <div class="h-4 w-3/4 rounded-md bg-(--color-surface-soft)" />
      <!-- Location -->
      <div class="h-3 w-1/2 rounded-md bg-(--color-surface-soft)" />

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-1 mt-2">
        <div class="h-6 rounded-md bg-(--color-surface-soft)" />
        <div class="h-6 rounded-md bg-(--color-surface-soft)" />
        <div class="h-6 rounded-md bg-(--color-surface-soft)" />
      </div>

      <!-- Buttons -->
      <div
        class="flex items-center gap-1.5 mt-4 pt-3 border-t border-(--color-border)"
      >
        <div class="h-8 flex-1 rounded-lg bg-(--color-surface-soft)" />
        <div class="h-8 flex-1 rounded-lg bg-(--color-surface-soft)" />
        <div class="h-8 flex-1 rounded-lg bg-(--color-surface-soft)" />
        <div class="h-8 w-8 rounded-lg bg-(--color-surface-soft)" />
      </div>
    </div>
  </div>
</template>
