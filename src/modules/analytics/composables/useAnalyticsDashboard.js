import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminAnalyticsStore } from '../stores/AdminAnalyticsStore';
import {
    BuildingOfficeIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
} from '@heroicons/vue/24/outline';

const iconMap = {
    BuildingOfficeIcon,
    UserPlusIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon
};

export function useAnalyticsDashboard() {
    const store = useAdminAnalyticsStore();
    
    const {
        loading,
        error,
        selectedHistory,
        stats,
        propertiesPipeline,
        approvalBreakdown,
        quickLinks,
        overviewTimeline
    } = storeToRefs(store);

    const historyOptions = [
        { value: '6m', label: '6m' },
        { value: '12m', label: '12m' },
        { value: '24m', label: '24m' },
    ];

    const historyWindowMap = { '6m': 6, '12m': 12, '24m': 24 };

    // 💡 ផ្គូផ្គង Icon តាមឈ្មោះអក្សរដែលបានមកពី Service Layer
    const systemActivities = computed(() => {
        return store.systemActivities.map(activity => ({
            ...activity,
            icon: iconMap[activity.icon] || BuildingOfficeIcon
        }));
    });

    // 📊 រៀបចំទម្រង់ Datasets សម្រាប់ Line Chart
    const overviewSeries = computed(() => {
        const windowSize = historyWindowMap[selectedHistory.value] || 12;
        const labelsSource = overviewTimeline.value?.labels || [];
        const startIndex = Math.max(labelsSource.length - windowSize, 0);

        return {
            labels: labelsSource.slice(startIndex),
            datasets: [
                {
                    id: 'properties',
                    label: 'propertiesActive',
                    borderColor: '#1268b4',
                    backgroundColor: 'rgba(18, 104, 180, 0.06)',
                    pointBackgroundColor: '#1268b4',
                    borderWidth: 3,
                    tension: 0.38,
                    fill: true,
                    data: (overviewTimeline.value?.properties || []).slice(startIndex),
                },
                {
                    id: 'users',
                    label: 'usersRegistered',
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.04)',
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 2,
                    tension: 0.38,
                    fill: true,
                    data: (overviewTimeline.value?.users || []).slice(startIndex),
                },
            ],
        };
    });

    const loadDashboard = () => store.fetchDashboardData();
    const setSelectedHistory = (value) => store.setHistoryWindow(value);

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