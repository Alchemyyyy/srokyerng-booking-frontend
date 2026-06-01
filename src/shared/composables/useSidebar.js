import { ref } from 'vue';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const openSidebar = () => {
    isSidebarOpen.value = true;
};

const closeSidebar = () => {
    isSidebarOpen.value = false;
};

export function useSidebar() {
    return {
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar
    };
}