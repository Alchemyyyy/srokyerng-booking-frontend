<template>
  <main
    class="owner-booking-calendar ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)"
  >
    <header
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t("owner.bookingCalendarPage.title") }}</h1>
        <p class="mt-1 text-sm text-(--color-muted)">
          {{ t("owner.bookingCalendarPage.subtitle") }}
        </p>
      </div>

      <select
        v-model="selectedPropertyId"
        :disabled="propertiesLoading || properties.length === 0"
        class="w-full sm:w-auto border border-(--color-border)/60 bg-(--color-surface) text-(--color-text) rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-(--color-primary) disabled:opacity-50"
      >
        <option value="" disabled>{{ t("owner.bookingCalendarPage.selectProperty") }}</option>
        <option
          v-for="property in properties"
          :key="property.id"
          :value="property.id"
        >
          {{ property.property_name || property.name }}
        </option>
      </select>
    </header>

    <div
      v-if="propertiesLoading"
      class="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-10 text-center text-(--color-muted)"
    >
      <div class="flex items-center justify-center">
        <div
          class="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"
        />
        <span class="ml-3 text-sm font-medium">{{ t("owner.bookingCalendarPage.loadingProperties") }}</span>
      </div>
    </div>

    <div
      v-else-if="propertiesError"
      class="rounded-xl border border-(--color-danger) bg-(--color-danger-soft) px-4 py-3 text-sm text-(--color-danger)"
    >
      {{ propertiesError }}
      <button class="ml-2 underline font-bold" @click="fetchOwnerProperties">
        {{ t("owner.bookingCalendarPage.retry") }}
      </button>
    </div>

    <div
      v-else-if="properties.length === 0"
      class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) px-5 py-10 text-center text-(--color-muted)"
    >
      {{ t("owner.bookingCalendarPage.noProperties") }}
    </div>

    <section
      v-else-if="selectedPropertyId"
      class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
    >
      <AvailabilityCalendar
        :key="selectedPropertyId"
        :property-id="selectedPropertyId"
        mode="owner"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import http from "@/app/api/http";
import AvailabilityCalendar from "../components/AvailabilityCalendar.vue";

const { t } = useI18n({ useScope: "global" });

const properties = ref([]);
const propertiesLoading = ref(false);
const propertiesError = ref(null);
const selectedPropertyId = ref("");

const fetchOwnerProperties = async () => {
  propertiesLoading.value = true;
  propertiesError.value = null;
  try {
    const res = await http.get("/properties/my");
    const data = res?.data?.data ?? res?.data ?? res;
    properties.value = Array.isArray(data) ? data : [];

    if (properties.value.length > 0 && !selectedPropertyId.value) {
      selectedPropertyId.value = properties.value[0].id;
    }
  } catch (err) {
    propertiesError.value =
      err?.response?.data?.message ?? t("owner.bookingCalendarPage.loadError");
    console.error("[OwnerCalendarView] fetchOwnerProperties:", err);
  } finally {
    propertiesLoading.value = false;
  }
};

onMounted(fetchOwnerProperties);
</script>
