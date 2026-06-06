// ApprovalTable.vue
<script setup>
import { useRouter, useRoute } from 'vue-router';
import { EyeIcon } from '@heroicons/vue/24/outline';

defineProps({
    items: { type: Array, required: true }
});

const router = useRouter();
const route = useRoute();

const navigateToReview = (id) => {
    if (id === undefined || id === null) {
        console.error("Property ID is missing or undefined!");
        return;
    }

    router.push({
        name: 'admin.properties.review',
        params: { id: String(id) }
    });
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
                    <th class="text-right">Operations</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items" :key="item.id || item.property_id">
                    <td>
                        <div class="property-name">{{ item.property_name || 'Unnamed Property' }}</div>
                        <div class="property-category">{{ item.category_name || 'Standard Listing' }}</div>
                    </td>

                    <td>
                        <div class="owner-name">{{ item.owner_name || 'Unknown Host' }}</div>
                        <div class="owner-email">{{ item.owner_email || 'No email provided' }}</div>
                    </td>

                    <td>
                        <div class="location-wrapper">
                            <span v-if="item.address">{{ item.address }}, </span>
                            <span>{{ item.city || item.province || 'Cambodia' }}</span>
                        </div>
                    </td>

                    <td>
                        <span :class="[
                            'status-badge',
                            {
                                'status-pending': item.status_name?.toLowerCase() === 'pending' || item.status_id === 1,
                                'status-approved': item.status_name?.toLowerCase() === 'approved' || item.status_id === 2,
                                'status-rejected': item.status_name?.toLowerCase() === 'rejected' || item.status_id === 3
                            }
                        ]">{{ item.status_name || 'Pending' }}</span>
                    </td>

                    <td class="text-right">
                        <button @click="navigateToReview(item.id || item.property_id)" class="review-btn">
                            <EyeIcon class="btn-icon" />
                            Review
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-wrapper {
    overflow-x: auto;
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

.text-right {
    text-align: right;
}

.review-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary);
    background-color: transparent;
    border: 1px solid var(--color-primary-soft);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    /* បន្ថែម ២ ជួរនេះដើម្បីធានាការចុចបាន ១០០% ដោយមិនបាច់បារម្ភរឿងធាតុផ្សេងមកបាំង */
    position: relative;
    z-index: 1;
}

.review-btn:hover {
    background-color: var(--color-primary-soft);
    border-color: var(--color-primary);
}

.btn-icon {
    width: 0.875rem;
    height: 0.875rem;
}
</style>