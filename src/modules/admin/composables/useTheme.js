import { ref } from 'vue';

const THEME_KEY = 'srokyerng_theme';

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const getAppliedTheme = () => {
    if (typeof document === 'undefined') {
        return 'light';
    }

    const theme = document.documentElement.getAttribute('data-theme');

    if (theme === 'dark' || theme === 'light') {
        return theme;
    }

    return mediaQuery.matches ? 'dark' : 'light';
};

const currentTheme = ref(localStorage.getItem(THEME_KEY) || 'system');
const resolvedTheme = ref(getAppliedTheme());

const syncThemeFromDocument = () => {
    resolvedTheme.value = getAppliedTheme();
};

const applyTheme = (theme) => {
    if (theme === 'system') {
        resolvedTheme.value = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.removeAttribute('data-theme');
    } else {
        resolvedTheme.value = theme;
        document.documentElement.setAttribute('data-theme', theme);
    }

    currentTheme.value = theme;
};

const setTheme = (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
};

const toggleTheme = () => {
    setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark');
};

mediaQuery.addEventListener('change', () => {
    if (currentTheme.value === 'system') {
        syncThemeFromDocument();
    }
});

if (typeof window !== 'undefined') {
    const themeObserver = new MutationObserver(syncThemeFromDocument);

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    });

    window.addEventListener('storage', (event) => {
        if (event.key === THEME_KEY) {
            currentTheme.value = localStorage.getItem(THEME_KEY) || 'system';
            syncThemeFromDocument();
        }
    });
}

applyTheme(currentTheme.value);

export function useTheme() {
    return {
        currentTheme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    };
}