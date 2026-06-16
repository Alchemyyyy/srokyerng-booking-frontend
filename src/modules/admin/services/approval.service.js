import adminApi from '../api/admin.api.js';

export const approvalService = {
    async getAllProperties(params = {}) {
        return await adminApi.get('/admin/properties', { params });
    },

    async getProperty(id) {
        return await adminApi.get(`/admin/properties/${id}`);
    },

    async getPropertyForReview(id) {
        return await adminApi.get(`/properties/${id}`);
    },

    async getAllPropertyImages(id) {
        return await adminApi.get(`/properties/${id}/images`);
    },

    async updatePropertyStatus(id, statusId, reason = null) {
        const payload = {
            status_id: statusId
        };

        if (reason !== null) {
            payload.rejection_reason = reason;
        }

        return await adminApi.patch(`/admin/properties/${id}/status`, payload);
    }
};