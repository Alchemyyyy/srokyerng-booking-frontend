import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userService } from "../services/user.service.js";

export const useUserStore = defineStore("admin-users", () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const users = ref([]);           // full dataset fetched from API
  const currentUser = ref(null);
  const loading = ref(false);
  const processing = ref(false);
  const error = ref(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const roleFilter = ref("all");
  const searchQuery = ref("");

  // ── Client-side pagination ────────────────────────────────────────────────
  const PAGE_SIZE = 10;
  const currentPage = ref(1);

  // ── Computed ──────────────────────────────────────────────────────────────

  /** Full filtered list — used for counts, search, and paging */
  const filteredUsers = computed(() => {
    let result = users.value;

    if (roleFilter.value !== "all") {
      result = result.filter(
        (u) => String(u.role).toLowerCase() === roleFilter.value,
      );
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      result = result.filter((u) =>
        [u.full_name, u.email, u.phone, String(u.id)]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }

    return result;
  });

  /** Current page slice of filteredUsers — use this in the table */
  const pagedUsers = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return filteredUsers.value.slice(start, start + PAGE_SIZE);
  });

  /** Pagination meta derived from filteredUsers (client-side) */
  const pagination = computed(() => ({
    page: currentPage.value,
    limit: PAGE_SIZE,
    total: filteredUsers.value.length,
    total_pages: Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)),
  }));

  /** Role counts always reflect the full unfiltered dataset */
  const roleCounts = computed(() => ({
    all: users.value.length,
    customer: users.value.filter(
      (u) => String(u.role).toLowerCase() === "customer",
    ).length,
    owner: users.value.filter((u) => String(u.role).toLowerCase() === "owner")
      .length,
    admin: users.value.filter((u) => String(u.role).toLowerCase() === "admin")
      .length,
  }));

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fetch ALL users across all pages so filters & counts work on the full dataset.
   * Fetches page 1 first to discover total_pages, then fetches remaining pages
   * in parallel and merges all results. Client-side pagination slices into PAGE_SIZE.
   */
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const API_LIMIT = 20; // API's max allowed limit per page

      // Fetch first page to get total_pages
      const firstRes = await userService.getAllUsers({ page: 1, limit: API_LIMIT });
      const firstBody = firstRes?.data ?? firstRes;
      const firstPage = Array.isArray(firstBody?.users) ? firstBody.users : [];
      const totalPages = firstBody?.pagination?.total_pages ?? 1;

      // Fetch remaining pages in parallel
      let allUsers = [...firstPage];
      if (totalPages > 1) {
        const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const rest = await Promise.all(
          pageNums.map((p) => userService.getAllUsers({ page: p, limit: API_LIMIT }))
        );
        for (const res of rest) {
          const body = res?.data ?? res;
          const pageUsers = Array.isArray(body?.users) ? body.users : [];
          allUsers = allUsers.concat(pageUsers);
        }
      }

      users.value = allUsers;
      currentPage.value = 1;
    } catch (err) {
      error.value =
        err?.response?.data?.message || err?.message || "Failed to load users.";
      console.error("[userStore] fetchUsers:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch single user detail
   * GET /users/:id
   */
  const fetchUserDetail = async (id) => {
    loading.value = true;
    error.value = null;
    currentUser.value = null;
    try {
      const res = await userService.getUser(id);
      // http interceptor unwraps response.data → { success, data: {...} }
      currentUser.value = res?.data ?? res;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load user detail.";
      console.error("[userStore] fetchUserDetail:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update user status
   * PATCH /users/:id/status  { status }
   */
  const updateUserStatus = async (userId, status) => {
    processing.value = true;
    error.value = null;
    try {
      const res = await userService.updateUserStatus(userId, status);
      // http interceptor unwraps response.data → { success, data: {...} }
      const updated = res?.data ?? null;

      // Update in full users array (keeps filters/counts correct)
      const index = users.value.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          status,
          ...(updated ?? {}),
        };
      }

      // Update currentUser if the detail modal is open
      if (currentUser.value?.id === userId) {
        currentUser.value = { ...currentUser.value, status, ...(updated ?? {}) };
      }

      return true;
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user status.";
      console.error("[userStore] updateUserStatus:", err);
      return false;
    } finally {
      processing.value = false;
    }
  };

  // ── Filter & pagination helpers ───────────────────────────────────────────

  const setRoleFilter = (role) => {
    roleFilter.value = role;
    currentPage.value = 1; // reset to page 1 on filter change
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
    currentPage.value = 1; // reset to page 1 on search change
  };

  const setPage = (page) => {
    currentPage.value = page;
  };

  return {
    // State
    users,
    currentUser,
    loading,
    processing,
    error,

    // Filters
    roleFilter,
    searchQuery,

    // Computed
    filteredUsers,
    pagedUsers,
    pagination,
    roleCounts,

    // Actions
    fetchUsers,
    fetchUserDetail,
    updateUserStatus,
    setRoleFilter,
    setSearchQuery,
    setPage,
  };
});