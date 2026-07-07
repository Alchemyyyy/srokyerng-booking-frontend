// modules/analytics/stores/AdminAnalyticsStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyticsApi } from '../api/analytics.api';
import { adminAnalyticsService } from '../services/analytics.service';

// នាំចូល Icons ពី Heroicons មកដើម្បីធ្វើការ Map
import {
    BuildingOfficeIcon,
    UserPlusIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline';

const iconMap = {
    BuildingOfficeIcon,
    UserPlusIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon
};

export const useAdminAnalyticsStore = defineStore('adminAnalytics', () => {
    // STATES
    const loading = ref(false);
    const error = ref(null);
    const selectedHistory = ref('24m');
    const stats = ref({ properties: 0, pendingProperties: 0, bookings: 0, users: 0, owners: 0, customers: 0, paymentsTotal: 0, revenue: 0, reviewsCount: 0, reviewsAverage: 0 });
    const propertiesPipeline = ref([]);
    const rawSystemActivities = ref([]); // រក្សាទុកតម្លៃ Array ដើមពី Service
    const approvalBreakdown = ref([]);
    const quickLinks = ref([]);
    const overviewTimeline = ref({ labels: [], properties: [], users: [] });

    const historyOptions = ref([]);

    // GETTERS
    // 💡 ដំណោះស្រាយពិសេស៖ បំប្លែងឈ្មោះ Icon ទៅជា Component Object តាមអ្វីដែល ActivityFeed ត្រូវការ
    const systemActivities = computed(() => {
        return rawSystemActivities.value.map(act => ({
            ...act,
            icon: iconMap[act.iconName] || BuildingOfficeIcon
        }));
    });

    const overviewSeries = computed(() => {
        return {
            labels: overviewTimeline.value?.labels || [],
            datasets: [
                {
                    id: 'properties',
                    label: 'Properties',
                    borderColor: '#1268b4',
                    backgroundColor: 'rgba(18, 104, 180, 0.06)',
                    pointBackgroundColor: '#1268b4',
                    borderWidth: 3,
                    tension: 0.38,
                    fill: true,
                    data: overviewTimeline.value?.properties || [],
                },
                {
                    id: 'users',
                    label: 'Users',
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.04)',
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 2,
                    tension: 0.38,
                    fill: true,
                    data: overviewTimeline.value?.users || [],
                },
            ],
        };
    });

    // ACTIONS
    const fetchDashboardData = async () => {
        loading.value = true;
        error.value = null;

        const params = {};
        if (selectedHistory.value !== 'all') {
            const end = new Date();
            const start = new Date();
            const months = parseInt(selectedHistory.value) || 12;
            start.setMonth(start.getMonth() - months);

            // កំណត់ចន្លោះថ្ងៃ start_date និង end_date ទៅតាមលក្ខខណ្ឌច្បាប់របស់ Backend
            params.start_date = start.toISOString().split('T')[0];
            params.end_date = end.toISOString().split('T')[0];
        }

        try {
            // ហៅប្រើប្រាស់ API Endpoints ទាំង ៨ ស្របពេលគ្នា
            const results = await Promise.allSettled([
                analyticsApi.getAdminSummary(params),
                analyticsApi.getAdminUsers(params),
                analyticsApi.getAdminProperties(params),
                analyticsApi.getAdminReservations(params),
                analyticsApi.getAdminPayments(params),
                analyticsApi.getAdminReviews(params),
                analyticsApi.getAdminActivity({ ...params, limit: 20 }),
                analyticsApi.getAdminPendingPropertiesList()
            ]);

            // ទាញយកលទ្ធផល .data ចេញពី Axios Response
            const summary = results[0].status === 'fulfilled' ? results[0].value.data : null
            const users = results[1].status === 'fulfilled' ? results[1].value.data : null
            const properties = results[2].status === 'fulfilled' ? results[2].value.data : null
            const reservations = results[3].status === 'fulfilled' ? results[3].value.data : null
            const payments = results[4].status === 'fulfilled' ? results[4].value.data : null
            const reviews = results[5].status === 'fulfilled' ? results[5].value.data : null
            const activity = results[6].status === 'fulfilled' ? results[6].value.data : null
            const pendingPropertiesRaw = results[7].status === 'fulfilled' ? results[7].value.data : null;
            const pendingProperties = Array.isArray(pendingPropertiesRaw)
                ? pendingPropertiesRaw
                : (pendingPropertiesRaw?.data || []);

            // ដំណើរការកែច្នៃទិន្នន័យតាមរយៈ Service
            const processed = adminAnalyticsService.processDashboardData({
                summary, users, properties, reservations, payments, reviews, activity, pendingProperties
            });

            // រុញទិន្នន័យចូលទៅក្នុង States
            stats.value = processed.stats;
            approvalBreakdown.value = processed.approvalBreakdown;
            propertiesPipeline.value = processed.propertiesPipeline;
            rawSystemActivities.value = processed.systemActivities; // ដាក់ចូល raw state
            overviewTimeline.value = processed.overviewTimeline;

            quickLinks.value = [
                { title: 'Property Approvals', description: 'Open the approval queue for verified listings.', count: stats.value.properties, to: '/admin/property-approvals' },
                { title: 'Pending Approvals', description: 'Review listing authorization items.', count: stats.value.pendingProperties, to: '/admin/property-approvals' },
                { title: 'Reservation Monitoring', description: 'Inspect active and upcoming reservations.', count: stats.value.bookings, to: '/admin/reservations' },
                { title: 'User Management', description: 'Manage platform users and access roles.', count: stats.value.users, to: '/admin/users' },
            ];
            console.log('RAW result[0]:', JSON.stringify(results[0].value, null, 2));

        } catch (err) {
            console.error('Error compiled inside pinia analytics store:', err);
            error.value = 'dashboardFetchError';
        } finally {
            loading.value = false;
        }
    };

    const setHistoryWindow = (windowValue) => {
        selectedHistory.value = windowValue;
        fetchDashboardData();
    };

    return {
        loading,
        error,
        selectedHistory,
        stats,
        propertiesPipeline,
        systemActivities, // បោះ Getter ដែលមាន Object Icon ទៅឱ្យ View
        approvalBreakdown,
        quickLinks,
        overviewTimeline,
        historyOptions,
        overviewSeries,
        fetchDashboardData,
        setHistoryWindow
    };
});