import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/modules/auth/services/authService";
import { setAccessToken, setAuthHandlers } from "@/app/api/http";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(null);
  const user = ref(null);
  const initialized = ref(false);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));
  const isAdmin = computed(() => user.value?.role === "admin");
  const isOwner = computed(() => user.value?.role === "owner");
  const isCustomer = computed(() => user.value?.role === "customer");

  const setSession = (data) => {
    accessToken.value = data.access_token;
    user.value = data.user;
    setAccessToken(data.access_token);
  };

  const clearSession = () => {
    accessToken.value = null;
    user.value = null;
    setAccessToken(null);
  };

  const runWithLoading = async (callback, fallbackMessage) => {
    loading.value = true;
    error.value = null;

    try {
      return await callback();
    } catch (requestError) {
      error.value = requestError.message || fallbackMessage;
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  const login = async (payload) => {
    return runWithLoading(async () => {
      const response = await authService.login(payload);
      setSession(response.data);
      initialized.value = true;
      return response.data.user;
    }, "Login failed");
  };

  const register = async (payload) => {
    return runWithLoading(async () => authService.register(payload), "Registration failed");
  };

  const refreshSession = async () => {
    try {
      const response = await authService.refreshToken();
      setSession(response.data);
      return response.data.user;
    } catch (refreshError) {
      clearSession();
      throw refreshError;
    }
  };

  const restoreSession = async () => {
    if (initialized.value) {
      return user.value;
    }

    try {
      return await refreshSession();
    } catch {
      return null;
    } finally {
      initialized.value = true;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      initialized.value = true;
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearSession();
      initialized.value = true;
    }
  };

  setAuthHandlers({
    refresh: refreshSession,
    logout: clearSession,
  });

  return {
    accessToken,
    user,
    initialized,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isOwner,
    isCustomer,
    setSession,
    clearSession,
    login,
    register,
    refreshSession,
    restoreSession,
    logout,
    logoutAll,
  };
});
