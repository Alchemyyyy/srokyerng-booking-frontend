import adminApi from '../api/admin.api.js';

export const userService = {
    async getAllUsers(params = {}) {
        return await adminApi.get('/users', { params });
    },

    async getUser(id) {
        return await adminApi.get(`/users/${id}`);
    },

    async updateUserStatus(id, status) {
        return await adminApi.patch(`/users/${id}/status`, { status });
    }
};