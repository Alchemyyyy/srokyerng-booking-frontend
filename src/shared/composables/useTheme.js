import { ref } from "vue";
import { THEME_STORAGE_KEY, getStoredTheme, setTheme as persistTheme } from "@/shared/services/themeStorage";

// Module-level singleton — every component that calls useTheme() shares the
// same reactive state, so toggling the theme anywhere updates it everywhere
// (previously this composable existed as three independent copies under
// modules/owner, modules/admin, and shared/, each with its own ref and no
// way to stay in sync with each other except by coincidentally observing
// the same DOM attribute).
const mediaQuery = typeof window !== "undefined"
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

const getAppliedTheme = () => {
  if (typeof document === "undefined") {
    return "light";
  }

  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "dark" || theme === "light") {
    return theme;
  }

  return mediaQuery?.matches ? "dark" : "light";
};

const currentTheme = ref(getStoredTheme());
const resolvedTheme = ref(getAppliedTheme());

const syncThemeFromDocument = () => {
  resolvedTheme.value = getAppliedTheme();
};

const applyTheme = (theme) => {
  if (theme === "system") {
    resolvedTheme.value = mediaQuery?.matches ? "dark" : "light";
    document.documentElement.removeAttribute("data-theme");
  } else {
    resolvedTheme.value = theme;
    document.documentElement.setAttribute("data-theme", theme);
  }

  currentTheme.value = theme;
};

const setTheme = (theme) => {
  persistTheme(theme);
  applyTheme(theme);
};

const toggleTheme = () => {
  setTheme(resolvedTheme.value === "dark" ? "light" : "dark");
};

if (typeof window !== "undefined") {
  const themeObserver = new MutationObserver(syncThemeFromDocument);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      currentTheme.value = getStoredTheme();
      syncThemeFromDocument();
    }
  });

  mediaQuery?.addEventListener("change", () => {
    if (currentTheme.value === "system") {
      syncThemeFromDocument();
    }
  });
}

applyTheme(currentTheme.value);

export function useTheme() {
  return {
    currentTheme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
