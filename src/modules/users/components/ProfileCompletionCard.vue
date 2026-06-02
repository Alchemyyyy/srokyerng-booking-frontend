<script setup>
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  completionPercent: {
    type: Number,
    required: true,
  },
  completionItems: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="rounded-lg border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <ShieldCheckIcon class="mt-0.5 h-6 w-6 text-(--color-primary)" />
        <div>
          <h3 class="font-bold">Profile completion</h3>
          <p class="mt-1 text-sm text-(--color-muted)">
            Complete your profile so bookings and account updates are easier to manage.
          </p>
        </div>
      </div>
      <span class="text-sm font-bold text-(--color-primary)">
        {{ completionPercent }}%
      </span>
    </div>

    <div class="mt-4 h-2 overflow-hidden rounded-full bg-(--color-surface-soft)">
      <div
        class="h-full rounded-full bg-(--color-primary) transition-all"
        :style="{ width: `${completionPercent}%` }"
      />
    </div>

    <div class="mt-4 grid gap-2">
      <div
        v-for="item in completionItems"
        :key="item.label"
        class="flex items-center justify-between rounded-lg bg-(--color-surface-soft) px-3 py-2 text-sm"
      >
        <span class="font-medium text-(--color-muted)">{{ item.label }}</span>
        <CheckCircleIcon
          v-if="item.complete"
          class="h-5 w-5 text-(--color-success)"
        />
        <XCircleIcon v-else class="h-5 w-5 text-(--color-muted)" />
      </div>
    </div>
  </section>
</template>
