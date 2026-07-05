<script setup>
import { ref, watch, computed } from 'vue';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' }
});

const resolvedPlaceholder = computed(() => props.placeholder || t("components.approvalSearch.placeholder"));

const emit = defineEmits(['update:modelValue', 'search']);

const searchQuery = ref(props.modelValue);
let debounceTimeout = null;

// អនុគមន៍ Debounce ដើម្បីកុំឱ្យបាញ់ API គ្រប់ពេលដែលវាយអក្សរ (រង់ចាំវាយចប់ 300ms សិន)
watch(searchQuery, (newQuery) => {
    emit('update:modelValue', newQuery);
    
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        emit('search', newQuery);
    }, 300); // 300ms debounce
});

// វ៉ាស់ទិន្នន័យដើមវិញពេល props ដូរពីខាងក្រៅ
watch(() => props.modelValue, (newVal) => {
    searchQuery.value = newVal;
});

const clearSearch = () => {
    searchQuery.value = '';
    emit('search', '');
};
</script>

<template>
    <div class="search-container">
        <div class="search-input-wrapper">
            <MagnifyingGlassIcon class="search-icon" />
            <input
                v-model="searchQuery"
                type="text"
                :placeholder="resolvedPlaceholder"
                class="search-input"
            />
            <button
                v-if="searchQuery"
                @click="clearSearch"
                type="button"
                class="clear-button"
                :title="t('components.approvalSearch.clearSearch')"
            >
                <XMarkIcon class="clear-icon" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.search-container {
    width: 100%;
    max-width: 480px; /* កម្រាស់ល្មមស្អាត */
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: 14px;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-muted, #9ca3af);
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 42px; /* ទុកចន្លោះសងខាងសម្រាប់ Icon */
    font-size: 0.875rem;
    color: var(--color-text, #1f2937);
    background-color: var(--color-input, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-sm, 6px);
    outline: none;
    transition: all 0.2s ease-in-out;
}

.search-input:focus {
    border-color: var(--color-primary, #10b981);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.clear-button {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--color-muted, #9ca3af);
}

.clear-button:hover {
    background-color: var(--color-surface-soft, #f3f4f6);
    color: var(--color-text, #1f2937);
}

.clear-icon {
    width: 1.1rem;
    height: 1.1rem;
}
</style>