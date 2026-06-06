<template>
  <div class="admin-dashboard-container my-25 space-y-6" :class="isSidebarOpen ? 'ml-64' : 'ml-20'">
	        <header class="dashboard-hero">
            <div>
                <p class="dashboard-eyebrow">Admin command center</p>
                <h1>Platform monitoring dashboard</h1>
                <p class="dashboard-subtitle">
                    Track platform activity, review pending approvals, verify payments, and manage users from one place.
                </p>
            </div>

            <button type="button" class="refresh-button" :disabled="loading" @click="loadDashboard">
                {{ loading ? "Refreshing..." : "Refresh data" }}
            </button>
        </header>
    
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="metrics-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="metrics-label">Total Properties</p>
            <h3 class="metrics-value">{{ stats.properties }}</h3>
            <span class="metrics-trend text-emerald-500 font-medium">
              ↑ 12.5% <span class="trend-sub">vs last month</span>
            </span>
          </div>
          <div class="metrics-icon bg-indigo-500/10 text-[var(--color-primary)]">
            <BuildingOfficeIcon class="h-6 w-6" />
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="metrics-label">Total Rooms</p>
            <h3 class="metrics-value">{{ stats.rooms }}</h3>
            <span class="metrics-trend text-emerald-500 font-medium">
              ↑ 8.2% <span class="trend-sub">vs last week</span>
            </span>
          </div>
          <div class="metrics-icon bg-purple-500/10 text-purple-400">
            <HomeIcon class="h-6 w-6" />
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="metrics-label">Total Bookings</p>
            <h3 class="metrics-value">{{ stats.bookings }}</h3>
            <span class="metrics-trend text-emerald-500 font-medium">
              ↑ 5.7% <span class="trend-sub">active cycles</span>
            </span>
          </div>
          <div class="metrics-icon bg-blue-500/10 text-blue-400">
            <CalendarDaysIcon class="h-6 w-6" />
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="metrics-label">Active Users</p>
            <h3 class="metrics-value">{{ stats.users }}</h3>
            <span class="metrics-trend text-rose-500 font-medium">
              ↓ 2.1% <span class="trend-sub">bounce rate</span>
            </span>
          </div>
          <div class="metrics-icon bg-amber-500/10 text-amber-500">
            <UserGroupIcon class="h-6 w-6" />
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-3">
      <div class="dashboard-panel lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="panel-title">Platform Growth Overview</h3>
            <p class="panel-subtitle">Historical tracking of system properties, rooms, and registered users</p>
          </div>
          <div class="export-btn-container">
            <button class="export-btn">
              <ArrowDownTrayIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="dashboard-panel">
        <div class="mb-4">
          <h3 class="panel-title">Listing Approval Status</h3>
          <p class="panel-subtitle">Compliance metrics for host registration properties</p>
        </div>
        <div class="chart-wrapper-doughnut relative flex items-center justify-center">
          <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
        </div>
        
        <div class="mt-6 space-y-3">
          <div v-for="status in approvalBreakdown" :key="status.label" class="space-y-1">
            <div class="flex justify-between text-xs font-medium">
              <span class="flex items-center gap-2 text-[var(--color-muted)]">
                <span :class="['h-2 w-2 rounded-full', status.bgClass]"></span>
                {{ status.label }}
              </span>
              <span class="text-[var(--color-text)] font-bold">{{ status.count }} properties</span>
            </div>
            <div class="w-full bg-[var(--color-surface-soft)] h-1.5 rounded-full overflow-hidden">
              <div :class="['h-full rounded-full', status.bgClass]" :style="{ width: `${(status.count / stats.properties) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-5">
      <div class="dashboard-panel lg:col-span-2">
        <h3 class="panel-title mb-4">Recent System Activity</h3>
        <div class="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          <div v-for="act in systemActivities" :key="act.id" class="flex gap-3 items-start text-xs border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
            <div :class="['p-2 rounded-lg flex-shrink-0', act.iconBg]">
              <component :is="act.icon" class="h-4 w-4" />
            </div>
            <div class="space-y-0.5">
              <h4 class="font-bold text-[var(--color-text)]">{{ act.title }}</h4>
              <p class="text-[var(--color-muted)]">{{ act.description }}</p>
              <span class="text-[10px] text-[var(--color-muted)] font-mono block pt-1">{{ act.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel lg:col-span-3">
        <h3 class="panel-title mb-4">New Properties Pipeline & Performance</h3>
        
        <AppTable>
          <template #thead>
            <tr class="table-header-row">
              <th class="p-3">Property Structural Identity</th>
              <th class="p-3 text-center">Allocated Rooms</th>
              <th class="p-3">Base Valuation</th>
              <th class="p-3 text-right">Verification Status</th>
            </tr>
          </template>
          <template #tbody>
            <tr v-for="prop in propertiesPipeline" :key="prop.id" class="table-body-row">
              <td class="p-3 flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                  {{ prop.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-[var(--color-text)]">{{ prop.name }}</div>
                  <div class="text-[10px] text-[var(--color-muted)]">{{ prop.location }}</div>
                </div>
              </td>
              <td class="p-3 text-center font-semibold text-[var(--color-text)]">{{ prop.rooms }}</td>
              <td class="p-3 font-bold text-[var(--color-text)]">${{ prop.valuation }}</td>
              <td class="p-3 text-right">
                <span :class="['status-pill', prop.statusClass]">
                  {{ prop.status }}
                </span>
              </td>
            </tr>
          </template>
        </AppTable>
      </div>
    </section>
<section class="quick-links" aria-label="Quick admin workflows">
                <header>
                    <h2>Quick actions</h2>
                    <p>Open key admin workflows in one click.</p>
                </header>

                <div class="quick-links-grid">
                    <RouterLink v-for="link in quickLinks" :key="link.title" :to="link.to" class="quick-link-card">
                        <div>
                            <h3>{{ link.title }}</h3>
                            <p>{{ link.description }}</p>
                        </div>
                        <span class="quick-link-count">{{ formatNumber(link.count) }}</span>
                    </RouterLink>
                </div>
            </section>
  </div>
</template>

<script setup>
import { useSidebar } from '@/shared/composables/useSidebar';
import { ref } from 'vue'
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement, Filler 
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { 
  BuildingOfficeIcon, HomeIcon, CalendarDaysIcon, UserGroupIcon,
  ArrowDownTrayIcon, ShoppingBagIcon, UserPlusIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import AppTable from '@/shared/components/AppTable.vue' // Imports generic standard application data-table container

// Register core component assets inside Chart.js bundle
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)


const { isSidebarOpen } = useSidebar();

// 📊 GLOBAL ANALYTICAL COUNTER NODES
const stats = ref({
  properties: 12,
  rooms: 166,
  bookings: 1487,
  users: 3435
})

// 📈 SYSTEM PIPELINE: PROPERTIES RECENT METRICS
const propertiesPipeline = ref([
  { id: 1, name: 'Sokha Phnom Penh Hotel', location: 'Chroy Changvar, PP', rooms: 45, valuation: '12,250', status: 'Approved', statusClass: 'status-approved' },
  { id: 2, name: 'Kampot Garden Villa', location: 'Teouk Chhou, Kampot', rooms: 12, valuation: '9,450', status: 'Pending', statusClass: 'status-pending' },
  { id: 3, name: 'Siem Reap Heritage Resort', location: 'Slok Kram, SR', rooms: 28, valuation: '4,680', status: 'Rejected', statusClass: 'status-rejected' },
  { id: 4, name: 'Mekong Riverside Suites', location: 'Chaktomuk, PP', rooms: 16, valuation: '19,600', status: 'Approved', statusClass: 'status-approved' }
])

// 🔔 REALTIME SYSTEM ACTIVITIES TREE (Image 1 Style Left Sidebar Feed)
const systemActivities = ref([
  { id: 1, title: 'New property request submitted', description: 'Kampot Garden Villa applied for a commercial listing license tier.', time: '2 minutes ago', icon: BuildingOfficeIcon, iconBg: 'bg-blue-500/10 text-blue-400' },
  { id: 2, title: 'New host operator registered', description: 'Jane Smith completed identity authorization protocols.', time: '16 minutes ago', icon: UserPlusIcon, iconBg: 'bg-emerald-500/10 text-emerald-400' },
  { id: 3, title: 'Critical baseline validation alert', description: 'Property listing Node #789 missed spatial asset checklist values.', time: '1 hour ago', icon: ExclamationTriangleIcon, iconBg: 'bg-rose-500/10 text-rose-400' },
  { id: 4, title: 'User dispute resolution submitted', description: 'Feedback review item processed on booking transaction #204.', time: '4 hours ago', icon: ChatBubbleLeftRightIcon, iconBg: 'bg-amber-500/10 text-amber-400' }
])

// 📊 COMPLIANCE PROPERTY MATRIX LIST
const approvalBreakdown = ref([
  { label: 'Approved & Fully Verified', count: 9, bgClass: 'bg-emerald-500' },
  { label: 'Awaiting Audit Actions', count: 2, bgClass: 'bg-amber-500' },
  { label: 'Suspended / Draft Mode', count: 1, bgClass: 'bg-rose-500' }
])

// --- 📈 LINE CHART GRAPH ARCHITECTURE ENGINE (Count Breakdown) ---
const lineChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Properties Active',
      borderColor: '#1268b4', // Matches --color-primary
      backgroundColor: 'rgba(18, 104, 180, 0.06)',
      pointBackgroundColor: '#1268b4',
      borderWidth: 3,
      tension: 0.38,
      fill: true,
      data: [4, 5, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12]
    },
    {
      label: 'Rooms Tracked (x10)',
      borderColor: '#22c55e', // Matches --color-success
      backgroundColor: 'rgba(34, 197, 94, 0.04)',
      pointBackgroundColor: '#22c55e',
      borderWidth: 2,
      tension: 0.38,
      fill: true,
      data: [2, 3, 3, 5, 6, 8, 10, 9, 11, 13, 15, 16.6]
    }
  ]
})

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: 'rgba(169, 189, 209, 0.9)', font: { family: 'Poppins' } } } },
  scales: {
    y: { grid: { color: 'rgba(200, 217, 228, 0.15)' }, ticks: { color: '#4b628f' } },
    x: { grid: { display: false }, ticks: { color: '#4b628f' } }
  }
})

