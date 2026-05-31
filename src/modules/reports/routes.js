const reportListRoute = {
  path: "reports",
  name: "reports",
  component: () => import("@/modules/reports/pages/ReportsView.vue"),
};

const reportFormRoute = {
  path: "reports/new",
  name: "report-create",
  component: () => import("@/modules/reports/pages/ReportFormView.vue"),
};

const reportDetailRoute = {
  path: "reports/:reportId",
  name: "report-detail",
  component: () => import("@/modules/reports/pages/ReportDetailView.vue"),
};

export const customerReportRoutes = [reportListRoute, reportFormRoute, reportDetailRoute];

export const ownerReportRoutes = [reportListRoute, reportFormRoute, reportDetailRoute];

export const adminReportRoutes = [reportListRoute, reportDetailRoute];
