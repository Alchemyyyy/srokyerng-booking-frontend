import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/modules/auth/services/authService";
import { authStorage } from "@/shared/services/authStorage";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(authStorage.getToken());
  const user = ref(authStorage.getUser());
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(token.value));

  const persistSession = (data) => {
    token.value = data.token;
    user.value = data.user;
    authStorage.setSession(data);
  };

  const login = async (payload) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(payload);
      persistSession(response.data);
      return response.data.user;
    } catch (requestError) {
      error.value = requestError.message || "Login failed";
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload) => {
    loading.value = true;
    error.value = null;

    try {
      return await authService.register(payload);
    } catch (requestError) {
      error.value = requestError.message || "Registration failed";
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    authStorage.clearSession();
  };

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
