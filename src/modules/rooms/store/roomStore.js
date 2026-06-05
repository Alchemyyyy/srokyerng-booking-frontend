import { computed, ref } from "vue";
import { defineStore } from "pinia";

const roomStatuses = ["Available", "Occupied", "Maintenance"];

export const useRoomStore = defineStore("rooms", () => {
    const loading = ref(true);
    const error = ref(null);
    const rawProperties = ref([]);
    const rooms = ref([]);
    const selectedPropertyId = ref("all");

    const propertyFilterTabs = computed(() => {
        const propertyTabs = rawProperties.value.map((property) => {
            const roomCount = rooms.value.filter((room) => room.propertyId === property.id).length;

            return {
                id: property.id,
                name: property.name,
                roomCount,
            };
        });

        return [
            {
                id: "all",
                name: "All",
                roomCount: rooms.value.length,
            },
            ...propertyTabs,
        ];
    });

    const filteredRooms = computed(() => {
        if (!selectedPropertyId.value || selectedPropertyId.value === "all") {
            return rooms.value;
        }

        return rooms.value.filter((room) => room.propertyId === selectedPropertyId.value);
    });

    const getRoomMeta = (room, index) => {
        return {
            status: room.status === "Pending" ? "Maintenance" : roomStatuses[index % roomStatuses.length],
            guests: room.guests,
            size: room.size,
            description: room.description,
        };
    };

    const setSelectedPropertyId = (propertyId) => {
        selectedPropertyId.value = propertyId;
    };

    const fetchRoomsData = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch("/data.json");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            rawProperties.value = data.properties || [];
            rooms.value = data.rooms || [];
            selectedPropertyId.value = "all";
        } catch (requestError) {
            error.value = "Failed to load rooms data.";
            console.error(requestError);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        rawProperties,
        rooms,
        selectedPropertyId,
        propertyFilterTabs,
        filteredRooms,
        fetchRoomsData,
        getRoomMeta,
        setSelectedPropertyId,
    };
});
