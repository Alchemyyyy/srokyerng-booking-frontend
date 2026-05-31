<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import AppButton from "@/shared/components/AppButton.vue";
import { useRoomStore } from "../store/roomStore";
import {
  ArrowsPointingOutIcon,
  BanknotesIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const roomStore = useRoomStore();
const {
  loading,
  error,
  selectedPropertyId,
  propertyFilterTabs,
  filteredRooms,
} = storeToRefs(roomStore);
const { fetchRoomsData, getRoomMeta, setSelectedPropertyId } = roomStore;

onMounted(fetchRoomsData);
</script>

<template>
  <div
    class="my-25 space-y-6 min-h-screen text-(--color-text) transition-colors duration-300 owner-dashboard my-25 transition-all ml-64"
  >
    <header
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Rooms</h1>
        <p class="text-sm text-(--color-muted) mt-1">
          Manage rooms across all your properties.
        </p>
      </div>
      <AppButton class="inline-flex items-center gap-2">
        <PlusIcon class="h-4 w-4" aria-hidden="true" />
        <span>Add Room</span>
      </AppButton>
    </header>

    <nav class="flex flex-wrap gap-3 py-2">
      <AppButton
        v-for="tab in propertyFilterTabs"
        :key="tab.id"
        @click="setSelectedPropertyId(tab.id)"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center gap-2.5',
          selectedPropertyId === tab.id
            ? 'bg-(--color-primary-soft) border-(--color-primary) text-(--color-primary-strong)'
            : 'bg-(--color-surface) border-(--color-border) text-(--color-muted) hover:text-(--color-text)',
        ]"
        variant=""
      >
        {{ tab.name }}
        <span
          :class="[
            'text-xs px-1.5 py-0.5 rounded-full font-bold',
            selectedPropertyId === tab.id
              ? 'bg-(--color-primary) text-white'
              : 'bg-(--color-surface-soft) text-(--color-muted)',
          ]"
        >
          {{ tab.roomCount }}
        </span>
      </AppButton>
    </nav>

    <main class="relative min-h-100">
      <div
        v-if="error"
        class="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
      >
        {{ error }}
      </div>

      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div
          class="animate-spin rounded-full h-10 w-10 border-2 border-t-(--color-primary) border-(--color-border)"
        ></div>
      </div>

      <div
        v-else-if="filteredRooms.length === 0"
        class="text-center py-20 border border-dashed border-(--color-border) rounded-xl"
      >
        <p class="text-sm text-(--color-muted)">
          No active room templates mapped to this specific asset filter.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(room, index) in filteredRooms"
          :key="room.id"
          class="rounded-xl border border-(--color-border) bg-(--color-surface) flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div class="p-5 space-y-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3
                  class="text-lg font-bold tracking-tight text-(--color-text)"
                >
                  {{ room.type }}
                </h3>
                <p class="text-xs text-(--color-muted) mt-0.5">
                  Double · {{ room.propertyName }}
                </p>
              </div>

              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold tracking-wide border',
                  getRoomMeta(room, index).status === 'Available'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : '',
                  getRoomMeta(room, index).status === 'Occupied'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : '',
                  getRoomMeta(room, index).status === 'Maintenance'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : '',
                ]"
              >
                ● {{ getRoomMeta(room, index).status }}
              </span>
            </div>

            <div
              class="flex items-center gap-4 text-xs font-medium text-(--color-muted)"
            >
              <span class="flex items-center gap-1">
                <UserGroupIcon class="h-4 w-4" aria-hidden="true" />
                {{ getRoomMeta(room, index).guests }} guests
              </span>
              <span class="flex items-center gap-1">
                <BanknotesIcon class="h-4 w-4" aria-hidden="true" />
                <strong class="text-(--color-text) font-bold">
                  ${{ room.basePrice }} /night</strong
                >
              </span>
              <span class="flex items-center gap-1">
                <ArrowsPointingOutIcon class="h-4 w-4" aria-hidden="true" />
                {{ getRoomMeta(room, index).size }}
              </span>
            </div>

            <p
              class="text-sm text-(--color-muted) line-clamp-2 pt-1 font-normal leading-relaxed"
            >
              {{ getRoomMeta(room, index).description }}
            </p>
          </div>

          <div
            class="px-5 py-3 border-t border-(--color-border) bg-(--color-surface-soft) flex items-center justify-between"
          >
            <button
              class="inline-flex items-center justify-center px-4 py-1 rounded-sm border border-(--color-border) bg-(--color-surface) text-(--color-primary) hover:bg-(--color-surface-soft) transition-all gap-1.5"
            >
              <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
              <span class="text-xs font-medium">Edit</span>
            </button>

            <button
              @click="
                alert(
                  `Delete system prompt triggered for instance context: ${room.id}`,
                )
              "
              class="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
              title="Purge configuration reference"
            >
              <TrashIcon class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Smooth grid list scale transitions hook */
.line-clamp-2 {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
