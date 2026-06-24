// ApprovalTable.vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, } from 'vue-router';
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/solid';

defineProps({
    items: { type: Array, required: true },
    isProcessing: { type: Boolean, default: false }
});

const emit = defineEmits(['approve', 'reject', 'row-click', 'change-status-click']);
const router = useRouter();

// const navigateToReview = (id) => {
//     if (id === undefined || id === null) {
//         console.error("Property ID is missing or undefined!");
//         return;
//     }

//     router.push({
//         name: 'admin.properties.review',
//         params: { id: String(id) }
//     });
// };

const activeDropdownId = ref(null);
const isDropup = ref(false);

const toggleDropdown = (event, id) => {
    event.stopPropagation(); // ការពារកុំឱ្យជាន់គ្នាជាមួយ Row Click
    if (activeDropdownId.value === id) {
        activeDropdownId.value = null;
    } else {
        activeDropdownId.value = id;

        const rect = event.currentTarget.getBoundingClientRect();
        const spaceBottom = window.innerHeight - rect.bottom;
        isDropup.value = spaceBottom < 180;
    }
};

const handleSelectStatus = (id, targetStatus) => {
    activeDropdownId.value = null;
    emit('change-status-click', { id, status: targetStatus });
};

const closeAllDropdowns = () => { activeDropdownId.value = null; };
onMounted(() => window.addEventListener('click', closeAllDropdowns));
onUnmounted(() => window.removeEventListener('click', closeAllDropdowns));

const handleRowClick = (event, itemId) => {
    if (event.target.closest('.action-buttons-container') || event.target.closest('.dropdown-menu-wrapper')) {
        console.log("Clicked on action elements, preventing row navigation.");
        return;
    }

    if (itemId) {
        emit('row-click', itemId);
    }
};
</script>

<template>
    <div class="table-wrapper">
        <table class="approval-table">
            <thead>
                <tr>
                    <th>Property Detail</th>
                    <th>Host / Owner</th>
                    <th>Geographic Location</th>
                    <th>Audit Status</th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items" :key="item.id"
                    @click="handleRowClick($event, item.id)" style="cursor: pointer;">
                    <td>
                        <div class="property-name">{{ item.property_name || 'Unnamed Property' }}</div>
                        <div class="property-category">{{ item.category?.category_name || 'Standard Listing' }}</div>
                    </td>

                    <td>
                        <div class="owner-name">{{ item.owner?.owner_name || 'Unknown Host' }}</div>
                        <div class="owner-email">{{ item.owner?.owner_email || 'No email provided' }}</div>
                    </td>

                    <td>
                        <div class="location-wrapper">
                            <span v-if="item.address">{{ item.address }}, </span>
                            <span>{{ item.city?.city_name || item.province?.province_name || 'Cambodia' }}</span>
                        </div>
                    </td>

                    <td>
                        <span :class="[
                            'status-badge',
                            {
                                'status-pending': item.status?.status_name?.toLowerCase() === 'pending' || item.status?.status_id === 1,
                                'status-approved': item.status?.status_name?.toLowerCase() === 'approved' || item.status?.status_id === 2,
                                'status-rejected': item.status?.status_name?.toLowerCase() === 'rejected' || item.status?.status_id === 3
                            }
                        ]">{{ item.status?.status_name || 'Pending' }}</span>
                    </td>

                    <td class="text-right">
                        <div class="action-buttons-container">
                            <template v-if="item.status?.status_id === 1 || item.status?.status_name?.toLowerCase() === 'pending'">
                                <button @click="emit('approve', item.id)" :disabled="isProcessing"
                                    class="action-inline-btn btn-approve-sm">
                                    <CheckIcon class="btn-icon-sm" /> Approve
                                </button>
                                <button @click="emit('reject', item.id)" :disabled="isProcessing"
                                    class="action-inline-btn btn-reject-sm">
                                    <XMarkIcon class="btn-icon-sm" /> Reject
                                </button>
                            </template>

                            <template v-else>
                                <div class="dropdown-menu-wrapper">
                                    <button @click="toggleDropdown($event, item.id)"
                                        :disabled="isProcessing" class="action-inline-btn btn-edit-sm">
                                        Edit Status
                                        <ChevronDownIcon class="btn-icon-sm ml-1" />
                                    </button>

                                    <div v-if="activeDropdownId === item.id"
                                        class="dropdown-popover" :class="{ 'open-upward': isDropup }">
                                        <button v-if="item.status?.status_id !== 1"
                                            @click.stop="handleSelectStatus(item.id, 'pending')"
                                            class="dropdown-item text-warning-item">Set to Pending</button>
                                        <button v-if="item.status?.status_id !== 2"
                                            @click.stop="handleSelectStatus(item.id, 'approve')"
                                            class="dropdown-item text-success-item">Approve Listing</button>
                                        <button v-if="item.status?.status_id !== 3"
                                            @click.stop="handleSelectStatus(item.id, 'reject')"
                                            class="dropdown-item text-danger-item">Reject Listing</button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-wrapper {
    overflow: visible;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-card);
}

