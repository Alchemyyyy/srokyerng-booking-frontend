export const THEME_STORAGE_KEY = "srokyerng_theme";
export const THEME_OPTIONS = ["light", "dark", "system"];
export const DEFAULT_THEME = "system";

const applyTheme = (theme) => {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }

  document.documentElement.dataset.theme = theme;
};

export const getStoredTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (THEME_OPTIONS.includes(storedTheme)) {
    return storedTheme;
  }

  return DEFAULT_THEME;
};

export const setTheme = (theme) => {
  if (!THEME_OPTIONS.includes(theme)) return;

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
};

export const initializeTheme = () => {
  applyTheme(getStoredTheme());
};
