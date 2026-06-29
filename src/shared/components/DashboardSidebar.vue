<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSidebar } from "@/shared/composables/useSidebar";
import { useTheme } from "@/modules/admin/composables/useTheme";
import { useAuthStore } from "@/modules/auth/store/authStore"; // 🍍 ភ្ជាប់ AuthStore ពិតប្រាកដ
import AppModal from "@/shared/components/AppModal.vue";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  menuItems: Array,
  bottomItems: {
    type: Array,
    default: () => [],
  },
  logo: String,
  title: {
    type: String,
    default: "ស្រុកយើង",
  },
  navigationLabel: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); // 👈 ប្រកាសប្រើប្រាស់ AuthStore
const { resolvedTheme } = useTheme();
const { t, locale } = useI18n();

// 👤 --- ទាញទិន្នន័យ User ផ្ទាល់ពី AuthStore ដូចកូដថ្មីរបស់បង ---
const displayUserName = computed(() => {
  return (
    authStore.user?.name ||
    authStore.user?.full_name ||
    authStore.user?.fullName ||
    authStore.user?.username ||
    authStore.user?.email ||
    t("owner.profile.name")
  );
});

const displayUserRole = computed(() => {
  const role = authStore.user?.role || "member";
  return role.charAt(0).toUpperCase() + role.slice(1);
});

const displayUserInitials = computed(() => {
  const name = displayUserName.value;
  return name ? name.substring(0, 2).toUpperCase() : "US";
});

// 👉 Sidebar state
const { isSidebarOpen, toggleSidebar } = useSidebar();

const isActive = (path) => route.path === path;

// 🚪 --- Logout Modals & Actions ---
const logoutModalOpen = ref(false);
const isLoggingOut = ref(false);

const handleLogoutClick = () => {
  logoutModalOpen.value = true;
};

const executeLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authStore.logout();

    logoutModalOpen.value = false;

    await router.push({ name: "public.home" });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <aside
    :class="[
      'flex h-screen fixed top-0 left-0 z-20 transition-all duration-300 overflow-hidden',
      isSidebarOpen ? 'w-64' : 'w-20',
    ]"
    style="
      background: var(--color-surface-strong);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    "
  >
    <div class="flex flex-col w-full">
      <div
        class="flex flex-col items-center justify-center border-b border-(--color-border) px-3 gap-3 relative transition-all duration-300"
        :class="isSidebarOpen ? 'h-40' : 'h-30'"
      >
        <button
          @click="toggleSidebar"
          class="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10"
        >
          <component
            :is="isSidebarOpen ? XMarkIcon : Bars3Icon"
            class="w-5 h-5 text-white"
          />
        </button>

        <img
          :src="logo"
          class="transition-all duration-300"
          :class="
            isSidebarOpen
              ? 'h-16 w-auto brightness-200'
              : 'h-8 w-auto brightness-200'
          "
        />

        <span
          v-if="isSidebarOpen"
          class="font-kantumruy-pro text-xl font-extrabold tracking-wider"
          :class="
            resolvedTheme === 'dark'
              ? 'text-(--color-primary)'
              : 'text-(--color-surface)'
          "
        >
          ស្រុកយើង
        </span>
      </div>

      <div class="flex-1 flex flex-col overflow-y-auto py-4 px-2 gap-1">
        <p
          v-if="isSidebarOpen"
          class="font-semibold uppercase tracking-[1.4px] px-2 pb-1.5"
          :class="locale === 'en' ? 'text-[9px]' : 'text-[12px]'"
          style="color: rgba(255, 255, 255, 0.5); height: 24px"
        >
          {{ props.navigationLabel || t("owner.sidebar.navigation") }}
        </p>

        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'sidebar-item group relative flex items-center gap-2 w-full rounded-lg px-2 py-2 text-[15px]',
            isActive(item.path) ? 'sidebar-item--active' : 'sidebar-item--idle',
            !isSidebarOpen ? 'justify-center' : '',
          ]"
        >
          <span
            class="sidebar-item__icon p-2 rounded-lg flex items-center justify-center"
          >
            <component :is="item.icon" class="w-4 h-4" />
          </span>

          <span v-if="isSidebarOpen" class="truncate">
            {{ item.name }}
          </span>

          <span
            v-if="item.badge && isSidebarOpen"
            class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full badge-danger"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </div>

      <div class="px-2 py-2 border-t border-(--color-border)">
        <router-link
          v-for="item in bottomItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'sidebar-item flex items-center gap-2 w-full rounded-lg px-2 py-2 text-[15px]',
            isActive(item.path) ? 'sidebar-item--active' : 'sidebar-item--idle',
            !isSidebarOpen ? 'justify-center' : '',
          ]"
        >
          <span
            class="sidebar-item__icon p-2 rounded-lg flex items-center justify-center"
          >
            <component :is="item.icon" class="w-4 h-4" />
          </span>

          <span v-if="isSidebarOpen">{{ item.name }}</span>
        </router-link>

        <div
          @click="handleLogoutClick"
          class="flex items-center gap-2 rounded-lg px-2 py-2 mt-2 sidebar-user"
          :class="!isSidebarOpen ? 'justify-center' : ''"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
            style="background: rgba(57, 149, 198, 0.35)"
          >
            {{ displayUserInitials }}
          </div>

          <div v-if="isSidebarOpen" class="flex flex-col min-w-0 flex-1">
            <span class="text-[15px] font-semibold truncate text-white/85">
              {{ displayUserName }}
            </span>
            <span class="text-[12px] text-white/40 truncate">
              {{ displayUserRole }}
            </span>
          </div>

          <ArrowRightStartOnRectangleIcon
            v-if="isSidebarOpen"
            class="w-5 h-5 text-white/60 hover:text-white transition-colors"
          />
        </div>
      </div>
    </div>
  </aside>

  <AppModal
    :open="logoutModalOpen"
    @close="logoutModalOpen = false"
    title="Confirm Logout"
  >
    <div class="p-2 text-center">
      <div class="modal-icon-container bg-(--color-danger-soft)">
        <ArrowRightStartOnRectangleIcon
          class="w-14 h-14 text-(--color-danger)"
        />
      </div>

      <h3 class="modal-main-title">Confirm Account Logout</h3>
      <p class="modal-description">
        Are you sure you want to log out from your admin moderation account?
      </p>

      <div class="flex gap-3 justify-center mt-6">
        <button
          @click="logoutModalOpen = false"
          :disabled="isLoggingOut"
          class="btn-modal-cancel"
        >
          Cancel
        </button>
        <button
          @click="executeLogout"
          :disabled="isLoggingOut"
          class="btn-modal-danger-confirm"
        >
          <template v-if="isLoggingOut">
            <span>Logging out...</span>
          </template>
          <template v-else>Yes, Logout</template>
        </button>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.sidebar-item {
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-item--idle:hover,
.sidebar-item:focus-visible {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.04);
  outline: none;
}

.sidebar-item--active {
  color: #fff !important;
  background: rgba(57, 149, 198, 0.22) !important;
}

.sidebar-item__indicator {
  background: var(--color-secondary);
}

.sidebar-item__icon {
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-item__icon--active {
  background: rgba(57, 149, 198, 0.28) !important;
}

.sidebar-item__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(57, 149, 198, 0.8);
}

.badge-danger {
  background: var(--color-danger);
  color: #fff;
}

.sidebar-item:focus-visible {
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.sidebar-item--bottom.sidebar-item--active .sidebar-item__icon,
.sidebar-item--active .sidebar-item__icon {
  background: rgba(57, 149, 198, 0.28);
}

.sidebar-user {
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
}

.sidebar-user:hover {
  background: rgba(255, 255, 255, 0.08);
}

.modal-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  margin-bottom: var(--space-md);
}

.modal-main-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.modal-description {
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.btn-modal-cancel {
  background-color: transparent;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  cursor: pointer;
}

.btn-modal-cancel:hover {
  background-color: var(--color-surface-soft);
}

.btn-modal-danger-confirm {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
}
</style>
