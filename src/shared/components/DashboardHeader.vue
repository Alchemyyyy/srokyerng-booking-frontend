<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import ThemeToggle from "./ThemeToggle1.vue";
import LanguageToggle from "./LanguageToggle.vue";
import NavbarAccountMenu from "./NavbarAccountMenu.vue";
import NotificationBell from "@/modules/notifications/components/NotificationBell.vue";
import { useSidebar } from "@/shared/composables/useSidebar";

import { ChevronRightIcon } from "@heroicons/vue/24/outline";

defineProps({
  showSearch: {
    type: Boolean,
    default: true,
  },

  showNotifications: {
    type: Boolean,
    default: true,
  },

  // Kept for backward compatibility with callers like:
  // <AppHeader :user="user" /> — no longer used internally since
  // NavbarAccountMenu pulls the user straight from authStore itself.
  user: {
    type: Object,
    default: () => ({
      initials: "AD",
    }),
  },
});

const route = useRoute();
const { t } = useI18n();

const homeLabel = computed(() => t("nav.home"));

const routeLabel = computed(() => {
  return route.meta.title || t("nav.dashboard");
});

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const { isSidebarOpen } = useSidebar();
</script>

<template>
  <header
    class="fixed top-0 right-0 z-10 h-16 flex items-center gap-3 px-6 bg-(--color-surface) border-b border-(--color-border) transition-all duration-300"
    :class="isSidebarOpen ? 'left-64' : 'left-20'"
  >
    <!-- Breadcrumb -->
    <nav
      class="flex items-center gap-1.5 text-sm flex-1 min-w-0"
      aria-label="Breadcrumb"
    >
      <span class="text-(--color-muted) font-medium">
        {{ homeLabel }}
      </span>

      <ChevronRightIcon class="w-3.5 h-3.5 text-(--color-muted) shrink-0" />

      <span class="font-semibold text-(--color-text) truncate">
        {{ routeLabel }}
      </span>
    </nav>

    <!-- Notifications — same working component PublicNavbar uses for
             customers (real unread count, dropdown, mark-as-read), instead
             of a static decorative icon. -->
    <NotificationBell v-if="showNotifications" :solid="true" />

    <div class="h-5 w-px bg-(--color-border)"></div>

    <!-- Language -->
    <LanguageToggle />

    <div class="h-5 w-px bg-(--color-border)"></div>

    <!-- Theme -->
    <ThemeToggle />

    <div class="h-5 w-px bg-(--color-border)"></div>

    <!-- Profile / account dropdown — Profile, Dashboard, Settings, Logout -->
    <NavbarAccountMenu />
  </header>
</template>
