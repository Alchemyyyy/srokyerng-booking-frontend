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
    class="my-25 space-y-6 min-h-screen text-(--color-text) transition-colors duration-300 owner-dashboard ml-64 p-6"
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

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          v-for="(room, index) in filteredRooms"
          :key="room.id"
          class="rounded-xl border border-(--color-border) bg-(--color-surface) flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div
            class="w-full sm:w-[200px] h-48 sm:h-auto overflow-hidden relative flex-shrink-0 bg-(--color-surface-soft)"
          >
            <img
              :src="
                room.image ||
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'
              "
              :alt="room.type"
              class="w-full h-full object-cover"
            />
            <span
              style="
                background-color: var(--color-primary-strong);
                color: var(--color-text-inverse);
              "
              class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase opacity-90"
            >
              ID: {{ room.id }}
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-between">
            <div class="p-5 space-y-3.5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3
                    class="text-base font-bold tracking-tight text-(--color-text)"
                  >
                    {{ room.type }}
                  </h3>
                  <p class="text-xs text-(--color-muted) mt-0.5">
                    Double · {{ room.propertyName }}
                  </p>
                </div>

                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1',
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
                  <span class="w-1.5 h-1.5 bg-current rounded-full"></span>
                  {{ getRoomMeta(room, index).status }}
                </span>
              </div>

              <div
                class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-(--color-muted)"
              >
                <span class="flex items-center gap-1.5">
                  <UserGroupIcon
                    class="h-4 w-4 opacity-70"
                    aria-hidden="true"
                  />
                  {{ getRoomMeta(room, index).guests }} guests
                </span>
                <span class="flex items-center gap-1.5">
                  <ArrowsPointingOutIcon
                    class="h-4 w-4 opacity-70"
                    aria-hidden="true"
                  />
                  {{ getRoomMeta(room, index).size }}
                </span>
              </div>

              <div
                class="flex items-center gap-1.5 text-xs text-(--color-muted)"
              >
                <BanknotesIcon class="h-4 w-4 opacity-70" aria-hidden="true" />
                <span class="font-medium">Base Rate:</span>
                <strong class="text-(--color-text) font-bold text-sm">
                  ${{ room.basePrice }}
                  <span class="text-xs font-medium text-(--color-muted)"
                    >/ night</span
                  >
                </strong>
              </div>

              <p
                class="text-xs text-(--color-muted) line-clamp-2 pt-0.5 font-normal leading-relaxed"
              >
                {{ getRoomMeta(room, index).description }}
              </p>
            </div>

            <div
              class="px-5 py-3 border-t border-(--color-border) bg-(--color-surface-soft) flex items-center justify-between"
            >
              <button
                class="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-primary) hover:bg-(--color-surface-soft) transition-all gap-1.5 cursor-pointer"
              >
                <PencilSquareIcon class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="text-xs font-semibold">Edit Template</span>
              </button>

              <button
                @click="
                  alert(
                    `Delete system prompt triggered for instance context: ${room.id}`,
                  )
                "
                class="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                title="Purge configuration reference"
              >
                <TrashIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
