<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '../composables/useTheme';

const { currentTheme, toggleTheme } = useTheme();

const isScrolled = ref(false);
const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

</script>

<template>
    <div
        class="flex justify-end items-center h-16 px-8 bg-(--color-surface) shadow-sm fixed top-0 left-0 right-0 z-10 transition">
        <button type="button" @click="toggleTheme"
            class="p-2 rounded-full bg-(--color-surface-soft) hover:bg-(--color-info-soft) transition text-(--color-primary)">
            <span>
                <!-- Sun icon = light mode -->
                <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.02 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
                </svg>
                <!-- Moon icon = dark mode -->
                <svg v-else-if="currentTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                <!-- Monitor icon = system mode -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </span>
        </button>
    </div>
</template>