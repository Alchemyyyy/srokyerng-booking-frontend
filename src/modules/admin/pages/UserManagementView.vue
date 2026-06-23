<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { useToastStore } from "@/shared/store/toastStore";
import { useSidebar } from "@/shared/composables/useSidebar";
import { formatDate } from "../utils/formatters.js";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const userStore = useUserStore();
const toastStore = useToastStore();
const { isSidebarOpen } = useSidebar();

// ── Local UI state ────────────────────────────────────────────────────────────
const confirmModal = ref({
  open: false,
  userId: null,
  userName: "",
  action: null,
});

// ── Role tab options ──────────────────────────────────────────────────────────
const roleTabs = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "owner", label: "Owners" },
  { key: "admin", label: "Admins" },
];

// ── Status badge helper ───────────────────────────────────────────────────────
const statusClass = (status) => {
  if (status === "active") return "badge-active";
  if (status === "suspended") return "badge-suspended";
  if (status === "banned") return "badge-banned";
  return "badge-default";
};

const roleClass = (role) => {
  if (role === "admin") return "role-admin";
  if (role === "owner") return "role-owner";
  if (role === "customer") return "role-customer";
  return "role-default";
};

// ── Confirm modal helpers ─────────────────────────────────────────────────────
const openConfirm = (user, action) => {
  confirmModal.value = {
    open: true,
    userId: user.id,
    userName: user.full_name,
    action,
  };
};

const closeConfirm = () => {
  confirmModal.value = {
    open: false,
    userId: null,
    userName: "",
    action: null,
  };
};

const ACTION_META = {
  activate: { label: "Activate", status: "active", color: "btn-approve" },
  suspend: { label: "Suspend", status: "suspended", color: "btn-suspend" },
};

const confirmAction = async () => {
  const { userId, action } = confirmModal.value;
  const meta = ACTION_META[action];
  if (!meta || !userId) return;

  closeConfirm();
  const ok = await userStore.updateUserStatus(userId, meta.status);
  if (ok) {
    toastStore.success(`User ${meta.label.toLowerCase()}d successfully.`);
  } else {
    toastStore.danger(userStore.error || "Failed to update user status.");
  }
};

// ── Actions available per current status ─────────────────────────────────────
const availableActions = (user) => {
  const actions = [];
  if (user.status !== "active") actions.push("activate");
  if (user.status !== "suspended") actions.push("suspend");
  return actions;
};

onMounted(() => userStore.fetchUsers(1));
</script>

