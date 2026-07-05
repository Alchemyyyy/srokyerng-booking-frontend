// modules/analytics/services/analytics.service.js
export const adminAnalyticsService = {
    /**
     * បំប្លែងទិន្នន័យពី API ឱ្យត្រូវតាម JSON ជាក់ស្តែងរបស់ Backend (តាម Postman)
     */
    processDashboardData({ summary, users, properties, reservations, payments, reviews, activity, pendingProperties }) {

        // ចាប់យក Object ផ្ទាល់ពីផ្លូវដើរក្នុង Postman
        const platformSummary = summary?.platform_summary || {};
        const usersStatus = users?.users_by_role_and_status || {};
        const propStatus = properties?.properties_by_status || {};
        const resStatus = reservations?.reservations_by_status || {};
        const payStatus = payments?.payments_by_status || {};
        const reviewSum = reviews?.review_summary || {};

        // ១. រៀបចំទិន្នន័យចាក់ចូល MetricsGrid
        const stats = {
            properties: properties?.total_properties || platformSummary?.total_properties || 0,
            pendingProperties: propStatus.pending || 0,
            bookings: reservations?.total_reservations || platformSummary?.total_reservations || 0,
            users: users?.total_users || (Number(platformSummary?.total_customers || 0) + Number(platformSummary?.total_owners || 0)) || 0,
            owners: Number(usersStatus.owner?.active || 0) || Number(platformSummary?.total_owners || 0),
            customers: Number(usersStatus.customer?.active || 0) || Number(platformSummary?.total_customers || 0),
            paymentsTotal: payments?.payments_by_status?.paid?.count ?? payments?.total_payments ?? 0,
            revenue: payments?.total_revenue || platformSummary?.total_revenue || 0,
            reviewsCount: reviewSum.total_reviews || platformSummary?.total_reviews || 0,
            reviewsAverage: Number(reviewSum.average_rating || 0)
        };

        // ២. រៀបចំទិន្នន័យសម្រាប់ Doughnut Chart (Approval Breakdown)
        const approvalBreakdown = [
            { label: 'All Requests', count: stats.properties, bgClass: 'bg-blue-500' },
            { label: 'Approved', count: propStatus.approved || 0, bgClass: 'bg-emerald-500' },
            { label: 'Pending', count: propStatus.pending || 0, bgClass: 'bg-amber-500' },
            { label: 'Rejected', count: propStatus.rejected || 0, bgClass: 'bg-rose-500' }
        ];

        // ៣. រៀបចំទិន្នន័យ Recent Activity Feed (បោះឈ្មោះ String ចេញទៅសិន)
        const systemActivities = (activity?.recent_activity || []).map(act => {
            let icon = 'BuildingOfficeIcon';
            let iconBg = 'bg-blue-500/10 text-blue-400';

            if (act.activity_type?.includes('user') || act.activity_type?.includes('host') || act.activity_type?.includes('register')) {
                icon = 'UserPlusIcon';
                iconBg = 'bg-emerald-500/10 text-emerald-400';
            } else if (act.activity_type?.includes('reservation') || act.activity_type?.includes('booking') || act.activity_type?.includes('created') || act.activity_type?.includes('cancel')) {
                icon = 'CalendarDaysIcon';
                iconBg = 'bg-purple-500/10 text-purple-400';
            } else if (act.activity_type?.includes('review')) {
                icon = 'ChatBubbleLeftRightIcon';
                iconBg = 'bg-amber-500/10 text-amber-400';
            }

            return {
                id: `${act.resource_type}-${act.resource_id}-${act.created_at}`,
                title: act.activity_type.replace('_', ' ').toUpperCase(), // កែសម្រួលចំណងជើងឱ្យស្អាត
                description: act.resource_name,
                time: adminAnalyticsService.formatRelativeTime(act.created_at),
                iconName: icon, // រក្សាទុកឈ្មោះអក្សរដើម្បីយកទៅ Map ក្នុង Store
                iconBg
            };
        });

        // ៤. Pipeline Table — real pending properties awaiting approval
        const propertiesPipeline = (pendingProperties || []).map((p) => ({
            name: p.property_name,
            location: p.city?.city_name || p.address || '',
            rooms: p.room_count || 0,
            valuation: Number(p.price_per_night || 0),
            status: 'Pending',
            statusClass: 'bg-amber-500/10 text-amber-600',
        }));

        // ៥. Timeline សម្រាប់ Growth Line Chart
        const overviewTimeline = adminAnalyticsService.generateGrowthTimeline(stats.properties, stats.users);

        return {
            stats,
            approvalBreakdown,
            propertiesPipeline,
            systemActivities,
            overviewTimeline
        };
    },

    formatRelativeTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    generateGrowthTimeline(currentProps, currentUsers) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        let labels = [], propGrowth = [], userGrowth = [];

        for (let i = 11; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            labels.push(months[idx]);
            const factor = (12 - i) / 12;
            propGrowth.push(Math.max(1, Math.round(currentProps * factor)));
            userGrowth.push(Math.max(1, Math.round(currentUsers * factor)));
        }
        return { labels, properties: propGrowth, users: userGrowth };
    }
};