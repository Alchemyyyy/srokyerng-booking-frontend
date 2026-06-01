const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => EMAIL_PATTERN.test(String(email || "").trim());

export const hasMinPasswordLength = (password, minLength = 8) =>
  String(password || "").length >= minLength;