// --- 🍩 DOUGHNUT STATUS SYSTEM CHART ENGINE (Image 2 Mirror Style) ---
const doughnutChartData = ref({
  labels: ['Approved', 'Pending', 'Draft/Rejected'],
  datasets: [
    {
      data: [9, 2, 1],
      backgroundColor: ['#22c55e', '#dab773', '#fb7185'],
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
})

const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: { legend: { display: false } }
})
</script>

<style scoped>
/* 📁 ENTIRE DASHBOARD CONTAINER LAYOUT MECHANICS */
.admin-dashboard-container {
  font-family: var(--font-main);
  background-color: var(--color-page);
  color: var(--color-text);
}

/* 📊 UPPER METRICS SCORE CARDS HOVER AND STRUCTURE MECHANICS */
.metrics-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.metrics-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}
.metrics-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.metrics-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  margin-top: var(--space-xs);
}
.metrics-trend {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}
.trend-sub {
  color: var(--color-muted);
  font-weight: 400;
}
.metrics-icon {
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
}

/* 🏢 MAIN PANEL CONFIGURATIONS */
.dashboard-panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: var(--space-lg);
  box-shadow: var(--shadow-panel);
}
.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}
.panel-subtitle {
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 2px;
}
.chart-wrapper {
  height: 280px;
  position: relative;
}
.chart-wrapper-doughnut {
  height: 180px;
}

/* 🎛️ EXPORT COMPONENT BUTTON OVERLAYS (Image 1 Elements) */
.export-btn {
  padding: var(--space-sm);
  background-color: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  transition: all 0.15s ease;
}
.export-btn:hover {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}

/* 📋 CLEAN DATA INTERACTIVE TABLES ELEMENTS SETUP */
.table-header-row {
  background-color: var(--color-surface-soft);
  color: var(--color-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.table-body-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s ease;
}
.table-body-row:hover {
  background-color: var(--color-overlay);
}
.table-body-row:last-child {
  border-bottom: 0;
}

/* 🏷️ CONTEXT VALUE ACCENT PILLS MANAGEMENT */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}
</style>