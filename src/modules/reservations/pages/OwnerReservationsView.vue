<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppTable from "@/shared/components/AppTable.vue";
import TablePagination from "@/modules/owner/components/TablePagination.vue";
import LoadingSpinner from "@/shared/components/LoadingSpinner.vue";
import OwnerLoadingState from "@/modules/owner/components/OwnerLoadingState.vue";
import { reservationApi } from "../api/reservation.api";

const router = useRouter();
const { t, te } = useI18n({ useScope: "global" });
const safeT = (key, fallback) => (te(key) ? t(key) : fallback);
const statusLabel = (value) => safeT(`common.status.${String(value).toLowerCase()}`, value);

const loading = ref(true);
const error = ref("");
const recentReservations = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;

const reservationColumns = computed(() => [
  { key: "id", label: t("owner.reservationsPage.columns.bookingId") },
  { key: "guestName", label: t("owner.reservationsPage.columns.guest") },
  { key: "propertyName", label: t("owner.reservationsPage.columns.property") },
  { key: "amount", label: t("owner.reservationsPage.columns.amount") },
  { key: "checkIn", label: t("owner.reservationsPage.columns.date") },
  { key: "status", label: t("owner.reservationsPage.columns.status") },
]);

const stats = computed(() => {
  const totalEarnings = recentReservations.value.reduce(
    (sum, reservation) => sum + Number(reservation.amount || 0),
    0,
  );

  const pendingCount = recentReservations.value.filter(
    (reservation) =>
      String(reservation.status || "").toLowerCase() === "pending",
  ).length;

  return {
    totalEarnings,
    totalBookings: recentReservations.value.length,
    pendingCount,
  };
});

const totalPages = computed(() =>
  Math.ceil(recentReservations.value.length / itemsPerPage) || 1,
);

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return recentReservations.value.slice(start, start + itemsPerPage);
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const normalizeReservations = (items = []) =>
  items.map((item, index) => ({
    id: item.id || `res-${index + 1}`,
    guestName: item.customer_name || item.customerName || "Unknown guest",
    propertyName: item.property_name || item.propertyName || "Unknown property",
    amount: Number(item.total_amount || item.amount || 0),
    checkIn: item.check_in_date || item.checkIn || "-",
    checkOut: item.check_out_date || item.checkOut || "",
    status: item.reservation_status || item.status || "pending",
  }));

const fetchReservations = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await reservationApi.listOwnerReservations();
    const items = Array.isArray(response) ? response : response?.data || [];
    recentReservations.value = normalizeReservations(items);
    currentPage.value = 1;
  } catch (requestError) {
    error.value = requestError?.message || t("owner.reservationsPage.loadError");
    recentReservations.value = [];
  } finally {
    loading.value = false;
  }
};

const goToReservationDetail = (row) => {
  router.push({ name: "owner.reservation-detail", params: { id: row.id } });
};

onMounted(fetchReservations);
</script>

<template>
  <main
    class="owner-reservations ml-64 mt-25 min-h-screen px-6 pb-10 text-(--color-text)"
  >
    <header
      class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t("owner.reservationsPage.title") }}</h1>
        <p class="mt-1 text-sm text-(--color-muted)">
          {{ t("owner.reservationsPage.subtitle") }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold transition hover:bg-(--color-surface-soft)"
        :disabled="loading"
        @click="fetchReservations"
      >
        <LoadingSpinner v-if="loading" class="h-4 w-4" />
        <span>{{ loading ? t("owner.reservationsPage.refreshing") : t("owner.reservationsPage.refresh") }}</span>
      </button>
    </header>

    <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div
        class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
      >
        <span
          class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
        >
          {{ t("owner.reservationsPage.totalEarnings") }}
        </span>
        <h3 class="mt-1 text-2xl font-bold">
          ${{ formatCurrency(stats.totalEarnings) }}
        </h3>
      </div>

      <div
        class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
      >
        <span
          class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
        >
          {{ t("owner.reservationsPage.totalBookings") }}
        </span>
        <h3 class="mt-1 text-2xl font-bold">{{ stats.totalBookings }}</h3>
      </div>

      <div
        class="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-card)"
      >
        <span
          class="text-[11px] font-bold uppercase tracking-wider text-(--color-muted)"
        >
          {{ t("owner.reservationsPage.pendingAction") }}
        </span>
        <h3 class="mt-1 text-2xl font-bold">{{ stats.pendingCount }}</h3>
      </div>
    </section>

    <section class="space-y-4">
      <div
        v-if="error"
        class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600"
      >
        {{ error }}
      </div>

      <OwnerLoadingState v-if="loading" :label="t('owner.reservationsPage.loading')" />

      <div
        v-else-if="recentReservations.length === 0"
        class="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) px-5 py-10 text-center text-(--color-muted)"
      >
        {{ t("owner.reservationsPage.noReservations") }}
      </div>

      <AppTable
        v-else
        :columns="reservationColumns"
        :rows="paginatedReservations"
        clickable
        @row-click="goToReservationDetail"
      >
        <template #cell-amount="{ value }">
          <span class="font-semibold">${{ formatCurrency(value) }}</span>
        </template>

        <template #cell-status="{ value }">
          <span
            class="inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
            :class="[
              String(value).toLowerCase() === 'confirmed'
                ? 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)'
                : '',
              String(value).toLowerCase() === 'completed'
                ? 'border-(--color-border) bg-(--color-surface-soft) text-(--color-muted)'
                : '',
              String(value).toLowerCase() === 'cancelled'
                ? 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)'
                : '',
              String(value).toLowerCase() === 'pending'
                ? 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)'
                : '',
            ]"
          >
            {{ statusLabel(value) }}
          </span>
        </template>

        <template #cell-checkIn="{ row }">
          <div class="flex flex-col">
            <span>{{ formatDate(row.checkIn) }}</span>
            <span v-if="row.checkOut" class="text-xs text-(--color-muted)">
              {{ t("owner.reservationsPage.to") }} {{ formatDate(row.checkOut) }}
            </span>
          </div>
        </template>
      </AppTable>

      <TablePagination
        v-if="recentReservations.length > 0"
        v-model:currentPage="currentPage"
        :totalPages="totalPages"
      />
    </section>
  </main>
</template>
