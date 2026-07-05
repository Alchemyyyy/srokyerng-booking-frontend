<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n({ useScope: "global" });

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

const emit = defineEmits(["update:currentPage"]);

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit("update:currentPage", page);
  }
};
</script>

<template>
  <nav
    class="flex items-center justify-center gap-2 mt-12"
    :aria-label="t('components.propertyPagination.ariaLabel')"
  >
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="p-2 rounded-xl border border-(--color-border)/60 bg-(--color-surface) text-(--color-muted) hover:text-(--color-text) hover:border-(--color-primary) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeftIcon class="w-5 h-5" />
    </button>

    <div class="flex items-center gap-1">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        class="w-10 h-10 rounded-xl text-sm font-bold transition-all border"
        :class="
          currentPage === page
            ? 'bg-(--color-primary) text-white border-(--color-primary)'
            : 'bg-(--color-surface) text-(--color-muted) border-(--color-border)/60 hover:text-(--color-text)'
        "
      >
        {{ page }}
      </button>
    </div>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="p-2 rounded-xl border border-(--color-border)/60 bg-(--color-surface) text-(--color-muted) hover:text-(--color-text) hover:border-(--color-primary) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronRightIcon class="w-5 h-5" />
    </button>
  </nav>
</template>
