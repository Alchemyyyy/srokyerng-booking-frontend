import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/modules/auth/services/authService";
import { useNotificationStore } from "@/modules/notifications/store/notificationStore";
import { setAccessToken, setAuthHandlers } from "@/app/api/http";

export const useAuthStore = defineStore("auth", () => {
  const notificationStore = useNotificationStore();
  const accessToken = ref(null);
  const user = ref(null);
  const initialized = ref(false);
  const restoringSession = ref(false);
  const loading = ref(false);
  const error = ref(null);
  let restorePromise = null;

  const authModalOpen = ref(false);
  const authModalTab = ref("login");

  const openLoginModal = () => {
    authModalOpen.value = true;
    authModalTab.value = "login";
  };

  const openRegisterModal = () => {
    authModalOpen.value = true;
    authModalTab.value = "register";
  };

  const closeAuthModal = () => {
    authModalOpen.value = false;
  };

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
    notificationStore.reset();
  };

  const refreshNotifications = async () => {
    try {
      await notificationStore.fetchUnreadCount();
    } catch {
      // Notification count should not block auth/session flow.
    }
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
      await refreshNotifications();
      initialized.value = true;
      return response.data.user;
    }, "Login failed");
  };

  const googleLogin = async (payload) => {
    return runWithLoading(async () => {
      const response = await authService.googleLogin(payload);
      setSession(response.data);
      await refreshNotifications();
      initialized.value = true;
      return response.data.user;
    }, "Google login failed");
  };

  const facebookLogin = async (payload) => {
    return runWithLoading(async () => {
      const response = await authService.facebookLogin(payload);
      setSession(response.data);
      await refreshNotifications();
      initialized.value = true;
      return response.data.user;
    }, "Facebook login failed");
  };

  const linkGoogleAccount = async (payload) => {
    return runWithLoading(async () => {
      const response = await authService.linkGoogleAccount(payload);
      user.value = response.data;
      return user.value;
    }, "Failed to link Google account");
  };

  const unlinkGoogleAccount = async () => {
    return runWithLoading(async () => {
      const response = await authService.unlinkGoogleAccount();
      user.value = response.data;
      return user.value;
    }, "Failed to unlink Google account");
  };

  const register = async (payload) => {
    return runWithLoading(async () => authService.register(payload), "Registration failed");
  };

  const forgotPassword = async (payload) => {
    return runWithLoading(async () => authService.forgotPassword(payload), "Password reset request failed");
  };

  const resetPassword = async (payload) => {
    return runWithLoading(async () => authService.resetPassword(payload), "Password reset failed");
  };

  const verifyEmail = async (payload) => {
    return runWithLoading(async () => authService.verifyEmail(payload), "Email verification failed");
  };

  const resendVerificationEmail = async () => {
    return runWithLoading(
      async () => authService.resendVerificationEmail(),
      "Verification email could not be sent"
    );
  };

  const refreshSession = async () => {
    try {
      const response = await authService.refreshToken();
      setSession(response.data);
      await refreshNotifications();
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

    if (restorePromise) {
      return restorePromise;
    }

    restoringSession.value = true;

    restorePromise = (async () => {
      try {
        return await refreshSession();
      } catch {
        return null;
      } finally {
        initialized.value = true;
        restoringSession.value = false;
        restorePromise = null;
      }
    })();

    return restorePromise;
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
    authModalOpen,
    authModalTab,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    accessToken,
    user,
    initialized,
    restoringSession,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isOwner,
    isCustomer,
    setSession,
    clearSession,
    login,
    googleLogin,
    facebookLogin,
    linkGoogleAccount,
    unlinkGoogleAccount,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    refreshSession,
    restoreSession,
    logout,
    logoutAll,
  };
});
