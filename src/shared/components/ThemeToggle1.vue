// shared/components/ThemeToggle.vue

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

import { useTheme } from '@/modules/admin/composables/useTheme';

import {
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/vue/24/outline';

const { currentTheme, setTheme } = useTheme();

const isOpen = ref(false);

const triggerRef = ref(null);
const dropdownRef = ref(null);

const { t } = useI18n();

const THEME_OPTIONS = [
    {
        key: 'light',
        labelKey: 'components.themeToggle.light',
        icon: SunIcon
    },

    {
        key: 'dark',
        labelKey: 'components.themeToggle.dark',
        icon: MoonIcon
    },

    {
        key: 'system',
        labelKey: 'components.themeToggle.system',
        icon: ComputerDesktopIcon
    }
];

const activeOption = computed(() => {
    return (
        THEME_OPTIONS.find(
            option =>
                option.key === currentTheme.value
        ) || THEME_OPTIONS[2]
    );
});

const selectTheme = (theme) => {
    setTheme(theme);

    isOpen.value = false;
};

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

const handleOutsideClick = (event) => {
    if (
        triggerRef.value &&
        !triggerRef.value.contains(event.target) &&
        dropdownRef.value &&
        !dropdownRef.value.contains(event.target)
    ) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener(
        'mousedown',
        handleOutsideClick
    );
});

onBeforeUnmount(() => {
    document.removeEventListener(
        'mousedown',
        handleOutsideClick
    );
});
</script>

<template>
    <div class="relative shrink-0">
        <!-- Trigger -->
        <button ref="triggerRef" type="button" @click="toggleDropdown" :class="[
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-200',
            'text-sm font-medium cursor-pointer select-none',

            isOpen
                ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary)'
                : 'bg-(--color-surface-soft) border-(--color-border) text-(--color-text) hover:border-(--color-primary) hover:bg-(--color-primary-soft) hover:text-(--color-primary)'
        ]">
            <component :is="activeOption.icon" class="w-4 h-4 shrink-0" />

            <span class="hidden sm:block">
                {{ t(activeOption.labelKey) }}
            </span>

            <ChevronDownIcon class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                :class="isOpen ? 'rotate-180' : ''" />
        </button>

        <!-- Dropdown -->
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
            <div v-if="isOpen" ref="dropdownRef" class="absolute right-0 top-[calc(100%+6px)] z-50 w-40
                       bg-(--color-surface)
                       border border-(--color-border)
                       rounded-xl py-1 overflow-hidden" style="
                    box-shadow:
                        0 8px 24px
                        rgba(6,41,105,0.12);
                ">
                <button v-for="option in THEME_OPTIONS" :key="option.key" type="button" @click="selectTheme(option.key)"
                    :class="[
                        'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium',
                        'transition-colors duration-150 cursor-pointer text-left',

                        option.key === currentTheme.value
                            ? 'bg-(--color-primary-soft) text-(--color-primary)'
                            : 'text-(--color-muted) hover:bg-(--color-surface-soft) hover:text-(--color-text)'
                    ]">
                    <component :is="option.icon" class="w-4 h-4 shrink-0" />

                    <span class="flex-1">
                        {{ t(option.labelKey) }}
                    </span>

                    <CheckIcon class="w-3.5 h-3.5 shrink-0 transition-opacity" :class="option.key === currentTheme.value
                        ? 'opacity-100'
                        : 'opacity-0'
                        " />
                </button>

                <div class="mx-3 my-1 h-px bg-(--color-border)" />

                <p class="px-3 py-1.5 text-[10px] leading-snug text-(--color-muted)">
                    <template v-if="currentTheme === 'system'">
                        {{ t('components.themeToggle.followsOs') }}
                    </template>

                    <template v-else>
                        {{ t('components.themeToggle.overridesOs') }}
                    </template>
                </p>
            </div>
        </Transition>
    </div>
</template>