import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { reservationService } from "../services/reservation.service";

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed"];

export const useReservationStore = defineStore("admin-reservations", () => {
  const reservations = ref([]);
  const loading = ref(false);
  const processing = ref(false);
  const error = ref(null);

  const statusFilter = ref("all");
  const searchQuery = ref("");

  // ── Client-side pagination ────────────────────────────────────────────────
  const PAGE_SIZE = 10;
  const currentPage = ref(1);

  const filteredReservations = computed(() => {
    let result = reservations.value;

    if (statusFilter.value !== "all") {
      result = result.filter(
        (r) => r.reservation_status === statusFilter.value,
      );
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      result = result.filter((r) =>
        [
          r.customer_name,
          r.customer_email,
          r.property_name,
          r.room_name,
          r.owner_name,
          String(r.id),
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }

    return result;
  });

  /** Current page slice of filteredReservations — use this in the table */
  const pagedReservations = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return filteredReservations.value.slice(start, start + PAGE_SIZE);
  });

  /** Pagination meta derived from filteredReservations (client-side) */
  const pagination = computed(() => ({
    page: currentPage.value,
    limit: PAGE_SIZE,
    total: filteredReservations.value.length,
    total_pages: Math.max(1, Math.ceil(filteredReservations.value.length / PAGE_SIZE)),
  }));

  const statusCounts = computed(() => {
    const counts = { all: reservations.value.length };
    STATUS_OPTIONS.forEach((status) => {
      counts[status] = reservations.value.filter(
        (r) => r.reservation_status === status,
      ).length;
    });
    return counts;
  });

  const fetchReservations = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await reservationService.getAllReservations();
      const payload = response?.data ?? response;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      reservations.value = items;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load reservations.";
      console.error("Fetch reservations error:", err);
    } finally {
      loading.value = false;
    }
  };

  const updateStatus = async (id, status) => {
    processing.value = true;
    error.value = null;
    try {
      const response = await reservationService.updateReservationStatus(
        id,
        status,
      );
      const updated = response?.data?.data ?? response?.data ?? response;

      const index = reservations.value.findIndex((r) => r.id === id);
      if (index !== -1 && updated) {
        reservations.value[index] = {
          ...reservations.value[index],
          ...updated,
        };
      }
      return true;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update reservation status.";
      console.error("Update reservation status error:", err);
      return false;
    } finally {
      processing.value = false;
    }
  };

  const setStatusFilter = (status) => {
    statusFilter.value = status;
    currentPage.value = 1;
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
    currentPage.value = 1;
  };

  const setPage = (page) => {
    currentPage.value = page;
  };

  return {
    reservations,
    loading,
    processing,
    error,
    statusFilter,
    searchQuery,
    filteredReservations,
    pagedReservations,
    pagination,
    statusCounts,
    fetchReservations,
    updateStatus,
    setStatusFilter,
    setSearchQuery,
    setPage,
  };
});
