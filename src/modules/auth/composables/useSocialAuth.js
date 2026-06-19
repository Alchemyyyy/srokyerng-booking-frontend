import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { getPostLoginRoute } from "@/modules/auth/utils/authRedirect";
import { ROLES } from "@/shared/constants/roles";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const FACEBOOK_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js";
let googleScriptPromise = null;
let facebookScriptPromise = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const loadFacebookScript = () => {
  if (window.FB) {
    return Promise.resolve();
  }

  if (facebookScriptPromise) {
    return facebookScriptPromise;
  }

  facebookScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${FACEBOOK_SCRIPT_SRC}"]`);

    window.fbAsyncInit = () => resolve();

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = FACEBOOK_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.FB) {
        resolve();
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return facebookScriptPromise;
};

const isDarkTheme = () => {
  const theme = document.documentElement.dataset.theme;

  if (theme === "dark") {
    return true;
  }

  if (theme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const getGoogleButtonTheme = () => {
  return "filled_blue";
};

export const useSocialAuth = (roleRef) => {
  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const facebookGraphApiVersion = import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || "v23.0";
  const googleButtonRef = ref(null);
  const errorMessage = ref("");
  const googleErrorMessage = ref("");
  const facebookErrorMessage = ref("");
  const loadingProvider = ref("");
  const isFacebookLoginSupported = computed(() => {
    return (
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  });
  let themeObserver = null;
  let systemThemeQuery = null;

  const roleMismatchMessage = computed(() => {
    if (roleRef.value === ROLES.CUSTOMER) {
      return t("auth.customerLoginRoleMismatch");
    }

    if (roleRef.value === ROLES.OWNER) {
      return t("auth.ownerLoginRoleMismatch");
    }

    return t("auth.invalidCredentials");
  });

  const clearMessages = () => {
    errorMessage.value = "";
    googleErrorMessage.value = "";
    facebookErrorMessage.value = "";
  };

  const completeSocialAuth = async (user) => {
    if (roleRef.value && user?.role !== roleRef.value) {
      await authStore.logout();
      errorMessage.value = roleMismatchMessage.value;
      return;
    }

    await router.push(getPostLoginRoute(user, route.query.redirect));
  };

  const handleGoogleCredential = async (response) => {
    if (loadingProvider.value) {
      return;
    }

    clearMessages();

    if (!response?.credential || !roleRef.value) {
      googleErrorMessage.value = t("auth.googleLoginFailed");
      return;
    }

    loadingProvider.value = "google";

    try {
      const user = await authStore.googleLogin({
        credential: response.credential,
        role: roleRef.value,
      });

      await completeSocialAuth(user);
    } catch (error) {
      errorMessage.value = error.message || t("auth.googleLoginFailed");
    } finally {
      loadingProvider.value = "";
    }
  };

  const handleFacebookLogin = async () => {
    if (loadingProvider.value) {
      return;
    }

    clearMessages();

    if (!roleRef.value) {
      facebookErrorMessage.value = t("auth.facebookLoginFailed");
      return;
    }

    if (!facebookAppId) {
      facebookErrorMessage.value = t("auth.facebookLoginNotConfigured");
      return;
    }

    if (!isFacebookLoginSupported.value) {
      facebookErrorMessage.value = t("auth.facebookLoginRequiresHttps");
      return;
    }

    loadingProvider.value = "facebook";

    try {
      await loadFacebookScript();

      window.FB.init({
        appId: facebookAppId,
        cookie: false,
        xfbml: false,
        version: facebookGraphApiVersion,
      });

      window.FB.login(
        (response) => {
          (async () => {
            if (!response.authResponse?.accessToken) {
              facebookErrorMessage.value = t("auth.facebookLoginCancelled");
              loadingProvider.value = "";
              return;
            }

            try {
              const user = await authStore.facebookLogin({
                access_token: response.authResponse.accessToken,
                role: roleRef.value,
              });

              await completeSocialAuth(user);
            } catch (error) {
              errorMessage.value = error.message || t("auth.facebookLoginFailed");
            } finally {
              loadingProvider.value = "";
            }
          })();
        },
        { scope: "email,public_profile", return_scopes: true }
      );
    } catch {
      facebookErrorMessage.value = t("auth.facebookLoginUnavailable");
      loadingProvider.value = "";
    }
  };

  const renderGoogleButton = async () => {
    googleErrorMessage.value = "";

    await nextTick();

    if (!googleButtonRef.value) {
      return;
    }

    if (!googleClientId) {
      googleErrorMessage.value = t("auth.googleLoginNotConfigured");
      return;
    }

    try {
      await loadGoogleScript();

      googleButtonRef.value.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.value, {
        theme: getGoogleButtonTheme(),
        size: "large",
        type: "icon",
        shape: "circle",
      });
    } catch {
      googleErrorMessage.value = t("auth.googleLoginUnavailable");
    }
  };

  const watchThemeChanges = () => {
    themeObserver = new MutationObserver(renderGoogleButton);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeQuery.addEventListener("change", renderGoogleButton);
  };

  onMounted(() => {
    renderGoogleButton();
    watchThemeChanges();
  });

  onUnmounted(() => {
    themeObserver?.disconnect();
    systemThemeQuery?.removeEventListener("change", renderGoogleButton);
  });

  watch(roleRef, renderGoogleButton);

  return {
    errorMessage,
    facebookErrorMessage,
    googleButtonRef,
    googleErrorMessage,
    handleFacebookLogin,
    isFacebookLoginSupported,
    loadingProvider,
  };
};
