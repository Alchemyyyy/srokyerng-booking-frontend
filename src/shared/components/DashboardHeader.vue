<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import ThemeToggle from "./ThemeToggle.vue";
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

// Optional intermediate crumb for detail pages nested under a list page
// (e.g. Rooms > Room Detail), set via route meta: { parent: { name, label } }.
const parentCrumb = computed(() => route.meta?.parent || null);

const routeLabel = computed(() => {
  if (route.meta.title) return route.meta.title;
  if (route.name) {
    const nameWithoutPrefix = String(route.name).replace(/^(owner|customer|admin)\./, "");
    const key = `owner.sidebar.${nameWithoutPrefix}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return nameWithoutPrefix
      .split(/[-.]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return t("nav.dashboard");
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
    :class="[
      isSidebarOpen ? 'left-64' : 'left-20',
      isScrolled ? 'shadow-md bg-opacity-95 backdrop-blur-md' : ''
    ]"
  >
    <!-- Breadcrumb -->
    <nav
      class="flex items-center gap-1.5 text-sm flex-1 min-w-0"
      aria-label="Breadcrumb"
    >
      <router-link
        to="/owner"
        class="text-(--color-muted) hover:text-(--color-primary) font-medium transition-colors"
      >
        {{ homeLabel }}
      </router-link>

      <ChevronRightIcon class="w-3.5 h-3.5 text-(--color-muted) shrink-0" />

      <template v-if="parentCrumb">
        <router-link
          :to="{ name: parentCrumb.name }"
          class="text-(--color-muted) hover:text-(--color-primary) font-medium transition-colors"
        >
          {{ parentCrumb.label }}
        </router-link>
        <ChevronRightIcon class="w-3.5 h-3.5 text-(--color-muted) shrink-0" />
      </template>

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
