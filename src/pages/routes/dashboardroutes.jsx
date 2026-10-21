/***
 *  I3EMS - AMT ERP
 *  Department Dashboard routes (all 13).  Mounted in mainroutes.jsx as:
 *      <Route path="/dashboards/*" element={<DashboardRoutes user={user} />} />
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
const ExecutiveDashboard = lazy(() => import("../dashboards/executive-dashboard"));
const FinanceDashboard = lazy(() => import("../dashboards/finance-dashboard"));
const BudgetDashboard = lazy(() => import("../dashboards/budget-dashboard"));
const HrDashboard = lazy(() => import("../dashboards/hr-dashboard"));
const PayrollDashboard = lazy(() => import("../dashboards/payroll-dashboard"));
const WorksDashboard = lazy(() => import("../dashboards/works-dashboard"));
const TenderDashboard = lazy(() => import("../dashboards/tender-dashboard"));
const EstateDashboard = lazy(() => import("../dashboards/estate-dashboard"));
const HealthDashboard = lazy(() => import("../dashboards/health-dashboard"));
const GrantDashboard = lazy(() => import("../dashboards/grant-dashboard"));
const AuditDashboard = lazy(() => import("../dashboards/audit-dashboard"));

const DashboardRoutes = ({ user }) => {
  return (
    <Routes>
      <Route path="executive" element={<ExecutiveDashboard user={user} />} />
      <Route path="finance" element={<FinanceDashboard user={user} />} />
      <Route path="budget" element={<BudgetDashboard user={user} />} />
      <Route path="hr" element={<HrDashboard user={user} />} />
      <Route path="payroll" element={<PayrollDashboard user={user} />} />
      <Route path="works" element={<WorksDashboard user={user} />} />
      <Route path="tender" element={<TenderDashboard user={user} />} />
      <Route path="estate" element={<EstateDashboard user={user} />} />
      <Route path="health" element={<HealthDashboard user={user} />} />
      <Route path="grant" element={<GrantDashboard user={user} />} />
      <Route path="audit" element={<AuditDashboard user={user} />} />
    </Routes>
  );
};

export default DashboardRoutes;
