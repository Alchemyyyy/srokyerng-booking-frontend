// modules/analytics/api/analytics.api.js
import http from '@/app/api/http';

export const analyticsApi = {
    getAdminSummary(params) {
        return http.get('/admin/analytics/summary', { params });
    },
    getAdminUsers(params) {
        return http.get('/admin/analytics/users', { params });
    },
    getAdminProperties(params) {
        return http.get('/admin/analytics/properties', { params });
    },
    getAdminReservations(params) {
        return http.get('/admin/analytics/reservations', { params });
    },
    getAdminPayments(params) {
        return http.get('/admin/analytics/payments', { params });
    },
    getAdminReviews(params) {
        return http.get('/admin/analytics/reviews', { params });
    },
    getAdminActivity(params) {
        return http.get('/admin/analytics/activity', { params });
    },

    //owner
    getOwnerRevenue(params) {
        return http.get('/owner/analytics/revenue', { params });
    },
    getOwnerSummary(params) {
        return http.get('/owner/analytics/summary', { params });
    },
    getOwnerProperties(params) {
        return http.get('/owner/analytics/properties', { params });
    },
    getOwnerRooms(params) {
        return http.get('/owner/analytics/rooms', { params });
    },
    getOwnerReservations(params) {
        return http.get('/owner/analytics/reservations', { params });
    },

    getOwnerReservationLatest(params) {
        return http.get('/owner/reservations', { params });
    },
};