import { computed, ref, onMounted } from 'vue';
import {
    BuildingOfficeIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
} from '@heroicons/vue/24/outline';

export function useAnalyticsDashboard() {
    const loading = ref(false);
    const error = ref(null);
    const selectedHistory = ref('12m');

    const historyOptions = [
        { value: '6m', label: '6m' },
        { value: '12m', label: '12m' },
        { value: '24m', label: '24m' },
    ];

    const stats = ref({
        properties: 0,
        rooms: 0,
        bookings: 0,
        users: 0,
        owners: 0,
        customers: 0,
        paymentsTotal: 0,
        revenue: 0,
        reviewsCount: 0,
        reviewsAverage: 0
    });

    const propertiesPipeline = ref([]);
    const systemActivities = ref([]);
    const approvalBreakdown = ref([]);
    const quickLinks = ref([]);
    const overviewTimeline = ref({ labels: [], properties: [], rooms: [] });

    const historyWindowMap = { '6m': 6, '12m': 12, '24m': 24 };

    const overviewSeries = computed(() => {
        const windowSize = historyWindowMap[selectedHistory.value] || 12;
        const labelsSource = overviewTimeline.value?.labels || [];
        const startIndex = Math.max(labelsSource.length - windowSize, 0);

        return {
            labels: labelsSource.slice(startIndex),
            datasets: [
                {
                    id: 'properties',
                    label: 'propertiesActive', // i18n key translation target
                    borderColor: '#1268b4',
                    backgroundColor: 'rgba(18, 104, 180, 0.06)',
                    pointBackgroundColor: '#1268b4',
                    borderWidth: 3,
                    tension: 0.38,
                    fill: true,
                    data: (overviewTimeline.value?.properties || []).slice(startIndex),
                },
                {
                    id: 'rooms',
                    label: 'roomsTracked', // i18n key translation target
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.04)',
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 2,
                    tension: 0.38,
                    fill: true,
                    data: (overviewTimeline.value?.rooms || []).slice(startIndex),
                },
            ],
        };
    });

    const loadDashboard = async () => {
        loading.value = true;
        error.value = null;
        try {
            // Fetching via shared API simulation
            await new Promise((resolve) => setTimeout(resolve, 450));

            stats.value = {
                properties: 12,
                rooms: 166,
                bookings: 1487,
                users: 3435,
                owners: 412,
                customers: 3023,
                paymentsTotal: 54200,
                revenue: 48900,
                reviewsCount: 854,
                reviewsAverage: 4.8
            };

            propertiesPipeline.value = [
                { id: 1, name: 'Sokha Phnom Penh Hotel', location: 'Chroy Changvar, PP', rooms: 45, valuation: '12,250', status: 'Approved', statusClass: 'status-approved' },
                { id: 2, name: 'Kampot Garden Villa', location: 'Teouk Chhou, Kampot', rooms: 12, valuation: '9,450', status: 'Pending', statusClass: 'status-pending' },
                { id: 3, name: 'Siem Reap Heritage Resort', location: 'Slok Kram, SR', rooms: 28, valuation: '4,680', status: 'Rejected', statusClass: 'status-rejected' },
                { id: 4, name: 'Mekong Riverside Suites', location: 'Chaktomuk, PP', rooms: 16, valuation: '19,600', status: 'Approved', statusClass: 'status-approved' },
            ];

            systemActivities.value = [
                { id: 1, title: 'newPropertyRequest', description: 'Kampot Garden Villa applied for a commercial listing license tier.', time: '2m ago', icon: BuildingOfficeIcon, iconBg: 'bg-blue-500/10 text-blue-400' },
                { id: 2, title: 'newHostRegistered', description: 'Jane Smith completed identity authorization protocols.', time: '16m ago', icon: UserPlusIcon, iconBg: 'bg-emerald-500/10 text-emerald-400' },
                { id: 3, title: 'systemValidationAlert', description: 'Property listing Node #789 missed spatial asset checklist values.', time: '1h ago', icon: ExclamationTriangleIcon, iconBg: 'bg-rose-500/10 text-rose-400' },
                { id: 4, title: 'userDisputeSubmitted', description: 'Feedback review item processed on booking transaction #204.', time: '4h ago', icon: ChatBubbleLeftRightIcon, iconBg: 'bg-amber-500/10 text-amber-400' },
            ];

            approvalBreakdown.value = [
                { label: 'approvedVerified', count: 9, bgClass: 'bg-emerald-500' },
                { label: 'awaitingAudit', count: 2, bgClass: 'bg-amber-500' },
                { label: 'suspendedDraft', count: 1, bgClass: 'bg-rose-500' },
            ];

            quickLinks.value = [
                { title: 'propertyApprovals', description: 'Open the approval queue for verified listings.', count: 9, to: '/admin/property-approvals' },
                { title: 'roomShowcase', description: 'Review room inventory and completeness.', count: 166, to: '/admin/rooms-showcase' },
                { title: 'reservationMonitoring', description: 'Inspect active and upcoming reservations.', count: 1487, to: '/admin/reservations' },
                { title: 'userManagement', description: 'Manage platform users and access roles.', count: 3435, to: '/admin/users' },
            ];

            overviewTimeline.value = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                properties: [9, 10, 10, 11, 11, 12],
                rooms: [6.2, 6.7, 7.1, 7.8, 8.5, 9.2],
            };

        } catch (err) {
            error.value = "dashboardFetchError"; // Key used for i18n translation mapping
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const setSelectedHistory = (historyValue) => {
        if (historyWindowMap[historyValue]) {
            selectedHistory.value = historyValue;
            loadDashboard();
        }
    };

    onMounted(() => {
        loadDashboard();
    });

    return {
        loading,
        error,
        stats,
        propertiesPipeline,
        systemActivities,
        approvalBreakdown,
        quickLinks,
        selectedHistory,
        historyOptions,
        overviewSeries,
        setSelectedHistory,
        loadDashboard,
    };
}