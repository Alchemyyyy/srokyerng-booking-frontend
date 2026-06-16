// Analytics API calls will be added by the analytics module owner.
import http from '@/app/api/http';

export const analyticsApi = {
    // ទាញយកបញ្ជី Properties ទាំងអស់ (ដើម្បីយកមកប្រកបសំបក count និងធ្វើ Pipeline, Breakdown)
    getProperties() {
        return http.get('/admin/properties', { params: { limit: 1000 } });
    },

    // ទាញយកបញ្ជី Bookings ទាំងអស់
    getBookings() {
        return http.get('/admin/reservations', { params: { limit: 1000 } });
    },

    // ទាញយកបញ្ជី Users ទាំងអស់
    getUsers() {
        return http.get('/users');
        
    }
};
