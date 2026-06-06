// src/modules/admin/composables/usePropertyApproval.js
import { ref } from 'vue';
import { approvalService } from '../services/approval.service';

export function usePropertyApproval() {
  const properties = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchProperties = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await approvalService.getPendingProperties(filters);
      
      // បោះលទ្ធផលទៅ Console ដើម្បីពិនិត្យមើលរូបរាងទិន្នន័យពិតប្រាកដលើ Browser
      console.log("ឃ្លាំងទិន្នន័យពី API បោះមក៖", response);

      if (Array.isArray(response)) {
        properties.value = response;
      } else if (response && Array.isArray(response.data)) {
        properties.value = response.data;
      } else {
        properties.value = [];
      }
    } catch (err) {
      error.value = err?.message || 'មិនអាចទាញយកទិន្នន័យបានឡើយ។';
      console.error('Fetch properties error:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    properties,
    loading,
    error,
    fetchProperties
  };
}