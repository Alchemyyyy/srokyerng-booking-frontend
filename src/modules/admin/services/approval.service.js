// src/modules/admin/services/approval.service.js
import http from '@/app/api/http.js';

export const approvalService = {
    // សម្រាប់ទាញយកបញ្ជីឈ្មោះ Properties ទាំងអស់
    async getPendingProperties(params = {}) {
        const data = await http.get('/admin/properties', { params });
        return data;
    },

    // 🌟 កែឱ្យត្រូវតាម Postman រូបទី ១៖ គឺប្រើ `/properties/{id}` (គ្មានពាក្យ admin ទេ)
    async getPropertyForReview(id) {
        const data = await http.get(`/properties/${id}`);
        return data;
    },

    // 🌟 កែឱ្យត្រូវតាម Postman រូបទី ២៖ ប្រើ PATCH ទៅកាន់ `/admin/properties/{id}/status`
    async updatePropertyStatus(id, statusId, reason = null) {
        const payload = {
            status_id: statusId
        };
        
        // ប្រសិនបើមានការបដិសេធ (Reject) ត្រូវភ្ជាប់មូលហេតុទៅជាមួយ
        if (reason !== null) {
            payload.rejection_reason = reason;
        }

        const data = await http.patch(`/admin/properties/${id}/status`, payload);
        return data;
    }
};