import { defineStore } from 'pinia';
import { ref } from 'vue';
import { approvalService } from '../services/approval.service';
import { getImageUrl } from '../utils/formatters';

export const useApprovalStore = defineStore('admin-approval', () => {
    const properties = ref([]);
    const currentProperty = ref(null);
    const propertyImages = ref([]);
    const loading = ref(false);
    const processing = ref(false);
    const error = ref(null);
    // Separate from `error` on purpose: `error` gates the page-level
    // "Data Fetching Interrupted" screen (hides the whole table). Action
    // failures (approve/reject/suspend/pending) are shown inline in their
    // confirmation modal instead, so they must never set `error` — doing so
    // previously made a failed approve (e.g. "missing image") blank out the
    // entire properties list after the modal closed.
    const actionError = ref(null);

    const fetchProperties = async (params = {}) => {
        loading.value = true;
        error.value = null;
        try {
            // The backend defaults to a 10-row page when no limit is given.
            // This view does its own client-side filtering/sorting/pagination
            // across the full queue, so it needs every row up front.
            const response = await approvalService.getAllProperties({ limit: 1000, page: 1, ...params });
            if (Array.isArray(response)) {
                properties.value = response?.data?.data || [];
            } else if (response && Array.isArray(response.data)) {
                properties.value = response.data;
            } else {
                properties.value = [];
            }
        } catch (err) {
            error.value = err?.response?.data?.message || err?.message || 'មិនអាចទាញយកទិន្នន័យបានឡើយ។';
            console.error('Fetch properties error:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchPropertyDetail = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await approvalService.getProperty(id);
            currentProperty.value = response.data ? response.data : response;
        } catch (err) {
            error.value = err?.response?.data?.message || err?.message || 'មិនអាចទាញយកទិន្នន័យលម្អិតបានឡើយ។';
        } finally {
            loading.value = false;
        }
    };


    const fetchPropertyImages = async (id) => {
        try {
            const res = await approvalService.getAllPropertyImages(id);
            // ត្រួតពិនិត្យថាជា Array ឬជា Object Response
            const items = Array.isArray(res) ? res : res?.data || [];

            // 💡 Map ភ្ជាប់ Domain ទៅឱ្យរូបភាពនីមួយៗ
            propertyImages.value = items.map((img) => ({
                ...img,
                url: getImageUrl(img.image_url),
            }));
        } catch (err) {
            console.error('Fetch property images error:', err);
            propertyImages.value = [];
        }
    };

    // status_id: 2 សម្រាប់ Approve
    const handleApprove = async (id) => {
        processing.value = true;
        actionError.value = null;
        try {
            await approvalService.updatePropertyStatus(id, 2);
            return true;
        } catch (err) {
            console.error(err);
            actionError.value = err?.response?.data?.message || err?.message || 'ការអនុម័តមានបញ្ហា។';
            return false;
        } finally {
            processing.value = false;
        }
    };

    // status_id: 3 សម្រាប់ Reject
    const handleReject = async (id, reason) => {
        processing.value = true;
        actionError.value = null;
        try {
            await approvalService.updatePropertyStatus(id, 3, reason);
            return true;
        } catch (err) {
            console.error(err);
            actionError.value = err?.response?.data?.message || err?.message || 'ការបដិសេធមានបញ្ហា។';
            return false;
        } finally {
            processing.value = false;
        }
    };

    // status_id: 4 សម្រាប់ Suspend
    const handleSuspend = async (id, reason) => {
        processing.value = true;
        actionError.value = null;
        try {
            await approvalService.updatePropertyStatus(id, 4, reason);
            return true;
        } catch (err) {
            console.error(err);
            actionError.value = err?.response?.data?.message || err?.message || 'ការផ្អាកបណ្តោះអាសន្នមានបញ្ហា។';
            return false;
        } finally {
            processing.value = false;
        }
    };

    // status_id: 1 សម្រាប់កំណត់ជា Pending ឡើងវិញ
    const handleSetPending = async (id) => {
        processing.value = true;
        actionError.value = null;
        try {
            await approvalService.updatePropertyStatus(id, 1);
            return true;
        } catch (err) {
            console.error(err);
            actionError.value = err?.response?.data?.message || err?.message || 'ការប្តូរទៅ Pending មានបញ្ហា។';
            return false;
        } finally {
            processing.value = false;
        }
    };

    return {
        properties,
        currentProperty,
        propertyImages,
        loading,
        processing,
        error,
        actionError,
        fetchProperties,
        fetchPropertyDetail,
        fetchPropertyImages,
        handleApprove,
        handleReject,
        handleSuspend,
        handleSetPending
    };
});