import { ref } from "vue";

// 👇 IMPORTANT: outside function = shared state (singleton)
const currentTheme = ref(localStorage.getItem("srokyerng_theme") || "light");

const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("srokyerng_theme", theme);
};

// apply once on load
applyTheme(currentTheme.value);

const toggleTheme = () => {
    currentTheme.value =
        currentTheme.value === "dark" ? "light" : "dark";

    applyTheme(currentTheme.value);
};

export function useTheme() {
    return {
        currentTheme,
        toggleTheme,
    };
}