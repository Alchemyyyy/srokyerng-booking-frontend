<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '@/modules/admin/composables/useTheme';
import { useSidebar } from '@/shared/composables/useSidebar';
import {
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/vue/24/outline';

defineProps({
    menuItems: Array,
    bottomItems: {
        type: Array,
        default: () => []
    },
    logo: String,
    title: {
        type: String,
        default: 'ស្រុកយើង'
    },
    user: {
        type: Object,
        default: () => ({
            initials: 'AD',
            name: 'Admin User',
            role: 'Super Admin'
        })
    },
    navigationLabel: {
        type: String,
        default: 'Navigation'
    }
});

const { resolvedTheme } = useTheme();
const route = useRoute();

// 👉 sidebar state
const {
    isSidebarOpen,
    toggleSidebar
} = useSidebar();

const isActive = (path) => route.path === path;
</script>

<template>
    <aside :class="[
        'flex h-screen fixed top-0 left-0 z-20 transition-all duration-300 overflow-hidden',
        isSidebarOpen ? 'w-64' : 'w-20'
    ]" style="background: var(--color-surface-strong); border-right: 1px solid rgba(255,255,255,0.06);">
        <div class="flex flex-col w-full">

            <!-- HEADER -->
            <div class="flex flex-col items-center justify-center border-b border-(--color-border) px-3 gap-3 relative transition-all duration-300"
                :class="isSidebarOpen ? 'h-40' : 'h-30'">

                <!-- toggle button -->
                <button @click="toggleSidebar" class="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10">
                    <component :is="isSidebarOpen ? XMarkIcon : Bars3Icon" class="w-5 h-5 text-white" />
                </button>

                <img :src="logo" class="transition-all duration-300"
                    :class="isSidebarOpen ? 'h-16 w-auto brightness-200' : 'h-8 w-auto brightness-200'" />

                <span v-if="isSidebarOpen" class="font-kantumruy text-xl font-extrabold tracking-wider" :class="resolvedTheme === 'dark'
                    ? 'text-(--color-primary)'
                    : 'text-(--color-surface)'">
                    {{ title }}
                </span>
            </div>

            <!-- NAVIGATION -->
            <div class="flex-1 flex flex-col overflow-y-auto py-4 px-2 gap-1">

                <p v-if="isSidebarOpen" class="text-[9px] font-semibold uppercase tracking-[1.4px] px-2 pb-1.5"
                    style="color: rgba(255,255,255,0.28);">
                    {{ navigationLabel }}
                </p>

                <router-link v-for="item in menuItems" :key="item.path" :to="item.path" :class="[
                    'sidebar-item group relative flex items-center gap-2 w-full rounded-lg px-2 py-2 text-[12px]',
                    isActive(item.path)
                        ? 'sidebar-item--active'
                        : 'sidebar-item--idle',
                    !isSidebarOpen ? 'justify-center' : ''
                ]">
                    <span class="sidebar-item__icon p-2 rounded-lg flex items-center justify-center">
                        <component :is="item.icon" class="w-4 h-4" />
                    </span>

                    <span v-if="isSidebarOpen" class="truncate">
                        {{ item.name }}
                    </span>

                    <span v-if="item.badge && isSidebarOpen"
                        class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full badge-danger">
                        {{ item.badge }}
                    </span>
                </router-link>
            </div>

            <!-- BOTTOM -->
            <div class="px-2 py-2 border-t border-white/10">

                <router-link v-for="item in bottomItems" :key="item.path" :to="item.path" :class="[
                    'sidebar-item flex items-center gap-2 w-full rounded-lg px-2 py-2 text-[12px]',
                    isActive(item.path)
                        ? 'sidebar-item--active'
                        : 'sidebar-item--idle',
                    !isSidebarOpen ? 'justify-center' : ''
                ]">
                    <span class="sidebar-item__icon p-2 rounded-lg flex items-center justify-center">
                        <component :is="item.icon" class="w-4 h-4" />
                    </span>

                    <span v-if="isSidebarOpen">{{ item.name }}</span>
                </router-link>

                <!-- USER -->
                <div class="flex items-center gap-2 rounded-lg px-2 py-2 mt-2 sidebar-user"
                    :class="!isSidebarOpen ? 'justify-center' : ''">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style="background: rgba(57,149,198,0.35);">
                        {{ user.initials }}
                    </div>

                    <div v-if="isSidebarOpen" class="flex flex-col min-w-0 flex-1">
                        <span class="text-xs font-semibold truncate text-white/85">
                            {{ user.name }}
                        </span>
                        <span class="text-[10px] text-white/40 truncate">
                            {{ user.role }}
                        </span>
                    </div>

                    <ArrowRightStartOnRectangleIcon v-if="isSidebarOpen" class="w-4 h-4 text-white" />
                </div>

            </div>

        </div>
    </aside>
</template>


<style scoped>
.sidebar-item {
    color: rgba(255, 255, 255, 0.55);
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
}

.sidebar-user:hover {
    background: rgba(255, 255, 255, 0.08);
}
</style>