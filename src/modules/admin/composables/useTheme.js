import { ref } from 'vue';

const THEME_KEY = 'srokyerng_theme';

const currentTheme = ref(
    localStorage.getItem(THEME_KEY) || 'system'
);

// actual applied theme
const resolvedTheme = ref('light');

const mediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)'
);

const applyTheme = (theme) => {
    // system mode
    if (theme === 'system') {
        resolvedTheme.value =
            mediaQuery.matches
                ? 'dark'
                : 'light';

        document.documentElement.setAttribute(
            'data-theme',
            resolvedTheme.value
        );

        return;
    }

    // manual mode
    resolvedTheme.value = theme;

    document.documentElement.setAttribute(
        'data-theme',
        theme
    );
};

const setTheme = (theme) => {
    currentTheme.value = theme;

    localStorage.setItem(
        THEME_KEY,
        theme
    );

    applyTheme(theme);
};

const toggleTheme = () => {
    setTheme(
        resolvedTheme.value === 'dark'
            ? 'light'
            : 'dark'
    );
};

// auto detect OS theme change
mediaQuery.addEventListener(
    'change',
    () => {
        if (currentTheme.value === 'system') {
            applyTheme('system');
        }
    }
);

// initial load
applyTheme(currentTheme.value);

export function useTheme() {
    return {
        currentTheme,
        resolvedTheme,
        setTheme,
        toggleTheme
    };
}