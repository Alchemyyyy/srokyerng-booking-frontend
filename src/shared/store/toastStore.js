import { computed, ref } from "vue";
import { defineStore } from "pinia";

let toastId = 0;

export const useToastStore = defineStore("toasts", () => {
  const toasts = ref([]);
  const hasToasts = computed(() => toasts.value.length > 0);

  const remove = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  const show = ({
    message,
    title = "",
    variant = "info",
    timeout = 6000,
  }) => {
    const id = ++toastId;

    toasts.value.push({
      id,
      title,
      message,
      variant,
      timeout,
    });

    if (timeout > 0) {
      window.setTimeout(() => remove(id), timeout);
    }

    return id;
  };

  const success = (message, options = {}) =>
    show({ ...options, message, variant: "success" });

  const danger = (message, options = {}) =>
    show({ ...options, message, variant: "danger" });

  const warning = (message, options = {}) =>
    show({ ...options, message, variant: "warning" });

  const info = (message, options = {}) =>
    show({ ...options, message, variant: "info" });

  return {
    toasts,
    hasToasts,
    show,
    success,
    danger,
    warning,
    info,
    remove,
  };
});
