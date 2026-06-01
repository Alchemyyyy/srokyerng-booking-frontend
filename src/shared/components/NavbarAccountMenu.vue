<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
  getDashboardRouteByRole,
  getNotificationRouteByRole,
  getProfileRouteByRole,
} from "@/shared/utils/roleRoutes";

defineProps({
  solid: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n({ useScope: "global" });

const menuOpen = ref(false);
const menuRef = ref(null);

const userLabel = computed(() => {
  return (
    authStore.user?.name ||
    authStore.user?.full_name ||
    authStore.user?.fullName ||
    authStore.user?.username ||
    authStore.user?.email ||
    t("nav.signedInAs")
  );
});

const userInitial = computed(() => userLabel.value.trim().charAt(0).toUpperCase());
const userEmail = computed(() => authStore.user?.email || "");

const roleLabel = computed(() => {
  const role = authStore.user?.role || "member";

  return role.charAt(0).toUpperCase() + role.slice(1);
});

const dashboardRoute = computed(() => getDashboardRouteByRole(authStore.user?.role));
const notificationRoute = computed(() => getNotificationRouteByRole(authStore.user?.role));
const profileRoute = computed(() => getProfileRouteByRole(authStore.user?.role));

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const handleDocumentClick = (event) => {
  if (!menuRef.value?.contains(event.target)) {
    closeMenu();
  }
};

const handleLogout = async () => {
  await authStore.logout();
  closeMenu();
  await router.push({ name: "public.home" });
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  },
);
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border px-1.5 pr-3 transition"
      :class="
        solid
          ? 'border-(--color-border) bg-(--color-surface-soft) text-(--color-text) hover:border-(--color-primary)'
          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      "
      :aria-expanded="menuOpen"
      aria-label="Open account menu"
      @click.stop="toggleMenu"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="
          solid
            ? 'bg-(--color-primary-soft) text-(--color-primary)'
            : 'bg-white/20 text-white'
        "
      >
        {{ userInitial }}
      </span>
      <ChevronDownIcon class="h-4 w-4 transition" :class="menuOpen ? 'rotate-180' : ''" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl ring-1 ring-black/5"
    >
      <div class="border-b border-(--color-border) px-4 py-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-sm font-bold text-(--color-primary)"
          >
            {{ userInitial }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-(--color-text)">
              {{ userLabel }}
            </p>
            <p class="truncate text-sm text-(--color-muted)">
              {{ userEmail }}
            </p>
            <p class="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
              {{ roleLabel }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-2">
        <RouterLink
          v-if="profileRoute"
          :to="profileRoute"
          class="block rounded-xl px-3 py-2 text-[15px] font-medium text-(--color-muted) transition hover:bg-(--color-surface-soft) hover:text-(--color-text)"
          @click="closeMenu"
        >
          Profile
        </RouterLink>

        <RouterLink
          v-if="dashboardRoute"
          :to="dashboardRoute"
          class="block rounded-xl px-3 py-2 text-[15px] font-medium text-(--color-muted) transition hover:bg-(--color-surface-soft) hover:text-(--color-text)"
          @click="closeMenu"
        >
          {{ t("nav.dashboard") }}
        </RouterLink>

        <RouterLink
          v-if="notificationRoute"
          :to="notificationRoute"
          class="block rounded-xl px-3 py-2 text-[15px] font-medium text-(--color-muted) transition hover:bg-(--color-surface-soft) hover:text-(--color-text)"
          @click="closeMenu"
        >
          Notifications
        </RouterLink>

        <button
          type="button"
          class="block w-full rounded-xl px-3 py-2 text-left text-[15px] font-medium text-(--color-danger) transition hover:bg-(--color-danger-soft)"
          @click="handleLogout"
        >
          {{ t("nav.logout") }}
        </button>
      </div>
    </div>
  </div>
</template>
