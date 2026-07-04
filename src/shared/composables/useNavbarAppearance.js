import { computed, onMounted, onUnmounted, ref } from "vue";
import { useTheme } from "@/shared/composables/useTheme";

export const useNavbarAppearance = (route) => {
  const { currentTheme, resolvedTheme, toggleTheme } = useTheme();
  const isScrolled = ref(false);

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };

  const isNavbarSolid = computed(
    () => isScrolled.value || Boolean(route.meta.navbarSolid),
  );

  onMounted(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return {
    currentTheme,
    resolvedTheme,
    isNavbarSolid,
    toggleTheme,
  };
};
