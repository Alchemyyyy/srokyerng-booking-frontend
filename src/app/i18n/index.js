import { createI18n } from "vue-i18n";

import en from "./locales/en.json";
import km from "./locales/km.json";

export const SUPPORTED_LOCALES = ["en", "km"];
export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "srokyerng_locale";

const getInitialLocale = () => {
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

  if (SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  return DEFAULT_LOCALE;
};

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    en,
    km,
  },
});

export const setLocale = (locale) => {
  if (!SUPPORTED_LOCALES.includes(locale)) return;

  i18n.global.locale.value = locale;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
};

setLocale(i18n.global.locale.value);

export default i18n;
