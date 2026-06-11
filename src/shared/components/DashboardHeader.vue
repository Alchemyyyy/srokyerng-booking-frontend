<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ThemeToggle from './ThemeToggle1.vue';
import LanguageToggle from './LanguageToggle.vue';
import { useSidebar } from '@/shared/composables/useSidebar';

import { MagnifyingGlassIcon, BellIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

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
const { t } = useI18n();

const homeLabel = computed(() => t('nav.home'));
const searchLabel = computed(() => t('owner.header.search'));

const routeLabel = computed(() => {
    return route.meta.title || t('nav.dashboard');
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
                {{ homeLabel }}
            </span>

            <ChevronRightIcon class="w-3.5 h-3.5 text-(--color-muted) shrink-0" />

            <span class="font-semibold text-(--color-text) truncate">
                {{ routeLabel }}
            </span>
        </nav>

        <!-- Search -->
        <!-- <button v-if="showSearch" type="button" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                   bg-(--color-surface-soft) border border-(--color-border)
                   text-(--color-muted)
                   hover:border-(--color-primary)
                   hover:text-(--color-primary)
                   transition-all duration-200">
            <MagnifyingGlassIcon class="w-3.5 h-3.5 shrink-0" />

            <span>{{ searchLabel }}</span>

            <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-(--color-border)">
                ⌘K
            </kbd>
        </button> -->

        <!-- Notifications -->
        <button v-if="showNotifications" type="button" class="relative w-9 h-9 flex items-center justify-center rounded-lg
                   bg-(--color-surface-soft)
                   border border-(--color-border)
                   text-(--color-muted)
                   hover:bg-(--color-primary-soft)
                   hover:border-(--color-primary)
                   hover:text-(--color-primary)
                   transition-all duration-200">
            <BellIcon class="w-4.5 h-4.5" />

            <span class="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-(--color-danger)"></span>
        </button>

        <div class="h-5 w-px bg-(--color-border)"></div>

        <!-- Language -->
        <LanguageToggle />

        <div class="h-5 w-px bg-(--color-border)"></div>

        <!-- Theme -->
        <ThemeToggle />

        <div class="h-5 w-px bg-(--color-border)"></div>

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