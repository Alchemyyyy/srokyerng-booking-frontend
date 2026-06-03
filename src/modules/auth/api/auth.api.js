import http from "@/app/api/http";

export const authApi = {
  register(payload) {
    return http.post("/auth/register", payload);
  },

  login(payload) {
    return http.post("/auth/login", payload, { skipAuthRefresh: true });
  },

  refreshToken() {
    return http.post("/auth/refresh-token", {}, { skipAuthRefresh: true });
  },

  logout() {
    return http.post("/auth/logout");
  },

  logoutAll() {
    return http.post("/auth/logout-all");
  },

  forgotPassword(payload) {
    return http.post("/auth/forgot-password", payload, { skipAuthRefresh: true });
  },

  resetPassword(payload) {
    return http.post("/auth/reset-password", payload, { skipAuthRefresh: true });
  },

  verifyEmail(payload) {
    return http.post("/auth/verify-email", payload, { skipAuthRefresh: true });
  },

  resendVerificationEmail() {
    return http.post("/auth/resend-verification-email");
  },

  getSessions() {
    return http.get("/auth/sessions");
  },

  revokeSession(sessionId) {
    return http.delete(`/auth/sessions/${sessionId}`);
  },
};
