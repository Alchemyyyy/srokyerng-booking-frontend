<script setup>
import { ref } from "vue";

import AppButton from "@/shared/components/AppButton.vue";
import AppInput from "@/shared/components/AppInput.vue";
import AppModal from "@/shared/components/AppModal.vue";
import AppTable from "@/shared/components/AppTable.vue";
import AppTextarea from "@/shared/components/AppTextarea.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import LanguageToggle from "@/shared/components/LanguageToggle.vue";
import ThemeToggle from "@/shared/components/ThemeToggle.vue";

const isModalOpen = ref(false);
const destination = ref("Siem Reap");
const notes = ref("");

const columns = [
  { key: "property", label: "Property" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "price", label: "Price" },
];

const rows = [
  {
    id: 1,
    property: "Angkor Garden Hotel",
    location: "Siem Reap",
    status: "Approved",
    price: "$48/night",
  },
  {
    id: 2,
    property: "Riverside Boutique Stay",
    location: "Phnom Penh",
    status: "Pending",
    price: "$62/night",
  },
  {
    id: 3,
    property: "Coastal Family Resort",
    location: "Kampot",
    status: "Paid",
    price: "$55/night",
  },
];

const statusClass = (status) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "approved") return "status-approved";
  if (normalizedStatus === "paid") return "status-paid";

  return "status-pending";
};
</script>

<template>
  <main class="mx-auto grid w-[min(1120px,calc(100%-32px))] gap-6 py-10">
    <section
      class="rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-8 shadow-(--shadow-panel)"
    >
      <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow">Shared components</p>
          <h1 class="text-(--color-text)">Tailwind component examples</h1>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
      <p class="muted max-w-2xl">
        These examples show how teammates should use shared components with Tailwind utility
        classes and SrokYerng CSS variables.
      </p>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <article
        class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
      >
        <p class="eyebrow">Buttons</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <AppButton size="sm">Small</AppButton>
          <AppButton>Primary</AppButton>
          <AppButton size="lg">Large</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="danger">Danger</AppButton>
          <AppButton loading>Saving</AppButton>
        </div>
      </article>

      <article
        class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
      >
        <p class="eyebrow">Inputs</p>
        <div class="mt-4 grid gap-4">
          <AppInput
            id="destination"
            v-model="destination"
            label="Destination"
            placeholder="Enter destination"
          />
          <AppInput
            id="invalid-date"
            label="Check-in date"
            type="date"
            error="Please choose a valid date."
          />
          <AppTextarea
            id="notes"
            v-model="notes"
            label="Notes"
            placeholder="Add reservation notes"
          />
        </div>
      </article>
    </section>

    <section
      class="rounded-lg border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)"
    >
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="eyebrow">Table</p>
          <h2 class="m-0 text-2xl font-semibold text-(--color-text)">Property overview</h2>
        </div>
        <AppButton variant="secondary" @click="isModalOpen = true">Open modal</AppButton>
      </div>

      <AppTable :columns="columns" :rows="rows">
        <template #cell-status="{ value }">
          <span class="status-badge" :class="statusClass(value)">{{ value }}</span>
        </template>
        <template #cell-price="{ value }">
          <strong class="text-(--color-primary)">{{ value }}</strong>
        </template>
      </AppTable>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <EmptyState
        title="No reservations yet"
        message="Reservations will appear here when customers start booking rooms."
      >
        <template #action>
          <AppButton variant="secondary">Refresh</AppButton>
        </template>
      </EmptyState>

      <article
        class="grid place-items-center rounded-lg border border-(--color-border) bg-(--color-surface) p-8 shadow-(--shadow-card)"
      >
        <LoadingSpinner label="Loading available rooms" />
      </article>
    </section>

    <AppModal :open="isModalOpen" title="Confirm component pattern" @close="isModalOpen = false">
      <p class="m-0 text-(--color-muted)">
        This modal uses shared theme tokens, so it works with light and dark mode without
        hardcoded colors.
      </p>
      <template #footer>
        <AppButton variant="ghost" @click="isModalOpen = false">Cancel</AppButton>
        <AppButton @click="isModalOpen = false">Confirm</AppButton>
      </template>
    </AppModal>
  </main>
</template>
