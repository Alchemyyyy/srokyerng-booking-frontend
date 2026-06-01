import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
    HomeIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    StarIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/vue/24/outline';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const palette = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-info)', 'var(--color-muted)'];

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat('en-US');

const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

const buildChartPoints = (values, width = 640, height = 220, padding = 24) => {
    const safeValues = values.length ? values : [0];
    const maxValue = Math.max(...safeValues, 1);
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    return safeValues.map((value, index) => {
        const x = padding + (innerWidth * index) / Math.max(safeValues.length - 1, 1);
        const y = padding + innerHeight - (value / maxValue) * innerHeight;

        return { x, y };
    });
};

const buildLinePath = (points) => {
    if (!points.length) return '';

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
};

const buildAreaPath = (points, height = 220, padding = 24) => {
    if (!points.length) return '';

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    return `${buildLinePath(points)} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
};

export const useAnalyticsDashboardStore = defineStore('owner-analytics-dashboard', () => {
    const loading = ref(true);
    const error = ref(null);
    const activeTab = ref('overview');
    const monthWindow = ref(12);
    const selectedYear = ref(null);
    const tabs = ref([
        { key: 'overview', label: 'Overview' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'traffic', label: 'Traffic' },
    ]);
    const dashboardData = ref({
        summary: {
            totalProperties: 0,
            totalBookings: 0,
            totalRevenue: 0,
            avgRating: 0,
            trends: {
                properties: '',
                bookings: '',
                revenue: '',
                rating: '',
            },
        },
        analytics: {
            weeklyTraffic: [],
            monthlyPerformance: [],
            segmentPerformance: [],
        },
        paymentStatus: {
            isComplete: true,
            missingFields: [],
            lastUpdated: null,
        },
        properties: [],
        rooms: [],
        recentReservations: [],
    });

    const analyticsData = computed(() => dashboardData.value.analytics || {});

    const yearlyPerformance = computed(() => {
        const source = analyticsData.value.yearlyPerformance;

        if (!Array.isArray(source)) {
            return [];
        }

        return source
            .map((entry) => ({
                year: Number(entry.year) || 0,
                summary: entry.summary || null,
                segmentPerformance: Array.isArray(entry.segmentPerformance) ? entry.segmentPerformance : [],
                monthlyPerformance: Array.isArray(entry.monthlyPerformance)
                    ? entry.monthlyPerformance.map((item) => ({
                        label: item.label,
                        revenue: Number(item.revenue) || 0,
                        expenses: Number(item.expenses) || 0,
                        profit: Number(item.profit) || (Number(item.revenue) || 0) - (Number(item.expenses) || 0),
                    }))
                    : [],
            }))
            .filter((entry) => entry.year > 0);
    });

    const yearOptions = computed(() => [...new Set(yearlyPerformance.value.map((entry) => entry.year))].sort((left, right) => right - left));

    const selectedYearEntry = computed(() => {
        const availableYears = yearlyPerformance.value;

        if (!availableYears.length) {
            return null;
        }

        const fallbackYear = yearOptions.value[0] || new Date().getFullYear();
        const targetYear = Number(selectedYear.value) || fallbackYear;

        return availableYears.find((entry) => entry.year === targetYear) || availableYears[0];
    });

    const selectedYearLabel = computed(() => selectedYearEntry.value?.year || selectedYear.value || yearOptions.value[0] || new Date().getFullYear());

    const selectedYearSummary = computed(() => {
        const summary = selectedYearEntry.value?.summary || dashboardData.value.summary || {};
        const properties = dashboardData.value.properties || [];

        return {
            ...summary,
            totalProperties: properties.length,
        };
    });

    const selectedYearSegments = computed(() => {
        const selectedYearPerformance = selectedYearEntry.value?.segmentPerformance;

        if (Array.isArray(selectedYearPerformance) && selectedYearPerformance.length > 0) {
            const total = selectedYearPerformance.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;

            return selectedYearPerformance.map((item, index) => ({
                id: item.name,
                name: item.name,
                type: item.name,
                revenue: Number(item.value) || 0,
                share: Math.round(((Number(item.value) || 0) / total) * 100),
                color: palette[index % palette.length],
            }));
        }

        return [];
    });

    const selectedYearSeries = computed(() => {
        if (selectedYearEntry.value) {
            return selectedYearEntry.value.monthlyPerformance;
        }

        const source = analyticsData.value.monthlyPerformance;

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item) => ({
                label: item.label,
                revenue: Number(item.revenue) || 0,
                expenses: Number(item.expenses) || 0,
                profit: Number(item.profit) || (Number(item.revenue) || 0) - (Number(item.expenses) || 0),
            }));
        }

        return deriveMonthlyPerformance();
    });

    const deriveMonthlyPerformance = () => {
        const summary = dashboardData.value.summary || {};
        const properties = dashboardData.value.properties || [];
        const reservations = dashboardData.value.recentReservations || [];
        const totalRevenue = Number(summary.totalRevenue) || properties.reduce((sum, property) => sum + (Number(property.revenue) || 0), 0);
        const baseRevenue = Math.max(totalRevenue, 6000) / 6;
        const reservationMix = Math.max(reservations.reduce((sum, reservation) => sum + (Number(reservation.amount) || 0), 0), 1);
        const factors = [0.84, 0.91, 0.89, 0.86, 1.02, 1.08];

        return months.slice(0, 6).map((label, index) => {
            const revenue = Math.round(baseRevenue * factors[index] + (reservationMix / 100));
            const expenses = Math.round(revenue * (0.52 + (index * 0.015)));

            return {
                label,
                revenue,
                expenses,
                profit: revenue - expenses,
            };
        });
    };

    const monthlySeries = computed(() => {
        return selectedYearSeries.value;
    });

    const visibleMonthlySeries = computed(() => monthlySeries.value.slice(0, monthWindow.value));

    const revenuePoints = computed(() => buildChartPoints(visibleMonthlySeries.value.map((item) => item.revenue)));
    const revenueLinePath = computed(() => buildLinePath(revenuePoints.value));
    const revenueAreaPath = computed(() => buildAreaPath(revenuePoints.value));

    const profitPoints = computed(() => buildChartPoints(visibleMonthlySeries.value.map((item) => item.profit)));
    const profitLinePath = computed(() => buildLinePath(profitPoints.value));
    const profitAreaPath = computed(() => buildAreaPath(profitPoints.value));

    const deriveWeeklyTraffic = () => {
        const reservations = dashboardData.value.recentReservations || [];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const buckets = weekdays.map((day) => ({ day, sessions: 0, conversions: 0 }));

        reservations.forEach((reservation) => {
            const dayIndex = new Date(reservation.checkIn).getDay();
            const bucket = buckets[dayIndex];

            bucket.sessions += 12;
            bucket.conversions += ['paid', 'confirmed'].includes(String(reservation.status).toLowerCase()) ? 8 : 4;
            bucket.sessions += Math.min(Math.round((Number(reservation.amount) || 0) / 60), 18);
            bucket.conversions += Math.min(Math.round((Number(reservation.amount) || 0) / 140), 10);
        });

        return buckets.filter((item) => item.day !== 'Sun' || item.sessions > 0 || item.conversions > 0)
            .slice(1)
            .map((item, index) => ({
                day: weekdays[index + 1],
                sessions: Math.max(item.sessions, 18 + index * 6),
                conversions: Math.max(item.conversions, 8 + index * 4),
            }));
    };

    const weeklySessions = computed(() => {
        const source = analyticsData.value.weeklyTraffic;

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item) => ({
                day: item.day,
                sessions: Number(item.sessions) || 0,
                conversions: Number(item.conversions) || 0,
            }));
        }

        return deriveWeeklyTraffic();
    });

    const weeklySessionsPoints = computed(() => ({
        sessions: buildChartPoints(weeklySessions.value.map((item) => item.sessions), 640, 240, 28),
        conversions: buildChartPoints(weeklySessions.value.map((item) => item.conversions), 640, 240, 28),
    }));

    const weeklyConversionRates = computed(() =>
        weeklySessions.value.map((item) => ({
            day: item.day,
            rate: Math.round((item.conversions / Math.max(item.sessions, 1)) * 100),
        })),
    );

    const propertyBreakdown = computed(() => selectedYearSegments.value.length > 0
        ? selectedYearSegments.value
        : (() => {
            const source = analyticsData.value.segmentPerformance;

            if (Array.isArray(source) && source.length > 0) {
                const total = source.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;

                return source.map((item, index) => ({
                    id: item.name,
                    name: item.name,
                    type: item.name,
                    revenue: Number(item.value) || 0,
                    share: Math.round(((Number(item.value) || 0) / total) * 100),
                    color: palette[index % palette.length],
                }));
            }

            const properties = dashboardData.value.properties || [];
            const totalRevenue = properties.reduce((sum, property) => sum + (Number(property.revenue) || 0), 0) || 1;

            return properties
                .slice(0, 4)
                .map((property, index) => ({
                    id: property.id,
                    name: property.type,
                    type: property.location,
                    revenue: Number(property.revenue) || 0,
                    share: Math.round(((Number(property.revenue) || 0) / totalRevenue) * 100),
                    color: palette[index % palette.length],
                }))
                .sort((left, right) => right.revenue - left.revenue);
        })());

    const segmentBreakdown = computed(() => propertyBreakdown.value.slice(0, 4));

    const propertyLookup = computed(() => {
        const properties = dashboardData.value.properties || [];

        return properties.reduce((lookup, property) => {
            lookup[property.id] = property;
            return lookup;
        }, {});
    });

    const roomLookup = computed(() => {
        const rooms = dashboardData.value.rooms || [];

        return rooms.reduce((lookup, room) => {
            lookup[room.id] = room;
            return lookup;
        }, {});
    });

    const reservationRows = computed(() => (dashboardData.value.recentReservations || []).slice(0, 5));

    const activeReservations = computed(() =>
        reservationRows.value.map((reservation) => {
            const room = reservation.roomId ? roomLookup.value[reservation.roomId] : null;
            const property = reservation.propertyId ? propertyLookup.value[reservation.propertyId] : null;

            return {
                ...reservation,
                propertyName: property?.name || reservation.propertyName || 'Unknown Property',
                roomName: room?.type || reservation.roomName || 'No Room Assigned',
                roomType: room?.type || reservation.roomType || '',
                propertyId: property?.id || reservation.propertyId || '',
                roomId: room?.id || reservation.roomId || '',
                statusTone: reservation.status === 'cancelled' ? 'danger' : reservation.status === 'paid' ? 'success' : 'warning',
            };
        }),
    );

    const activityFeed = computed(() => {
        const feed = [];
        const reservations = dashboardData.value.recentReservations || [];
        const properties = dashboardData.value.properties || [];

        if (dashboardData.value.paymentStatus && !dashboardData.value.paymentStatus.isComplete) {
            feed.push({
                icon: ExclamationTriangleIcon,
                bg: 'var(--color-warning-soft)',
                title: 'Payment account setup is incomplete',
                time: 'Needs attention',
                amount: 'Pending',
                tone: 'warning',
            });
        }

        reservations.slice(0, 3).forEach((reservation) => {
            feed.push({
                icon: DocumentTextIcon,
                bg: 'var(--color-primary-soft)',
                title: `${reservation.guestName} booked ${reservation.propertyName}`,
                time: formatDate(reservation.checkIn),
                amount: formatMoney(reservation.amount || 0),
                tone: 'info',
            });
        });

        properties.slice(0, 2).forEach((property) => {
            feed.push({
                icon: property.status === 'Approved' ? CheckCircleIcon : ClockIcon,
                bg: property.status === 'Approved' ? 'var(--color-success-soft)' : 'var(--color-warning-soft)',
                title: `${property.name} is ${property.status.toLowerCase()}`,
                time: property.location,
                amount: formatMoney(property.revenue || 0),
                tone: property.status === 'Approved' ? 'success' : 'warning',
            });
        });

        return feed;
    });

    const summaryCards = computed(() => {
        const summary = selectedYearSummary.value || {};

        return [
            {
                label: 'Total Properties',
                value: integerFormatter.format(summary.totalProperties || 0),
                delta: summary.trends?.properties || '',
                tone: 'blue',
                icon: HomeIcon,
            },
            {
                label: 'Total Bookings',
                value: integerFormatter.format(summary.totalBookings || 0),
                delta: summary.trends?.bookings || '',
                tone: 'teal',
                icon: CalendarDaysIcon,
            },
            {
                label: 'Total Revenue',
                value: formatMoney(summary.totalRevenue || 0),
                delta: summary.trends?.revenue || '',
                tone: 'amber',
                icon: CurrencyDollarIcon,
            },
            {
                label: 'Avg Rating',
                value: `${Number(summary.avgRating || 0).toFixed(1)}★`,
                delta: summary.trends?.rating || '',
                tone: 'coral',
                icon: StarIcon,
            },
        ];
    });

    const propertyStatusClass = (status) => {
        const normalized = String(status || '').toLowerCase();

        if (normalized === 'approved') return 'badge badge-teal';
        if (normalized === 'pending') return 'badge badge-amber';
        return 'badge badge-coral';
    };

    const barHeightStyle = (value, maxValue) => ({
        height: `${Math.max((Number(value) / Math.max(maxValue, 1)) * 100, 8)}%`,
    });

    const barOffsetStyle = (value, maxValue) => ({
        top: `${100 - Math.max((Number(value) / Math.max(maxValue, 1)) * 100, 8)}%`,
    });

    const maxRevenueValue = computed(() => Math.max(...visibleMonthlySeries.value.map((item) => item.revenue), 1));
    const maxExpenseValue = computed(() => Math.max(...visibleMonthlySeries.value.map((item) => item.expenses), 1));
    const maxWeeklySessions = computed(() => Math.max(...weeklySessions.value.map((item) => item.sessions), 1));
    const maxWeeklyConversions = computed(() => Math.max(...weeklySessions.value.map((item) => item.conversions), 1));

    const fetchDashboardData = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            dashboardData.value = data;

            const availableYears = Array.isArray(data.analytics?.yearlyPerformance)
                ? data.analytics.yearlyPerformance.map((entry) => Number(entry.year)).filter((year) => Number.isFinite(year))
                : [];

            if (availableYears.length > 0) {
                selectedYear.value = availableYears.includes(Number(selectedYear.value))
                    ? Number(selectedYear.value)
                    : Math.max(...availableYears);
            }
        } catch (requestError) {
            error.value = 'Failed to load dashboard data. Ensure data.json is present.';
            console.error('Dashboard Fetch Error:', requestError);
        } finally {
            loading.value = false;
        }
    };

    void fetchDashboardData();

    return {
        loading,
        error,
        activeTab,
        monthWindow,
        dashboardData,
        selectedYear,
        yearOptions,
        selectedYearLabel,
        tabs,
        analyticsData,
        summaryCards,
        selectedYearSummary,
        monthlySeries,
        visibleMonthlySeries,
        revenuePoints,
        revenueLinePath,
        revenueAreaPath,
        profitPoints,
        profitLinePath,
        profitAreaPath,
        weeklySessions,
        weeklySessionsPoints,
        weeklyConversionRates,
        propertyBreakdown,
        propertyLookup,
        segmentBreakdown,
        roomLookup,
        reservationRows,
        activityFeed,
        activeReservations,
        propertyStatusClass,
        barHeightStyle,
        barOffsetStyle,
        maxRevenueValue,
        maxExpenseValue,
        maxWeeklySessions,
        maxWeeklyConversions,
        fetchDashboardData,
        formatMoney,
        formatDate,
    };
});
