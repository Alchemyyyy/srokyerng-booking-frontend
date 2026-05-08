import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import i18n from "./app/i18n";
import router from "./app/router";
import { initializeTheme } from "./shared/services/themeStorage";
import "./assets/styles/main.css";

import '@fontsource-variable/kantumruy-pro';
import '@fontsource/poppins';

initializeTheme();

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);

app.mount("#app");
