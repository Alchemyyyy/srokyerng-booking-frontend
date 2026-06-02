import { computed, onMounted, onUnmounted, ref } from "vue";
import { getStoredTheme, setTheme } from "@/shared/services/themeStorage";

export const useNavbarAppearance = (route) => {
  const currentTheme = ref(getStoredTheme());
  const systemTheme = ref("light");
  const isScrolled = ref(false);
  let systemThemeQuery;
  let themeObserver;

  const toggleTheme = () => {
    const next = currentTheme.value === "light" ? "dark" : "light";
    currentTheme.value = next;
    setTheme(next);
  };

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };

  const syncThemeState = () => {
    currentTheme.value = getStoredTheme();
    systemTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const handleSystemThemeChange = (event) => {
    systemTheme.value = event.matches ? "dark" : "light";
  };

  const resolvedTheme = computed(() =>
    currentTheme.value === "system" ? systemTheme.value : currentTheme.value,
  );

  const isNavbarSolid = computed(
    () => isScrolled.value || Boolean(route.meta.navbarSolid),
  );

  onMounted(() => {
    syncThemeState();
    handleScroll();

    systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);

    themeObserver = new MutationObserver(syncThemeState);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("scroll", handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    systemThemeQuery?.removeEventListener("change", handleSystemThemeChange);
    themeObserver?.disconnect();
  });

  return {
    currentTheme,
    resolvedTheme,
    isNavbarSolid,
    toggleTheme,
  };
};
