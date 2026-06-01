<template>
  <div
    class="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm"
  >
    <div class="flex flex-col sm:flex-row">
      <div class="w-full sm:w-[200px] h-48 sm:h-auto bg-(--color-surface-soft) animate-pulse"></div>

      <div class="flex-1 p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2">
            <div class="h-5 w-44 rounded bg-(--color-surface-soft) animate-pulse"></div>
            <div class="h-3 w-32 rounded bg-(--color-surface-soft) animate-pulse"></div>
          </div>
          <div class="h-6 w-20 rounded-full bg-(--color-surface-soft) animate-pulse"></div>
        </div>

        <div class="mt-4 flex gap-4">
          <div class="h-4 w-24 rounded bg-(--color-surface-soft) animate-pulse"></div>
          <div class="h-4 w-20 rounded bg-(--color-surface-soft) animate-pulse"></div>
        </div>

        <div class="mt-4 h-4 w-36 rounded bg-(--color-surface-soft) animate-pulse"></div>
        <div class="mt-3 space-y-2">
          <div class="h-3 w-full rounded bg-(--color-surface-soft) animate-pulse"></div>
          <div class="h-3 w-5/6 rounded bg-(--color-surface-soft) animate-pulse"></div>
        </div>

        <div class="mt-5 flex items-center justify-between">
          <div class="h-9 w-28 rounded-lg bg-(--color-surface-soft) animate-pulse"></div>
          <div class="h-9 w-9 rounded-lg bg-(--color-surface-soft) animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>