.approval-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.875rem;
    color: var(--color-text);
}

.approval-table thead {
    background-color: var(--color-surface-soft);
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-muted);
    font-weight: 600;
    letter-spacing: 0.05em;
}

/* រួមបញ្ចូល Selector td និង th ចូលគ្នាតែមួយឱ្យស្អាត */
.approval-table th,
.approval-table td {
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
}

.approval-table tbody tr {
    transition: background-color 0.2s ease;
}

.approval-table tbody tr:hover {
    background-color: var(--color-surface-soft);
}

.property-name {
    font-weight: 600;
    color: var(--color-text);
}

.property-category,
.owner-email {
    font-size: 0.75rem;
    color: var(--color-muted);
    margin-top: 2px;
}

.owner-name {
    font-weight: 500;
    color: var(--color-text);
}

/* ដំណោះស្រាយត្រឹមត្រូវ៖ ប្រើ block លើ wrapper ខាងក្នុង td */
.location-wrapper {
    color: var(--color-muted);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.status-badge {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: capitalize;
    display: inline-block;
}

.status-pending {
    background-color: var(--color-warning-soft);
    color: var(--color-warning);
}

.status-approved {
    background-color: var(--color-success-soft);
    color: var(--color-success);
}

.status-rejected {
    background-color: var(--color-danger-soft);
    color: var(--color-danger);
}

.text-right {
    text-align: right;
}

/* រៀបចំប៊ូតុងឱ្យរត់ជួរដេកស្អាត */
.action-buttons-container {
    display: inline-flex;
    align-items: center;
    gap: var(--space-md);
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-primary-soft);
    cursor: pointer;
    color: var(--color-primary);
    transition: all 0.2s;
}

.icon-btn:hover {
    color: var(--color-text);
    background-color: var(--color-surface-soft);
}

.action-inline-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-approve-sm {
    background-color: var(--color-success);
    border: 1px solid var(--color-success);
    color: white;
}

[data-theme="dark"] {
    .btn-approve-sm {
        background-color: #2da154;
        border: 1px solid var(--color-success);
        color: var(--color-text);
    }
}

.btn-approve-sm:hover {
    background-color: var(--color-success-soft);
    border: 1px solid var(--color-success);
    color: var(--color-success);
}

.btn-reject-sm {
    background-color: transparent;
    border: 1px solid var(--color-danger);
    color: var(--color-danger);
}

.btn-reject-sm:hover {
    background-color: var(--color-danger-soft);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-icon {
    width: 0.875rem;
    height: 0.875rem;
}

.btn-icon-sm {
    width: 0.75rem;
    height: 0.75rem;
}


.dropdown-menu-wrapper {
    position: relative;
    display: inline-block;
}

.btn-edit-sm {
    /* background-color: var(--color-surface-soft); */
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
}

.btn-edit-sm:hover {
    background-color: var(--color-primary-soft);
    border-color: var(--color-primary);
    /* color: var(--color-primary); */
}

.dropdown-popover {
    position: absolute;
    right: 0;
    top: 110%;
    background-color: var(--color-surface);
    border: 1px solid var(--color-primary);
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 999;
    min-width: 150px;
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    /* overflow: hidden; */
}

.dropdown-item {
    padding: 8px 12px;
    font-size: 0.815rem;
    font-weight: 500;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.15s ease;
}

.dropdown-item:hover {
    background-color: var(--color-primary-soft);
}

.text-warning-item {
    color: var(--color-warning);
}

.text-success-item {
    color: var(--color-success);
}

.text-danger-item {
    color: var(--color-danger);
}

.ml-1 {
    margin-left: 0.25rem;
}

.dropdown-popover.open-upward {
    top: auto;
    bottom: 120%;
    /* រុញទៅលើប៊ូតុង Edit Status វិញ */
    box-shadow: 0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>