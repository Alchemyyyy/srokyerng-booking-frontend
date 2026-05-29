<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import ThemeToggle from './ThemeToggle1.vue';
import { useSidebar } from '@/shared/composables/useSidebar';

defineProps({
    showSearch: {
        type: Boolean,
        default: true
    },

    showNotifications: {
        type: Boolean,
        default: true
    },

    user: {
        type: Object,
        default: () => ({
            initials: 'AD'
        })
    }
});

const route = useRoute();

const routeLabel = computed(() => {
    return route.meta.title || 'Dashboard';
});

const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const { isSidebarOpen } = useSidebar();

</script>

<template>
    <header class="fixed top-0 right-0 z-10 h-16 flex items-center gap-3 px-6
               bg-(--color-surface) border-b border-(--color-border)
               transition-all duration-300" :class="isSidebarOpen ? 'left-64' : 'left-20'">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
            <span class="text-(--color-muted) font-medium">
                Home
            </span>

            <svg class="w-3.5 h-3.5 text-(--color-muted) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <span class="font-semibold text-(--color-text) truncate">
                {{ routeLabel }}
            </span>
        </nav>

        <!-- Search -->
        <button v-if="showSearch" type="button" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                   bg-(--color-surface-soft) border border-(--color-border)
                   text-(--color-muted)
                   hover:border-(--color-primary)
                   hover:text-(--color-primary)
                   transition-all duration-200">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />

                <path d="M21 21l-4.35-4.35" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <span>Search…</span>

            <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-(--color-border)">
                ⌘K
            </kbd>
        </button>

        <!-- Notifications -->
        <button v-if="showNotifications" type="button" class="relative w-9 h-9 flex items-center justify-center rounded-lg
                   bg-(--color-surface-soft)
                   border border-(--color-border)
                   text-(--color-muted)
                   hover:bg-(--color-primary-soft)
                   hover:border-(--color-primary)
                   hover:text-(--color-primary)
                   transition-all duration-200">
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke-linecap="round" stroke-linejoin="round" />

                <path d="M13.73 21a2 2 0 01-3.46 0" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <span class="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-(--color-danger)" />
        </button>

        <div class="h-5 w-px bg-(--color-border)" />

        <!-- Theme -->
        <ThemeToggle />

        <div class="h-5 w-px bg-(--color-border)" />

        <!-- Profile -->
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0
                   bg-(--color-primary-soft)
                   border-2 border-(--color-primary)
                   text-(--color-primary)
                   text-xs font-bold
                   hover:ring-2 hover:ring-(--color-primary)
                   hover:ring-offset-2
                   transition-all duration-200">
            {{ user.initials }}
        </button>
    </header>
</template>