import { computed, ref } from 'vue';
import {
    BuildingOfficeIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    UserGroupIcon,
    UserPlusIcon,
} from '@heroicons/vue/24/outline';

export function useAnalyticsDashboard() {
    const loading = ref(false);
    const selectedHistory = ref('12m');

    const historyOptions = [
        { value: '6m', label: '6 months' },
        { value: '12m', label: '12 months' },
        { value: '24m', label: '24 months' },
    ];

    const stats = ref({
        properties: 12,
        rooms: 166,
        bookings: 1487,
        users: 3435,
    });

    const propertiesPipeline = ref([
        { id: 1, name: 'Sokha Phnom Penh Hotel', location: 'Chroy Changvar, PP', rooms: 45, valuation: '12,250', status: 'Approved', statusClass: 'status-approved' },
        { id: 2, name: 'Kampot Garden Villa', location: 'Teouk Chhou, Kampot', rooms: 12, valuation: '9,450', status: 'Pending', statusClass: 'status-pending' },
        { id: 3, name: 'Siem Reap Heritage Resort', location: 'Slok Kram, SR', rooms: 28, valuation: '4,680', status: 'Rejected', statusClass: 'status-rejected' },
        { id: 4, name: 'Mekong Riverside Suites', location: 'Chaktomuk, PP', rooms: 16, valuation: '19,600', status: 'Approved', statusClass: 'status-approved' },
    ]);

    const systemActivities = ref([
        { id: 1, title: 'New property request submitted', description: 'Kampot Garden Villa applied for a commercial listing license tier.', time: '2 minutes ago', icon: BuildingOfficeIcon, iconBg: 'bg-blue-500/10 text-blue-400' },
        { id: 2, title: 'New host operator registered', description: 'Jane Smith completed identity authorization protocols.', time: '16 minutes ago', icon: UserPlusIcon, iconBg: 'bg-emerald-500/10 text-emerald-400' },
        { id: 3, title: 'Critical baseline validation alert', description: 'Property listing Node #789 missed spatial asset checklist values.', time: '1 hour ago', icon: ExclamationTriangleIcon, iconBg: 'bg-rose-500/10 text-rose-400' },
        { id: 4, title: 'User dispute resolution submitted', description: 'Feedback review item processed on booking transaction #204.', time: '4 hours ago', icon: ChatBubbleLeftRightIcon, iconBg: 'bg-amber-500/10 text-amber-400' },
    ]);

    const approvalBreakdown = ref([
        { label: 'Approved & Fully Verified', count: 9, bgClass: 'bg-emerald-500' },
        { label: 'Awaiting Audit Actions', count: 2, bgClass: 'bg-amber-500' },
        { label: 'Suspended / Draft Mode', count: 1, bgClass: 'bg-rose-500' },
    ]);

    const quickLinks = ref([
        { title: 'Property approvals', description: 'Open the approval queue for verified listings.', count: 9, to: '/admin/property-approvals' },
        { title: 'Room showcase', description: 'Review room inventory and completeness.', count: 166, to: '/admin/rooms-showcase' },
        { title: 'Reservation monitoring', description: 'Inspect active and upcoming reservations.', count: 1487, to: '/admin/reservations' },
        { title: 'User management', description: 'Manage platform users and access roles.', count: 3435, to: '/admin/users' },
    ]);

    const numberFormatter = new Intl.NumberFormat('en-US');

    const overviewTimeline = {
        labels: [
            'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24',
            'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
            'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25',
            'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
        ],
        properties: [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13],
        rooms: [1.4, 1.6, 1.9, 2.1, 2.4, 2.8, 3.2, 3.5, 3.8, 4.2, 4.7, 5, 5.3, 5.8, 6.2, 6.7, 7.1, 7.8, 8.5, 9.2, 10.1, 11.4, 12.8, 14.1],
    };

    const historyWindowMap = {
        '6m': 6,
        '12m': 12,
        '24m': 24,
    };

    const overviewSeries = computed(() => {
        const windowSize = historyWindowMap[selectedHistory.value] || 12;
        const startIndex = Math.max(overviewTimeline.labels.length - windowSize, 0);

        return {
            labels: overviewTimeline.labels.slice(startIndex),
            datasets: [
                {
                    id: 'properties',
                    label: 'Properties Active',
                    borderColor: '#1268b4',
                    backgroundColor: 'rgba(18, 104, 180, 0.06)',
                    pointBackgroundColor: '#1268b4',
                    borderWidth: 3,
                    tension: 0.38,
                    fill: true,
                    data: overviewTimeline.properties.slice(startIndex),
                },
                {
                    id: 'rooms',
                    label: 'Rooms Tracked (x10)',
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.04)',
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 2,
                    tension: 0.38,
                    fill: true,
                    data: overviewTimeline.rooms.slice(startIndex),
                },
            ],
        };
    });

    const formatNumber = (value) => numberFormatter.format(value);

    const loadDashboard = () => {
        loading.value = true;

        window.setTimeout(() => {
            loading.value = false;
        }, 600);
    };

    const setSelectedHistory = (historyValue) => {
        if (historyWindowMap[historyValue]) {
            selectedHistory.value = historyValue;
        }
    };

    return {
        loading,
        stats,
        propertiesPipeline,
        systemActivities,
        approvalBreakdown,
        quickLinks,
        selectedHistory,
        historyOptions,
        overviewSeries,
        setSelectedHistory,
        formatNumber,
        loadDashboard,
    };
}