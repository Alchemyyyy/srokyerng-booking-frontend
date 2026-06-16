import { defineStore } from 'pinia';
import { analyticsApi } from '../api/analytics.api';
import { adminAnalyticsService } from '../services/analytics.service';

export const useAdminAnalyticsStore = defineStore('adminAnalytics', {
    state: () => ({
        loading: false,
        error: null,
        selectedHistory: '12m',
        stats: { properties: 0, pendingProperties: 0, bookings: 0, users: 0, owners: 0, customers: 0, paymentsTotal: 0, revenue: 0, reviewsCount: 0, reviewsAverage: 0 },
        propertiesPipeline: [],
        systemActivities: [],
        approvalBreakdown: [],
        quickLinks: [],
        overviewTimeline: { labels: [], properties: [], users: [] }
    }),

    actions: {
        async fetchDashboardData() {
            this.loading = true;
            this.error = null;

            try {
                // 📡 ១. ហៅទិន្នន័យ Raw ពី API ទាំងអស់ព្រមគ្នា (Parallel requests)
                const responses = await Promise.allSettled([
                    analyticsApi.getProperties(),
                    // analyticsApi.getRooms(),
                    analyticsApi.getBookings(),
                    analyticsApi.getUsers()
                ]);
                console.log(responses);

                const propertiesList = responses[0].status === 'fulfilled'
                    ? (responses[0].value.data?.data || responses[0].value.data || [])
                    : [];

                const bookingsList = responses[1].status === 'fulfilled'
                    ? (responses[1].value.data?.data || responses[1].value.data || [])
                    : [];

                const usersList = responses[2].status === 'fulfilled'
                    ? (
                        responses[2].value.data?.data?.users ||
                        responses[2].value.data?.users ||
                        []
                    )
                    : [];

                const roomsList = [];

                console.log('=== USERS RESPONSE ===');
                console.log(responses[2]);
                console.log('=== USERS LIST ===');
                console.log(usersList);
                console.log('=== USERS COUNT ===');
                console.log('usersList', usersList);
                console.log('usersCount', usersList.length);

                // ⚙️ ២. បញ្ជូនទៅឱ្យ Service Layer គណនា និងបម្លែងទម្រង់
                const processed = adminAnalyticsService.processDashboardData({
                    propertiesList,
                    roomsList,
                    bookingsList,
                    usersList
                });

                // 📥 ៣. យកលទ្ធផលដែលស្អាតរួចរាល់មក រក្សាទុកក្នុង States របស់ Store
                this.stats = processed.stats;
                this.approvalBreakdown = processed.approvalBreakdown;
                this.propertiesPipeline = processed.propertiesPipeline;
                this.systemActivities = processed.systemActivities;
                this.overviewTimeline = processed.overviewTimeline;

                // 🔗 រៀបចំ Quick Links កាត ដោយយកលេខ Dynamic ចេញពីលទ្ធផលគណនា
                this.quickLinks = [
                    { title: 'propertyApprovals', description: 'Open the approval queue for verified listings.', count: this.stats.properties, to: '/admin/property-approvals' },
                    { title: 'pendingApprovals', description: 'pendingApprovals', count: this.stats.pendingProperties, to: '/admin/property-approvals' },
                    { title: 'reservationMonitoring', description: 'Inspect active and upcoming reservations.', count: this.stats.bookings, to: '/admin/reservations' },
                    { title: 'userManagement', description: 'Manage platform users and access roles.', count: this.stats.users, to: '/admin/users' },
                ];

            } catch (err) {
                console.error('Error compiled inside pinia analytics store:', err);
                this.error = 'dashboardFetchError';
            } finally {
                this.loading = false;
            }
        },

        setHistoryWindow(windowValue) {
            this.selectedHistory = windowValue;
        }
    }
});