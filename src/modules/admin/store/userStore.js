import { defineStore } from "pinia";
import { ref, computed } from "vue";
import adminApi from "../api/admin.api.js";

export const useUserStore = defineStore("admin-users", () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const processing = ref(false);
  const error = ref(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const roleFilter = ref("all");
  const searchQuery = ref("");

  // ── Pagination ────────────────────────────────────────────────────────────
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  const filteredUsers = computed(() => {
    let result = users.value;

    // Filter by role
    if (roleFilter.value !== "all") {
      result = result.filter(
        (u) => String(u.role).toLowerCase() === roleFilter.value,
      );
    }

    // Filter by search query
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
   * Fetch user list
   * GET /users
   * Response: { data: { users: [...], total, page, total_pages } }
   */
  const fetchUsers = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await adminApi.get("/users", {
        params: { page, limit: pagination.value.per_page },
      });

      // Response: { success, message, data: { users: [...] } }
      const payload = res?.data?.data ?? res?.data ?? res;
      const userList = Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload)
          ? payload
          : [];

      users.value = userList;

      // Update pagination if available
      if (payload?.total !== undefined) {
        pagination.value = {
          page: payload.page ?? page,
          per_page: payload.per_page ?? 10,
          total: payload.total ?? userList.length,
          total_pages: payload.total_pages ?? 1,
        };
      }
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
   * Response: { data: { id, full_name, email, ... } }
   */
  const fetchUserDetail = async (id) => {
    loading.value = true;
    error.value = null;
    currentUser.value = null;
    try {
      const res = await adminApi.get(`/users/${id}`);
      currentUser.value = res?.data?.data ?? res?.data ?? res;
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
   * Update user status (active / suspended / banned)
   * PATCH /users/:id/status
   * Body: { status: "active" | "suspended" | "banned" }
   * Response: { data: { id, full_name, status, ... } }
   */
  const updateUserStatus = async (userId, status) => {
    processing.value = true;
    error.value = null;
    try {
      const res = await adminApi.patch(`/users/${userId}/status`, { status });
      const updated = res?.data?.data ?? res?.data ?? null;

      // Update user in list immediately (optimistic)
      const index = users.value.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          status,
          ...(updated ?? {}),
        };
      }

      // Update currentUser if viewing detail
      if (currentUser.value?.id === userId) {
        currentUser.value = { ...currentUser.value, status };
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
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const setPage = (page) => {
    pagination.value.page = page;
    fetchUsers(page);
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
    pagination,

    // Computed
    filteredUsers,
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