<template>
  <div
    class="user-management-container my-25 mx-auto px-6"
    :class="isSidebarOpen ? 'ml-64' : 'ml-20'"
  >
    <!-- Header -->
    <div class="page-header">
      <div class="flex items-center gap-3 mb-1">
        <UsersIcon class="w-6 h-6 text-(--color-primary)" />
        <h1 class="text-2xl font-black tracking-tight text-(--color-text)">
          User Management
        </h1>
      </div>
      <p class="text-sm text-(--color-muted)">
        Review accounts, roles, and account status across all users.
      </p>
    </div>

    <!-- Role tabs + search bar -->
    <div class="table-actions-bar">
      <!-- Role filter tabs -->
      <div class="role-tabs">
        <button
          v-for="tab in roleTabs"
          :key="tab.key"
          class="role-tab"
          :class="{ 'role-tab--active': userStore.roleFilter === tab.key }"
          @click="userStore.setRoleFilter(tab.key)"
        >
          {{ tab.label }}
          <span class="tab-count">{{ userStore.roleCounts[tab.key] }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="search-wrap">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          :value="userStore.searchQuery"
          @input="userStore.setSearchQuery($event.target.value)"
          type="text"
          placeholder="Search by name, email, phone..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="userStore.error && !userStore.loading"
      class="state-card error-card"
    >
      <ExclamationTriangleIcon class="state-icon text-danger" />
      <div class="state-content">
        <h3 class="state-title">Failed to Load Users</h3>
        <p class="state-desc">{{ userStore.error }}</p>
        <button class="btn-retry" @click="userStore.fetchUsers(1)">
          Retry
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="userStore.loading" class="state-card loading-card py-24">
      <div class="loading-spinner" />
      <p class="state-desc mt-3">Loading users...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="userStore.filteredUsers.length === 0"
      class="state-card empty-card"
    >
      <InboxIcon class="state-icon text-(--color-muted)" />
      <h3 class="state-title">No Users Found</h3>
      <p class="state-desc">
        {{
          userStore.searchQuery
            ? "No users match your search."
            : "No users in this category yet."
        }}
      </p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in userStore.filteredUsers"
            :key="user.id"
            class="user-row"
          >
            <!-- User info -->
            <td>
              <div class="user-info">
                <div class="user-avatar">
                  {{ user.full_name?.charAt(0)?.toUpperCase() ?? "?" }}
                </div>
                <div>
                  <p class="user-name">{{ user.full_name }}</p>
                  <p class="user-email">{{ user.email }}</p>
                </div>
              </div>
            </td>

            <td class="text-sm text-(--color-muted)">
              {{ user.phone || "—" }}
            </td>

            <!-- Role -->
            <td>
              <span class="role-badge" :class="roleClass(user.role)">
                {{ user.role }}
              </span>
            </td>

            <!-- Status -->
            <td>
              <span class="status-badge" :class="statusClass(user.status)">
                {{ user.status }}
              </span>
            </td>

            <!-- Last login -->
            <td class="text-sm text-(--color-muted)">
              {{ user.last_login ? formatDate(user.last_login) : "Never" }}
            </td>

            <!-- Joined -->
            <td class="text-sm text-(--color-muted)">
              {{ formatDate(user.created_at) }}
            </td>

            <!-- Actions -->
            <td>
              <div class="action-group">
                <button
                  v-for="action in availableActions(user)"
                  :key="action"
                  class="action-btn"
                  :class="ACTION_META[action].color"
                  :disabled="userStore.processing"
                  @click="openConfirm(user, action)"
                >
                  {{ ACTION_META[action].label }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="userStore.pagination.total_pages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="userStore.pagination.page === 1"
          @click="userStore.setPage(userStore.pagination.page - 1)"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>

        <span class="page-info">
          Page {{ userStore.pagination.page }} of
          {{ userStore.pagination.total_pages }}
          <span class="text-(--color-muted) text-xs ml-1"
            >({{ userStore.pagination.total }} total)</span
          >
        </span>

        <button
          class="page-btn"
          :disabled="
            userStore.pagination.page === userStore.pagination.total_pages
          "
          @click="userStore.setPage(userStore.pagination.page + 1)"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>

  <!-- Confirm Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="confirmModal.open"
        class="modal-overlay"
        @click.self="closeConfirm"
      >
        <div class="modal-box">
          <div
            class="modal-icon-wrap"
            :class="{
              'modal-icon--approve': confirmModal.action === 'activate',
              'modal-icon--suspend': confirmModal.action === 'suspend',
              'modal-icon--ban': confirmModal.action === 'ban',
            }"
          >
            <CheckCircleIcon
              v-if="confirmModal.action === 'activate'"
              class="w-6 h-6"
            />
            <NoSymbolIcon
              v-else-if="confirmModal.action === 'suspend'"
              class="w-6 h-6"
            />
            <ShieldExclamationIcon v-else class="w-6 h-6" />
          </div>

          <h3 class="modal-title">
            {{ ACTION_META[confirmModal.action]?.label }} User?
          </h3>
          <p class="modal-desc">
            Are you sure you want to
            <strong>{{
              ACTION_META[confirmModal.action]?.label?.toLowerCase()
            }}</strong>
            <strong> {{ confirmModal.userName }}</strong
            >? This will immediately change their account status.
          </p>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeConfirm">Cancel</button>
            <button
              class="btn-confirm"
              :class="ACTION_META[confirmModal.action]?.color"
              @click="confirmAction"
            >
              {{ ACTION_META[confirmModal.action]?.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.user-management-container {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

/* Actions bar */
.table-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Role tabs */
.role-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.role-tab:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.role-tab--active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-count {
  background: var(--color-border);
  border-radius: 999px;
  padding: 0 6px;
  font-size: 0.68rem;
}

.role-tab--active .tab-count {
  background: var(--color-primary);
  color: white;
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--color-muted);
  pointer-events: none;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  width: 280px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

/* State cards */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  gap: 0.75rem;
}

.state-icon {
  width: 2.5rem;
  height: 2.5rem;
  opacity: 0.5;
}
.state-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.state-desc {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0;
}
.btn-retry {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-retry:hover {
  text-decoration: underline;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(55, 138, 221, 0.15);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Table */
.table-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.user-table thead tr {
  background: var(--color-surface-soft);
  border-bottom: 1px solid var(--color-border);
}

.user-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-muted);
  white-space: nowrap;
}

.user-row {
  border-bottom: 1px solid var(--color-border);
  transition: background 0.12s;
}
.user-row:last-child {
  border-bottom: none;
}
.user-row:hover {
  background: var(--color-surface-soft);
}

.user-table td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
}

/* User info cell */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.user-email {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
}

/* Badges */
.status-badge,
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid transparent;
}

.badge-active {
  background: rgba(29, 158, 117, 0.1);
  color: #1d9e75;
  border-color: rgba(29, 158, 117, 0.25);
}
.badge-suspended {
  background: rgba(239, 159, 39, 0.1);
  color: #c97c0a;
  border-color: rgba(239, 159, 39, 0.25);
}
.badge-banned {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-danger, #dc3545);
  border-color: rgba(220, 53, 69, 0.25);
}
.badge-default {
  background: var(--color-surface-soft);
  color: var(--color-muted);
}

.role-admin {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border-color: rgba(139, 92, 246, 0.25);
}
.role-owner {
  background: rgba(55, 138, 221, 0.1);
  color: var(--color-primary);
  border-color: rgba(55, 138, 221, 0.25);
}
.role-customer {
  background: rgba(29, 158, 117, 0.1);
  color: #1d9e75;
  border-color: rgba(29, 158, 117, 0.2);
}
.role-default {
  background: var(--color-surface-soft);
  color: var(--color-muted);
}

/* Action buttons */
.action-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-approve {
  background: rgba(29, 158, 117, 0.1);
  color: #1d9e75;
  border-color: rgba(29, 158, 117, 0.3);
}
.btn-approve:hover {
  background: #1d9e75;
  color: white;
}

.btn-suspend {
  background: rgba(239, 159, 39, 0.1);
  color: #c97c0a;
  border-color: rgba(239, 159, 39, 0.3);
}
.btn-suspend:hover {
  background: #c97c0a;
  color: white;
}

.btn-ban {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-danger, #dc3545);
  border-color: rgba(220, 53, 69, 0.3);
}
.btn-ban:hover {
  background: var(--color-danger, #dc3545);
  color: white;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.page-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-info {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Confirm Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
}

.modal-icon-wrap {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.modal-icon--approve {
  background: rgba(29, 158, 117, 0.1);
  color: #1d9e75;
}
.modal-icon--suspend {
  background: rgba(239, 159, 39, 0.1);
  color: #c97c0a;
}
.modal-icon--ban {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-danger, #dc3545);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}
.modal-desc {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.65rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancel:hover {
  background: var(--color-border);
}

.btn-confirm {
  flex: 1;
  padding: 0.65rem;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
