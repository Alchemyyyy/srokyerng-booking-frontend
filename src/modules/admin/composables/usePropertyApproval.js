// usePropertyApproval.js
import { ref } from 'vue';
import { approvalService } from '../services/approval.service';

export function usePropertyApproval() {
  const properties = ref([]);
  const currentProperty = ref(null);
  const loading = ref(false);
  const processing = ref(false);
  const error = ref(null);

  const fetchProperties = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await approvalService.getPendingProperties(filters);
      if (Array.isArray(response)) {
        properties.value = response;
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
      const response = await approvalService.getPropertyForReview(id);
      currentProperty.value = response.data ? response.data : response;
    } catch (err) {
      error.value = err?.response?.data?.message || err?.message || 'មិនអាចទាញយកទិន្នន័យលម្អិតបានឡើយ។';
    } finally {
      loading.value = false;
    }
  };

  // 🌟 ប្តូរមកប្រើប្រាស់ការបញ្ជូន status_id: 2 សម្រាប់ Approve
  const handleApprove = async (id) => {
    processing.value = true;
    error.value = null;
    try {
      await approvalService.updatePropertyStatus(id, 2);
      return true;
    } catch (err) {
      console.error(err);
      error.value = err?.response?.data?.message || err?.message || 'ការអនុម័តមានបញ្ហា។';
      return false;
    } finally {
      processing.value = false;
    }
  };

  // 🌟 ប្តូរមកប្រើប្រាស់ការបញ្ជូន status_id: 3 ព្រមទាំងមូលហេតុសម្រាប់ Reject
  const handleReject = async (id, reason) => {
    processing.value = true;
    error.value = null;
    try {
      await approvalService.updatePropertyStatus(id, 3, reason);
      return true;
    } catch (err) {
      console.error(err);
      error.value = err?.response?.data?.message || err?.message || 'ការបដិសេធមានបញ្ហា។';
      return false;
    } finally {
      processing.value = false;
    }
  };

  const handleSuspend = async (id, reason) => {
    processing.value = true;
    error.value = null;
    try {
      // ឧបមាថា status_id: 4 គឺសម្រាប់ Suspend (អាចដូរបានទៅតាម Backend របស់អ្នក)
      await approvalService.updatePropertyStatus(id, 4, reason);
      return true;
    } catch (err) {
      console.error(err);
      error.value = err?.response?.data?.message || err?.message || 'ការផ្អាកបណ្តោះអាសន្នមានបញ្ហា។';
      return false;
    } finally {
      processing.value = false;
    }
  };

  const handleSetPending = async (id) => {
    processing.value = true;
    error.value = null;
    try {
      // បោះលេខ 1 ទៅឱ្យ Backend ដើម្បីកំណត់ជា Pending ឡើងវិញ
      await approvalService.updatePropertyStatus(id, 1);
      return true;
    } catch (err) {
      console.error(err);
      error.value = err?.response?.data?.message || err?.message || 'ការប្តូរទៅ Pending មានបញ្ហា។';
      return false;
    } finally {
      processing.value = false;
    }
  };

  return {
    properties,
    currentProperty,
    loading,
    processing,
    error,
    fetchProperties,
    fetchPropertyDetail,
    handleApprove,
    handleReject,
    handleSuspend,
    handleSetPending
  };
}