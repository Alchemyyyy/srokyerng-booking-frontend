import { authApi } from "@/modules/auth/api/auth.api";

export const authService = {
  register(payload) {
    return authApi.register(payload);
  },

  login(payload) {
    return authApi.login(payload);
  },

  googleLogin(payload) {
    return authApi.googleLogin(payload);
  },

  facebookLogin(payload) {
    return authApi.facebookLogin(payload);
  },

  refreshToken() {
    return authApi.refreshToken();
  },

  logout() {
    return authApi.logout();
  },

  logoutAll() {
    return authApi.logoutAll();
  },

  forgotPassword(payload) {
    return authApi.forgotPassword(payload);
  },

  resetPassword(payload) {
    return authApi.resetPassword(payload);
  },

  verifyEmail(payload) {
    return authApi.verifyEmail(payload);
  },

  resendVerificationEmail() {
    return authApi.resendVerificationEmail();
  },

  getSessions() {
    return authApi.getSessions();
  },

  revokeSession(sessionId) {
    return authApi.revokeSession(sessionId);
  },
};
