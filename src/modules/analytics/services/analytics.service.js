export const adminAnalyticsService = {
    /**
     * ទទួលយក Raw Arrays ទាំងអស់មកគណនាបំប្លែងទៅជា Analytics Format
     */
    processDashboardData({ propertiesList, roomsList, bookingsList, usersList }) {

        // ១. គណនារកចំណូលសរុប (Revenue) ពី Bookings ដែលជោគជ័យ
        const totalRevenue = bookingsList
            .filter(b => b.status?.toLowerCase() === 'completed' || b.status?.toLowerCase() === 'approved')
            .reduce((sum, b) => sum + Number(b.total_price || b.price || 0), 0);

        console.log('Stats Users:', usersList.length);
        console.log('Users Sample:', usersList);

        const pendingProperties = propertiesList.filter(
            p => Number(p.status_id) === 1
        ).length;

        const stats = {
            properties: propertiesList.length,
            pendingProperties,
            bookings: bookingsList.length,
            users: usersList.length,

            owners: usersList.filter(
                u => u.role?.toLowerCase() === 'owner'
            ).length || 1,

            customers: usersList.filter(
                u =>
                    u.role?.toLowerCase() === 'customer' ||
                    u.role?.toLowerCase() === 'user'
            ).length || 1,

            paymentsTotal: totalRevenue,
            revenue: totalRevenue * 0.9,
            reviewsCount: 854,
            reviewsAverage: 4.8
        };

        // ២. គណនាចំនួនការអនុម័ត (Approval Breakdown) សម្រាប់ Doughnut Chart
        const allRequests = propertiesList.length; // សរុប = 45
        const pendingCount = propertiesList.filter(p => Number(p.status_id) === 1).length;  // លទ្ធផល = 24
        const approvedCount = propertiesList.filter(p => Number(p.status_id) === 2).length; // លទ្ធផល = 20
        const rejectedCount = propertiesList.filter(p => Number(p.status_id) === 3).length; // លទ្ធផល = 1

        const approvalBreakdown = [
            {
                label: 'All Requests',
                count: allRequests,
                bgClass: 'bg-blue-500'
            },
            {
                label: 'Approved',
                count: approvedCount, // យកតម្លៃដាច់ខាត (ទោះបីជា 0 ក៏បង្ហាញ 0 មិនមាន Bug លោតទៅ All Requests ទៀតទេ)
                bgClass: 'bg-emerald-500'
            },
            {
                label: 'Pending',
                count: pendingCount,
                bgClass: 'bg-amber-500'
            },
            {
                label: 'Rejected',
                count: rejectedCount,
                bgClass: 'bg-rose-500'
            },
        ];

        // ៣. បំប្លែងទម្រង់ទិន្នន័យសម្រាប់តារាង (Pipeline Table)
        const propertiesPipeline = propertiesList.slice(-4).map(p => {
            let statusClass = 'status-pending';
            let statusLabel = 'Pending';

            // ឆែកតាម status_id ជាលេខ
            if (Number(p.status_id) === 2) {
                statusClass = 'status-approved';
                statusLabel = 'Approved';
            } else if (Number(p.status_id) === 3) {
                statusClass = 'status-rejected';
                statusLabel = 'Rejected';
            }

            return {
                id: p.id,
                name: p.property_name || p.name || 'Unnamed Property', // ប្រើ property_name ដូចក្នុង View របស់បង
                location: p.address || p.city || 'Unknown Location',
                rooms: p.rooms_count || p.rooms?.length || 0,
                valuation: p.price || '0',
                status: statusLabel,
                statusClass
            };
        });

        // ៤. រៀបចំប្រព័ន្ធ Recent Activities ផ្អែកលើទិន្នន័យចុងក្រោយគេ
        const systemActivities = [
            ...propertiesList.slice(-2).map(p => ({
                id: `prop-${p.id}`,
                title: 'newPropertyRequest',
                description: `${p.name} បានដាក់ពាក្យស្នើសុំចុះបញ្ជីថ្មី។`,
                time: 'Just now',
                icon: 'BuildingOfficeIcon',
                iconBg: 'bg-blue-500/10 text-blue-400'
            })),
            ...usersList.slice(-2).map(u => ({
                id: `user-${u.id}`,
                title: 'newHostRegistered',
                description: `${u.full_name || u.name || u.username} បានចុះឈ្មោះចូលប្រើប្រព័ន្ធ។`,
                time: '1h ago',
                icon: 'UserPlusIcon',
                iconBg: 'bg-emerald-500/10 text-emerald-400'
            }))
        ];

        // ៥. បង្កើត Timeline សម្រាប់ក្រាហ្វិកខ្សែ
        const overviewTimeline = this.generateGrowthTimeline(stats.properties, stats.users);

        return {
            stats,
            approvalBreakdown,
            propertiesPipeline,
            systemActivities,
            overviewTimeline
            // labels,
            // properties: propGrowth,
            // users: userGrowth
        };
    },

    /**
     * ជំនួយការបង្កើតទិន្នន័យថយក្រោយ ២៤ ខែ ឱ្យសមាមាត្រនឹងតួរលេខសរុបបច្ចុប្បន្ន
     */
    generateGrowthTimeline(currentProps, currentUsers) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();

        let labels = [];
        let propGrowth = [];
        let userGrowth = [];

        for (let i = 23; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 24) % 12;
            labels.push(months[idx]);

            const factor = (24 - i) / 24;
            propGrowth.push(Math.max(1, Math.round(currentProps * factor)));
            userGrowth.push(Math.max(1, Math.round(currentUsers * factor)));
        }

        return { labels, properties: propGrowth, users: userGrowth };
    }
};