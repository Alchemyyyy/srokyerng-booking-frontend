// src/modules/admin/services/approval.service.js
import http from '@/app/api/http.js';

export const approvalService = {
    // ១. កែឱ្យត្រូវនឹង Postman គឺ '/admin/properties'
    async getPendingProperties(params = {}) {
        const data = await http.get('/admin/properties', { params });
        return data;
    },

    // ២. សម្រាប់ទំព័រលម្អិត ប្រសិនបើ Backend ប្រើប្រាស់ផ្លូវដូចគ្នា ត្រូវដូរដែរ៖
    async getPropertyForReview(id) {
        const data = await http.get(`/admin/properties/${id}`);
        return data;
    },

    async approveProperty(id) {
        const data = await http.post(`/admin/properties/${id}/approve`);
        return data;
    },

    async rejectProperty(id, reason) {
        const data = await http.post(`/admin/properties/${id}/reject`, { reason });
        return data;
    }
};